try:
    from starknet_py.net.full_node_client import FullNodeClient
    from starknet_py.net.account.account import Account
    from starknet_py.net.signer.stark_curve_signer import KeyPair
    from starknet_py.contract import Contract
    from starknet_py.net.models import StarknetChainId
    STARKNET_AVAILABLE = True
except Exception as e:
    print(f"Warning: Starknet dependencies not available: {e}")
    print("Starknet features will be disabled. Portfolio data will be mocked.")
    STARKNET_AVAILABLE = False
    FullNodeClient = None
    Account = None
    KeyPair = None
    Contract = None
    StarknetChainId = None

from app.config import settings
import json


class StarknetService:
    """Service for interacting with Starknet blockchain."""
    
    def __init__(self):
        if not STARKNET_AVAILABLE:
            self.client = None
            self.chain_id = None
            return
            
        self.client = FullNodeClient(node_url=settings.STARKNET_RPC_URL)
        self.chain_id = StarknetChainId.TESTNET if settings.STARKNET_NETWORK == "goerli" else StarknetChainId.MAINNET
    
    async def get_account(self, private_key: str, address: str) -> Account:
        """Create an Account instance from private key."""
        if not STARKNET_AVAILABLE:
            raise RuntimeError("Starknet dependencies not available")
            
        key_pair = KeyPair.from_private_key(int(private_key, 16))
        account = Account(
            client=self.client,
            address=address,
            key_pair=key_pair,
            chain=self.chain_id
        )
        return account
    
    async def execute_rebalance(
        self,
        session_key_private: str,
        account_address: str,
        new_range: tuple,
        proof_hash: str,
        reasoning_log: str
    ) -> dict:
        """
        Execute a rebalancing transaction on the Starknet vault contract.
        
        Args:
            session_key_private: Session key private key (hex string)
            account_address: User's account address
            new_range: Tuple of (lower_bound, upper_bound)
            proof_hash: Hash of the ZK proof
            reasoning_log: AI reasoning for the trade
            
        Returns:
            Dictionary with transaction hash and status
        """
        if not STARKNET_AVAILABLE:
            # Mock response for development
            print(f"[MOCK] Rebalancing for {account_address} with range {new_range}")
            return {
                "tx_hash": "0x1234567890abcdef",
                "status": "confirmed"
            }
            
        try:
            account = await self.get_account(session_key_private, account_address)
            
            # Load vault contract ABI (simplified example)
            # In production, load from file
            vault_abi = [
                {
                    "name": "rebalance",
                    "type": "function",
                    "inputs": [
                        {"name": "lower_bound", "type": "felt"},
                        {"name": "upper_bound", "type": "felt"},
                        {"name": "proof_hash", "type": "felt"},
                        {"name": "reasoning_hash", "type": "felt"}
                    ],
                    "outputs": []
                }
            ]
            
            # Create contract instance
            contract = Contract(
                address=settings.STARKNET_VAULT_CONTRACT,
                abi=vault_abi,
                provider=account
            )
            
            # Prepare calldata
            lower_bound, upper_bound = new_range
            reasoning_hash = self._hash_string(reasoning_log)
            
            # Execute transaction
            invocation = await contract.functions["rebalance"].invoke(
                lower_bound=int(lower_bound),
                upper_bound=int(upper_bound),
                proof_hash=int(proof_hash, 16),
                reasoning_hash=reasoning_hash,
                max_fee=int(1e16)  # 0.01 ETH max fee
            )
            
            # Wait for transaction
            await invocation.wait_for_acceptance()
            
            return {
                "tx_hash": hex(invocation.hash),
                "status": "confirmed"
            }
            
        except Exception as e:
            print(f"Starknet execution error: {e}")
            return {
                "tx_hash": None,
                "status": "failed",
                "error": str(e)
            }
    
    async def get_portfolio_data(self, address: str) -> dict:
        """Fetch portfolio data from Starknet."""
        # Simplified - in production, query actual contracts
        return {
            "total_value": 50000,
            "current_pool": "ETH/USDC",
            "risk_score": 5,
            "positions": [
                {
                    "pool": "ETH/USDC",
                    "value": 50000,
                    "range": "1800-2200",
                    "apy": "12.5",
                    "status": "active"
                }
            ]
        }
    
    def _hash_string(self, text: str) -> int:
        """Convert string to felt (field element) hash."""
        from hashlib import sha256
        hash_bytes = sha256(text.encode()).digest()
        return int.from_bytes(hash_bytes[:31], 'big')  # Limit to felt size


starknet_service = StarknetService()

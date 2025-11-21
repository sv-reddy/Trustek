"""
Service layer for interacting with deployed vault contracts
Uses HTTP RPC calls as workaround for starknet-py DLL issues on Windows
"""
import httpx
from typing import Dict, List, Optional
from app.config import settings
from hashlib import sha256
import asyncio


class ContractService:
    """Base class for contract interactions"""
    
    def __init__(self, contract_address: str):
        self.contract_address = contract_address
        self.rpc_url = settings.STARKNET_RPC_URL
        
    def get_selector(self, function_name: str) -> str:
        """Calculate Starknet function selector"""
        return hex(int.from_bytes(sha256(function_name.encode()).digest(), 'big') % (2**251))
    
    async def call_view(self, function_name: str, calldata: List[str] = None) -> Dict:
        """Call a view function on the contract"""
        if calldata is None:
            calldata = []
            
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.rpc_url,
                json={
                    "jsonrpc": "2.0",
                    "method": "starknet_call",
                    "params": {
                        "request": {
                            "contract_address": self.contract_address,
                            "entry_point_selector": self.get_selector(function_name),
                            "calldata": calldata
                        },
                        "block_id": "latest"
                    },
                    "id": 1
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                if "result" in result:
                    return {"success": True, "data": result["result"]}
                else:
                    return {"success": False, "error": result.get("error", "Unknown error")}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
    
    async def invoke_function(
        self,
        function_name: str,
        calldata: List[str],
        account_address: str,
        private_key: str
    ) -> Dict:
        """Invoke a state-changing function (requires signing)"""
        # TODO: Implement proper transaction signing with account abstraction
        # Requires starknet-py Account class or custom signing logic
        raise NotImplementedError(
            "Transaction signing not implemented. "
            "Deploy contracts first, then implement signing with starknet-py Account or custom signer."
        )


class VaultService(ContractService):
    """Service for VaultManager contract"""
    
    def __init__(self):
        super().__init__(settings.STARKNET_VAULT_CONTRACT)
    
    async def get_balance(self, user_address: str) -> Optional[int]:
        """Get user's vault balance"""
        result = await self.call_view("get_balance", [user_address])
        
        if result["success"] and result["data"]:
            return int(result["data"][0], 16)
        return None
    
    async def deposit(self, amount: int, account_address: str, private_key: str) -> Dict:
        """Deposit funds into vault"""
        return await self.invoke_function(
            "deposit",
            [hex(amount)],
            account_address,
            private_key
        )
    
    async def withdraw(self, amount: int, account_address: str, private_key: str) -> Dict:
        """Withdraw funds from vault"""
        return await self.invoke_function(
            "withdraw",
            [hex(amount)],
            account_address,
            private_key
        )


class SessionKeyService(ContractService):
    """Service for SessionKeyManager contract"""
    
    def __init__(self):
        contract_address = getattr(settings, 'STARKNET_SESSION_KEY_CONTRACT', '0x0')
        super().__init__(contract_address)
    
    async def is_valid(self, session_key: str) -> bool:
        """Check if session key is valid"""
        result = await self.call_view("is_valid", [session_key])
        
        if result["success"] and result["data"]:
            return int(result["data"][0], 16) == 1
        return False
    
    async def get_permissions(self, session_key: str) -> Optional[int]:
        """Get session key permissions"""
        result = await self.call_view("get_permissions", [session_key])
        
        if result["success"] and result["data"]:
            return int(result["data"][0], 16)
        return None
    
    async def create_session_key(
        self,
        expiry_days: int,
        account_address: str,
        private_key: str
    ) -> Dict:
        """Create a new session key"""
        return await self.invoke_function(
            "create_session_key",
            [hex(expiry_days)],
            account_address,
            private_key
        )


class PositionService(ContractService):
    """Service for PositionManager contract"""
    
    def __init__(self):
        contract_address = getattr(settings, 'STARKNET_POSITION_CONTRACT', '0x0')
        super().__init__(contract_address)
    
    async def get_position(self, position_id: str) -> Optional[Dict]:
        """Get position details"""
        result = await self.call_view("get_position", [position_id])
        
        if result["success"] and result["data"]:
            # Parse position data
            data = result["data"]
            return {
                "user": data[0] if len(data) > 0 else None,
                "pool_id": data[1] if len(data) > 1 else None,
                "amount": int(data[2], 16) if len(data) > 2 else 0,
                "min_price": int(data[3], 16) if len(data) > 3 else 0,
                "max_price": int(data[4], 16) if len(data) > 4 else 0,
            }
        return None
    
    async def open_position(
        self,
        pool_id: str,
        amount: int,
        min_price: int,
        max_price: int,
        account_address: str,
        private_key: str
    ) -> Dict:
        """Open a new position"""
        return await self.invoke_function(
            "open_position",
            [pool_id, hex(amount), hex(min_price), hex(max_price)],
            account_address,
            private_key
        )


class RebalanceService(ContractService):
    """Service for RebalanceExecutor contract"""
    
    def __init__(self):
        contract_address = getattr(settings, 'STARKNET_REBALANCE_CONTRACT', '0x0')
        super().__init__(contract_address)
    
    async def execute_rebalance(
        self,
        position_id: str,
        new_min: int,
        new_max: int,
        proof_hash: str,
        account_address: str,
        private_key: str
    ) -> Dict:
        """Execute a rebalance"""
        return await self.invoke_function(
            "execute_rebalance",
            [position_id, hex(new_min), hex(new_max), proof_hash],
            account_address,
            private_key
        )
    
    async def get_rebalance_history(self, position_id: str) -> List[Dict]:
        """Get rebalance history for a position"""
        result = await self.call_view("get_rebalance_history", [position_id])
        
        if result["success"]:
            # Parse history data
            return []
        return []


# Singleton instances
vault_service = VaultService()
session_key_service = SessionKeyService()
position_service = PositionService()
rebalance_service = RebalanceService()

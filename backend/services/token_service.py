"""
Token Service - Manages fake crypto tokens for development
"""
import json
from pathlib import Path
from typing import Dict, List, Optional
from decimal import Decimal

class TokenService:
    def __init__(self, tokens_file: str = "deployed_tokens/tokens.json"):
        self.tokens_file = Path(tokens_file)
        self.tokens_data = self._load_tokens()
    
    def _load_tokens(self) -> Dict:
        """Load token data from JSON file"""
        if not self.tokens_file.exists():
            return self._create_default_tokens()
        
        try:
            with open(self.tokens_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading tokens: {e}")
            return self._create_default_tokens()
    
    def _create_default_tokens(self) -> Dict:
        """Create default token data if file doesn't exist"""
        default_tokens = {
            "network": "katana",
            "rpc_url": "http://localhost:5050",
            "deployer": "0x6162896d1d7ab204c7ccac6dd5f8e9e7c25ecd5ae4fcb4ad32e57786bb46e03",
            "tokens": {
                "Bitcoin": {
                    "symbol": "BTC",
                    "address": "0x0100000000000000000000000000000000000000000000000000000000000001",
                    "decimals": 8,
                    "total_supply": "21000000",
                    "balance": "10.5"
                },
                "Ethereum": {
                    "symbol": "ETH",
                    "address": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                    "decimals": 18,
                    "total_supply": "120000000",
                    "balance": "45.8"
                },
                "Tether": {
                    "symbol": "USDT",
                    "address": "0x0100000000000000000000000000000000000000000000000000000000000003",
                    "decimals": 6,
                    "total_supply": "100000000000",
                    "balance": "15000"
                },
                "USD Coin": {
                    "symbol": "USDC",
                    "address": "0x0100000000000000000000000000000000000000000000000000000000000004",
                    "decimals": 6,
                    "total_supply": "50000000000",
                    "balance": "8500"
                },
                "Cardano": {
                    "symbol": "ADA",
                    "address": "0x0100000000000000000000000000000000000000000000000000000000000005",
                    "decimals": 6,
                    "total_supply": "45000000000",
                    "balance": "2500"
                },
                "Solana": {
                    "symbol": "SOL",
                    "address": "0x0100000000000000000000000000000000000000000000000000000000000006",
                    "decimals": 9,
                    "total_supply": "500000000",
                    "balance": "150.75"
                }
            }
        }
        
        # Create directory if it doesn't exist
        self.tokens_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Save default tokens
        with open(self.tokens_file, 'w') as f:
            json.dump(default_tokens, f, indent=2)
        
        return default_tokens
    
    def get_all_tokens(self) -> List[Dict]:
        """Get all tokens with their details"""
        tokens = []
        for name, data in self.tokens_data.get("tokens", {}).items():
            tokens.append({
                "name": name,
                "symbol": data["symbol"],
                "address": data["address"],
                "decimals": data["decimals"],
                "balance": float(data.get("balance", 0)),
                "total_supply": data.get("total_supply", "0")
            })
        return tokens
    
    def get_token_by_symbol(self, symbol: str) -> Optional[Dict]:
        """Get token details by symbol"""
        for name, data in self.tokens_data.get("tokens", {}).items():
            if data["symbol"].upper() == symbol.upper():
                return {
                    "name": name,
                    "symbol": data["symbol"],
                    "address": data["address"],
                    "decimals": data["decimals"],
                    "balance": float(data.get("balance", 0)),
                    "total_supply": data.get("total_supply", "0")
                }
        return None
    
    def get_token_balance(self, symbol: str) -> float:
        """Get balance for a specific token"""
        token = self.get_token_by_symbol(symbol)
        return token["balance"] if token else 0.0
    
    def get_portfolio_value(self, prices: Dict[str, float]) -> Dict:
        """Calculate total portfolio value based on current prices"""
        total_value = 0.0
        holdings = []
        
        for name, data in self.tokens_data.get("tokens", {}).items():
            symbol = data["symbol"]
            balance = float(data.get("balance", 0))
            price = prices.get(symbol, 0.0)
            value = balance * price
            total_value += value
            
            holdings.append({
                "name": name,
                "symbol": symbol,
                "balance": balance,
                "price": price,
                "value": value,
                "percentage": 0.0  # Will calculate after total
            })
        
        # Calculate percentages
        for holding in holdings:
            holding["percentage"] = (holding["value"] / total_value * 100) if total_value > 0 else 0.0
        
        return {
            "total_value": total_value,
            "holdings": holdings
        }
    
    def update_token_balance(self, symbol: str, new_balance: float) -> bool:
        """Update token balance"""
        for name, data in self.tokens_data.get("tokens", {}).items():
            if data["symbol"].upper() == symbol.upper():
                data["balance"] = str(new_balance)
                self._save_tokens()
                return True
        return False
    
    def _save_tokens(self):
        """Save tokens data to file"""
        with open(self.tokens_file, 'w') as f:
            json.dump(self.tokens_data, f, indent=2)

# Global instance
token_service = TokenService()

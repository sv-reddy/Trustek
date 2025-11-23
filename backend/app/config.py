from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    
    # Starknet
    STARKNET_RPC_URL: str
    STARKNET_NETWORK: str = "devnet"
    STARKNET_CHAIN_ID: str = "0x534e5f5345504f4c4941"
    STARKNET_ACCOUNT_ADDRESS: str = ""
    STARKNET_PRIVATE_KEY: str = ""
    STARKNET_ETH_TOKEN: str = ""
    STARKNET_STRK_TOKEN: str = ""
    STARKNET_UDC_ADDRESS: str = ""
    STARKNET_VAULT_CONTRACT: str = ""
    STARKNET_SESSION_KEY_CONTRACT: str = ""
    STARKNET_POSITION_CONTRACT: str = ""
    STARKNET_REBALANCE_CONTRACT: str = ""
    
    # Gemini AI
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Voice API
    VOICE_API_KEY: str = ""
    VOICE_API_ENDPOINT: str = ""
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert CORS_ORIGINS string to list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()

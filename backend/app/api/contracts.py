"""
API endpoints for contract interactions
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.contract_service import (
    vault_service,
    session_key_service,
    position_service,
    rebalance_service
)

router = APIRouter(prefix="/api/contracts", tags=["contracts"])


class VaultBalanceRequest(BaseModel):
    user_address: str


class VaultDepositRequest(BaseModel):
    user_address: str
    amount: int


class SessionKeyCreateRequest(BaseModel):
    user_address: str
    expiry_days: int = 30


class SessionKeyValidateRequest(BaseModel):
    session_key: str


class PositionOpenRequest(BaseModel):
    user_address: str
    pool_id: str
    amount: int
    min_price: int
    max_price: int


class PositionGetRequest(BaseModel):
    position_id: str


@router.post("/vault/balance")
async def get_vault_balance(request: VaultBalanceRequest):
    """Get user's vault balance from contract"""
    try:
        balance = await vault_service.get_balance(request.user_address)
        
        if balance is None:
            return {"success": False, "error": "Failed to fetch balance"}
        
        return {
            "success": True,
            "balance": balance,
            "balance_formatted": f"{balance / 1e18:.6f} ETH"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vault/deposit")
async def deposit_to_vault(request: VaultDepositRequest):
    """
    Initiate deposit transaction (frontend will sign with wallet)
    Returns transaction data for signing
    """
    try:
        return {
            "success": True,
            "transaction": {
                "contract_address": vault_service.contract_address,
                "entrypoint": "deposit",
                "calldata": [hex(request.amount)]
            },
            "message": "Transaction prepared. Please sign with your wallet."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vault/withdraw")
async def withdraw_from_vault(request: VaultDepositRequest):
    """
    Initiate withdrawal transaction
    Returns transaction data for signing
    """
    try:
        return {
            "success": True,
            "transaction": {
                "contract_address": vault_service.contract_address,
                "entrypoint": "withdraw",
                "calldata": [hex(request.amount)]
            },
            "message": "Transaction prepared. Please sign with your wallet."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session-key/validate")
async def validate_session_key(request: SessionKeyValidateRequest):
    """Check if a session key is valid"""
    try:
        is_valid = await session_key_service.is_valid(request.session_key)
        
        if is_valid:
            permissions = await session_key_service.get_permissions(request.session_key)
            return {
                "success": True,
                "valid": True,
                "permissions": permissions
            }
        else:
            return {
                "success": True,
                "valid": False
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/session-key/create")
async def create_session_key(request: SessionKeyCreateRequest):
    """
    Initiate session key creation transaction
    Returns transaction data for signing
    """
    try:
        return {
            "success": True,
            "transaction": {
                "contract_address": session_key_service.contract_address,
                "entrypoint": "create_session_key",
                "calldata": [hex(request.expiry_days)]
            },
            "message": "Session key creation prepared. Please sign with your wallet."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/position/get")
async def get_position(request: PositionGetRequest):
    """Get position details from contract"""
    try:
        position = await position_service.get_position(request.position_id)
        
        if position is None:
            return {"success": False, "error": "Position not found"}
        
        return {
            "success": True,
            "position": position
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/position/open")
async def open_position(request: PositionOpenRequest):
    """
    Initiate position opening transaction
    Returns transaction data for signing
    """
    try:
        return {
            "success": True,
            "transaction": {
                "contract_address": position_service.contract_address,
                "entrypoint": "open_position",
                "calldata": [
                    request.pool_id,
                    hex(request.amount),
                    hex(request.min_price),
                    hex(request.max_price)
                ]
            },
            "message": "Position opening prepared. Please sign with your wallet."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/info")
async def get_contract_info():
    """Get deployed contract addresses"""
    from app.config import settings
    
    return {
        "success": True,
        "contracts": {
            "vault": settings.STARKNET_VAULT_CONTRACT,
            "session_key": settings.STARKNET_SESSION_KEY_CONTRACT,
            "position": settings.STARKNET_POSITION_CONTRACT,
            "rebalance": settings.STARKNET_REBALANCE_CONTRACT
        },
        "network": {
            "rpc_url": settings.STARKNET_RPC_URL,
            "chain_id": settings.STARKNET_CHAIN_ID,
            "network": settings.STARKNET_NETWORK
        }
    }

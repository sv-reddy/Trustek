from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.db.supabase import get_supabase
from app.services.contract_service import vault_service
import httpx

router = APIRouter()


class DepositRequest(BaseModel):
    user_id: str
    amount: str  # in wei
    wallet_address: str
    tx_hash: Optional[str] = None


class WithdrawRequest(BaseModel):
    user_id: str
    amount: str
    wallet_address: str


@router.get("/")
async def get_transactions(user_id: str = None):
    """Get user's transaction history from Supabase."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    supabase = get_supabase()
    
    try:
        response = supabase.table("transaction_log").select("*").eq(
            "user_id", user_id
        ).order("timestamp", desc=True).limit(50).execute()
        
        return response.data or []
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deposit")
async def record_deposit(request: DepositRequest):
    """
    Record a deposit transaction in Supabase.
    This is called after user deposits ETH to the vault contract.
    """
    supabase = get_supabase()
    
    try:
        # 1. Verify the transaction on Starknet (if tx_hash provided)
        if request.tx_hash:
            verified = await verify_starknet_transaction(request.tx_hash)
            if not verified:
                raise HTTPException(status_code=400, detail="Transaction not found or failed")
        
        # 2. Get current vault balance from contract
        vault_balance = await vault_service.get_balance(request.wallet_address)
        
        # 3. Record transaction in Supabase
        tx_data = {
            "user_id": request.user_id,
            "transaction_type": "deposit",
            "amount": request.amount,
            "tx_hash": request.tx_hash or "pending",
            "status": "confirmed" if request.tx_hash else "pending",
            "timestamp": datetime.utcnow().isoformat(),
            "from_address": request.wallet_address,
            "to_address": vault_service.contract_address,
            "gas_used": "0",
            "proof_hash": None,
            "reasoning_log": f"User deposit of {request.amount} wei"
        }
        
        response = supabase.table("transaction_log").insert(tx_data).execute()
        
        # 4. Update user's vault balance in user_profiles
        supabase.table("user_profiles").update({
            "vault_balance": str(vault_balance) if vault_balance else request.amount
        }).eq("user_id", request.user_id).execute()
        
        return {
            "success": True,
            "transaction": response.data[0] if response.data else None,
            "vault_balance": vault_balance
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/withdraw")
async def record_withdrawal(request: WithdrawRequest):
    """
    Record a withdrawal transaction in Supabase.
    """
    supabase = get_supabase()
    
    try:
        # 1. Check vault balance
        vault_balance = await vault_service.get_balance(request.wallet_address)
        
        if not vault_balance or vault_balance < int(request.amount):
            raise HTTPException(status_code=400, detail="Insufficient vault balance")
        
        # 2. Record transaction
        tx_data = {
            "user_id": request.user_id,
            "transaction_type": "withdrawal",
            "amount": request.amount,
            "tx_hash": "pending",
            "status": "pending",
            "timestamp": datetime.utcnow().isoformat(),
            "from_address": vault_service.contract_address,
            "to_address": request.wallet_address,
            "gas_used": "0",
            "proof_hash": None,
            "reasoning_log": f"User withdrawal of {request.amount} wei"
        }
        
        response = supabase.table("transaction_log").insert(tx_data).execute()
        
        return {
            "success": True,
            "transaction": response.data[0] if response.data else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/balance/{wallet_address}")
async def get_vault_balance(wallet_address: str):
    """
    Get user's vault balance from Starknet contract.
    """
    try:
        balance = await vault_service.get_balance(wallet_address)
        
        return {
            "wallet_address": wallet_address,
            "vault_balance": balance,
            "balance_formatted": f"{balance / 1e18:.6f} ETH" if balance else "0 ETH"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync-balance")
async def sync_vault_balance(user_id: str, wallet_address: str):
    """
    Sync vault balance from contract to Supabase.
    Should be called periodically or after transactions.
    """
    supabase = get_supabase()
    
    try:
        # Get balance from contract
        vault_balance = await vault_service.get_balance(wallet_address)
        
        # Update in Supabase
        supabase.table("user_profiles").update({
            "vault_balance": str(vault_balance) if vault_balance else "0",
            "last_balance_sync": datetime.utcnow().isoformat()
        }).eq("user_id", user_id).execute()
        
        return {
            "success": True,
            "vault_balance": vault_balance
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def verify_starknet_transaction(tx_hash: str) -> bool:
    """
    Verify a Starknet transaction exists and succeeded.
    """
    from app.config import settings
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                settings.STARKNET_RPC_URL,
                json={
                    "jsonrpc": "2.0",
                    "method": "starknet_getTransactionReceipt",
                    "params": [tx_hash],
                    "id": 1
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                if "result" in result:
                    # Check if transaction succeeded
                    status = result["result"].get("execution_status", "")
                    return status == "SUCCEEDED"
        
        return False
        
    except Exception:
        return False

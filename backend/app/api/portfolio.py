from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.starknet_service import starknet_service
from app.services.contract_service import vault_service, position_service
from app.db.supabase import get_supabase

router = APIRouter()


@router.get("/")
async def get_portfolio(user_id: str = None):
    """
    Get user's complete portfolio data from both Starknet and Supabase.
    Combines:
    - Vault balance from contract
    - Open positions from contract
    - Transaction history from Supabase
    - Market data from Supabase
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    supabase = get_supabase()
    
    try:
        # 1. Get user's profile with wallet address
        profile = supabase.table("user_profiles").select("*").eq(
            "user_id", user_id
        ).single().execute()
        
        if not profile.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        wallet_address = profile.data.get("starknet_address")
        
        if not wallet_address:
            return {
                "total_value": 0,
                "vault_balance": 0,
                "current_pool": "N/A",
                "risk_score": profile.data.get("risk_tolerance", 5),
                "positions": [],
                "recent_transactions": [],
                "pnl": 0
            }
        
        # 2. Get vault balance from contract
        vault_balance = await vault_service.get_balance(wallet_address)
        
        # 3. Get recent transactions from Supabase
        transactions = supabase.table("transaction_log").select("*").eq(
            "user_id", user_id
        ).order("timestamp", desc=True).limit(10).execute()
        
        # 4. Calculate total value and PnL
        total_deposits = sum(
            int(tx.get("amount", 0)) 
            for tx in transactions.data 
            if tx.get("transaction_type") == "deposit"
        )
        
        total_withdrawals = sum(
            int(tx.get("amount", 0)) 
            for tx in transactions.data 
            if tx.get("transaction_type") == "withdrawal"
        )
        
        pnl = (vault_balance or 0) - (total_deposits - total_withdrawals)
        
        # 5. Fetch portfolio from Starknet (legacy)
        starknet_portfolio = await starknet_service.get_portfolio_data(wallet_address)
        
        return {
            "user_id": user_id,
            "wallet_address": wallet_address,
            "vault_balance": vault_balance,
            "vault_balance_formatted": f"{(vault_balance or 0) / 1e18:.6f} ETH",
            "total_value": vault_balance or 0,
            "total_deposits": total_deposits,
            "total_withdrawals": total_withdrawals,
            "pnl": pnl,
            "pnl_percentage": (pnl / total_deposits * 100) if total_deposits > 0 else 0,
            "current_pool": starknet_portfolio.get("current_pool", "N/A"),
            "risk_score": profile.data.get("risk_tolerance", 5),
            "positions": starknet_portfolio.get("positions", []),
            "recent_transactions": transactions.data[:5] if transactions.data else [],
            "last_sync": profile.data.get("last_balance_sync")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_portfolio_stats(user_id: str):
    """Get aggregated portfolio statistics."""
    supabase = get_supabase()
    
    try:
        # Get transaction statistics
        transactions = supabase.table("transaction_log").select("*").eq(
            "user_id", user_id
        ).execute()
        
        if not transactions.data:
            return {
                "total_transactions": 0,
                "total_deposits": 0,
                "total_withdrawals": 0,
                "total_trades": 0,
                "success_rate": 0
            }
        
        total_deposits = sum(
            int(tx.get("amount", 0)) 
            for tx in transactions.data 
            if tx.get("transaction_type") == "deposit"
        )
        
        total_withdrawals = sum(
            int(tx.get("amount", 0)) 
            for tx in transactions.data 
            if tx.get("transaction_type") == "withdrawal"
        )
        
        trades = [tx for tx in transactions.data if tx.get("transaction_type") == "trade"]
        successful_trades = [tx for tx in trades if tx.get("status") == "confirmed"]
        
        return {
            "total_transactions": len(transactions.data),
            "total_deposits": total_deposits,
            "total_deposits_formatted": f"{total_deposits / 1e18:.6f} ETH",
            "total_withdrawals": total_withdrawals,
            "total_withdrawals_formatted": f"{total_withdrawals / 1e18:.6f} ETH",
            "total_trades": len(trades),
            "successful_trades": len(successful_trades),
            "success_rate": (len(successful_trades) / len(trades) * 100) if trades else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

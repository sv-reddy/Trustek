from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.starknet_service import starknet_service
from app.services.contract_service import vault_service, position_service
from app.services.yahoo_finance_service import YahooFinanceService
from app.db.supabase import get_supabase

router = APIRouter()


@router.get("/")
async def get_portfolio(user_id: str = None):
    """
    Get user's complete portfolio data from Starknet contracts and real-time market prices.
    Combines:
    - Vault balance from Starknet VaultManager contract
    - Open positions from PositionManager contract
    - Transaction history from Supabase
    - Real-time crypto prices from Yahoo Finance
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
                "pnl": 0,
                "market_prices": {}
            }
        
        # 2. Get vault balance from Starknet contract (real-time on-chain data)
        vault_balance = await vault_service.get_balance(wallet_address)
        vault_balance_eth = (vault_balance or 0) / 1e18  # Convert from wei to ETH
        
        # 3. Get real-time market prices from Yahoo Finance
        market_prices = YahooFinanceService.get_multiple_prices(['ETH', 'BTC', 'USDC'])
        eth_price = market_prices.get('ETH', {}).get('price', 0)
        
        # Calculate vault value in USD
        vault_value_usd = vault_balance_eth * eth_price
        
        # 4. Get recent transactions from Supabase
        transactions = supabase.table("transaction_log").select("*").eq(
            "user_id", user_id
        ).order("timestamp", desc=True).limit(10).execute()
        
        # 5. Calculate total deposits/withdrawals in ETH
        total_deposits_eth = sum(
            float(tx.get("amount", 0)) / 1e18
            for tx in transactions.data 
            if tx.get("action") == "deposit"
        ) if transactions.data else 0
        
        total_withdrawals_eth = sum(
            float(tx.get("amount", 0)) / 1e18
            for tx in transactions.data 
            if tx.get("action") == "withdraw"
        ) if transactions.data else 0
        
        # Calculate net deposits in ETH
        net_deposits_eth = total_deposits_eth - total_withdrawals_eth
        net_deposits_usd = net_deposits_eth * eth_price
        
        # 6. Calculate P&L
        pnl_eth = vault_balance_eth - net_deposits_eth
        pnl_usd = vault_value_usd - net_deposits_usd
        pnl_percentage = (pnl_usd / net_deposits_usd * 100) if net_deposits_usd > 0 else 0
        
        # 7. Get positions from Starknet PositionManager contract
        # TODO: Implement position fetching when PositionManager contract is deployed
        positions = []
        
        # 8. Calculate portfolio metrics
        total_value_usd = vault_value_usd
        
        return {
            "user_id": user_id,
            "wallet_address": wallet_address,
            
            # Vault Data (from Starknet contract)
            "vault_balance_wei": vault_balance or 0,
            "vault_balance_eth": vault_balance_eth,
            "vault_balance_usd": vault_value_usd,
            
            # Portfolio Value
            "total_value_usd": total_value_usd,
            "total_value_eth": vault_balance_eth,
            
            # Deposits/Withdrawals
            "total_deposits_eth": total_deposits_eth,
            "total_deposits_usd": total_deposits_eth * eth_price,
            "total_withdrawals_eth": total_withdrawals_eth,
            "total_withdrawals_usd": total_withdrawals_eth * eth_price,
            "net_deposits_eth": net_deposits_eth,
            "net_deposits_usd": net_deposits_usd,
            
            # P&L Metrics
            "pnl_eth": pnl_eth,
            "pnl_usd": pnl_usd,
            "pnl_percentage": pnl_percentage,
            
            # Real-time Market Prices
            "market_prices": market_prices,
            "eth_price_usd": eth_price,
            
            # Additional Data
            "current_pool": "N/A",
            "risk_score": profile.data.get("risk_tolerance", 5),
            "positions": positions,
            "recent_transactions": transactions.data[:5] if transactions.data else [],
            "last_sync": profile.data.get("last_balance_sync")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_portfolio_stats(user_id: str):
    """Get aggregated portfolio statistics from Starknet and real-time market data."""
    supabase = get_supabase()
    
    try:
        # Get user's wallet address
        profile = supabase.table("user_profiles").select("*").eq(
            "user_id", user_id
        ).single().execute()
        
        if not profile.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        wallet_address = profile.data.get("starknet_address")
        
        # Get vault balance from Starknet contract
        vault_balance_wei = await vault_service.get_balance(wallet_address) if wallet_address else 0
        vault_balance_eth = (vault_balance_wei or 0) / 1e18
        
        # Get real-time ETH price
        eth_price_data = YahooFinanceService.get_crypto_price('ETH')
        eth_price = eth_price_data.get('price', 0) if eth_price_data else 0
        
        # Get transaction statistics
        transactions = supabase.table("transaction_log").select("*").eq(
            "user_id", user_id
        ).execute()
        
        if not transactions.data:
            return {
                "total_transactions": 0,
                "total_deposits_eth": 0,
                "total_deposits_usd": 0,
                "total_withdrawals_eth": 0,
                "total_withdrawals_usd": 0,
                "total_trades": 0,
                "vault_balance_eth": vault_balance_eth,
                "vault_balance_usd": vault_balance_eth * eth_price,
                "eth_price_usd": eth_price
            }
        
        # Calculate deposits/withdrawals in ETH
        total_deposits_eth = sum(
            float(tx.get("amount", 0)) / 1e18
            for tx in transactions.data 
            if tx.get("action") == "deposit"
        )
        
        total_withdrawals_eth = sum(
            float(tx.get("amount", 0)) / 1e18
            for tx in transactions.data 
            if tx.get("action") == "withdraw"
        )
        
        trades = [tx for tx in transactions.data if tx.get("action") == "trade"]
        successful_trades = [tx for tx in trades if tx.get("status") == "confirmed"]
        
        return {
            "total_transactions": len(transactions.data),
            
            # Vault balance from Starknet contract
            "vault_balance_eth": vault_balance_eth,
            "vault_balance_usd": vault_balance_eth * eth_price,
            
            # Deposits/Withdrawals
            "total_deposits_eth": total_deposits_eth,
            "total_deposits_usd": total_deposits_eth * eth_price,
            "total_withdrawals_eth": total_withdrawals_eth,
            "total_withdrawals_usd": total_withdrawals_eth * eth_price,
            
            # Trading stats
            "total_trades": len(trades),
            "successful_trades": len(successful_trades),
            "success_rate": (len(successful_trades) / len(trades) * 100) if trades else 0,
            
            # Market data
            "eth_price_usd": eth_price,
            "eth_price_change_24h": eth_price_data.get('change24h', 0) if eth_price_data else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

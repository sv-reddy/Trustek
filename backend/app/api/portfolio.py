from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.yahoo_finance_service import YahooFinanceService
from app.db.supabase import get_supabase
from services.token_service import token_service

router = APIRouter()


@router.get("/")
async def get_portfolio(user_id: str = None):
    """
    Get user's complete portfolio data from backend token service and real-time market prices.
    Combines:
    - Token balances from backend service
    - Transaction history from Supabase
    - Real-time crypto prices from Yahoo Finance
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    supabase = get_supabase()
    
    try:
        # 1. Get user's profile
        try:
            profile = supabase.table("user_profiles").select("*").eq(
                "user_id", user_id
            ).single().execute()
            
            if not profile.data:
                # User not found, create default response
                profile_data = {"risk_tolerance": 5, "starknet_address": None}
            else:
                profile_data = profile.data
        except Exception as profile_error:
            # Profile doesn't exist, use defaults
            print(f"Profile not found for user {user_id}: {profile_error}")
            profile_data = {"risk_tolerance": 5, "starknet_address": None}
        
        wallet_address = profile_data.get("starknet_address")
        
        # 2. Get real-time market prices from Yahoo Finance
        market_prices = YahooFinanceService.get_multiple_prices(['ETH', 'BTC', 'USDC', 'USDT', 'ADA', 'SOL', 'BNB', 'DOT', 'DOGE', 'MATIC'])
        eth_price = market_prices.get('ETH', {}).get('price', 0)
        
        # 3. Get tokens from backend service
        tokens = token_service.get_all_tokens()
        
        # Create price dict for portfolio calculation
        price_dict = {symbol: data.get('price', 0) for symbol, data in market_prices.items()}
        portfolio_data = token_service.get_portfolio_value(price_dict)
        portfolio_value = portfolio_data.get('total_value', 0)
        
        # 4. Get recent transactions from Supabase
        transactions = supabase.table("transaction_log").select("*").eq(
            "user_id", user_id
        ).order("timestamp", desc=True).limit(10).execute()
        
        # 5. Calculate portfolio metrics
        total_deposits_usd = 0
        total_withdrawals_usd = 0
        
        if transactions.data:
            for tx in transactions.data:
                if tx.get("action") == "deposit":
                    total_deposits_usd += float(tx.get("amount", 0))
                elif tx.get("action") == "withdraw":
                    total_withdrawals_usd += float(tx.get("amount", 0))
        
        net_deposits_usd = total_deposits_usd - total_withdrawals_usd
        
        # 6. Calculate P&L
        pnl_usd = portfolio_value - net_deposits_usd
        pnl_percentage = (pnl_usd / net_deposits_usd * 100) if net_deposits_usd > 0 else 0
        
        # 7. Prepare token list with prices
        token_list = []
        for token in tokens:
            price = market_prices.get(token['symbol'], {}).get('price', 0)
            value = token['balance'] * price
            token_list.append({
                **token,
                'price': price,
                'value': value,
                'change24h': market_prices.get(token['symbol'], {}).get('change24h', 0)
            })
        
        return {
            "user_id": user_id,
            "wallet_address": wallet_address or "Not connected",
            
            # Portfolio Value (from backend token service)
            "total_value_usd": portfolio_value,
            
            # Token Holdings
            "tokens": token_list,
            
            # Deposits/Withdrawals
            "total_deposits_usd": total_deposits_usd,
            "total_withdrawals_usd": total_withdrawals_usd,
            "net_deposits_usd": net_deposits_usd,
            
            # P&L Metrics
            "pnl_usd": pnl_usd,
            "pnl_percentage": pnl_percentage,
            
            # Real-time Market Prices
            "market_prices": market_prices,
            "eth_price_usd": eth_price,
            
            # Additional Data
            "risk_score": profile_data.get("risk_tolerance", 5),
            "recent_transactions": transactions.data[:5] if transactions.data else [],
            "last_sync": profile_data.get("last_balance_sync")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_portfolio_stats(user_id: str):
    """Get aggregated portfolio statistics from backend token service and real-time market data."""
    supabase = get_supabase()
    
    try:
        # Get user's profile
        try:
            profile = supabase.table("user_profiles").select("*").eq(
                "user_id", user_id
            ).single().execute()
            
            if not profile.data:
                profile_data = {}
            else:
                profile_data = profile.data
        except Exception:
            # Profile doesn't exist, use empty dict
            profile_data = {}
        
        # Get real-time market prices
        market_prices = YahooFinanceService.get_multiple_prices(['ETH', 'BTC', 'USDC', 'USDT', 'ADA', 'SOL', 'BNB', 'DOT', 'DOGE', 'MATIC'])
        
        # Get portfolio value from backend token service
        price_dict = {symbol: data.get('price', 0) for symbol, data in market_prices.items()}
        portfolio_data = token_service.get_portfolio_value(price_dict)
        portfolio_value = portfolio_data.get('total_value', 0)
        
        # Get ETH price
        eth_price_data = YahooFinanceService.get_crypto_price('ETH')
        eth_price = eth_price_data.get('price', 0) if eth_price_data else 0
        
        # Get transaction statistics
        transactions = supabase.table("transaction_log").select("*").eq(
            "user_id", user_id
        ).execute()
        
        if not transactions.data:
            return {
                "total_transactions": 0,
                "total_deposits_usd": 0,
                "total_withdrawals_usd": 0,
                "total_trades": 0,
                "portfolio_value_usd": portfolio_value,
                "eth_price_usd": eth_price
            }
        
        # Calculate deposits/withdrawals in USD
        total_deposits_usd = sum(
            float(tx.get("amount", 0))
            for tx in transactions.data 
            if tx.get("action") == "deposit"
        )
        
        total_withdrawals_usd = sum(
            float(tx.get("amount", 0))
            for tx in transactions.data 
            if tx.get("action") == "withdraw"
        )
        
        trades = [tx for tx in transactions.data if tx.get("action") == "trade"]
        successful_trades = [tx for tx in trades if tx.get("status") == "confirmed"]
        
        return {
            "total_transactions": len(transactions.data),
            
            # Portfolio value from backend token service
            "portfolio_value_usd": portfolio_value,
            
            # Deposits/Withdrawals
            "total_deposits_usd": total_deposits_usd,
            "total_withdrawals_usd": total_withdrawals_usd,
            
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

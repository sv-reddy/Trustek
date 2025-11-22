"""
Token API routes
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict
from pydantic import BaseModel

from ..services.token_service import token_service

router = APIRouter(prefix="/api/tokens", tags=["tokens"])

class TokenResponse(BaseModel):
    name: str
    symbol: str
    address: str
    decimals: int
    balance: float
    total_supply: str

class PortfolioResponse(BaseModel):
    total_value: float
    holdings: List[Dict]

@router.get("/", response_model=List[TokenResponse])
async def get_all_tokens():
    """Get all available tokens"""
    try:
        tokens = token_service.get_all_tokens()
        return tokens
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{symbol}", response_model=TokenResponse)
async def get_token(symbol: str):
    """Get specific token by symbol"""
    token = token_service.get_token_by_symbol(symbol)
    if not token:
        raise HTTPException(status_code=404, detail=f"Token {symbol} not found")
    return token

@router.get("/{symbol}/balance")
async def get_token_balance(symbol: str):
    """Get token balance"""
    balance = token_service.get_token_balance(symbol)
    return {"symbol": symbol, "balance": balance}

@router.get("/portfolio/value", response_model=PortfolioResponse)
async def get_portfolio_value():
    """Get total portfolio value with current market prices"""
    # Mock prices for now - in production, fetch from API
    mock_prices = {
        "BTC": 45000.00,
        "ETH": 2800.00,
        "USDT": 1.00,
        "USDC": 1.00,
        "ADA": 0.55,
        "SOL": 105.00,
        "BNB": 320.00,
        "DOT": 7.50,
        "DOGE": 0.08,
        "MATIC": 0.95
    }
    
    portfolio = token_service.get_portfolio_value(mock_prices)
    return portfolio

@router.post("/{symbol}/update-balance")
async def update_balance(symbol: str, new_balance: float):
    """Update token balance (for testing)"""
    success = token_service.update_token_balance(symbol, new_balance)
    if not success:
        raise HTTPException(status_code=404, detail=f"Token {symbol} not found")
    return {"success": True, "symbol": symbol, "new_balance": new_balance}

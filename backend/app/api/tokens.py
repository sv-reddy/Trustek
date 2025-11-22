"""
Token API routes
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict
from pydantic import BaseModel

# Use relative import path
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from services.token_service import token_service

router = APIRouter()

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

@router.post("/{symbol}/update-balance")
async def update_balance(symbol: str, new_balance: float):
    """Update token balance (for testing)"""
    success = token_service.update_token_balance(symbol, new_balance)
    if not success:
        raise HTTPException(status_code=404, detail=f"Token {symbol} not found")
    return {"success": True, "symbol": symbol, "new_balance": new_balance}

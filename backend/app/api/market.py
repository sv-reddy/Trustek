"""
Market data API endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.yahoo_finance_service import YahooFinanceService

router = APIRouter()

@router.get("/prices")
async def get_crypto_prices(
    symbols: str = Query(..., description="Comma-separated list of crypto symbols (e.g., ETH,BTC,USDC)")
):
    """
    Get real-time prices for multiple cryptocurrencies from Yahoo Finance
    """
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(',')]
        prices = YahooFinanceService.get_multiple_prices(symbol_list)
        
        if not prices:
            raise HTTPException(status_code=404, detail="No price data found")
        
        return {
            "success": True,
            "data": prices,
            "count": len(prices)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching prices: {str(e)}")


@router.get("/price/{symbol}")
async def get_crypto_price(symbol: str):
    """
    Get real-time price for a single cryptocurrency
    """
    try:
        price_data = YahooFinanceService.get_crypto_price(symbol)
        
        if not price_data:
            raise HTTPException(status_code=404, detail=f"Price data not found for {symbol}")
        
        return {
            "success": True,
            "data": price_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching price: {str(e)}")


@router.get("/search")
async def search_crypto(
    q: str = Query(..., min_length=1, description="Search query for cryptocurrency")
):
    """
    Search for cryptocurrencies by symbol
    """
    try:
        results = YahooFinanceService.search_crypto(q)
        
        return {
            "success": True,
            "data": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching: {str(e)}")

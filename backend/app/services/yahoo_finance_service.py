"""
Yahoo Finance service for fetching real-time cryptocurrency prices
"""
import yfinance as yf
from typing import Dict, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class YahooFinanceService:
    """Service for fetching cryptocurrency data from Yahoo Finance"""
    
    # Mapping of crypto symbols to Yahoo Finance tickers
    CRYPTO_TICKERS = {
        'ETH': 'ETH-USD',
        'BTC': 'BTC-USD',
        'USDC': 'USDC-USD',
        'USDT': 'USDT-USD',
        'SOL': 'SOL-USD',
        'ADA': 'ADA-USD',
        'DOT': 'DOT-USD',
        'MATIC': 'POL-USD',  # MATIC rebranded to POL (Polygon)
        'BNB': 'BNB-USD',
        'DOGE': 'DOGE-USD',
        'AVAX': 'AVAX-USD',
        'LINK': 'LINK-USD'
    }
    
    @staticmethod
    def get_crypto_price(symbol: str) -> Optional[Dict]:
        """
        Get current price and 24h change for a cryptocurrency
        
        Args:
            symbol: Crypto symbol (e.g., 'ETH', 'BTC')
            
        Returns:
            Dictionary with price data or None if failed
        """
        try:
            ticker_symbol = YahooFinanceService.CRYPTO_TICKERS.get(symbol.upper())
            if not ticker_symbol:
                logger.warning(f"Unknown crypto symbol: {symbol}")
                return None
            
            ticker = yf.Ticker(ticker_symbol)
            info = ticker.info
            
            # Get current price from info
            current_price = info.get('regularMarketPrice') or info.get('currentPrice') or info.get('price')
            if not current_price:
                logger.error(f"No price data available for {symbol}")
                return None
            
            # Get previous close
            previous_close = info.get('regularMarketPreviousClose', current_price)
            
            # Calculate 24h change
            change_24h = ((current_price - previous_close) / previous_close * 100) if previous_close else 0
            
            return {
                'symbol': symbol.upper(),
                'price': round(float(current_price), 6),
                'change24h': round(float(change_24h), 2),
                'previousClose': round(float(previous_close), 6),
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error fetching price for {symbol}: {str(e)}")
            return None
    
    @staticmethod
    def get_multiple_prices(symbols: List[str]) -> Dict[str, Dict]:
        """
        Get prices for multiple cryptocurrencies
        
        Args:
            symbols: List of crypto symbols
            
        Returns:
            Dictionary mapping symbols to their price data
        """
        results = {}
        for symbol in symbols:
            price_data = YahooFinanceService.get_crypto_price(symbol)
            if price_data:
                results[symbol.upper()] = price_data
        return results
    
    @staticmethod
    def search_crypto(query: str) -> List[Dict]:
        """
        Search for cryptocurrencies matching the query
        
        Args:
            query: Search query
            
        Returns:
            List of matching cryptocurrencies
        """
        query = query.upper()
        matches = []
        
        for symbol, ticker in YahooFinanceService.CRYPTO_TICKERS.items():
            if query in symbol:
                price_data = YahooFinanceService.get_crypto_price(symbol)
                if price_data:
                    matches.append(price_data)
        
        return matches

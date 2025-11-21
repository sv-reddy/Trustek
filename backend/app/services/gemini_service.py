import google.generativeai as genai
from app.config import settings

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    """Service for interacting with Gemini AI for market predictions."""
    
    def __init__(self):
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    async def predict_market_sentiment(self, pair: str, market_data: dict) -> dict:
        """
        Analyze market data and predict trading strategy.
        
        Args:
            pair: Trading pair (e.g., "ETH/USDC")
            market_data: Dictionary containing current market data
            
        Returns:
            Dictionary with action, reasoning, and parameters
        """
        prompt = self._build_prediction_prompt(pair, market_data)
        
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_response(response.text)
            return result
        except Exception as e:
            print(f"Gemini prediction error: {e}")
            return {
                "action": "HOLD",
                "reasoning": "Unable to get prediction, defaulting to HOLD",
                "confidence": 0.0
            }
    
    def _build_prediction_prompt(self, pair: str, market_data: dict) -> str:
        """Build the prompt for Gemini."""
        price = market_data.get("price", 0)
        volume = market_data.get("volume", 0)
        volatility = market_data.get("volatility", 0)
        trend = market_data.get("trend", "neutral")
        
        prompt = f"""
You are a DeFi liquidity management AI analyzing the {pair} market.

Current Market Data:
- Price: ${price}
- 24h Volume: ${volume}
- Volatility: {volatility}%
- Trend: {trend}

Your task is to determine if we should REBALANCE, ADD_LIQUIDITY, REMOVE_LIQUIDITY, or HOLD.

Consider:
1. Is volatility high enough to warrant rebalancing?
2. Is the current price range still optimal?
3. What are the risk factors?

Respond in this exact format:
ACTION: [REBALANCE/ADD_LIQUIDITY/REMOVE_LIQUIDITY/HOLD]
REASONING: [Your detailed explanation]
RANGE: [Lower]-[Upper] (if ACTION is REBALANCE or ADD_LIQUIDITY)
CONFIDENCE: [0.0-1.0]
"""
        return prompt
    
    def _parse_response(self, response_text: str) -> dict:
        """Parse Gemini's response into structured data."""
        lines = response_text.strip().split('\n')
        result = {
            "action": "HOLD",
            "reasoning": "",
            "range": None,
            "confidence": 0.5
        }
        
        for line in lines:
            if line.startswith("ACTION:"):
                result["action"] = line.split("ACTION:")[1].strip()
            elif line.startswith("REASONING:"):
                result["reasoning"] = line.split("REASONING:")[1].strip()
            elif line.startswith("RANGE:"):
                result["range"] = line.split("RANGE:")[1].strip()
            elif line.startswith("CONFIDENCE:"):
                try:
                    result["confidence"] = float(line.split("CONFIDENCE:")[1].strip())
                except:
                    result["confidence"] = 0.5
        
        return result


gemini_service = GeminiService()

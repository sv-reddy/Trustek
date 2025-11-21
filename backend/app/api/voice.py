from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.gemini_service import gemini_service
from app.services.starknet_service import starknet_service
from app.db.supabase import get_supabase
import tempfile
import os

router = APIRouter()


class VoiceCommand(BaseModel):
    user_id: str
    transcript: str


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio to text and extract intent.
    Note: This is a placeholder. Integrate with your actual voice API service.
    """
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # TODO: Integrate with actual voice transcription service (e.g., Google Speech-to-Text, Whisper)
        raise HTTPException(
            status_code=501,
            detail="Voice transcription service not yet implemented. Please integrate a speech-to-text API."
        )
        
        # Clean up temp file
        os.unlink(temp_path)
        
        return {
            "transcript": transcript,
            "action": action,
            "confidence": 0.95
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/execute-command")
async def execute_voice_command(command: VoiceCommand):
    """
    Execute a voice command after transcription.
    This triggers the MCP flow: prediction -> ZK proof -> execution.
    """
    supabase = get_supabase()
    
    try:
        # Parse intent from transcript
        intent = parse_intent(command.transcript)
        
        if intent["action"] == "EXECUTE_STRATEGY":
            # Get user's wallet and session key
            profile = supabase.table("user_profiles").select("*").eq(
                "user_id", command.user_id
            ).single().execute()
            
            session_key = supabase.table("session_keys").select("*").eq(
                "user_id", command.user_id
            ).order("created_at", desc=True).limit(1).single().execute()
            
            if not session_key.data:
                raise HTTPException(status_code=400, detail="No active session key")
            
            # Get market data
            market_data = await fetch_market_data(intent["pair"])
            
            # Get Gemini prediction
            prediction = await gemini_service.predict_market_sentiment(
                pair=intent["pair"],
                market_data=market_data
            )
            
            # Execute if confidence is high enough
            if prediction["confidence"] > 0.7 and prediction["action"] != "HOLD":
                # Generate ZK proof hash (simplified - integrate with Giza in production)
                proof_hash = generate_proof_hash(market_data, prediction)
                
                # Extract range if rebalancing
                new_range = None
                if prediction["range"]:
                    bounds = prediction["range"].split("-")
                    new_range = (float(bounds[0]), float(bounds[1]))
                
                # Execute on Starknet
                result = await starknet_service.execute_rebalance(
                    session_key_private=session_key.data["session_key_private"],
                    account_address=profile.data["starknet_address"],
                    new_range=new_range or (1800, 2200),
                    proof_hash=proof_hash,
                    reasoning_log=prediction["reasoning"]
                )
                
                # Log transaction
                supabase.table("transaction_log").insert({
                    "tx_hash": result["tx_hash"],
                    "user_id": command.user_id,
                    "action": prediction["action"],
                    "ai_reasoning_log": prediction["reasoning"],
                    "status": result["status"]
                }).execute()
                
                return {
                    "success": True,
                    "action": prediction["action"],
                    "reasoning": prediction["reasoning"],
                    "tx_hash": result["tx_hash"]
                }
            else:
                return {
                    "success": False,
                    "action": "HOLD",
                    "reasoning": prediction["reasoning"]
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def parse_intent(transcript: str) -> dict:
    """Parse user intent from transcript."""
    transcript_lower = transcript.lower()
    
    if "execute" in transcript_lower or "trade" in transcript_lower:
        action = "EXECUTE_STRATEGY"
    elif "check" in transcript_lower or "status" in transcript_lower:
        action = "CHECK_STATUS"
    else:
        action = "UNKNOWN"
    
    # Extract pair (simplified)
    pair = "ETH/USDC"
    if "btc" in transcript_lower:
        pair = "BTC/USDC"
    
    return {"action": action, "pair": pair}


async def fetch_market_data(pair: str) -> dict:
    """Fetch current market data for a trading pair."""
    # Simplified - integrate with actual price feeds
    return {
        "price": 2000.0,
        "volume": 1000000,
        "volatility": 5.2,
        "trend": "bullish"
    }


def generate_proof_hash(market_data: dict, prediction: dict) -> str:
    """Generate ZK proof hash (simplified)."""
    from hashlib import sha256
    data_str = f"{market_data}{prediction}"
    return sha256(data_str.encode()).hexdigest()

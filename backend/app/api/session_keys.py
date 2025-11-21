from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.db.supabase import get_supabase
import secrets

router = APIRouter()


class CreateSessionKeyRequest(BaseModel):
    user_id: str
    wallet_address: str
    expiry_days: int = 30


@router.post("/create")
async def create_session_key(request: CreateSessionKeyRequest):
    """
    Create a new session key for automated trading.
    
    Note: In production, this should involve signing a transaction on-chain
    to authorize the session key with specific permissions.
    """
    supabase = get_supabase()
    
    try:
        # Generate a new private key (simplified)
        session_key_private = secrets.token_hex(32)
        
        # Calculate expiry
        expiry = datetime.utcnow() + timedelta(days=request.expiry_days)
        
        # Store in database
        response = supabase.table("session_keys").insert({
            "user_id": request.user_id,
            "session_key_private": session_key_private,
            "expiry_timestamp": expiry.isoformat(),
            "permission_hash": "default_permissions",  # Define actual permissions
            "status": "active"
        }).execute()
        
        return {
            "message": "Session key created successfully",
            "expiry": expiry.isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_session_keys(user_id: str):
    """List all session keys for a user."""
    supabase = get_supabase()
    
    try:
        response = supabase.table("session_keys").select(
            "id, created_at, expiry_timestamp, status"
        ).eq("user_id", user_id).execute()
        
        return response.data or []
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{key_id}")
async def revoke_session_key(key_id: str):
    """Revoke a session key."""
    supabase = get_supabase()
    
    try:
        supabase.table("session_keys").update({
            "status": "revoked"
        }).eq("id", key_id).execute()
        
        return {"message": "Session key revoked successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

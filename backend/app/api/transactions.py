from fastapi import APIRouter, HTTPException
from app.db.supabase import get_supabase

router = APIRouter()


@router.get("/")
async def get_transactions(user_id: str = None):
    """Get user's transaction history."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    supabase = get_supabase()
    
    try:
        response = supabase.table("transaction_log").select("*").eq(
            "user_id", user_id
        ).order("timestamp", desc=True).limit(50).execute()
        
        return response.data or []
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

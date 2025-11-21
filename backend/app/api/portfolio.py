from fastapi import APIRouter, HTTPException, Depends
from app.services.starknet_service import starknet_service
from app.db.supabase import get_supabase

router = APIRouter()


@router.get("/")
async def get_portfolio(user_id: str = None):
    """Get user's portfolio data from Starknet."""
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    supabase = get_supabase()
    
    try:
        # Get user's wallet address
        profile = supabase.table("user_profiles").select("starknet_address").eq(
            "user_id", user_id
        ).single().execute()
        
        if not profile.data or not profile.data.get("starknet_address"):
            return {
                "total_value": 0,
                "current_pool": "N/A",
                "risk_score": 0,
                "positions": []
            }
        
        # Fetch portfolio from Starknet
        portfolio = await starknet_service.get_portfolio_data(
            profile.data["starknet_address"]
        )
        
        return portfolio
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

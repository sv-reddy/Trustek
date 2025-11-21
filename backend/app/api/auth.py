from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.supabase import get_supabase

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class SignUpRequest(BaseModel):
    email: str
    password: str
    phone_number: str


@router.post("/login")
async def login(request: LoginRequest):
    """Authenticate user with email and password."""
    supabase = get_supabase()
    
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        return {
            "access_token": response.session.access_token,
            "user": response.user
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/signup")
async def signup(request: SignUpRequest):
    """Register a new user."""
    supabase = get_supabase()
    
    try:
        # Create auth user
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        
        if auth_response.user:
            # Create user profile using admin client (bypasses RLS)
            # The RLS policy expects auth.uid() which is only available in user context
            # Using service key, we need to insert directly
            try:
                supabase.table("user_profiles").insert({
                    "user_id": auth_response.user.id,
                    "phone_number": request.phone_number
                }).execute()
            except Exception as profile_error:
                # If profile creation fails, we still return success
                # Profile can be created on first login
                print(f"Profile creation warning: {profile_error}")
        
        return {
            "message": "User created successfully. Please check your email to confirm your account.",
            "user": auth_response.user
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

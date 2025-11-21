from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.config import settings
from app.api import voice, portfolio, transactions, session_keys, auth, contracts


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"🚀 TrusTek Fusion Backend starting in {settings.ENVIRONMENT} mode...")
    yield
    # Shutdown
    print("👋 TrusTek Fusion Backend shutting down...")


app = FastAPI(
    title="TrusTek Fusion API",
    description="Voice-Controlled Financial Agent on Starknet - MCP Server",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(session_keys.router, prefix="/api/session-key", tags=["Session Keys"])
app.include_router(contracts.router, tags=["Contracts"])


@app.get("/")
async def root():
    return {
        "name": "TrusTek Fusion API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False
    )

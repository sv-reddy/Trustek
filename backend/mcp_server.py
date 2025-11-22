"""
TrusTek Voice MCP Server
Model Context Protocol server for voice-controlled crypto trading
"""
import asyncio
import logging
from typing import Any, Sequence
from mcp.server import Server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
)
from mcp.server.stdio import stdio_server

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trustek-voice-mcp")

# Import our services
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))
from services.token_service import token_service

# Create MCP server
app = Server("trustek-voice")

# ============================================================================
# Resources - Provide portfolio and token data to LLM
# ============================================================================

@app.list_resources()
async def list_resources() -> list[Resource]:
    """List available resources"""
    return [
        Resource(
            uri="trustek://portfolio/tokens",
            name="Crypto Token Portfolio",
            description="Current cryptocurrency token holdings and balances",
            mimeType="application/json"
        ),
        Resource(
            uri="trustek://portfolio/value",
            name="Portfolio Total Value",
            description="Total portfolio value in USD with breakdown",
            mimeType="application/json"
        )
    ]

@app.read_resource()
async def read_resource(uri: str) -> str:
    """Read resource content"""
    if uri == "trustek://portfolio/tokens":
        tokens = token_service.get_all_tokens()
        return {
            "tokens": tokens,
            "count": len(tokens)
        }
    
    elif uri == "trustek://portfolio/value":
        mock_prices = {
            "BTC": 45000.00,
            "ETH": 2800.00,
            "USDT": 1.00,
            "USDC": 1.00,
            "ADA": 0.55,
            "SOL": 105.00
        }
        portfolio = token_service.get_portfolio_value(mock_prices)
        return portfolio
    
    else:
        raise ValueError(f"Unknown resource: {uri}")

# ============================================================================
# Tools - Define actions the LLM can take
# ============================================================================

@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available tools"""
    return [
        Tool(
            name="get_token_balance",
            description="Get the balance of a specific cryptocurrency token",
            inputSchema={
                "type": "object",
                "properties": {
                    "symbol": {
                        "type": "string",
                        "description": "Token symbol (e.g., BTC, ETH, USDT)"
                    }
                },
                "required": ["symbol"]
            }
        ),
        Tool(
            name="get_portfolio_summary",
            description="Get a summary of the entire crypto portfolio with values",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="search_token",
            description="Search for a token by name or symbol",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Token name or symbol to search for"
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="execute_voice_command",
            description="Process a natural language voice command for crypto operations",
            inputSchema={
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "Voice command text"
                    },
                    "intent": {
                        "type": "string",
                        "enum": ["check_balance", "portfolio_summary", "token_info", "market_data"],
                        "description": "Detected intent of the command"
                    }
                },
                "required": ["command", "intent"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: Any) -> Sequence[TextContent | ImageContent | EmbeddedResource]:
    """Execute tool"""
    
    if name == "get_token_balance":
        symbol = arguments.get("symbol", "").upper()
        token = token_service.get_token_by_symbol(symbol)
        
        if not token:
            return [TextContent(
                type="text",
                text=f"Token {symbol} not found in portfolio"
            )]
        
        return [TextContent(
            type="text",
            text=f"Your {token['name']} ({symbol}) balance is {token['balance']} tokens"
        )]
    
    elif name == "get_portfolio_summary":
        mock_prices = {
            "BTC": 45000.00,
            "ETH": 2800.00,
            "USDT": 1.00,
            "USDC": 1.00,
            "ADA": 0.55,
            "SOL": 105.00
        }
        portfolio = token_service.get_portfolio_value(mock_prices)
        
        summary = f"Portfolio Summary:\n"
        summary += f"Total Value: ${portfolio['total_value']:,.2f}\n\n"
        summary += "Holdings:\n"
        
        for holding in sorted(portfolio['holdings'], key=lambda x: x['value'], reverse=True):
            summary += f"  {holding['symbol']}: {holding['balance']:.4f} @ ${holding['price']:,.2f} = ${holding['value']:,.2f} ({holding['percentage']:.1f}%)\n"
        
        return [TextContent(type="text", text=summary)]
    
    elif name == "search_token":
        query = arguments.get("query", "").upper()
        tokens = token_service.get_all_tokens()
        
        matches = [t for t in tokens if query in t['symbol'].upper() or query in t['name'].upper()]
        
        if not matches:
            return [TextContent(type="text", text=f"No tokens found matching '{query}'")]
        
        result = "Found tokens:\n"
        for token in matches:
            result += f"  {token['name']} ({token['symbol']}): {token['balance']} tokens\n"
        
        return [TextContent(type="text", text=result)]
    
    elif name == "execute_voice_command":
        command = arguments.get("command", "")
        intent = arguments.get("intent", "")
        
        logger.info(f"Voice command: {command} | Intent: {intent}")
        
        if intent == "check_balance":
            # Extract token symbol from command
            tokens = token_service.get_all_tokens()
            for token in tokens:
                if token['symbol'].lower() in command.lower() or token['name'].lower() in command.lower():
                    return [TextContent(
                        type="text",
                        text=f"Your {token['name']} balance is {token['balance']} {token['symbol']}"
                    )]
            return [TextContent(type="text", text="Could not determine which token you're asking about")]
        
        elif intent == "portfolio_summary":
            # Reuse portfolio summary tool
            return await call_tool("get_portfolio_summary", {})
        
        else:
            return [TextContent(type="text", text=f"Processed command: {command}")]
    
    else:
        raise ValueError(f"Unknown tool: {name}")

# ============================================================================
# Main entry point
# ============================================================================

async def main():
    """Main entry point for MCP server"""
    async with stdio_server() as (read_stream, write_stream):
        logger.info("🎤 TrusTek Voice MCP Server starting...")
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())

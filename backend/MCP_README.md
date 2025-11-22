# TrusTek Voice MCP Server

Model Context Protocol server for voice-controlled cryptocurrency trading on Starknet.

## Features

- **Portfolio Management**: Real-time access to crypto token balances
- **Voice Commands**: Natural language processing for crypto operations
- **Token Data**: Complete token information and market values
- **Starknet Integration**: Direct blockchain interaction

## Installation

```bash
# Install MCP SDK
pip install mcp

# Install dependencies
cd backend
pip install -r requirements.txt
```

## Configuration

Add to Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "trustek-voice": {
      "command": "python",
      "args": ["-m", "mcp_server"],
      "cwd": "E:\\Build\\backend",
      "env": {
        "PYTHONPATH": "E:\\Build\\backend",
        "SUPABASE_URL": "your_supabase_url",
        "STARKNET_RPC_URL": "http://192.168.137.128:5050"
      }
    }
  }
}
```

## Available Tools

### get_token_balance
Get balance of a specific cryptocurrency token.

**Input**: `{"symbol": "BTC"}`
**Output**: Token balance information

### get_portfolio_summary
Get complete portfolio summary with values.

**Output**: Total portfolio value and breakdown by token

### search_token
Search for tokens by name or symbol.

**Input**: `{"query": "ethereum"}`
**Output**: Matching token information

### execute_voice_command
Process natural language voice commands.

**Input**: 
```json
{
  "command": "What is my Bitcoin balance?",
  "intent": "check_balance"
}
```

## Resources

- `trustek://portfolio/tokens` - Current token holdings
- `trustek://portfolio/value` - Portfolio total value with breakdown

## Testing

```bash
# Test MCP server locally
python -m mcp_server

# Test with MCP inspector
npx @modelcontextprotocol/inspector python -m mcp_server
```

## Voice Command Examples

- "What is my Bitcoin balance?"
- "Show me my portfolio"
- "How much Ethereum do I have?"
- "What's the total value of my holdings?"

## Architecture

```
User Voice → Claude Desktop → MCP Server → Token Service → Starknet/Katana
                                    ↓
                              Portfolio Data
                              Token Balances
                              Market Prices
```

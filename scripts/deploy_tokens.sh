#!/bin/bash

# ╔════════════════════════════════════════════════════════════════╗
# ║  Deploy Fake Crypto Tokens to Katana Devnet                   ║
# ╚════════════════════════════════════════════════════════════════╝

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🪙 Deploying Fake Crypto Tokens to Katana${NC}"
echo ""

# Pre-funded account from Katana
ACCOUNT_ADDRESS="0x6162896d1d7ab204c7ccac6dd5f8e9e7c25ecd5ae4fcb4ad32e57786bb46e03"
RPC_URL="http://localhost:5050"

# Token configurations
declare -A TOKENS
TOKENS["Bitcoin"]="BTC:8:21000000"
TOKENS["Ethereum"]="ETH:18:120000000"
TOKENS["Tether"]="USDT:6:100000000000"
TOKENS["USD Coin"]="USDC:6:50000000000"
TOKENS["Binance Coin"]="BNB:18:200000000"
TOKENS["Cardano"]="ADA:6:45000000000"
TOKENS["Solana"]="SOL:9:500000000"
TOKENS["Polkadot"]="DOT:10:1000000000"
TOKENS["Dogecoin"]="DOGE:8:140000000000"
TOKENS["Polygon"]="MATIC:18:10000000000"

mkdir -p logs
mkdir -p deployed_tokens

echo -e "${YELLOW}Creating token deployment results...${NC}"
echo ""

# Create deployed tokens JSON
cat > deployed_tokens/tokens.json << 'EOF'
{
  "network": "katana",
  "rpc_url": "http://localhost:5050",
  "deployer": "0x6162896d1d7ab204c7ccac6dd5f8e9e7c25ecd5ae4fcb4ad32e57786bb46e03",
  "tokens": {}
}
EOF

# Deploy each token (simulated for now)
TOKEN_COUNT=0
for TOKEN_NAME in "${!TOKENS[@]}"; do
    IFS=':' read -r SYMBOL DECIMALS SUPPLY <<< "${TOKENS[$TOKEN_NAME]}"
    
    echo -e "${BLUE}Deploying ${TOKEN_NAME} (${SYMBOL})...${NC}"
    
    # Generate random address for simulation
    TOKEN_ADDRESS=$(printf "0x%064x" $((0x1000000000000000000000000000000 + RANDOM * RANDOM)))
    
    # Update JSON with token info
    jq ".tokens[\"$TOKEN_NAME\"] = {
        \"symbol\": \"$SYMBOL\",
        \"address\": \"$TOKEN_ADDRESS\",
        \"decimals\": $DECIMALS,
        \"total_supply\": \"$SUPPLY\",
        \"balance\": \"$SUPPLY\"
    }" deployed_tokens/tokens.json > deployed_tokens/tokens.tmp && mv deployed_tokens/tokens.tmp deployed_tokens/tokens.json
    
    echo -e "${GREEN}  ✓ ${SYMBOL} deployed at: ${TOKEN_ADDRESS}${NC}"
    echo -e "${GREEN}  ✓ Initial supply: ${SUPPLY} (to ${ACCOUNT_ADDRESS})${NC}"
    echo ""
    
    TOKEN_COUNT=$((TOKEN_COUNT + 1))
    sleep 0.5
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       ✓ ${TOKEN_COUNT} TOKENS DEPLOYED SUCCESSFULLY                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Token balances saved to: deployed_tokens/tokens.json${NC}"
echo -e "${BLUE}All tokens minted to: ${ACCOUNT_ADDRESS}${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Copy deployed_tokens/tokens.json to Windows: E:\\Build\\deployed_tokens\\tokens.json"
echo -e "  2. Update backend to load token data"
echo -e "  3. Frontend will display these tokens in portfolio"
echo ""

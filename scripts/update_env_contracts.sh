#!/bin/bash

# ============================================
# Update Environment Files with Deployed Contract Addresses
# ============================================

set -e

if [ ! -f "deployed_contracts.json" ]; then
    echo "❌ deployed_contracts.json not found!"
    echo "Run deploy_contracts.sh first"
    exit 1
fi

echo "🔄 Updating environment files with contract addresses..."

# Extract addresses using jq
VAULT_ADDRESS=$(jq -r '.contracts.VaultManager.address' deployed_contracts.json)
SESSION_ADDRESS=$(jq -r '.contracts.SessionKeyManager.address' deployed_contracts.json)
POSITION_ADDRESS=$(jq -r '.contracts.PositionManager.address' deployed_contracts.json)
REBALANCE_ADDRESS=$(jq -r '.contracts.RebalanceExecutor.address' deployed_contracts.json)
NETWORK=$(jq -r '.network' deployed_contracts.json)

echo "Vault Manager: $VAULT_ADDRESS"
echo "Session Key Manager: $SESSION_ADDRESS"
echo "Position Manager: $POSITION_ADDRESS"
echo "Rebalance Executor: $REBALANCE_ADDRESS"

# Update backend/.env
echo ""
echo "Updating backend/.env..."
BACKEND_ENV="backend/.env"

# Create backup
cp "$BACKEND_ENV" "${BACKEND_ENV}.backup"

# Update or add contract addresses
update_env_var() {
    local file=$1
    local key=$2
    local value=$3
    
    if grep -q "^${key}=" "$file"; then
        sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    else
        echo "${key}=${value}" >> "$file"
    fi
}

update_env_var "$BACKEND_ENV" "VAULT_MANAGER_ADDRESS" "$VAULT_ADDRESS"
update_env_var "$BACKEND_ENV" "SESSION_KEY_MANAGER_ADDRESS" "$SESSION_ADDRESS"
update_env_var "$BACKEND_ENV" "POSITION_MANAGER_ADDRESS" "$POSITION_ADDRESS"
update_env_var "$BACKEND_ENV" "REBALANCE_EXECUTOR_ADDRESS" "$REBALANCE_ADDRESS"

# Update RPC URL based on network
if [ "$NETWORK" = "katana" ]; then
    update_env_var "$BACKEND_ENV" "STARKNET_RPC_URL" "http://localhost:5050"
else
    update_env_var "$BACKEND_ENV" "STARKNET_RPC_URL" "https://starknet-sepolia.public.blastapi.io/rpc/v0_7"
fi

echo "✅ Backend .env updated"

# Update frontend/.env
echo ""
echo "Updating frontend/.env..."
FRONTEND_ENV="frontend/.env"

# Create backup
cp "$FRONTEND_ENV" "${FRONTEND_ENV}.backup"

update_env_var "$FRONTEND_ENV" "VITE_VAULT_MANAGER_ADDRESS" "$VAULT_ADDRESS"
update_env_var "$FRONTEND_ENV" "VITE_SESSION_KEY_MANAGER_ADDRESS" "$SESSION_ADDRESS"
update_env_var "$FRONTEND_ENV" "VITE_POSITION_MANAGER_ADDRESS" "$POSITION_ADDRESS"
update_env_var "$FRONTEND_ENV" "VITE_REBALANCE_EXECUTOR_ADDRESS" "$REBALANCE_ADDRESS"

# Update RPC URL
if [ "$NETWORK" = "katana" ]; then
    update_env_var "$FRONTEND_ENV" "VITE_STARKNET_RPC_URL" "http://localhost:5050"
    update_env_var "$FRONTEND_ENV" "VITE_STARKNET_NETWORK" "katana"
else
    update_env_var "$FRONTEND_ENV" "VITE_STARKNET_RPC_URL" "https://starknet-sepolia.public.blastapi.io/rpc/v0_7"
    update_env_var "$FRONTEND_ENV" "VITE_STARKNET_NETWORK" "sepolia"
fi

echo "✅ Frontend .env updated"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Environment files updated successfully!"
echo ""
echo "Backups saved as:"
echo "  - backend/.env.backup"
echo "  - frontend/.env.backup"
echo ""
echo "Next steps:"
echo "1. Restart backend server"
echo "2. Restart frontend dev server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

#!/bin/bash

# ============================================
# Deploy TrusTek Contracts to Starknet
# ============================================

set -e

CONTRACTS_DIR="$(pwd)/contracts"
WALLET_DIR="$HOME/.starknet-wallets"
DEPLOY_LOG="logs/deployment.log"

mkdir -p logs

echo "🚀 TrusTek Contract Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if wallet exists
if [ ! -f "$WALLET_DIR/account_address.txt" ]; then
    echo "❌ Wallet not found! Run setup_wallet.sh first"
    exit 1
fi

ACCOUNT_ADDRESS=$(cat "$WALLET_DIR/account_address.txt")
echo "Deploying from account: $ACCOUNT_ADDRESS"

# Choose network
echo ""
echo "Select deployment network:"
echo "1. Local Devnet (Katana)"
echo "2. Sepolia Testnet"
read -p "Enter choice [1-2]: " network_choice

case $network_choice in
    1)
        RPC_URL="http://localhost:5050"
        ACCOUNT_FILE="$WALLET_DIR/accounts/katana_prefunded.json"
        KEYSTORE_FILE="$WALLET_DIR/keystores/katana_prefunded.json"
        echo "Using Katana devnet"
        ;;
    2)
        RPC_URL="https://starknet-sepolia.public.blastapi.io/rpc/v0_7"
        ACCOUNT_FILE="$WALLET_DIR/accounts/testnet_account.json"
        KEYSTORE_FILE="$WALLET_DIR/keystores/deployer_keystore.json"
        echo "Using Sepolia testnet"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Check if devnet is running (for local)
if [ "$network_choice" = "1" ]; then
    if ! curl -s http://localhost:5050 > /dev/null 2>&1; then
        echo "❌ Katana devnet is not running!"
        echo "Start it with: ./start_devnet.sh"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Declaring Contract Classes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Declare VaultManager
echo "📝 Declaring VaultManager..."
VAULT_CLASS_HASH=$(starkli declare \
    --rpc "$RPC_URL" \
    --account "$ACCOUNT_FILE" \
    --keystore "$KEYSTORE_FILE" \
    "$CONTRACTS_DIR/vault_manager.cairo" \
    2>&1 | tee -a "$DEPLOY_LOG" | grep "Class hash declared:" | awk '{print $4}')

echo "✅ VaultManager class hash: $VAULT_CLASS_HASH"
sleep 2

# Declare SessionKeyManager
echo "📝 Declaring SessionKeyManager..."
SESSION_CLASS_HASH=$(starkli declare \
    --rpc "$RPC_URL" \
    --account "$ACCOUNT_FILE" \
    --keystore "$KEYSTORE_FILE" \
    "$CONTRACTS_DIR/session_key_manager.cairo" \
    2>&1 | tee -a "$DEPLOY_LOG" | grep "Class hash declared:" | awk '{print $4}')

echo "✅ SessionKeyManager class hash: $SESSION_CLASS_HASH"
sleep 2

# Declare PositionManager
echo "📝 Declaring PositionManager..."
POSITION_CLASS_HASH=$(starkli declare \
    --rpc "$RPC_URL" \
    --account "$ACCOUNT_FILE" \
    --keystore "$KEYSTORE_FILE" \
    "$CONTRACTS_DIR/position_manager.cairo" \
    2>&1 | tee -a "$DEPLOY_LOG" | grep "Class hash declared:" | awk '{print $4}')

echo "✅ PositionManager class hash: $POSITION_CLASS_HASH"
sleep 2

# Declare RebalanceExecutor
echo "📝 Declaring RebalanceExecutor..."
REBALANCE_CLASS_HASH=$(starkli declare \
    --rpc "$RPC_URL" \
    --account "$ACCOUNT_FILE" \
    --keystore "$KEYSTORE_FILE" \
    "$CONTRACTS_DIR/rebalance_executor.cairo" \
    2>&1 | tee -a "$DEPLOY_LOG" | grep "Class hash declared:" | awk '{print $4}')

echo "✅ RebalanceExecutor class hash: $REBALANCE_CLASS_HASH"
sleep 2

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Deploying Contract Instances"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Deploy VaultManager
echo "🏗️ Deploying VaultManager..."
VAULT_ADDRESS=$(starkli deploy \
    --rpc "$RPC_URL" \
    --account "$ACCOUNT_FILE" \
    --keystore "$KEYSTORE_FILE" \
    "$VAULT_CLASS_HASH" \
    "$ACCOUNT_ADDRESS" \
    2>&1 | tee -a "$DEPLOY_LOG" | grep "Contract deployed:" | awk '{print $3}')

echo "✅ VaultManager deployed at: $VAULT_ADDRESS"
sleep 2

# Deploy SessionKeyManager
echo "🏗️ Deploying SessionKeyManager..."
SESSION_ADDRESS=$(starkli deploy \
    --rpc "$RPC_URL" \
    --account "$ACCOUNT_FILE" \
    --keystore "$KEYSTORE_FILE" \
    "$SESSION_CLASS_HASH" \
    "$ACCOUNT_ADDRESS" \
    2>&1 | tee -a "$DEPLOY_LOG" | grep "Contract deployed:" | awk '{print $3}')

echo "✅ SessionKeyManager deployed at: $SESSION_ADDRESS"
sleep 2

# Deploy PositionManager
echo "🏗️ Deploying PositionManager..."
POSITION_ADDRESS=$(starkli deploy \
    --rpc "$RPC_URL" \
    --account "$ACCOUNT_FILE" \
    --keystore "$KEYSTORE_FILE" \
    "$POSITION_CLASS_HASH" \
    "$VAULT_ADDRESS" \
    2>&1 | tee -a "$DEPLOY_LOG" | grep "Contract deployed:" | awk '{print $3}')

echo "✅ PositionManager deployed at: $POSITION_ADDRESS"
sleep 2

# Deploy RebalanceExecutor
echo "🏗️ Deploying RebalanceExecutor..."
REBALANCE_ADDRESS=$(starkli deploy \
    --rpc "$RPC_URL" \
    --account "$ACCOUNT_FILE" \
    --keystore "$KEYSTORE_FILE" \
    "$REBALANCE_CLASS_HASH" \
    "$VAULT_ADDRESS" \
    "$SESSION_ADDRESS" \
    2>&1 | tee -a "$DEPLOY_LOG" | grep "Contract deployed:" | awk '{print $3}')

echo "✅ RebalanceExecutor deployed at: $REBALANCE_ADDRESS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Save contract addresses
cat > deployed_contracts.json << EOF
{
  "network": "$([ "$network_choice" = "1" ] && echo "katana" || echo "sepolia")",
  "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deployer": "$ACCOUNT_ADDRESS",
  "contracts": {
    "VaultManager": {
      "address": "$VAULT_ADDRESS",
      "class_hash": "$VAULT_CLASS_HASH"
    },
    "SessionKeyManager": {
      "address": "$SESSION_ADDRESS",
      "class_hash": "$SESSION_CLASS_HASH"
    },
    "PositionManager": {
      "address": "$POSITION_ADDRESS",
      "class_hash": "$POSITION_CLASS_HASH"
    },
    "RebalanceExecutor": {
      "address": "$REBALANCE_ADDRESS",
      "class_hash": "$REBALANCE_CLASS_HASH"
    }
  }
}
EOF

echo ""
echo "Contract Addresses:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat deployed_contracts.json | jq '.contracts'
echo ""
echo "📝 Deployment info saved to: deployed_contracts.json"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with contract addresses"
echo "2. Update frontend/.env with contract addresses"
echo "3. Run: ./update_env_contracts.sh"

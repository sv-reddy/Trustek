#!/bin/bash

# ============================================
# Starknet Wallet Setup Script
# Create and configure Starknet wallet
# ============================================

set -e

WALLET_DIR="$HOME/.starknet-wallets"
KEYSTORE_DIR="$WALLET_DIR/keystores"
ACCOUNT_DIR="$WALLET_DIR/accounts"

mkdir -p "$KEYSTORE_DIR"
mkdir -p "$ACCOUNT_DIR"

echo "🔐 Starknet Wallet Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Function to create keystore
create_keystore() {
    echo ""
    echo "📝 Creating new keystore..."
    echo "Enter a password for your keystore (remember this!):"
    
    KEYSTORE_PATH="$KEYSTORE_DIR/deployer_keystore.json"
    
    starkli signer keystore new "$KEYSTORE_PATH"
    
    echo "✅ Keystore created at: $KEYSTORE_PATH"
    
    # Extract public key
    echo ""
    echo "🔑 Extracting public key..."
    PUBLIC_KEY=$(starkli signer keystore inspect "$KEYSTORE_PATH" | grep "Public key:" | awk '{print $3}')
    
    echo "Your public key: $PUBLIC_KEY"
    echo "$PUBLIC_KEY" > "$WALLET_DIR/public_key.txt"
}

# Function to create account on devnet
create_devnet_account() {
    echo ""
    echo "🏗️ Creating Starknet account on devnet..."
    
    # Make sure Katana is running
    if ! curl -s http://localhost:5050 > /dev/null 2>&1; then
        echo "❌ Katana devnet is not running!"
        echo "Please start it with: ./start_devnet.sh"
        exit 1
    fi
    
    ACCOUNT_PATH="$ACCOUNT_DIR/deployer_account.json"
    KEYSTORE_PATH="$KEYSTORE_DIR/deployer_keystore.json"
    
    # Get public key
    PUBLIC_KEY=$(cat "$WALLET_DIR/public_key.txt")
    
    echo "Creating account with public key: $PUBLIC_KEY"
    
    # Initialize account (doesn't deploy yet)
    starkli account oz init \
        --keystore "$KEYSTORE_PATH" \
        "$ACCOUNT_PATH"
    
    echo "✅ Account initialized at: $ACCOUNT_PATH"
    
    # Deploy account
    echo ""
    echo "Deploying account to devnet..."
    starkli account deploy \
        --keystore "$KEYSTORE_PATH" \
        --rpc http://localhost:5050 \
        "$ACCOUNT_PATH"
    
    echo "✅ Account deployed!"
    
    # Get account address
    ACCOUNT_ADDRESS=$(starkli account fetch "$ACCOUNT_PATH" --rpc http://localhost:5050 | grep "Address:" | awk '{print $2}')
    echo "Account address: $ACCOUNT_ADDRESS"
    echo "$ACCOUNT_ADDRESS" > "$WALLET_DIR/account_address.txt"
}

# Function to create account on testnet
create_testnet_account() {
    echo ""
    echo "🌐 Creating Starknet account on Sepolia testnet..."
    
    ACCOUNT_PATH="$ACCOUNT_DIR/testnet_account.json"
    KEYSTORE_PATH="$KEYSTORE_DIR/deployer_keystore.json"
    
    # Get public key
    PUBLIC_KEY=$(cat "$WALLET_DIR/public_key.txt")
    
    echo "⚠️  Before deploying on testnet, you need testnet ETH!"
    echo "1. Go to: https://starknet-faucet.vercel.app/"
    echo "2. Get testnet ETH for address: $PUBLIC_KEY"
    echo "3. Wait for transaction to complete"
    echo ""
    read -p "Press enter when you have testnet ETH..."
    
    # Initialize account
    starkli account oz init \
        --keystore "$KEYSTORE_PATH" \
        "$ACCOUNT_PATH"
    
    # Deploy account on testnet
    starkli account deploy \
        --keystore "$KEYSTORE_PATH" \
        --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7 \
        "$ACCOUNT_PATH"
    
    echo "✅ Testnet account deployed!"
}

# Function to use pre-funded Katana account
use_katana_prefunded() {
    echo ""
    echo "💰 Setting up pre-funded Katana account..."
    
    # Katana pre-funded account details
    PREFUNDED_ADDRESS="0x6162896d1d7ab204c7ccac6dd5f8e9e7c25ecd5ae4fcb4ad32e57786bb46e03"
    PREFUNDED_PRIVATE_KEY="0x1800000000300000180000000000030000000000003006001800006600"
    
    echo "Using Katana pre-funded account:"
    echo "Address: $PREFUNDED_ADDRESS"
    echo ""
    
    # Create keystore from private key
    KEYSTORE_PATH="$KEYSTORE_DIR/katana_prefunded.json"
    
    echo "Creating keystore from pre-funded account..."
    echo "$PREFUNDED_PRIVATE_KEY" | starkli signer keystore from-key "$KEYSTORE_PATH"
    
    # Save account info
    cat > "$ACCOUNT_DIR/katana_prefunded.json" << EOF
{
    "version": 1,
    "variant": {
        "type": "open_zeppelin",
        "version": 1,
        "public_key": "$(starkli signer keystore inspect "$KEYSTORE_PATH" | grep 'Public key:' | awk '{print $3}')",
        "legacy": false
    },
    "deployment": {
        "status": "deployed",
        "class_hash": "0x05400e90f7e0ae78bd02c77cd75527280470e2fe19c54970dd79dc37a9d3645c",
        "address": "$PREFUNDED_ADDRESS"
    }
}
EOF
    
    echo "$PREFUNDED_ADDRESS" > "$WALLET_DIR/account_address.txt"
    
    echo "✅ Pre-funded account configured!"
    echo "Address: $PREFUNDED_ADDRESS"
}

# Main menu
echo "Choose wallet setup option:"
echo "1. Create new wallet (for production)"
echo "2. Use Katana pre-funded account (for quick testing)"
echo "3. Create testnet account (Sepolia)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        create_keystore
        echo ""
        read -p "Deploy to devnet (d) or testnet (t)? " network
        if [ "$network" = "d" ]; then
            create_devnet_account
        else
            create_testnet_account
        fi
        ;;
    2)
        use_katana_prefunded
        ;;
    3)
        create_keystore
        create_testnet_account
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Wallet setup complete!"
echo ""
echo "Wallet information saved to: $WALLET_DIR"
echo "Account address: $(cat $WALLET_DIR/account_address.txt 2>/dev/null || echo 'N/A')"
echo ""
echo "Next step: Run deploy_contracts.sh to deploy contracts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

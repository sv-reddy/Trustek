#!/bin/bash

# ============================================
# Start Starknet Local Devnet (Katana)
# ============================================

echo "🏗️ Starting Starknet Local Devnet (Katana)..."

# Check if Katana is already running
if curl -s http://localhost:5050 > /dev/null 2>&1; then
    echo "⚠️  Katana is already running on port 5050"
    read -p "Kill existing instance and restart? (y/n): " restart
    if [ "$restart" = "y" ]; then
        pkill -f katana
        sleep 2
    else
        echo "Exiting..."
        exit 0
    fi
fi

# Create logs directory
mkdir -p logs

echo "Starting Katana devnet..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if katana command exists
if ! command -v katana &> /dev/null; then
    echo "❌ Katana not found in PATH"
    echo "Please check your PATH includes: $HOME/.dojo/bin"
    echo "Run: export PATH=\"\$HOME/.dojo/bin:\$PATH\""
    exit 1
fi

echo "Katana path: $(which katana)"
echo "Katana version: $(katana --version 2>/dev/null || echo 'unknown')"

# Start Katana with compatible configuration
# Version 1.7.0 uses minimal flags
nohup katana > logs/katana.log 2>&1 &

KATANA_PID=$!
echo "Katana PID: $KATANA_PID"
echo $KATANA_PID > logs/katana.pid

# Wait for Katana to start with retries
echo "Waiting for Katana to start..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    sleep 2
    if curl -s http://localhost:5050 > /dev/null 2>&1; then
        echo "✅ Katana is running!"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Devnet Information:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "RPC URL: http://localhost:5050"
        echo "Chain ID: KATANA"
        echo "Block time: 6 seconds"
        echo ""
        echo "Pre-funded Accounts:"
        echo "Account #0:"
        echo "  Address: 0x6162896d1d7ab204c7ccac6dd5f8e9e7c25ecd5ae4fcb4ad32e57786bb46e03"
        echo "  Private Key: 0x1800000000300000180000000000030000000000003006001800006600"
        echo "  Balance: 1000 ETH"
        echo ""
        echo "Logs: tail -f logs/katana.log"
        echo "Stop: kill $(cat logs/katana.pid)"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        exit 0
    fi
    
    # Check if process is still running
    if ! kill -0 $KATANA_PID 2>/dev/null; then
        echo "❌ Katana process died"
        echo ""
        echo "Last 30 lines from logs/katana.log:"
        tail -n 30 logs/katana.log
        exit 1
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Retry $RETRY_COUNT/$MAX_RETRIES..."
done

echo "❌ Failed to start Katana after $MAX_RETRIES retries"
echo ""
echo "Last 30 lines from logs/katana.log:"
tail -n 30 logs/katana.log
exit 1

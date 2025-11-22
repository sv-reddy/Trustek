#!/bin/bash

# ╔════════════════════════════════════════════════════════════════╗
# ║  TrusTek Starknet Contracts - Ubuntu VM Deployment            ║
# ║  Deploys Starknet contracts only (Frontend/Backend on Windows)║
# ╚════════════════════════════════════════════════════════════════╝

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  ████████╗██████╗ ██╗   ██╗███████╗████████╗███████╗██╗  ██╗  ║
║  ╚══██╔══╝██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔════╝██║ ██╔╝  ║
║     ██║   ██████╔╝██║   ██║███████╗   ██║   █████╗  █████╔╝   ║
║     ██║   ██╔══██╗██║   ██║╚════██║   ██║   ██╔══╝  ██╔═██╗   ║
║     ██║   ██║  ██║╚██████╔╝███████║   ██║   ███████╗██║  ██╗  ║
║     ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝  ║
║                                                                ║
║     Starknet Contracts Deployment (Ubuntu VM in VMware)       ║
║     Frontend/Backend run on Windows Host                      ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Get project directory and navigate to it
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo ""
echo -e "${YELLOW}Hybrid Setup Detected:${NC}"
echo -e "  - Starknet: Ubuntu VM (this machine)"
echo -e "  - Frontend/Backend: Windows Host"
echo -e "  - Connection: VMware Network"
echo -e "  - Project Root: ${PROJECT_DIR}"
echo ""

# Change to project root
cd "$PROJECT_DIR"

# Step 1: Install Starknet Environment
echo -e "${YELLOW}[1/4]${NC} Installing Starknet development environment..."
if [ ! -f "scripts/setup_starknet.sh" ]; then
    echo -e "${RED}Error: scripts/setup_starknet.sh not found${NC}"
    echo -e "${RED}Current directory: $(pwd)${NC}"
    echo -e "${RED}Available scripts: $(ls scripts/)${NC}"
    exit 1
fi

chmod +x scripts/*.sh
./scripts/setup_starknet.sh
source ~/.bashrc

# Step 2: Start Katana Devnet
echo -e "${YELLOW}[2/4]${NC} Starting Katana devnet..."
# Make sure Katana listens on 0.0.0.0 for Windows host access
./scripts/start_devnet.sh &
KATANA_PID=$!
echo "Waiting for Katana to start..."
sleep 5

if ! curl -s http://localhost:5050 > /dev/null 2>&1; then
    echo -e "${RED}Failed to start Katana${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Katana running on 0.0.0.0:5050${NC}"

# Step 3: Setup Wallet
echo -e "${YELLOW}[3/4]${NC} Setting up Starknet wallet..."
# Use pre-funded account for quick setup
WALLET_DIR="$HOME/.starknet-wallets"
mkdir -p "$WALLET_DIR/keystores" "$WALLET_DIR/accounts"

# Auto-setup pre-funded account
cat > "$WALLET_DIR/accounts/deployer.json" << 'EOF'
{
    "version": 1,
    "variant": {
        "type": "open_zeppelin",
        "version": 1,
        "public_key": "0x640466ebd2ce505209d3e5c4494b4276ed8f1cde764d757eb48831e92b4dfa7",
        "legacy": false
    },
    "deployment": {
        "status": "deployed",
        "class_hash": "0x05400e90f7e0ae78bd02c77cd75527280470e2fe19c54970dd79dc37a9d3645c",
        "address": "0x6162896d1d7ab204c7ccac6dd5f8e9e7c25ecd5ae4fcb4ad32e57786bb46e03"
    }
}
EOF

echo "0x6162896d1d7ab204c7ccac6dd5f8e9e7c25ecd5ae4fcb4ad32e57786bb46e03" > "$WALLET_DIR/account_address.txt"
echo -e "${GREEN}✓ Wallet configured (Katana pre-funded account)${NC}"

# Step 4: Deploy Contracts
echo -e "${YELLOW}[4/4]${NC} Deploying smart contracts to Katana..."
# Run the actual deployment script
./scripts/deploy_contracts.sh << ANSWERS
1
ANSWERS

# Check if deployment was successful
if [ ! -f "deployed_contracts.json" ]; then
    echo -e "${RED}Deployment failed! Check logs/deployment.log${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Contracts deployed successfully${NC}"

# Get VM IP for Windows host access
VM_IP=$(ip addr show | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d'/' -f1 | head -n1)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✓ STARKNET DEPLOYMENT SUCCESSFUL (Ubuntu VM)        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Ubuntu VM Services:${NC}"
echo -e "  ✓ Katana Devnet:  http://0.0.0.0:5050"
echo -e "  ✓ VM IP Address:  ${VM_IP}"
echo ""
echo -e "${BLUE}Contract Addresses (deployed):${NC}"
cat deployed_contracts.json | jq -r '.contracts | to_entries[] | "  \(.key): \(.value.address)"'
echo ""
echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  NEXT: Configure Windows Host (Frontend/Backend)              ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Step 1: Copy Contract Addresses to Windows${NC}"
echo -e "  Run on Ubuntu VM:"
echo -e "    ${GREEN}cat deployed_contracts.json${NC}"
echo ""
echo -e "  Copy the output and save to Windows: ${GREEN}E:\\Build\\deployed_contracts.json${NC}"
echo ""
echo -e "${BLUE}Step 2: Update Windows .env Files${NC}"
echo -e "  Edit ${GREEN}E:\\Build\\backend\\.env${NC}:"
echo -e "    STARKNET_RPC_URL=http://${VM_IP}:5050"
echo -e "    VAULT_MANAGER_ADDRESS=<from deployed_contracts.json>"
echo -e "    SESSION_KEY_MANAGER_ADDRESS=<from deployed_contracts.json>"
echo -e "    POSITION_MANAGER_ADDRESS=<from deployed_contracts.json>"
echo -e "    REBALANCE_EXECUTOR_ADDRESS=<from deployed_contracts.json>"
echo ""
echo -e "  Edit ${GREEN}E:\\Build\\frontend\\.env${NC}:"
echo -e "    VITE_STARKNET_RPC_URL=http://${VM_IP}:5050"
echo -e "    VITE_STARKNET_NETWORK=katana"
echo -e "    VITE_VAULT_MANAGER_ADDRESS=<from deployed_contracts.json>"
echo -e "    VITE_SESSION_KEY_MANAGER_ADDRESS=<from deployed_contracts.json>"
echo -e "    VITE_POSITION_MANAGER_ADDRESS=<from deployed_contracts.json>"
echo -e "    VITE_REBALANCE_EXECUTOR_ADDRESS=<from deployed_contracts.json>"
echo ""
echo -e "${BLUE}Step 3: Start Backend on Windows${NC}"
echo -e "  Open PowerShell in E:\\Build\\backend"
echo -e "    ${GREEN}python -m venv venv${NC}"
echo -e "    ${GREEN}.\\venv\\Scripts\\Activate.ps1${NC}"
echo -e "    ${GREEN}pip install -r requirements.txt${NC}"
echo -e "    ${GREEN}uvicorn main:app --reload --host 0.0.0.0${NC}"
echo ""
echo -e "${BLUE}Step 4: Start Frontend on Windows${NC}"
echo -e "  Open PowerShell in E:\\Build\\frontend"
echo -e "    ${GREEN}npm install${NC}"
echo -e "    ${GREEN}npm run dev${NC}"
echo ""
echo -e "${BLUE}Step 5: Connect Wallet (from Windows browser)${NC}"
echo -e "  1. Install ArgentX browser extension"
echo -e "  2. Add custom network:"
echo -e "     - Name: ${GREEN}Katana Local${NC}"
echo -e "     - RPC:  ${GREEN}http://${VM_IP}:5050${NC}"
echo -e "     - Chain ID: ${GREEN}KATANA${NC}"
echo -e "  3. Import pre-funded account:"
echo -e "     - Private Key: ${GREEN}0x1800000000300000180000000000030000000000003006001800006600${NC}"
echo -e "  4. Open app: ${GREEN}http://localhost:5173${NC}"
echo -e "  5. Connect wallet and start using TrusTek!"
echo ""
echo -e "${YELLOW}Logs (Ubuntu VM):${NC}"
echo -e "  Katana:      tail -f logs/katana.log"
echo -e "  Deployment:  cat logs/deployment.log"
echo ""
echo -e "${YELLOW}Stop Katana:${NC}"
echo -e "  kill $KATANA_PID"
echo -e "  ${GREEN}# Or: pkill -f katana${NC}"
echo ""
echo -e "${YELLOW}Keep Katana Running:${NC}"
echo -e "  This terminal must stay open for Katana to run"
echo -e "  Or run in background: ${GREEN}nohup ./scripts/start_devnet.sh &${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}      Ubuntu VM Setup Complete! Continue on Windows Host      ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

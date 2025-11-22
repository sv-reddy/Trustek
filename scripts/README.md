# 🛠️ TrusTek Deployment Scripts

Automated scripts for deploying TrusTek on Ubuntu (VMware) with Starknet.

## 📜 Scripts Overview

| Script | Purpose | Time | Usage |
|--------|---------|------|-------|
| `setup_starknet.sh` | Install all Starknet tools | 10-15 min | Run once |
| `start_devnet.sh` | Start Katana local devnet | Instant | Every session |
| `setup_wallet.sh` | Create/configure wallet | 2-3 min | Run once |
| `deploy_contracts.sh` | Deploy all contracts | 2-3 min | After wallet setup |
| `update_env_contracts.sh` | Update .env files | Instant | After deployment |
| `deploy_all.sh` | **Complete automation** | 15-20 min | **Recommended for first time** |

---

## 🚀 Quick Start

### Option 1: Fully Automated (Recommended)
```bash
chmod +x scripts/*.sh
./scripts/deploy_all.sh
```
☕ Grab coffee, everything will be set up automatically!

### Option 2: Step-by-Step
```bash
# 1. Install tools
./scripts/setup_starknet.sh
source ~/.bashrc

# 2. Start devnet (keep running)
./scripts/start_devnet.sh

# 3. Setup wallet (new terminal)
./scripts/setup_wallet.sh

# 4. Deploy contracts
./scripts/deploy_contracts.sh

# 5. Update environment
./scripts/update_env_contracts.sh
```

---

## 📋 Detailed Script Documentation

### 1. `setup_starknet.sh`
**Purpose**: Install complete Starknet development environment

**What it installs:**
- Rust & Cargo
- Scarb (Cairo package manager)
- Starkli (Starknet CLI)
- Starknet Foundry (snforge)
- Katana (Local devnet)
- Node.js 20.x
- Python 3 + starknet-py

**Usage:**
```bash
./scripts/setup_starknet.sh
```

**After completion:**
```bash
source ~/.bashrc  # Reload environment
scarb --version   # Verify installation
```

---

### 2. `start_devnet.sh`
**Purpose**: Start Katana local Starknet devnet

**Configuration:**
- Host: `0.0.0.0` (accessible from host machine)
- Port: `5050`
- Accounts: 10 pre-funded accounts
- Block time: 6 seconds

**Usage:**
```bash
./scripts/start_devnet.sh
```

**Pre-funded Account #0:**
```
Address: 0x6162896d1d7ab204c7ccac6dd5f8e9e7c25ecd5ae4fcb4ad32e57786bb46e03
Private Key: 0x1800000000300000180000000000030000000000003006001800006600
Balance: 1000 ETH
```

**Stop Katana:**
```bash
kill $(cat logs/katana.pid)
```

**View logs:**
```bash
tail -f logs/katana.log
```

---

### 3. `setup_wallet.sh`
**Purpose**: Create and configure Starknet wallet

**Interactive Options:**

**Option 1: Create new wallet**
- Creates new keystore with password
- Deploys account to devnet or testnet
- More secure for production

**Option 2: Use pre-funded account** ⭐ (Recommended for testing)
- Uses Katana's pre-funded account #0
- No password needed
- Instant setup

**Option 3: Create testnet wallet**
- Requires testnet ETH from faucet
- For Sepolia testnet deployment

**Usage:**
```bash
./scripts/setup_wallet.sh
```

**Wallet files location:**
```
~/.starknet-wallets/
├── keystores/
│   ├── deployer_keystore.json
│   └── katana_prefunded.json
├── accounts/
│   ├── deployer_account.json
│   └── katana_prefunded.json
├── account_address.txt
└── public_key.txt
```

---

### 4. `deploy_contracts.sh`
**Purpose**: Declare and deploy all TrusTek contracts

**Interactive Options:**

**Option 1: Katana devnet** (Local testing)
- RPC: `http://localhost:5050`
- Fast, free, instant

**Option 2: Sepolia testnet** (Public testing)
- RPC: `https://starknet-sepolia.public.blastapi.io/rpc/v0_7`
- Requires testnet ETH
- Slower but verifiable on explorer

**Process:**
1. **Declare phase** - Register contract classes on-chain
   - VaultManager
   - SessionKeyManager
   - PositionManager
   - RebalanceExecutor

2. **Deploy phase** - Create contract instances
   - Deploy with constructor arguments
   - Link contracts together

**Usage:**
```bash
./scripts/deploy_contracts.sh
```

**Output:**
- Console: Real-time deployment status
- File: `deployed_contracts.json` (contract addresses)
- Logs: `logs/deployment.log` (detailed logs)

**Verify deployment:**
```bash
cat deployed_contracts.json | jq '.contracts'
```

---

### 5. `update_env_contracts.sh`
**Purpose**: Automatically update .env files with deployed contract addresses

**What it updates:**

**backend/.env:**
```env
VAULT_MANAGER_ADDRESS=0x...
SESSION_KEY_MANAGER_ADDRESS=0x...
POSITION_MANAGER_ADDRESS=0x...
REBALANCE_EXECUTOR_ADDRESS=0x...
STARKNET_RPC_URL=http://localhost:5050
```

**frontend/.env:**
```env
VITE_VAULT_MANAGER_ADDRESS=0x...
VITE_SESSION_KEY_MANAGER_ADDRESS=0x...
VITE_POSITION_MANAGER_ADDRESS=0x...
VITE_REBALANCE_EXECUTOR_ADDRESS=0x...
VITE_STARKNET_RPC_URL=http://localhost:5050
VITE_STARKNET_NETWORK=katana
```

**Usage:**
```bash
./scripts/update_env_contracts.sh
```

**Backups:**
- `backend/.env.backup`
- `frontend/.env.backup`

---

### 6. `deploy_all.sh` ⭐
**Purpose**: Complete automated deployment from scratch

**What it does:**
1. ✅ Installs Starknet environment
2. ✅ Starts Katana devnet
3. ✅ Configures wallet (pre-funded)
4. ✅ Deploys all contracts
5. ✅ Updates environment files
6. ✅ Sets up backend (Python venv + deps)
7. ✅ Sets up frontend (npm install)
8. ✅ Starts backend server
9. ✅ Starts frontend server
10. ✅ Shows access URLs and next steps

**Usage:**
```bash
./scripts/deploy_all.sh
```

**⏱️ Total time:** 15-20 minutes

**Result:**
- ✅ Katana running on port 5050
- ✅ Backend API running on port 8000
- ✅ Frontend app running on port 5173
- ✅ All contracts deployed
- ✅ Ready to use!

---

## 🔧 Troubleshooting

### Script won't run
```bash
chmod +x scripts/*.sh
```

### Katana fails to start
```bash
# Kill existing instance
pkill -f katana

# Check port
netstat -tuln | grep 5050

# Restart
./scripts/start_devnet.sh
```

### Deployment fails
```bash
# Check Katana is running
curl http://localhost:5050

# Check wallet balance
starkli balance \
  $(cat ~/.starknet-wallets/account_address.txt) \
  --rpc http://localhost:5050

# View detailed logs
cat logs/deployment.log
```

### Commands not found after setup
```bash
# Reload shell
source ~/.bashrc

# Or manually add to PATH
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"
export PATH="$HOME/.starkli/bin:$PATH"
export PATH="$HOME/.foundry/bin:$PATH"
export PATH="$HOME/.dojo/bin:$PATH"
```

---

## 📁 Generated Files & Folders

```
Trustek/
├── logs/
│   ├── katana.log          # Katana devnet logs
│   ├── katana.pid          # Katana process ID
│   ├── deployment.log      # Contract deployment logs
│   ├── backend.log         # Backend API logs
│   └── frontend.log        # Frontend dev server logs
├── deployed_contracts.json # Contract addresses
└── scripts/
    └── (all deployment scripts)

~/.starknet-wallets/
├── keystores/              # Private keys (encrypted)
├── accounts/               # Account configs
├── account_address.txt     # Your wallet address
└── public_key.txt         # Your public key
```

---

## 🎯 Common Workflows

### Fresh Start (First Time)
```bash
./scripts/deploy_all.sh
```

### Daily Development
```bash
# Terminal 1: Start devnet
./scripts/start_devnet.sh

# Terminal 2: Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0

# Terminal 3: Frontend
cd frontend
npm run dev -- --host 0.0.0.0
```

### Redeploy Contracts Only
```bash
# Stop and restart Katana for fresh state
pkill -f katana
./scripts/start_devnet.sh

# Deploy again
./scripts/deploy_contracts.sh
./scripts/update_env_contracts.sh

# Restart backend/frontend
```

### Deploy to Testnet
```bash
# Get testnet ETH first from faucet

# Setup testnet wallet
./scripts/setup_wallet.sh
# Choose option 3

# Deploy to testnet
./scripts/deploy_contracts.sh
# Choose option 2

# Update env files
./scripts/update_env_contracts.sh
```

---

## 📚 Additional Resources

- **Full deployment guide**: [UBUNTU_DEPLOYMENT_GUIDE.md](../UBUNTU_DEPLOYMENT_GUIDE.md)
- **Wallet connection**: [WALLET_CONNECTION_GUIDE.md](../WALLET_CONNECTION_GUIDE.md)
- **Database setup**: [SUPABASE_SETUP.md](../SUPABASE_SETUP.md)
- **Starknet docs**: https://docs.starknet.io/
- **Scarb docs**: https://docs.swmansion.com/scarb/
- **Starkli docs**: https://book.starkli.rs/

---

## ⚡ Pro Tips

1. **Use tmux/screen** for persistent sessions
   ```bash
   tmux new -s trustek
   ./scripts/start_devnet.sh
   # Detach: Ctrl+B then D
   # Reattach: tmux attach -t trustek
   ```

2. **Alias for quick access**
   ```bash
   echo 'alias trustek-start="cd ~/Trustek && ./scripts/deploy_all.sh"' >> ~/.bashrc
   ```

3. **Monitor all logs**
   ```bash
   tail -f logs/*.log
   ```

4. **Quick health check**
   ```bash
   curl http://localhost:5050 && \
   curl http://localhost:8000/health && \
   curl http://localhost:5173
   ```

---

## 🆘 Support

If you encounter issues:
1. Check script output for error messages
2. View logs in `logs/` directory
3. Verify prerequisites are installed
4. Check firewall/network settings
5. Consult the deployment guides

---

**Made with ❤️ for TrusTek on Starknet**

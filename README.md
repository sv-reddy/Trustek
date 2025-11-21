# TrusTek Fusion 🚀

**AI-Powered Voice-Controlled DeFi Agent on Starknet**

TrusTek Fusion is an intelligent financial agent that manages liquidity positions on Starknet through voice commands. It combines AI predictions (Gemini 2.5 Flash), automated trading with session keys, and verifiable ZK proofs to provide a secure, trustless DeFi experience.

## 🚀 Features

- **Voice-Controlled Trading**: Speak commands to manage your DeFi positions
- **AI-Powered Strategy**: Gemini 2.5 Flash analyzes market data and predicts optimal strategies
- **Secure Execution**: Session keys with restricted permissions for automated trading
- **Verifiable Proofs**: ZK proofs ensure transparent and trustless decision-making
- **Starknet Integration**: Direct interaction with Starknet smart contracts
- **Real-time Dashboard**: Monitor portfolio, track transactions, and view AI reasoning

## 📋 Technology Stack

| Component | Technology | Role |
|-----------|-----------|------|
| **Frontend** | React + Vite | Client interface with wallet connection and voice input |
| **Backend** | Python (FastAPI) | MCP server managing predictions and transactions |
| **Database** | Supabase | Persistent storage for users, sessions, and transactions |
| **Blockchain** | Starknet (Cairo) | Settlement layer with AA vault contracts |
| **AI** | Gemini 2.5 Flash | Market prediction and strategy engine |
| **Voice** | Web Audio API | Voice transcription and command processing |

## 🏗️ Project Structure

```
Build/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # VoiceInterface, PortfolioDashboard, AuditLog
│   │   ├── contexts/        # AuthContext, WalletContext
│   │   ├── pages/          # LoginPage, Dashboard, ProfilePage
│   │   ├── lib/            # Supabase client, API client
│   │   └── main.jsx        # Application entry
│   └── package.json        # Dependencies (React 19, Vite 7, starknetkit)
│
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # Routes: auth, voice, portfolio, transactions, session_keys
│   │   ├── services/       # gemini_service, starknet_service, contract_service
│   │   ├── db/             # supabase.py
│   │   └── config.py       # Settings & environment variables
│   ├── .venv/              # Virtual environment
│   ├── main.py             # FastAPI application
│   └── requirements.txt    # Python dependencies
│
├── database/                # Supabase PostgreSQL
│   └── schema.sql          # Tables: user_profiles, session_keys, transaction_log, market_data
│
├── contracts/               # Starknet Cairo contracts
│   ├── vault_manager.cairo         # Main vault for deposits/withdrawals
│   ├── session_key_manager.cairo   # Session key management
│   ├── position_manager.cairo      # Trading position tracking
│   └── rebalance_executor.cairo    # Automated rebalancing
│
└── .gitignore              # Git ignore patterns
```

## 📊 System Architecture

```
┌─────────────┐
│   User      │
│  (Voice)    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│              Frontend (React + Vite)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ VoiceInput   │  │ WalletConnect│  │ Dashboard │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│          Backend (FastAPI + Python)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ Gemini AI    │  │ Starknet     │  │ Supabase   ││
│  │ (Predictions)│  │ (Contracts)  │  │ (Database) ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────┐
│         Starknet Blockchain (Devnet/Testnet)        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ VaultManager │  │ SessionKey   │  │ Position   ││
│  │              │  │ Manager      │  │ Manager    ││
│  └──────────────┘  └──────────────┘  └────────────┘│
└──────────────────────────────────────────────────────┘
```

## 🛠️ Complete Setup Guide

### Prerequisites

- **Node.js** 18+ (installed: v24.11.1)
- **Python** 3.10+ (installed: v3.10.8)
- **Supabase Account** (configured)
- **Starknet Devnet** (local blockchain)
- **Gemini API Key** (for AI predictions)

---

### 1. Database Setup (Supabase)

**Already Configured:**
- URL: `https://ulfpcxrmjfmrejbtzbtm.supabase.co`
- Anon Key: Set in environment files

**Schema Deployment:**
```sql
-- Navigate to Supabase Dashboard → SQL Editor
-- Copy and run: database/schema.sql

-- Tables created:
-- • user_profiles (user data, wallet addresses)
-- • session_keys (automated trading keys)
-- • transaction_log (all blockchain transactions)
-- • market_data (price feeds and analytics)
```

**Database Schema:**
```sql
-- user_profiles
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users,
    full_name TEXT,
    phone_number TEXT UNIQUE,
    starknet_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- session_keys
CREATE TABLE session_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(user_id),
    session_key_private TEXT NOT NULL,
    expiry_timestamp TIMESTAMPTZ NOT NULL,
    permission_hash TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- transaction_log
CREATE TABLE transaction_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(user_id),
    tx_hash TEXT UNIQUE NOT NULL,
    pool_id TEXT,
    action_type TEXT,
    amount NUMERIC,
    proof_hash TEXT,
    ai_reasoning_log TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2. Backend Setup (FastAPI + Python)

```powershell
# Navigate to backend
cd backend

# Activate virtual environment
.venv\Scripts\activate

# Install dependencies (already done)
pip install -r requirements.txt

# Configure environment variables
# Edit backend/.env:
```

**Backend Environment Variables:**
```env
# Supabase
SUPABASE_URL=https://ulfpcxrmjfmrejbtzbtm.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Starknet Configuration
STARKNET_RPC_URL=http://192.168.137.128:5050
STARKNET_NETWORK=devnet
STARKNET_CHAIN_ID=0x534e5f5345504f4c4941
STARKNET_ACCOUNT_ADDRESS=0x03336ec63beae1b380da28afd835a778a31ca3ca5f0fe4372e5d0b46c9b06ef2
STARKNET_PRIVATE_KEY=0x00000000000000000000000000000000a16fdc24b58cbf87196ec961db23b709

# Contract Addresses (update after deployment)
STARKNET_VAULT_CONTRACT=0x059a47783d22aa6c69ea7726b212b07a573322e8fd3d006ae3237415314b004b
STARKNET_SESSION_KEY_CONTRACT=0x...
STARKNET_POSITION_CONTRACT=0x...
STARKNET_REBALANCE_CONTRACT=0x...

# Fee Tokens
STARKNET_ETH_TOKEN=0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7
STARKNET_STRK_TOKEN=0x4718F5A0FC34CC1AF16A1CDEE98FFB20C31F5CD61D6AB07201858F4287C938D

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

**Start Backend:**
```powershell
python main.py
# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

---

### 3. Frontend Setup (React + Vite)

```powershell
# Navigate to frontend
cd frontend

# Install dependencies (already done)
npm install

# Configure environment variables
# Edit frontend/.env:
```

**Frontend Environment Variables:**
```env
VITE_SUPABASE_URL=https://ulfpcxrmjfmrejbtzbtm.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_API_URL=http://localhost:8000
VITE_STARKNET_NETWORK=devnet
VITE_STARKNET_RPC_URL=http://192.168.137.128:5050
VITE_STARKNET_CHAIN_ID=0x534e5f5345504f4c4941
```

**Start Frontend:**
```powershell
npm run dev
# Server runs at http://localhost:5174
```

---

### 4. Starknet Devnet Setup (Ubuntu VM)

**Install & Run Devnet:**
```bash
# On Ubuntu VM
starknet-devnet --host 0.0.0.0 --port 5050 --seed 3369033984

# Devnet will run at: http://192.168.137.128:5050
# Chain ID: SN_SEPOLIA (0x534e5f5345504f4c4941)
# Predeployed accounts with 1000 ETH + 1000 STRK each
```

**Predeployed Test Account:**
```
Address:     0x03336ec63beae1b380da28afd835a778a31ca3ca5f0fe4372e5d0b46c9b06ef2
Private Key: 0x00000000000000000000000000000000a16fdc24b58cbf87196ec961db23b709
Public Key:  0x058b02ce6de5f28f51ed78569884d855373d84a5730c376f2abdbdf00d7facf4
```

---

### 5. Deploy Smart Contracts

**On Ubuntu VM:**

**Install Tools:**
```bash
# Install Scarb (Cairo compiler)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

# Install Starkli (deployment tool)
curl https://get.starkli.sh | sh
source ~/.starkli/env
starkliup

# Install Sncast (alternative)
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh
```

**Setup Account:**
```bash
# Create keystore
mkdir -p ~/.starkli-wallets/deployer
starkli signer keystore from-key ~/.starkli-wallets/deployer/keystore.json
# Enter private key: 00000000000000000000000000000000a16fdc24b58cbf87196ec961db23b709
# Set password: test

# Create account descriptor
cat > ~/.starkli-wallets/deployer/account.json << 'EOF'
{
  "version": 1,
  "variant": {
    "type": "open_zeppelin",
    "version": 1,
    "public_key": "0x058b02ce6de5f28f51ed78569884d855373d84a5730c376f2abdbdf00d7facf4"
  },
  "deployment": {
    "status": "deployed",
    "class_hash": "0x05b4b537eaa2399e3aa99c4e2e0208ebd6c71bc1467938cd52c798c601e43564",
    "address": "0x03336ec63beae1b380da28afd835a778a31ca3ca5f0fe4372e5d0b46c9b06ef2"
  }
}
EOF
```

**Deploy Contracts:**
```bash
# Transfer contracts from Windows to Ubuntu
# Copy e:\Build\contracts\*.cairo to ~/trustek_contracts/src/

# Create Scarb.toml
cat > ~/trustek_contracts/Scarb.toml << 'EOF'
[package]
name = "trustek_contracts"
version = "0.1.0"
edition = "2023_11"

[dependencies]
starknet = "2.8.2"

[[target.starknet-contract]]
EOF

# Build
cd ~/trustek_contracts
scarb build

# Deploy VaultManager
starkli declare target/dev/trustek_contracts_VaultManager.contract_class.json \
  --rpc http://localhost:5050 \
  --account ~/.starkli-wallets/deployer/account.json \
  --keystore ~/.starkli-wallets/deployer/keystore.json

# Deploy (use CLASS_HASH from above)
sncast --account deployer deploy \
  --class-hash <CLASS_HASH> \
  --url http://localhost:5050 \
  --constructor-calldata 0x03336ec63beae1b380da28afd835a778a31ca3ca5f0fe4372e5d0b46c9b06ef2

# Repeat for other contracts (SessionKeyManager, PositionManager, RebalanceExecutor)
```

**Update Backend .env with deployed addresses**

---

## 🎯 How It Works: Complete User Flow

### New User Journey

**1. User Registration & Wallet Connection**
```
User Action → Backend → Supabase → Starknet
```

- User signs up with email/phone
- Record created in `user_profiles` table
- User connects Starknet wallet (Argent X/Braavos)
- `starknet_address` updated in profile
- Wallet connection persisted in frontend context

**2. Deposit Funds to Vault**
```
User → Frontend → Starknet Contract → Backend → Supabase
```

- User deposits ETH/STRK to VaultManager contract
- Transaction broadcasted to Starknet
- Backend listens for transaction events
- Transaction logged in `transaction_log` table with:
  - `tx_hash`: Blockchain transaction hash
  - `action_type`: "deposit"
  - `amount`: Deposited amount
  - `timestamp`: When deposit occurred

**3. Create Session Key for AI Trading**
```
User → Backend → Starknet → Supabase
```

- User requests session key creation
- Backend calls SessionKeyManager contract
- Session key generated on-chain with:
  - Limited permissions (trade only, no withdrawals)
  - Expiry timestamp (e.g., 30 days)
  - Permission scope (specific pools/amounts)
- Session key stored in `session_keys` table
- AI agent can now trade on user's behalf

**4. Voice Command to Trade**
```
Voice → Frontend → Backend → Gemini AI → Starknet → Supabase
```

Detailed flow:
```
1. User speaks: "Rebalance my ETH/USDC position"
2. Frontend captures audio via Web Audio API
3. Audio sent to /api/voice/transcribe
4. Backend transcribes to text
5. Text sent to Gemini 2.5 Flash for intent extraction
6. Gemini analyzes:
   - Current market data (from market_data table)
   - User's positions (from position_manager contract)
   - Risk tolerance (from user profile)
7. Gemini returns strategy:
   - New price range (e.g., 1850-2150 USDC)
   - Confidence score
   - Reasoning/justification
8. Backend generates ZK proof of AI decision
9. Backend signs transaction with session key
10. Transaction sent to RebalanceExecutor contract
11. Contract verifies:
    - Session key is valid and not expired
    - Permissions allow this action
    - ZK proof is correct
12. Contract executes rebalance
13. Backend logs to transaction_log:
    - tx_hash
    - proof_hash
    - ai_reasoning_log (Gemini's explanation)
14. Frontend dashboard updates in real-time
```

**5. Monitor & Audit**
```
User → Frontend → Backend → Supabase
```

- Dashboard queries `/api/portfolio?user_id={id}`
- Backend fetches:
  - On-chain balances from VaultManager
  - Active positions from PositionManager
  - Transaction history from `transaction_log`
  - AI reasoning from `ai_reasoning_log` column
- User sees complete audit trail:
  - What AI decided
  - Why it made that decision
  - Proof of correctness
  - Transaction results

---

### Data Flow: Ethereum Transactions → Storage

**When user makes a transaction:**

```sql
-- 1. Transaction sent to Starknet
User clicks "Execute Trade" 
→ Frontend calls backend API
→ Backend signs with session key
→ Transaction broadcast to Starknet RPC

-- 2. Backend listens for confirmation
Transaction confirmed on-chain
→ Backend receives transaction hash
→ Backend extracts transaction details

-- 3. Store in Supabase
INSERT INTO transaction_log (
    user_id,
    tx_hash,
    pool_id,
    action_type,
    amount,
    proof_hash,
    ai_reasoning_log,
    timestamp
) VALUES (
    '76d51330-90bc-4e85-add2-45505932c782',
    '0x073a4857567f195f1062616c9d90f71ebf7fa5b89ef878e8f22ea6e95d3e04b8',
    'ETH/USDC',
    'rebalance',
    50000000000000000,
    '0xabc123...',
    'Market shows upward trend. Adjusted range to 1850-2150 for optimal fees.',
    NOW()
);

-- 4. Query from frontend
SELECT 
    tx_hash,
    action_type,
    amount,
    ai_reasoning_log,
    timestamp
FROM transaction_log
WHERE user_id = '76d51330-90bc-4e85-add2-45505932c782'
ORDER BY timestamp DESC;
```

**Backend-Supabase Connection:**

```python
# backend/app/services/contract_service.py
from app.db.supabase import get_supabase

async def log_transaction(user_id, tx_hash, action_type, amount, reasoning):
    supabase = get_supabase()
    
    # Store transaction
    response = supabase.table("transaction_log").insert({
        "user_id": user_id,
        "tx_hash": tx_hash,
        "action_type": action_type,
        "amount": amount,
        "ai_reasoning_log": reasoning,
    }).execute()
    
    return response.data

# Called after every blockchain transaction
await log_transaction(
    user_id="76d51330-90bc...",
    tx_hash="0x073a485...",
    action_type="deposit",
    amount=1000000000000000000,
    reasoning="User initiated deposit"
)
```

**Portfolio Sync:**

```python
# backend/app/api/portfolio.py
@router.get("")
async def get_portfolio(user_id: str):
    # 1. Get user's Starknet address from Supabase
    supabase = get_supabase()
    user = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
    starknet_address = user.data[0]["starknet_address"]
    
    # 2. Query on-chain balance
    from app.services.contract_service import vault_service
    vault_balance = await vault_service.get_balance(starknet_address)
    
    # 3. Query transaction history from Supabase
    transactions = supabase.table("transaction_log")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("timestamp", desc=True)\
        .execute()
    
    # 4. Combine on-chain + off-chain data
    return {
        "total_value": vault_balance,
        "starknet_address": starknet_address,
        "transactions": transactions.data,
        "positions": []  # From PositionManager contract
    }
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login existing user

### Voice Commands
- `POST /api/voice/transcribe` - Transcribe audio to text
- `POST /api/voice/execute-command` - Execute voice command

### Portfolio
- `GET /api/portfolio?user_id={id}` - Get portfolio data

### Transactions
- `GET /api/transactions?user_id={id}` - Get transaction history
- `GET /api/transactions/{tx_hash}` - Get specific transaction

### Session Keys
- `POST /api/session-key/create` - Create new session key
- `GET /api/session-key/list?user_id={id}` - List session keys
- `POST /api/session-key/revoke/{key_id}` - Revoke session key

## 🔒 Security

- **Row Level Security (RLS)** on all Supabase tables
- **Session Keys** with restricted permissions and expiry
- **ZK Proofs** for verifiable AI decisions
- **HTTPS** for all API communications
- **Environment Variables** for sensitive credentials

## 🧪 Development

### Frontend Development
```powershell
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python main.py   # Start with auto-reload in development mode
```

### Database Migrations
```sql
-- Run in Supabase SQL Editor
-- See database/schema.sql for complete schema
```

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://ulfpcxrmjfmrejbtzbtm.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_API_URL=http://localhost:8000
VITE_STARKNET_NETWORK=goerli
```

### Backend (.env)
```env
SUPABASE_URL=https://ulfpcxrmjfmrejbtzbtm.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
STARKNET_RPC_URL=your_rpc_url
STARKNET_VAULT_CONTRACT=your_contract_address
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set environment variables
3. Deploy from `frontend/` directory
4. Build command: `npm run build`
5. Output directory: `dist`

### Backend (Railway/Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy from `backend/` directory
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 📚 Additional Resources

- [Starknet Documentation](https://docs.starknet.io)
- [Supabase Documentation](https://supabase.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React + Vite Documentation](https://vitejs.dev/guide)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License

---

**Built with ❤️ using React, FastAPI, Starknet, Cairo, and Supabase**

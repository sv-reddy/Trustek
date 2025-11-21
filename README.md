# TrusTek Fusion

**Voice-Controlled Financial Agent on Starknet**

TrusTek Fusion is an AI-powered voice-controlled financial agent that manages liquidity positions on Starknet. It leverages AI prediction (Gemini 2.5 Flash), verifiable proofs (ZKML), and a modular server architecture to provide a trustless and intuitive user experience.

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
│   │   ├── components/      # UI components
│   │   ├── contexts/        # Auth and Wallet contexts
│   │   ├── lib/            # Supabase, API clients
│   │   ├── pages/          # Login, Dashboard, Profile
│   │   └── main.jsx        # Application entry
│   ├── .env                # Environment variables
│   └── package.json        # Dependencies
│
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes (auth, voice, portfolio)
│   │   ├── services/       # Gemini, Starknet services
│   │   ├── db/             # Supabase client
│   │   └── config.py       # Configuration
│   ├── .venv/              # Python virtual environment
│   ├── .env                # Environment variables
│   ├── main.py             # Application entry
│   └── requirements.txt    # Python dependencies
│
└── database/                # Supabase schema
    ├── schema.sql          # Database tables and policies
    └── README.md           # Database documentation
```

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** 18+ (we have v24.11.1)
- **Python** 3.10+ (we have v3.10.8)
- **Supabase Account** (already configured)
- **Gemini API Key** (for AI predictions)
- **Starknet Wallet** (Argent X or Braavos)

### 1. Database Setup

1. The Supabase project is already configured:
   - **URL**: `https://ulfpcxrmjfmrejbtzbtm.supabase.co`
   - **Anon Key**: Already set in `.env` files

2. Run the database schema:
   ```bash
   # Go to Supabase Dashboard → SQL Editor
   # Copy and run the contents of database/schema.sql
   ```

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd e:\Build\backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Dependencies are already installed
# If you need to reinstall:
pip install -r requirements.txt

# Update .env with your API keys
# - GEMINI_API_KEY=your_gemini_api_key
# - STARKNET_RPC_URL=your_infura_or_alchemy_url
# - STARKNET_VAULT_CONTRACT=your_deployed_contract_address

# Run the backend
python main.py
```

The backend will start at `http://localhost:8000`

### 3. Frontend Setup

```powershell
# Navigate to frontend directory
cd e:\Build\frontend

# Dependencies are already installed
# If you need to reinstall:
npm install

# Environment is already configured in .env

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`

## 🎯 How It Works

### The Voice-to-Action Flow

1. **User Onboarding**
   - Register with email and phone number
   - Connect Starknet wallet (Argent X, Braavos)
   - Create a Session Key (limited permissions for AI agent)

2. **Voice Command**
   - User clicks microphone or calls registered number
   - Audio is transcribed to text
   - Gemini AI extracts intent and target pool

3. **AI Prediction**
   - Backend fetches real-time market data
   - Gemini 2.5 Flash analyzes and predicts strategy
   - Generates ZK proof for transparent decision-making

4. **Execution**
   - Backend uses Session Key to sign transaction
   - Broadcasts to Starknet vault contract
   - Contract verifies ZK proof before executing

5. **Audit Trail**
   - Transaction and AI reasoning logged to Supabase
   - Dashboard displays real-time updates
   - User can review complete history

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

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
- Open an issue on GitHub
- Check the documentation in `database/README.md`
- Review API documentation at `http://localhost:8000/docs`

---

Built with ❤️ using React, FastAPI, Starknet, and Supabase

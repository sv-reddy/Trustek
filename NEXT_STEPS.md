# TrusTek Fusion - Next Implementation Steps

All mock data has been removed. Here's what needs to be implemented next:

## 🚀 Priority 1: Deploy Starknet Contracts

### 1.1 Build and Deploy Cairo Contracts
```bash
# Navigate to contracts directory
cd contracts

# Build contracts
scarb build

# Deploy VaultManager contract
sncast --profile devnet declare --contract-name VaultManager
sncast --profile devnet deploy --class-hash <VAULT_CLASS_HASH> --constructor-calldata <OWNER_ADDRESS>

# Deploy SessionKeyManager
sncast --profile devnet declare --contract-name SessionKeyManager
sncast --profile devnet deploy --class-hash <SESSION_CLASS_HASH>

# Deploy PositionManager
sncast --profile devnet declare --contract-name PositionManager
sncast --profile devnet deploy --class-hash <POSITION_CLASS_HASH> --constructor-calldata <VAULT_ADDRESS>

# Deploy RebalanceExecutor
sncast --profile devnet declare --contract-name RebalanceExecutor
sncast --profile devnet deploy --class-hash <REBALANCE_CLASS_HASH> --constructor-calldata <SESSION_MANAGER_ADDRESS> <POSITION_MANAGER_ADDRESS>
```

### 1.2 Update Backend Configuration
Add deployed contract addresses to `backend/.env`:
```env
STARKNET_VAULT_CONTRACT=0x...  # VaultManager address
STARKNET_SESSION_KEY_CONTRACT=0x...  # SessionKeyManager address
STARKNET_POSITION_CONTRACT=0x...  # PositionManager address
STARKNET_REBALANCE_CONTRACT=0x...  # RebalanceExecutor address
```

## 🔐 Priority 2: Implement Transaction Signing

### 2.1 Account Abstraction with starknet-py
Update `backend/app/services/contract_service.py`:

```python
from starknet_py.net.account.account import Account
from starknet_py.net.signer.stark_curve_signer import KeyPair
from starknet_py.net.full_node_client import FullNodeClient
from starknet_py.contract import Contract

async def invoke_function(
    self,
    function_name: str,
    calldata: List[str],
    account_address: str,
    private_key: str
) -> Dict:
    """Invoke a state-changing function with proper signing"""
    try:
        # Create account instance
        client = FullNodeClient(node_url=self.rpc_url)
        key_pair = KeyPair.from_private_key(int(private_key, 16))
        account = Account(
            client=client,
            address=account_address,
            key_pair=key_pair,
            chain=StarknetChainId.TESTNET
        )
        
        # Load contract ABI
        with open('contracts/target/dev/vault_manager.contract_class.json') as f:
            abi = json.load(f)['abi']
        
        # Create contract instance
        contract = Contract(
            address=self.contract_address,
            abi=abi,
            provider=account
        )
        
        # Invoke function
        invocation = await contract.functions[function_name].invoke(
            *calldata,
            max_fee=int(1e16)  # 0.01 ETH
        )
        
        # Wait for transaction
        await invocation.wait_for_acceptance()
        
        return {
            "success": True,
            "tx_hash": hex(invocation.hash),
            "status": "confirmed"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
```

### 2.2 Session Key Creation Flow
Implement in `backend/app/api/session_keys.py`:

```python
@router.post("/create")
async def create_session_key(request: CreateSessionKeyRequest):
    """Create a new session key for automated trading"""
    # 1. Generate session key pair
    from starknet_py.net.signer.stark_curve_signer import KeyPair
    session_keypair = KeyPair.generate()
    
    # 2. Call SessionKeyManager.create_session_key on-chain
    result = await session_key_service.create_session_key(
        expiry_days=request.expiry_days,
        account_address=request.user_wallet,
        private_key=request.user_private_key  # User signs with main key
    )
    
    # 3. Store encrypted session key in Supabase
    supabase.table("session_keys").insert({
        "user_id": request.user_id,
        "session_key_public": hex(session_keypair.public_key),
        "session_key_private": encrypt(hex(session_keypair.private_key)),
        "tx_hash": result["tx_hash"],
        "expiry": datetime.now() + timedelta(days=request.expiry_days)
    }).execute()
    
    return {"success": True, "tx_hash": result["tx_hash"]}
```

## 🎙️ Priority 3: Voice Transcription Service

### 3.1 Option A: OpenAI Whisper API
```python
# backend/app/services/whisper_service.py
from openai import OpenAI

class WhisperService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def transcribe(self, audio_path: str) -> str:
        with open(audio_path, 'rb') as audio_file:
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="en"
            )
        return transcript.text
```

### 3.2 Option B: Google Speech-to-Text
```python
# backend/app/services/google_speech_service.py
from google.cloud import speech

class GoogleSpeechService:
    def __init__(self):
        self.client = speech.SpeechClient()
    
    async def transcribe(self, audio_path: str) -> str:
        with open(audio_path, 'rb') as audio_file:
            content = audio_file.read()
        
        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code="en-US"
        )
        
        response = self.client.recognize(config=config, audio=audio)
        return response.results[0].alternatives[0].transcript
```

### 3.3 Update Voice API
Replace placeholder in `backend/app/api/voice.py`:
```python
from app.services.whisper_service import whisper_service

@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
        content = await audio.read()
        temp_file.write(content)
        temp_path = temp_file.name
    
    # Use real transcription service
    transcript = await whisper_service.transcribe(temp_path)
    
    # Parse intent using Gemini
    intent = await gemini_service.parse_voice_intent(transcript)
    
    os.unlink(temp_path)
    
    return {
        "transcript": transcript,
        "action": intent["action"],
        "confidence": intent["confidence"]
    }
```

## 🤖 Priority 4: Complete AI Integration

### 4.1 Enhance Gemini Service
```python
# backend/app/services/gemini_service.py

async def predict_market_sentiment(self, pair: str, market_data: dict) -> dict:
    \"\"\"Get AI prediction with real market data\"\"\"
    # Fetch real-time prices from Yahoo Finance
    prices = YahooFinanceService.get_crypto_price(pair.split('/')[0])
    
    prompt = f\"\"\"
    Analyze this market data and provide trading recommendation:
    
    Asset: {pair}
    Current Price: ${prices['price']}
    24h Change: {prices['change24h']}%
    Previous Close: ${prices['previousClose']}
    
    Market Context:
    - Volume: High/Medium/Low (analyze from on-chain data)
    - Trend: Bullish/Bearish/Sideways
    - Volatility: {calculate_volatility(prices)}%
    
    Provide:
    1. Action: BUY, SELL, or HOLD
    2. Confidence: 0-1
    3. Reasoning: Brief explanation
    4. Suggested Range: For liquidity provision (if applicable)
    \"\"\"
    
    response = await self.model.generate_content_async(prompt)
    return parse_ai_response(response.text)
```

### 4.2 ZK Proof Integration (Giza)
```python
# backend/app/services/zk_proof_service.py
from giza import GizaClient

class ZKProofService:
    def __init__(self):
        self.client = GizaClient(api_key=settings.GIZA_API_KEY)
    
    async def generate_proof(self, market_data: dict, prediction: dict) -> str:
        \"\"\"Generate ZK proof for AI prediction\"\"\"
        # Convert prediction to proof
        proof = await self.client.prove(
            model_id=settings.GIZA_MODEL_ID,
            inputs={
                "price": market_data["price"],
                "volume": market_data["volume"],
                "prediction": prediction["action"]
            }
        )
        return proof.hash
    
    async def verify_proof(self, proof_hash: str) -> bool:
        \"\"\"Verify ZK proof on-chain\"\"\"
        result = await self.client.verify(proof_hash)
        return result.valid
```

## 📊 Priority 5: Real-Time Position Tracking

### 5.1 Implement Position Fetching
```python
# backend/app/services/position_tracker.py

class PositionTracker:
    async def get_user_positions(self, user_address: str) -> List[Dict]:
        \"\"\"Fetch all positions from PositionManager contract\"\"\"
        # Query on-chain events
        positions = []
        
        # Get position count
        count_result = await position_service.call_view(
            "get_position_count",
            [user_address]
        )
        
        position_count = int(count_result["data"][0], 16)
        
        # Fetch each position
        for i in range(position_count):
            position = await position_service.get_position(
                f"{user_address}_{i}"
            )
            
            if position:
                # Enrich with market data
                position["current_value_usd"] = await calculate_position_value(position)
                position["pnl"] = await calculate_position_pnl(position)
                positions.append(position)
        
        return positions
```

## 🔄 Priority 6: Real-Time Event Listening

### 6.1 Listen to Contract Events
```python
# backend/app/services/event_listener.py

class StarknetEventListener:
    async def listen_to_vault_events(self):
        \"\"\"Listen to VaultManager events and update database\"\"\"
        from starknet_py.contract import Contract
        
        # Subscribe to Deposit events
        async for event in contract.events.Deposit.iter():
            # Update Supabase transaction log
            supabase.table("transaction_log").insert({
                "tx_hash": event.transaction_hash,
                "user_id": get_user_by_address(event.user),
                "action": "deposit",
                "amount": str(event.amount),
                "status": "confirmed",
                "timestamp": datetime.now()
            }).execute()
            
            # Update vault_balance in user_profiles
            await sync_vault_balance(event.user)
```

## 🧪 Priority 7: Testing & Deployment

### 7.1 Test Smart Contracts
```bash
# Run Cairo tests
cd contracts
scarb test

# Deploy to devnet
sncast --profile devnet deploy ...

# Test contract interactions
python backend/test_contract_integration.py
```

### 7.2 End-to-End Testing
1. ✅ User signup with wallet connection
2. ✅ Create session key
3. ✅ Deposit to vault (test on devnet)
4. ✅ Voice command → AI prediction → Execute
5. ✅ View transaction in dashboard
6. ✅ Real-time balance updates

## 📝 Environment Variables Needed

```env
# Starknet
STARKNET_RPC_URL=http://192.168.137.128:5050
STARKNET_CHAIN_ID=0x534e5f5345504f4c4941
STARKNET_VAULT_CONTRACT=0x...
STARKNET_SESSION_KEY_CONTRACT=0x...
STARKNET_POSITION_CONTRACT=0x...
STARKNET_REBALANCE_CONTRACT=0x...

# AI Services
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key  # For Whisper
GIZA_API_KEY=your_key  # For ZK proofs

# Database
SUPABASE_URL=https://ulfpcxrmjfmrejbtzbtm.supabase.co
SUPABASE_KEY=your_key

# Frontend
VITE_API_URL=http://localhost:8000
```

## 🎯 Implementation Order

1. **Week 1**: Deploy contracts, test basic functions
2. **Week 2**: Implement transaction signing, session keys
3. **Week 3**: Voice transcription + AI integration
4. **Week 4**: Real-time position tracking, event listeners
5. **Week 5**: End-to-end testing, UI polish

## 📚 Documentation to Review

- [Starknet-py Docs](https://starknetpy.readthedocs.io/)
- [Cairo Book](https://book.cairo-lang.org/)
- [Giza Documentation](https://docs.gizatech.xyz/)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)

---

**Note**: All mock data has been removed. The system now requires real contract deployments and API integrations to function.

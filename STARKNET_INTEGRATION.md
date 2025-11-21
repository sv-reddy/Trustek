# Starknet Integration Setup Guide

## Complete Flow: Braavos Wallet → Devnet → Contracts

### 1. Network Architecture

```
┌──────────────────┐
│  Braavos Wallet  │ (Browser Extension)
│  (User's Keys)   │
└────────┬─────────┘
         │
         │ Sign Transactions
         ▼
┌──────────────────┐
│  Frontend        │
│  WalletContext   │ (React App - localhost:5173)
│  executeTransaction()
└────────┬─────────┘
         │
         │ API Calls
         ▼
┌──────────────────┐
│  Backend API     │
│  FastAPI         │ (localhost:8000)
│  /api/contracts/*
└────────┬─────────┘
         │
         │ RPC Calls
         ▼
┌──────────────────┐
│  Starknet Devnet │
│  192.168.137.128 │ (Ubuntu VM)
│  Port: 5050      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Smart Contracts │
│  - VaultManager  │
│  - SessionKey    │
│  - Position      │
│  - Rebalance     │
└──────────────────┘
```

### 2. Configure Braavos for Devnet

#### Step 1: Install Braavos Extension
- Chrome Web Store: https://chrome.google.com/webstore/detail/braavos-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma
- Click "Add to Chrome"
- Create a new wallet or import existing

#### Step 2: Add Custom Network (Devnet)
1. Open Braavos extension
2. Click Settings → Networks
3. Click "Add Custom Network"
4. Enter details:
   - **Network Name**: Starknet Devnet
   - **Chain ID**: 0x534e5f5345504f4c4941 (SN_SEPOLIA)
   - **RPC URL**: http://192.168.137.128:5050
   - **Block Explorer**: (leave empty for devnet)

#### Step 3: Import Predeployed Account (For Testing)
1. Click "Add Account" → "Import Account"
2. Enter private key:
   ```
   0x00000000000000000000000000000000a16fdc24b58cbf87196ec961db23b709
   ```
3. Account address (should match):
   ```
   0x03336ec63beae1b380da28afd835a778a31ca3ca5f0fe4372e5d0b46c9b06ef2
   ```
4. This account has pre-funded ETH for testing

### 3. Frontend Integration

#### WalletContext Features
- **Auto-detection**: Checks if Braavos is installed
- **Network switching**: Automatically prompts to switch to devnet
- **Transaction signing**: `executeTransaction()` method for contract interactions
- **Event listeners**: Watches for account/network changes

#### Available Methods
```javascript
const { 
  address,           // User's Starknet address
  network,           // Current network info
  connectWallet,     // Connect to Braavos
  executeTransaction,// Sign and execute transaction
  switchToDevnet     // Switch to devnet network
} = useWallet()
```

#### Example: Deposit to Vault
```javascript
import { depositToVault, ethToWei } from '../lib/contracts'

const handleDeposit = async () => {
  const amountWei = ethToWei(0.1) // 0.1 ETH
  const result = await depositToVault(
    address, 
    amountWei, 
    executeTransaction
  )
  
  if (result.success) {
    console.log('TX Hash:', result.transaction_hash)
  }
}
```

### 4. Backend API Endpoints

#### Contract Info
```bash
GET /api/contracts/info
```
Returns deployed contract addresses and network config

#### Vault Operations
```bash
POST /api/contracts/vault/balance
{
  "user_address": "0x..."
}

POST /api/contracts/vault/deposit
{
  "user_address": "0x...",
  "amount": 100000000000000000  # Wei
}
```

#### Session Keys
```bash
POST /api/contracts/session-key/create
{
  "user_address": "0x...",
  "expiry_days": 30
}

POST /api/contracts/session-key/validate
{
  "session_key": "0x..."
}
```

#### Positions
```bash
POST /api/contracts/position/open
{
  "user_address": "0x...",
  "pool_id": "0x...",
  "amount": 1000000000000000000,
  "min_price": 1800,
  "max_price": 2200
}
```

### 5. Transaction Flow

#### User Initiates Action (e.g., Deposit)
1. **Frontend**: User clicks "Deposit" on ProfilePage
2. **API Call**: Frontend calls `/api/contracts/vault/deposit`
3. **Backend**: Returns transaction data:
   ```json
   {
     "success": true,
     "transaction": {
       "contract_address": "0x059a47...",
       "entrypoint": "deposit",
       "calldata": ["0x16345785D8A0000"]
     }
   }
   ```
4. **Wallet Signing**: Frontend calls `executeTransaction()`
5. **Braavos Popup**: User approves transaction in Braavos
6. **Execution**: Braavos signs and broadcasts to devnet
7. **Confirmation**: Transaction hash returned
8. **Database Update**: Backend logs transaction in Supabase

### 6. Environment Configuration

#### Backend `.env`
```env
# Starknet Devnet
STARKNET_RPC_URL=http://192.168.137.128:5050
STARKNET_NETWORK=devnet
STARKNET_CHAIN_ID=0x534e5f5345504f4c4941

# Deployed Contracts (update after deployment)
STARKNET_VAULT_CONTRACT=0x059a47783d22aa6c69ea7726b212b07a573322e8fd3d006ae3237415314b004b
STARKNET_SESSION_KEY_CONTRACT=0x...
STARKNET_POSITION_CONTRACT=0x...
STARKNET_REBALANCE_CONTRACT=0x...

# Predeployed Test Account
STARKNET_ACCOUNT_ADDRESS=0x03336ec63beae1b380da28afd835a778a31ca3ca5f0fe4372e5d0b46c9b06ef2
STARKNET_PRIVATE_KEY=0x00000000000000000000000000000000a16fdc24b58cbf87196ec961db23b709
```

#### Frontend `.env` (optional)
```env
VITE_STARKNET_RPC_URL=http://192.168.137.128:5050
VITE_STARKNET_CHAIN_ID=0x534e5f5345504f4c4941
```

### 7. Testing the Integration

#### Test Wallet Connection
1. Start frontend: `npm run dev`
2. Navigate to Profile page
3. Click "Connect Braavos"
4. Approve connection in Braavos popup
5. Verify address appears in UI

#### Test Contract Read (Balance)
1. After connecting wallet
2. UI automatically fetches vault balance
3. Should display "0.000000 ETH" (or current balance)

#### Test Contract Write (Deposit)
1. Enter amount (e.g., 0.01 ETH)
2. Click "Deposit"
3. Backend prepares transaction
4. Braavos popup appears
5. Approve transaction
6. Transaction hash displayed
7. Balance updates after ~2 seconds

### 8. Troubleshooting

#### Braavos Not Detected
- Check if extension is installed
- Refresh page
- Check console for `window.starknet_braavos`

#### Wrong Network
- WalletContext auto-prompts network switch
- Manually: Braavos → Settings → Networks → Switch to "Starknet Devnet"

#### RPC Connection Failed
- Verify devnet is running: `curl http://192.168.137.128:5050`
- Check firewall on Ubuntu VM
- Verify IP address is correct

#### Transaction Fails
- Check account has ETH balance
- Verify contract address is correct
- Check devnet logs on Ubuntu

### 9. Next Steps

1. **Deploy Vault Contracts**:
   ```bash
   # On Ubuntu VM
   cd /path/to/contracts
   scarb build
   sncast declare --contract target/dev/contracts_VaultManager.contract_class.json
   sncast deploy --class-hash <hash>
   ```

2. **Update Backend .env** with deployed addresses

3. **Test Full Flow**:
   - Connect wallet
   - Deposit funds
   - Create session key
   - Execute voice command
   - View transaction history

### 10. Contract Addresses (Update After Deployment)

| Contract | Address | Status |
|----------|---------|--------|
| VaultManager | `0x059a47783d...` | ✅ Deployed (HelloStarknet - placeholder) |
| SessionKeyManager | `0x...` | ⏳ Pending deployment |
| PositionManager | `0x...` | ⏳ Pending deployment |
| RebalanceExecutor | `0x...` | ⏳ Pending deployment |

---

## Summary

✅ **Completed**:
- Braavos wallet integration with auto-detection
- Network switching to devnet
- Transaction signing through Braavos
- Backend API endpoints for contract interactions
- Frontend contract utilities (`lib/contracts.js`)
- ProfilePage with deposit functionality
- Event listeners for account/network changes

⏳ **Next**:
- Deploy remaining vault contracts
- Update contract addresses in `.env`
- Test complete user flow
- Add withdraw functionality
- Implement session key creation UI

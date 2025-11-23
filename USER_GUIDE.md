# TrusTek Fusion - Web Application User Guide

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [Registration & Login](#registration--login)
3. [Dashboard Overview](#dashboard-overview)
4. [Connecting Your Wallet](#connecting-your-wallet)
5. [Managing Your Portfolio](#managing-your-portfolio)
6. [Session Keys & AI Trading](#session-keys--ai-trading)
7. [Profile Settings](#profile-settings)
8. [Logout & Security](#logout--security)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### What is TrusTek Fusion?

TrusTek Fusion is an AI-powered DeFi trading platform built on Starknet that allows you to automate your trading strategies using artificial intelligence. The platform features:

- **AI-Powered Trading**: Automated trading decisions using Gemini AI
- **Secure Session Keys**: Trade without exposing your main wallet
- **Real-Time Analytics**: Live portfolio tracking with Yahoo Finance data
- **Blockchain Security**: All trades executed on Starknet blockchain
- **Complete Transparency**: Full audit trail of all AI decisions and trades

### Requirements

Before you start, make sure you have:

- ✅ **A web browser** (Chrome, Firefox, or Edge recommended)
- ✅ **Email address** for account creation
- ✅ **Phone number** for account verification
- ✅ **ArgentX Wallet** (for Starknet blockchain interactions)
  - Download from: https://www.argent.xyz/argent-x/

---

## 📝 Registration & Login

### Creating Your Account

1. **Navigate to the Landing Page**
   - Visit the TrusTek Fusion homepage
   - Click **"Get Started Free"** or **"Sign Up"**

2. **Fill Registration Form**
   ```
   Email:        your.email@example.com
   Password:     Minimum 6 characters
   Phone Number: +1234567890 (with country code)
   ```

3. **Account Verification**
   - **Email confirmation is DISABLED** by default
   - You can login immediately after signup
   - Your account is created in the Supabase database
   - A user profile is automatically created

4. **What Happens Behind the Scenes**
   ```
   ✅ User account created in auth.users table
   ✅ User profile created in user_profiles table
   ✅ Session established with Supabase
   ✅ You're automatically logged in
   ```

### Logging In

1. **Navigate to Login Page**
   - Click **"Login"** in the top navigation
   - Or click **"Get Started"** from landing page

2. **Enter Credentials**
   ```
   Email:    your.email@example.com
   Password: Your password
   ```

3. **Login Success**
   - You'll be redirected to the Dashboard
   - Session is established and persists across browser refreshes
   - Wallet connection (if previously connected) is auto-restored

### Session Behavior

- **Session Duration**: Remains active until you manually logout
- **Auto-Login**: If you close the browser and reopen, you'll still be logged in
- **Wallet Persistence**: Wallet stays connected across sessions
- **Security**: Session tokens stored in browser's localStorage

---

## 🏠 Dashboard Overview

### Main Dashboard Sections

When you first login, you'll see the Dashboard with three main tabs:

#### 1. **Overview Tab**
   - **Wallet Connection Status**: Shows if your Starknet wallet is connected
   - **Connect Wallet Button**: If not connected, click to connect ArgentX
   - **Last Updated**: Timestamp of last data refresh

#### 2. **Market Tab**
   - **Token Portfolio Table**: Displays all supported trading pairs
   - **Real-Time Prices**: Live prices from Yahoo Finance
   - **Price Updates**: Automatic refresh every 5 minutes
   - **Manual Refresh**: Click refresh button for immediate update
   
   **Token Table Columns:**
   ```
   Asset | Symbol | Price | 24h Change | Market Cap | Contract Address
   ```
   
   **Features:**
   - ✅ Copy contract address to clipboard
   - ✅ View on Starkscan block explorer
   - ✅ See price changes (green = up, red = down)

#### 3. **Security Tab**
   - Coming soon: Security analytics and risk monitoring

### Top Navigation Bar

- **TrusTek Fusion Logo**: Click to return to landing page
- **Dashboard**: Current page
- **Profile**: Access your profile settings
- **Wallet Address** (when connected): Shows abbreviated address (0x1234...5678)
- **Logout**: Sign out and clear session

---

## 💰 Connecting Your Wallet

### Why Connect a Wallet?

Your Starknet wallet is required to:
- ✅ Deposit funds into TrusTek Fusion
- ✅ Execute trades on the blockchain
- ✅ Create session keys for AI trading
- ✅ Withdraw funds from your vault

### Step-by-Step Wallet Connection

#### Step 1: Install ArgentX

1. Download ArgentX browser extension: https://www.argent.xyz/argent-x/
2. Create a new wallet or import existing
3. Save your recovery phrase securely
4. Fund your wallet with ETH and STRK tokens

#### Step 2: Connect Wallet to TrusTek

1. **Navigate to Dashboard**
   - Login to your TrusTek account
   - Go to Overview or Market tab

2. **Click "Connect Wallet"**
   - Button located in the top-right of dashboard
   - ArgentX extension will open automatically

3. **Approve Connection**
   - ArgentX will show connection request
   - Click **"Connect"** to approve
   - Select the account you want to connect

4. **Connection Success**
   ```
   ✅ Wallet address displayed in header
   ✅ Green indicator shows "Connected"
   ✅ Address saved to your profile
   ✅ Can now access trading features
   ```

#### Step 3: Verify Connection

After connecting, you should see:
- **Wallet Address**: Displayed in top-right (e.g., `0x1234...5678`)
- **Green Dot**: Indicates active connection
- **Copy Button**: Click to copy full address

### Wallet Persistence

Your wallet connection:
- ✅ **Persists across page refreshes** - No need to reconnect every time
- ✅ **Persists across sessions** - Stays connected even after logout
- ✅ **Auto-reconnects** - Automatically reconnects when you login
- ❌ **Only disconnects** when you manually disconnect in Profile settings

### Disconnecting Your Wallet

To disconnect your wallet:

1. **Navigate to Profile**
   - Click **"Profile"** in top navigation

2. **Find Wallet Section**
   - Look for "Starknet Wallet" section
   - Shows current connection status

3. **Click "Disconnect Wallet"**
   - Confirmation dialog will appear
   - Click **"Confirm"** to disconnect
   - Wallet address removed from profile

**Note**: Disconnecting wallet does NOT log you out of your account.

---

## 📊 Managing Your Portfolio

### Viewing Token Prices

1. **Navigate to Market Tab**
   - Click **"Market"** tab in dashboard

2. **Token Portfolio Table**
   - Shows all available trading pairs:
     - **Ethereum (ETH-USD)**
     - **Starknet (STRK-USD)**
     - **Bitcoin (BTC-USD)**
     - **Polygon (MATIC-USD)**

3. **Price Information**
   ```
   Current Price: $2,345.67
   24h Change:    +2.34% (green = up, red = down)
   Market Cap:    $234.5B
   ```

4. **Real-Time Updates**
   - Prices update automatically every **5 minutes**
   - Manual refresh available (click refresh icon)
   - Console shows: "✅ Prices fetched from Yahoo Finance"
   - Next refresh countdown displayed

### Contract Addresses

Each token has two action buttons:

1. **Copy Address** (📋 icon)
   - Copies contract address to clipboard
   - Shows confirmation toast
   - Use this for manual transactions

2. **View on Explorer** (🔍 icon)
   - Opens Starkscan in new tab
   - View contract details on blockchain
   - See transaction history

### Price Caching

**Why Caching?**
- Reduces API calls to Yahoo Finance
- Faster page loads
- Prevents rate limiting

**How It Works:**
```
First Load:     Fetch fresh prices from API
Within 5 mins:  Use cached prices from localStorage
After 5 mins:   Fetch fresh prices again
Manual Refresh: Force fetch new prices immediately
```

**Cache Information:**
- Console shows: "⏱️ Using cached prices. Next refresh in X minute(s)"
- Click refresh icon to bypass cache

---

## 🤖 Session Keys & AI Trading

### What are Session Keys?

Session keys allow the AI to trade on your behalf **without requiring your wallet signature for every transaction**. Think of it as giving the AI a "limited power of attorney" to trade within specific rules you set.

### Creating a Session Key

1. **Navigate to Profile**
   - Click **"Profile"** in top navigation

2. **Find Agent Authorization Section**
   - Shows current session keys
   - Click **"+ New Session Key"**

3. **Requirements**
   - ⚠️ **Wallet must be connected first**
   - If not connected, you'll see: "Please connect your wallet first"

4. **Session Key Creation Process**
   ```
   1. Frontend calls backend API
   2. Backend generates session key pair
   3. Permission hash calculated based on your settings
   4. Session key deployed to Starknet blockchain
   5. Key stored in session_keys database table
   6. You see confirmation: "Session key created successfully!"
   ```

### Session Key Details

Each session key shows:

**Status Badge:**
- 🟢 **ACTIVE**: Currently valid and in use
- 🟠 **EXPIRED**: Past expiration date
- 🔴 **REVOKED**: Manually revoked by user

**Information Displayed:**
```
Created:     Nov 23, 2025
Expires:     Dec 23, 2025 (30 days default)
Permissions: Max 10% position shift, ETH/USDC, STRK/ETH
```

**Permission Hash:**
- Cryptographic proof of permissions
- Stored on blockchain
- Cannot be modified after creation

### Revoking a Session Key

**When to Revoke:**
- ⚠️ You want to stop AI trading
- ⚠️ Security concern or suspicious activity
- ⚠️ Want to create new key with different permissions

**How to Revoke:**
1. Find the active session key
2. Click **"Revoke"** button (red)
3. Confirm: "Are you sure you want to revoke this session key?"
4. Key marked as revoked immediately
5. AI can no longer use this key for trading

### AI Trading with Session Keys

**Once Active Session Key Exists:**

1. **AI Monitors Market**
   - Gemini AI analyzes market data every few minutes
   - Checks Yahoo Finance prices
   - Evaluates your positions

2. **AI Makes Decision**
   - Determines if rebalance is needed
   - Calculates new price range
   - Generates reasoning explanation

3. **AI Executes Trade**
   - Signs transaction with session key
   - Submits to Starknet blockchain
   - No wallet popup required (you don't have to approve)

4. **Transaction Logged**
   - Stored in transaction_log table
   - Includes AI reasoning
   - Viewable in dashboard

**Safety Features:**
- ✅ Session keys have **expiration dates**
- ✅ Limited to **specific trading pairs**
- ✅ Maximum **position size limits**
- ✅ **Cannot withdraw** funds from vault
- ✅ Can be **revoked instantly** by user

---

## ⚙️ Profile Settings

### Accessing Your Profile

Click **"Profile"** in the top navigation bar to access all settings.

### Profile Sections

#### 1. **Core Identity & Verification**

**User ID:**
- Your unique identifier in the system
- Copy button to copy full ID
- Format: UUID (e.g., `2a8fcfb3-d778-4e22-b791-f926abcb226d`)

**Starknet Wallet:**
- Shows connection status (green dot = connected)
- Full wallet address displayed
- **Connect Wallet** button if not connected
- **Disconnect Wallet** button if connected
- **Copy Address** button

**Phone Number:**
- Registered phone number
- Editable (click edit icon)
- Used for SMS notifications

**Email Address:**
- Your login email
- Cannot be changed (security)

**Account Created:**
- Timestamp of account creation
- Shows how long you've been using TrusTek

#### 2. **Agent Authorization**

**Session Keys Management:**
- Create new session keys
- View active keys
- Revoke existing keys
- See expiration dates
- View permission details

**See "Session Keys & AI Trading" section above for details**

#### 3. **Security & Recovery Controls**

**Agent Status:**
- Shows if AI agent is **Active** or **Paused**
- Toggle **Pause/Resume** button
- When paused: AI stops all trading activity
- When active: AI resumes monitoring and trading

**Disable Agent Permanently:**
- Red button: "Disable Agent Permanently"
- Use only if you want to completely stop AI features
- Requires confirmation
- Cannot be undone easily

**Two-Factor Authentication (2FA):**
- Coming soon
- Will add extra security layer
- Requires authentication app

**Active Sessions:**
- Shows how many devices you're logged in from
- "Sign Out All" button to logout from all devices

#### 4. **Portfolio & Activity Overview**

**Total Value Locked (TVL):**
- Shows total USD value in your vault
- Updates when you deposit/withdraw

**Current Positions:**
- Number of active trading positions
- Links to detailed position view

**Agent Performance (P&L):**
- Shows profit/loss percentage
- Green = positive, Red = negative

**Total Rebalances:**
- How many times AI has rebalanced your positions

**Last Agent Action:**
- Timestamp of most recent AI trade

**Transaction Log:**
- Button: "View Full Transaction Log"
- Opens complete history of all trades

#### 5. **Voice & Notification Preferences**

**Voice Language:**
- Select language for voice commands
- Options: English, Spanish, French, German, Chinese

**SMS Notifications:**
- Toggle on/off
- Receive trade notifications via SMS

**Daily Voice Summary:**
- Toggle on/off
- Get daily portfolio summary call

**Confirm High-Impact Actions:**
- Toggle on/off
- Require manual approval for large trades

#### 6. **Personalization & Display**

**Display Name:**
- Your preferred name
- Shows in dashboard
- Editable

**Profile Picture:**
- Upload custom avatar
- Click "Upload New" to change

**Theme Preference:**
- Dark mode (default)
- Light mode (coming soon)

**Dashboard Layout:**
- Compact (default)
- Detailed (shows more info)

#### 7. **Advanced / Developer Settings**

**Raw Starknet Account Address:**
- Full contract address
- Copy button
- For advanced users

**Session Key Public Key:**
- Public key of active session key
- Used for verification

**API Access:**
- Coming soon
- For programmatic access

**Contract Version:**
- Shows deployed contract version
- Example: v1.0.0

### Export Your Data

Click **"Export Data"** button (top-right of profile):
- Downloads JSON file with all your data
- Includes:
  - User profile information
  - Session keys (public info only)
  - Transaction history
  - Portfolio data
- Filename: `trustek-profile-YYYY-MM-DD.json`

---

## 🔐 Logout & Security

### How to Logout

1. **Click "Logout" in Top Navigation**
   - Located in header, next to Profile
   - Has logout icon (↗)

2. **What Happens When You Logout:**
   ```
   ✅ Supabase session cleared (server-side)
   ✅ ALL localStorage cleared
   ✅ ALL sessionStorage cleared
   ✅ ALL cookies cleared
   ✅ Page reloaded to clear React state
   ✅ Redirected to /login page
   ```

3. **Console Log Output:**
   ```
   🚪 Starting complete logout...
   🧹 Force clearing all browser storage...
   ✅ Complete logout successful!
   🔄 Forcing page reload to clear all state...
   ```

### Logout Guarantees

After logout:
- ❌ **Cannot go back** to dashboard using browser back button
- ❌ **Cannot auto-login** by clicking "Get Started"
- ❌ **No cached data** remains in browser
- ✅ **Must re-enter credentials** to access account
- ✅ **Fresh session** required

### Security Best Practices

**Keep Your Account Secure:**

1. **Use Strong Password**
   - Minimum 8 characters
   - Mix of letters, numbers, symbols
   - Don't reuse passwords

2. **Logout on Shared Computers**
   - Always logout when done
   - Don't use "Remember Me" on public computers

3. **Monitor Session Keys**
   - Review active session keys regularly
   - Revoke unused or suspicious keys
   - Set reasonable expiration dates

4. **Check Transaction Log**
   - Review AI trades frequently
   - Verify all trades are expected
   - Report suspicious activity

5. **Protect Your Wallet**
   - Never share wallet private key
   - Keep recovery phrase offline
   - Use hardware wallet if possible

6. **Enable Notifications**
   - Turn on SMS notifications for trades
   - Get alerts for large transactions
   - Monitor your email for login alerts

### Account Recovery

**If You Forget Your Password:**

1. Click "Forgot Password" on login page (coming soon)
2. Enter your registered email
3. Check email for reset link
4. Create new password
5. Login with new password

**If You Lose Access to Email:**

Contact support (coming soon) with:
- Your phone number
- Last known wallet address
- Recent transaction details

---

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. **Can't Login - "Invalid Credentials"**

**Problem:** Email/password not accepted

**Solutions:**
- ✅ Check email spelling (case-sensitive)
- ✅ Verify password is correct
- ✅ If just signed up, wait 30 seconds and try again
- ✅ Check console for: "User already registered" → use Login instead of Sign Up
- ✅ Try clearing browser cache
- ✅ Use incognito/private window

**Database Issue:**
- User may not be confirmed in auth.users table
- Run SQL in Supabase:
  ```sql
  UPDATE auth.users 
  SET confirmed_at = NOW(), email_confirmed_at = NOW() 
  WHERE email = 'your.email@example.com';
  ```

#### 2. **Stuck on "Loading TrusTek Fusion..."**

**Problem:** App doesn't load, stuck on loading screen

**Solutions:**
- ✅ Check browser console (F12) for errors
- ✅ Verify internet connection
- ✅ Check if backend is running (http://localhost:8000)
- ✅ Clear localStorage: Run in console:
  ```javascript
  localStorage.clear();
  location.reload();
  ```
- ✅ Wait 5 seconds (timeout will trigger)

**What to Look For:**
- Console should show: "🔍 Checking for existing session..."
- Then: "✅ Session found" or "ℹ️ No active session found"

#### 3. **Wallet Won't Connect**

**Problem:** ArgentX doesn't open or connection fails

**Solutions:**
- ✅ Make sure ArgentX extension is installed
- ✅ Unlock ArgentX wallet
- ✅ Refresh the page and try again
- ✅ Check console for errors:
  ```
  Look for: "Could not retrieve wallet address"
  ```
- ✅ Try disconnecting and reconnecting in ArgentX settings
- ✅ Clear browser cache and cookies

**Console Logs to Check:**
```
🔌 Connecting to wallet...
✅ Wallet connected successfully
Address: 0x1234...5678
```

#### 4. **Logout Doesn't Work**

**Problem:** After logout, still logged in or can access dashboard

**Solutions:**
- ✅ Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- ✅ Manually clear all site data:
  - Open DevTools (F12)
  - Application tab
  - Clear Storage → Clear all
- ✅ Close ALL browser tabs
- ✅ Restart browser completely
- ✅ Try different browser

**Check Console:**
```
Should see:
🚪 Starting complete logout...
✅ Complete logout successful!
```

#### 5. **Prices Not Updating**

**Problem:** Token prices stuck or not refreshing

**Solutions:**
- ✅ Click manual refresh button (↻ icon)
- ✅ Wait for 5-minute auto-refresh
- ✅ Check console for:
  ```
  ✅ Prices fetched from Yahoo Finance
  ```
  or
  ```
  ⏱️ Using cached prices. Next refresh in X minutes
  ```
- ✅ Check if backend is running
- ✅ Verify internet connection
- ✅ Clear localStorage cache

#### 6. **Session Key Creation Fails**

**Problem:** "Please connect your wallet first" or creation error

**Solutions:**
- ✅ Connect wallet first (Dashboard → Connect Wallet)
- ✅ Check wallet has sufficient funds for gas
- ✅ Verify Starknet devnet is running
- ✅ Check backend logs for errors
- ✅ Try again after 1 minute

**Backend Logs:**
```
Should see:
📝 Creating session key for user...
✅ Session key created: 0xabc123...
```

#### 7. **Profile Data Not Saving**

**Problem:** Changes to profile don't persist

**Solutions:**
- ✅ Click "Save" button after editing
- ✅ Wait for confirmation message
- ✅ Refresh page to verify changes
- ✅ Check console for errors
- ✅ Verify you're logged in
- ✅ Check Supabase connection

**Console Logs:**
```
✅ Profile updated successfully
```

#### 8. **Can't Access Dashboard After Login**

**Problem:** Redirects to login instead of dashboard

**Solutions:**
- ✅ Check if session is actually created:
  - Open DevTools → Application → Local Storage
  - Look for `sb-ulfpcxrmjfmrejbtzbtm-auth-token`
- ✅ Verify email is confirmed (if confirmation enabled)
- ✅ Check console for auth errors
- ✅ Try logout and login again
- ✅ Clear browser cache

### Getting Help

**Browser Console:**
- Press **F12** to open DevTools
- Go to **Console** tab
- Look for errors (red text)
- Copy error message for support

**Network Issues:**
- Go to **Network** tab in DevTools
- Look for failed requests (red)
- Check response status (400, 401, 500)

**Database Issues:**
- Login to Supabase Dashboard
- Go to **Authentication → Users**
- Verify your account exists
- Check **Database → user_profiles** table

**Backend Issues:**
- Check if backend is running: http://localhost:8000/docs
- View backend console logs
- Check for Python errors

### Error Messages Explained

| Error | Meaning | Solution |
|-------|---------|----------|
| `Invalid login credentials` | Wrong email/password | Check credentials, reset password |
| `Email not confirmed` | Need to verify email | Check email for confirmation link |
| `User already registered` | Email already in use | Use Login instead of Sign Up |
| `Failed to load resource: 401` | Not authenticated | Login again, check session |
| `Failed to load resource: 400` | Bad request | Check request parameters |
| `Network error` | Can't reach server | Check internet, verify backend is running |
| `signIn is not a function` | Missing auth context | Refresh page, clear cache |
| `Could not retrieve wallet address` | Wallet connection issue | Reconnect wallet, check ArgentX |

---

## 📞 Support

### Need More Help?

**Documentation:**
- Main README: `/README.md`
- Database Setup: `/database/README.md`
- API Docs: http://localhost:8000/docs (when backend running)

**Check Logs:**
- Frontend Console: F12 → Console tab
- Backend Console: Terminal running `python main.py`
- Database Logs: Supabase Dashboard → Logs

**Common Commands:**

```powershell
# Restart Frontend
cd frontend
npm run dev

# Restart Backend
cd backend
.\.venv\Scripts\Activate.ps1
python main.py

# Clear All Data
# Run in Supabase SQL Editor:
# See /database/delete_all_users.sql

# Reset Database
# Run in Supabase SQL Editor:
# See /database/reset_database.sql
```

---

## 🎓 Tips & Best Practices

### For New Users

1. **Start Small**
   - Connect wallet first
   - Deposit small amount for testing
   - Create session key with short expiration
   - Monitor AI trades closely

2. **Learn the Interface**
   - Explore all dashboard tabs
   - Read tooltips and help text
   - Check transaction log regularly
   - Understand session key permissions

3. **Security First**
   - Use strong password
   - Enable 2FA when available
   - Review session keys weekly
   - Logout on shared computers

### For Advanced Users

1. **Optimize Trading**
   - Set aggressive risk profile
   - Use multiple session keys
   - Monitor gas prices
   - Review AI reasoning logs

2. **API Access**
   - Export data regularly
   - Use developer tools
   - Integrate with external tools
   - Automate monitoring

3. **Performance**
   - Clear cache periodically
   - Use manual price refresh
   - Monitor network latency
   - Optimize gas usage

---

**Last Updated:** November 23, 2025  
**Version:** 1.0.0  
**Questions?** Check the main README.md or contact support.

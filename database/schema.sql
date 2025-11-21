-- TrusTek Fusion Database Schema for Supabase

-- ================================================
-- 1. USER PROFILES TABLE
-- ================================================
-- Links Web2 identity (phone) to Web3 identity (wallet)

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    starknet_address TEXT,
    phone_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(phone_number)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert profiles (for signup flow)
CREATE POLICY "Service role can insert profiles"
    ON user_profiles FOR INSERT
    WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_starknet_address ON user_profiles(starknet_address);


-- ================================================
-- 2. SESSION KEYS TABLE
-- ================================================
-- Stores the restricted keys used by the AI agent

CREATE TABLE IF NOT EXISTS session_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_key_private TEXT NOT NULL,
    expiry_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    permission_hash TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE session_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_keys
CREATE POLICY "Users can view own session keys"
    ON session_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session keys"
    ON session_keys FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session keys"
    ON session_keys FOR UPDATE
    USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_session_keys_user_id ON session_keys(user_id);
CREATE INDEX idx_session_keys_status ON session_keys(status);


-- ================================================
-- 3. TRANSACTION LOG TABLE
-- ================================================
-- Records every agent action for auditability

CREATE TABLE IF NOT EXISTS transaction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash TEXT UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ai_reasoning_log TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Enable Row Level Security
ALTER TABLE transaction_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transaction_log
CREATE POLICY "Users can view own transactions"
    ON transaction_log FOR SELECT
    USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_transaction_log_user_id ON transaction_log(user_id);
CREATE INDEX idx_transaction_log_timestamp ON transaction_log(timestamp DESC);
CREATE INDEX idx_transaction_log_tx_hash ON transaction_log(tx_hash);


-- ================================================
-- 4. MARKET DATA TABLE
-- ================================================
-- Temporary storage for data used in ZK proof commitment

CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_hash TEXT UNIQUE NOT NULL,
    raw_price_data JSONB NOT NULL,
    giza_model_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_timestamp TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- Index for faster lookups
CREATE INDEX idx_market_data_data_hash ON market_data(data_hash);
CREATE INDEX idx_market_data_timestamp ON market_data(timestamp DESC);


-- ================================================
-- 5. FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for session_keys
CREATE TRIGGER update_session_keys_updated_at
    BEFORE UPDATE ON session_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire session keys
CREATE OR REPLACE FUNCTION expire_session_keys()
RETURNS void AS $$
BEGIN
    UPDATE session_keys
    SET status = 'expired'
    WHERE expiry_timestamp < NOW()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- You can set up a cron job in Supabase to run this function periodically
-- Or call it from your backend


-- ================================================
-- 6. VIEWS FOR ANALYTICS
-- ================================================

-- View for active session keys count per user
CREATE OR REPLACE VIEW active_session_keys_count AS
SELECT 
    user_id,
    COUNT(*) as active_keys
FROM session_keys
WHERE status = 'active' AND expiry_timestamp > NOW()
GROUP BY user_id;

-- View for recent transactions
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
    t.id,
    t.tx_hash,
    t.user_id,
    t.action,
    t.status,
    t.timestamp,
    p.starknet_address
FROM transaction_log t
LEFT JOIN user_profiles p ON t.user_id = p.user_id
ORDER BY t.timestamp DESC;

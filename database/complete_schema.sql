CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Web3 Identity
    starknet_address TEXT,
    ethereum_address TEXT,
    
    -- Web2 Identity
    phone_number TEXT,
    phone_verified BOOLEAN DEFAULT FALSE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- User Preferences
    display_name TEXT,
    risk_profile TEXT DEFAULT 'Balanced' CHECK (risk_profile IN ('Conservative', 'Balanced', 'Aggressive')),
    max_volatility NUMERIC DEFAULT 20,
    max_rebalance_size NUMERIC DEFAULT 10,
    rebalance_frequency TEXT DEFAULT 'Only on signal',
    min_price_move NUMERIC DEFAULT 2,
    
    -- Notification Settings
    voice_language TEXT DEFAULT 'English',
    tts_enabled BOOLEAN DEFAULT FALSE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    daily_summary BOOLEAN DEFAULT FALSE,
    
    -- Agent Control
    agent_paused BOOLEAN DEFAULT FALSE,
    trading_pairs TEXT[] DEFAULT ARRAY['ETH/USDC', 'STRK/ETH'],
    
    -- Portfolio Data
    vault_balance_usd NUMERIC DEFAULT 0,
    
    -- UI Preferences
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(user_id),
    UNIQUE(phone_number),
    UNIQUE(starknet_address),
    UNIQUE(ethereum_address)
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

-- Allow service role full access for backend operations
CREATE POLICY "Service role can manage all profiles"
    ON user_profiles FOR ALL
    USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_starknet_address ON user_profiles(starknet_address);
CREATE INDEX idx_user_profiles_ethereum_address ON user_profiles(ethereum_address);
CREATE INDEX idx_user_profiles_phone_number ON user_profiles(phone_number);


-- ================================================
-- 2. SESSION KEYS TABLE
-- ================================================
-- Stores restricted keys for AI agent automation

CREATE TABLE IF NOT EXISTS session_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Key Details
    public_key TEXT NOT NULL,
    session_key_private TEXT,
    permission_hash TEXT NOT NULL,
    
    -- Status & Expiry
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    expiry_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage Tracking
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(public_key)
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

CREATE POLICY "Users can delete own session keys"
    ON session_keys FOR DELETE
    USING (auth.uid() = user_id);

-- Service role access
CREATE POLICY "Service role can manage all session keys"
    ON session_keys FOR ALL
    USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_session_keys_user_id ON session_keys(user_id);
CREATE INDEX idx_session_keys_status ON session_keys(status);
CREATE INDEX idx_session_keys_expiry ON session_keys(expiry_timestamp);
CREATE INDEX idx_session_keys_public_key ON session_keys(public_key);


-- ================================================
-- 3. TRANSACTION LOG TABLE
-- ================================================
-- Audit trail for all agent actions

CREATE TABLE IF NOT EXISTS transaction_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Transaction Details
    tx_hash TEXT,
    action TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    
    -- AI Context
    ai_reasoning_log TEXT,
    session_key_id UUID REFERENCES session_keys(id),
    
    -- Blockchain Data
    from_token TEXT,
    to_token TEXT,
    amount NUMERIC,
    gas_used NUMERIC,
    
    -- Metadata
    metadata JSONB,
    error_message TEXT,
    
    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(tx_hash)
);

-- Enable Row Level Security
ALTER TABLE transaction_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transaction_log
CREATE POLICY "Users can view own transactions"
    ON transaction_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions"
    ON transaction_log FOR ALL
    USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_transaction_log_user_id ON transaction_log(user_id);
CREATE INDEX idx_transaction_log_timestamp ON transaction_log(timestamp DESC);
CREATE INDEX idx_transaction_log_tx_hash ON transaction_log(tx_hash);
CREATE INDEX idx_transaction_log_status ON transaction_log(status);
CREATE INDEX idx_transaction_log_session_key_id ON transaction_log(session_key_id);


-- ================================================
-- 4. MARKET DATA TABLE
-- ================================================
-- Stores market data snapshots for ZK proofs

CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Data Identification
    data_hash TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'yahoo_finance',
    
    -- Price Data
    raw_price_data JSONB NOT NULL,
    
    -- ZK Proof Integration
    giza_model_id TEXT,
    proof_hash TEXT,
    
    -- Expiry
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_market_data_data_hash ON market_data(data_hash);
CREATE INDEX idx_market_data_timestamp ON market_data(timestamp DESC);
CREATE INDEX idx_market_data_source ON market_data(source);


-- ================================================
-- 5. USER SESSIONS TABLE (For Logout Tracking)
-- ================================================
-- Track user sessions separately from Supabase auth for better control

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Session Data
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    logged_out_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own sessions"
    ON user_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
    ON user_sessions FOR UPDATE
    USING (auth.uid() = user_id);

-- Service role access
CREATE POLICY "Service role can manage all sessions"
    ON user_sessions FOR ALL
    USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(active);


-- ================================================
-- 6. FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_keys_updated_at
    BEFORE UPDATE ON session_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_login_at
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles
    SET last_login_at = NOW()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Function to clean up inactive sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS void AS $$
BEGIN
    UPDATE user_sessions
    SET active = FALSE
    WHERE expires_at < NOW()
    AND active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to handle logout (revoke all user sessions)
CREATE OR REPLACE FUNCTION logout_user(p_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE user_sessions
    SET 
        active = FALSE,
        logged_out_at = NOW()
    WHERE user_id = p_user_id
    AND active = TRUE;
END;
$$ LANGUAGE plpgsql;


-- ================================================
-- 7. VIEWS FOR ANALYTICS
-- ================================================

-- Active session keys per user
CREATE OR REPLACE VIEW active_session_keys_count AS
SELECT 
    user_id,
    COUNT(*) as active_keys,
    MAX(expiry_timestamp) as latest_expiry
FROM session_keys
WHERE status = 'active' AND expiry_timestamp > NOW()
GROUP BY user_id;

-- Recent transactions with user details
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
    t.id,
    t.tx_hash,
    t.user_id,
    t.action,
    t.status,
    t.timestamp,
    t.amount,
    t.from_token,
    t.to_token,
    p.starknet_address,
    p.display_name
FROM transaction_log t
LEFT JOIN user_profiles p ON t.user_id = p.user_id
ORDER BY t.timestamp DESC;

-- User portfolio summary
CREATE OR REPLACE VIEW user_portfolio_summary AS
SELECT 
    p.user_id,
    p.starknet_address,
    p.vault_balance_usd,
    p.risk_profile,
    p.agent_paused,
    COUNT(DISTINCT sk.id) FILTER (WHERE sk.status = 'active') as active_session_keys,
    COUNT(DISTINCT t.id) as total_transactions,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'confirmed') as successful_transactions,
    MAX(t.timestamp) as last_transaction_at
FROM user_profiles p
LEFT JOIN session_keys sk ON p.user_id = sk.user_id
LEFT JOIN transaction_log t ON p.user_id = t.user_id
GROUP BY p.user_id, p.starknet_address, p.vault_balance_usd, p.risk_profile, p.agent_paused;


-- ================================================
-- 8. SCHEDULED JOBS (Supabase pg_cron)
-- ================================================
-- Note: These require pg_cron extension to be enabled in Supabase

-- Expire session keys every hour
-- SELECT cron.schedule(
--     'expire-session-keys',
--     '0 * * * *',
--     $$ SELECT expire_session_keys(); $$
-- );

-- Clean up inactive sessions daily
-- SELECT cron.schedule(
--     'cleanup-inactive-sessions',
--     '0 0 * * *',
--     $$ SELECT cleanup_inactive_sessions(); $$
-- );


-- ================================================
-- 9. INITIAL DATA / SEED DATA
-- ================================================
-- Add any default data here if needed


-- ================================================
-- COMPLETION MESSAGE
-- ================================================
DO $$
BEGIN
    RAISE NOTICE 'TrusTek Fusion database schema created successfully!';
    RAISE NOTICE 'Tables created: user_profiles, session_keys, transaction_log, market_data, user_sessions';
    RAISE NOTICE 'Views created: active_session_keys_count, recent_transactions, user_portfolio_summary';
    RAISE NOTICE 'Functions created: update_updated_at_column, expire_session_keys, cleanup_inactive_sessions, logout_user';
END $$;

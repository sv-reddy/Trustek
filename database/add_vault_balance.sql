-- Add vault balance tracking to user profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS vault_balance TEXT DEFAULT '0',
ADD COLUMN IF NOT EXISTS last_balance_sync TIMESTAMP;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_starknet_address ON user_profiles(starknet_address);
CREATE INDEX IF NOT EXISTS idx_transaction_log_user_type ON transaction_log(user_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_transaction_log_timestamp ON transaction_log(timestamp DESC);

-- Add function to update last sync time
CREATE OR REPLACE FUNCTION update_balance_sync_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_balance_sync = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update sync time
DROP TRIGGER IF EXISTS update_balance_sync ON user_profiles;
CREATE TRIGGER update_balance_sync
    BEFORE UPDATE OF vault_balance ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_balance_sync_time();

-- Add view for user portfolio summary
CREATE OR REPLACE VIEW user_portfolio_summary AS
SELECT 
    up.user_id,
    up.starknet_address,
    up.vault_balance,
    up.risk_tolerance,
    up.last_balance_sync,
    COUNT(DISTINCT tl.id) FILTER (WHERE tl.transaction_type = 'deposit') as total_deposits_count,
    COUNT(DISTINCT tl.id) FILTER (WHERE tl.transaction_type = 'withdrawal') as total_withdrawals_count,
    COUNT(DISTINCT tl.id) FILTER (WHERE tl.transaction_type = 'trade') as total_trades_count,
    COALESCE(SUM(CAST(tl.amount AS BIGINT)) FILTER (WHERE tl.transaction_type = 'deposit'), 0) as total_deposited,
    COALESCE(SUM(CAST(tl.amount AS BIGINT)) FILTER (WHERE tl.transaction_type = 'withdrawal'), 0) as total_withdrawn,
    MAX(tl.timestamp) as last_transaction_time
FROM user_profiles up
LEFT JOIN transaction_log tl ON up.user_id = tl.user_id
GROUP BY up.user_id, up.starknet_address, up.vault_balance, up.risk_tolerance, up.last_balance_sync;

COMMENT ON VIEW user_portfolio_summary IS 'Aggregated portfolio data combining Supabase and contract information';

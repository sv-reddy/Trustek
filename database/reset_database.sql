-- ================================================
-- MIGRATION SCRIPT: Reset and Rebuild Database
-- WARNING: This will DELETE ALL existing data!
-- Run this only if you want to completely reset the database
-- ================================================

BEGIN;

-- Drop all existing objects
DROP VIEW IF EXISTS user_portfolio_summary CASCADE;
DROP VIEW IF EXISTS recent_transactions CASCADE;
DROP VIEW IF EXISTS active_session_keys_count CASCADE;
DROP TRIGGER IF EXISTS update_session_keys_updated_at ON session_keys CASCADE;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS expire_session_keys() CASCADE;
DROP FUNCTION IF EXISTS cleanup_inactive_sessions() CASCADE;
DROP FUNCTION IF EXISTS logout_user(UUID) CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS transaction_log CASCADE;
DROP TABLE IF EXISTS market_data CASCADE;
DROP TABLE IF EXISTS session_keys CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

COMMIT;

-- Now run the complete_schema.sql to rebuild everything
-- You can do this manually or include it here with \i complete_schema.sql

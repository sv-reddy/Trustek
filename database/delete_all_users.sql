-- ================================================
-- COMPLETE RESET - Delete ALL Users and Data
-- Run this in Supabase SQL Editor to start fresh
-- ================================================

-- STEP 1: Delete all user profiles first (due to foreign key constraints)
DELETE FROM user_profiles;
DELETE FROM session_keys;
DELETE FROM transaction_log;
DELETE FROM market_data;
DELETE FROM user_sessions;

-- STEP 2: Delete all authentication users
-- This is the key step - users are in auth.users, not your tables!
DELETE FROM auth.users;

-- STEP 3: Verify everything is deleted
SELECT 'auth.users' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'session_keys', COUNT(*) FROM session_keys
UNION ALL
SELECT 'transaction_log', COUNT(*) FROM transaction_log
UNION ALL
SELECT 'user_sessions', COUNT(*) FROM user_sessions;

-- Expected result: all counts should be 0

-- ================================================
-- Now you can sign up fresh with the same email!
-- ================================================

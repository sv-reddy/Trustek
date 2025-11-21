-- Add service role policy to allow backend to create user profiles during signup
-- Run this in Supabase SQL Editor

CREATE POLICY "Service role can insert profiles"
    ON user_profiles FOR INSERT
    WITH CHECK (true);

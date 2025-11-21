-- Add Ethereum (MetaMask) address support
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS ethereum_address TEXT,
ADD COLUMN IF NOT EXISTS ethereum_address_updated_at TIMESTAMP;

-- Add index for Ethereum address lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_ethereum_address ON user_profiles(ethereum_address);

-- Add comment
COMMENT ON COLUMN user_profiles.ethereum_address IS 'User Ethereum wallet address from MetaMask';
COMMENT ON COLUMN user_profiles.starknet_address IS 'User Starknet wallet address from Argent X/Braavos';

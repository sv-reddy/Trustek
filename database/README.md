# TrusTek Fusion - Supabase Database Setup

## Overview

This directory contains the database schema and migration files for TrusTek Fusion's Supabase backend.

## Database Schema

The database consists of 4 main tables:

### 1. **user_profiles**
Links Web2 identity (phone) to Web3 identity (wallet).

**Columns:**
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `starknet_address`: TEXT (Wallet address)
- `phone_number`: TEXT (Registered phone number)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 2. **session_keys**
Stores the restricted keys used by the AI agent for automated trading.

**Columns:**
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `session_key_private`: TEXT (Encrypted private key)
- `expiry_timestamp`: TIMESTAMP
- `permission_hash`: TEXT (Defines permissions)
- `status`: TEXT (active, revoked, expired)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### 3. **transaction_log**
Records every agent action for auditability.

**Columns:**
- `id`: UUID (Primary Key)
- `tx_hash`: TEXT (Unique transaction hash)
- `user_id`: UUID (Foreign Key)
- `action`: TEXT (Action type)
- `ai_reasoning_log`: TEXT (AI's reasoning)
- `status`: TEXT (pending, confirmed, failed)
- `timestamp`: TIMESTAMP
- `metadata`: JSONB (Additional data)

### 4. **market_data**
Temporary storage for data used in ZK proof commitment.

**Columns:**
- `id`: UUID (Primary Key)
- `data_hash`: TEXT (Unique hash)
- `raw_price_data`: JSONB (Market data)
- `giza_model_id`: TEXT (ZK model reference)
- `timestamp`: TIMESTAMP
- `expiry_timestamp`: TIMESTAMP
- `metadata`: JSONB

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. Run the Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and run the SQL script

### 3. Configure Environment Variables

Update your backend `.env` file with:

```env
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

### 4. Enable Authentication

1. In Supabase Dashboard, go to **Authentication** > **Settings**
2. Enable Email/Password authentication
3. Configure email templates if needed

### 5. Row Level Security (RLS)

The schema includes RLS policies to ensure:
- Users can only access their own data
- Service role can access all data for backend operations

## Maintenance

### Expire Old Session Keys

Run this function periodically (can be set up as a Supabase cron job):

```sql
SELECT expire_session_keys();
```

### Clean Up Old Market Data

```sql
DELETE FROM market_data 
WHERE expiry_timestamp < NOW();
```

## Security Notes

- **NEVER** expose `SUPABASE_SERVICE_KEY` in frontend code
- Use the anon key (`SUPABASE_ANON_KEY`) in the frontend
- All sensitive operations should go through the backend API
- Session keys should be encrypted at rest in production
- Implement rate limiting on session key creation

## Backup

Supabase provides automatic backups, but for critical production data:
1. Enable point-in-time recovery in Supabase settings
2. Set up additional backups for compliance

-- Initial database schema for Goldium DeFi Hub

-- Users table (already exists)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  type VARCHAR NOT NULL, -- 'swap', 'stake', 'send', 'receive'
  from_token VARCHAR,
  to_token VARCHAR,
  amount TEXT NOT NULL,
  tx_hash VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  token_address VARCHAR NOT NULL,
  token_symbol VARCHAR NOT NULL,
  balance TEXT NOT NULL,
  usd_value TEXT,
  last_updated TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  token_symbol VARCHAR NOT NULL,
  target_price TEXT NOT NULL,
  condition VARCHAR NOT NULL, -- 'above', 'below'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active);
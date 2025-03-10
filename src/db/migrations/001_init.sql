-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE actor_status AS ENUM ('active', 'archived', 'development');
CREATE TYPE live_trade_status AS ENUM ('active', 'paused', 'stopped');
CREATE TYPE timeframe AS ENUM ('1m', '5m', '15m', '30m', '1h', '4h', 'daily', 'weekly', 'monthly');

-- actor table
CREATE TABLE actor (
  actor_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(500) NOT NULL,
  author VARCHAR(100) NOT NULL,
  version DECIMAL(3, 1) NOT NULL DEFAULT 1.0,
  status actor_status NOT NULL DEFAULT 'development',
  tags TEXT[] DEFAULT '{}',
  risk_profile JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on actor
CREATE INDEX idx_actor_name_author ON actor(name, author);
CREATE INDEX idx_actor_status ON actor(status);
CREATE INDEX idx_actor_tags ON actor USING GIN(tags);

-- actor_config table
CREATE TABLE actor_config (
  actor_config_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id VARCHAR(50) NOT NULL REFERENCES actor(actor_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  config_data JSONB NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on actor_config
CREATE INDEX idx_actor_config_actor_id ON actor_config(actor_id);
CREATE INDEX idx_actor_config_actor_default ON actor_config(actor_id, is_default);

-- Backtest result table
CREATE TABLE backtest_result (
  backtest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id VARCHAR(50) NOT NULL REFERENCES actor(actor_id) ON DELETE CASCADE,
  actor_config_id UUID NOT NULL REFERENCES actor_config(actor_config_id) ON DELETE CASCADE,
  timeframe timeframe NOT NULL,
  market VARCHAR(50) NOT NULL,
  symbols TEXT[] NOT NULL,
  date_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
  date_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
  performance JSONB NOT NULL,
  trades JSONB NOT NULL,
  execution_time DECIMAL(10, 2) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on backtest_result
CREATE INDEX idx_backtest_result_actor_id ON backtest_result(actor_id);
CREATE INDEX idx_backtest_result_actor_config_id ON backtest_result(actor_config_id);
CREATE INDEX idx_backtest_result_executed_at ON backtest_result(executed_at);
CREATE INDEX idx_backtest_result_market ON backtest_result(market);

-- Live trade table
CREATE TABLE live_trade (
  live_trade_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id VARCHAR(50) NOT NULL REFERENCES actor(actor_id) ON DELETE CASCADE,
  actor_config_id UUID NOT NULL REFERENCES actor_config(actor_config_id) ON DELETE CASCADE,
  status live_trade_status NOT NULL DEFAULT 'stopped',
  exchange VARCHAR(100) NOT NULL,
  account VARCHAR(100) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  statistics JSONB NOT NULL DEFAULT '{}'::JSONB,
  active_trades JSONB NOT NULL DEFAULT '[]'::JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on live_trade
CREATE INDEX idx_live_trade_actor_id ON live_trade(actor_id);
CREATE INDEX idx_live_trade_actor_config_id ON live_trade(actor_config_id);
CREATE INDEX idx_live_trade_status ON live_trade(status);
CREATE INDEX idx_live_trade_exchange_account ON live_trade(exchange, account);

-- Add trigger for updated_at column
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_timestamp_actor
BEFORE UPDATE ON actor
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_timestamp_actor_config
BEFORE UPDATE ON actor_config
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
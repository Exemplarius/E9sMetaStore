-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE actor_status AS ENUM ('active', 'archived', 'development');
CREATE TYPE live_trade_status AS ENUM ('active', 'paused', 'stopped');
CREATE TYPE timeframe AS ENUM ('1m', '5m', '15m', '30m', '1h', '4h', 'daily', 'weekly', 'monthly');

-- Actors table
CREATE TABLE actors (
  actor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create index on actors
CREATE INDEX idx_actors_name_author ON actors(name, author);
CREATE INDEX idx_actors_status ON actors(status);
CREATE INDEX idx_actors_tags ON actors USING GIN(tags);

-- Parameters table
CREATE TABLE parameters (
  parameter_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES actors(actor_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  parameters JSONB NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on parameters
CREATE INDEX idx_parameters_actor_id ON parameters(actor_id);
CREATE INDEX idx_parameters_actor_default ON parameters(actor_id, is_default);

-- Backtest results table
CREATE TABLE backtest_results (
  backtest_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES actors(actor_id) ON DELETE CASCADE,
  parameter_id UUID NOT NULL REFERENCES parameters(parameter_id) ON DELETE CASCADE,
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

-- Create index on backtest_results
CREATE INDEX idx_backtest_results_actor_id ON backtest_results(actor_id);
CREATE INDEX idx_backtest_results_parameter_id ON backtest_results(parameter_id);
CREATE INDEX idx_backtest_results_executed_at ON backtest_results(executed_at);
CREATE INDEX idx_backtest_results_market ON backtest_results(market);

-- Live trading table
CREATE TABLE live_trades (
  live_trade_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES actors(actor_id) ON DELETE CASCADE,
  parameter_id UUID NOT NULL REFERENCES parameters(parameter_id) ON DELETE CASCADE,
  status live_trade_status NOT NULL DEFAULT 'stopped',
  exchange VARCHAR(100) NOT NULL,
  account VARCHAR(100) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  statistics JSONB NOT NULL DEFAULT '{}'::JSONB,
  active_trades JSONB NOT NULL DEFAULT '[]'::JSONB,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on live_trades
CREATE INDEX idx_live_trades_actor_id ON live_trades(actor_id);
CREATE INDEX idx_live_trades_status ON live_trades(status);
CREATE INDEX idx_live_trades_exchange_account ON live_trades(exchange, account);

-- Add trigger for updated_at column
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER set_timestamp_actors
BEFORE UPDATE ON actors
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER set_timestamp_parameters
BEFORE UPDATE ON parameters
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
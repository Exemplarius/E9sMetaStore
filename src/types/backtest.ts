export type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | 'daily' | 'weekly' | 'monthly';

export interface Trade {
  symbol: string;
  entryDate: Date | string;
  entryPrice: number;
  exitDate: Date | string;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface Performance {
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  profitFactor: number;
}

export interface BacktestResult {
  backtest_id: string;
  actor_id: string;
  actor_config_id: string;
  timeframe: TimeFrame;
  market: string;
  symbols: string[];
  date_range_start: Date;
  date_range_end: Date;
  performance: Performance;
  trades: Trade[];
  execution_time: number;
  executed_at: Date;
}

export interface CreateBacktestResultDto {
  actor_id: string;
  actor_config_id: string;
  timeframe: TimeFrame;
  market: string;
  symbols: string[];
  date_range_start: Date | string;
  date_range_end: Date | string;
  performance: Performance;
  trades: Trade[];
  execution_time: number;
}

export interface BacktestFilters {
  actor_id?: string;
  actor_config_id?: string;
  timeframe?: TimeFrame;
  market?: string;
  executed_after?: Date | string;
  executed_before?: Date | string;
  page?: number;
  limit?: number;
}
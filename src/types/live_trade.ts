export type LiveTradeStatus = 'active' | 'paused' | 'stopped';

export interface ActiveTrade {
  symbol: string;
  entryDate: Date | string;
  entryPrice: number;
  quantity: number;
  currentPrice: number;
  unrealizedPnL: number;
}

export interface Statistics {
  tradesExecuted: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  currentDrawdown: number;
}

export interface LiveTrade {
  live_trade_id: string;
  actor_id: string;
  parameter_id: string;
  status: LiveTradeStatus;
  exchange: string;
  account: string;
  started_at: Date;
  statistics: Statistics;
  active_trades: ActiveTrade[];
  last_updated: Date;
}

export interface CreateLiveTradeDto {
  actor_id: string;
  parameter_id: string;
  status?: LiveTradeStatus;
  exchange: string;
  account: string;
  statistics?: Statistics;
  active_trades?: ActiveTrade[];
}

export interface UpdateLiveTradeDto {
  status?: LiveTradeStatus;
  statistics?: Statistics;
  active_trades?: ActiveTrade[];
}

export interface LiveTradeFilters {
  actor_id?: string;
  parameter_id?: string;
  status?: LiveTradeStatus;
  exchange?: string;
  account?: string;
  page?: number;
  limit?: number;
}
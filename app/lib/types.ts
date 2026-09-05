// This file defines the shape of our data - like a blueprint

export interface User {
  id: string;
  email: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  added_at: string;
  order_index: number;
}

export interface StockSnapshot {
  symbol: string;
  price: number;
  change_percent: number;
  volume: number;
  avg_volume: number;
  sector: string;
  timestamp: string;
  source: string;
}

export interface Signal {
  id: string;
  user_id: string;
  symbol: string;
  attention_score: number;
  context_classification: 'company_specific' | 'sector_wide' | 'market_wide' | 'uncertain';
  explanation: string;
  created_at: string;
  reviewed: boolean;
  reviewed_at?: string;
  snoozed_until?: string;
}
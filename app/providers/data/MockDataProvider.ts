import { StockSnapshot } from '@/app/lib/types';

// Default watchlist stocks for demo
export const DEFAULT_WATCHLIST = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology' },
  { symbol: 'INFY', name: 'Infosys', sector: 'Technology' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automotive' },
  { symbol: 'ZOMATO', name: 'Zomato', sector: 'Consumer' },
];

// Mock market data generator
export class MockDataProvider {
  private snapshots: Map<string, StockSnapshot> = new Map();
  private lastUpdate: Date = new Date();

  constructor() {
    this.generateInitialData();
  }

  private generateInitialData() {
    const now = new Date().toISOString();
    
    DEFAULT_WATCHLIST.forEach((stock) => {
      const basePrice = this.getBasePrice(stock.symbol);
      const changePercent = this.getRandomChange(stock.symbol);
      const price = basePrice * (1 + changePercent / 100);
      
      this.snapshots.set(stock.symbol, {
        symbol: stock.symbol,
        price: Math.round(price * 100) / 100,
        change_percent: Math.round(changePercent * 100) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        avg_volume: Math.floor(Math.random() * 8000000) + 2000000,
        sector: stock.sector,
        timestamp: now,
        source: 'Mock Market Data'
      });
    });
  }

  private getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      'RELIANCE': 2500,
      'TCS': 3800,
      'INFY': 1600,
      'HDFCBANK': 1600,
      'ICICIBANK': 1100,
      'TATAMOTORS': 900,
      'ZOMATO': 150,
    };
    return prices[symbol] || 1000;
  }

  private getRandomChange(symbol: string): number {
    const volatility: Record<string, number> = {
      'RELIANCE': 2,
      'TCS': 1.5,
      'INFY': 2.5,
      'HDFCBANK': 1.8,
      'ICICIBANK': 2.2,
      'TATAMOTORS': 4,
      'ZOMATO': 5,
    };
    const vol = volatility[symbol] || 2;
    return (Math.random() - 0.5) * 2 * vol;
  }

  // Get all stock snapshots
  getSnapshots(): StockSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  // Get a single stock snapshot
  getSnapshot(symbol: string): StockSnapshot | undefined {
    return this.snapshots.get(symbol);
  }

  // Refresh data with new random changes
  refreshData() {
    const now = new Date().toISOString();
    this.snapshots.forEach((snapshot, symbol) => {
      const changePercent = this.getRandomChange(symbol);
      const newPrice = snapshot.price * (1 + changePercent / 100);
      
      this.snapshots.set(symbol, {
        ...snapshot,
        price: Math.round(newPrice * 100) / 100,
        change_percent: Math.round(changePercent * 100) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        timestamp: now,
      });
    });
    this.lastUpdate = new Date();
  }

  getLastUpdateTime(): Date {
    return this.lastUpdate;
  }
}

// Create a singleton instance
export const mockDataProvider = new MockDataProvider();
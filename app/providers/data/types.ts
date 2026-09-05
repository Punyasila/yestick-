import { StockSnapshot } from '@/app/lib/types'; 
 
export interface DataProvider { 
  getSnapshots(): StockSnapshot[]; 
  getSnapshot(symbol: string): StockSnapshot | undefined; 
  refreshData(): void; 
  getLastUpdateTime(): Date; 
} 

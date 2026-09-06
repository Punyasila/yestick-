'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
  const router = useRouter();
  const [ticker, setTicker] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  // REALISTIC SIMULATED PRICES (100% reliable, no API needed!)
  const fetchPrices = async () => {
    if (watchlist.length === 0) return;
    setLoadingPrices(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const realisticPrices: Record<string, string> = {
      AAPL: "$185.50",
      TSLA: "$245.20",
      GOOGL: "$175.30",
      MSFT: "$415.80",
      AMZN: "$185.75",
      NVDA: "$118.60",
      META: "$510.90",
      NFLX: "$650.40",
      INFY: "$18.20",
      RELIANCE: "$2,950.00",
    };

    const newPrices: Record<string, string> = {};
    for (const t of watchlist) {
      // If the ticker is in our list, use that price, otherwise give a random one
      newPrices[t] = realisticPrices[t] || `$${(Math.random() * 400 + 100).toFixed(2)}`;
    }

    setPrices(newPrices);
    setLoadingPrices(false);
  };

  const addTicker = async () => {
    const trimmedTicker = ticker.toUpperCase().trim();
    if (!trimmedTicker || watchlist.includes(trimmedTicker)) return;

    setWatchlist([...watchlist, trimmedTicker]);
    setTicker('');
  };

  const handleLogout = () => {
    localStorage.removeItem('yestick_user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Yestick Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </nav>
      
      <main className="p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">My Watchlist</h2>
        
        <div className="flex gap-2 mb-6">
          <Input 
            placeholder="Enter ticker (e.g., AAPL)" 
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={addTicker}>Add Ticker</Button>
          <Button onClick={fetchPrices} variant="outline" disabled={loadingPrices}>
            {loadingPrices ? 'Fetching...' : 'Fetch Prices'}
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
          {watchlist.length === 0 ? (
            <p className="p-6 text-gray-500">Your watchlist is empty. Add a ticker above!</p>
          ) : (
            watchlist.map((t) => (
              <div key={t} className="flex justify-between items-center p-4">
                <span className="font-mono font-bold">{t}</span>
                <span className="font-mono text-lg text-green-600">
                  {prices[t] || '--'}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
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
  const [error, setError] = useState<string | null>(null);

  // Fetch real prices from Yahoo Finance
  const fetchPrices = async () => {
    if (watchlist.length === 0) return;
    setLoadingPrices(true);
    setError(null);

    try {
      const newPrices: Record<string, string> = {};
      
      for (const t of watchlist) {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${t}?interval=1d&range=1d`
        );
        
        if (!response.ok) {
          newPrices[t] = 'N/A';
          continue;
        }

        const data = await response.json();
        
        const result = data.chart?.result?.[0];
        const price = result?.meta?.regularMarketPrice;

        if (price) {
          newPrices[t] = `$${price.toFixed(2)}`;
        } else {
          newPrices[t] = 'N/A';
        }
      }

      setPrices(newPrices);
    } catch (err) {
      setError('Failed to fetch stock prices. Please try again.');
    } finally {
      setLoadingPrices(false);
    }
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

        {error && <p className="text-red-500 mb-4">{error}</p>}

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
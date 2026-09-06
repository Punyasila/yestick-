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

  // Generate a fake, realistic price locally. NO NETWORK REQUIRED.
  const fetchPrices = async () => {
    if (watchlist.length === 0) return;
    setLoadingPrices(true);
    setError(null);

    // Simulate a tiny delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const newPrices: Record<string, string> = {};
    
    // Give every ticker a random price between $100 and $500
    for (const t of watchlist) {
      const randomPrice = (Math.random() * 400 + 100).toFixed(2);
      newPrices[t] = `$${randomPrice}`;
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
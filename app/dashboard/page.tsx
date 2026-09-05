'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/auth/SupabaseAuthProvider';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ticker, setTicker] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // 1. Check if user is logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

    // Fetch user's watchlist from Supabase
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) return;
      
      // Use try-catch so it NEVER hangs
      try {
        const { data } = await supabase
          .from('watchlist')
          .select('ticker')
          .eq('user_id', user.id);
        
        if (data) {
          setWatchlist(data.map(item => item.ticker));
        }
      } catch (error) {
        console.error("Failed to fetch watchlist", error);
      }
    };
    fetchWatchlist();
  }, [user]);

  // 3. Fetch REAL data from the API
  const fetchPrices = async () => {
    if (watchlist.length === 0) return;
    setLoadingPrices(true);
    setError(null);

    try {
      const newData: Record<string, any> = {};
      
      for (const t of watchlist) {
        const response = await fetch(`/api/stock?symbol=${t}`);
        const result = await response.json();
        
        if (result.price) {
          newData[t] = result;
        } else {
          newData[t] = { price: null, error: 'Market closed or symbol invalid' };
        }
      }

      setData(newData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to fetch market data. Please check network.');
    } finally {
      setLoadingPrices(false);
    }
  };

  const addTicker = async () => {
    const trimmedTicker = ticker.toUpperCase().trim();
    if (!trimmedTicker || watchlist.includes(trimmedTicker)) return;

    setWatchlist([...watchlist, trimmedTicker]);
    setTicker('');

    if (user) {
      await supabase.from('watchlist').insert([
        { user_id: user.id, ticker: trimmedTicker }
      ]);
    }
  };

  const removeTicker = async (tickerToRemove: string) => {
    setWatchlist(watchlist.filter(t => t !== tickerToRemove));
    setData(prev => {
      const newData = {...prev};
      delete newData[tickerToRemove];
      return newData;
    });

    if (user) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('ticker', tickerToRemove);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Dashboard...</div>;
  }

  // 4. Calculate days since last check (Simple edge case handling)
  const getDaysSinceLastCheck = () => {
    const last = localStorage.getItem('lastCheckDate');
    if (!last) return 0;
    const diff = Math.floor((Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Yestick Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </nav>
      
      <main className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">My Watchlist</h2>
          {lastUpdated && <span className="text-sm text-gray-500">Updated: {lastUpdated}</span>}
        </div>
        
        <div className="flex gap-2 mb-6">
          <Input 
            placeholder="Enter ticker (e.g., AAPL)" 
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={addTicker}>Add Ticker</Button>
          <Button onClick={fetchPrices} variant="outline" disabled={loadingPrices}>
            {loadingPrices ? 'Fetching...' : 'Fetch Market Data'}
          </Button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
          {watchlist.length === 0 ? (
            <p className="p-6 text-gray-500">Your watchlist is empty. Add a ticker above!</p>
          ) : (
            watchlist.map((t) => {
              const stockData = data[t];
              const changePercent = stockData?.changePercent;
              const isPositive = changePercent > 0;
              const isNegative = changePercent < 0;

              return (
                <div key={t} className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold">{t}</span>
                    {stockData?.price && (
                      <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}>
                        {isPositive ? '▲' : isNegative ? '▼' : '•'} {Math.abs(changePercent).toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-lg">
                      {stockData?.price ? `$${stockData.price.toFixed(2)}` : stockData?.error || '--'}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => removeTicker(t)} className="text-red-500 hover:text-red-700">X</Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. Originiality: The "Briefing" section */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-bold text-blue-800 mb-2">Your Smart Briefing</h3>
          <p className="text-blue-700">
            {watchlist.length === 0 ? (
              'Add tickers to generate a personalized briefing.'
            ) : (
              <>
                You checked your watchlist {getDaysSinceLastCheck()} day(s) ago. 
                {Object.keys(data).length > 0 && (
                  <> The biggest mover is <b>{Object.keys(data).reduce((a, b) => Math.abs(data[a]?.changePercent || 0) > Math.abs(data[b]?.changePercent || 0) ? a : b)}</b>.</>
                )}
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
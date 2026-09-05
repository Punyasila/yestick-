'use client';

import { useAuth } from './providers/auth/SupabaseAuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Yestick
          <span className="text-gray-400 text-2xl block mt-1">Markets, since you last checked</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A calm, intelligent briefing on what changed in your watchlist since your last visit.
        </p>
        <div className="space-x-4">
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline">Create Account</Button>
          </Link>
        </div>
        <div className="mt-12 text-sm text-gray-400">
          No spam. No noise. Just what deserves your attention.
        </div>
      </div>
    </div>
  );
}
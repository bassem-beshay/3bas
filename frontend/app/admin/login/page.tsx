'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemo = () => {
    setEmail('admin@noire.studio');
    setPassword('admin123456');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email.trim(), password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-block">
          <span className="text-3xl font-serif tracking-[0.4em] uppercase text-white">
            NOIRÉ
          </span>
        </Link>
        <h2 className="text-xs font-semibold tracking-luxury uppercase text-noir-400">
          Merchant Portal & Brand Administration
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white text-noir-900 p-8 sm:p-10 border border-noir-200 shadow-2xl space-y-6">
          {/* Demo quick login card */}
          <div className="bg-noir-50 p-4 border border-noir-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-noir-950 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Brand Access</span>
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-medium text-noir-950 underline hover:text-noir-600"
              >
                Auto-fill
              </button>
            </div>
            <p className="text-noir-500 text-[11px]">
              Email: <span className="font-mono text-noir-900">admin@noire.studio</span><br />
              Password: <span className="font-mono text-noir-900">admin123456</span>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium uppercase tracking-wider text-noir-700 mb-1">
                Merchant Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@noire.studio"
                className="w-full bg-white border border-noir-200 px-3.5 py-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
              />
            </div>

            <div>
              <label className="block font-medium uppercase tracking-wider text-noir-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-noir-200 px-3.5 py-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full tracking-luxury text-xs py-4 flex items-center justify-center gap-2"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-noir-100 text-center">
            <Link href="/" className="text-[11px] text-noir-500 hover:text-noir-900 uppercase tracking-widest">
              ← Return to Live Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

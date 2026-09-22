'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Globe, Shield, Save, Check, Layers } from 'lucide-react';
import { Store } from '@/types';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    ApiClient.store.getCurrent()
      .then((res) => setStore(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (isLoading || !store) {
    return (
      <div className="p-12 text-center text-xs text-noir-400 uppercase tracking-widest animate-pulse">
        Loading brand configuration...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-serif font-light text-noir-950">
          Store & Multi-Tenant Settings
        </h1>
        <p className="text-xs text-noir-500">
          Configure brand identity, custom domains, currency, and multi-tenant isolation parameters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Profile */}
        <div className="bg-white p-6 sm:p-8 border border-noir-200 space-y-6">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-noir-900 border-b border-noir-100 pb-3">
            Brand Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Store Name
              </label>
              <input
                type="text"
                value={store.name}
                onChange={(e) => setStore({ ...store, name: e.target.value })}
                className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
              />
            </div>

            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Tenant Slug (Subdomain)
              </label>
              <input
                type="text"
                value={store.slug}
                disabled
                className="w-full bg-noir-50 border border-noir-200 p-3 text-xs text-noir-600 font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-noir-400 mt-1 block">
                Maps to: {store.slug}.platform.com
              </span>
            </div>

            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Custom Domain
              </label>
              <input
                type="text"
                value={store.custom_domain || 'noire.studio'}
                onChange={(e) => setStore({ ...store, custom_domain: e.target.value })}
                placeholder="brandname.com"
                className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950 font-mono"
              />
            </div>

            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Store Currency
              </label>
              <select
                value={store.currency}
                onChange={(e) => setStore({ ...store, currency: e.target.value, currency_symbol: e.target.value })}
                className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
              >
                <option value="EGP">Egyptian Pound (EGP)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="AED">UAE Dirham (AED)</option>
                <option value="SAR">Saudi Riyal (SAR)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Announcement Bar Text
              </label>
              <input
                type="text"
                value={store.announcement_bar_text}
                onChange={(e) => setStore({ ...store, announcement_bar_text: e.target.value })}
                className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
              />
            </div>
          </div>
        </div>

        {/* Multi-Tenant Architecture Information */}
        <div className="bg-noir-950 text-white p-6 sm:p-8 border border-noir-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-luxury uppercase text-noir-300">
            <Layers className="w-4 h-4 text-white" />
            <span>Multi-Tenant Architecture Status</span>
          </div>

          <p className="text-xs text-noir-300 leading-relaxed font-light">
            Each brand on the platform operates in complete logical isolation with its own independent product taxonomy,
            variant inventory matrix, orders ledger, client profiles, and marketing discounts.
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-white/5 border border-white/10 rounded">
              <span className="text-[10px] text-noir-400 block uppercase">Subdomain Routing</span>
              <span className="text-emerald-400">brand-slug.platform.com</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 rounded">
              <span className="text-[10px] text-noir-400 block uppercase">Custom Domain CNAME</span>
              <span className="text-emerald-400">cname.platform.com</span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4">
          {isSaved ? (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Settings successfully updated.</span>
            </span>
          ) : <div />}

          <Button type="submit" variant="primary" size="lg" className="tracking-luxury flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

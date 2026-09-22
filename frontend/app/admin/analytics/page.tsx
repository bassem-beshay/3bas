'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Layers,
  Sparkles,
  ShoppingBag,
  Users,
  DollarSign
} from 'lucide-react';
import { DashboardOverview } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ApiClient.analytics.getOverview()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center text-xs text-noir-400 uppercase tracking-widest animate-pulse">
        Aggregating business telemetry...
      </div>
    );
  }

  const { kpis, sales_by_category, sales_by_size, sales_by_color, top_products, store } = data;

  const totalCatRevenue = sales_by_category.reduce((sum, c) => sum + c.revenue, 0) || 1;
  const totalSizeUnits = sales_by_size.reduce((sum, s) => sum + s.units, 0) || 1;
  const totalColorUnits = sales_by_color.reduce((sum, c) => sum + c.units, 0) || 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-light text-noir-950">
          Analytics & Performance Intelligence
        </h1>
        <p className="text-xs text-noir-500">
          In-depth sales breakdowns by taxonomy, size popularity, color affinity, and customer volume.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-noir-200">
          <span className="text-[10px] tracking-luxury uppercase text-noir-400 block mb-1">Gross Revenue</span>
          <span className="text-2xl font-bold text-noir-950 block">{formatPrice(kpis.revenue, store.currency)}</span>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">+18% benchmark</span>
        </div>
        <div className="bg-white p-5 border border-noir-200">
          <span className="text-[10px] tracking-luxury uppercase text-noir-400 block mb-1">Orders Count</span>
          <span className="text-2xl font-bold text-noir-950 block">{kpis.orders}</span>
          <span className="text-[10px] text-noir-500 mt-1 block">Completed orders</span>
        </div>
        <div className="bg-white p-5 border border-noir-200">
          <span className="text-[10px] tracking-luxury uppercase text-noir-400 block mb-1">Average Order Value</span>
          <span className="text-2xl font-bold text-noir-950 block">{formatPrice(kpis.average_order_value, store.currency)}</span>
          <span className="text-[10px] text-noir-500 mt-1 block">Healthy basket size</span>
        </div>
        <div className="bg-white p-5 border border-noir-200">
          <span className="text-[10px] tracking-luxury uppercase text-noir-400 block mb-1">Conversion Rate</span>
          <span className="text-2xl font-bold text-noir-950 block">{kpis.conversion_rate}%</span>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">High fashion tier</span>
        </div>
      </div>

      {/* BREAKDOWNS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. SALES BY CATEGORY */}
        <div className="bg-white p-6 border border-noir-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-noir-100">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-noir-900">
              Sales by Category
            </h3>
            <PieChart className="w-4 h-4 text-noir-400" />
          </div>

          <div className="space-y-4">
            {sales_by_category.map((cat) => {
              const pct = Math.round((cat.revenue / totalCatRevenue) * 100);
              return (
                <div key={cat.category} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-noir-800">{cat.category}</span>
                    <span className="text-noir-950">{formatPrice(cat.revenue, store.currency)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-noir-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-noir-950 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. POPULARITY BY SIZE */}
        <div className="bg-white p-6 border border-noir-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-noir-100">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-noir-900">
              Units Sold by Size
            </h3>
            <Layers className="w-4 h-4 text-noir-400" />
          </div>

          <div className="space-y-4">
            {sales_by_size.map((sz) => {
              const pct = Math.round((sz.units / totalSizeUnits) * 100);
              return (
                <div key={sz.size} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-noir-800 uppercase font-mono">Size {sz.size}</span>
                    <span className="text-noir-950">{sz.units} units ({pct}%)</span>
                  </div>
                  <div className="w-full bg-noir-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-noir-700 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. COLOR AFFINITY */}
        <div className="bg-white p-6 border border-noir-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-noir-100">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-noir-900">
              Color Preference
            </h3>
            <Sparkles className="w-4 h-4 text-noir-400" />
          </div>

          <div className="space-y-4">
            {sales_by_color.map((col) => {
              const pct = Math.round((col.units / totalColorUnits) * 100);
              return (
                <div key={col.color} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-noir-800">{col.color}</span>
                    <span className="text-noir-950">{col.units} units ({pct}%)</span>
                  </div>
                  <div className="w-full bg-noir-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-noir-950 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

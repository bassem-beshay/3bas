'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DashboardOverview } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await ApiClient.analytics.getOverview();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load business insights');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-noir-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-noir-200 p-6 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-white border border-noir-200 text-center space-y-4">
        <p className="text-sm text-red-600 font-medium">{error || 'Unable to connect to merchant data.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-noir-900 text-white text-xs uppercase tracking-wider"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { kpis, revenue_timeline, top_products, low_stock_items, recent_orders, store } = data;

  const maxTimelineRevenue = Math.max(...revenue_timeline.map((d) => d.revenue), 1000);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & Notification Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-serif font-light text-noir-950">
              Overview & Performance
            </h1>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
              Demo Mode
            </span>
          </div>
          <p className="text-xs text-noir-500">
            Real-time multi-tenant telemetry for <span className="font-semibold text-noir-900">{store.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="text-xs font-medium tracking-editorial uppercase bg-noir-950 text-white px-4 py-2.5 hover:bg-noir-800 transition-colors shadow-sm flex items-center gap-2"
          >
            <span>+ Add Garment</span>
          </Link>
        </div>
      </div>

      {/* 5 CORE EXECUTIVE KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Revenue */}
        <div className="bg-white p-5 border border-noir-200 space-y-2">
          <div className="flex items-center justify-between text-noir-500">
            <span className="text-[10px] font-medium tracking-luxury uppercase">Revenue</span>
            <DollarSign className="w-4 h-4 text-noir-400" />
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-noir-950">
            {formatPrice(kpis.revenue, store.currency)}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% from last cycle</span>
          </span>
        </div>

        {/* Orders */}
        <div className="bg-white p-5 border border-noir-200 space-y-2">
          <div className="flex items-center justify-between text-noir-500">
            <span className="text-[10px] font-medium tracking-luxury uppercase">Orders</span>
            <ShoppingBag className="w-4 h-4 text-noir-400" />
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-noir-950">
            {kpis.orders}
          </div>
          <span className="text-[10px] text-noir-500">Processed through checkout</span>
        </div>

        {/* Customers */}
        <div className="bg-white p-5 border border-noir-200 space-y-2">
          <div className="flex items-center justify-between text-noir-500">
            <span className="text-[10px] font-medium tracking-luxury uppercase">Customers</span>
            <Users className="w-4 h-4 text-noir-400" />
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-noir-950">
            {kpis.customers}
          </div>
          <span className="text-[10px] text-noir-500">Profiles across Cairo & Giza</span>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-5 border border-noir-200 space-y-2">
          <div className="flex items-center justify-between text-noir-500">
            <span className="text-[10px] font-medium tracking-luxury uppercase">Avg. Order Value</span>
            <Layers className="w-4 h-4 text-noir-400" />
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-noir-950">
            {formatPrice(kpis.average_order_value, store.currency)}
          </div>
          <span className="text-[10px] text-noir-500">Per customer purchase</span>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-5 border border-noir-200 space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-noir-500">
            <span className="text-[10px] font-medium tracking-luxury uppercase">Conversion</span>
            <Sparkles className="w-4 h-4 text-noir-400" />
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-noir-950">
            {kpis.conversion_rate}%
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">Above luxury baseline</span>
        </div>
      </div>

      {/* REVENUE TIMELINE CHART & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 7-day Revenue Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 border border-noir-200 space-y-6">
          <div className="flex items-center justify-between border-b border-noir-100 pb-4">
            <div>
              <h3 className="text-xs font-semibold tracking-luxury uppercase text-noir-900">
                Revenue Trajectory (Past 7 Days)
              </h3>
              <p className="text-[11px] text-noir-500">Daily sales in {store.currency}</p>
            </div>
            <span className="text-xs font-medium text-noir-900">
              Total: {formatPrice(kpis.revenue, store.currency)}
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-4">
            {revenue_timeline.map((d, i) => {
              const heightPercent = Math.max(12, (d.revenue / maxTimelineRevenue) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] text-noir-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatPrice(d.revenue, '')}
                  </div>
                  <div
                    className="w-full bg-noir-900 hover:bg-noir-700 transition-all rounded-t relative"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] text-noir-500 tracking-wider uppercase">
                    {d.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 border border-noir-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-noir-100">
              <h3 className="text-xs font-semibold tracking-luxury uppercase text-noir-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Low Stock Alerts</span>
              </h3>
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 font-bold">
                {low_stock_items.length} Variants
              </span>
            </div>

            <div className="divide-y divide-noir-100 mt-2">
              {low_stock_items.slice(0, 4).map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-noir-900 block truncate max-w-[160px]">
                      {item.product_name}
                    </span>
                    <span className="text-[10px] text-noir-500">{item.variant_title}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-700 block">
                      {item.stock_quantity} left
                    </span>
                    <span className="text-[9px] text-noir-400">{item.sku}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-noir-100">
            <Link
              href="/admin/inventory"
              className="w-full flex items-center justify-center gap-1 text-xs font-medium text-noir-900 hover:text-noir-600 uppercase tracking-editorial"
            >
              <span>Manage All Inventory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* TOP PRODUCTS & RECENT ORDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Products */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 border border-noir-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-noir-100">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-noir-900">
              Top Products by Volume
            </h3>
            <span className="text-[10px] text-noir-400 uppercase">Pre-Fall 2026</span>
          </div>

          <div className="divide-y divide-noir-100">
            {top_products.map((p, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-noir-400 font-serif w-4 text-center">{idx + 1}</span>
                  <div>
                    <span className="font-medium text-noir-900 block truncate max-w-[170px]">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-noir-400 uppercase">{p.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-noir-950 block">
                    {formatPrice(p.revenue, store.currency)}
                  </span>
                  <span className="text-[10px] text-noir-500">{p.units_sold} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 border border-noir-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-noir-100">
            <h3 className="text-xs font-semibold tracking-luxury uppercase text-noir-900">
              Recent Orders Pipeline
            </h3>
            <Link
              href="/admin/orders"
              className="text-[11px] font-medium text-noir-900 hover:text-noir-600 uppercase tracking-wider flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-noir-100 text-[10px] tracking-luxury uppercase text-noir-400">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noir-100">
                {recent_orders.map((o) => (
                  <tr key={o.id} className="hover:bg-noir-50/50 transition-colors">
                    <td className="py-3 font-medium text-noir-900">
                      <Link href="/admin/orders" className="hover:underline">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="py-3 text-noir-600">
                      <div>{o.customer_name}</div>
                      <div className="text-[10px] text-noir-400">{o.created_at}</div>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          o.status === 'DELIVERED'
                            ? 'success'
                            : o.status === 'SHIPPED'
                            ? 'default'
                            : o.status === 'CANCELLED'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-semibold text-noir-950">
                      {formatPrice(o.total, store.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Tag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If on login page, render children directly without dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-noir-50 flex">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-noir-950 text-white border-r border-noir-800 shrink-0 select-none">
        {/* Brand Banner */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex flex-col">
              <span className="text-xl font-serif tracking-[0.3em] uppercase text-white">
                NOIRÉ
              </span>
              <span className="text-[10px] tracking-luxury uppercase text-noir-400 mt-0.5">
                Brand Merchant Suite
              </span>
            </Link>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-white text-noir-950 font-semibold shadow-sm'
                    : 'text-noir-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-noir-950' : 'text-noir-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Action Button */}
        <div className="px-4 pb-4">
          <Link
            href="/admin/products/new"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-medium tracking-editorial uppercase rounded transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>

        {/* Bottom Storefront & User Strip */}
        <div className="p-4 border-t border-white/10 bg-black/30 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-[11px] text-noir-400 hover:text-white px-2 py-1.5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Storefront</span>
            </span>
            <span className="text-[9px] uppercase px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
              Live
            </span>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 px-2">
            <div className="truncate pr-2">
              <span className="block text-xs text-white font-medium truncate">
                {user?.email || 'admin@noire.studio'}
              </span>
              <span className="block text-[10px] text-noir-400 uppercase tracking-wider">
                Store Owner
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/admin/login');
              }}
              className="p-1.5 text-noir-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-64 bg-noir-950 text-white h-full flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <span className="text-xl font-serif tracking-[0.3em] uppercase">NOIRÉ</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs tracking-wide ${
                        isActive ? 'bg-white text-noir-950 font-semibold' : 'text-noir-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10">
              <Link
                href="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-2 text-xs text-noir-400 hover:text-white mb-4"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visit Storefront</span>
              </Link>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* MAIN ADMIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-noir-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 text-noir-900"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-noir-950">
                Brand Admin
              </span>
              <span className="text-noir-300">/</span>
              <span className="text-xs text-noir-500 uppercase tracking-widest">
                NOIRÉ Studio (EGP)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/products/new"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium tracking-editorial uppercase bg-noir-900 text-white px-3.5 py-2 hover:bg-noir-800 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Product</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-noir-600 hover:text-noir-900 border border-noir-200 px-3 py-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>
          </div>
        </header>

        {/* Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-noir-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}

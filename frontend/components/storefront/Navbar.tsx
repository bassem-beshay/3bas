'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, X, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { AnnouncementBar } from './AnnouncementBar';

export const Navbar: React.FC<{ announcementText?: string }> = ({ announcementText }) => {
  const { itemsCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'Outerwear', href: '/shop?category=outerwear' },
    { label: 'Knitwear', href: '/shop?category=knitwear' },
    { label: 'Tops', href: '/shop?category=tops' },
    { label: 'Trousers', href: '/shop?category=trousers' },
    { label: 'Accessories', href: '/shop?category=accessories' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-noir-200 transition-all">
      <AnnouncementBar text={announcementText} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-noir-900 hover:text-noir-600 focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Left Nav */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[11px] font-medium tracking-editorial uppercase text-noir-700 hover:text-noir-950 transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-noir-900 hover:after:w-full after:transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Center Brand Identity */}
          <div className="flex-1 lg:flex-none text-center">
            <Link href="/" className="inline-block">
              <span className="text-2xl sm:text-3xl font-light tracking-[0.35em] text-noir-950 uppercase select-none font-serif">
                NOIRÉ
              </span>
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-5 sm:space-x-6">
            {/* Search Bar Toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-noir-50 border border-noir-300 rounded px-2 py-1">
                  <input
                    type="text"
                    placeholder="Search collection..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
                      }
                    }}
                    autoFocus
                    className="bg-transparent text-xs text-noir-900 focus:outline-none w-32 sm:w-48"
                  />
                  <button onClick={() => setSearchOpen(false)} className="text-noir-400 hover:text-noir-900 ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-1.5 text-noir-800 hover:text-noir-950 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Merchant Admin Portal Quick Link */}
            <Link
              href="/admin/dashboard"
              className="hidden md:flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase text-noir-500 hover:text-noir-950 border border-noir-200 hover:border-noir-900 px-3 py-1.5 transition-all"
              title="Enter Merchant Brand Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Brand Portal</span>
            </Link>

            {/* Shopping Bag Button */}
            <button
              onClick={openCart}
              className="relative p-1.5 text-noir-900 hover:text-noir-700 transition-colors flex items-center gap-2"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-widest uppercase">
                Bag
              </span>
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-noir-950 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex">
          <div className="w-4/5 max-w-sm bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-noir-200">
                <span className="text-xl font-serif tracking-[0.3em] uppercase">NOIRÉ</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-noir-900">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-8 flex flex-col space-y-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium tracking-editorial uppercase text-noir-800 hover:text-noir-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-noir-200">
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 border border-noir-900 text-xs tracking-editorial uppercase font-medium hover:bg-noir-900 hover:text-white transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Brand Dashboard</span>
              </Link>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};

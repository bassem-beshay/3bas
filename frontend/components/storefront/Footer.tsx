'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-noir-950 text-white pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Manifesto */}
          <div className="md:col-span-5 space-y-6">
            <span className="text-2xl font-serif tracking-[0.35em] text-white uppercase block">
              NOIRÉ
            </span>
            <p className="text-noir-400 text-xs sm:text-sm font-light leading-relaxed max-w-md">
              A contemporary fashion studio exploring architectural tailoring, sculpted volumes, and tactile textures.
              Each garment is developed with obsessive attention to silhouette and materiality.
            </p>
            <div className="flex items-center space-x-6 text-xs tracking-widest text-noir-400 uppercase pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Instagram
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                TikTok
              </a>
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors text-emerald-400"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Concierge</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-[11px] font-medium tracking-luxury uppercase text-noir-300">
              Client Services
            </h4>
            <ul className="space-y-3 text-xs tracking-wider text-noir-400">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Catalog & Lookbook
                </Link>
              </li>
              <li>
                <Link href="/shop?category=outerwear" className="hover:text-white transition-colors">
                  Tailoring & Coats
                </Link>
              </li>
              <li>
                <Link href="/shop?category=knitwear" className="hover:text-white transition-colors">
                  Cashmere & Knits
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Bag & Checkout
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-white transition-colors">
                  Brand Merchant Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter / Exclusive Access */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-[11px] font-medium tracking-luxury uppercase text-noir-300">
              The Gazette
            </h4>
            <p className="text-xs text-noir-400 leading-relaxed">
              Receive private previews of upcoming seasonal drops, editorial lookbooks, and private studio appointments.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to NOIRÉ.'); }} className="mt-4">
              <div className="flex border-b border-white/20 pb-2 focus-within:border-white transition-colors">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  className="bg-transparent text-xs text-white placeholder-noir-500 focus:outline-none flex-1"
                />
                <button
                  type="submit"
                  className="text-xs tracking-luxury uppercase text-white hover:text-noir-300 flex items-center gap-1 ml-3"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] tracking-wider text-noir-500">
          <p>© {new Date().getFullYear()} NOIRÉ. All rights reserved. Powered by Multi-Tenant Fashion SaaS.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span>Cairo</span>
            <span>Paris</span>
            <span>Milan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

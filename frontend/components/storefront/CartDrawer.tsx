'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    items,
    removeItem,
    updateQuantity,
    subtotal,
    itemsCount,
    remainingForFreeShipping,
    freeShippingProgress,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-noir-200 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold tracking-luxury uppercase text-noir-900">
                Shopping Bag
              </span>
              <span className="text-xs text-noir-400">({itemsCount})</span>
            </div>
            <button
              onClick={closeCart}
              className="p-1 -mr-1 text-noir-500 hover:text-noir-950 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-noir-50 px-6 py-3 border-b border-noir-200">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[11px] text-noir-600 mb-1.5">
                Add <span className="font-medium text-noir-900">{formatPrice(remainingForFreeShipping)}</span> more for complimentary shipping.
              </p>
            ) : (
              <p className="text-[11px] text-emerald-700 font-medium mb-1.5 flex items-center gap-1.5">
                ✓ You have unlocked complimentary domestic courier.
              </p>
            )}
            <div className="w-full bg-noir-200 h-1 rounded-full overflow-hidden">
              <div
                className="bg-noir-950 h-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-noir-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <span className="text-4xl text-noir-300">🛍️</span>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-noir-900">
                    Your bag is empty
                  </h3>
                  <p className="text-xs text-noir-400 max-w-xs">
                    Discover our new arrivals, architectural tailoring, and luxury essentials.
                  </p>
                </div>
                <Link href="/shop" onClick={closeCart}>
                  <Button variant="outline" size="sm">
                    Discover Collection
                  </Button>
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variant_id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 bg-noir-100 shrink-0 overflow-hidden">
                    <Image
                      src={item.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80'}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-xs font-medium text-noir-900 hover:text-noir-600 line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.variant_id)}
                          className="text-noir-400 hover:text-noir-900 p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-1 text-[11px] text-noir-500 space-x-2">
                        <span>{item.color_name}</span>
                        <span>/</span>
                        <span className="uppercase">{item.size}</span>
                      </div>

                      <div className="mt-1 text-xs font-semibold text-noir-950">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-noir-200">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="p-1 hover:bg-noir-100 text-noir-700 disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-noir-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="p-1 hover:bg-noir-100 text-noir-700 disabled:opacity-30"
                          disabled={item.quantity >= item.max_stock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {item.quantity >= item.max_stock && (
                        <span className="text-[10px] text-amber-700">Max stock</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-noir-200 px-6 py-5 bg-noir-50/50 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-noir-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-noir-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-noir-500">
                  <span>Shipping</span>
                  <span>{remainingForFreeShipping === 0 ? 'Complimentary' : 'Calculated at checkout'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link href="/cart" onClick={closeCart} className="w-full">
                  <Button variant="outline" size="md" className="w-full">
                    View Bag
                  </Button>
                </Link>
                <Link href="/checkout" onClick={closeCart} className="w-full">
                  <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-1.5">
                    <span>Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              <p className="text-[10px] text-center text-noir-400 uppercase tracking-wider">
                Taxes & Duties Included · 14-Day Returns
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { ApiClient } from '@/lib/api';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    freeShippingThreshold,
    remainingForFreeShipping,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const shippingFee = subtotal >= freeShippingThreshold || discountAmount >= subtotal ? 0 : 60;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const res = await ApiClient.marketing.validateCoupon(promoCode.trim(), subtotal, shippingFee);
      if (res.valid) {
        setDiscountAmount(res.discount_amount);
        setPromoSuccess(`Discount applied: ${res.code} (-${formatPrice(res.discount_amount)})`);
      } else {
        setPromoError(res.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      setPromoError(err.message || 'Coupon could not be applied');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        <h1 className="text-3xl sm:text-4xl font-serif text-noir-950 font-light mb-8">
          Shopping Bag ({items.reduce((sum, i) => sum + i.quantity, 0)})
        </h1>

        {items.length === 0 ? (
          <div className="py-24 text-center space-y-5 border-y border-noir-200">
            <span className="text-4xl block">🛍️</span>
            <h2 className="text-base font-medium tracking-luxury uppercase text-noir-900">
              Your shopping bag is currently empty
            </h2>
            <p className="text-xs text-noir-500 max-w-sm mx-auto">
              Explore our architectural tailoring, brushed knitwear, and contemporary silhouettes.
            </p>
            <div className="pt-2">
              <Link href="/shop">
                <Button variant="primary" size="md">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Items Column */}
            <div className="lg:col-span-8 divide-y divide-noir-200 border-t border-b border-noir-200">
              {items.map((item) => (
                <div key={item.variant_id} className="py-6 flex gap-6">
                  {/* Thumbnail */}
                  <div className="relative w-24 h-32 sm:w-28 sm:h-36 bg-noir-100 shrink-0 overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          href={`/product/${item.slug}`}
                          className="text-sm font-medium text-noir-900 hover:text-noir-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <span className="text-sm font-semibold text-noir-950">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-noir-500 space-x-2">
                        <span>Color: {item.color_name}</span>
                        <span>·</span>
                        <span className="uppercase">Size: {item.size}</span>
                      </div>

                      <div className="mt-1 text-[11px] text-noir-400">
                        SKU: {item.sku}
                      </div>
                    </div>

                    {/* Stepper & Delete */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-noir-200">
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                          className="p-1.5 hover:bg-noir-100 text-noir-700 disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-medium text-noir-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                          className="p-1.5 hover:bg-noir-100 text-noir-700 disabled:opacity-30"
                          disabled={item.quantity >= item.max_stock}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.variant_id)}
                        className="text-xs text-noir-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-noir-50/70 p-6 sm:p-8 border border-noir-200 space-y-6">
                <h3 className="text-xs font-semibold tracking-luxury uppercase text-noir-900 pb-4 border-b border-noir-200">
                  Order Summary
                </h3>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="text-[11px] tracking-editorial uppercase font-medium text-noir-600 block">
                    Promotional Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="bg-white border border-noir-200 px-3 py-2 text-xs uppercase text-noir-900 focus:outline-none focus:border-noir-950 flex-1"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      isLoading={isValidatingPromo}
                      className="shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                  {promoSuccess && (
                    <p className="text-[11px] text-emerald-700 font-medium">{promoSuccess}</p>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-red-600">{promoError}</p>
                  )}
                </form>

                {/* Costs Breakdown */}
                <div className="space-y-3 text-xs pt-2 border-t border-noir-200">
                  <div className="flex justify-between text-noir-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-noir-900">{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount ({promoCode})</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-noir-600">
                    <span>Domestic Courier</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-emerald-700 font-medium">Complimentary</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>

                  {remainingForFreeShipping > 0 && (
                    <p className="text-[10px] text-noir-500 pt-1">
                      Add {formatPrice(remainingForFreeShipping)} more to qualify for complimentary courier.
                    </p>
                  )}

                  <div className="pt-3 border-t border-noir-200 flex justify-between text-sm font-semibold text-noir-950">
                    <span>Estimated Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <div className="pt-2">
                  <Link href="/checkout" className="block w-full">
                    <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="text-[10px] text-noir-400 space-y-1.5 pt-2 text-center uppercase tracking-wider">
                  <p>Encrypted 256-Bit Checkout</p>
                  <p>14-Day Complimentary Domestic Trial</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, Truck, CreditCard, Banknote, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, freeShippingThreshold, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customer_email: '',
    customer_name: '',
    customer_phone: '',
    shipping_address: '',
    city: 'New Cairo',
    postal_code: '',
    country: 'Egypt',
    payment_method: 'COD' as 'COD' | 'CARD' | 'INSTAPAY',
    discount_code: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  const shippingFee = subtotal >= freeShippingThreshold || discountAmount >= subtotal ? 0 : 60;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = async () => {
    if (!formData.discount_code.trim()) return;
    try {
      const res = await ApiClient.marketing.validateCoupon(
        formData.discount_code.trim(),
        subtotal,
        shippingFee
      );
      if (res.valid) {
        setDiscountAmount(res.discount_amount);
        setPromoMessage(`✓ ${res.code}: -${formatPrice(res.discount_amount)}`);
        setErrorMessage('');
      } else {
        setPromoMessage('');
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid coupon code');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('Your bag is empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        customer_email: formData.customer_email,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        payment_method: formData.payment_method,
        discount_code: formData.discount_code,
        notes: formData.notes,
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      };

      const order = await ApiClient.orders.checkout(payload);
      clearCart();
      router.push(`/order-confirmed/${encodeURIComponent(order.order_number)}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-noir-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-serif text-noir-950 mb-3">No Items to Checkout</h2>
        <p className="text-xs text-noir-500 mb-6">Your shopping bag is currently empty.</p>
        <Link href="/shop">
          <Button variant="primary">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-50/60 text-noir-900">
      {/* Minimal Top Brand Bar */}
      <header className="bg-white border-b border-noir-200 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/cart" className="text-xs font-medium tracking-editorial uppercase text-noir-500 hover:text-noir-950 flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Bag</span>
          </Link>
          <Link href="/">
            <span className="text-2xl font-serif tracking-[0.35em] text-noir-950 uppercase select-none">
              NOIRÉ
            </span>
          </Link>
          <div className="text-[11px] font-medium tracking-widest text-noir-400 uppercase flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-noir-600" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Checkout Form Details */}
          <div className="lg:col-span-7 space-y-10">
            {/* Step 1: Contact Information */}
            <section className="bg-white p-6 sm:p-8 border border-noir-200 space-y-5">
              <h2 className="text-xs font-semibold tracking-luxury uppercase text-noir-900 border-b border-noir-100 pb-3 flex items-center justify-between">
                <span>1. Contact Information</span>
                <span className="text-[10px] text-noir-400 font-normal">Courier Dispatch</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    required
                    placeholder="e.g. client@domain.com"
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-noir-200 px-3.5 py-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      required
                      placeholder="e.g. Karim Mansour"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-noir-200 px-3.5 py-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                      Mobile Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      required
                      placeholder="e.g. +20 100 123 4567"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-noir-200 px-3.5 py-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Shipping Destination */}
            <section className="bg-white p-6 sm:p-8 border border-noir-200 space-y-5">
              <h2 className="text-xs font-semibold tracking-luxury uppercase text-noir-900 border-b border-noir-100 pb-3 flex items-center justify-between">
                <span>2. Delivery Address</span>
                <span className="text-[10px] text-noir-400 font-normal">Express Courier</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                    Street Address & Building / Apt *
                  </label>
                  <input
                    type="text"
                    name="shipping_address"
                    required
                    placeholder="e.g. Villa 14, Phase 2, Lake View Compound"
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-noir-200 px-3.5 py-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                      City / Region *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-noir-200 px-3.5 py-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950 transition-colors"
                    >
                      <option value="New Cairo">New Cairo / Fifth Settlement</option>
                      <option value="Zamalek">Zamalek</option>
                      <option value="Maadi">Maadi / Degla</option>
                      <option value="Sheikh Zayed">Sheikh Zayed / October</option>
                      <option value="Heliopolis">Heliopolis / Korba</option>
                      <option value="Giza">Giza / Dokki / Mohandessin</option>
                      <option value="Alexandria">Alexandria</option>
                      <option value="Other">Other Governorate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      disabled
                      value={formData.country}
                      className="w-full bg-noir-50 border border-noir-200 px-3.5 py-3 text-xs text-noir-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                    Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    name="notes"
                    placeholder="e.g. Ring intercom 3B or call upon arrival at the gate."
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Step 3: Payment Method */}
            <section className="bg-white p-6 sm:p-8 border border-noir-200 space-y-5">
              <h2 className="text-xs font-semibold tracking-luxury uppercase text-noir-900 border-b border-noir-100 pb-3">
                3. Payment Method
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                    formData.payment_method === 'COD'
                      ? 'border-noir-950 bg-noir-50/50'
                      : 'border-noir-200 hover:border-noir-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="COD"
                      checked={formData.payment_method === 'COD'}
                      onChange={() => setFormData((p) => ({ ...p, payment_method: 'COD' }))}
                      className="text-noir-950 focus:ring-0"
                    />
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-noir-800" />
                      <div>
                        <span className="text-xs font-medium text-noir-900 block">Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-noir-500">Pay cash upon parcel delivery and verification.</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium tracking-luxury uppercase text-noir-400">Popular</span>
                </label>

                {/* Credit / Debit Card */}
                <label
                  className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                    formData.payment_method === 'CARD'
                      ? 'border-noir-950 bg-noir-50/50'
                      : 'border-noir-200 hover:border-noir-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="CARD"
                      checked={formData.payment_method === 'CARD'}
                      onChange={() => setFormData((p) => ({ ...p, payment_method: 'CARD' }))}
                      className="text-noir-950 focus:ring-0"
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-noir-800" />
                      <div>
                        <span className="text-xs font-medium text-noir-900 block">Credit / Debit Card</span>
                        <span className="text-[10px] text-noir-500">Visa, Mastercard, Meeza (Secure Mock Processing)</span>
                      </div>
                    </div>
                  </div>
                </label>

                {/* InstaPay */}
                <label
                  className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                    formData.payment_method === 'INSTAPAY'
                      ? 'border-noir-950 bg-noir-50/50'
                      : 'border-noir-200 hover:border-noir-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="INSTAPAY"
                      checked={formData.payment_method === 'INSTAPAY'}
                      onChange={() => setFormData((p) => ({ ...p, payment_method: 'INSTAPAY' }))}
                      className="text-noir-950 focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-medium text-noir-900 block">InstaPay Transfer</span>
                      <span className="text-[10px] text-noir-500">Instant transfer via Egyptian National Payment Gateway</span>
                    </div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT: Order Summary & Placement */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 sm:p-8 border border-noir-200 sticky top-28 space-y-6">
              <h3 className="text-xs font-semibold tracking-luxury uppercase text-noir-900 pb-3 border-b border-noir-200">
                Your Selection ({items.reduce((sum, i) => sum + i.quantity, 0)})
              </h3>

              {/* Items Mini List */}
              <div className="divide-y divide-noir-100 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.variant_id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-16 bg-noir-100 shrink-0 overflow-hidden">
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        <span className="absolute bottom-0 right-0 bg-noir-900 text-white text-[9px] px-1 font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium text-noir-900 line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-noir-500">{item.color_name} / {item.size}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-noir-950 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo code input */}
              <div className="pt-2 border-t border-noir-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="discount_code"
                    placeholder="Coupon (e.g. WELCOME10)"
                    value={formData.discount_code}
                    onChange={(e) => setFormData((p) => ({ ...p, discount_code: e.target.value.toUpperCase() }))}
                    className="bg-noir-50 border border-noir-200 px-3 py-2 text-xs uppercase text-noir-950 focus:outline-none flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-noir-900 text-white text-[10px] tracking-wider uppercase px-4 hover:bg-noir-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && <p className="text-[11px] text-emerald-700 mt-1.5 font-medium">{promoMessage}</p>}
              </div>

              {/* Price Calculation */}
              <div className="space-y-2 text-xs border-t border-noir-100 pt-4">
                <div className="flex justify-between text-noir-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-noir-600">
                  <span>Domestic Courier</span>
                  <span>{shippingFee === 0 ? <span className="text-emerald-700 font-medium">Complimentary</span> : formatPrice(shippingFee)}</span>
                </div>

                <div className="border-t border-noir-200 pt-3 flex justify-between text-base font-semibold text-noir-950">
                  <span>Total Due</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {/* Complete Order Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full tracking-luxury py-4 text-xs"
              >
                {isSubmitting ? 'Confirming Order...' : `Place Order — ${formatPrice(grandTotal)}`}
              </Button>

              <div className="text-[10px] text-center text-noir-400 uppercase tracking-widest space-y-1">
                <p>14-Day Complimentary Exchanges</p>
                <p>Hand-Packaged in Studio Boxes</p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

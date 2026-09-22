import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle, Truck, Package, Clock, ArrowRight } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface OrderConfirmedPageProps {
  params: {
    orderNumber: string;
  };
}

export default async function OrderConfirmedPage({ params }: OrderConfirmedPageProps) {
  let order;
  try {
    order = await ApiClient.orders.track(params.orderNumber);
  } catch (err) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-noir-50/50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        {/* Receipt Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mb-2">
            <CheckCircle className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-medium tracking-luxury uppercase text-noir-400 block">
            Order Confirmation
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-light text-noir-950">
            Thank You, {order.customer_name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-noir-600 max-w-md mx-auto leading-relaxed">
            Your acquisition has been confirmed with order reference{' '}
            <span className="font-semibold text-noir-950">{order.order_number}</span>.
            We have dispatched a summary confirmation to <span className="underline">{order.customer_email}</span>.
          </p>
        </div>

        {/* Fulfillment Status Progress Tracker */}
        <div className="bg-white p-6 sm:p-8 border border-noir-200 mb-8">
          <h3 className="text-xs font-semibold tracking-luxury uppercase text-noir-900 mb-6">
            Dispatch Status
          </h3>

          <div className="grid grid-cols-3 gap-4 text-center relative">
            <div className="space-y-2">
              <div className="w-9 h-9 mx-auto rounded-full bg-noir-950 text-white flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="block text-xs font-medium text-noir-900">Confirmed</span>
              <span className="block text-[10px] text-noir-400">{formatDate(order.created_at)}</span>
            </div>

            <div className="space-y-2">
              <div className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center ${
                ['PREPARING', 'SHIPPED', 'DELIVERED'].includes(order.status)
                  ? 'bg-noir-950 text-white'
                  : 'bg-noir-100 text-noir-400'
              }`}>
                <Package className="w-4 h-4" />
              </div>
              <span className="block text-xs font-medium text-noir-900">Studio Packing</span>
              <span className="block text-[10px] text-noir-400">In Progress</span>
            </div>

            <div className="space-y-2">
              <div className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center ${
                ['SHIPPED', 'DELIVERED'].includes(order.status)
                  ? 'bg-noir-950 text-white'
                  : 'bg-noir-100 text-noir-400'
              }`}>
                <Truck className="w-4 h-4" />
              </div>
              <span className="block text-xs font-medium text-noir-900">Courier Dispatch</span>
              <span className="block text-[10px] text-noir-400">Estimated 24-48h</span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white p-6 sm:p-8 border border-noir-200 space-y-8">
          {/* Order Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-noir-100 text-xs">
            <div>
              <span className="text-[10px] tracking-luxury uppercase text-noir-400 block mb-1">
                Recipient
              </span>
              <p className="font-medium text-noir-900">{order.customer_name}</p>
              <p className="text-noir-500">{order.customer_phone}</p>
            </div>
            <div>
              <span className="text-[10px] tracking-luxury uppercase text-noir-400 block mb-1">
                Delivery Address
              </span>
              <p className="text-noir-700 leading-relaxed">
                {order.shipping_address}, {order.city}
              </p>
            </div>
            <div>
              <span className="text-[10px] tracking-luxury uppercase text-noir-400 block mb-1">
                Payment Method
              </span>
              <p className="font-medium text-noir-900">
                {order.payment_method === 'COD' ? 'Cash on Delivery' : order.payment_method}
              </p>
              <p className="text-noir-500">Status: {order.payment_status}</p>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-luxury uppercase text-noir-900">
              Acquired Items ({order.items?.length || 0})
            </h4>
            <div className="divide-y divide-noir-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {item.image_url && (
                      <div className="relative w-14 h-18 bg-noir-100 overflow-hidden shrink-0">
                        <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <h5 className="text-xs font-medium text-noir-900">{item.product_name}</h5>
                      <p className="text-[11px] text-noir-500">{item.variant_title}</p>
                      <p className="text-[10px] text-noir-400">Qty: {item.quantity} · SKU: {item.sku}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-noir-950">
                    {formatPrice(item.total, order.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-noir-200 space-y-2 text-xs">
            <div className="flex justify-between text-noir-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal, order.currency)}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount ({order.discount_code})</span>
                <span>-{formatPrice(order.discount_amount, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-noir-600">
              <span>Courier</span>
              <span>{Number(order.shipping_fee) === 0 ? 'Complimentary' : formatPrice(order.shipping_fee, order.currency)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-noir-950 pt-2 border-t border-noir-100">
              <span>Total Amount</span>
              <span>{formatPrice(order.total, order.currency)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full sm:w-auto">
              Continue Browsing Collection
            </Button>
          </Link>
          <Link href="/admin/orders" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full sm:w-auto flex items-center justify-center gap-2">
              <span>View in Brand Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search, ShoppingBag, Eye, CheckCircle, Truck, Package, XCircle, ArrowRight, X } from 'lucide-react';
import { Order } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.orders.list({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      });
      setOrders(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await ApiClient.orders.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const statusTabs = [
    { label: 'All', value: '' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Preparing', value: 'PREPARING' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-light text-noir-950">
          Orders & Fulfillment
        </h1>
        <p className="text-xs text-noir-500">
          Track customer purchases, packing queues, and courier fulfillment lifecycle.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-noir-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchOrders(); }} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search order #, customer or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-noir-50 border border-noir-200 pl-9 pr-3 py-2 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
          />
          <Search className="w-3.5 h-3.5 text-noir-400 absolute left-3 top-2.5" />
        </form>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {statusTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase border whitespace-nowrap transition-all ${
                statusFilter === tab.value
                  ? 'bg-noir-950 text-white border-noir-950'
                  : 'bg-white text-noir-600 border-noir-200 hover:border-noir-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-noir-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-noir-400 uppercase tracking-widest">
            Retrieving orders ledger...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-6 h-6 mx-auto text-noir-300" />
            <p className="text-xs text-noir-500 uppercase tracking-wider">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-noir-50/70 border-b border-noir-200 text-[10px] tracking-luxury uppercase text-noir-500">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noir-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-noir-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-noir-950">
                      {o.order_number}
                      <span className="block text-[10px] font-normal text-noir-400">
                        {formatDate(o.created_at)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-noir-900 block">{o.customer_name}</span>
                      <span className="text-[10px] text-noir-500">{o.customer_phone}</span>
                    </td>

                    <td className="py-3.5 px-4 text-noir-600">
                      {o.city}
                    </td>

                    <td className="py-3.5 px-4 text-noir-600">
                      {o.items?.length || 0} pieces
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-noir-800 font-medium">{o.payment_method}</span>
                      <span className="text-[10px] text-noir-400 block">{o.payment_status}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          o.status === 'DELIVERED'
                            ? 'success'
                            : o.status === 'SHIPPED'
                            ? 'default'
                            : o.status === 'CANCELLED'
                            ? 'danger'
                            : o.status === 'PREPARING'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-noir-950">
                      {formatPrice(o.total, o.currency)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 border border-noir-200 text-noir-800 hover:border-noir-950 hover:text-noir-950 text-[11px] font-medium tracking-wide uppercase transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAIL SLIDE-OVER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-screen max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-noir-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-luxury uppercase text-noir-400 block">
                  Order Management
                </span>
                <h3 className="text-base font-serif font-medium text-noir-950">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-noir-400 hover:text-noir-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 text-xs">
              {/* Status Progression Buttons */}
              <div className="bg-noir-50 p-4 border border-noir-200 space-y-3">
                <span className="text-[10px] font-semibold tracking-luxury uppercase text-noir-700 block">
                  Progress Lifecycle
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={isUpdatingStatus || selectedOrder.status === 'PREPARING'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'PREPARING')}
                    className="p-2 border border-noir-300 bg-white hover:bg-noir-100 text-noir-800 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Set: Preparing</span>
                  </button>
                  <button
                    disabled={isUpdatingStatus || selectedOrder.status === 'SHIPPED'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                    className="p-2 border border-noir-950 bg-noir-950 hover:bg-noir-800 text-white text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Set: Shipped</span>
                  </button>
                  <button
                    disabled={isUpdatingStatus || selectedOrder.status === 'DELIVERED'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                    className="p-2 border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Set: Delivered</span>
                  </button>
                  <button
                    disabled={isUpdatingStatus || selectedOrder.status === 'CANCELLED'}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                    className="p-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 border-b border-noir-100 pb-4">
                <span className="text-[10px] tracking-luxury uppercase text-noir-400 block font-semibold">
                  Customer & Shipping
                </span>
                <p className="font-semibold text-noir-900">{selectedOrder.customer_name}</p>
                <p className="text-noir-600">{selectedOrder.customer_email}</p>
                <p className="text-noir-600">{selectedOrder.customer_phone}</p>
                <p className="text-noir-700 pt-1">
                  {selectedOrder.shipping_address}, {selectedOrder.city}
                </p>
                {selectedOrder.notes && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded mt-2">
                    Note: {selectedOrder.notes}
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <span className="text-[10px] tracking-luxury uppercase text-noir-400 block font-semibold">
                  Items Breakdown
                </span>
                <div className="divide-y divide-noir-100">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <div className="relative w-10 h-12 bg-noir-100 shrink-0 overflow-hidden">
                            <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-noir-900">{item.product_name}</p>
                          <p className="text-[10px] text-noir-500">{item.variant_title}</p>
                          <p className="text-[10px] text-noir-400">Qty: {item.quantity} · {item.sku}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-noir-950">
                        {formatPrice(item.total, selectedOrder.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="border-t border-noir-200 pt-3 space-y-1.5">
                <div className="flex justify-between text-noir-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal, selectedOrder.currency)}</span>
                </div>
                {Number(selectedOrder.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(selectedOrder.discount_amount, selectedOrder.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-noir-600">
                  <span>Courier</span>
                  <span>{formatPrice(selectedOrder.shipping_fee, selectedOrder.currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-noir-950 pt-2 border-t border-noir-100">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total, selectedOrder.currency)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-noir-200 bg-noir-50 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                Close Panel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

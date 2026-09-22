'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, AlertTriangle, Check, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { InventoryItem } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQty, setEditingQty] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.inventory.list({
        search: searchTerm || undefined,
        low_stock: lowStockOnly ? true : undefined,
      });
      setItems(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const handleStartEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditingQty(item.stock_quantity);
  };

  const handleSaveStock = async (item: InventoryItem) => {
    setIsUpdating(true);
    try {
      const updated = await ApiClient.inventory.updateStock(
        item.id,
        editingQty,
        'MANUAL_CORRECTION',
        'Direct inventory manager adjustment'
      );
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, stock_quantity: updated.stock_quantity, is_low_stock: updated.is_low_stock } : i))
      );
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    } finally {
      setIsUpdating(false);
    }
  };

  const lowStockCount = items.filter((i) => i.is_low_stock).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-light text-noir-950">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-noir-500">
            Variant-level SKU tracking, live restocks, and low-stock replenishment warnings.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="text-xs font-medium tracking-editorial uppercase border border-noir-200 hover:border-noir-950 px-4 py-2 bg-white flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Filter and Metrics Row */}
      <div className="bg-white p-4 border border-noir-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchInventory(); }} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by SKU or Garment name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-noir-50 border border-noir-200 pl-9 pr-3 py-2 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
          />
          <Search className="w-3.5 h-3.5 text-noir-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
              lowStockOnly
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-noir-700 border-noir-200 hover:border-noir-950'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Filter</span>
            {lowStockCount > 0 && (
              <span className={`text-[10px] px-1 rounded ${lowStockOnly ? 'bg-amber-700' : 'bg-amber-100 text-amber-800'}`}>
                {lowStockCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-noir-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-noir-400 uppercase tracking-widest">
            Auditing inventory records...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <SlidersHorizontal className="w-6 h-6 mx-auto text-noir-300" />
            <p className="text-xs text-noir-500 uppercase tracking-wider">No SKUs matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-noir-50/70 border-b border-noir-200 text-[10px] tracking-luxury uppercase text-noir-500">
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Garment</th>
                  <th className="py-3 px-4">Variant (Color / Size)</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Stock on Hand</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noir-100">
                {items.map((item) => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-noir-50/50 transition-colors">
                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-noir-950">
                        {item.sku}
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 bg-noir-100 shrink-0 overflow-hidden">
                            {item.primary_image && (
                              <Image src={item.primary_image} alt={item.product_name} fill className="object-cover" />
                            )}
                          </div>
                          <div>
                            <Link href={`/product/${item.product_slug}`} target="_blank" className="font-medium text-noir-900 hover:underline">
                              {item.product_name}
                            </Link>
                            <span className="text-[10px] text-noir-400 block">{item.category_name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Variant */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full border border-noir-300"
                            style={{ backgroundColor: item.color_hex }}
                          />
                          <span className="font-medium text-noir-900">{item.color_name}</span>
                          <span className="text-noir-400">/</span>
                          <span className="font-bold text-noir-950 uppercase">{item.size}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-medium text-noir-900">
                        {formatPrice(item.effective_price)}
                      </td>

                      {/* Stock on Hand */}
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={editingQty}
                            onChange={(e) => setEditingQty(parseInt(e.target.value) || 0)}
                            className="w-20 border border-noir-950 p-1 text-xs font-bold text-center bg-white"
                            autoFocus
                          />
                        ) : (
                          <span
                            className={`inline-block font-bold text-sm ${
                              item.stock_quantity === 0
                                ? 'text-red-600'
                                : item.is_low_stock
                                ? 'text-amber-700'
                                : 'text-noir-950'
                            }`}
                          >
                            {item.stock_quantity}
                          </span>
                        )}
                      </td>

                      {/* Status Warning */}
                      <td className="py-3.5 px-4">
                        {item.stock_quantity === 0 ? (
                          <Badge variant="danger">Out of Stock</Badge>
                        ) : item.is_low_stock ? (
                          <Badge variant="warning">Low Stock (&le; 5)</Badge>
                        ) : (
                          <Badge variant="success">Optimal</Badge>
                        )}
                      </td>

                      {/* Quick Adjust Button */}
                      <td className="py-3.5 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveStock(item)}
                              disabled={isUpdating}
                              className="px-2.5 py-1 bg-noir-950 text-white text-[10px] font-bold uppercase rounded hover:bg-noir-800 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 text-noir-500 hover:text-noir-900 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="px-3 py-1 border border-noir-200 text-noir-700 hover:border-noir-950 hover:text-noir-950 text-[11px] font-medium tracking-wide uppercase transition-colors"
                          >
                            Adjust
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Search, Trash2, Edit3, ExternalLink, SlidersHorizontal, Check } from 'lucide-react';
import { ProductListItem } from '@/types';
import { ApiClient } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await ApiClient.products.list({
        search: searchTerm || undefined,
        status: statusFilter || undefined,
      });
      setProducts(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (slug: string) => {
    try {
      await ApiClient.products.delete(slug);
      setProducts((prev) => prev.filter((p) => p.slug !== slug));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-light text-noir-950">
            Products Catalog
          </h1>
          <p className="text-xs text-noir-500">
            Manage your garment catalog, prices, categories, and variant inventory.
          </p>
        </div>

        <Link href="/admin/products/new">
          <Button variant="primary" size="md" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 border border-noir-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-noir-50 border border-noir-200 pl-9 pr-3 py-2 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
          />
          <Search className="w-3.5 h-3.5 text-noir-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase border ${
                statusFilter === ''
                  ? 'bg-noir-950 text-white border-noir-950'
                  : 'bg-white text-noir-600 border-noir-200 hover:border-noir-950'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase border ${
                statusFilter === 'ACTIVE'
                  ? 'bg-noir-950 text-white border-noir-950'
                  : 'bg-white text-noir-600 border-noir-200 hover:border-noir-950'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('DRAFT')}
              className={`px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase border ${
                statusFilter === 'DRAFT'
                  ? 'bg-noir-950 text-white border-noir-950'
                  : 'bg-white text-noir-600 border-noir-200 hover:border-noir-950'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-noir-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-noir-400 uppercase tracking-widest">
            Loading catalog...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <SlidersHorizontal className="w-6 h-6 mx-auto text-noir-300" />
            <p className="text-xs text-noir-500 uppercase tracking-wider">No garments found matching filter.</p>
            <Link href="/admin/products/new">
              <Button variant="outline" size="sm">Create First Product</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-noir-50/70 border-b border-noir-200 text-[10px] tracking-luxury uppercase text-noir-500">
                  <th className="py-3 px-4">Garment</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Badges</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noir-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-noir-50/50 transition-colors">
                    {/* Image & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-16 bg-noir-100 shrink-0 overflow-hidden">
                          {p.primary_image && (
                            <Image src={p.primary_image} alt={p.name} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-noir-950 block">{p.name}</span>
                          <span className="text-[10px] text-noir-400">/{p.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-noir-600 capitalize">
                      {p.category_name || 'Uncategorized'}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-semibold text-noir-950">
                      {formatPrice(p.price)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge variant={p.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {p.status}
                      </Badge>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold ${p.total_stock <= 5 ? 'text-amber-700' : 'text-noir-900'}`}>
                        {p.total_stock} units
                      </span>
                    </td>

                    {/* Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {p.is_featured && <Badge variant="outline">Featured</Badge>}
                        {p.is_new_arrival && <Badge variant="default">New</Badge>}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-noir-400 hover:text-noir-950 transition-colors"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {deleteConfirm === p.slug ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(p.slug)}
                              className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-1 text-noir-400 hover:text-noir-700 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(p.slug)}
                            className="p-1.5 text-noir-400 hover:text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

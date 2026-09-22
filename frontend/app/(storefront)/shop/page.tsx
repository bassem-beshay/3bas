import React from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { SortSelect } from '@/components/storefront/SortSelect';
import { SlidersHorizontal } from 'lucide-react';

export const revalidate = 30;

interface ShopPageProps {
  searchParams: {
    category?: string;
    size?: string;
    color?: string;
    sort?: string;
    search?: string;
    featured?: string;
    new_arrival?: string;
    best_seller?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [store, productsRes, categories] = await Promise.all([
    ApiClient.store.getCurrent().catch(() => null),
    ApiClient.products.list(searchParams).catch(() => ({ count: 0, results: [] })),
    ApiClient.categories.getAll().catch(() => []),
  ]);

  const products = productsRes.results || [];
  const currentCategory = searchParams.category || '';
  const currentSort = searchParams.sort || 'newest';
  const currentSize = searchParams.size || '';
  const currentSearch = searchParams.search || '';

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  // Helper to build URL with altered query param
  const buildFilterUrl = (param: string, value: string) => {
    const params = new URLSearchParams();
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.size) params.set('size', searchParams.size);
    if (searchParams.color) params.set('color', searchParams.color);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    if (searchParams.search) params.set('search', searchParams.search);

    if (value === '' || (params.get(param) === value)) {
      params.delete(param);
    } else {
      params.set(param, value);
    }
    const qs = params.toString();
    return `/shop${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar announcementText={store?.announcement_bar_text} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Collection Header */}
        <div className="border-b border-noir-200 pb-8 mb-8">
          <span className="text-[11px] font-medium tracking-luxury uppercase text-noir-500 block mb-2">
            The Catalog
          </span>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
            <h1 className="text-3xl sm:text-5xl font-serif text-noir-950 font-light capitalize">
              {currentCategory ? currentCategory : currentSearch ? `Results for "${currentSearch}"` : 'All Garments'}
            </h1>
            <span className="text-xs tracking-wider uppercase text-noir-500">
              {products.length} {products.length === 1 ? 'Piece' : 'Pieces'}
            </span>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-noir-100">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Link
              href="/shop"
              className={`text-[11px] font-medium tracking-editorial uppercase px-3.5 py-1.5 border transition-all whitespace-nowrap ${
                !currentCategory
                  ? 'bg-noir-950 text-white border-noir-950'
                  : 'bg-white text-noir-700 border-noir-200 hover:border-noir-950'
              }`}
            >
              All Categories
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={buildFilterUrl('category', cat.slug)}
                className={`text-[11px] font-medium tracking-editorial uppercase px-3.5 py-1.5 border transition-all whitespace-nowrap ${
                  currentCategory === cat.slug
                    ? 'bg-noir-950 text-white border-noir-950'
                    : 'bg-white text-noir-700 border-noir-200 hover:border-noir-950'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Size & Sort Selectors */}
          <div className="flex items-center gap-4 self-end md:self-auto">
            {/* Size filters */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] tracking-luxury uppercase text-noir-400 mr-1 hidden sm:inline">Size:</span>
              {sizes.map((s) => (
                <Link
                  key={s}
                  href={buildFilterUrl('size', s)}
                  className={`w-7 h-7 text-[10px] font-medium flex items-center justify-center border transition-all ${
                    currentSize === s
                      ? 'bg-noir-950 text-white border-noir-950'
                      : 'border-noir-200 text-noir-700 hover:border-noir-950'
                  }`}
                >
                  {s}
                </Link>
              ))}
            </div>

            {/* Sort options */}
            <SortSelect currentSort={currentSort} />
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <SlidersHorizontal className="w-8 h-8 mx-auto text-noir-300" />
            <h3 className="text-sm font-medium tracking-luxury uppercase text-noir-900">
              No matching pieces found
            </h3>
            <p className="text-xs text-noir-500 max-w-sm mx-auto">
              Try adjusting your category or size filters to discover other garments in the collection.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-block border border-noir-950 px-6 py-2.5 text-xs tracking-editorial uppercase font-medium hover:bg-noir-950 hover:text-white transition-all"
              >
                Clear All Filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-x-6 sm:gap-y-12">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

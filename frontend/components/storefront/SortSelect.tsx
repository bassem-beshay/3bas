'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

export const SortSelect: React.FC<{ currentSort: string }> = ({ currentSort }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }
    const qs = params.toString();
    router.push(`/shop${qs ? `?${qs}` : ''}`);
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="appearance-none bg-transparent border border-noir-200 text-noir-800 text-[11px] font-medium tracking-editorial uppercase pl-3 pr-8 py-1.5 hover:border-noir-950 focus:outline-none cursor-pointer"
      >
        <option value="newest">Sort: Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="featured">Curated Signatures</option>
      </select>
      <ArrowUpDown className="w-3 h-3 text-noir-500 absolute right-2.5 pointer-events-none" />
    </div>
  );
};

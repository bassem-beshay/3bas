'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductListItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: ProductListItem;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const displayImage = isHovered && product.secondary_image
    ? product.secondary_image
    : product.primary_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      className="group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-noir-100 block">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.is_new_arrival && (
            <Badge variant="default" className="text-[9px] tracking-luxury">
              New
            </Badge>
          )}
          {product.is_best_seller && (
            <Badge variant="outline" className="text-[9px] tracking-luxury bg-white/90">
              Signature
            </Badge>
          )}
          {product.total_stock <= 5 && product.total_stock > 0 && (
            <Badge variant="warning" className="text-[9px]">
              Low Stock
            </Badge>
          )}
          {product.total_stock === 0 && (
            <Badge variant="danger" className="text-[9px]">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Quick View Bar on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out bg-white/90 backdrop-blur-sm hidden sm:flex items-center justify-between text-[11px] font-medium tracking-editorial uppercase">
          <span>View Details</span>
          <span className="text-noir-500">
            {product.available_sizes?.join(' · ') || 'Select Size'}
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="pt-3.5 pb-1 flex flex-col flex-1">
        {/* Colors Preview */}
        {product.available_colors && product.available_colors.length > 1 && (
          <div className="flex items-center gap-1.5 mb-1.5">
            {product.available_colors.slice(0, 4).map((c, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 rounded-full border border-noir-300 inline-block shadow-sm"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            {product.available_colors.length > 4 && (
              <span className="text-[9px] text-noir-400">+{product.available_colors.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.slug}`} className="group-hover:text-noir-600 transition-colors">
            <h3 className="text-xs sm:text-sm font-normal text-noir-900 line-clamp-1 tracking-wide">
              {product.name}
            </h3>
          </Link>
          {product.category_name && (
            <span className="text-[10px] tracking-widest uppercase text-noir-400 shrink-0">
              {product.category_name}
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xs sm:text-sm font-medium text-noir-950">
            {formatPrice(product.price)}
          </span>
          {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
            <span className="text-[11px] text-noir-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

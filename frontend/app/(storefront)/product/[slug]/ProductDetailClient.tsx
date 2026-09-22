'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Truck, RotateCcw, ShieldCheck, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import { ProductDetail, ProductVariant } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductCard } from '@/components/storefront/ProductCard';

interface ProductDetailClientProps {
  product: ProductDetail;
  relatedProducts?: any[];
  currency?: string;
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  relatedProducts = [],
  currency = 'EGP',
}) => {
  const { addItem } = useCart();

  // Extract unique colors
  const colorOptions = React.useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>();
    product.variants.forEach((v) => {
      if (!map.has(v.color_name)) {
        map.set(v.color_name, { name: v.color_name, hex: v.color_hex });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  // Active selections
  const [selectedColor, setSelectedColor] = useState<string>(
    colorOptions[0]?.name || product.variants[0]?.color_name || ''
  );

  // Available sizes for the active color
  const availableSizesForColor = React.useMemo(() => {
    return product.variants.filter((v) => v.color_name === selectedColor && v.is_active);
  }, [product.variants, selectedColor]);

  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizesForColor.find((v) => v.stock_quantity > 0)?.size || availableSizesForColor[0]?.size || ''
  );

  // Active Variant
  const activeVariant: ProductVariant | undefined = React.useMemo(() => {
    return product.variants.find(
      (v) => v.color_name === selectedColor && v.size === selectedSize && v.is_active
    );
  }, [product.variants, selectedColor, selectedSize]);

  // Gallery state
  const images = product.images.length > 0
    ? product.images
    : [{ id: '1', image_url: product.primary_image, display_order: 0, is_cover: true }];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Accordion open/close state
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    description: true,
    details: true,
    shipping: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isOutOfStock = !activeVariant || activeVariant.stock_quantity <= 0;
  const isLowStock = activeVariant && activeVariant.stock_quantity > 0 && activeVariant.stock_quantity <= 5;

  const currentPrice = activeVariant?.effective_price ?? product.price;

  const handleAddToCart = () => {
    if (!activeVariant || isOutOfStock) return;

    addItem(
      {
        id: activeVariant.id,
        variant_id: activeVariant.id,
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(currentPrice),
        image_url: images[activeImageIndex]?.image_url || product.primary_image,
        color_name: activeVariant.color_name,
        color_hex: activeVariant.color_hex,
        size: activeVariant.size,
        sku: activeVariant.sku,
        max_stock: activeVariant.stock_quantity,
      },
      1
    );
  };

  return (
    <div className="pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumbs */}
        <nav className="text-[11px] tracking-wider uppercase text-noir-400 mb-8 flex items-center space-x-2">
          <Link href="/" className="hover:text-noir-900 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-noir-900 transition-colors">Catalog</Link>
          <span>/</span>
          {product.category_name && (
            <>
              <Link href={`/shop?category=${product.category_slug}`} className="hover:text-noir-900 transition-colors">
                {product.category_name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-noir-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* LEFT: Product Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[650px] shrink-0 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 bg-noir-100 overflow-hidden border transition-all ${
                      activeImageIndex === idx
                        ? 'border-noir-950 opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || product.name}
                      fill
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Focal Image */}
            <div className="flex-1 relative aspect-[3/4] bg-noir-100 overflow-hidden">
              <Image
                src={images[activeImageIndex]?.image_url || product.primary_image}
                alt={product.name}
                fill
                priority
                className="object-cover object-center transition-all duration-300"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_new_arrival && <Badge variant="default">New</Badge>}
                {product.is_best_seller && <Badge variant="outline" className="bg-white/90">Signature</Badge>}
              </div>
            </div>
          </div>

          {/* RIGHT: Product Ordering & Specs */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Category & Title */}
              <div className="space-y-1.5 border-b border-noir-200 pb-6">
                {product.category_name && (
                  <span className="text-[11px] font-medium tracking-luxury uppercase text-noir-400 block">
                    {product.category_name}
                  </span>
                )}
                <h1 className="text-2xl sm:text-3xl font-serif font-normal text-noir-950">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="pt-2 flex items-baseline gap-3">
                  <span className="text-xl font-medium text-noir-950">
                    {formatPrice(currentPrice, currency)}
                  </span>
                  {product.compare_at_price && Number(product.compare_at_price) > Number(currentPrice) && (
                    <span className="text-sm text-noir-400 line-through">
                      {formatPrice(product.compare_at_price, currency)}
                    </span>
                  )}
                </div>
              </div>

              {/* COLOR SELECTOR */}
              {colorOptions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="tracking-editorial uppercase font-medium text-noir-900">
                      Color: <span className="font-normal text-noir-600">{selectedColor}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {colorOptions.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => {
                          setSelectedColor(c.name);
                          // Auto select first available size in new color
                          const sizesForC = product.variants.filter((v) => v.color_name === c.name && v.is_active);
                          const firstInStock = sizesForC.find((v) => v.stock_quantity > 0) || sizesForC[0];
                          if (firstInStock) setSelectedSize(firstInStock.size);
                        }}
                        className={`group relative p-1 rounded-full border transition-all ${
                          selectedColor === c.name
                            ? 'border-noir-950 ring-1 ring-noir-950'
                            : 'border-transparent hover:border-noir-300'
                        }`}
                        title={c.name}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-noir-200 block"
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SIZE SELECTOR */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="tracking-editorial uppercase font-medium text-noir-900">
                    Select Size
                  </span>
                  <button className="text-noir-500 hover:text-noir-950 underline underline-offset-2">
                    Size Guide
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {availableSizesForColor.map((variant) => {
                    const isSelected = selectedSize === variant.size;
                    const isSoldOut = variant.stock_quantity <= 0;

                    return (
                      <button
                        key={variant.id}
                        disabled={isSoldOut}
                        onClick={() => setSelectedSize(variant.size)}
                        className={`h-12 border text-xs font-medium uppercase tracking-wider transition-all flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'bg-noir-950 text-white border-noir-950 shadow-sm'
                            : isSoldOut
                            ? 'border-noir-200 bg-noir-50 text-noir-300 cursor-not-allowed line-through'
                            : 'border-noir-200 text-noir-800 hover:border-noir-900 bg-white'
                        }`}
                      >
                        <span>{variant.size}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Stock Level Warning */}
                {isLowStock && (
                  <p className="text-xs text-amber-700 flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Low Stock: Only {activeVariant?.stock_quantity} remaining in {selectedColor} ({selectedSize}).</span>
                  </p>
                )}
                {isOutOfStock && (
                  <p className="text-xs text-red-600 flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>This size is currently sold out.</span>
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="w-full tracking-luxury text-xs py-4"
                >
                  {isOutOfStock ? 'Sold Out' : `Add to Bag — ${formatPrice(currentPrice, currency)}`}
                </Button>

                <div className="flex items-center justify-between text-[11px] text-noir-500 pt-1">
                  <div className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free Domestic Delivery over EGP 1,500</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>14-Day Exchanges</span>
                  </div>
                </div>
              </div>

              {/* ACCORDIONS */}
              <div className="border-t border-noir-200 divide-y divide-noir-200 pt-2">
                {/* Description */}
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion('description')}
                    className="w-full flex items-center justify-between text-xs font-medium tracking-editorial uppercase text-noir-900"
                  >
                    <span>Description & Silhouette</span>
                    {openAccordions.description ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openAccordions.description && (
                    <div className="mt-3 text-xs text-noir-600 leading-relaxed space-y-2">
                      <p>{product.description}</p>
                    </div>
                  )}
                </div>

                {/* Materials & Details */}
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion('details')}
                    className="w-full flex items-center justify-between text-xs font-medium tracking-editorial uppercase text-noir-900"
                  >
                    <span>Fabric, Details & Care</span>
                    {openAccordions.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openAccordions.details && (
                    <div className="mt-3 text-xs text-noir-600 leading-relaxed space-y-2">
                      <p className="font-medium text-noir-800">{product.details || '100% Egyptian Cotton. Handcrafted construction.'}</p>
                      <p className="text-noir-500">{product.care_instructions || 'Dry clean or gentle hand wash cold.'}</p>
                      {product.base_sku && <p className="text-[10px] text-noir-400">SKU: {product.base_sku}</p>}
                    </div>
                  )}
                </div>

                {/* Shipping & Return Policy */}
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion('shipping')}
                    className="w-full flex items-center justify-between text-xs font-medium tracking-editorial uppercase text-noir-900"
                  >
                    <span>Complimentary Courier & Returns</span>
                    {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {openAccordions.shipping && (
                    <div className="mt-3 text-xs text-noir-600 leading-relaxed space-y-2">
                      <p>
                        We offer complimentary express shipping on all orders over EGP 1,500. Standard shipping within Cairo and Giza takes 24–48 hours.
                      </p>
                      <p>
                        Garments can be exchanged or returned within 14 days of receipt, provided items are unworn and retain all original tags.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STICKY BOTTOM BAR FOR MOBILE CONVERSION */}
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-noir-200 p-3 z-30 sm:hidden flex items-center justify-between shadow-lg">
          <div>
            <span className="block text-xs font-medium text-noir-900 truncate max-w-[170px]">{product.name}</span>
            <span className="text-xs font-semibold text-noir-950">{formatPrice(currentPrice, currency)}</span>
          </div>
          <Button
            size="sm"
            variant="primary"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="tracking-luxury text-[10px] px-4"
          >
            {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
          </Button>
        </div>

        {/* RELATED PIECES */}
        {relatedProducts.length > 0 && (
          <div className="mt-28 border-t border-noir-200 pt-16">
            <h2 className="text-xl sm:text-2xl font-serif text-noir-950 mb-8">
              Complete the Look
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

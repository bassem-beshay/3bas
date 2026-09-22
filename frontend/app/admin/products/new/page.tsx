'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Sparkles, Check } from 'lucide-react';
import { Category } from '@/types';
import { ApiClient } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface ColorRow {
  name: string;
  hex: string;
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [baseSku, setBaseSku] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);

  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [careInstructions, setCareInstructions] = useState('');

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
  ]);

  // Variant Matrix: Colors & Sizes
  const [colors, setColors] = useState<ColorRow[]>([
    { name: 'Noir Black', hex: '#111111' },
    { name: 'Bone White', hex: '#F4F3EF' },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#333333');

  const allSizes = ['XS', 'S', 'M', 'L', 'XL'];
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);

  // Stock Matrix Map: [colorName_size] -> quantity
  const [stockMatrix, setStockMatrix] = useState<Record<string, number>>({
    'Noir Black_S': 5,
    'Noir Black_M': 12,
    'Noir Black_L': 0,
    'Noir Black_XL': 4,
    'Bone White_S': 3,
    'Bone White_M': 8,
    'Bone White_L': 6,
    'Bone White_XL': 2,
  });

  useEffect(() => {
    ApiClient.categories.getAll().then((res) => {
      setCategories(res);
      if (res.length > 0) setCategory(res[0].id);
    }).catch(() => {});
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(autoSlug);
    if (!baseSku) {
      setBaseSku(`NOIR-${autoSlug.slice(0, 4).toUpperCase()}`);
    }
  };

  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const trimmed = newColorName.trim();
    if (!colors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setColors([...colors, { name: trimmed, hex: newColorHex }]);
      // initialize stocks
      const updated = { ...stockMatrix };
      selectedSizes.forEach((s) => {
        updated[`${trimmed}_${s}`] = 5;
      });
      setStockMatrix(updated);
      setNewColorName('');
    }
  };

  const handleRemoveColor = (nameToRemove: string) => {
    setColors(colors.filter((c) => c.name !== nameToRemove));
  };

  const handleStockChange = (colorName: string, size: string, quantity: number) => {
    const key = `${colorName}_${size}`;
    setStockMatrix((prev) => ({
      ...prev,
      [key]: Math.max(0, quantity),
    }));
  };

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleUpdateImageUrl = (idx: number, val: string) => {
    const updated = [...imageUrls];
    updated[idx] = val;
    setImageUrls(updated);
  };

  const handleRemoveImageUrl = (idx: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !price) {
      setErrorMessage('Please fill in required fields: Name, Slug, Price.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Build variants payload
      const variantsPayload: any[] = [];
      colors.forEach((c) => {
        selectedSizes.forEach((sz) => {
          const qty = stockMatrix[`${c.name}_${sz}`] ?? 0;
          variantsPayload.push({
            sku: `${baseSku || 'NOIR'}-${c.name.slice(0, 3).toUpperCase()}-${sz}`,
            size: sz,
            color_name: c.name,
            color_hex: c.hex,
            stock_quantity: qty,
            is_active: true,
          });
        });
      });

      // Build images payload
      const validImages = imageUrls.filter((url) => url.trim() !== '');
      const imagesPayload = validImages.map((url, idx) => ({
        image_url: url,
        display_order: idx,
        is_cover: idx === 0,
      }));

      const payload = {
        name,
        slug,
        category: category || null,
        price: parseFloat(price),
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        base_sku: baseSku,
        status,
        is_featured: isFeatured,
        is_new_arrival: isNewArrival,
        is_best_seller: isBestSeller,
        description,
        details,
        care_instructions: careInstructions,
        images: imagesPayload,
        variants: variantsPayload,
      };

      await ApiClient.products.create(payload);
      router.push('/admin/products');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create product.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="text-xs font-medium tracking-editorial uppercase text-noir-500 hover:text-noir-950 flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>
        <span className="text-xs font-medium text-noir-400 uppercase tracking-widest">
          New Piece Creation
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* SECTION 1: ESSENTIAL INFO */}
        <div className="bg-white p-6 sm:p-8 border border-noir-200 space-y-6">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-noir-900 border-b border-noir-100 pb-3">
            1. General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Product Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Oversized Heavyweight T-Shirt"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
              />
            </div>

            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                URL Slug *
              </label>
              <input
                type="text"
                required
                placeholder="oversized-heavyweight-tshirt"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-noir-50 border border-noir-200 p-3 text-xs text-noir-950 font-mono focus:outline-none focus:border-noir-950"
              />
            </div>

            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Base SKU
              </label>
              <input
                type="text"
                placeholder="e.g. NOIR-TEE-01"
                value={baseSku}
                onChange={(e) => setBaseSku(e.target.value)}
                className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950 font-mono"
              />
            </div>

            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Selling Price (EGP) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="780.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950 font-semibold"
              />
            </div>

            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Compare-at Price (EGP)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="950.00"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-noir-100 text-xs">
            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-noir-200 p-2.5 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
              >
                <option value="ACTIVE">Active (Published)</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isNewArrival"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="text-noir-950 focus:ring-0"
              />
              <label htmlFor="isNewArrival" className="uppercase tracking-wider text-noir-800">
                New Arrival
              </label>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="text-noir-950 focus:ring-0"
              />
              <label htmlFor="isFeatured" className="uppercase tracking-wider text-noir-800">
                Featured Piece
              </label>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isBestSeller"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="text-noir-950 focus:ring-0"
              />
              <label htmlFor="isBestSeller" className="uppercase tracking-wider text-noir-800">
                Best Seller
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 2: EDITORIAL CONTENT & MATERIALS */}
        <div className="bg-white p-6 sm:p-8 border border-noir-200 space-y-6">
          <h2 className="text-xs font-semibold tracking-luxury uppercase text-noir-900 border-b border-noir-100 pb-3">
            2. Narrative & Craftsmanship Specs
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                Product Story & Description
              </label>
              <textarea
                rows={3}
                placeholder="A signature foundation piece crafted from 280 GSM combed Egyptian cotton jersey..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                  Fabric & Details (e.g. GSM, lining, buttons)
                </label>
                <textarea
                  rows={2}
                  placeholder="100% Combed Egyptian Cotton. 280 GSM heavyweight jersey. Dropped shoulder profile."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
                />
              </div>

              <div>
                <label className="block text-noir-700 uppercase tracking-wider mb-1 font-medium">
                  Care & Preservation
                </label>
                <textarea
                  rows={2}
                  placeholder="Machine wash cold inside out. Dry flat. Cool iron on reverse."
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  className="w-full bg-white border border-noir-200 p-3 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: EDITORIAL IMAGES */}
        <div className="bg-white p-6 sm:p-8 border border-noir-200 space-y-6">
          <div className="flex items-center justify-between border-b border-noir-100 pb-3">
            <h2 className="text-xs font-semibold tracking-luxury uppercase text-noir-900">
              3. Editorial Imagery (High-Resolution URLs)
            </h2>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="text-xs font-medium text-noir-900 hover:text-noir-600 uppercase tracking-wider flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image</span>
            </button>
          </div>

          <div className="space-y-3">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-[10px] text-noir-400 font-mono w-16">
                  {idx === 0 ? 'Cover' : `Photo ${idx + 1}`}
                </span>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={url}
                  onChange={(e) => handleUpdateImageUrl(idx, e.target.value)}
                  className="flex-1 bg-white border border-noir-200 p-2.5 text-xs text-noir-950 focus:outline-none focus:border-noir-950"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrl(idx)}
                    className="p-2 text-noir-400 hover:text-red-600"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: INTERACTIVE VARIANT-LEVEL INVENTORY MATRIX */}
        <div className="bg-white p-6 sm:p-8 border border-noir-200 space-y-6">
          <div className="flex items-center justify-between border-b border-noir-100 pb-3">
            <div>
              <h2 className="text-xs font-semibold tracking-luxury uppercase text-noir-900">
                4. Color & Size Variant-Level Inventory Matrix
              </h2>
              <p className="text-[11px] text-noir-500">
                Configure colors, sizes, and precise stock allocations per SKU.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider bg-noir-100 px-2 py-0.5 rounded font-mono">
                {colors.length * selectedSizes.length} Total SKUs
              </span>
            </div>
          </div>

          {/* Add Color Form */}
          <div className="bg-noir-50 p-4 border border-noir-200 space-y-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-noir-800 block">
              Add Colorway
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Color Name (e.g. Sage Green)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="bg-white border border-noir-200 px-3 py-2 text-xs text-noir-950 focus:outline-none w-48"
              />
              <div className="flex items-center gap-2 bg-white border border-noir-200 px-2 py-1.5">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs font-mono text-noir-700">{newColorHex}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddColor}
              >
                + Add Colorway
              </Button>
            </div>
          </div>

          {/* Sizes Checkboxes */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-noir-700 block">
              Active Sizes
            </span>
            <div className="flex items-center gap-3">
              {allSizes.map((s) => (
                <label key={s} className="flex items-center gap-1.5 text-xs text-noir-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(s)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSizes([...selectedSizes, s]);
                      } else {
                        setSelectedSizes(selectedSizes.filter((item) => item !== s));
                      }
                    }}
                    className="text-noir-950 focus:ring-0"
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* THE STOCK MATRIX TABLE */}
          <div className="border border-noir-200 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-noir-950 text-white text-[10px] tracking-luxury uppercase">
                  <th className="py-3 px-4">Colorway</th>
                  {selectedSizes.map((s) => (
                    <th key={s} className="py-3 px-4 text-center">
                      Size {s}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right">Color Stock</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noir-100">
                {colors.map((c) => {
                  const colorTotal = selectedSizes.reduce(
                    (sum, s) => sum + (stockMatrix[`${c.name}_${s}`] ?? 0),
                    0
                  );

                  return (
                    <tr key={c.name} className="hover:bg-noir-50/50">
                      {/* Color Title */}
                      <td className="py-3 px-4 font-medium text-noir-900">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-noir-300 shadow-sm"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </div>
                      </td>

                      {/* Size Stock Inputs */}
                      {selectedSizes.map((s) => {
                        const qty = stockMatrix[`${c.name}_${s}`] ?? 0;
                        return (
                          <td key={s} className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) =>
                                handleStockChange(c.name, s, parseInt(e.target.value) || 0)
                              }
                              className={`w-16 text-center border p-1 text-xs font-semibold focus:outline-none focus:border-noir-950 ${
                                qty === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white border-noir-200 text-noir-950'
                              }`}
                            />
                          </td>
                        );
                      })}

                      {/* Color Total */}
                      <td className="py-3 px-4 text-right font-bold text-noir-950">
                        {colorTotal}
                      </td>

                      {/* Remove Color */}
                      <td className="py-3 px-4 text-center">
                        {colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(c.name)}
                            className="text-noir-400 hover:text-red-600 p-1"
                            title="Remove Color"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href="/admin/products">
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="tracking-luxury"
          >
            {isSubmitting ? 'Publishing Garment...' : 'Publish Product & Deploy Variants'}
          </Button>
        </div>
      </form>
    </div>
  );
}

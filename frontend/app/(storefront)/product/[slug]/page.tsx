import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ApiClient } from '@/lib/api';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { ProductDetailClient } from './ProductDetailClient';

export const revalidate = 30;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const product = await ApiClient.products.getBySlug(params.slug);
    if (!product) return { title: 'Product Not Found' };

    return {
      title: `${product.name} — NOIRÉ`,
      description: product.description.slice(0, 160),
      openGraph: {
        title: `${product.name} — NOIRÉ`,
        description: product.description.slice(0, 160),
        images: [
          {
            url: product.primary_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
            width: 1000,
            height: 1200,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} — NOIRÉ`,
        description: product.description.slice(0, 160),
        images: [product.primary_image],
      },
    };
  } catch {
    return { title: 'NOIRÉ Piece' };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [store, product, relatedRes] = await Promise.all([
    ApiClient.store.getCurrent().catch(() => null),
    ApiClient.products.getBySlug(params.slug).catch(() => null),
    ApiClient.products.list({ limit: 4 }).catch(() => ({ results: [] })),
  ]);

  if (!product) {
    notFound();
  }

  const related = (relatedRes.results || []).filter((p) => p.slug !== product.slug);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar announcementText={store?.announcement_bar_text} />
      <main className="flex-1">
        <ProductDetailClient
          product={product}
          relatedProducts={related}
          currency={store?.currency || 'EGP'}
        />
      </main>
      <Footer />
    </div>
  );
}

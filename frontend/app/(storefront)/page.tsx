import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Shield, Truck, RotateCcw } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Button } from '@/components/ui/Button';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getStoreData() {
  try {
    const [store, productsRes, categories] = await Promise.all([
      ApiClient.store.getCurrent(),
      ApiClient.products.list({ limit: 12 }),
      ApiClient.categories.getAll(),
    ]);
    return {
      store,
      products: productsRes.results || [],
      categories,
    };
  } catch (error) {
    console.error('Failed to fetch storefront data:', error);
    return {
      store: null,
      products: [],
      categories: [],
    };
  }
}

export default async function HomePage() {
  const { store, products, categories } = await getStoreData();

  const featuredProducts = products.filter((p) => p.is_featured || p.is_best_seller).slice(0, 4);
  const newArrivals = products.filter((p) => p.is_new_arrival).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar announcementText={store?.announcement_bar_text} />

      <main className="flex-1">
        {/* EDITORIAL HERO SECTION */}
        <section className="relative h-[85vh] sm:h-[90vh] w-full bg-noir-950 overflow-hidden flex items-end">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
              alt="NOIRÉ Editorial Campaign"
              fill
              priority
              className="object-cover object-top opacity-75 filter brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 w-full">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] tracking-luxury uppercase">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Collection 01 / Pre-Fall</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.05] font-serif">
                Form, Texture & <br />
                <span className="italic font-light">Sculpted Volume</span>
              </h1>

              <p className="text-noir-200 text-sm sm:text-base font-light max-w-lg leading-relaxed">
                An exploration of architectural tailoring, heavyweight Egyptian cotton jersey, and pure minimalist restraint.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link href="/shop">
                  <Button variant="primary" size="lg" className="bg-white text-noir-950 hover:bg-noir-100">
                    Explore Collection
                  </Button>
                </Link>
                <Link href="/shop?category=outerwear">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-noir-950">
                    View Tailoring
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPOSITION BAR */}
        <section className="border-b border-noir-200 bg-noir-50/70 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <Truck className="w-4 h-4 text-noir-700 shrink-0" />
                <div className="text-left">
                  <h4 className="text-[11px] font-medium tracking-editorial uppercase text-noir-900">Complimentary Courier</h4>
                  <p className="text-[10px] text-noir-500">Orders over EGP 1,500</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Shield className="w-4 h-4 text-noir-700 shrink-0" />
                <div className="text-left">
                  <h4 className="text-[11px] font-medium tracking-editorial uppercase text-noir-900">100% Egyptian Cotton</h4>
                  <p className="text-[10px] text-noir-500">280 GSM heavyweight jersey</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <RotateCcw className="w-4 h-4 text-noir-700 shrink-0" />
                <div className="text-left">
                  <h4 className="text-[11px] font-medium tracking-editorial uppercase text-noir-900">14-Day Exchanges</h4>
                  <p className="text-[10px] text-noir-500">Doorstep trial & returns</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-4 h-4 text-noir-700 shrink-0" />
                <div className="text-left">
                  <h4 className="text-[11px] font-medium tracking-editorial uppercase text-noir-900">Tailored Precision</h4>
                  <p className="text-[10px] text-noir-500">Sculptural silhouettes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EDITORIAL CATEGORY TILES (Asymmetric, Not standard card boxes) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-[11px] font-medium tracking-luxury uppercase text-noir-500 block mb-2">
                Curated Chapters
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif text-noir-950">
                Explore by Silhouette
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-medium tracking-editorial uppercase text-noir-900 hover:text-noir-600 flex items-center gap-2 mt-4 sm:mt-0"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Big Feature Tile - Outerwear */}
            <div className="md:col-span-7 group relative aspect-[4/5] sm:aspect-[16/11] overflow-hidden bg-noir-100">
              <Image
                src="https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=85"
                alt="Outerwear Collection"
                fill
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 text-white space-y-2">
                <span className="text-[10px] tracking-luxury uppercase text-white/80">
                  Chapter 01
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif tracking-wide">
                  Outerwear & Tailoring
                </h3>
                <p className="text-xs sm:text-sm text-white/80 font-light max-w-md">
                  Double-breasted virgin wool blazers, storm-flap trenches, and structural overcoats.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop?category=outerwear"
                    className="inline-flex items-center gap-2 text-xs font-medium tracking-editorial uppercase text-white hover:underline underline-offset-4"
                  >
                    <span>Discover Outerwear</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column Stack */}
            <div className="md:col-span-5 grid grid-cols-1 gap-6">
              {/* Tile 2 - Knitwear */}
              <div className="group relative aspect-[4/3] overflow-hidden bg-noir-100">
                <Image
                  src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=85"
                  alt="Knitwear Collection"
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-1">
                  <span className="text-[10px] tracking-luxury uppercase text-white/80">
                    Chapter 02
                  </span>
                  <h3 className="text-xl font-serif">Brushed Knitwear</h3>
                  <Link
                    href="/shop?category=knitwear"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-editorial uppercase text-white hover:underline"
                  >
                    <span>Explore Knits</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Tile 3 - Tops & Trousers */}
              <div className="group relative aspect-[4/3] overflow-hidden bg-noir-100">
                <Image
                  src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=85"
                  alt="Trousers & Tailoring"
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-1">
                  <span className="text-[10px] tracking-luxury uppercase text-white/80">
                    Chapter 03
                  </span>
                  <h3 className="text-xl font-serif">Trousers & Denim</h3>
                  <Link
                    href="/shop?category=trousers"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-editorial uppercase text-white hover:underline"
                  >
                    <span>Explore Trousers</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NEW ARRIVALS CAROUSEL/GRID */}
        <section className="bg-noir-50/50 py-20 sm:py-28 border-y border-noir-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <span className="text-[11px] font-medium tracking-luxury uppercase text-noir-500 block mb-2">
                  Just Arrived
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif text-noir-950">
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/shop?sort=newest"
                className="text-xs font-medium tracking-editorial uppercase text-noir-900 hover:text-noir-600 flex items-center gap-2 mt-4 sm:mt-0"
              >
                <span>View All New</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {newArrivals.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 2} />
              ))}
            </div>
          </div>
        </section>

        {/* EDITORIAL SPOTLIGHT / STORYTELLING SECTION */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 relative aspect-[3/4] bg-noir-100 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
                  alt="NOIRÉ Craftsmanship"
                  fill
                  className="object-cover object-center"
                />
              </div>

              <div className="lg:col-span-6 space-y-8">
                <div className="space-y-3">
                  <span className="text-[11px] font-medium tracking-luxury uppercase text-noir-500 block">
                    The Studio Manifesto
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-serif font-light text-noir-950 leading-tight">
                    Substance Before <br />
                    <span className="italic">Ornamentation</span>
                  </h2>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-noir-600 font-light leading-relaxed">
                  <p>
                    Every NOIRÉ piece begins with fiber density and tactile balance. By weaving 280 GSM long-staple Egyptian cotton
                    and sourcing certified virgin wools, our silhouettes retain their sculptural composure through years of wear.
                  </p>
                  <p>
                    We reject trend-driven cycles in favor of intentional proportions, drop shoulders, and relaxed tailoring that adapts effortlessly
                    to contemporary urban life.
                  </p>
                </div>

                <div className="pt-4 border-t border-noir-200 grid grid-cols-3 gap-6 text-center">
                  <div>
                    <span className="block text-2xl font-serif text-noir-950">280</span>
                    <span className="text-[10px] tracking-widest uppercase text-noir-400">GSM Cotton</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-serif text-noir-950">100%</span>
                    <span className="text-[10px] tracking-widest uppercase text-noir-400">Virgin Wool</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-serif text-noir-950">14-Day</span>
                    <span className="text-[10px] tracking-widest uppercase text-noir-400">Complimentary Trial</span>
                  </div>
                </div>

                <div className="pt-4">
                  <Link href="/shop">
                    <Button variant="primary" size="lg">
                      Explore All Garments
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED / BEST SELLERS SECTION */}
        <section className="bg-noir-100/50 py-20 sm:py-28 border-t border-noir-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <span className="text-[11px] font-medium tracking-luxury uppercase text-noir-500 block mb-2">
                  Permanent Collection
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif text-noir-950">
                  Signature Essentials
                </h2>
              </div>
              <Link
                href="/shop?best_seller=true"
                className="text-xs font-medium tracking-editorial uppercase text-noir-900 hover:text-noir-600 flex items-center gap-2 mt-4 sm:mt-0"
              >
                <span>View Signatures</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

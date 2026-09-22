import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartDrawer } from '@/components/storefront/CartDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0B0B0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    template: '%s | NOIRÉ',
    default: 'NOIRÉ — Architectural Silhouettes & Contemporary Luxury',
  },
  description:
    'NOIRÉ creates timeless ready-to-wear luxury garments defined by sculptural cuts, premium Egyptian cotton, virgin wool, and artisanal Italian craftsmanship.',
  keywords: [
    'luxury fashion',
    'designer clothing',
    'minimalist menswear',
    'contemporary womenswear',
    'high fashion',
    'cairo fashion',
    'egyptian cotton',
    'tailoring',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://noire.studio',
    siteName: 'NOIRÉ',
    title: 'NOIRÉ — Architectural Silhouettes & Contemporary Luxury',
    description:
      'Contemporary fashion house exploring sculptural silhouettes, heavy Egyptian cotton, and pure minimalist lines.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'NOIRÉ Lookbook',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOIRÉ — Architectural Silhouettes & Contemporary Luxury',
    description:
      'Contemporary fashion house exploring sculptural silhouettes, heavy Egyptian cotton, and pure minimalist lines.',
    images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-white text-noir-900 selection:bg-noir-900 selection:text-white antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

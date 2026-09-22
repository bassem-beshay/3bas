# NOIRÉ — Premium Multi-Tenant Fashion E-Commerce Platform

NOIRÉ is the initial foundation of a high-fashion, multi-tenant e-commerce SaaS platform engineered to compete aesthetically and functionally with modern global fashion powerhouses (SSENSE, COS, Zara, Toteme).

Built for clothing brands that demand sculptural editorial aesthetics, instant conversion, variant-level inventory control, and logical tenant isolation.

---

## Architecture & Tech Stack

```
                                  CLIENT LAYER
                   Next.js 14 App Router + TypeScript + Tailwind CSS
                         ┌───────────────────┬───────────────────┐
                         │    STOREFRONT     │  BRAND DASHBOARD  │
                         │    /shop, etc.    │    /admin, etc.   │
                         └─────────┬─────────┴─────────┬─────────┘
                                   │                   │
                                   │ X-Store-Slug      │ Bearer JWT Auth
                                   ▼                   ▼
                                 DJANGO REST BACKEND
                       Tenant Resolution Middleware & Query Scoping
                         ┌───────────────────────────────────────┐
                         │ apps/users, stores, products, orders, │
                         │ categories, inventory, analytics      │
                         └───────────────────┬───────────────────┘
                                             │
                                             ▼
                                  PostgreSQL / SQLite
```

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.12, Django 5.0, Django REST Framework, SimpleJWT authentication, Django Filter, WhiteNoise.
- **Database**: PostgreSQL (production-ready via `DATABASE_URL`) or SQLite (zero-config local dev).
- **Design Direction**: Luxury editorial aesthetic (stark black & white `#0B0B0B`, generous whitespace, editorial typography, asymmetric grids, instant slide-over bag).

---

## Monorepo Project Structure

```
/
  frontend/
    app/
      (storefront)/
        page.tsx                 # High-fashion editorial homepage
        shop/page.tsx            # Dynamic catalog with faceted filters
        product/[slug]/page.tsx  # Product details with variant matrix
        cart/page.tsx            # Bag review with promo code engine
        checkout/page.tsx        # High-conversion 1-page checkout
        order-confirmed/[...]/   # Receipt & fulfillment progress
      admin/
        layout.tsx               # Merchant dashboard shell
        login/page.tsx           # Brand manager auth with 1-click demo fill
        dashboard/page.tsx       # Live executive KPIs, timeline, alerts
        products/page.tsx        # Product catalog table & status filter
        products/new/page.tsx    # Authoring with interactive Variant Matrix
        inventory/page.tsx       # Inline variant stock adjuster
        orders/page.tsx          # Order pipeline with status updates
        analytics/page.tsx       # Category, size, and color breakdowns
        settings/page.tsx        # Multi-tenant and domain configurations
    components/
      storefront/                # Navbar, Footer, ProductCard, CartDrawer
      ui/                        # Button, Badge, Modal primitives
    context/                     # CartContext, AuthContext
    lib/                         # ApiClient, formatters, utilities
    types/                       # Strict TypeScript interfaces
  backend/
    config/                      # Django settings, URLs, WSGI, ASGI
    apps/
      core/                      # Multi-tenant base models & middleware
        management/commands/
          seed_demo_data.py      # Curated 12+ luxury products seeder
      stores/                    # Brand tenant models & routing
      users/                     # Custom user model & JWT endpoints
      categories/                # Fashion taxonomy
      products/                  # Products, images, color/size variants
      inventory/                 # Variant stock tracking & adjustments
      orders/                    # Order lifecycle & atomic checkout
      customers/                 # Client profiles & spend history
      marketing/                 # Coupons & promo discount engine
      analytics/                 # Business telemetry & telemetry KPIs
    requirements/                # Python dependencies
    manage.py
  docs/                          # Architecture & design documentation
  .env.example                   # Master environment template
  README.md
```

---

## Quick Start Guide

### 1. Backend Setup

1. Open your terminal in `./backend`:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements/base.txt
   ```
3. Run migrations:
   ```bash
   python manage.py migrate
   ```
4. Seed demo brand ("NOIRÉ"), products, variants, orders, and analytics:
   ```bash
   python manage.py seed_demo_data
   ```
5. Start the backend development server:
   ```bash
   python manage.py runserver 8000
   ```
   *The backend API will be running at `http://localhost:8000/api`.*

---

### 2. Frontend Setup

1. Open a new terminal in `./frontend`:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The storefront will be live at `http://localhost:3000`.*

---

## Demo Credentials & Flow

### Storefront Experience
- **URL**: `http://localhost:3000`
- **Browse Catalog**: Discover the Pre-Fall collection, filter by category (`Outerwear`, `Knitwear`, `Tops`, `Trousers`, `Accessories`) or by size (`S`, `M`, `L`, `XL`).
- **Product Details**: Open any garment (e.g. `Heavyweight Boxy T-Shirt`), select colorway (`Noir Black` or `Bone White`), select size, view live stock level.
- **Cart & Slide Drawer**: Add to bag; the slide-in cart drawer opens automatically with free domestic shipping progress.
- **Checkout**: Enter address in Cairo/Giza, choose **Cash on Delivery (COD)** or **Card**, test promo code `WELCOME10` (-10%), and place order.
- **Confirmation**: View the confirmed receipt and tracking status.

### Brand Admin Portal
- **URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@noire.studio`
- **Password**: `admin123456`
  *(A 1-click "Auto-fill" button is provided on the login screen for instant access)*
- **Dashboard**: Review revenue (EGP), total orders, average order value (AOV), 7-day revenue chart, top products, and low stock warnings.
- **Products**: View all products; click **+ Add New Product** to test the **Interactive Variant Matrix Builder** (combines Colors $\times$ Sizes with individual stock inputs).
- **Inventory**: Review all SKUs; click **Adjust** on any variant to update stock quantities directly.
- **Orders**: View order pipeline; click **Manage** on any order to progress its status: `Confirmed` $\rightarrow$ `Preparing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`.
- **Analytics**: View distribution charts by category, size preference, and color affinity.

---

## Multi-Tenancy Architecture

Each brand is logically isolated in the database:
- All models inherit from `TenantModel`, linking them directly to a `Store` tenant.
- The `TenantResolutionMiddleware` extracts the active brand using:
  1. `X-Store-Slug` HTTP header (e.g. `noire`).
  2. Hostname subdomain (e.g. `noire.platform.com`).
  3. Custom domain (e.g. `noire.studio`).
  4. Query parameter fallback (`?store=noire`).
- Future brands can be created via the Django admin or API without needing separate Django instances.

---

## License
Proprietary fashion e-commerce architecture. Built with clean, scalable, and modern standards.

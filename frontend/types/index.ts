export interface Store {
  id: string;
  name: string;
  slug: string;
  custom_domain?: string;
  tagline: string;
  description: string;
  currency: string;
  currency_symbol: string;
  logo_url?: string;
  banner_url?: string;
  contact_email: string;
  contact_phone: string;
  instagram_url?: string;
  tiktok_url?: string;
  announcement_bar_text: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  products_count?: number;
  subcategories?: Category[];
}

export interface ColorOption {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color_name: string;
  color_hex: string;
  stock_quantity: number;
  price_override?: number | null;
  effective_price: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_cover: boolean;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  category?: string;
  category_name?: string;
  category_slug?: string;
  primary_image: string;
  secondary_image?: string | null;
  available_colors: ColorOption[];
  available_sizes: string[];
  total_stock: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  created_at: string;
}

export interface ProductDetail extends ProductListItem {
  description: string;
  details: string;
  care_instructions: string;
  tags?: string;
  base_sku?: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface CartItem {
  id: string; // Unique cart item ID (variant_id)
  variant_id: string;
  product_id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  color_name: string;
  color_hex: string;
  size: string;
  sku: string;
  quantity: number;
  max_stock: number;
}

export interface OrderItem {
  id: string;
  product?: string;
  variant?: string;
  product_name: string;
  variant_title: string;
  sku: string;
  image_url?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  postal_code?: string;
  country: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_method: 'COD' | 'CARD' | 'INSTAPAY';
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  subtotal: number;
  discount_amount: number;
  discount_code?: string;
  shipping_fee: number;
  total: number;
  notes?: string;
  items: OrderItem[];
  currency: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  primary_image?: string;
  category_name?: string;
  color_name: string;
  color_hex: string;
  size: string;
  stock_quantity: number;
  price_override?: number | null;
  effective_price: number;
  is_active: boolean;
  is_low_stock: boolean;
}

export interface DashboardOverview {
  store: {
    name: string;
    slug: string;
    currency: string;
    currency_symbol: string;
  };
  kpis: {
    revenue: number;
    orders: number;
    customers: number;
    average_order_value: number;
    conversion_rate: number;
    active_products: number;
    total_inventory: number;
  };
  revenue_timeline: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  top_products: Array<{
    name: string;
    units_sold: number;
    revenue: number;
    image_url?: string;
    category: string;
  }>;
  low_stock_items: Array<{
    id: string;
    product_name: string;
    sku: string;
    variant_title: string;
    stock_quantity: number;
    image_url?: string;
  }>;
  recent_orders: Array<{
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    status: string;
    total: number;
    items_count: number;
    created_at: string;
  }>;
  sales_by_category: Array<{
    category: string;
    revenue: number;
    units_sold: number;
  }>;
  sales_by_size: Array<{
    size: string;
    units: number;
  }>;
  sales_by_color: Array<{
    color: string;
    units: number;
  }>;
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'SUPERADMIN' | 'STORE_OWNER' | 'STORE_ADMIN' | 'CUSTOMER';
  store?: Store;
}

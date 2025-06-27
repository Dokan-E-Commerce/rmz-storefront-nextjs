export interface Announcement {
  id: number;
  icon: string;
  content: string;
  color: string;
  text_color: string;
  route?: string;
  href?: string;
  is_enabled: boolean;
}

export interface Store {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  cover?: string;
  domain: string;
  custom_domain?: string;
  currency: string;
  timezone: string;
  language: string;
  status: number;
  settings: Record<string, any>;
  social_links?: Record<string, string>;
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
  };
  categories: Category[];
  pages: Page[];
  announcements?: Announcement[];
  theme: {
    primary_color?: string;
    secondary_color?: string;
    layout?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  marketing_title?: string;
  slug: string;
  description?: string;
  short_description?: string;
  type: 'digital' | 'subscription' | 'course' | 'product' | 'code';
  status: number;
  is_featured?: boolean;
  is_noticeable?: boolean;
  is_new?: boolean;
  is_discounted?: boolean;
  show_reviews?: number;
  rating?: number;
  reviews_count?: number;
  price: {
    original: string;
    actual: string;
    discount?: string;
    discount_expiry?: string;
    cost_price?: string;
    formatted: string;
    formatted_original: string;
    discount_percentage: number;
    currency: string;
  };
  stock: {
    available: number;
    unlimited?: boolean;
    min_qty?: number;
    codes_count: number;
    is_in_stock: boolean;
  };
  sales?: {
    sold_count: number;
    max_purchase_count?: number;
    badge?: string | {
      color: string;
      text?: string;
    };
  };
  image?: {
    id: number;
    url?: string;
    full_link?: string;
    path: string;
    filename: string;
    alt_text?: string;
  };
  categories: Category[];
  subscription_variants?: SubscriptionVariant[];
  fields?: ProductField[];
  meta?: Record<string, any>;
  metadata?: string;
  tags?: string[];
  seo?: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SubscriptionVariant {
  id: number;
  price: string;
  duration: string;
  formatted_price: string;
}

export interface ProductField {
  name: string;
  type: 'text' | 'select' | 'textarea' | 'number';
  required: boolean;
  options?: { [key: string]: { name: string; price?: number } };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  title: string;
  url: string;
  content: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  image?: {
    url?: string;
    full_link?: string;
    alt: string;
    alt_text?: string;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  custom_fields?: any;
  subscription_plan?: SubscriptionVariant;
  notice?: string;
  product: Partial<Product>;
  // Legacy support
  price?: number;
  fields?: { name: string; value: string; price?: number }[];
  plan?: SubscriptionVariant;
}

export interface Cart {
  items: { [key: string]: CartItem };
  count: number;
  subtotal: number;
  total: number;
  discount_amount: number;
  coupon?: Coupon;
  cart_token?: string;
}

export interface ApiCartResponse {
  items: CartItem[];
  count: number;
  subtotal: number;
  total: number;
  discount_amount: number;
  coupon?: Coupon;
  cart_token?: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_amount?: number;
  max_discount?: number;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  country_code: string;
  full_phone: string;
  avatar?: string;
  is_banned: boolean;
  email_verified_at?: string;
  phone_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number?: string;
  status: {
    id: number;
    name: string;
    color: string;
    human_format?: {
      text: string;
      color: string;
      date_human: string;
      date_normal: string;
    };
  };
  statuses?: Array<{
    id: number;
    status: number;
    name: string;
    color: string;
    created_at: string;
    human_format: {
      text: string;
      color: string;
      date_human: string;
      date_normal: string;
    };
  }>;
  total: number | {
    amount: number;
    formatted: string;
    currency: string;
  };
  financial_breakdown?: {
    subtotal: number;
    discount_amount: number;
    platform_fees: number;
    store_deserved: number;
    final_total: number;
  };
  discount_amount?: number | string;
  customer_note?: string;
  meta?: any;
  items?: OrderItem[];
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  payment: {
    method: string;
    status: string;
    transaction_id?: string;
  };
  transaction?: {
    id: number;
    payment_method: string;
    payment_id: string;
    total: number;
    deserved: number;
    platform_fees: number;
    platform_fees_vat: number;
    is_refunded: boolean;
    is_hold: boolean;
    is_by_platform: boolean;
    store_balance_credited_at?: string;
    payment_data?: any;
    human_format: {
      payment_method: string;
      is_refunded: string;
      total_formatted: string;
    };
    receipt?: {
      id: number;
      file_name: string;
      url: string;
      full_link: string;
    };
  };
  coupon?: {
    id: number;
    code: string;
    type: string;
    value: number;
    formatted_value: string;
  };
  review?: Review;
  complain?: {
    id: number;
    subject: string;
    status: string;
    created_at: string;
  };
  eligibility?: {
    can_review: boolean;
    can_complain: boolean;
    can_refund: boolean;
  };
  human_format?: {
    created_at_human: string;
    created_at_normal: string;
    total_formatted: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_name?: string;
  name?: string;
  product_id: number;
  quantity: number;
  price: number | string;
  total?: number;
  formatted_price?: string;
  formatted_total?: string;
  fields?: Record<string, any>;
  notes?: string;
  item_type?: string;
  item_id?: number;
  codes?: Array<{
    id: number;
    code: string;
    used_at?: string;
    is_used: boolean;
  }>;
  subscription?: {
    id: number;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    duration?: string;
    durationText?: string;
    days_left?: number;
    product?: {
      id: number;
      name: string;
    };
  };
  course_enrollment?: {
    id: number;
    is_active: boolean;
    progress: number;
    course?: {
      id: number;
      title: string;
      description?: string;
    };
  };
  product?: {
    id: number;
    name: string;
    type?: string;
    description?: string;
    full_link?: string;
    image?: {
      url?: string;
      full_link?: string;
      alt?: string;
    };
  };
  // Legacy structure compatibility - the item relationship from OrderItem model
  item?: {
    id: number;
    name: string;
    type?: string;
    description?: string;
    full_link?: string;
    image?: {
      full_link: string;
      alt?: string;
    };
    product?: {
      full_link?: string;
    };
  };
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  is_published: boolean;
  reviewer: {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
  };
  product: {
    id: number;
    type: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    has_more_pages: boolean;
    next_page_url?: string;
    prev_page_url?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthSession {
  type: 'phone' | 'email';
  data: {
    country?: string;
    phone?: string;
    email?: string;
  };
  expires_at: string;
}

export interface AuthResponse {
  type?: 'new' | 'authenticated' | 'registered';
  token?: string;
  customer?: Customer;
  requires_registration?: boolean;
  session_token?: string;
  cart_token?: string;
}

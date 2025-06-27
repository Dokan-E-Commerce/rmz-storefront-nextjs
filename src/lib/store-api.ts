import { sdk } from './sdk';
import { Store, Product, Category, Page, Order, Review, PaginatedResponse } from './types';

// Store API - Using only official rmz-storefront-sdk
export const storeApi = {
  getStore: async (options?: {
    include?: string[];
    with_announcements?: boolean;
    with_social_links?: boolean;
    with_contact_info?: boolean;
  }): Promise<Store> => {
    const includes = options?.include || ['categories', 'pages', 'announcements'];
    return await sdk.store.get({ include: includes }) as any;
  },

  getCurrencies: async () => {
    return await sdk.store.getCurrencies() as any;
  },

  changeCurrency: async (currency: string) => {
    return await sdk.store.changeCurrency(currency);
  }
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return await sdk.categories.getAll() as any;
  },

  getById: async (id: number): Promise<Category> => {
    return await sdk.categories.getById(id) as any;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    return await sdk.categories.getBySlug(slug) as any;
  },

  getCategory: async (slug: string): Promise<Category> => {
    return await sdk.categories.getBySlug(slug) as any;
  },

  getProducts: async (slug: string, params?: any): Promise<{ data: Product[]; pagination?: any }> => {
    return await sdk.categories.getProducts(slug, params) as any;
  },

  getCategoryProducts: async (slug: string, params?: any): Promise<{ data: Product[]; pagination?: any }> => {
    return await sdk.categories.getProducts(slug, params) as any;
  }
};

// Products API - Using only official SDK
export const productsApi = {
  getFeatured: async (limit?: number) => {
    return await sdk.products.getFeatured(limit || 8) as any;
  },

  getAll: async (params?: any) => {
    return await sdk.products.getAll(params) as any;
  },

  getProducts: async (params?: any) => {
    return await sdk.products.getAll(params) as any;
  },

  getBySlug: async (slug: string) => {
    return await sdk.products.getBySlug(slug) as any;
  },

  getProduct: async (slug: string) => {
    return await sdk.products.getBySlug(slug) as any;
  },

  getProductReviews: async (productId: number, params?: any) => {
    return await sdk.products.getReviews(productId, params) as any;
  },


  search: async (query: string, filters?: any) => {
    return await sdk.products.search(query, filters) as any;
  },

  getRelated: async (productId: number, limit?: number) => {
    return await sdk.products.getRelated(productId, limit || 4) as any;
  }
};


// Cart API - Using only official SDK
export const cartApi = {
  get: async () => {
    return await sdk.cart.get() as any;
  },

  addItem: async (productId: number, quantity = 1, options?: any) => {
    return await sdk.cart.addItem(productId, quantity, options) as any;
  },

  updateItem: async (itemId: string, quantity: number) => {
    return await sdk.cart.updateItem(itemId, quantity) as any;
  },

  removeItem: async (itemId: string) => {
    return await sdk.cart.removeItem(itemId) as any;
  },

  clear: async () => {
    return await sdk.cart.clear();
  },

  getCount: async () => {
    return await sdk.cart.getCount() as any;
  },

  applyCoupon: async (code: string) => {
    return await sdk.cart.applyCoupon(code) as any;
  },

  removeCoupon: async () => {
    return await sdk.cart.removeCoupon() as any;
  }
};

// Auth API - Using only official SDK
export const authApi = {
  startPhoneAuth: async (phone: string, country: string) => {
    return await sdk.auth.startPhoneAuth(phone, country) as any;
  },

  verifyOTP: async (otp: string, sessionToken: string) => {
    return await sdk.auth.verifyOTP(otp, sessionToken) as any;
  },

  resendOTP: async (sessionToken: string) => {
    return await sdk.auth.resendOTP(sessionToken) as any;
  },

  completeRegistration: async (data: any) => {
    return await sdk.auth.completeRegistration(data) as any;
  }
};

// Wishlist API - Using only official SDK
export const wishlistApi = {
  get: async () => {
    return await sdk.wishlist.get() as any;
  },

  addItem: async (productId: number) => {
    return await sdk.wishlist.addItem(productId) as any;
  },

  removeItem: async (productId: number) => {
    return await sdk.wishlist.removeItem(productId) as any;
  },

  check: async (productId: number) => {
    return await sdk.wishlist.check(productId) as any;
  },

  getCount: async () => {
    const wishlist = await sdk.wishlist.get() as any;
    return wishlist.count || 0;
  },

  clear: async () => {
    return await sdk.wishlist.clear();
  }
};

// Reviews API - Using only official SDK
export const reviewsApi = {
  getAll: async (params?: any) => {
    return await sdk.reviews.getAll(params) as any;
  },

  getRecent: async (limit = 6) => {
    return await sdk.reviews.getRecent(limit) as any;
  },

  getStats: async () => {
    return await sdk.reviews.getStats() as any;
  },

  submit: async (productId: number, data: { rating: number; comment: string }) => {
    return await sdk.reviews.submit(productId, data) as any;
  }
};

// Orders API - Using only official SDK
export const ordersApi = {
  getAll: async (params?: any) => {
    return await sdk.orders.getAll(params) as any;
  },

  getById: async (id: number) => {
    return await sdk.orders.getById(id) as any;
  },

  getSubscriptions: async () => {
    // TODO: Add getSubscriptions method to SDK if needed
    return [];
  },

  getCourses: async () => {
    return await sdk.orders.getCourses() as any;
  }
};

// Checkout API - Using only official SDK
export const checkoutApi = {
  create: async () => {
    return await sdk.checkout.create() as any;
  },

  getResult: async (sessionId: string) => {
    return await sdk.checkout.getResult(sessionId) as any;
  }
};

// Components API - Using only official SDK
export const componentsApi = {
  getAll: async () => {
    return await sdk.components.getAll() as any;
  },

  getById: async (id: number) => {
    // TODO: Add getById method to SDK components if needed
    return {};
  },

  getProducts: async (id: number, params?: any) => {
    // TODO: Add getProducts method to SDK components if needed
    return [];
  }
};

// Pages API - Using only official SDK
export const pagesApi = {
  getPage: async (slug: string) => {
    try {
      // Get store with pages included and find the specific page
      const store = await sdk.store.get({ include: ['pages'] }) as any;
      if (store.pages) {
        const page = store.pages.find((p: any) => p.slug === slug);
        if (page) {
          return page;
        }
      }
      // Return null instead of throwing error to avoid 404s during refetches
      return null;
    } catch (error) {
      // Silent fail to prevent 404s during refetches
      return null;
    }
  },

  getAll: async () => {
    try {
      const store = await sdk.store.get({ include: ['pages'] }) as any;
      return store.pages || [];
    } catch (error) {
      // Silent fail for graceful degradation
      return [];
    }
  }
};

// Export all APIs as default
const storeApis = {
  pages: pagesApi
};

export default storeApis;

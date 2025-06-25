import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sdk } from './sdk';
import { Cart, CartItem, Product, SubscriptionVariant } from './types';

interface CartStore extends Cart {
  cart_token?: string;
  addItem: (
    product: Product,
    quantity: number,
    fields?: { [key: string]: string },
    subscriptionPlan?: any,
    notice?: string
  ) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  setCartToken: (token: string) => void;
  syncCartToken: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: {},
      count: 0,
      subtotal: 0,
      total: 0,
      discount_amount: 0,
      coupon: undefined,
      cart_token: undefined,

      setCartToken: (token: string) => {
        set({ cart_token: token });
        sdk.setCartToken(token);
      },

      syncCartToken: () => {
        const { cart_token } = get();
        if (cart_token && typeof cart_token === 'string' && cart_token.length > 0) {
          sdk.setCartToken(cart_token);
        }
      },

      addItem: async (product, quantity, fields, subscriptionPlan, notice) => {
        try {
          get().syncCartToken();
          
          const options: any = {};
          
          if (fields && Object.keys(fields).length > 0) {
            options.fields = fields;
          }
          
          if (notice) {
            options.notice = notice;
          }
          
          if (subscriptionPlan) {
            options.subscription_plan = subscriptionPlan;
          }

          const cartData = await sdk.cart.addItem(product.id, quantity, options) as any;
          
          const itemsObject: { [key: string]: CartItem } = {};
          if (cartData.items && Array.isArray(cartData.items)) {
            cartData.items.forEach((item: any) => {
              itemsObject[item.id.toString()] = item as CartItem;
            });
          }
          
          set({
            items: itemsObject,
            count: cartData.count || 0,
            subtotal: cartData.subtotal || 0,
            total: cartData.total || 0,
            discount_amount: cartData.discount_amount || 0,
            coupon: cartData.coupon,
            cart_token: cartData.cart_token || sdk.getCartToken() || undefined,
          });
        } catch (error) {
          throw error;
        }
      },

      updateQuantity: async (productId, quantity) => {
        try {
          get().syncCartToken();
          const cartData = await sdk.cart.updateItem(productId.toString(), quantity) as any;
          
          const itemsObject: { [key: string]: CartItem } = {};
          if (cartData.items && Array.isArray(cartData.items)) {
            cartData.items.forEach((item: any) => {
              itemsObject[item.id.toString()] = item as CartItem;
            });
          }
          
          set({
            items: itemsObject,
            count: cartData.count || 0,
            subtotal: cartData.subtotal || 0,
            total: cartData.total || 0,
            discount_amount: cartData.discount_amount || 0,
            coupon: cartData.coupon,
            cart_token: cartData.cart_token || sdk.getCartToken() || undefined,
          });
        } catch (error) {
          throw error;
        }
      },

      removeItem: async (productId) => {
        try {
          get().syncCartToken();
          const cartData = await sdk.cart.removeItem(productId.toString()) as any;
          
          const itemsObject: { [key: string]: CartItem } = {};
          if (cartData.items && Array.isArray(cartData.items)) {
            cartData.items.forEach((item: any) => {
              itemsObject[item.id.toString()] = item as CartItem;
            });
          }
          
          set({
            items: itemsObject,
            count: cartData.count || 0,
            subtotal: cartData.subtotal || 0,
            total: cartData.total || 0,
            discount_amount: cartData.discount_amount || 0,
            coupon: cartData.coupon,
            cart_token: cartData.cart_token || sdk.getCartToken() || undefined,
          });
        } catch (error) {
          throw error;
        }
      },

      applyCoupon: async (code) => {
        try {
          get().syncCartToken();
          const cartData = await sdk.cart.applyCoupon(code) as any;
          
          const itemsObject: { [key: string]: CartItem } = {};
          if (cartData.items && Array.isArray(cartData.items)) {
            cartData.items.forEach((item: any) => {
              itemsObject[item.id.toString()] = item as CartItem;
            });
          }
          
          set({
            items: itemsObject,
            count: cartData.count || 0,
            subtotal: cartData.subtotal || 0,
            total: cartData.total || 0,
            discount_amount: cartData.discount_amount || 0,
            coupon: cartData.coupon,
            cart_token: cartData.cart_token || sdk.getCartToken() || undefined,
          });
        } catch (error) {
          throw error;
        }
      },

      removeCoupon: async () => {
        try {
          get().syncCartToken();
          const cartData = await sdk.cart.removeCoupon() as any;
          
          const itemsObject: { [key: string]: CartItem } = {};
          if (cartData.items && Array.isArray(cartData.items)) {
            cartData.items.forEach((item: any) => {
              itemsObject[item.id.toString()] = item as CartItem;
            });
          }
          
          set({
            items: itemsObject,
            count: cartData.count || 0,
            subtotal: cartData.subtotal || 0,
            total: cartData.total || 0,
            discount_amount: cartData.discount_amount || 0,
            coupon: cartData.coupon,
            cart_token: cartData.cart_token || sdk.getCartToken() || undefined,
          });
        } catch (error) {
          throw error;
        }
      },

      clearCart: async () => {
        try {
          await sdk.cart.clear();
          set({
            items: {},
            count: 0,
            subtotal: 0,
            total: 0,
            discount_amount: 0,
            coupon: undefined,
            cart_token: undefined,
          });
        } catch (error) {
          throw error;
        }
      },

      fetchCart: async () => {
        try {
          get().syncCartToken();
          const cartData = await sdk.cart.get() as any;
          
          const itemsObject: { [key: string]: CartItem } = {};
          if (cartData.items && Array.isArray(cartData.items)) {
            cartData.items.forEach((item: any) => {
              itemsObject[item.id.toString()] = item as CartItem;
            });
          }
          
          set({
            items: itemsObject,
            count: cartData.count || 0,
            subtotal: cartData.subtotal || 0,
            total: cartData.total || 0,
            discount_amount: cartData.discount_amount || 0,
            coupon: cartData.coupon,
            cart_token: cartData.cart_token || sdk.getCartToken() || undefined,
          });
        } catch (error) {
          // Silent error for fetch
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        count: state.count,
        subtotal: state.subtotal,
        total: state.total,
        discount_amount: state.discount_amount,
        coupon: state.coupon,
        cart_token: state.cart_token,
      }),
    }
  )
);

// Initialize cart token sync on store creation
if (typeof window !== 'undefined') {
  const persistedState = localStorage.getItem('cart-storage');
  if (persistedState) {
    try {
      const parsed = JSON.parse(persistedState);
      if (parsed.state?.cart_token) {
        sdk.setCartToken(parsed.state.cart_token);
      }
    } catch (error) {
      // Silent error for initialization
    }
  }
}

// Cart API functions
export const cartApi = {
  getCount: async () => {
    return await sdk.cart.getCount();
  },
};
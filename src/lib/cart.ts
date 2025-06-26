import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sdk } from './sdk';
import { Cart, CartItem, Product, SubscriptionVariant } from './types';
import { devLog, devWarn } from './console-branding';
import { trackAddToCart } from './facebook-pixel';
import { trackGTMAddToCart } from './google-tag-manager';

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
  fetchCart: () => Promise<any>;
  setCartToken: (token: string) => void;
  syncCartToken: () => void;
  mergeGuestCart: () => Promise<void>;
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
        devLog('🔧 Cart: Setting cart token:', token?.substring(0, 10) + '...');
        set({ cart_token: token });
        sdk.setCartToken(token);
        devLog('🔧 Cart: SDK token after set:', sdk.getCartToken()?.substring(0, 10) + '...');
      },

      mergeGuestCart: async () => {
        try {
          const { cart_token, items, count } = get();
          devLog('🔄 Attempting to merge guest cart - Current items:', count);
          
          // If we have items in local cart and a cart token, attempt to merge
          if (cart_token && count > 0) {
            // The backend should handle the merge when we authenticate
            // Just fetch the cart to get the merged result
            await get().fetchCart();
          }
        } catch (error) {
          devWarn('🛒 Error merging guest cart:', error);
        }
      },

      syncCartToken: () => {
        const { cart_token } = get();
        devLog('🔄 Syncing cart token - Store token:', cart_token?.substring(0, 10) + '...', 'SDK token:', sdk.getCartToken()?.substring(0, 10) + '...');
        if (cart_token && typeof cart_token === 'string' && cart_token.length > 0) {
          sdk.setCartToken(cart_token);
          devLog('✅ Cart token synced to SDK');
        } else {
          devLog('⚠️ No cart token to sync');
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
          
          devLog('🛒 AddItem Response:', {
            itemCount: cartData.items?.length || 0,
            cart_token: cartData.cart_token?.substring(0, 10) + '...' || 'null',
            sdk_token: sdk.getCartToken()?.substring(0, 10) + '...' || 'null'
          });
          
          const itemsObject: { [key: string]: CartItem } = {};
          if (cartData.items && Array.isArray(cartData.items)) {
            cartData.items.forEach((item: any) => {
              itemsObject[item.id.toString()] = item as CartItem;
            });
          }
          
          const newCartToken = cartData.cart_token || sdk.getCartToken() || undefined;
          
          set({
            items: itemsObject,
            count: cartData.count || 0,
            subtotal: cartData.subtotal || 0,
            total: cartData.total || 0,
            discount_amount: cartData.discount_amount || 0,
            coupon: cartData.coupon,
            cart_token: newCartToken,
          });
          
          // Track Facebook Pixel event
          trackAddToCart(product, quantity);
          
          // Track GTM event
          trackGTMAddToCart(product, quantity);
          
          // Make sure SDK is updated with the cart token
          if (newCartToken) {
            if (newCartToken !== sdk.getCartToken()) {
              devLog('🔄 Updating SDK cart token after addItem:', newCartToken.substring(0, 10) + '...');
              sdk.setCartToken(newCartToken);
            }
            devLog('🔧 Final state after addItem - Store token:', newCartToken.substring(0, 10) + '...', 'SDK token:', sdk.getCartToken()?.substring(0, 10) + '...');
          } else {
            devWarn('⚠️ No cart token received from addItem API');
          }
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
          
          devLog('🛒 Fetching cart - Current SDK cart token:', sdk.getCartToken()?.substring(0, 10) + '...');
          devLog('🛒 Fetching cart - Current store cart token:', get().cart_token?.substring(0, 10) + '...');
          devLog('🛒 Fetching cart - Auth token available:', !!sdk.getAuthToken());
          
          const cartData = await sdk.cart.get() as any;
          
          devLog('🛒 Cart API Response:', {
            itemCount: cartData.items?.length || 0,
            count: cartData.count,
            cart_token: cartData.cart_token?.substring(0, 10) + '...',
            hasItems: cartData.items && cartData.items.length > 0
          });
          
          const itemsObject: { [key: string]: CartItem } = {};
          if (cartData.items && Array.isArray(cartData.items)) {
            cartData.items.forEach((item: any) => {
              itemsObject[item.id.toString()] = item as CartItem;
            });
          }
          
          const updatedState = {
            items: itemsObject,
            count: cartData.count || 0,
            subtotal: cartData.subtotal || 0,
            total: cartData.total || 0,
            discount_amount: cartData.discount_amount || 0,
            coupon: cartData.coupon,
            cart_token: cartData.cart_token || sdk.getCartToken() || undefined,
          };
          
          devLog('🛒 Updated cart state:', {
            itemCount: Object.keys(updatedState.items).length,
            count: updatedState.count,
            cart_token: updatedState.cart_token?.substring(0, 10) + '...'
          });
          
          set(updatedState);
          
          // Update SDK cart token if response provides one
          if (cartData.cart_token && cartData.cart_token !== sdk.getCartToken()) {
            devLog('🔧 Updating SDK cart token from fetchCart response:', cartData.cart_token.substring(0, 10) + '...');
            sdk.setCartToken(cartData.cart_token);
          }
          
          return updatedState;
        } catch (error) {
          devWarn('🛒 Error fetching cart:', error);
          throw error;
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
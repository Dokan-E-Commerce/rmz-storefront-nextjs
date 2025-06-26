import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApi } from './store-api';
import type { Product } from './types';
import { devWarn } from './console-branding';
import { trackAddToWishlist } from './facebook-pixel';
import { trackGTMAddToWishlist } from './google-tag-manager';

interface WishlistStore {
  items: Product[];
  count: number;
  isLoading: boolean;
  hasFetched: boolean;
  
  // Actions
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  checkWishlist: (productId: number) => Promise<boolean>;
  fetchWishlist: () => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  resetStore: () => void;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      isLoading: false,
      hasFetched: false,

      addToWishlist: async (productId: number, product?: Product) => {
        set({ isLoading: true });
        try {
          await wishlistApi.addItem(productId);
          
          // Track Facebook Pixel event if product data is available
          if (product) {
            trackAddToWishlist(product);
            trackGTMAddToWishlist(product);
          }
          
          // Refetch to update the store
          await get().fetchWishlist();
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromWishlist: async (productId: number) => {
        set({ isLoading: true });
        try {
          await wishlistApi.removeItem(productId);
          // Remove from local state immediately for better UX
          const { items } = get();
          const updatedItems = items.filter(item => item.id !== productId);
          set({ 
            items: updatedItems,
            count: updatedItems.length 
          });
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      checkWishlist: async (productId: number): Promise<boolean> => {
        try {
          const result = await wishlistApi.check(productId);
          return result.in_wishlist;
        } catch (error) {
          return false;
        }
      },

      fetchWishlist: async () => {
        const { isLoading, hasFetched } = get();
        
        // Prevent multiple simultaneous fetches
        if (isLoading) {
          return;
        }
        
        set({ isLoading: true });
        try {
          const data = await wishlistApi.get();
          
          // Temporary debug log to see actual response structure
          console.log('Raw wishlist API response:', JSON.stringify(data, null, 2));
          
          // Handle different possible response structures
          let items = [];
          let count = 0;
          
          if (data) {
            if (Array.isArray(data)) {
              // Direct array response
              items = data;
              count = data.length;
            } else if (data.data && Array.isArray(data.data)) {
              // Response with data property
              items = data.data;
              count = data.count || data.data.length;
            } else if (data.items && Array.isArray(data.items)) {
              // Response with items property
              items = data.items;
              count = data.count || data.items.length;
            } else if (data.products && Array.isArray(data.products)) {
              // Response with products property
              items = data.products;
              count = data.count || data.products.length;
            } else if (typeof data === 'object') {
              // Check for any array property in the response
              const possibleKeys = Object.keys(data);
              for (const key of possibleKeys) {
                if (Array.isArray(data[key]) && key !== 'errors') {
                  items = data[key];
                  count = data.count || items.length;
                  break;
                }
              }
            }
          }
          
          set({ 
            items,
            count,
            hasFetched: true
          });
        } catch (error) {
          devWarn('Failed to fetch wishlist:', error);
          set({ items: [], count: 0, hasFetched: true });
        } finally {
          set({ isLoading: false });
        }
      },

      clearWishlist: async () => {
        set({ isLoading: true });
        try {
          await wishlistApi.clear();
          set({ items: [], count: 0 });
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      isInWishlist: (productId: number): boolean => {
        const { items } = get();
        return items.some(item => item.id === productId);
      },

      resetStore: () => {
        set({ 
          items: [], 
          count: 0, 
          hasFetched: false,
          isLoading: false 
        });
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ 
        items: state.items,
        count: state.count
      }),
    }
  )
);
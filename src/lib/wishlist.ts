import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistApi } from './store-api';
import type { Product } from './types';

interface WishlistStore {
  items: Product[];
  count: number;
  isLoading: boolean;
  
  // Actions
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  checkWishlist: (productId: number) => Promise<boolean>;
  fetchWishlist: () => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      isLoading: false,

      addToWishlist: async (productId: number) => {
        set({ isLoading: true });
        try {
          await wishlistApi.addItem(productId);
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
        set({ isLoading: true });
        try {
          const data = await wishlistApi.get();
          set({ 
            items: data.data || [],
            count: data.count || 0
          });
        } catch (error) {
          set({ items: [], count: 0 });
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
    }),
    {
      partialize: (state) => ({ 
        count: state.count 
      }),
    }
  )
);
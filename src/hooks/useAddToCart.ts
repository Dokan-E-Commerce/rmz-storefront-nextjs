'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/useTranslation';

interface Product {
  id: number;
  name: string;
  slug: string;
  price?: {
    original: string;
    actual: string;
    discount?: string;
    formatted: string;
    formatted_original: string;
    discount_percentage: number;
    currency: string;
  };
}

export function useAddToCart() {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});

  const addToCart = async (product: Product, quantity: number = 1, customFields?: Record<string, any>) => {
    if (isLoading[product.id]) return;

    try {
      setIsLoading(prev => ({ ...prev, [product.id]: true }));
      await addItem(product as any, quantity, customFields);
      toast.success(`${product.name} added to cart successfully!`);
    } catch (error: any) {
      // SDK throws Error objects with the API message directly in error.message
      const errorMessage = error.message || error.response?.data?.message || 'Failed to add item to cart';
      toast.error(errorMessage);
    } finally {
      setIsLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const isAddingToCart = (productId: number) => isLoading[productId] || false;

  return {
    addToCart,
    isAddingToCart
  };
}

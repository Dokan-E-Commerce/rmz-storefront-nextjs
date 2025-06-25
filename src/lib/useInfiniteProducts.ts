import { useInfiniteQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi } from './store-api';
import { Product, PaginatedResponse } from './types';

interface UseInfiniteProductsParams {
  category?: string;
  search?: string;
  sort?: string;
  per_page?: number;
  featured?: boolean;
  type?: string;
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
}

export const useInfiniteProducts = (params: UseInfiniteProductsParams = {}) => {
  return useInfiniteQuery({
    queryKey: ['products', params],
    queryFn: ({ pageParam = 1 }) => 
      productsApi.getProducts({ 
        ...params, 
        page: pageParam,
        per_page: params.per_page || 12
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Product>) => {
      if (lastPage.pagination.current_page < lastPage.pagination.last_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });
};

export const useInfiniteCategoryProducts = (slug: string, params: Omit<UseInfiniteProductsParams, 'category'> = {}) => {
  return useInfiniteQuery({
    queryKey: ['category-products', slug, params],
    queryFn: ({ pageParam = 1 }) => 
      categoriesApi.getCategoryProducts(slug, { 
        ...params, 
        page: pageParam,
        per_page: params.per_page || 12
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Product>) => {
      if (lastPage.pagination.current_page < lastPage.pagination.last_page) {
        return lastPage.pagination.current_page + 1;
      }
      return undefined;
    },
  });
};
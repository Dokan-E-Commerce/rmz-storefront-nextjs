/**
 * Google Tag Manager integration for e-commerce tracking
 */

import { Product } from './types';

// Google Tag Manager DataLayer interface
interface GTMDataLayer {
  event: string;
  [key: string]: any;
}

declare global {
  interface Window {
    dataLayer: GTMDataLayer[];
    gtag: (...args: any[]) => void;
  }
}

// Google Tag Manager configuration
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const isEnabled = Boolean(GTM_ID);

// Initialize Google Tag Manager DataLayer
export const initGTMDataLayer = (): void => {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
};

// Push data to GTM DataLayer
export const pushToDataLayer = (data: GTMDataLayer): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
};

// Track page view
export const trackGTMPageView = (url?: string): void => {
  if (!isEnabled) return;
  
  pushToDataLayer({
    event: 'page_view',
    page_location: url || window.location.href,
    page_title: document.title
  });
};

// Track view item event
export const trackGTMViewItem = (product: Product): void => {
  if (!isEnabled) return;
  
  pushToDataLayer({
    event: 'view_item',
    currency: 'USD',
    value: product.price?.actual ? parseFloat(product.price.actual) : 0,
    items: [{
      item_id: product.id.toString(),
      item_name: product.name,
      item_category: product.categories?.[0]?.name || 'Product',
      price: product.price?.actual ? parseFloat(product.price.actual) : 0,
      quantity: 1
    }]
  });
};

// Track add to cart event
export const trackGTMAddToCart = (product: Product, quantity: number = 1): void => {
  if (!isEnabled) return;
  
  const value = product.price?.actual ? parseFloat(product.price.actual) * quantity : 0;
  
  pushToDataLayer({
    event: 'add_to_cart',
    currency: 'USD',
    value: value,
    items: [{
      item_id: product.id.toString(),
      item_name: product.name,
      item_category: product.categories?.[0]?.name || 'Product',
      price: product.price?.actual ? parseFloat(product.price.actual) : 0,
      quantity: quantity
    }]
  });
};

// Track remove from cart event
export const trackGTMRemoveFromCart = (product: Product, quantity: number = 1): void => {
  if (!isEnabled) return;
  
  const value = product.price?.actual ? parseFloat(product.price.actual) * quantity : 0;
  
  pushToDataLayer({
    event: 'remove_from_cart',
    currency: 'USD',
    value: value,
    items: [{
      item_id: product.id.toString(),
      item_name: product.name,
      item_category: product.categories?.[0]?.name || 'Product',
      price: product.price?.actual ? parseFloat(product.price.actual) : 0,
      quantity: quantity
    }]
  });
};

// Track add to wishlist event
export const trackGTMAddToWishlist = (product: Product): void => {
  if (!isEnabled) return;
  
  pushToDataLayer({
    event: 'add_to_wishlist',
    currency: 'USD',
    value: product.price?.actual ? parseFloat(product.price.actual) : 0,
    items: [{
      item_id: product.id.toString(),
      item_name: product.name,
      item_category: product.categories?.[0]?.name || 'Product',
      price: product.price?.actual ? parseFloat(product.price.actual) : 0,
      quantity: 1
    }]
  });
};

// Track begin checkout event
export const trackGTMBeginCheckout = (items: any[], totalValue: number): void => {
  if (!isEnabled) return;
  
  const gtmItems = items.map(item => ({
    item_id: (item.product?.id || item.id)?.toString(),
    item_name: item.product?.name || item.name,
    item_category: item.product?.categories?.[0]?.name || 'Product',
    price: item.product?.price?.actual ? parseFloat(item.product.price.actual) : 0,
    quantity: item.quantity || 1
  }));
  
  pushToDataLayer({
    event: 'begin_checkout',
    currency: 'USD',
    value: totalValue,
    items: gtmItems
  });
};

// Track purchase event
export const trackGTMPurchase = (orderId: string | number, items: any[], totalValue: number, tax?: number, shipping?: number): void => {
  if (!isEnabled) return;
  
  const gtmItems = items.map(item => ({
    item_id: (item.product?.id || item.id)?.toString(),
    item_name: item.product?.name || item.name,
    item_category: item.product?.categories?.[0]?.name || 'Product',
    price: item.product?.price?.actual ? parseFloat(item.product.price.actual) : 0,
    quantity: item.quantity || 1
  }));
  
  pushToDataLayer({
    event: 'purchase',
    transaction_id: orderId.toString(),
    currency: 'USD',
    value: totalValue,
    tax: tax || 0,
    shipping: shipping || 0,
    items: gtmItems
  });
};

// Track search event
export const trackGTMSearch = (searchTerm: string): void => {
  if (!isEnabled) return;
  
  pushToDataLayer({
    event: 'search',
    search_term: searchTerm
  });
};

// Track sign up event
export const trackGTMSignUp = (method?: string): void => {
  if (!isEnabled) return;
  
  pushToDataLayer({
    event: 'sign_up',
    method: method || 'email'
  });
};

// Track login event
export const trackGTMLogin = (method?: string): void => {
  if (!isEnabled) return;
  
  pushToDataLayer({
    event: 'login',
    method: method || 'email'
  });
};

// Track custom event
export const trackGTMCustomEvent = (eventName: string, parameters?: any): void => {
  if (!isEnabled) return;
  
  pushToDataLayer({
    event: eventName,
    ...parameters
  });
};

// Check if GTM is enabled
export const isGTMEnabled = (): boolean => {
  return isEnabled;
};

// Get GTM ID
export const getGTMId = (): string | undefined => {
  return GTM_ID;
};
/**
 * Facebook Pixel integration for e-commerce tracking
 */

import { Product } from './types';

// Facebook Pixel interface
interface FacebookPixel {
  (event: string, action: string, parameters?: any): void;
  push: (args: any[]) => void;
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    fbq: FacebookPixel;
    _fbq: FacebookPixel;
  }
}

// Facebook Pixel configuration
const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
const isEnabled = Boolean(FACEBOOK_PIXEL_ID);

// Initialize Facebook Pixel
export const initFacebookPixel = (): void => {
  if (!isEnabled || typeof window === 'undefined') return;

  // Create fbq function
  const fbqFn = function(...args: any[]) {
    ((fbqFn as any).q = (fbqFn as any).q || []).push(args);
  };
  
  // Set properties
  (fbqFn as any).version = '2.0';
  (fbqFn as any).q = (fbqFn as any).q || [];
  (fbqFn as any).push = (fbqFn as any).q.push.bind((fbqFn as any).q);
  (fbqFn as any).loaded = true;
  
  window.fbq = fbqFn as any;
  
  // Initialize pixel
  window.fbq('init', FACEBOOK_PIXEL_ID);
  
  // Track page view
  window.fbq('track', 'PageView');
};

// Load Facebook Pixel script
export const loadFacebookPixelScript = (): void => {
  if (!isEnabled || typeof window === 'undefined') return;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
};

// Track page view
export const trackPageView = (): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  window.fbq?.('track', 'PageView');
};

// Track view content event
export const trackViewContent = (product: Product): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  window.fbq?.('track', 'ViewContent', {
    content_type: 'product',
    content_ids: [product.id.toString()],
    content_name: product.name,
    content_category: product.categories?.[0]?.name || 'Product',
    value: product.price?.actual ? parseFloat(product.price.actual) : 0,
    currency: 'USD' // This could be made dynamic based on store currency
  });
};

// Track add to cart event
export const trackAddToCart = (product: Product, quantity: number = 1): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  const value = product.price?.actual ? parseFloat(product.price.actual) * quantity : 0;
  
  window.fbq?.('track', 'AddToCart', {
    content_type: 'product',
    content_ids: [product.id.toString()],
    content_name: product.name,
    content_category: product.categories?.[0]?.name || 'Product',
    value: value,
    currency: 'USD',
    num_items: quantity
  });
};

// Track add to wishlist event
export const trackAddToWishlist = (product: Product): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  window.fbq?.('track', 'AddToWishlist', {
    content_type: 'product',
    content_ids: [product.id.toString()],
    content_name: product.name,
    content_category: product.categories?.[0]?.name || 'Product',
    value: product.price?.actual ? parseFloat(product.price.actual) : 0,
    currency: 'USD'
  });
};

// Track initiate checkout event
export const trackInitiateCheckout = (items: any[], totalValue: number): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  const contentIds = items.map(item => item.product?.id?.toString() || item.id?.toString()).filter(Boolean);
  
  window.fbq?.('track', 'InitiateCheckout', {
    content_type: 'product',
    content_ids: contentIds,
    value: totalValue,
    currency: 'USD',
    num_items: items.length
  });
};

// Track purchase event
export const trackPurchase = (orderId: string | number, items: any[], totalValue: number): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  const contentIds = items.map(item => item.product?.id?.toString() || item.id?.toString()).filter(Boolean);
  
  window.fbq?.('track', 'Purchase', {
    content_type: 'product',
    content_ids: contentIds,
    value: totalValue,
    currency: 'USD',
    num_items: items.length,
    order_id: orderId.toString()
  });
};

// Track search event
export const trackSearch = (searchTerm: string): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  window.fbq?.('track', 'Search', {
    search_string: searchTerm
  });
};

// Track sign up event
export const trackCompleteRegistration = (): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  window.fbq?.('track', 'CompleteRegistration');
};

// Track login event
export const trackLogin = (): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  window.fbq?.('track', 'Login');
};

// Custom event tracking
export const trackCustomEvent = (eventName: string, parameters?: any): void => {
  if (!isEnabled || typeof window === 'undefined') return;
  
  window.fbq?.('trackCustom', eventName, parameters);
};

// Check if Facebook Pixel is enabled
export const isFacebookPixelEnabled = (): boolean => {
  return isEnabled;
};

// Get Facebook Pixel ID
export const getFacebookPixelId = (): string | undefined => {
  return FACEBOOK_PIXEL_ID;
};
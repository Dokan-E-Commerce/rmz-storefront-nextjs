/**
 * Simple SDK wrapper using official rmz-storefront-sdk
 */

import { SecureStorefrontSDK, createStorefrontSDK, type StorefrontConfig } from 'rmz-storefront-sdk';

// SDK Configuration
function getSDKConfig(): StorefrontConfig {
  const publicKey = process.env.NEXT_PUBLIC_STOREFRONT_PUBLIC_KEY;
  // Only use secret key in server-side environments (NOT in browser)
  const secretKey = typeof window === 'undefined' ? process.env.STOREFRONT_SECRET_KEY : undefined;
  
  // Default to production API, but allow override for development
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://front.rmz.gg/api';

  if (!publicKey) {
    throw new Error('NEXT_PUBLIC_STOREFRONT_PUBLIC_KEY environment variable is required');
  }

  return {
    apiUrl,
    publicKey,
    secretKey, // Only available server-side
    enableLogging: process.env.NODE_ENV === 'development'
  };
}

// Create SDK instance
let sdkInstance: SecureStorefrontSDK | null = null;

function getSDKInstance(): SecureStorefrontSDK {
  if (!sdkInstance) {
    try {
      sdkInstance = createStorefrontSDK(getSDKConfig());
    } catch (error) {
      throw error;
    }
  }
  return sdkInstance;
}

// Simple wrapper class
export class StorefrontSDK {
  private static instance: StorefrontSDK;
  private sdk: SecureStorefrontSDK;

  private constructor() {
    this.sdk = getSDKInstance();
  }

  public static getInstance(): StorefrontSDK {
    if (!StorefrontSDK.instance) {
      StorefrontSDK.instance = new StorefrontSDK();
    }
    return StorefrontSDK.instance;
  }

  // Direct access to official SDK methods
  get store() {
    return this.sdk.store;
  }

  get products() {
    return this.sdk.products;
  }

  get categories() {
    return this.sdk.categories;
  }

  get cart() {
    return this.sdk.cart;
  }

  get auth() {
    return this.sdk.auth;
  }

  get orders() {
    return this.sdk.orders;
  }

  get checkout() {
    return this.sdk.checkout;
  }

  get wishlist() {
    return this.sdk.wishlist;
  }

  get reviews() {
    return this.sdk.reviews;
  }

  get components() {
    return this.sdk.components;
  }

  // Legacy methods for backward compatibility
  async getStore() {
    return this.store.get();
  }

  async getStoreCurrencies() {
    return this.store.getCurrencies();
  }

  async changeCurrency(currency: string) {
    return this.store.changeCurrency(currency);
  }

  // Authentication token management
  setAuthToken(token: string | null): void {
    this.sdk.setAuthToken(token);
  }

  getAuthToken(): string | undefined {
    return this.sdk.getAuthToken();
  }

  // Cart token management
  setCartToken(token: string | null): void {
    this.sdk.setCartToken(token);
  }

  getCartToken(): string | undefined {
    return this.sdk.getCartToken();
  }

  // Access to underlying SDK for advanced usage
  getSDK(): SecureStorefrontSDK {
    return this.sdk;
  }
}

// Export singleton instance
export const sdk = StorefrontSDK.getInstance();

// Export the direct SDK instance for modern usage
export const storefrontSDK = StorefrontSDK.getInstance();

// Export the raw SDK for advanced usage
export const rawSDK = getSDKInstance();

// Export class for type checking
export default StorefrontSDK;
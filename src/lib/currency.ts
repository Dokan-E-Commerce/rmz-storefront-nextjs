import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storeApi } from './store-api';

export interface Currency {
  symbol: string;
  name: string;
  code: string;
  rate: number;
  is_default: boolean;
}

interface CurrencyStore {
  selectedCurrency: Currency | null;
  availableCurrencies: Currency[];
  isLoading: boolean;

  // Actions
  setCurrency: (currency: Currency) => Promise<void>;
  loadCurrencies: () => Promise<void>;
  initializeFromStore: (storeCurrency: string) => void;
  formatPrice: (price: number | string) => string;
  convertPrice: (price: number | string, fromCurrency?: string) => number;
}

export const useCurrency = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      selectedCurrency: null,
      availableCurrencies: [],
      isLoading: false,

      setCurrency: async (currency: Currency) => {
        set({ isLoading: true });
        try {
          // Just update the selected currency locally - no backend call
          set({ selectedCurrency: currency });

          // No need to reload the page, prices will be recalculated automatically
        } catch (error) {
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadCurrencies: async () => {
        set({ isLoading: true });
        try {
          const response = await storeApi.getCurrencies() as any;

                    // Defensive check for response
          if (!response) {
            set({ availableCurrencies: [] });
            return;
          }

          // Handle different response formats with better validation
          // The backend now returns currencies directly in response.data field (from sendResponse)
          const currencies = Array.isArray(response)
            ? response
            : (response?.data && Array.isArray(response.data)
                ? response.data
                : (Array.isArray(response) ? response : []));

          if (Array.isArray(currencies) && currencies.length > 0) {
            // Validate that currencies have required properties
            const validCurrencies = currencies.filter((c: any) =>
              c && typeof c === 'object' && c.code && c.symbol && c.name
            );

            if (validCurrencies.length > 0) {
              const defaultCurrency = validCurrencies.find((c: Currency) => c.is_default) || validCurrencies[0];

              set({
                availableCurrencies: validCurrencies,
                selectedCurrency: get().selectedCurrency || defaultCurrency
              });
            } else {
              // If no valid currencies, create SAR fallback
              const fallbackCurrency = {
                id: 1,
                code: 'ر.س',
                symbol: 'ر.س',
                name: 'ريال سعودي',
                rate: 1.0,
                is_default: true
              };
              set({
                availableCurrencies: [fallbackCurrency],
                selectedCurrency: get().selectedCurrency || fallbackCurrency
              });
            }
          } else {
            // If no currencies from API, create SAR fallback
            const fallbackCurrency = {
              id: 1,
              code: 'ر.س',
              symbol: 'ر.س',
              name: 'ريال سعودي',
              rate: 1.0,
              is_default: true
            };
            set({
              availableCurrencies: [fallbackCurrency],
              selectedCurrency: get().selectedCurrency || fallbackCurrency
            });
          }
        } catch (error) {
          // Create SAR fallback on error
          const fallbackCurrency = {
            id: 1,
            code: 'ر.س',
            symbol: 'ر.س',
            name: 'ريال سعودي',
            rate: 1.0,
            is_default: true
          };
          set({
            availableCurrencies: [fallbackCurrency],
            selectedCurrency: get().selectedCurrency || fallbackCurrency
          });
        } finally {
          set({ isLoading: false });
        }
      },

      initializeFromStore: (storeCurrency: string) => {
        const { availableCurrencies } = get();
        if (availableCurrencies.length > 0) {
          const currency = availableCurrencies.find(c => c.symbol === storeCurrency);
          if (currency && !get().selectedCurrency) {
            set({ selectedCurrency: currency });
          }
        }
      },

      convertPrice: (price: number | string, fromCurrency = 'ر.س') => {
        const { selectedCurrency, availableCurrencies } = get();
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

        if (isNaN(numericPrice)) return 0;

        // If no currency is selected or it's the same as base currency, return original price
        if (!selectedCurrency || selectedCurrency.code === fromCurrency) {
          return numericPrice;
        }

        // Find the selected currency's rate
        const targetCurrency = availableCurrencies.find(c => c.code === selectedCurrency.code);
        if (!targetCurrency || !targetCurrency.rate) {
          return numericPrice;
        }

        // Convert from SAR to target currency
        // If price is already in SAR (ر.س), just multiply by rate
        if (fromCurrency === 'ر.س' || fromCurrency === 'SAR') {
          return numericPrice * targetCurrency.rate;
        }

        // If price is in other currency, first convert to SAR then to target
        const fromCurrencyData = availableCurrencies.find(c => c.code === fromCurrency);
        if (fromCurrencyData && fromCurrencyData.rate) {
          const sarPrice = numericPrice / fromCurrencyData.rate;
          return sarPrice * targetCurrency.rate;
        }

        return numericPrice;
      },

      formatPrice: (price: number | string, fromCurrency = 'ر.س') => {
        const { selectedCurrency } = get();
        const convertedPrice = get().convertPrice(price, fromCurrency);

        if (isNaN(convertedPrice)) return '0';

        const currency = selectedCurrency || { symbol: 'ر.س', code: 'SAR' };

        // Format based on currency with proper symbols
        switch (currency.code) {
          case 'SAR':
          case 'ر.س':
            return `ر.س${convertedPrice.toFixed(2)}`;
          case 'USD':
            return `$${convertedPrice.toFixed(2)}`;
          case 'EUR':
            return `€${convertedPrice.toFixed(2)}`;
          case 'GBP':
            return `£${convertedPrice.toFixed(2)}`;
          case 'JPY':
            return `¥${Math.round(convertedPrice)}`;
          case 'AED':
            return `د.إ${convertedPrice.toFixed(2)}`;
          case 'KWD':
            return `د.ك${convertedPrice.toFixed(3)}`;
          case 'BHD':
            return `د.ب${convertedPrice.toFixed(3)}`;
          case 'QAR':
            return `ر.ق${convertedPrice.toFixed(2)}`;
          case 'OMR':
            return `ر.ع${convertedPrice.toFixed(3)}`;
          default:
            return `${currency.symbol}${convertedPrice.toFixed(2)}`;
        }
      },
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({
        selectedCurrency: state.selectedCurrency,
        availableCurrencies: state.availableCurrencies,
      }),
    }
  )
);

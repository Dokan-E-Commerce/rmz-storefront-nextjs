import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sdk } from './sdk';
import { Customer, AuthResponse } from './types';

interface AuthStore {
  customer: Customer | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, customer: Customer) => void;
  logout: () => void;
  updateCustomer: (customer: Partial<Customer>) => void;
  initAuth: () => Promise<void>;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      customer: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (token: string, customer: Customer) => {
        localStorage.setItem('auth_token', token);

        // Set the auth token in the SDK for authenticated requests
        sdk.setAuthToken(token);

        set({
          token,
          customer,
          isAuthenticated: true
        });

        // Force immediate re-sync to ensure state is consistent
        setTimeout(() => {
          const currentState = get();
          if (currentState.token !== token || !currentState.isAuthenticated) {
            set({
              token,
              customer,
              isAuthenticated: true
            });
            // Re-set token in SDK as well
            sdk.setAuthToken(token);
          }
        }, 100);
      },
      logout: async () => {
        try {
          await sdk.auth.logout();
        } catch (error) {
        }
        localStorage.removeItem('auth_token');

        // Clear the auth token from the SDK
        sdk.setAuthToken(null);

        set({
          customer: null,
          token: null,
          isAuthenticated: false
        });
      },
      updateCustomer: (updates: Partial<Customer>) => {
        const { customer } = get();
        if (customer) {
          set({ customer: { ...customer, ...updates } });
        }
      },
      initAuth: async () => {
        const { token, isAuthenticated } = get();

        if (token && isAuthenticated && typeof window !== 'undefined') {
          set({ isLoading: true });
          try {
            // Set token in SDK
            sdk.setAuthToken(token);

            // Fetch current customer data
            const customer = await authApi.getProfile();
            set({ customer, isLoading: false });
          } catch (error) {
            // Token might be invalid, logout
            console.warn('Failed to fetch profile, logging out:', error);
            get().logout();
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
            partialize: (state) => ({
        token: state.token,
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading
      }),
            onRehydrateStorage: () => (state) => {
        // Ensure localStorage and Zustand state are in sync
        if (typeof window !== 'undefined' && state) {
          const localToken = localStorage.getItem('auth_token');

          if (state.token && !localToken) {
            // Zustand has token but localStorage doesn't - sync localStorage
            localStorage.setItem('auth_token', state.token);
            sdk.setAuthToken(state.token);
            state.isAuthenticated = true;
          } else if (!state.token && localToken) {
            // localStorage has token but Zustand doesn't - sync Zustand
            state.token = localToken;
            sdk.setAuthToken(localToken);
            state.isAuthenticated = true;
          } else if (state.token && localToken && state.token === localToken) {
            // Both have the same token - ensure authenticated
            sdk.setAuthToken(state.token);
            state.isAuthenticated = true;
          } else if (!state.token && !localToken) {
            // Neither has token - ensure not authenticated
            sdk.setAuthToken(null);
            state.isAuthenticated = false;
          }

          // Initialize auth if we have a token
          if (state.isAuthenticated && state.token) {
            // Call initAuth asynchronously
            setTimeout(() => {
              useAuth.getState().initAuth();
            }, 100);
          }
        }
      },
    }
  )
);

// Helper function to check if user is properly authenticated
export const isUserAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  const localToken = localStorage.getItem('auth_token');
  const zustandState = useAuth.getState();

  // Return true if we have a token from either source AND zustand says we're authenticated
  const hasToken = localToken || zustandState.token;
  return !!(hasToken && zustandState.isAuthenticated);
};

// Helper function to get valid auth token
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  // First try localStorage
  const localToken = localStorage.getItem('auth_token');
  if (localToken) return localToken;

  // Fallback to Zustand state
  const zustandState = useAuth.getState();
  return zustandState.token;
};

// Auth API functions
export const authApi = {
  initiateAuth: async (type: 'phone', data: { country_code: string; phone: string }) => {
    try {
      // Use the SDK method - it should handle the correct API path and format
      const result = await sdk.auth.startPhoneAuth(data.phone, data.country_code);
      return result;
    } catch (error) {
      throw error;
    }
  },

  verifyOTP: async (otp: string, sessionToken: string): Promise<AuthResponse> => {
    return await sdk.auth.verifyOTP(otp, sessionToken) as unknown as AuthResponse;
  },

  resendOTP: async (sessionToken: string) => {
    return await sdk.auth.resendOTP(sessionToken);
  },

  completeRegistration: async (
    initData: {
      email: string;
      first_name: string;
      last_name: string;
    },
    sessionToken: string
  ): Promise<AuthResponse> => {
    // Map field names to match SDK expectations
    const sdkData = {
      firstName: initData.first_name,
      lastName: initData.last_name,
      email: initData.email,
      sessionToken: sessionToken
    };
    return await sdk.auth.completeRegistration(sdkData) as unknown as AuthResponse;
  },

  getProfile: async (): Promise<Customer> => {
    return await sdk.auth.getProfile() as unknown as Customer;
  },

  updateProfile: async (data: Partial<Customer>): Promise<Customer> => {
    return await sdk.auth.updateProfile(data as any) as unknown as Customer;
  },
};

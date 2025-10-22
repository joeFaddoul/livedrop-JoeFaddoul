import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLineItem, CustomerLookupResponse, CustomerProfile } from './types';

type CartState = {
  items: CartLineItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  syncWithCatalog: (validProductIds: string[]) => void;
};

const STORAGE_KEY = 'storefront-cart';
const CUSTOMER_STORAGE_KEY = 'storefront-customer';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
      addItem: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === productId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }
          return {
            items: [...state.items, { productId, quantity }],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.productId !== productId),
            };
          }
          return {
            items: state.items.map((item) =>
              item.productId === productId ? { ...item, quantity } : item,
            ),
          };
        }),
      clear: () => set({ items: [] }),
      syncWithCatalog: (validProductIds) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              item.quantity > 0 && validProductIds.includes(item.productId),
          ),
        })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);

export function calculateCartTotal(items: CartLineItem[], prices: Record<string, number>) {
  return items.reduce((total, item) => total + (prices[item.productId] ?? 0) * item.quantity, 0);
}

type CustomerState = {
  profile?: CustomerProfile;
  recentOrders: CustomerLookupResponse['recentOrders'];
  setCustomer: (profile: CustomerProfile, recentOrders: CustomerLookupResponse['recentOrders']) => void;
  clearCustomer: () => void;
};

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      profile: undefined,
      recentOrders: [],
      setCustomer: (profile, recentOrders) => set({ profile, recentOrders }),
      clearCustomer: () => set({ profile: undefined, recentOrders: [] }),
    }),
    {
      name: CUSTOMER_STORAGE_KEY,
    },
  ),
);

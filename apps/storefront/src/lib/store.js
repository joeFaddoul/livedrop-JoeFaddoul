import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const STORAGE_KEY = 'storefront-cart';
export const useCartStore = create()(persist((set, get) => ({
    items: [],
    isCartOpen: false,
    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),
    toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
    addItem: (productId, quantity = 1) => set((state) => {
        const existing = state.items.find((item) => item.productId === productId);
        if (existing) {
            return {
                items: state.items.map((item) => item.productId === productId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item),
            };
        }
        return {
            items: [...state.items, { productId, quantity }],
        };
    }),
    removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.productId !== productId),
    })),
    updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
            return {
                items: state.items.filter((item) => item.productId !== productId),
            };
        }
        return {
            items: state.items.map((item) => item.productId === productId ? { ...item, quantity } : item),
        };
    }),
    clear: () => set({ items: [] }),
}), {
    name: STORAGE_KEY,
    partialize: (state) => ({
        items: state.items,
    }),
}));
export function calculateCartTotal(items, prices) {
    return items.reduce((total, item) => total + (prices[item.productId] ?? 0) * item.quantity, 0);
}

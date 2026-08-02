import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartAddon, CartOptionSelection } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateInstructions: (id: string, instructions: string) => void;
  setCoupon: (code: string | null) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId &&
              i.variant?.name === item.variant?.name &&
              JSON.stringify(i.options) === JSON.stringify(item.options) &&
              JSON.stringify(i.addons) === JSON.stringify(item.addons)
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: Math.min(20, i.quantity + item.quantity) }
                  : i
              ),
              isOpen: true,
            };
          }

          return {
            items: [...state.items, { ...item, id: makeId() }],
            isOpen: true,
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id ? { ...i, quantity: Math.min(20, quantity) } : i
                ),
        })),

      updateInstructions: (id, instructions) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, specialInstructions: instructions } : i
          ),
        })),

      setCoupon: (code) => set({ couponCode: code }),

      clearCart: () => set({ items: [], couponCode: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      getSubtotal: () =>
        get().items.reduce((sum, item) => {
          const addonTotal = item.addons.reduce(
            (a: number, ad: CartAddon) => a + ad.price * ad.quantity,
            0
          );
          const optionMod = item.options.reduce(
            (a: number, o: CartOptionSelection) => a + (o.priceModifier ?? 0),
            0
          );
          return sum + (item.unitPrice + addonTotal + optionMod) * item.quantity;
        }, 0),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "yummilicious-cart",
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
      }),
    }
  )
);

/** True after localStorage cart rehydration — use to avoid SSR/client mismatches. */
export function useCartHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useCartStore.persist.hasHydrated());
    return useCartStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}

"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Order, Product, SkinProfile, UserProfile } from "@/lib/types";

interface CartStore {
  items: CartItem[];
  coupon: string | null;
  discount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getItemCount: () => number;
}

interface SkinProfileStore {
  profile: SkinProfile | null;
  quizOpen: boolean;
  step: number;
  setProfile: (profile: SkinProfile) => void;
  clearProfile: () => void;
  setQuizOpen: (open: boolean) => void;
  setStep: (step: number) => void;
}

const VALID_COUPONS: Record<string, number> = {
  FIRSTORDER: 15,
  VIDANIQ10: 10,
  GLOW20: 20,
  SKIN15: 15,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      discount: 0,

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], coupon: null, discount: 0 }),

      applyCoupon: (code) => {
        const discountPct = VALID_COUPONS[code.toUpperCase()];
        if (discountPct) {
          set({ coupon: code.toUpperCase(), discount: discountPct });
          return true;
        }
        return false;
      },

      removeCoupon: () => set({ coupon: null, discount: 0 }),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        );
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discountAmt = (subtotal * get().discount) / 100;
        return subtotal - discountAmt;
      },

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "vidaniq-cart" }
  )
);

export const useSkinProfileStore = create<SkinProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      quizOpen: false,
      step: 1,

      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
      setQuizOpen: (open) => set({ quizOpen: open, step: 1 }),
      setStep: (step) => set({ step }),
    }),
    { name: "vidaniq-skin-profile" }
  )
);

// ─── Order Store ────────────────────────────────────────────────────────────

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),

      getOrder: (id) => get().orders.find((o) => o.id === id),

      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        })),
    }),
    { name: "vidaniq-orders" }
  )
);

// ─── User Profile Store ──────────────────────────────────────────────────────

interface UserStore {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: null,

      setProfile: (profile) => set({ profile }),

      updateProfile: (partial) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...partial } : null,
        })),

      clearProfile: () => set({ profile: null }),
    }),
    { name: "vidaniq-user" }
  )
);

import { cartPayload, type OrderCustomization } from "@/data/orderCustomization";
import { getPublicPromotions } from "@/data/promotionActions";
import { DEFAULT_PROMOTIONS } from "@/data/promotions";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/data/products";
export type CartItem = {
  customization?: OrderCustomization;
  slug: string;
  size: string;
  quantity: number;
  name: string;
  image: string;
};
const key = "minatoi-cart-v1";
const CartContext = createContext<{
  promotions: Omit<typeof DEFAULT_PROMOTIONS, "codes">;
  items: CartItem[];
  ready: boolean;
  add: (p: Product, size: string, quantity?: number, customization?: OrderCustomization) => void;
  update: (slug: string, size: string, quantity: number, uploadId?: string) => void;
  clear: (snapshot?: string) => void;
  restore: (items: CartItem[]) => void;
}>({
  promotions: DEFAULT_PROMOTIONS,
  items: [],
  ready: false,
  add: () => {},
  update: () => {},
  clear: () => {},
  restore: () => {},
});
export function CartProvider({ children }: { children: ReactNode }) {
  const [promotions, setPromotions] =
    useState<Omit<typeof DEFAULT_PROMOTIONS, "codes">>(DEFAULT_PROMOTIONS);
  useEffect(() => {
    getPublicPromotions()
      .then(setPromotions)
      .catch(() => {});
  }, []);
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (Array.isArray(saved))
        setItems(
          saved
            .filter(
              (i) =>
                i &&
                typeof i.slug === "string" &&
                typeof i.size === "string" &&
                typeof i.name === "string" &&
                typeof i.image === "string" &&
                Number.isInteger(i.quantity) &&
                i.quantity > 0 &&
                i.quantity <= 20,
            )
            .slice(0, 50),
        );
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(key, JSON.stringify(items));
      } catch {
        /* Storage can be unavailable in private browsing. */
      }
  }, [items, ready]);
  function add(p: Product, size: string, quantity = 1, customization?: OrderCustomization) {
    quantity = Number.isFinite(quantity) ? Math.min(20, Math.max(1, Math.floor(quantity))) : 1;
    setItems((prev) => {
      const found = prev.some(
        (i) =>
          i.slug === p.slug &&
          i.size === size &&
          i.customization?.uploadId === customization?.uploadId,
      );
      return found
        ? prev.map((i) =>
            i.slug === p.slug &&
            i.size === size &&
            i.customization?.uploadId === customization?.uploadId
              ? { ...i, quantity: Math.min(20, i.quantity + quantity) }
              : i,
          )
        : [
            ...prev,
            {
              slug: p.slug,
              size,
              quantity,
              name: p.name,
              image: customization?.photoUrl ?? p.image,
              ...(customization ? { customization } : {}),
            },
          ].slice(0, 50);
    });
  }
  function update(slug: string, size: string, quantity: number, uploadId?: string) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.slug === slug && i.size === size && i.customization?.uploadId === uploadId
            ? { ...i, quantity: Math.min(20, Math.max(0, quantity)) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }
  const restore = useCallback((items: CartItem[]) => setItems(items), []);
  const clear = useCallback((snapshot?: string) => {
    setItems((previous) => {
      if (snapshot && JSON.stringify(cartPayload(previous)) !== snapshot) return previous;
      try {
        localStorage.removeItem("minatoi-cart-reminder-v1");
      } catch {
        /* Optional storage. */
      }
      return [];
    });
  }, []);
  return (
    <CartContext.Provider value={{ promotions, items, ready, add, update, clear, restore }}>
      {children}
    </CartContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
export function CartLink() {
  const { items } = useCart();
  return (
    <a
      href="/sepet"
      className="ml-3 rounded-full border border-stone-200 px-3 py-2 text-sm font-semibold"
      aria-label={`Sepetim, ${items.reduce((n, i) => n + i.quantity, 0)} ürün`}
    >
      Sepet ({items.reduce((n, i) => n + i.quantity, 0)})
    </a>
  );
}

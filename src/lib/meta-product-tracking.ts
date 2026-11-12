import { priceForSize } from "../data/productPricing.ts";
import type { Product } from "../data/products";

type ProductEvent = "ViewContent" | "AddToCart";

/** Product slugs use the same identity as the existing Purchase event. No customer/upload data. */
export function trackMetaProduct(
  event: ProductEvent,
  product: Product,
  size: string,
  quantity = 1,
) {
  if (typeof window === "undefined" || /^\/admin(?:\/|$)/.test(window.location.pathname)) return;
  try {
    const price = priceForSize(product, size).price;
    if (
      !product.slug ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(quantity) ||
      quantity < 1
    )
      return;
    const payload = {
      content_ids: [product.slug],
      content_type: "product",
      content_name: product.name,
      content_category: product.category,
      contents: [{ id: product.slug, quantity, item_price: price }],
      value: Math.round(price * quantity * 100) / 100,
      currency: "TRY",
      ...(event === "AddToCart" ? { num_items: quantity } : {}),
    };
    // Head scripts normally initialize fbq first. Allow a delayed initialization without
    // replacing Meta's queue or marking a blocked event as successfully delivered.
    const send = (attempt: number) => {
      if (/^\/admin(?:\/|$)/.test(window.location.pathname)) return;
      const target = window as Window & { fbq?: (...args: unknown[]) => void };
      try {
        if (typeof target.fbq === "function") target.fbq("track", event, payload);
        else if (attempt < 20) window.setTimeout(() => send(attempt + 1), 250);
      } catch {
        /* Tracking must never interrupt browsing or adding to the cart. */
      }
    };
    send(0);
  } catch {
    /* Invalid variant pricing must not break the shopping flow. */
  }
}

type PaidOrder = {
  id: string;
  status: string;
  amount: number;
  test_mode?: boolean;
  items?: {
    slug: string;
    name: string;
    size: string;
    quantity: number;
    unitAmount: number;
    discount: number;
  }[];
};
type TrackingWindow = Window & {
  dataLayer?: unknown[];
  fbq?: (...args: unknown[]) => void;
};
const sent = new Set<string>();

// Only server-confirmed paid orders reach this function. Never include customer data.
export function trackPaidOrder(order: PaidOrder) {
  if (
    typeof window === "undefined" ||
    order.status !== "paid" ||
    order.test_mode ||
    !/^MT[a-f0-9]{32}$/.test(order.id) ||
    !Number.isSafeInteger(order.amount) ||
    order.amount <= 0
  )
    return;
  const target = window as TrackingWindow;
  const value = order.amount / 100;
  const items = (order.items ?? []).map((item) => ({
    item_id: item.slug,
    item_name: item.name,
    item_variant: item.size,
    price: (item.unitAmount - item.discount / item.quantity) / 100,
    quantity: item.quantity,
    discount: item.discount / item.quantity / 100,
  }));
  for (const channel of ["ga4", "meta"] as const) {
    const key = `minatoi-purchase-v1:${channel}:${order.id}`;
    if (sent.has(key)) continue;
    try {
      if (localStorage.getItem(key)) continue;
    } catch {
      /* In-memory fallback. */
    }
    try {
      if (channel === "ga4") {
        target.dataLayer = target.dataLayer || [];
        // gtag consumes Arguments objects, including events queued before the tag loads.
        const gtag = function (..._args: unknown[]) {
          // eslint-disable-next-line prefer-rest-params -- Google tag queue expects Arguments.
          target.dataLayer!.push(arguments);
        };
        gtag("event", "purchase", {
          send_to: "G-2C6547VHP4",
          transaction_id: order.id,
          value,
          currency: "TRY",
          shipping: 0,
          items,
        });
      } else {
        if (typeof target.fbq !== "function") continue;
        target.fbq(
          "track",
          "Purchase",
          {
            value,
            currency: "TRY",
            content_type: "product",
            content_ids: items.map((item) => item.item_id),
            contents: items.map((item) => ({
              id: item.item_id,
              quantity: item.quantity,
              item_price: item.price,
            })),
            num_items: items.reduce((sum, item) => sum + item.quantity, 0),
          },
          { eventID: `purchase_${order.id}` },
        );
      }
      sent.add(key);
      try {
        localStorage.setItem(key, "1");
      } catch {
        /* In-memory fallback. */
      }
    } catch {
      /* Analytics must never interrupt order confirmation. */
    }
  }
}

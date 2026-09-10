import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const cartSchema = z
  .array(
    z
      .object({
        slug: z.string().min(1).max(160),
        size: z.string().max(100).default(""),
        quantity: z.number().int().min(1).max(20),
      })
      .strict(),
  )
  .min(1)
  .max(50);
export const checkoutSchema = z
  .object({
    items: cartSchema,
    customer: z
      .object({
        name: z.string().trim().min(3).max(60),
        email: z.string().trim().email().max(100),
        phone: z
          .string()
          .trim()
          .regex(/^\+?[\d\s()-]{10,20}$/),
        city: z.string().trim().min(2).max(60),
        district: z.string().trim().min(2).max(60),
        address: z.string().trim().min(10).max(250),
      })
      .strict(),
    consent: z.literal(true),
    requestId: z.string().uuid(),
    expectedAmount: z.number().int().positive(),
  })
  .strict();
export type OrderItem = {
  slug: string;
  size: string;
  quantity: number;
  name: string;
  unitAmount: number;
  discount: number;
  image: string;
};
export function priceCart(
  input: unknown,
  products: { slug: string; name: string; price: number; image: string; sizes?: string[] }[],
) {
  const cart = cartSchema.parse(input);
  const seen = new Set<string>();
  const items: OrderItem[] = cart.map((item) => {
    const key = JSON.stringify([item.slug, item.size]);
    if (seen.has(key)) throw new Error("Sepette tekrarlanan ürün var.");
    seen.add(key);
    const p = products.find((p) => p.slug === item.slug);
    if (!p)
      throw new Error("Sepetteki bir ürün artık satışta değil. Lütfen sepetinizi güncelleyin.");
    if (p.sizes?.length ? !p.sizes.includes(item.size) : item.size !== "")
      throw new Error("Ürün ölçüsü geçersiz. Lütfen ürünü yeniden ekleyin.");
    const unitAmount = Math.round(p.price * 100);
    if (!Number.isSafeInteger(unitAmount) || unitAmount <= 0)
      throw new Error("Ürün fiyatı geçersiz.");
    return { ...item, name: p.name, unitAmount, image: p.image, discount: 0 };
  });
  const subtotal = items.reduce((n, i) => n + i.unitAmount * i.quantity, 0);
  const quantity = items.reduce((n, i) => n + i.quantity, 0);
  const cheapest = items.reduce((min, item) => (item.unitAmount < min.unitAmount ? item : min));
  const discount = quantity >= 2 ? Math.round(cheapest.unitAmount / 4) : 0;
  cheapest.discount = discount;
  const amount = subtotal - discount;
  if (!Number.isSafeInteger(amount) || amount > 100000000)
    throw new Error("Sepet tutarı sınırı aşıldı.");
  return { items, subtotal, discount, amount, shipping: 0 };
}
export function sign(value: string, key: string) {
  return createHmac("sha256", key).update(value).digest("base64");
}
export function verifyCallback(body: Record<string, string>, key: string, salt: string) {
  if (
    !/^[a-zA-Z0-9]{1,64}$/.test(body.merchant_oid ?? "") ||
    !["success", "failed"].includes(body.status) ||
    !/^\d{1,12}$/.test(body.total_amount ?? "")
  )
    return false;
  const expected = Buffer.from(
    sign(body.merchant_oid + salt + body.status + body.total_amount, key),
  );
  const actual = Buffer.from(body.hash ?? "");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export const ORDER_SCHEMA = `CREATE TABLE IF NOT EXISTS orders (
 id text PRIMARY KEY, request_id uuid NOT NULL UNIQUE, request_hash text NOT NULL,
 access_hash text NOT NULL, customer jsonb NOT NULL, items jsonb NOT NULL,
 amount integer NOT NULL CHECK(amount>0), shipping integer NOT NULL DEFAULT 0 CHECK(shipping=0),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','awaiting_transfer','paid','failed')),
 payment_method text NOT NULL DEFAULT 'card' CHECK(payment_method IN ('card','bank_transfer')),
 test_mode boolean NOT NULL, iframe_token text, token_created_at timestamptz,
 failure_code text, created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz,
 consent_at timestamptz NOT NULL DEFAULT now(), consent_version text NOT NULL DEFAULT 'checkout-v1'
); CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at DESC);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount integer NOT NULL DEFAULT 0 CHECK(discount>=0);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'card';
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK(status IN ('pending','awaiting_transfer','paid','failed'));
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check CHECK(payment_method IN ('card','bank_transfer'));`;

/** Called under SELECT FOR UPDATE; terminal orders cannot be fulfilled twice. */
export function paymentTransition(
  order: { amount: number; status: string; test_mode: boolean },
  data: Record<string, string>,
): "paid" | "failed" | null {
  if (data.status === "success" && Number(data.total_amount) !== order.amount)
    throw new Error("Amount mismatch");
  if (data.test_mode !== undefined && data.test_mode !== (order.test_mode ? "1" : "0"))
    throw new Error("Mode mismatch");
  if (order.status !== "pending") return null;
  return data.status === "success" ? "paid" : "failed";
}

/** Split the one discounted unit so PayTR basket arithmetic matches the signed total. */
export function paymentBasket(items: OrderItem[]): [string, string, number][] {
  return items.flatMap((item) => {
    const name = item.name + (item.size ? " — " + item.size : "");
    if (!item.discount)
      return [[name, (item.unitAmount / 100).toFixed(2), item.quantity]] as [
        string,
        string,
        number,
      ][];
    const rows: [string, string, number][] = [
      [name + " (%25 indirim)", ((item.unitAmount - item.discount) / 100).toFixed(2), 1],
    ];
    if (item.quantity > 1) rows.push([name, (item.unitAmount / 100).toFixed(2), item.quantity - 1]);
    return rows;
  });
}

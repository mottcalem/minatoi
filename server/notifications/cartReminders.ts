import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { PoolClient } from "pg";
import type { OrderItem } from "../payments/core.ts";
export const CART_REMINDER_SCHEMA = `CREATE TABLE IF NOT EXISTS cart_reminders (
 id uuid PRIMARY KEY, capture_hash text NOT NULL, email text NOT NULL,
 items jsonb NOT NULL, coupon_code text NOT NULL DEFAULT '', order_ids text[] NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 next_attempt_at timestamptz NOT NULL DEFAULT now()+interval '1 hour',
 sent_at timestamptz, cancelled_at timestamptz, attempts integer NOT NULL DEFAULT 0,
 last_error text, test_mode boolean NOT NULL DEFAULT false
); CREATE INDEX IF NOT EXISTS cart_reminders_due_idx ON cart_reminders(next_attempt_at) WHERE sent_at IS NULL AND cancelled_at IS NULL;
CREATE INDEX IF NOT EXISTS cart_reminders_email_idx ON cart_reminders(email);
CREATE INDEX IF NOT EXISTS orders_paid_email_idx ON orders(lower(customer->>'email'),paid_at) WHERE status='paid';
CREATE TABLE IF NOT EXISTS cart_reminder_optouts (email text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());`;
type DB = Pick<PoolClient, "query">;
export type ReminderCart = {
  id: string;
  email: string;
  items: OrderItem[];
  coupon_code: string;
  test_mode: boolean;
};
export const captureHash = (value: string) => createHash("sha256").update(value).digest("hex");
export function reminderKey(id: string, secret: string, purpose = "restore") {
  if (secret.length < 32) throw new Error("Cart reminder secret missing");
  return createHmac("sha256", secret).update(`${purpose}:${id}`).digest("hex");
}
export function matchesKey(actual: string, expected: string) {
  return (
    /^[a-f0-9]{64}$/.test(actual) &&
    /^[a-f0-9]{64}$/.test(expected) &&
    timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  );
}
export function reminderLinks(id: string, secret: string, base: string) {
  const recover = new URL("/sepet", base);
  recover.hash = new URLSearchParams({ cart: id, key: reminderKey(id, secret) }).toString();
  const unsubscribe = new URL("/sepet", base);
  unsubscribe.hash = new URLSearchParams({
    stopcart: id,
    key: reminderKey(id, secret, "unsubscribe"),
  }).toString();
  return { recover: recover.href, unsubscribe: unsubscribe.href };
}
export async function deliverNextCartReminder(
  client: DB,
  send: (cart: ReminderCart) => Promise<void>,
) {
  const { rows } = await client.query(
    `SELECT * FROM cart_reminders WHERE sent_at IS NULL AND cancelled_at IS NULL AND next_attempt_at<=now() ORDER BY next_attempt_at LIMIT 1 FOR UPDATE SKIP LOCKED`,
  );
  const cart = rows[0];
  if (!cart) return false;
  // Serialize by recipient, including across application instances.
  await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [cart.email]);
  const guard = await client.query(
    `SELECT
    NOT EXISTS(SELECT 1 FROM orders WHERE status='paid' AND (lower(customer->>'email')=$1 OR id=ANY($2::text[])) AND paid_at >= $3) AND
    NOT EXISTS(SELECT 1 FROM cart_reminder_optouts WHERE email=$1) AND
    NOT EXISTS(SELECT 1 FROM cart_reminders WHERE email=$1 AND sent_at>now()-interval '24 hours' AND id<>$4) AND
    $3::timestamptz>now()-interval '7 days' AS sendable`,
    [cart.email, cart.order_ids, cart.created_at, cart.id],
  );
  if (!guard.rows[0]?.sendable) {
    await client.query("UPDATE cart_reminders SET cancelled_at=now() WHERE id=$1", [cart.id]);
    return true;
  }
  try {
    await send(cart);
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
            .replace(/[^A-Z0-9_]/gi, "")
            .slice(0, 40)
        : "SMTP_ERROR";
    await client.query(
      `UPDATE cart_reminders SET attempts=attempts+1,last_error=$2,
      cancelled_at=CASE WHEN attempts>=4 THEN now() ELSE cancelled_at END,
      next_attempt_at=now()+LEAST(3600,300*power(2,attempts))*interval '1 second' WHERE id=$1`,
      [cart.id, code],
    );
    console.error("[cart-reminder] Delivery deferred", cart.id, code);
    return true;
  }
  await client.query(
    "UPDATE cart_reminders SET sent_at=now(),attempts=attempts+1,last_error=NULL WHERE id=$1",
    [cart.id],
  );
  console.info("[cart-reminder] Sent", cart.id);
  return true;
}
const escape = (value: unknown) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
export function cartReminderMessage(
  cart: ReminderCart,
  links: { recover: string; unsubscribe: string },
  preview = false,
) {
  const title = "Sepetiniz sizi bekliyor";
  const intro =
    "Seçtiğiniz ürünler sepetinizde duruyor. Sepetinize dönüp siparişinizi hemen tamamlayabilirsiniz.";
  const guarantee = "Hasarsız Teslimat Garantisi";
  const rows = cart.items.map(
    (item) =>
      `${item.name}${item.size ? ` · ${item.size}` : ""} × ${item.quantity}${item.customization?.style ? ` · ${item.customization.style}` : ""}`,
  );
  const test = preview || cart.test_mode;
  return {
    subject: `${test ? "[TEST] " : ""}MinaToi — Sepetiniz hazır, siparişinizi tamamlayın`,
    text: [
      test ? "TEST — Gerçek sipariş değildir." : "",
      title,
      intro,
      ...rows,
      guarantee,
      "Özenle paketleme · Ücretsiz kargo · Güvenli ödeme",
      `Sepetimi tamamla: ${links.recover}`,
      "Güncel fiyat ve stok bilgileri sepetinizde hesaplanır.",
      `Sepet hatırlatmalarını kapat: ${links.unsubscribe}`,
      "MinaToi",
    ]
      .filter(Boolean)
      .join("\n\n"),
    html: `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f5f3ef;color:#292524;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" style="max-width:620px;background:#fff;border-radius:16px" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 24px"><p style="letter-spacing:3px;color:#8b7045">MİNATOİ</p>${test ? "<p>TEST — Gerçek sipariş değildir.</p>" : ""}<h1 style="font-size:26px">${title}</h1><p style="line-height:1.7">${intro}</p>${rows.map((row) => `<p style="padding:14px 0;border-bottom:1px solid #eee;line-height:1.6">${escape(row)}</p>`).join("")}<table role="presentation" width="100%" style="background:#f5f3ef;border:1px solid #d6c6a8;border-radius:12px;margin:24px 0"><tr><td style="padding:20px;text-align:center"><strong style="font-size:20px;color:#5f4a27">${guarantee}</strong><p style="font-size:14px;line-height:1.6">Özenle paketleme · Ücretsiz kargo · Güvenli ödeme</p></td></tr></table><p style="text-align:center;margin:28px 0"><a href="${escape(links.recover)}" style="display:inline-block;background:#292524;color:#fff;padding:16px 28px;border-radius:32px;text-decoration:none;font-weight:bold">Sepetimi tamamla</a></p><p style="font-size:12px;color:#78716c;line-height:1.6">Güncel fiyat ve stok bilgileri sepetinizde hesaplanır. Bu sepet için tek bir hatırlatma gönderiyoruz.</p><p style="font-size:12px"><a href="${escape(links.unsubscribe)}" style="color:#78716c">Sepet hatırlatmalarını kapat</a></p><p style="color:#78716c">MinaToi</p></td></tr></table></td></tr></table></body></html>`,
  };
}

import { z } from "zod";
import type { Pool, PoolClient } from "pg";
import { captureHash, matchesKey, reminderKey } from "./cartReminders.ts";
import type { OrderItem } from "../payments/core.ts";
const identity = z.object({ id: z.string().uuid(), access: z.string().regex(/^[a-f0-9]{64}$/) });
const capture = identity.extend({
  email: z
    .string()
    .trim()
    .email()
    .max(100)
    .transform((v) => v.toLowerCase()),
  items: z.array(z.unknown()).max(50),
  couponCode: z.string().trim().toUpperCase().max(40).default(""),
});
type DB = Pick<PoolClient, "query">;
export function createCartReminderAPI({
  env,
  getPool,
  withTransaction,
  priceItems,
}: {
  env: NodeJS.ProcessEnv;
  getPool: () => Pick<Pool, "query">;
  withTransaction: <T>(fn: (client: DB) => Promise<T>) => Promise<T>;
  priceItems: (items: unknown, coupon: string) => Promise<OrderItem[]>;
}) {
  const limits = new Map<string, { count: number; until: number }>();
  const secret = () => {
    if (!env.CART_REMINDER_SECRET || env.CART_REMINDER_SECRET.length < 32)
      throw new Error("reminder_config");
    return env.CART_REMINDER_SECRET;
  };
  const authorized = (row: { id: string; capture_hash: string }, access: string) =>
    matchesKey(captureHash(access), row.capture_hash) ||
    matchesKey(access, reminderKey(row.id, secret()));
  const json = (data: unknown, status = 200) =>
    Response.json(data, {
      status,
      headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
  return async (request: Request) => {
    if (env.CART_REMINDER_ENABLED !== "1")
      return json({ error: "Sepet hatırlatma şu anda kapalı." }, 503);
    if (request.method !== "POST") return json({ error: "Yöntem desteklenmiyor." }, 405);
    const allowed = [
      env.PAYTR_PUBLIC_URL?.replace(/\/$/, ""),
      ...(env.CHECKOUT_ALLOWED_ORIGINS ?? "").split(",").map((v) => v.trim().replace(/\/$/, "")),
    ];
    if (env.NODE_ENV !== "production")
      allowed.push("http://localhost:8080", "http://127.0.0.1:8080");
    const origin = request.headers.get("origin");
    if (!origin || !allowed.includes(origin))
      return json({ error: "İstek kaynağı doğrulanamadı." }, 403);
    const now = Date.now();
    for (const [key, value] of limits) if (value.until <= now) limits.delete(key);
    const ip =
      env.PAYTR_TRUST_PROXY === "1" ? (request.headers.get("x-real-ip") ?? "unknown") : "unknown";
    const limit = limits.get(ip) ?? { count: 0, until: now + 60000 };
    if (limit.count >= 30 || (limits.size >= 10000 && !limits.has(ip)))
      return json({ error: "Çok fazla istek." }, 429);
    limit.count++;
    limits.set(ip, limit);
    let input: unknown;
    try {
      secret();
      if (Number(request.headers.get("content-length")) > 20000)
        return json({ error: "İstek çok büyük." }, 413);
      const reader = request.body?.getReader();
      if (!reader) throw new Error("empty");
      const chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.length;
        if (size > 20000) {
          await reader.cancel();
          return json({ error: "İstek çok büyük." }, 413);
        }
        chunks.push(part.value);
      }
      input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return json({ error: "Geçersiz istek." }, 400);
    }
    const parsed = identity.safeParse(input);
    if (!parsed.success) return json({ error: "Sepet bağlantısı geçersiz." }, 400);
    const auth = parsed.data;
    const action = new URL(request.url).pathname.split("/").pop();
    try {
      if (action === "capture") {
        const data = capture.safeParse(input);
        if (!data.success) return json({ error: "Sepet bilgileri geçersiz." }, 400);
        const { email, couponCode } = data.data;
        let items: OrderItem[];
        try {
          items = data.data.items.length ? await priceItems(data.data.items, couponCode) : [];
        } catch {
          return json({ error: "Sepet doğrulanamadı." }, 400);
        }
        return await withTransaction(async (client) => {
          if (!items.length) {
            await client.query(
              `INSERT INTO cart_reminders(id,capture_hash,email,items,coupon_code,cancelled_at) VALUES($1,$2,$3,$4::jsonb,$5,now()) ON CONFLICT DO NOTHING`,
              [auth.id, captureHash(auth.access), email, "[]", couponCode],
            );
            const row = (
              await client.query("SELECT * FROM cart_reminders WHERE id=$1 FOR UPDATE", [auth.id])
            ).rows[0];
            if (row && authorized(row, auth.access))
              await client.query("UPDATE cart_reminders SET cancelled_at=now() WHERE id=$1", [
                auth.id,
              ]);
            return json({ ok: true });
          }
          await client.query(
            `INSERT INTO cart_reminders(id,capture_hash,email,items,coupon_code) VALUES($1,$2,$3,$4::jsonb,$5) ON CONFLICT DO NOTHING`,
            [auth.id, captureHash(auth.access), email, JSON.stringify(items), couponCode],
          );
          const row = (
            await client.query("SELECT * FROM cart_reminders WHERE id=$1 FOR UPDATE", [auth.id])
          ).rows[0];
          if (!row || !authorized(row, auth.access))
            return json({ error: "Sepet bağlantısı geçersiz." }, 404);
          await client.query(
            `UPDATE cart_reminders SET email=$2,items=$3::jsonb,coupon_code=$4,updated_at=now(),next_attempt_at=now()+interval '1 hour'
            WHERE id=$1 AND sent_at IS NULL AND cancelled_at IS NULL AND (email IS DISTINCT FROM $2 OR items IS DISTINCT FROM $3::jsonb OR coupon_code IS DISTINCT FROM $4)`,
            [auth.id, email, JSON.stringify(items), couponCode],
          );
          return json({ ok: true });
        });
      }
      if (action === "unsubscribe") {
        if (!matchesKey(auth.access, reminderKey(auth.id, secret(), "unsubscribe")))
          return json({ error: "Bağlantı geçersiz." }, 404);
        await withTransaction(async (client) => {
          const row = (
            await client.query("SELECT email FROM cart_reminders WHERE id=$1 FOR UPDATE", [auth.id])
          ).rows[0];
          if (row) {
            await client.query(
              "INSERT INTO cart_reminder_optouts(email) VALUES($1) ON CONFLICT DO NOTHING",
              [row.email],
            );
            await client.query(
              "UPDATE cart_reminders SET cancelled_at=now() WHERE email=$1 AND sent_at IS NULL",
              [row.email],
            );
          }
        });
        return json({ ok: true });
      }
      const row = (
        await getPool().query(
          "SELECT * FROM cart_reminders WHERE id=$1 AND created_at>now()-interval '7 days'",
          [auth.id],
        )
      ).rows[0];
      if (!row || !authorized(row, auth.access))
        return json({ error: "Sepet bağlantısı bulunamadı veya süresi doldu." }, 404);
      if (action === "link") {
        const order = z
          .object({
            orderId: z.string().regex(/^MT[a-f0-9]{32}$/),
            orderAccess: z.string().regex(/^[a-f0-9]{64}$/),
          })
          .safeParse(input);
        if (!order.success) return json({ error: "Sipariş bilgisi geçersiz." }, 400);
        const found = await getPool().query(
          "SELECT id FROM orders WHERE id=$1 AND access_hash=$2",
          [order.data.orderId, captureHash(order.data.orderAccess)],
        );
        if (!found.rows.length) return json({ error: "Sipariş bulunamadı." }, 404);
        await getPool().query(
          "UPDATE cart_reminders SET order_ids=array_append(order_ids,$2) WHERE id=$1 AND NOT ($2=ANY(order_ids))",
          [row.id, order.data.orderId],
        );
        return json({ ok: true });
      }
      if (action !== "restore") return json({ error: "Bulunamadı." }, 404);
      try {
        const payload = row.items.map((item: OrderItem) => ({
          slug: item.slug,
          size: item.size,
          quantity: item.quantity,
          ...(item.customization
            ? { customization: { uploadId: item.customization.uploadId } }
            : {}),
        }));
        let items: OrderItem[],
          coupon = row.coupon_code;
        try {
          items = await priceItems(payload, coupon);
        } catch {
          coupon = "";
          items = await priceItems(payload, coupon);
        }
        return json({ email: row.email, items, couponCode: coupon });
      } catch {
        return json(
          { error: "Sepetinizdeki ürünler değişmiş olabilir. Lütfen ürünleri yeniden seçin." },
          409,
        );
      }
    } catch {
      console.error("[cart-reminder] Request unavailable");
      return json({ error: "Sepet kaydedilemedi. Ödemenize devam edebilirsiniz." }, 503);
    }
  };
}

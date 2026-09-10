import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import type { Pool, PoolClient } from "pg";
import type { Product } from "../../src/data/products";
import {
  checkoutSchema,
  priceCart,
  sign,
  verifyCallback,
  paymentTransition,
  paymentBasket,
} from "./core.ts";

type Dependencies = {
  getPool: () => Pick<Pool, "query">;
  withTransaction: <T>(operation: (client: Pick<PoolClient, "query">) => Promise<T>) => Promise<T>;
  readProducts: () => Promise<Product[]>;
  fetch: typeof globalThis.fetch;
  env: NodeJS.ProcessEnv;
};
export function createPaymentAPI({
  getPool,
  withTransaction,
  readProducts,
  fetch,
  env,
}: Dependencies) {
  const digest = (s: string) => createHash("sha256").update(s).digest("hex");
  const json = (data: unknown, status = 200) =>
    Response.json(data, {
      status,
      headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
  class PublicError extends Error {
    status: number;
    constructor(message: string, status = 400) {
      super(message);
      this.status = status;
    }
  }
  const limits = new Map<string, { count: number; until: number }>();
  function throttle(key: string, max: number) {
    const now = Date.now();
    for (const [k, v] of limits) if (v.until < now) limits.delete(k);
    const entry = limits.get(key) ?? { count: 0, until: now + 60000 };
    entry.count++;
    limits.set(key, entry);
    if (entry.count > max)
      throw new PublicError("Çok fazla deneme yaptınız. Bir dakika sonra tekrar deneyin.", 429);
  }
  async function body(request: Request) {
    if (Number(request.headers.get("content-length") ?? 0) > 20000)
      throw new PublicError("İstek çok büyük.", 413);
    const reader = request.body?.getReader();
    if (!reader) throw new PublicError("İstek boş.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 20000) {
        await reader.cancel();
        throw new PublicError("İstek çok büyük.", 413);
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  }
  function config() {
    const id = env.PAYTR_MERCHANT_ID,
      key = env.PAYTR_MERCHANT_KEY,
      salt = env.PAYTR_MERCHANT_SALT;
    const base = env.PAYTR_PUBLIC_URL?.replace(/\/$/, "");
    if (!id || !key || !salt || !base)
      throw new PublicError(
        "Ödeme bağlantısı henüz hazır değil. Lütfen daha sonra tekrar deneyin.",
        503,
      );
    const url = new URL(base);
    if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash)
      throw new Error("PAYTR_PUBLIC_URL must be an HTTPS origin");
    const mode = env.PAYTR_TEST_MODE;
    if (mode !== "0" && mode !== "1") throw new Error("PAYTR_TEST_MODE must be explicit");
    return { id, key, salt, base, mode };
  }
  function checkOrigin(request: Request) {
    const origin = request.headers.get("origin");
    const allowed = [env.PAYTR_PUBLIC_URL?.replace(/\/$/, "")];
    if (env.NODE_ENV !== "production")
      allowed.push("http://localhost:8080", "http://127.0.0.1:8080");
    if (!origin || !allowed.includes(origin))
      throw new PublicError("İstek kaynağı doğrulanamadı.", 403);
  }
  function userIP(request: Request) {
    // Only enable behind a proxy which overwrites this header and blocks direct access.
    const ip =
      (env.NODE_ENV !== "production" ? env.PAYTR_LOCAL_IP : undefined) ||
      (env.PAYTR_TRUST_PROXY === "1" ? request.headers.get("x-real-ip") : null);
    if (!ip || !isIP(ip)) throw new PublicError("Ödeme bağlantısı yapılandırılmalı.", 503);
    return ip;
  }
  function bankConfig() {
    const enabled = env.BANK_TRANSFER_ENABLED === "1";
    const iban = env.BANK_TRANSFER_IBAN?.replace(/\s/g, "").toUpperCase();
    const accountHolder = env.BANK_TRANSFER_ACCOUNT_HOLDER?.trim();
    const bankName = env.BANK_TRANSFER_BANK_NAME?.trim();
    if (!enabled || !iban || !accountHolder || !bankName || !/^TR\d{24}$/.test(iban)) return null;
    return { iban, accountHolder, bankName };
  }
  return async function paymentAPI(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname;
    try {
      if (
        path === "/api/paytr/callback" ||
        (path === "/index.php" &&
          new URL(request.url).searchParams.get("wc-api") === "wc_gateway_paytrcheckout")
      ) {
        if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
        const data = Object.fromEntries(new URLSearchParams(await body(request)));
        const key = env.PAYTR_MERCHANT_KEY;
        const salt = env.PAYTR_MERCHANT_SALT;
        if (!key || !salt) return new Response("Unavailable", { status: 503 });
        if (!verifyCallback(data, key, salt))
          return new Response("Invalid signature", { status: 400 });
        await withTransaction(async (client) => {
          const result = await client.query(
            "SELECT amount,status,test_mode FROM orders WHERE id=$1 FOR UPDATE",
            [data.merchant_oid],
          );
          const order = result.rows[0];
          if (!order) throw new PublicError("Unknown order", 404);
          let nextStatus;
          try {
            nextStatus = paymentTransition(order, data);
          } catch {
            throw new PublicError("Payment mismatch", 400);
          }
          if (!nextStatus) return;
          await client.query(
            "UPDATE orders SET status=$2,paid_at=CASE WHEN $2='paid' THEN now() ELSE NULL END,failure_code=$3,iframe_token=NULL WHERE id=$1",
            [data.merchant_oid, nextStatus, data.failed_reason_code?.slice(0, 40) ?? null],
          );
        });
        return new Response("OK", {
          headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
        });
      }
      if (request.method !== "POST") return json({ error: "Yöntem desteklenmiyor." }, 405);
      checkOrigin(request);
      let input;
      try {
        input = JSON.parse(await body(request));
      } catch (error) {
        if (error instanceof PublicError) throw error;
        throw new PublicError("Geçersiz istek.");
      }
      if (!input || typeof input !== "object" || Array.isArray(input))
        throw new PublicError("Geçersiz istek.");
      if (path === "/api/checkout/quote") {
        throttle("quote", 120);
        const products = await readProducts();
        try {
          return json({
            ...priceCart(input.items, products),
            paymentAvailable: env.PAYTR_ENABLED === "1",
            bankTransferAvailable: Boolean(bankConfig()),
          });
        } catch (error) {
          if (error instanceof Error && error.name !== "ZodError")
            throw new PublicError(error.message);
          throw new PublicError("Sepet doğrulanamadı.");
        }
      }
      if (path === "/api/checkout/status") {
        throttle("status", 300);
        if (
          typeof input.id !== "string" ||
          !/^MT[a-f0-9]{32}$/.test(input.id) ||
          typeof input.access !== "string" ||
          !/^[a-f0-9]{64}$/.test(input.access)
        )
          throw new PublicError("Sipariş bulunamadı.", 404);
        const result = await getPool().query(
          "SELECT id,status,amount,test_mode,payment_method FROM orders WHERE id=$1 AND access_hash=$2",
          [input.id, digest(input.access)],
        );
        if (!result.rowCount) throw new PublicError("Sipariş bulunamadı.", 404);
        const order = result.rows[0];
        return json({
          ...order,
          ...(order.payment_method === "bank_transfer" && bankConfig()
            ? { bankTransfer: bankConfig() }
            : {}),
        });
      }
      if (path === "/api/checkout/bank-transfer") {
        const bank = bankConfig();
        if (!bank) throw new PublicError("Havale/EFT şu anda kullanıma açık değil.", 503);
        throttle("bank:" + (userIP(request) || "unknown"), 10);
        const parsed = checkoutSchema.safeParse(input);
        if (!parsed.success)
          throw new PublicError("Teslimat bilgilerini ve sözleşme onayını kontrol edin.");
        const data = parsed.data;
        let priced;
        try {
          priced = priceCart(data.items, await readProducts());
        } catch {
          throw new PublicError("Sepet doğrulanamadı. Lütfen sepetinizi güncelleyin.");
        }
        if (priced.amount !== data.expectedAmount)
          throw new PublicError("Ürün fiyatı değişti. Sepeti yenileyerek tekrar deneyin.", 409);
        const requestHash = digest(
          JSON.stringify({ ...data, requestId: undefined, paymentMethod: "bank_transfer" }),
        );
        const secret = env.ADMIN_PASS_HASH || env.PAYTR_MERCHANT_KEY;
        if (!secret) throw new PublicError("Havale/EFT yapılandırması eksik.", 503);
        const access = digest(sign(data.requestId + "bank_transfer", secret));
        const id = "MT" + randomBytes(16).toString("hex");
        const created = await getPool().query(
          `INSERT INTO orders(id,request_id,request_hash,access_hash,customer,items,amount,test_mode,discount,status,payment_method) VALUES($1,$2,$3,$4,$5,$6,$7,false,$8,'awaiting_transfer','bank_transfer') ON CONFLICT(request_id) DO NOTHING RETURNING id`,
          [
            id,
            data.requestId,
            requestHash,
            digest(access),
            JSON.stringify(data.customer),
            JSON.stringify(priced.items),
            priced.amount,
            priced.discount,
          ],
        );
        if (!created.rowCount) {
          const old = (
            await getPool().query("SELECT * FROM orders WHERE request_id=$1", [data.requestId])
          ).rows[0];
          if (!old || old.request_hash !== requestHash || old.payment_method !== "bank_transfer")
            throw new PublicError("Sipariş bilgileri değişti. Sayfayı yenileyerek deneyin.", 409);
          return json({
            id: old.id,
            access,
            status: old.status,
            amount: old.amount,
            bankTransfer: bank,
          });
        }
        return json({
          id,
          access,
          status: "awaiting_transfer",
          amount: priced.amount,
          bankTransfer: bank,
        });
      }
      if (path === "/api/checkout/start") {
        if (env.PAYTR_ENABLED !== "1")
          throw new PublicError("Kartla ödeme henüz kullanıma açılmadı.", 503);
        const cfg = config();
        const ip = userIP(request);
        throttle("start:" + ip, 10);
        const parsed = checkoutSchema.safeParse(input);
        if (!parsed.success)
          throw new PublicError("Teslimat bilgilerini ve sözleşme onayını kontrol edin.");
        const data = parsed.data;
        let priced;
        try {
          priced = priceCart(data.items, await readProducts());
        } catch {
          throw new PublicError("Sepet doğrulanamadı. Lütfen sepetinizi güncelleyin.");
        }
        if (priced.amount !== data.expectedAmount)
          throw new PublicError(
            "Ürün fiyatı değişti. Sepeti yenileyerek güncel tutarı kontrol edin.",
            409,
          );
        const hash = digest(JSON.stringify({ ...data, requestId: undefined }));
        // The access secret is reproducible for safe retries, but never stored in clear text.
        const access = createHash("sha256").update(sign(data.requestId, cfg.key)).digest("hex");
        const id = "MT" + randomBytes(16).toString("hex");
        const created = await getPool().query(
          `INSERT INTO orders(id,request_id,request_hash,access_hash,customer,items,amount,test_mode,discount) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(request_id) DO NOTHING RETURNING id`,
          [
            id,
            data.requestId,
            hash,
            digest(access),
            JSON.stringify(data.customer),
            JSON.stringify(priced.items),
            priced.amount,
            cfg.mode === "1",
            priced.discount,
          ],
        );
        if (!created.rowCount) {
          const old = (
            await getPool().query("SELECT * FROM orders WHERE request_id=$1", [data.requestId])
          ).rows[0];
          if (old.request_hash !== hash)
            throw new PublicError("Sepet değişti. Sayfayı yenileyerek tekrar deneyin.", 409);
          if (old.status !== "pending") return json({ id: old.id, access, status: old.status });
          if (
            old.iframe_token &&
            Date.now() - new Date(old.token_created_at).getTime() < 25 * 60000
          )
            return json({ id: old.id, access, token: old.iframe_token, amount: old.amount });
          return json(
            {
              error: "Ödeme oturumu hazırlanıyor veya süresi doldu. Sipariş durumunu kontrol edin.",
              id: old.id,
              access,
            },
            409,
          );
        }
        const basket = Buffer.from(JSON.stringify(paymentBasket(priced.items))).toString("base64");
        const fields = {
          merchant_id: cfg.id,
          user_ip: ip,
          merchant_oid: id,
          email: data.customer.email,
          payment_amount: String(priced.amount),
          user_basket: basket,
          no_installment: "1",
          max_installment: "0",
          currency: "TL",
          test_mode: cfg.mode,
        };
        const token = sign(
          fields.merchant_id +
            ip +
            id +
            fields.email +
            fields.payment_amount +
            basket +
            "10TL" +
            cfg.mode +
            cfg.salt,
          cfg.key,
        );
        const returnBase = env.NODE_ENV !== "production" ? "http://localhost:8080" : cfg.base;
        const resultURL = returnBase + "/odeme-sonucu#" + new URLSearchParams({ id, access });
        let result;
        try {
          const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              ...fields,
              paytr_token: token,
              user_name: data.customer.name,
              user_address: [
                data.customer.address,
                data.customer.district,
                data.customer.city,
                "Türkiye",
              ].join(", "),
              user_phone: data.customer.phone,
              merchant_ok_url: resultURL,
              merchant_fail_url: resultURL,
              timeout_limit: "30",
              debug_on: "0",
              lang: "tr",
            }),
            signal: AbortSignal.timeout(20000),
          });
          if (!response.ok) throw new Error("Provider unavailable");
          result = await response.json();
        } catch {
          return json(
            { error: "Ödeme hizmetine ulaşılamadı. Sipariş durumunu kontrol edin.", id, access },
            502,
          );
        }
        if (
          result.status !== "success" ||
          typeof result.token !== "string" ||
          !/^[a-zA-Z0-9]+$/.test(result.token)
        ) {
          await getPool().query(
            "UPDATE orders SET status='failed',failure_code='token_rejected' WHERE id=$1 AND status='pending'",
            [id],
          );
          throw new PublicError(
            "PayTR ödeme oturumu açılamadı. Mağaza entegrasyon ayarları kontrol edilmeli.",
            502,
          );
        }
        await getPool().query(
          "UPDATE orders SET iframe_token=$2,token_created_at=now() WHERE id=$1 AND status='pending'",
          [id, result.token],
        );
        return json({ id, access, token: result.token, amount: priced.amount });
      }
      if (path === "/api/checkout/admin") {
        throttle("admin", 10);
        const expected = env.ADMIN_PASS_HASH ?? "";
        const actual = typeof input.token === "string" ? input.token : "";
        if (
          !/^[a-f0-9]{64}$/.test(expected) ||
          actual.length !== expected.length ||
          !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
        )
          throw new PublicError("Şifre doğrulanamadı.", 401);
        const page =
          Number.isInteger(input.page) && input.page >= 0 ? Math.min(input.page, 10000) : 0;
        const result = await getPool().query(
          "SELECT id,customer,items,amount,discount,status,test_mode,payment_method,created_at FROM orders ORDER BY created_at DESC LIMIT 50 OFFSET $1",
          [page * 50],
        );
        return json(result.rows);
      }
      if (path === "/api/checkout/admin-order-status") {
        throttle("admin-status", 30);
        const expected = env.ADMIN_PASS_HASH ?? "";
        const actual = typeof input.token === "string" ? input.token : "";
        if (
          !/^[a-f0-9]{64}$/.test(expected) ||
          actual.length !== expected.length ||
          !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
        )
          throw new PublicError("Oturum doğrulanamadı.", 401);
        if (
          typeof input.id !== "string" ||
          !/^MT[a-f0-9]{32}$/.test(input.id) ||
          !["paid", "failed"].includes(input.status)
        )
          throw new PublicError("Sipariş durumu geçersiz.");
        const result = await getPool().query(
          `UPDATE orders SET status=$2,paid_at=CASE WHEN $2='paid' THEN now() ELSE NULL END
           WHERE id=$1 AND payment_method='bank_transfer' AND status='awaiting_transfer'
           RETURNING id`,
          [input.id, input.status],
        );
        if (!result.rowCount) throw new PublicError("Havale siparişi güncellenemedi.", 409);
        return json({ ok: true });
      }
      return json({ error: "Bulunamadı." }, 404);
    } catch (error) {
      if (error instanceof PublicError) return json({ error: error.message }, error.status);
      console.error("[payments] Request failed", error instanceof Error ? error.name : "Unknown");
      return json({ error: "İşlem tamamlanamadı. Lütfen daha sonra tekrar deneyin." }, 500);
    }
  };
}

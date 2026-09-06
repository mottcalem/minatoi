import { loadPassHash, safeEqual } from "../../utils/adminAuth";
/**
 * GET  /api/products  → ürün satırlarını okur
 * POST /api/products  → ürünleri ve ilişkilerini transaction ile kaydeder (auth gerekli)
 *
 * Nitro server route — production build'de çalışır.
 */
import { defineEventHandler, readBody, getMethod, setResponseHeader, getHeader } from "h3";
import { readProducts, writeProducts } from "../../utils/productStore";

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  setResponseHeader(event, "Content-Type", "application/json; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
  setResponseHeader(event, "Pragma", "no-cache");
  setResponseHeader(event, "Expires", "0");

  // ── GET ─────────────────────────────────────────────────────────────────
  if (method === "GET") {
    try {
      const data = await readProducts();
      return data;
    } catch (err) {
      console.error("[api/products GET] Error:", err);
      event.node.res.statusCode = 500;
      return JSON.stringify({ error: "Failed to read products" });
    }
  }

  // ── POST ────────────────────────────────────────────────────────────────
  if (method === "POST") {
    const expectedHash = await loadPassHash();
    const auth  = getHeader(event, "authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    if (!safeEqual(token, expectedHash)) {
      console.error(`[api/products POST] Auth failed. Token length: ${token.length}, Expected hash length: ${expectedHash.length}, Hash found: ${!!expectedHash}`);
      event.node.res.statusCode = 401;
      return JSON.stringify({ error: "Unauthorized" });
    }

    try {
      const body = await readBody(event);
      if (!Array.isArray(body)) {
        event.node.res.statusCode = 400;
        return JSON.stringify({ error: "Body must be an array" });
      }
      await writeProducts(body);
      return JSON.stringify({ ok: true, count: body.length });
    } catch (err) {
      console.error("[api/products POST] write error:", err);
      event.node.res.statusCode = 500;
      return JSON.stringify({ error: "Write failed" });
    }
  }

  event.node.res.statusCode = 405;
  return JSON.stringify({ error: "Method not allowed" });
});

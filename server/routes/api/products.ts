/**
 * GET  /api/products  → public/products.json içeriğini döner
 * POST /api/products  → public/products.json + data/products.json'a yazar (auth gerekli)
 *
 * Nitro server route — production build'de çalışır.
 */
import { defineEventHandler, readBody, getMethod, setResponseHeader, getHeader } from "h3";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());
const PUBLIC_JSON = resolve(ROOT, "public", "products.json");
const DATA_JSON   = resolve(ROOT, "data",   "products.json");

// Her iki konuma da yazar (senkron tutar)
async function writeProducts(data: unknown): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await writeFile(PUBLIC_JSON, content, "utf-8");
  try { await writeFile(DATA_JSON, content, "utf-8"); } catch { /* data/ yoksa geç */ }
}

// İlk bulunan kaynaktan okur
async function readProducts(): Promise<string> {
  for (const p of [PUBLIC_JSON, DATA_JSON]) {
    try { return await readFile(p, "utf-8"); } catch { /* devam */ }
  }
  return "[]";
}

// .env'den şifre hash'ini al (process.env veya dosyadan)
async function loadPassHash(): Promise<string> {
  const fromEnv =
    process.env["ADMIN_PASS_HASH"] ??
    process.env["VITE_ADMIN_PASS_HASH"] ??
    "";
  if (fromEnv) return fromEnv;
  try {
    const raw = await readFile(resolve(ROOT, ".env"), "utf-8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (t.startsWith("ADMIN_PASS_HASH="))      return t.slice("ADMIN_PASS_HASH=".length).trim();
      if (t.startsWith("VITE_ADMIN_PASS_HASH=")) return t.slice("VITE_ADMIN_PASS_HASH=".length).trim();
    }
  } catch { /* .env yok */ }
  return "";
}

function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event);
  setResponseHeader(event, "Content-Type", "application/json; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "no-cache");

  // ── GET ─────────────────────────────────────────────────────────────────
  if (method === "GET") {
    return readProducts();
  }

  // ── POST ────────────────────────────────────────────────────────────────
  if (method === "POST") {
    const expectedHash = await loadPassHash();
    const auth  = getHeader(event, "authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    if (!safeEqual(token, expectedHash)) {
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
      console.error("[api/products] write error:", err);
      event.node.res.statusCode = 500;
      return JSON.stringify({ error: "Write failed" });
    }
  }

  event.node.res.statusCode = 405;
  return JSON.stringify({ error: "Method not allowed" });
});

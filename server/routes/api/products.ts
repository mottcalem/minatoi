/**
 * GET  /api/products  → public/products.json içeriğini döner
 * POST /api/products  → public/products.json + data/products.json'a yazar (auth gerekli)
 *
 * Nitro server route — production build'de çalışır.
 */
import { defineEventHandler, readBody, getMethod, setResponseHeader, getHeader } from "h3";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { existsSync } from "node:fs";

const ROOT = resolve(process.cwd());
const PUBLIC_JSON = resolve(ROOT, "public", "products.json");
const DATA_JSON   = resolve(ROOT, "data",   "products.json");

// Her iki konuma da yazar (senkron tutar)
async function writeProducts(data: unknown): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  
  // public dizininin var olduğundan emin ol
  const publicDir = dirname(PUBLIC_JSON);
  if (!existsSync(publicDir)) {
    await mkdir(publicDir, { recursive: true });
  }
  
  await writeFile(PUBLIC_JSON, content, "utf-8");
  
  try { 
    const dataDir = dirname(DATA_JSON);
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    await writeFile(DATA_JSON, content, "utf-8"); 
  } catch (e) { 
    console.warn('[writeProducts] data/ write failed:', e);
  }
}

// İlk bulunan kaynaktan okur
async function readProducts(): Promise<string> {
  const paths = [PUBLIC_JSON, DATA_JSON];
  
  for (const p of paths) {
    try { 
      const content = await readFile(p, "utf-8");
      return content;
    } catch (e) { 
      console.log(`[readProducts] ${p} not found, trying next...`);
    }
  }
  
  console.warn('[readProducts] No products.json found, returning empty array');
  return "[]";
}

// .env'den şifre hash'ini al — birden fazla yolu dene
async function loadPassHash(): Promise<string> {
  // 1. Önce process.env'den al (pm2 ecosystem veya export ile set edilmişse)
  const fromEnv =
    process.env["ADMIN_PASS_HASH"] ??
    process.env["VITE_ADMIN_PASS_HASH"] ??
    "";
  if (fromEnv) {
    console.log("[loadPassHash] Loaded from process.env");
    return fromEnv;
  }

  // 2. .env dosyasını çeşitli lokasyonlardan bulmaya çalış
  const envCandidates = [
    resolve(ROOT, ".env"),                          // cwd/.env
    resolve(ROOT, "..", ".env"),                    // bir üst dizin
    resolve(process.execPath, "..", "..", ".env"),  // node binary yanı
  ];

  for (const envPath of envCandidates) {
    try {
      const raw = await readFile(envPath, "utf-8");
      console.log(`[loadPassHash] Found .env at: ${envPath}`);
      for (const line of raw.split("\n")) {
        const t = line.trim();
        if (t.startsWith("#")) continue;
        if (t.startsWith("ADMIN_PASS_HASH=")) {
          const val = t.slice("ADMIN_PASS_HASH=".length).trim();
          if (val) return val;
        }
        if (t.startsWith("VITE_ADMIN_PASS_HASH=")) {
          const val = t.slice("VITE_ADMIN_PASS_HASH=".length).trim();
          if (val) return val;
        }
      }
    } catch { /* devam */ }
  }

  console.error(`[loadPassHash] Could not find ADMIN_PASS_HASH. ROOT=${ROOT}, cwd=${process.cwd()}`);
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
  setResponseHeader(event, "Cache-Control", "no-cache, no-store, must-revalidate");

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

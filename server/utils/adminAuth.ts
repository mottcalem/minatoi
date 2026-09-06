import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const ROOT = resolve(process.cwd());

// .env'den şifre hash'ini al — birden fazla yolu dene
export async function loadPassHash(): Promise<string> {
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

export function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}


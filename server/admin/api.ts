import { loginAccount, revokeSession } from "./accounts.ts";
import type { Pool } from "pg";
export function createAdminAPI(db: Pick<Pool, "query">, env: NodeJS.ProcessEnv) {
  const attempts = new Map<string, { count: number; until: number }>();
  function limited(key: string, max: number) {
    const now = Date.now();
    for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
    if (attempts.size >= 10000 && !attempts.has(key)) return true;
    const entry = attempts.get(key) ?? { count: 0, until: now + 300000 };
    entry.count++;
    attempts.set(key, entry);
    return entry.count > max;
  }
  return async (request: Request) => {
    const json = (data: unknown, status = 200) =>
      Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
    if (request.method !== "POST") return json({ error: "Yöntem desteklenmiyor." }, 405);
    const origins = [
      env.PAYTR_PUBLIC_URL?.replace(/\/$/, ""),
      ...(env.CHECKOUT_ALLOWED_ORIGINS ?? "").split(",").map((v) => v.trim().replace(/\/$/, "")),
    ];
    if (env.NODE_ENV !== "production")
      origins.push("http://localhost:8080", "http://127.0.0.1:8080");
    const origin = request.headers.get("origin");
    if (!origin || !origins.includes(origin))
      return json({ error: "İstek kaynağı doğrulanamadı." }, 403);
    const ip =
      env.PAYTR_TRUST_PROXY === "1" ? (request.headers.get("x-real-ip") ?? "unknown") : "unknown";
    if (limited("ip:" + ip, 30))
      return json({ error: "Çok fazla deneme. Beş dakika sonra tekrar deneyin." }, 429);
    try {
      const reader = request.body?.getReader();
      let raw = "",
        size = 0;
      const decoder = new TextDecoder();
      if (reader)
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
          if (size > 4096) {
            await reader.cancel();
            return json({ error: "İstek çok büyük." }, 413);
          }
          raw += decoder.decode(value, { stream: true });
        }
      raw += decoder.decode();
      const input = JSON.parse(raw);
      if (!input || typeof input !== "object" || Array.isArray(input))
        return json({ error: "Geçersiz istek." }, 400);
      if (new URL(request.url).pathname === "/api/admin/logout") {
        await revokeSession(db, typeof input.token === "string" ? input.token : "");
        return json({ ok: true });
      }
      if (new URL(request.url).pathname !== "/api/admin/login")
        return json({ error: "Bulunamadı." }, 404);
      const username = typeof input.username === "string" ? input.username.trim() : "";
      const password = typeof input.password === "string" ? input.password : "";
      if (!/^[a-z0-9_]{3,64}$/.test(username) || !password || password.length > 256)
        return json({ error: "invalid_credentials" }, 401);
      if (limited("user:" + username, 15))
        return json({ error: "Çok fazla deneme. Beş dakika sonra tekrar deneyin." }, 429);
      const token = await loginAccount(db, username, password);
      if (!token) return json({ error: "invalid_credentials" }, 401);
      return json({ ok: true, token });
    } catch (error) {
      if (error instanceof SyntaxError) return json({ error: "Geçersiz istek." }, 400);
      console.error("[admin-auth] Request failed");
      return json({ error: "Giriş hizmetine ulaşılamadı. Tekrar deneyin." }, 503);
    }
  };
}

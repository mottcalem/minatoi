const SESSION_KEY = "thebulls_admin_session";
export type AuthResult =
  { ok: true } | { ok: false; error: "invalid_credentials" | "unavailable" | "rate_limited" };
/** Şifre yalnızca HTTPS üzerinden sunucuda doğrulanır; tarayıcıya hash gömülmez. */
export async function adminLogin(username: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();
    if (!response.ok)
      return {
        ok: false,
        error:
          response.status === 401
            ? "invalid_credentials"
            : response.status === 429
              ? "rate_limited"
              : "unavailable",
      };
    if (typeof result.token !== "string" || !/^[a-f0-9]{64}$/.test(result.token))
      return { ok: false, error: "unavailable" };
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ version: 2, token: result.token, createdAt: Date.now() }),
    );
    localStorage.setItem("admin_token", result.token);
    return { ok: true };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}
export function isAdminLoggedIn(): boolean {
  try {
    const { createdAt, token, version } = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? "{}");
    return (
      version === 2 &&
      typeof token === "string" &&
      /^[a-f0-9]{64}$/.test(token) &&
      Number.isFinite(createdAt) &&
      Date.now() - createdAt < 8 * 60 * 60 * 1000
    );
  } catch {
    return false;
  }
}
export function adminLogout(): void {
  const token = localStorage.getItem("admin_token");
  if (token)
    void fetch("/api/admin/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => {});
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("admin_token");
}

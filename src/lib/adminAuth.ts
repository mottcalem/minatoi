/**
 * Admin panel kimlik doğrulama — localStorage tabanlı session.
 * Kimlik bilgileri .env'den alınır (VITE_ADMIN_USER_HASH, VITE_ADMIN_PASS_HASH).
 * Giriş yapıldığında sessionStorage'a token kaydedilir; tarayıcı kapanınca sona erer.
 */

const SESSION_KEY = "thebulls_admin_session";
// .env'deki hash değerleri build zamanında bundle'a gömülür
const EXPECTED_USER_HASH = import.meta.env.VITE_ADMIN_USER_HASH ?? "";
const EXPECTED_PASS_HASH = import.meta.env.VITE_ADMIN_PASS_HASH ?? "";

/** Web Crypto API ile SHA-256 hash hesaplar */
async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Session token oluşturur — tahmin edilemez rastgele dizi */
function generateToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type AuthResult =
  | { ok: true }
  | { ok: false; error: "invalid_credentials" | "env_not_configured" };

/** Kullanıcı adı ve şifreyi doğrular, başarılıysa session kaydeder */
export async function adminLogin(username: string, password: string): Promise<AuthResult> {
  if (!EXPECTED_USER_HASH || !EXPECTED_PASS_HASH) {
    return { ok: false, error: "env_not_configured" };
  }

  const [userHash, passHash] = await Promise.all([sha256(username), sha256(password)]);

  if (userHash !== EXPECTED_USER_HASH || passHash !== EXPECTED_PASS_HASH) {
    return { ok: false, error: "invalid_credentials" };
  }

  // Başarılı — session token oluştur ve sakla
  const token = generateToken();
  // Token + oluşturma zamanı + passHash (API auth için) 8 saatlik geçerlilik
  const payload = JSON.stringify({ token, passHash, createdAt: Date.now() });
  sessionStorage.setItem(SESSION_KEY, payload);
  
  // API istekleri için passHash'i localStorage'a da kaydet
  // (saveProducts fonksiyonu localStorage'dan okuyor)
  localStorage.setItem("admin_token", passHash);
  
  return { ok: true };
}

/** Aktif ve geçerli bir session var mı? */
export function isAdminLoggedIn(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { createdAt } = JSON.parse(raw) as { token: string; createdAt: number };
    // 8 saat geçerliliği
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;
    return Date.now() - createdAt < EIGHT_HOURS;
  } catch {
    return false;
  }
}

/** Oturumu kapat */
export function adminLogout(): void {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("admin_token");
}

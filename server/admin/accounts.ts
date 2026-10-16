import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Pool } from "pg";
type DB = Pick<Pool, "query">;
const derive = promisify(scrypt);
const digest = (s: string) => createHash("sha256").update(s).digest("hex");
export const ADMIN_SCHEMA = `CREATE TABLE IF NOT EXISTS admin_users (
 username text PRIMARY KEY CHECK(username ~ '^[a-z0-9_]{3,64}$'),
 password_hash text, enabled boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
); CREATE TABLE IF NOT EXISTS admin_sessions (
 token_hash text PRIMARY KEY, username text NOT NULL REFERENCES admin_users(username) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
); CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions(expires_at);`;
export async function hashPassword(password: string) {
  if (password.length < 12 || password.length > 256)
    throw new Error("Şifre 12–256 karakter olmalı.");
  const salt = randomBytes(16).toString("hex");
  const key = (await derive(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  if (stored.startsWith("sha256:")) {
    const expected = stored.slice(7);
    return (
      /^[a-f0-9]{64}$/.test(expected) &&
      timingSafeEqual(Buffer.from(digest(password), "hex"), Buffer.from(expected, "hex"))
    );
  }
  const [scheme, salt, key] = stored.split(":");
  if (
    scheme !== "scrypt" ||
    !/^[a-f0-9]{32}$/.test(salt ?? "") ||
    !/^[a-f0-9]{128}$/.test(key ?? "")
  )
    return false;
  const actual = (await derive(password, salt, 64)) as Buffer;
  return timingSafeEqual(actual, Buffer.from(key, "hex"));
}
export async function loginAccount(db: DB, username: string, password: string) {
  const r = await db.query(
    "SELECT password_hash FROM admin_users WHERE username=$1 AND enabled=true",
    [username],
  );
  const stored = r.rows[0]?.password_hash;
  // A dummy derivation keeps unknown users from immediately returning.
  const valid = await verifyPassword(
    password,
    stored ?? `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`,
  );
  if (!stored || !valid) return null;
  const token = randomBytes(32).toString("hex");
  await db.query("DELETE FROM admin_sessions WHERE expires_at<=now()");
  await db.query(
    "INSERT INTO admin_sessions(token_hash,username,expires_at) VALUES($1,$2,now()+interval '8 hours')",
    [digest(token), username],
  );
  return token;
}
export async function validSession(db: DB, token: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  const r = await db.query(
    `SELECT 1 FROM admin_sessions s JOIN admin_users u ON u.username=s.username
    WHERE s.token_hash=$1 AND s.expires_at>now() AND u.enabled=true`,
    [digest(token)],
  );
  return Boolean(r.rowCount);
}
export async function revokeSession(db: DB, token: string) {
  if (/^[a-f0-9]{64}$/.test(token))
    await db.query("DELETE FROM admin_sessions WHERE token_hash=$1", [digest(token)]);
}

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  hashPassword,
  verifyPassword,
  loginAccount,
  validSession,
  revokeSession,
} from "./accounts.ts";
import { createAdminAPI } from "./api.ts";
test("separate salted passwords and legacy ugurdogan password verify without changing it", async () => {
  const hash = await hashPassword("a-private-fixture-password");
  assert.notEqual(hash, await hashPassword("a-private-fixture-password"));
  assert.equal(await verifyPassword("a-private-fixture-password", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
  assert.equal(
    await verifyPassword("legacy", "sha256:" + createHash("sha256").update("legacy").digest("hex")),
    true,
  );
  assert.equal(await verifyPassword("a", "broken"), false);
  await assert.rejects(hashPassword("short"));
});
function fixture() {
  const sessions = new Map(),
    users = new Map([
      [
        "ugurdogan",
        {
          enabled: true,
          password_hash: "sha256:" + createHash("sha256").update("original").digest("hex"),
        },
      ],
      ["efeadmin", { enabled: false, password_hash: null }],
    ]);
  const db = {
    query: async (sql, args = []) => {
      if (sql.startsWith("SELECT password_hash")) {
        const u = users.get(args[0]);
        return { rows: u?.enabled ? [u] : [], rowCount: u?.enabled ? 1 : 0 };
      }
      if (sql.startsWith("INSERT INTO admin_sessions")) {
        sessions.set(args[0], { username: args[1], expired: false });
        return {};
      }
      if (sql.startsWith("DELETE FROM admin_sessions WHERE token_hash")) {
        sessions.delete(args[0]);
        return {};
      }
      if (sql.startsWith("DELETE FROM admin_sessions")) return {};
      if (sql.includes("JOIN admin_users")) {
        const s = sessions.get(args[0]);
        return { rowCount: s && !s.expired && users.get(s.username)?.enabled ? 1 : 0, rows: [] };
      }
      throw Error("Unexpected query");
    },
  };
  return { db, users, sessions };
}
test("independent users issue opaque sessions; disabled users, revoked and expired tokens fail", async () => {
  const f = fixture();
  assert.equal(await loginAccount(f.db, "efeadmin", "other"), null);
  assert.equal(await loginAccount(f.db, "ugurdogan", "wrong"), null);
  const original = await loginAccount(f.db, "ugurdogan", "original");
  assert.match(original, /^[a-f0-9]{64}$/);
  assert.equal(await validSession(f.db, original), true);
  f.users.set("efeadmin", {
    enabled: true,
    password_hash: await hashPassword("new-admin-private-password"),
  });
  assert.equal(await loginAccount(f.db, "efeadmin", "original"), null);
  const token = await loginAccount(f.db, "efeadmin", "new-admin-private-password");
  assert.equal(await validSession(f.db, token), true);
  assert.notEqual(token, original);
  assert.ok(!f.sessions.has(token));
  await revokeSession(f.db, token);
  assert.equal(await validSession(f.db, token), false);
  assert.equal(await validSession(f.db, original), true);
  [...f.sessions.values()][0].expired = true;
  assert.equal(await validSession(f.db, original), false);
  assert.equal(await validSession(f.db, "bad"), false);
});
test("login endpoint rejects foreign origins, wrong credentials and throttles guessing", async () => {
  const f = fixture(),
    api = createAdminAPI(f.db, {
      NODE_ENV: "production",
      PAYTR_PUBLIC_URL: "https://minatoi.com",
      PAYTR_TRUST_PROXY: "1",
    });
  const req = (origin, username = "ugurdogan", password = "original") =>
    api(
      new Request("https://minatoi.com/api/admin/login", {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json", "x-real-ip": "203.0.113.1" },
        body: JSON.stringify({ username, password }),
      }),
    );
  assert.equal((await req("https://evil.example")).status, 403);
  assert.equal((await req("https://minatoi.com", "ugurdogan", "wrong")).status, 401);
  const success = await req("https://minatoi.com");
  assert.equal(success.status, 200);
  const data = await success.json();
  assert.equal(data.password_hash, undefined);
  assert.match(data.token, /^[a-f0-9]{64}$/);
  for (let i = 0; i < 15; i++) await req("https://minatoi.com", "no_such_user", "wrong");
  assert.equal((await req("https://minatoi.com", "no_such_user", "wrong")).status, 429);
});

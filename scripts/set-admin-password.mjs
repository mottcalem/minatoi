import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { hashPassword } from "../server/admin/accounts.ts";
import { adminPool } from "./admin-db.mjs";
const username = process.argv[2];
if (!/^[a-z0-9_]{3,64}$/.test(username ?? ""))
  throw new Error("Kullanım: node scripts/set-admin-password.mjs efeadmin");
if (!process.stdin.isTTY) throw new Error("Gizli şifre girişi için SSH -t ile terminal açın.");
const muted = new Writable({
  write(_chunk, _encoding, done) {
    done();
  },
});
const rl = createInterface({ input: process.stdin, output: muted, terminal: true });
rl.on("SIGINT", () => {
  rl.close();
  process.stdout.write("\nİptal edildi.\n");
  process.exit(130);
});
async function hidden(prompt) {
  process.stdout.write(prompt);
  return new Promise((resolve) =>
    rl.question("", (v) => {
      process.stdout.write("\n");
      resolve(v);
    }),
  );
}
try {
  const first = await hidden(`${username} için yeni şifre (en az 12 karakter, görünmez): `);
  const second = await hidden("Yeni şifreyi tekrar girin: ");
  rl.close();
  if (first !== second) throw new Error("Şifreler eşleşmiyor. Hiçbir değişiklik yapılmadı.");
  const hash = await hashPassword(first);
  const pool = await adminPool();
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const r = await c.query(
      "UPDATE admin_users SET password_hash=$2,enabled=true,updated_at=now() WHERE username=$1 RETURNING username",
      [username, hash],
    );
    if (!r.rowCount) throw new Error("Kullanıcı kaydı bulunamadı.");
    await c.query("DELETE FROM admin_sessions WHERE username=$1", [username]);
    await c.query("COMMIT");
    console.log(
      `${username} hesabı etkinleştirildi. https://minatoi.com/admin üzerinden giriş yapabilirsiniz.`,
    );
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
    await pool.end();
  }
} catch (e) {
  rl.close();
  console.error(e instanceof Error ? e.message : "İşlem tamamlanamadı.");
  process.exitCode = 1;
}

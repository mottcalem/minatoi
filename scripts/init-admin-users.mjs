import { createHash } from "node:crypto";
import { ADMIN_SCHEMA } from "../server/admin/accounts.ts";
import { adminPool } from "./admin-db.mjs";
const pool = await adminPool();
try {
  const expected = createHash("sha256").update("ugurdogan").digest("hex");
  const hash = process.env.ADMIN_PASS_HASH ?? process.env.VITE_ADMIN_PASS_HASH;
  if (process.env.VITE_ADMIN_USER_HASH !== expected || !/^[a-f0-9]{64}$/.test(hash ?? ""))
    throw new Error("Mevcut ugurdogan ayarları doğrulanamadı; işlem yapılmadı.");
  await pool.query(ADMIN_SCHEMA);
  await pool.query(
    "INSERT INTO admin_users(username,password_hash,enabled) VALUES('ugurdogan',$1,true) ON CONFLICT DO NOTHING",
    ["sha256:" + hash],
  );
  await pool.query(
    "INSERT INTO admin_users(username,enabled) VALUES('efeadmin',false) ON CONFLICT DO NOTHING",
  );
  console.log(
    "ugurdogan korundu; efeadmin kaydı hazır. efeadmin şifresini gizli terminal komutuyla belirleyin.",
  );
} finally {
  await pool.end();
}

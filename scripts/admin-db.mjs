export async function adminPool() {
  try {
    process.loadEnvFile();
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL tanımlı değil.");
  // Production deploys include a self-contained pg bundle instead of all node_modules.
  const module = await import("pg").catch(() => import("../.output/server/_libs/pg.mjs"));
  const Pool =
    module.Pool ??
    Object.values(module).find(
      (v) => typeof v === "function" && v.prototype?.connect && v.prototype?.query,
    );
  if (!Pool) throw new Error("PostgreSQL sürücüsü bulunamadı.");
  return new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
}

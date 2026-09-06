import { Pool, type PoolClient } from "pg";

try {
  process.loadEnvFile();
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

let pool: Pool | undefined;
export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL tanımlı değil.");
  return (pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  }));
}

/** minatoi_content tablosundaki anahtarlar; jsonb sütunda tüm içerikler saklanır. */
type ContentKey = "banners" | "hero" | "about";

export async function readCollection<T>(key: ContentKey): Promise<T> {
  const result = await getPool().query("SELECT content FROM minatoi_content WHERE key = $1", [key]);
  if (!result.rowCount) throw new Error("Veritabanını npm run db:init ile hazırlayın.");
  return result.rows[0].content as T;
}

export async function writeCollection(key: ContentKey, content: unknown) {
  await getPool().query(
    "INSERT INTO minatoi_content (key, content) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET content = EXCLUDED.content, updated_at = now()",
    [key, JSON.stringify(content)],
  );
}

export async function withTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

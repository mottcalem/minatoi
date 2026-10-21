import { databaseConfigured, getPool } from "./database";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { DEFAULT_CUSTOM_CONTENT, type CustomContent } from "../../src/data/customContent";
import { customContentSchema } from "../../src/data/customContentSchema";

const file = resolve(process.cwd(), "data", "custom-content.json");
// Dedicated single-row settings table: existing installations need no manual migration.
async function database() {
  const pool = getPool();
  await pool.query(`CREATE TABLE IF NOT EXISTS custom_design_content (
    id integer PRIMARY KEY CHECK (id = 1), content jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`);
  return pool;
}
export async function readCustomContent(): Promise<CustomContent> {
  if (databaseConfigured()) {
    const result = await (
      await database()
    ).query("SELECT content FROM custom_design_content WHERE id = 1");
    return result.rowCount
      ? customContentSchema.parse(result.rows[0].content)
      : DEFAULT_CUSTOM_CONTENT;
  }
  try {
    return customContentSchema.parse(JSON.parse(await readFile(file, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_CUSTOM_CONTENT;
    throw error;
  }
}
export async function writeCustomContent(content: CustomContent) {
  const validated = customContentSchema.parse(content);
  if (databaseConfigured()) {
    await (
      await database()
    ).query(
      `INSERT INTO custom_design_content (id, content) VALUES (1, $1::jsonb)
      ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = now()`,
      [JSON.stringify(validated)],
    );
    return;
  }
  await mkdir(resolve(process.cwd(), "data"), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(validated), "utf8");
  await rename(temporary, file);
}

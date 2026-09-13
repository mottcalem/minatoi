import { databaseConfigured, getPool, writeCollection } from "./database";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { DEFAULT_PROMOTIONS, promotionsSchema, type Promotions } from "../../src/data/promotions";
const file = resolve(process.cwd(), "data/promotions.json");
export async function readPromotions(): Promise<Promotions> {
  if (databaseConfigured()) {
    const result = await getPool().query("SELECT content FROM minatoi_content WHERE key = $1", [
      "promotions",
    ]);
    return result.rowCount ? promotionsSchema.parse(result.rows[0].content) : DEFAULT_PROMOTIONS;
  }
  try {
    return promotionsSchema.parse(JSON.parse(await readFile(file, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_PROMOTIONS;
    throw error;
  }
}
export async function writePromotions(content: Promotions) {
  if (databaseConfigured()) return writeCollection("promotions", content);
  await mkdir(resolve(process.cwd(), "data"), { recursive: true });
  const temp = `${file}.${randomUUID()}.tmp`;
  await writeFile(temp, JSON.stringify(content));
  await rename(temp, file);
}

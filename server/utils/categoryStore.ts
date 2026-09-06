import { databaseConfigured, withTransaction } from "./database";
import { readCategoryRows, writeCategoryRows } from "./categoryRepository";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { DEFAULT_CATEGORIES } from "../../src/data/categories";

const directory = resolve(process.cwd(), "data");
const file = resolve(directory, "categories.json");

export async function readCategories(): Promise<
  { slug: string; label: string; description: string; image?: string }[]
> {
  if (databaseConfigured()) {
    // Boş tablo, yöneticinin tüm kategorileri silmiş olmasıdır; ürün formu boş seçenek listesi gösterir.
    return withTransaction((client) => readCategoryRows(client));
  }
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_CATEGORIES;
    throw error;
  }
}

export async function writeCategories(
  categories: { slug: string; label: string; description: string; image?: string }[],
) {
  if (databaseConfigured()) {
    await withTransaction((client) => writeCategoryRows(client, categories));
    return;
  }
  await mkdir(directory, { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(categories), "utf8");
  await rename(temporary, file);
}

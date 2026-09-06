import { databaseConfigured, readCollection, writeCollection } from "./database";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { DEFAULT_ABOUT_CONTENT, type AboutContent } from "../../src/data/about";

const directory = resolve(process.cwd(), "data");
const file = resolve(directory, "about.json");

/** Kaydedilmemiş alanlar varsayılanla tamamlanır; kısmi kayıtlar kırılmaz. */
function mergeWithDefaults(stored: Partial<AboutContent>): AboutContent {
  return { ...DEFAULT_ABOUT_CONTENT, ...stored };
}

export async function readAboutContent(): Promise<AboutContent> {
  if (databaseConfigured()) {
    try {
      return mergeWithDefaults(await readCollection<Partial<AboutContent>>("about"));
    } catch {
      // Henüz kaydedilmemiş (satır yok): varsayılan içerik gösterilir.      return DEFAULT_ABOUT_CONTENT;
    }
  }
  try {
    return mergeWithDefaults(JSON.parse(await readFile(file, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_ABOUT_CONTENT;
    throw error;
  }
}

export async function writeAboutContent(content: AboutContent) {
  if (databaseConfigured()) {
    await writeCollection("about", content);
    return;
  }
  await mkdir(directory, { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(content), "utf8");
  await rename(temporary, file);
}

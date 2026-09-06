import { databaseConfigured, readCollection, writeCollection } from "./database";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { DEFAULT_HERO_CONTENT, type HeroContent } from "../../src/data/hero";

const directory = resolve(process.cwd(), "data");
const file = resolve(directory, "hero.json");

/** Kaydedilmemiş alanlar varsayılanla tamamlanır; kısmi kayıtlar kırılmaz. */
function mergeWithDefaults(stored: Partial<HeroContent>): HeroContent {
  return { ...DEFAULT_HERO_CONTENT, ...stored, stats: stored.stats ?? DEFAULT_HERO_CONTENT.stats };
}

export async function readHeroContent(): Promise<HeroContent> {
  if (databaseConfigured()) {
    try {
      return mergeWithDefaults(await readCollection<Partial<HeroContent>>("hero"));
    } catch {
      // Henüz kaydedilmemiş (satır yok): varsayılan içerik gösterilir.
      return DEFAULT_HERO_CONTENT;
    }
  }
  try {
    return mergeWithDefaults(JSON.parse(await readFile(file, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_HERO_CONTENT;
    throw error;
  }
}

export async function writeHeroContent(content: HeroContent) {
  if (databaseConfigured()) {
    await writeCollection("hero", content);
    return;
  }
  await mkdir(directory, { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(content), "utf8");
  await rename(temporary, file);
}

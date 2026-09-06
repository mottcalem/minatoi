import { databaseConfigured, readCollection, writeCollection } from "./database";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { HOME_BANNERS, type Banner } from "../../src/data/banners";

const directory = resolve(process.cwd(), "data");
const file = resolve(directory, "banners.json");

export async function readBanners(): Promise<Banner[]> {
  if (databaseConfigured()) return readCollection<Banner[]>("banners");
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return HOME_BANNERS;
    throw error;
  }
}

export async function writeBanners(banners: Banner[]) {
  if (databaseConfigured()) { await writeCollection("banners", banners); return; }
  await mkdir(directory, { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(banners), "utf8");
  await rename(temporary, file);
}

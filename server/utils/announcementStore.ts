import { databaseConfigured, withTransaction } from "./database";
import { readAnnouncementRows, writeAnnouncementRows } from "./announcementRepository";
import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { DEFAULT_ANNOUNCEMENTS } from "../../src/data/announcements";

const directory = resolve(process.cwd(), "data");
const file = resolve(directory, "announcements.json");

export async function readAnnouncements(): Promise<string[]> {
  if (databaseConfigured()) {
    // Boş tablo, yöneticinin tüm duyuruları silmiş olmasıdır; bar gizlenir.
    return withTransaction((client) => readAnnouncementRows(client));
  }
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULT_ANNOUNCEMENTS;
    throw error;
  }
}

export async function writeAnnouncements(announcements: string[]) {
  if (databaseConfigured()) {
    await withTransaction((client) => writeAnnouncementRows(client, announcements));
    return;
  }
  await mkdir(directory, { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(announcements), "utf8");
  await rename(temporary, file);
}

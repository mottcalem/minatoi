import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/** public/ veya build çıktısındaki .output/public/ dosyasını okur. */
export async function readPublicText(filename: string, fallback: string): Promise<string> {
  const candidates = [
    resolve(process.cwd(), "public", filename),
    resolve(process.cwd(), ".output/public", filename),
  ];
  for (const path of candidates) {
    try {
      return await readFile(path, "utf-8");
    } catch {
      // sonraki yolu dene
    }
  }
  return fallback;
}

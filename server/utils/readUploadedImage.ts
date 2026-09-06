import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/**
 * Yönetim panelinden yüklenen görselleri diskten okur.
 * Hem public/images/uploads/ hem .output/public/images/uploads/ aranır;
 * üretimde Nitro statik manifestine sonradan eklenmeyen dosyalar bu
 * okuyucu üzerinden servis edilir. Yol mutlaka /images/uploads/ altında
 * ve güvenli karakterlerden oluşmalıdır.
 */
export async function readUploadedImage(
  urlPath: string,
): Promise<{ body: Buffer; contentType: string } | null> {
  // /images/uploads/{products|categories}/{klasör}/{dosya} — sadece güvenli karakterler.
  const match =
    /^\/images\/uploads\/(products|categories)\/([a-z0-9-]+)\/([a-z0-9-]+\.(?:png|jpg|jpeg|webp))$/.exec(
      urlPath,
    );
  if (!match) return null;
  const [, group, folder, filename] = match;
  const extension = filename.split(".").pop()!.toLowerCase();
  const candidates = [
    resolve(process.cwd(), "public", "images", "uploads", group, folder, filename),
    resolve(process.cwd(), ".output", "public", "images", "uploads", group, folder, filename),
  ];
  for (const path of candidates) {
    try {
      return { body: await readFile(path), contentType: MIME[extension] };
    } catch {
      // sonraki yolu dene
    }
  }
  return null;
}

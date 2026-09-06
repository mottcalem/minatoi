import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Türkçe karakterleri sadeleştirip dosya/klasör adına uygun hale getirir. */
function toSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "urun"
  );
}

/** Tek veri URL'sini çözümler; imza eşleşmezse hata fırlatır. */
function decodeImage(dataUrl: string): { buffer: Buffer; extension: string } {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("Desteklenmeyen görsel türü. PNG, JPG veya WebP seçin.");
  return { buffer: Buffer.from(match[2], "base64"), extension: ALLOWED[match[1]] };
}

async function requireAdmin(token: string) {
  const { loadPassHash, safeEqual } = await import("../../server/utils/adminAuth");
  if (!safeEqual(token, await loadPassHash())) {
    throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
  }
}

/**
 * Ürün görseli yükleme. Dosyalar public/images/uploads/products/<slug>/ altına kaydedilir
 * ve dönen URL'ler ürün galerisine yazılır. PNG, JPEG ve WebP; dosya başına 5 MB.
 */
const productUploadSchema = z.object({
  token: z.string().max(256),
  slug: z.string().max(120),
  files: z
    .array(
      z.object({
        name: z
          .string()
          .max(200)
          .refine(
            (value) => !value.includes("/") && !value.includes("\\") && !value.includes(".."),
            "Geçersiz dosya adı.",
          ),
        /** Yüklenen görseller yalnızca bu tek istek süresince veri URL'si olarak taşınır. */
        dataUrl: z
          .string()
          .max(7_000_000)
          .refine(
            (value) => /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value),
            "Geçersiz görsel. PNG, JPG veya WebP seçin.",
          ),
      }),
    )
    .min(1)
    .max(10),
});

export const uploadProductImages = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => productUploadSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);

    const slug = toSlug(data.slug);
    const directory = resolve(process.cwd(), "public", "images", "uploads", "products", slug);
    await mkdir(directory, { recursive: true });

    const urls: string[] = [];
    for (const file of data.files) {
      const { buffer, extension } = decodeImage(file.dataUrl);
      const base = toSlug(file.name.replace(/\.[^.]+$/, "")).slice(0, 60);
      const filename = `${base}-${randomUUID().slice(0, 8)}.${extension}`;
      await writeFile(join(directory, filename), buffer);
      urls.push(`/images/uploads/products/${slug}/${filename}`);
    }
    return { ok: true, urls };
  });

/**
 * Kategori görseli yükleme. Dosyalar public/images/uploads/categories/<slug>/ altına
 * kaydedilir; dönen URL categories.image kolonuna yazılır ve /images/uploads/...
 * sunucu route'u ile diskten servis edilir.
 */
const categoryUploadSchema = z.object({
  token: z.string().max(256),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Kategori adresi geçersiz."),
  /** Tek görsel: mevcut kategori kartını değiştirir. */
  dataUrl: z
    .string()
    .max(7_000_000)
    .refine(
      (value) => /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value),
      "Geçersiz görsel. PNG, JPG veya WebP seçin.",
    ),
});

export const uploadCategoryImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => categoryUploadSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);

    const directory = resolve(
      process.cwd(),
      "public",
      "images",
      "uploads",
      "categories",
      data.slug,
    );
    await mkdir(directory, { recursive: true });

    const { buffer, extension } = decodeImage(data.dataUrl);
    const filename = `kapak-${randomUUID().slice(0, 8)}.${extension}`;
    await writeFile(join(directory, filename), buffer);
    return { ok: true, url: `/images/uploads/categories/${data.slug}/${filename}` };
  });

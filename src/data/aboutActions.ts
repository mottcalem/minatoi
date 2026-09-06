import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sanitizeRichText } from "../../server/utils/sanitizeHtml";

const contentSchema = z.object({
  eyebrow: z.string().trim().max(60),
  title: z.string().trim().min(1, "Başlık boş olamaz.").max(120),
  /** Sunucuya yüklenmiş görselin public yolu; boşsa varsayılan görsel kullanılır. */
  imageUrl: z
    .string()
    .regex(/^\/images\/uploads\/about\/[a-z0-9-]+\.(png|jpg|webp)$/, "Bölüm görseli geçersiz.")
    .or(z.literal("")),
  videoUrl: z
    .string()
    .regex(/^\/images\/uploads\/about\/[a-z0-9-]+\.mp4$/, "Bölüm videosu geçersiz.")
    .or(z.literal("")),
  imageAlt: z.string().trim().max(200),
  /** Zengin metin HTML; kayıt anında sunucuda temizlenir. */
  bodyHtml: z.string().max(20_000),
  ctaLabel: z.string().trim().max(60),
  ctaHref: z
    .string()
    .trim()
    .max(300)
    .refine(
      (value) => value === "" || value.startsWith("/") || /^https?:\/\//.test(value),
      "Buton hedefi dahili yol (/…) veya http(s) bağlantısı olmalı.",
    ),
});

export type AboutContentInput = z.infer<typeof contentSchema>;

const saveSchema = z.object({
  token: z.string().max(256),
  content: contentSchema,
});

export const getAboutContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<AboutContentInput> => {
    const { readAboutContent } = await import("../../server/utils/aboutStore");
    return readAboutContent();
  },
);

export const saveAboutContent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data }) => {
    const { loadPassHash, safeEqual } = await import("../../server/utils/adminAuth");
    if (!safeEqual(data.token, await loadPassHash())) {
      throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
    }
    const { writeAboutContent } = await import("../../server/utils/aboutStore");
    await writeAboutContent({ ...data.content, bodyHtml: sanitizeRichText(data.content.bodyHtml) });
    return { ok: true };
  });

/**
 * Bölüm görseli veya MP4 videosu yükleme. Dosya public/images/uploads/about/ altına kaydedilir;
 * dönen URL content.imageUrl alanına yazılır ve /images/uploads/... sunucu
 * route'u ile diskten servis edilir.
 */
const uploadSchema = z.object({
  token: z.string().max(256),
  dataUrl: z
    .string()
    .max(70_000_000)
    .refine(
      (value) => /^data:(image\/(png|jpeg|webp)|video\/mp4);base64,[A-Za-z0-9+/]+=*$/.test(value),
      "Geçersiz dosya. PNG, JPG, WebP veya MP4 seçin.",
    ),
});

export const uploadAboutImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => uploadSchema.parse(data))
  .handler(async ({ data }) => {
    const { loadPassHash, safeEqual } = await import("../../server/utils/adminAuth");
    if (!safeEqual(data.token, await loadPassHash())) {
      throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
    }
    const { writeFile, mkdir } = await import("node:fs/promises");
    const { resolve, join } = await import("node:path");
    const { randomUUID } = await import("node:crypto");

    const match = /^data:(image\/(?:png|jpeg|webp)|video\/mp4);base64,(.*)$/.exec(data.dataUrl);
    if (!match) throw new Error("Desteklenmeyen dosya türü. PNG, JPG, WebP veya MP4 seçin.");
    const extension =
      match[1] === "video/mp4" ? "mp4" : match[1].split("/")[1].replace("jpeg", "jpg");
    const buffer = Buffer.from(match[2], "base64");

    const directory = resolve(process.cwd(), "public", "images", "uploads", "about");
    await mkdir(directory, { recursive: true });
    const filename = `kapak-${randomUUID().slice(0, 8)}.${extension}`;
    await writeFile(join(directory, filename), buffer);
    return { ok: true, url: `/images/uploads/about/${filename}` };
  });

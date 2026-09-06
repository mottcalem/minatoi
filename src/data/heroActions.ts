import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const statSchema = z.object({
  label: z.string().trim().max(60),
  value: z.string().trim().max(60),
});

const contentSchema = z.object({
  badge: z.string().trim().max(80),
  titleTop: z.string().trim().min(1, "Başlık boş olamaz.").max(80),
  titleHighlight: z.string().trim().max(80),
  titleBottom: z.string().trim().max(80),
  description: z.string().trim().max(500),
  ctaPrimaryLabel: z.string().trim().min(1, "Buton etiketi boş olamaz.").max(60),
  ctaPrimaryHref: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\//.test(value),
      "Buton hedefi dahili yol (/…) veya http(s) bağlantısı olmalı.",
    ),
  ctaSecondaryLabel: z.string().trim().min(1, "Buton etiketi boş olamaz.").max(60),
  stats: z.array(statSchema).max(4, "En fazla 4 bilgi maddesi eklenebilir."),
});

export type HeroContentInput = z.infer<typeof contentSchema>;

const saveSchema = z.object({
  token: z.string().max(256),
  content: contentSchema,
});

export const getHeroContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<HeroContentInput> => {
    const { readHeroContent } = await import("../../server/utils/heroStore");
    return readHeroContent();
  },
);

export const saveHeroContent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data }) => {
    const { loadPassHash, safeEqual } = await import("../../server/utils/adminAuth");
    if (!safeEqual(data.token, await loadPassHash())) {
      throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
    }
    const { writeHeroContent } = await import("../../server/utils/heroStore");
    await writeHeroContent(data.content);
    return { ok: true };
  });

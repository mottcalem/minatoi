import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CategoryRecord } from "./categories";

export type { CategoryRecord };

const categorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Kategori adresi geçersiz."),
  label: z.string().trim().min(1).max(100),
  description: z.string().max(300).default(""),
  /** Sunucuya yüklenmiş görselin public yolu; yoksa varsayılan karusel görseli kullanılır. */
  image: z
    .string()
    .regex(
      /^\/images\/uploads\/categories\/[a-z0-9-]+\/[a-z0-9-]+\.(png|jpg|webp)$/,
      "Kategori görseli geçersiz.",
    )
    .optional(),
});

const saveSchema = z.object({
  token: z.string().max(256),
  categories: z
    .array(categorySchema)
    .max(30)
    .refine(
      (items) => new Set(items.map((item) => item.slug)).size === items.length,
      "Kategori adresleri tekrar edemez.",
    ),
});

export const getCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<CategoryRecord[]> => {
    const { readCategories } = await import("../../server/utils/categoryStore");
    return readCategories();
  },
);

export const saveCategories = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data }) => {
    const { loadPassHash, safeEqual } = await import("../../server/utils/adminAuth");
    if (!safeEqual(data.token, await loadPassHash())) {
      throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
    }
    const { writeCategories } = await import("../../server/utils/categoryStore");
    await writeCategories(data.categories);
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const saveSchema = z.object({
  token: z.string().max(256),
  announcements: z
    .array(z.string().trim().min(1).max(200))
    .max(20)
    .refine(
      (items) => new Set(items).size === items.length,
      "Aynı duyuru metni iki kez eklenemez.",
    ),
});

export const getAnnouncements = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const { readAnnouncements } = await import("../../server/utils/announcementStore");
    return readAnnouncements();
  },
);

export const saveAnnouncements = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data }) => {
    const { loadPassHash, safeEqual } = await import("../../server/utils/adminAuth");
    if (!safeEqual(data.token, await loadPassHash())) {
      throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
    }
    const { writeAnnouncements } = await import("../../server/utils/announcementStore");
    await writeAnnouncements(data.announcements);
    return { ok: true };
  });

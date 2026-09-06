import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const bannerSchema = z.object({
  id: z.string().min(1).max(100),
  image: z.string().max(7_000_000).refine(
    (value) => /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value)
      || value === "/images/banners/banner-minatoi.png",
    "Geçersiz görsel",
  ),
  alt: z.string().trim().min(1).max(500),
  width: z.number().int().positive().max(20000),
  height: z.number().int().positive().max(20000),
});

export const getBanners = createServerFn({ method: "GET" }).handler(async () => {
  const { readBanners } = await import("../../server/utils/bannerStore");
  return readBanners();
});

export const saveBanners = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({
    token: z.string().max(256),
    banners: z.array(bannerSchema).max(10).refine(
      (banners) => new Set(banners.map((banner) => banner.id)).size === banners.length,
      "Banner kimlikleri benzersiz olmalı",
    ),
  }).parse(data))
  .handler(async ({ data }) => {
    const { loadPassHash, safeEqual } = await import("../../server/utils/adminAuth");
    if (!safeEqual(data.token, await loadPassHash())) {
      throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
    }
    const { writeBanners } = await import("../../server/utils/bannerStore");
    await writeBanners(data.banners);
    return { ok: true };
  });

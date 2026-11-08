import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { productGallerySchema } from "./productGallerySchema";

export const getProductGallerySettings = createServerFn({ method: "GET" }).handler(async () => {
  const { readProductGallery } = await import("../../server/utils/productGalleryStore");
  return readProductGallery();
});

export const saveProductGallerySettings = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token: z.string().max(256), settings: productGallerySchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { isAdminToken } = await import("../../server/utils/adminAuth");
    if (!(await isAdminToken(data.token)))
      throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
    const { writeProductGallery } = await import("../../server/utils/productGalleryStore");
    await writeProductGallery(data.settings);
    return { ok: true };
  });

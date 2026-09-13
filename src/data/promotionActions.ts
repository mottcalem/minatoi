import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { promotionsSchema } from "./promotions";
async function authorize(token: string) {
  const { loadPassHash, safeEqual } = await import("../../server/utils/adminAuth");
  if (!safeEqual(token, await loadPassHash())) throw new Error("Oturum doğrulanamadı.");
}
export const getPublicPromotions = createServerFn({ method: "GET" }).handler(async () => {
  const { readPromotions } = await import("../../server/utils/promotionStore");
  const { codes: _codes, ...settings } = await readPromotions();
  return settings;
});
export const getAdminPromotions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token: z.string().max(256) }).parse(data))
  .handler(async ({ data }) => {
    await authorize(data.token);
    const { readPromotions } = await import("../../server/utils/promotionStore");
    return readPromotions();
  });
export const savePromotions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token: z.string().max(256), content: promotionsSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    await authorize(data.token);
    const { writePromotions } = await import("../../server/utils/promotionStore");
    await writePromotions(data.content);
    return { ok: true };
  });

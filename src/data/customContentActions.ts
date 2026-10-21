import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { customContentSchema } from "./customContentSchema";
export const getCustomContent = createServerFn({ method: "GET" }).handler(async () => {
  const { readCustomContent } = await import("../../server/utils/customContentStore");
  return readCustomContent();
});
export const saveCustomContent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token: z.string().max(256), content: customContentSchema }).parse(data),
  )
  .handler(async ({ data }) => {
    const { isAdminToken } = await import("../../server/utils/adminAuth");
    if (!(await isAdminToken(data.token)))
      throw new Error("Oturum doğrulanamadı. Tekrar giriş yapın.");
    const { writeCustomContent } = await import("../../server/utils/customContentStore");
    await writeCustomContent(data.content);
    return { ok: true };
  });

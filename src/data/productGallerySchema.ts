import { z } from "zod";

export const productGallerySchema = z.object({
  image: z
    .string()
    .trim()
    .max(1000)
    .refine(
      (value) =>
        value === "" ||
        (value.startsWith("/images/") && !value.includes("..")) ||
        /^https?:\/\//.test(value),
      "Geçerli bir görsel adresi girin.",
    ),
});

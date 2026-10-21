import { z } from "zod";
const image = z
  .string()
  .max(1000)
  .refine(
    (value) =>
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("\\") &&
      [...value].every((character) => character.charCodeAt(0) >= 32),
    "Geçerli bir site görseli seçin.",
  );
const sections = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    personalPrint: schema,
    personalIllustration: schema,
    petCostume: schema,
    petIllustration: schema,
  });
const styles = z
  .array(z.string().trim().min(1).max(80))
  .min(1)
  .max(30)
  .refine((items) => new Set(items).size === items.length, "Tarzlar tekrar edemez.");
export const customContentSchema = z.object({
  covers: sections(image),
  styles,
  petStyles: styles,
  examples: sections(
    z.array(z.object({ label: z.string().trim().min(1).max(100), image })).max(200),
  ),
});

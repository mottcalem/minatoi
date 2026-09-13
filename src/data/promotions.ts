import { z } from "zod";
export const promotionsSchema = z.object({
  showOldPrices: z.boolean(),
  secondProductEnabled: z.boolean(),
  secondProductPercent: z.number().int().min(1).max(99),
  codes: z
    .array(
      z.object({
        code: z
          .string()
          .trim()
          .toUpperCase()
          .min(2)
          .max(40)
          .regex(/^[A-Z0-9_-]+$/),
        percent: z.number().int().min(1).max(99),
        active: z.boolean(),
      }),
    )
    .max(100)
    .refine(
      (rows) => new Set(rows.map((r) => r.code)).size === rows.length,
      "Kodlar benzersiz olmalı.",
    ),
});
export type Promotions = z.infer<typeof promotionsSchema>;
export const DEFAULT_PROMOTIONS: Promotions = {
  showOldPrices: false,
  secondProductEnabled: false,
  secondProductPercent: 25,
  codes: [],
};

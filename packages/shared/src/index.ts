import { z } from "zod";

export const nicheTypeSchema = z.enum([
  "hamburgueria",
  "hotel",
  "pet_shop",
  "agro_parts",
  "services"
]);

export type NicheType = z.infer<typeof nicheTypeSchema>;

export const chatRequestSchema = z.object({
  message: z.string().min(1),
  session_id: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

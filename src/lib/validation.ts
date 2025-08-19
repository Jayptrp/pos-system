// lib/validation.ts
import { z } from "zod";

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
});

// Infer the TS type for type-safety
export type CategoryInput = z.infer<typeof categorySchema>;

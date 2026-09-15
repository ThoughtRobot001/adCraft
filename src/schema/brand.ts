import { z } from "zod";

export const BrandColorSchema = z.object({
  primary: z.string().default("#6366F1"),
  secondary: z.string().default("#4F46E5"),
  accent: z.string().default("#10B981"),
  background: z.string().default("#0B0F19"),
  text: z.string().default("#F9FAFB"),
  muted: z.string().default("#9CA3AF"),
});

export const BrandSchema = z.object({
  name: z.string(),
  tagline: z.string().optional(),
  logo: z.string().optional(),
  colors: BrandColorSchema.default({}),
  font: z.string().default("Inter, system-ui, sans-serif"),
  serifFont: z.string().optional().default("'Newsreader', 'Playfair Display', Georgia, serif"),
  theme: z.enum(["dark-saas", "editorial-light", "consumer-vibrant"]).optional().default("dark-saas"),
});

export type Brand = z.infer<typeof BrandSchema>;
export type BrandColors = z.infer<typeof BrandColorSchema>;


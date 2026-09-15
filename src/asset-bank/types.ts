import { z } from "zod";

export const AssetCategorySchema = z.enum([
  "background",
  "card",
  "device",
  "button",
  "atmosphere",
  "typography",
  "cursor",
  "shader",
]);

export type AssetCategory = z.infer<typeof AssetCategorySchema>;

export const AssetMediaTypeSchema = z.enum([
  "code",
  "video",
  "image",
  "shader",
  "svg",
]);

export type AssetMediaType = z.infer<typeof AssetMediaTypeSchema>;

export const AssetMetadataSchema = z.object({
  id: z.string(),
  category: AssetCategorySchema,
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()).default([]),
  brandFit: z.array(z.string()).default([]),
  mediaType: AssetMediaTypeSchema.optional(),
  src: z.string().optional(),
  blendMode: z.enum([
    "normal",
    "screen",
    "overlay",
    "soft-light",
    "multiply",
    "color-dodge",
    "luminosity",
  ]).optional(),
  playbackRate: z.number().optional(),
  posterFrame: z.string().optional(),
  properties: z.record(z.any()).default({}),
  usageNotes: z.string().optional(),
});

export type AssetMetadata = z.infer<typeof AssetMetadataSchema>;

export const VisualKitSchema = z.object({
  id: z.string(),
  name: z.string(),
  tone: z.string(),
  description: z.string().optional(),
  backgroundAssetId: z.string(),
  cardStyleAssetId: z.string(),
  deviceAssetId: z.string(),
  buttonStyleAssetId: z.string(),
  atmosphereAssetId: z.string(),
  shaderAssetId: z.string().optional(),
});

export type VisualKit = z.infer<typeof VisualKitSchema>;

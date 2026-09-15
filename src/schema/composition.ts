import { z } from "zod";
import { BrandSchema } from "./brand";
import { SceneSchema } from "./scene";

export const CompositionMetaSchema = z.object({
  title: z.string().default("Motion Ad"),
  fps: z.number().default(30),
  width: z.number().default(1920),
  height: z.number().default(1080),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]).optional().default("16:9"),
});

export const SFXTrackSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["whoosh", "click", "pop", "impact", "riser", "chime", "tension-drone", "switch", "custom"]).optional().default("whoosh"),
  src: z.string().optional(),
  atFrame: z.number().default(0),
  volume: z.number().min(0).max(1).default(0.7),
  trimBefore: z.number().optional(),
});

export const AudioTrackSchema = z.object({
  src: z.string().optional(),
  volume: z.number().min(0).max(1).default(0.8),
  loop: z.boolean().default(true),
  fadeInFrames: z.number().default(15),
  fadeOutFrames: z.number().default(20),
  sfx: z.array(SFXTrackSchema).optional().default([]),
});

import { VisualKitSchema } from "../asset-bank/types";

export const MotionIRSchema = z.object({
  id: z.string(),
  meta: CompositionMetaSchema.default({}),
  brand: BrandSchema,
  visualKit: VisualKitSchema.optional(),
  audio: AudioTrackSchema.optional(),
  scenes: z.array(SceneSchema),
});

export type MotionIR = z.infer<typeof MotionIRSchema>;
export type CompositionMeta = z.infer<typeof CompositionMetaSchema>;
export type AudioTrack = z.infer<typeof AudioTrackSchema>;
export type SFXTrack = z.infer<typeof SFXTrackSchema>;


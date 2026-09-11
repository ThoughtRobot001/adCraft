import { z } from "zod";
import { ElementSchema } from "./primitives";

export const SceneBackgroundSchema = z.object({
  type: z.enum(["solid", "gradient", "mesh"]).optional().default("gradient"),
  color: z.string().optional().default("brand.background"),
  gradientTo: z.string().optional(),
  angle: z.number().optional().default(135),
  glowOrb: z.boolean().optional().default(true).describe("Subtle floating ambient glow orb in brand accent/primary color"),
});

export const SceneTransitionSchema = z.object({
  type: z.enum(["none", "fade", "slide-left", "slide-right", "slide-up", "zoom-out", "wipe", "zoom-blur", "crossfade"]).optional().default("fade"),
  presentation: z.enum(["fade", "slide", "wipe", "flip", "clock-wipe", "none"]).optional().default("fade"),
  direction: z.enum(["from-left", "from-right", "from-top", "from-bottom"]).optional().default("from-right"),
  durationFrames: z.number().optional().default(15),
});

export const SceneSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  durationFrames: z.number().describe("Duration in frames (e.g. 90 frames = 3 seconds at 30fps)"),
  background: SceneBackgroundSchema.default({}),
  elements: z.array(ElementSchema).default([]),
  transition: SceneTransitionSchema.default({}),
});

export type Scene = z.infer<typeof SceneSchema>;
export type SceneBackground = z.infer<typeof SceneBackgroundSchema>;
export type SceneTransition = z.infer<typeof SceneTransitionSchema>;

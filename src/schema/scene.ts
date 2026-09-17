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
  type: z.enum(["none", "fade", "slide-left", "slide-right", "slide-up", "zoom-out", "wipe", "zoom-blur", "crossfade"]).optional().default("none"),
  presentation: z.enum(["fade", "slide", "wipe", "flip", "clock-wipe", "none"]).optional().default("none"),
  direction: z.enum(["from-left", "from-right", "from-top", "from-bottom"]).optional().default("from-right"),
  durationFrames: z.number().optional().default(18),
});

export const SceneCameraSchema = z.object({
  shot: z.enum(["push-in", "pull-back", "orbit", "vertical-rise", "drift", "fly-through"]).default("push-in"),
  intensity: z.enum(["subtle", "medium", "aggressive"]).default("medium"),
  ease: z.enum(["cinematic", "elastic-settle", "snappy"]).default("cinematic"),
});

export const SceneAtmosphereSchema = z.object({
  grain: z.number().min(0).max(1).default(0.12),
  vignette: z.number().min(0).max(1).default(0.28),
  haze: z.number().min(0).max(1).default(0.1),
});

export const SceneTransformationCallSchema = z.object({
  isExplicitTransformation: z.boolean(),
  allowedDepartures: z.array(z.enum(["lighting", "materials", "typography", "palette", "density", "camera"])),
  fromState: z.string().optional(),
  toState: z.string().optional(),
  narrativeJustification: z.string(),
});

export const SceneSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  durationFrames: z.number().describe("Duration in frames (e.g. 90 frames = 3 seconds at 30fps)"),
  background: SceneBackgroundSchema.default({}),
  elements: z.array(ElementSchema).default([]),
  transition: SceneTransitionSchema.default({}),
  camera: SceneCameraSchema.default({}),
  atmosphere: SceneAtmosphereSchema.default({}),
  heroElementId: z.string().optional(),
  backgroundAssetId: z.string().optional(),
  atmosphereAssetId: z.string().optional(),
  visualKitId: z.string().optional(),
  layoutStrategy: z.enum(["hero-centered", "split-depth", "stacked-cards", "minimal-focus"]).optional().default("hero-centered"),
  usedMemoryItemIds: z.array(z.string()).optional().default([]),
  transformationCall: SceneTransformationCallSchema.optional(),
});

export type Scene = z.infer<typeof SceneSchema>;
export type SceneBackground = z.infer<typeof SceneBackgroundSchema>;
export type SceneTransition = z.infer<typeof SceneTransitionSchema>;
export type SceneCamera = z.infer<typeof SceneCameraSchema>;
export type SceneAtmosphere = z.infer<typeof SceneAtmosphereSchema>;
export type SceneTransformationCall = z.infer<typeof SceneTransformationCallSchema>;


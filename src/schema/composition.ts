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

export const VisualBibleProductIdentitySchema = z.object({
  name: z.string(),
  category: z.string(),
  formFactor: z.enum([
    "desktop-browser",
    "mobile-device",
    "hardware-console",
    "bento-dashboard",
    "fintech-card",
    "abstract-metric",
  ]),
  signatureElement: z.string(),
  monogramOrLogo: z.object({
    symbol: z.string(),
    placement: z.enum(["top-left", "top-center", "center-watermark"]),
    treatment: z.enum(["glow-bloom", "minimal-monochrome", "embossed-metallic"]),
  }),
  keyDifferentiatorVisual: z.string(),
});

export const VisualBibleVisualLanguageSchema = z.object({
  theme: z.enum(["dark-saas", "editorial-light", "cyber-terminal", "industrial-monolith", "consumer-vibrant"]),
  aestheticPhilosophy: z.string(),
  colorTokens: z.object({
    backgroundBase: z.string(),
    surfaceElevated: z.string(),
    surfaceOverlay: z.string(),
    borderSubtle: z.string(),
    primaryBrand: z.string(),
    secondaryBrand: z.string(),
    accentHighlight: z.string(),
    textPrimary: z.string(),
    textMuted: z.string(),
  }),
  negativeSpaceBaseline: z.number().min(0).max(1).default(0.5),
  cornerRadii: z.object({
    container: z.number().default(24),
    card: z.number().default(16),
    pill: z.number().default(9999),
  }),
});

export const VisualBibleMaterialsSchema = z.object({
  surfaceType: z.enum(["glassmorphism", "matte-ceramic", "anodized-aluminum", "tactile-paper", "glossy-acrylic"]),
  backdropBlur: z.number().default(20),
  borderSheen: z.enum(["specular-metallic", "subtle-hairline", "neon-glow", "none"]).default("specular-metallic"),
  roughness: z.number().default(0.2),
  transmissionOpacity: z.number().default(0.85),
  shadowTokens: z.object({
    elevation: z.string().default("0 25px 50px -12px rgba(0, 0, 0, 0.6)"),
    ambientGlow: z.string().default("0 0 30px rgba(139, 92, 246, 0.15)"),
  }),
});

export const VisualBibleLightingLogicSchema = z.object({
  keyLightVector: z.object({
    angleDeg: z.number().default(145),
    elevationDeg: z.number().default(60),
  }),
  keyIntensity: z.number().min(0).max(1).default(0.8),
  ambientFillOpacity: z.number().min(0).max(1).default(0.25),
  atmosphericGlowOrb: z.object({
    enabled: z.boolean().default(true),
    color: z.string().default("#8B5CF6"),
    radiusPercent: z.number().default(65),
    blurPx: z.number().default(120),
  }),
  shadowFalloff: z.enum(["crisp-contact", "diffuse-soft", "cinematic-volumetric"]).default("diffuse-soft"),
});

export const VisualBibleTypographySystemSchema = z.object({
  headlineFont: z.string().default("Inter, -apple-system, sans-serif"),
  bodyFont: z.string().default("Inter, -apple-system, sans-serif"),
  monoFont: z.string().default("JetBrains Mono, monospace"),
  headlineTracking: z.string().default("-0.03em"),
  headlineLineHeight: z.number().default(1.08),
  capitalization: z.enum(["none", "uppercase", "title-case"]).default("none"),
  scaleRatios: z.object({
    heroDisplay: z.number().default(72),
    sectionHeadline: z.number().default(48),
    bodySubtext: z.number().default(24),
    badgeLabel: z.number().default(13),
  }),
  weightHierarchy: z.object({
    hero: z.union([z.literal(700), z.literal(800), z.literal(900)]).default(800),
    subtext: z.union([z.literal(400), z.literal(500), z.literal(600)]).default(500),
    badge: z.union([z.literal(600), z.literal(700)]).default(700),
  }),
});

export const VisualBibleCameraLanguageSchema = z.object({
  baseFieldOfView: z.number().default(50),
  primaryShotPhilosophy: z.enum(["controlled-push-in", "subtle-drift", "orbital-pivot", "locked-monumental"]).default("controlled-push-in"),
  tiltConstraints: z.object({
    maxTiltX: z.number().default(12),
    maxTiltY: z.number().default(8),
  }),
  virtualDistance: z.enum(["macro-tight", "medium-balanced", "wide-architectural"]).default("medium-balanced"),
  cameraMotionCurve: z.enum(["cinematic-smooth", "snappy-tech", "elastic-settle"]).default("cinematic-smooth"),
});

export const VisualBibleRecurringSubjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["primary-product-hero", "brand-monogram", "interaction-pointer", "verification-badge"]),
  primitiveType: z.enum(["app-window", "phone-mockup", "cursor-interaction", "feature-pills", "metric-counter", "logo-reveal"]),
  lockedProps: z.record(z.any()).default({}),
  consistencyRules: z.array(z.string()).default([]),
});

export const VisualBibleSchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  brandName: z.string(),
  createdAt: z.number(),
  version: z.number().default(1),
  productIdentity: VisualBibleProductIdentitySchema,
  visualLanguage: VisualBibleVisualLanguageSchema,
  materials: VisualBibleMaterialsSchema,
  lightingLogic: VisualBibleLightingLogicSchema,
  typographySystem: VisualBibleTypographySystemSchema,
  cameraLanguage: VisualBibleCameraLanguageSchema,
  recurringSubjects: z.array(VisualBibleRecurringSubjectSchema).default([]),
  transformationExceptions: z.object({
    allowedSceneIndices: z.array(z.number()).default([]),
    rules: z.array(z.string()).default([]),
  }).default({ allowedSceneIndices: [], rules: [] }),
});

export const MotionIRSchema = z.object({
  id: z.string(),
  meta: CompositionMetaSchema.default({}),
  brand: BrandSchema,
  visualBible: VisualBibleSchema.optional(),
  visualKit: VisualKitSchema.optional(),
  audio: AudioTrackSchema.optional(),
  scenes: z.array(SceneSchema),
});

export type VisualBible = z.infer<typeof VisualBibleSchema>;
export type MotionIR = z.infer<typeof MotionIRSchema>;
export type CompositionMeta = z.infer<typeof CompositionMetaSchema>;
export type AudioTrack = z.infer<typeof AudioTrackSchema>;
export type SFXTrack = z.infer<typeof SFXTrackSchema>;


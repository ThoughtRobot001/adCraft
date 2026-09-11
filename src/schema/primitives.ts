import { z } from "zod";

export const PositionSchema = z.object({
  x: z.number().describe("Horizontal percentage (0 to 100)"),
  y: z.number().describe("Vertical percentage (0 to 100)"),
});

export const KineticTextPropsSchema = z.object({
  text: z.string(),
  fontSize: z.number().default(48),
  fontWeight: z.union([
    z.literal(400),
    z.literal(500),
    z.literal(600),
    z.literal(700),
    z.literal(800),
    z.literal(900),
  ]).default(700),
  color: z.string().default("brand.text"),
  position: PositionSchema.default({ x: 50, y: 50 }),
  align: z.enum(["left", "center", "right"]).default("center"),
  animation: z.enum([
    "fade-up",
    "word-by-word",
    "scale-in",
    "reveal-left",
    "glow-punch",
  ]).default("fade-up"),
  delay: z.number().default(0).describe("Delay in frames before animating in"),
  maxWidth: z.number().optional().describe("Max width in percentage (0-100)"),
  highlightWords: z.array(z.string()).optional().describe("Words to highlight with brand.primary color"),
  letterSpacing: z.string().optional(),
});

export const AppWindowBadgeSchema = z.object({
  text: z.string(),
  icon: z.string().optional(),
  color: z.string().optional().default("brand.primary"),
  position: z.enum(["top-left", "top-right", "bottom-left", "bottom-right"]).default("top-right"),
});

export const AppWindowPropsSchema = z.object({
  title: z.string().optional().default("Dashboard"),
  url: z.string().optional().default("app.kylian.io/overview"),
  screenshotUrl: z.string().optional().describe("Image URL or local path"),
  mockType: z.enum(["analytics", "kanban", "chat", "code", "custom"]).optional().default("analytics"),
  width: z.number().optional().default(85).describe("Percentage of composition width"),
  position: PositionSchema.optional().default({ x: 50, y: 55 }),
  tilt: z.boolean().optional().default(true).describe("Apply dynamic 3D perspective tilt"),
  shadow: z.boolean().optional().default(true),
  delay: z.number().optional().default(0),
  animation: z.enum(["float-up", "slide-in-right", "zoom-focus"]).optional().default("float-up"),
  badges: z.array(AppWindowBadgeSchema).optional(),
});

export const LogoRevealPropsSchema = z.object({
  logoUrl: z.string().optional(),
  brandName: z.string(),
  tagline: z.string().optional(),
  size: z.number().optional().default(96),
  position: PositionSchema.optional().default({ x: 50, y: 45 }),
  animation: z.enum(["scale-in", "fade-glow", "bounce-in"]).optional().default("scale-in"),
  delay: z.number().optional().default(0),
});

export const MetricCounterPropsSchema = z.object({
  label: z.string(),
  value: z.number(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  decimals: z.number().optional().default(0),
  color: z.string().optional().default("brand.primary"),
  position: PositionSchema.optional().default({ x: 50, y: 50 }),
  delay: z.number().optional().default(0),
  durationFrames: z.number().optional().default(30),
  trend: z.enum(["up", "down", "neutral"]).optional(),
  subtext: z.string().optional(),
});

export const FeaturePillItemSchema = z.object({
  text: z.string(),
  icon: z.string().optional(),
  color: z.string().optional(),
  highlight: z.boolean().optional().default(false),
});

export const FeaturePillsPropsSchema = z.object({
  items: z.array(FeaturePillItemSchema),
  position: PositionSchema.optional().default({ x: 50, y: 50 }),
  layout: z.enum(["horizontal", "vertical", "grid"]).optional().default("horizontal"),
  staggerFrames: z.number().optional().default(5),
  delay: z.number().optional().default(0),
});

export const CTAButtonPropsSchema = z.object({
  text: z.string(),
  subtext: z.string().optional(),
  url: z.string().optional(),
  position: PositionSchema.optional().default({ x: 50, y: 70 }),
  color: z.string().optional().default("#FFFFFF"),
  backgroundColor: z.string().optional().default("brand.primary"),
  pulse: z.boolean().optional().default(true),
  delay: z.number().optional().default(10),
});

export const ImageElementPropsSchema = z.object({
  src: z.string(),
  width: z.number().optional().default(50),
  position: PositionSchema.optional().default({ x: 50, y: 50 }),
  borderRadius: z.number().optional().default(16),
  animation: z.enum(["fade", "scale", "slide-up"]).optional().default("scale"),
  delay: z.number().optional().default(0),
});

export const SplitScreenPropsSchema = z.object({
  left: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    badge: z.string().optional(),
    color: z.string().optional().default("#EF4444"),
    items: z.array(z.string()).optional(),
  }),
  right: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    badge: z.string().optional(),
    color: z.string().optional().default("brand.primary"),
    items: z.array(z.string()).optional(),
  }),
  width: z.number().optional().default(90),
  position: PositionSchema.optional().default({ x: 50, y: 55 }),
  delay: z.number().optional().default(0),
});

export const ComparisonTablePropsSchema = z.object({
  title: z.string().optional(),
  competitorName: z.string().optional().default("Legacy Solutions"),
  brandName: z.string().optional(),
  rows: z.array(
    z.object({
      feature: z.string(),
      brandHas: z.boolean(),
      competitorHas: z.boolean(),
    })
  ),
  width: z.number().optional().default(90),
  position: PositionSchema.optional().default({ x: 50, y: 55 }),
  delay: z.number().optional().default(0),
});

export const TestimonialCardPropsSchema = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  company: z.string().optional(),
  avatarUrl: z.string().optional(),
  stars: z.number().optional().default(5),
  position: PositionSchema.optional().default({ x: 50, y: 55 }),
  delay: z.number().optional().default(0),
});

export const ProgressBarPropsSchema = z.object({
  label: z.string(),
  value: z.number().default(100),
  displayValue: z.string().optional(),
  color: z.string().optional().default("brand.accent"),
  subtext: z.string().optional(),
  position: PositionSchema.optional().default({ x: 50, y: 50 }),
  delay: z.number().optional().default(0),
});

export const PhoneMockupPropsSchema = z.object({
  title: z.string().optional().default("Mobile App"),
  appCategory: z.enum(["fintech", "language", "health", "social", "custom"]).optional().default("fintech"),
  theme: z.enum(["dark", "light"]).optional().default("dark"),
  screenType: z.enum(["screenshot", "wallet", "learning", "prompt", "custom"]).optional().default("wallet"),
  screenshotUrl: z.string().optional(),
  headline: z.string().optional(),
  value: z.string().optional(),
  badges: z.array(z.object({
    text: z.string(),
    icon: z.string().optional(),
    color: z.string().optional(),
    position: z.enum(["orbit-left", "orbit-right", "bottom", "top"]).optional().default("orbit-left"),
  })).optional().default([]),
  position: PositionSchema.optional().default({ x: 50, y: 55 }),
  width: z.number().optional().default(75),
  tilt: z.boolean().optional().default(true),
  rotateY: z.number().optional().default(-10),
  rotateX: z.number().optional().default(12),
  pedestal: z.boolean().optional().default(false),
  delay: z.number().optional().default(0),
});

export const CursorInteractionPropsSchema = z.object({
  from: PositionSchema.optional().default({ x: 25, y: 85 }),
  to: PositionSchema.optional().default({ x: 50, y: 50 }),
  clickAtFrame: z.number().optional().default(35),
  clickRipple: z.boolean().optional().default(true),
  cursorType: z.enum(["pointer", "arrow", "hand"]).optional().default("pointer"),
  color: z.string().optional().default("#FFFFFF"),
  delay: z.number().optional().default(0),
  durationFrames: z.number().optional().default(50),
});

export const ParticleTunnelPropsSchema = z.object({
  speed: z.number().optional().default(16),
  density: z.number().optional().default(200),
  color: z.string().optional().default("brand.primary"),
  accentColor: z.string().optional().default("brand.accent"),
  streakLength: z.number().optional().default(2.5),
  direction: z.enum(["outward", "inward"]).optional().default("outward"),
  delay: z.number().optional().default(0),
  fadeFrames: z.number().optional().default(15),
});

export const ElementSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("kinetic-text"),
    props: KineticTextPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("app-window"),
    props: AppWindowPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("logo-reveal"),
    props: LogoRevealPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("metric-counter"),
    props: MetricCounterPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("feature-pills"),
    props: FeaturePillsPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("cta-button"),
    props: CTAButtonPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("image"),
    props: ImageElementPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("split-screen"),
    props: SplitScreenPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("comparison-table"),
    props: ComparisonTablePropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("testimonial-card"),
    props: TestimonialCardPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("progress-bar"),
    props: ProgressBarPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("phone-mockup"),
    props: PhoneMockupPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("cursor-interaction"),
    props: CursorInteractionPropsSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("particle-tunnel"),
    props: ParticleTunnelPropsSchema,
  }),
]);

export type Element = z.infer<typeof ElementSchema>;
export type KineticTextProps = z.infer<typeof KineticTextPropsSchema>;
export type AppWindowProps = z.infer<typeof AppWindowPropsSchema>;
export type LogoRevealProps = z.infer<typeof LogoRevealPropsSchema>;
export type MetricCounterProps = z.infer<typeof MetricCounterPropsSchema>;
export type FeaturePillsProps = z.infer<typeof FeaturePillsPropsSchema>;
export type CTAButtonProps = z.infer<typeof CTAButtonPropsSchema>;
export type ImageElementProps = z.infer<typeof ImageElementPropsSchema>;
export type SplitScreenProps = z.infer<typeof SplitScreenPropsSchema>;
export type ComparisonTableProps = z.infer<typeof ComparisonTablePropsSchema>;
export type TestimonialCardProps = z.infer<typeof TestimonialCardPropsSchema>;
export type ProgressBarProps = z.infer<typeof ProgressBarPropsSchema>;
export type PhoneMockupProps = z.infer<typeof PhoneMockupPropsSchema>;
export type CursorInteractionProps = z.infer<typeof CursorInteractionPropsSchema>;
export type ParticleTunnelProps = z.infer<typeof ParticleTunnelPropsSchema>;


import { z } from "zod";

export const PositionSchema = z.object({
  x: z.number().describe("Horizontal percentage (0 to 100)"),
  y: z.number().describe("Vertical percentage (0 to 100)"),
});

export const ElementImportanceSchema = z.enum(["hero", "supporting", "ambient"]);

const spatialElementFields = {
  importance: ElementImportanceSchema.optional().default("supporting"),
  z: z.number().optional().default(0),
  parallax: z.number().min(0).max(1).optional().default(0),
  assetId: z.string().optional(),
  cardStyleId: z.string().optional(),
  buttonStyleId: z.string().optional(),
  deviceAssetId: z.string().optional(),
};

function directedElement<T extends z.ZodLiteral<string>, P extends z.ZodTypeAny>(type: T, props: P) {
  return z.object({
    id: z.string(),
    type,
    props,
    ...spatialElementFields,
  });
}

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
    "cinematic-scale",
  ]).default("fade-up"),
  delay: z.number().default(0).describe("Delay in frames before animating in"),
  maxWidth: z.number().optional().describe("Max width in percentage (0-100)"),
  highlightWords: z.array(z.string()).optional().describe("Words to highlight with brand.primary color"),
  letterSpacing: z.string().optional(),
  fontFamily: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
});

export const AppWindowBadgeSchema = z.object({
  text: z.string(),
  icon: z.string().optional(),
  color: z.string().optional().default("brand.primary"),
  position: z.enum(["top-left", "top-right", "bottom-left", "bottom-right"]).default("top-right"),
});

export const CodeSnippetLineSchema = z.object({
  text: z.string(),
  color: z.string().optional(),
  badge: z.string().optional(),
});

export const AppWindowCustomStatSchema = z.object({
  label: z.string(),
  val: z.string(),
  change: z.string(),
  color: z.string().optional(),
});

export const AppWindowPropsSchema = z.object({
  title: z.string().optional().default("Dashboard"),
  url: z.string().optional().default("app.kylian.io/overview"),
  screenshotUrl: z.string().optional().describe("Image URL or local path"),
  mockType: z.enum(["analytics", "kanban", "kanban-full", "chat", "code", "table", "diff", "custom"]).optional().default("analytics"),
  theme: z.enum(["light", "dark"]).optional(),
  width: z.number().optional().default(85).describe("Percentage of composition width"),
  position: PositionSchema.optional().default({ x: 50, y: 55 }),
  tilt: z.boolean().optional().default(true).describe("Apply dynamic 3D perspective tilt"),
  shadow: z.boolean().optional().default(true),
  delay: z.number().optional().default(0),
  animation: z.enum(["float-up", "slide-in-right", "zoom-focus"]).optional().default("float-up"),
  badges: z.array(AppWindowBadgeSchema).optional(),
  codeSnippet: z.array(CodeSnippetLineSchema).optional(),
  customStats: z.array(AppWindowCustomStatSchema).optional(),
  chartTitle: z.string().optional(),
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
  trendBadge: z.string().optional(),
  displayMode: z.enum(["hero-typographic", "bento-card"]).optional().default("hero-typographic"),
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
  screenType: z.enum(["screenshot", "wallet", "learning", "prompt", "deposit-flow", "custom"]).optional().default("wallet"),
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
  cursorType: z.enum(["pointer", "arrow", "hand", "macos-arrow", "agent-tag", "touch"]).optional().default("macos-arrow"),
  agentTag: z.string().optional(),
  color: z.string().optional().default("#000000"),
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

export const NotificationCascadeItemSchema = z.object({
  app: z.enum(["slack", "teams", "calendar", "compliance", "procurement", "email", "custom"]).default("slack"),
  sender: z.string(),
  message: z.string(),
  tag: z.string().optional(),
  time: z.string().optional(),
  icon: z.string().optional(),
  badgeColor: z.string().optional(),
});

export const NotificationCascadePropsSchema = z.object({
  items: z.array(NotificationCascadeItemSchema),
  position: PositionSchema.optional().default({ x: 50, y: 50 }),
  width: z.number().optional().default(70),
  staggerFrames: z.number().optional().default(8),
  delay: z.number().optional().default(0),
  angle: z.number().optional().default(-8),
});

export const AgentTaskChecklistItemSchema = z.object({
  text: z.string(),
  status: z.enum(["completed", "in-progress", "pending"]).default("pending"),
  tag: z.string().optional(),
});

export const AgentTaskCardPropsSchema = z.object({
  title: z.string(),
  status: z.string().optional().default("Executing"),
  actionText: z.string().optional().default("Review & Approve"),
  items: z.array(AgentTaskChecklistItemSchema),
  position: PositionSchema.optional().default({ x: 50, y: 52 }),
  width: z.number().optional().default(75),
  tilt: z.boolean().optional().default(true),
  rotateX: z.number().optional().default(10),
  rotateY: z.number().optional().default(-8),
  delay: z.number().optional().default(0),
});

export const PromptInputPropsSchema = z.object({
  promptText: z.string(),
  placeholder: z.string().optional().default("Ask an agent anything..."),
  position: PositionSchema.optional().default({ x: 50, y: 50 }),
  width: z.number().optional().default(80),
  typewriterSpeed: z.number().optional().default(2).describe("Frames per character"),
  delay: z.number().optional().default(0),
  showSendButton: z.boolean().optional().default(true),
  showMic: z.boolean().optional().default(true),
  badge: z.string().optional(),
});

export const BentoGridCardSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  type: z.enum(["diff-preview", "metric-stat", "audit-feed", "task-list", "code-snippet"]).default("diff-preview"),
  value: z.string().optional(),
  label: z.string().optional(),
  tag: z.string().optional(),
  items: z.array(z.string()).optional(),
  accentColor: z.string().optional(),
});

export const BentoGridPropsSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  cards: z.array(BentoGridCardSchema),
  position: PositionSchema.optional().default({ x: 50, y: 52 }),
  width: z.number().optional().default(90),
  delay: z.number().optional().default(0),
});

export const ActionProgressModalPropsSchema = z.object({
  title: z.string().default("Buying"),
  successTitle: z.string().default("Order placed"),
  successButton: z.string().default("Done"),
  startFrame: z.number().default(0),
  durationFrames: z.number().default(100),
  color: z.string().default("#ffcc00"),
});

export const DepthOfFieldCardsPropsSchema = z.object({
  cards: z.array(z.object({
    x: z.number(),
    y: z.number(),
    rotationY: z.number(),
    blur: z.number(),
    startZ: z.number(),
    speed: z.number(),
  })).default([
    { x: 10, y: 20, rotationY: 15, blur: 8, startZ: 0, speed: 5 },
    { x: 70, y: 60, rotationY: -15, blur: 12, startZ: 0, speed: 8 },
  ]),
});

export const PerspectiveCardGridPropsSchema = z.object({
  cards: z.array(z.object({
    title: z.string(),
    value: z.string(),
  })),
  scaleStart: z.number().default(1),
  scaleEnd: z.number().default(1.1),
  rotateXStart: z.number().default(10),
  rotateXEnd: z.number().default(5),
  translateYStart: z.number().default(50),
  translateYEnd: z.number().default(-20),
  continuousScrollSpeed: z.number().optional().default(0),
  useMotionCurves: z.boolean().optional().default(true),
});

export const CandidateNoiseFieldCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  avatarInitials: z.string().optional(),
  avatarUrl: z.string().optional(),
  avatarBg: z.string().optional(),
  matchScore: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).default([]),
  alertBadge: z.object({
    text: z.string(),
    variant: z.enum(["red", "purple", "neutral"]).default("red"),
  }).optional(),
  metrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional(),
  position: z.object({
    x: z.number().describe("Horizontal percentage (0 to 100)"),
    y: z.number().describe("Vertical percentage (0 to 100)"),
    z: z.number().optional(),
  }),
  rotation: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    z: z.number().optional(),
  }).optional(),
  blur: z.number().optional(),
  opacity: z.number().optional(),
  scale: z.number().optional(),
  spawnFrame: z.number().optional().describe("Frame when this card begins appearing"),
  entryTrajectory: z.enum(["from-left", "from-right", "from-depth", "drop-down", "float-up", "pop-in", "fade", "static-anchor", "foreground-slice"]).optional(),
  occludesTypography: z.boolean().optional().describe("Whether this card crosses container boundary to occlude headline copy"),
});

export const CandidateNoiseFieldPropsSchema = z.object({
  cards: z.array(CandidateNoiseFieldCardSchema).default([]),
  volumetricBeam: z.object({
    color: z.string().default("#7C3AED"),
    secondaryColor: z.string().default("#6366F1"),
    originX: z.number().default(50),
    originY: z.number().default(100),
    intensity: z.number().default(0.85),
  }).optional(),
  containerStyle: z.object({
    topPercent: z.number().default(35),
    heightPercent: z.number().default(61),
    leftPercent: z.number().default(4),
    widthPercent: z.number().default(92),
    borderRadius: z.number().default(32),
    borderColor: z.string().optional(),
    backgroundColor: z.string().optional(),
  }).optional(),
  watermarkText: z.string().optional(),
  isStatic: z.boolean().optional(),
  delay: z.number().optional(),
});

export const ElementSchema = z.discriminatedUnion("type", [
  directedElement(z.literal("kinetic-text"), KineticTextPropsSchema),
  directedElement(z.literal("app-window"), AppWindowPropsSchema),
  directedElement(z.literal("logo-reveal"), LogoRevealPropsSchema),
  directedElement(z.literal("metric-counter"), MetricCounterPropsSchema),
  directedElement(z.literal("feature-pills"), FeaturePillsPropsSchema),
  directedElement(z.literal("cta-button"), CTAButtonPropsSchema),
  directedElement(z.literal("image"), ImageElementPropsSchema),
  directedElement(z.literal("split-screen"), SplitScreenPropsSchema),
  directedElement(z.literal("comparison-table"), ComparisonTablePropsSchema),
  directedElement(z.literal("testimonial-card"), TestimonialCardPropsSchema),
  directedElement(z.literal("progress-bar"), ProgressBarPropsSchema),
  directedElement(z.literal("phone-mockup"), PhoneMockupPropsSchema),
  directedElement(z.literal("cursor-interaction"), CursorInteractionPropsSchema),
  directedElement(z.literal("particle-tunnel"), ParticleTunnelPropsSchema),
  directedElement(z.literal("notification-cascade"), NotificationCascadePropsSchema),
  directedElement(z.literal("agent-task-card"), AgentTaskCardPropsSchema),
  directedElement(z.literal("prompt-input"), PromptInputPropsSchema),
  directedElement(z.literal("bento-grid"), BentoGridPropsSchema),
  directedElement(z.literal("action-progress-modal"), ActionProgressModalPropsSchema),
  directedElement(z.literal("depth-of-field-cards"), DepthOfFieldCardsPropsSchema),
  directedElement(z.literal("perspective-card-grid"), PerspectiveCardGridPropsSchema),
  directedElement(z.literal("candidate-noise-field"), CandidateNoiseFieldPropsSchema),
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
export type NotificationCascadeProps = z.infer<typeof NotificationCascadePropsSchema>;
export type AgentTaskCardProps = z.infer<typeof AgentTaskCardPropsSchema>;
export type PromptInputProps = z.infer<typeof PromptInputPropsSchema>;
export type BentoGridCard = z.infer<typeof BentoGridCardSchema>;
export type BentoGridProps = z.infer<typeof BentoGridPropsSchema>;
export type ActionProgressModalProps = z.infer<typeof ActionProgressModalPropsSchema>;
export type DepthOfFieldCardsProps = z.infer<typeof DepthOfFieldCardsPropsSchema>;
export type PerspectiveCardGridProps = z.infer<typeof PerspectiveCardGridPropsSchema>;
export type CandidateNoiseFieldProps = z.infer<typeof CandidateNoiseFieldPropsSchema>;
export type CandidateNoiseFieldCard = z.infer<typeof CandidateNoiseFieldCardSchema>;



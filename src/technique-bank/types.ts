import { z } from "zod";

export const TechniqueCategorySchema = z.enum([
  "scroll-reveal",
  "card-choreography",
  "camera-dolly",
  "kinetic-type",
  "cursor-interaction",
  "particle-field",
  "glassmorphism",
  "3d-mockup",
  "progress-indicator",
  "scene-transition",
]);

export type TechniqueCategory = z.infer<typeof TechniqueCategorySchema>;

export const MotionCurveNameSchema = z.enum([
  "snappy",
  "punch",
  "glide",
  "kinetic",
  "whip",
  "overshoot",
  "linear",
]);

export type MotionCurveName = z.infer<typeof MotionCurveNameSchema>;

export const DramaticIntentSchema = z.enum([
  "tension-friction",     // chaos, overwhelm, friction, urgency
  "cathartic-relief",    // clarity, ease, uncluttered simplicity
  "precision-craft",     // engineering perfection, micro-detail, speed
  "monumental-prestige", // luxury, authority, weight, editorial grandeur
  "playful-momentum",    // energy, delight, springy responsiveness
]);

export type DramaticIntent = z.infer<typeof DramaticIntentSchema>;

export const TechniqueRecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: TechniqueCategorySchema,
  description: z.string(),
  visualPurpose: z.string().describe("Narrative role, e.g. hook friction, product discovery, proof"),
  dramaticIntent: DramaticIntentSchema.optional().describe("Narrative and emotional intent"),
  whenToUse: z.array(z.string()).describe("Trigger keywords or scene scenarios"),
  targetPrimitive: z.string().describe("The primary primitive this technique applies to"),
  motionCurve: MotionCurveNameSchema.default("snappy"),
  parameters: z.record(z.any()).default({}).describe("Tuning knobs (e.g. scrollSpeed, pitchX, blurAmount)"),
  defaultProps: z.record(z.any()).default({}).describe("Production-grade default props for the primitive"),
  codeSnippet: z.string().describe("Reference React/Remotion/Three code block for this technique"),
  provenIn: z.string().describe("The production ad or benchmark where this was proven"),
  qualityRating: z.number().min(0).max(10).default(9.0),
  tags: z.array(z.string()).default([]),
});

export type TechniqueRecipe = z.infer<typeof TechniqueRecipeSchema>;

export interface TechniqueQuery {
  category?: TechniqueCategory;
  keyword?: string;
  targetPrimitive?: string;
  minRating?: number;
  tag?: string;
  dramaticIntent?: DramaticIntent;
}

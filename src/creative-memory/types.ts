import { z } from "zod";

export const MemoryItemTypeSchema = z.enum([
  "motion-technique",
  "composition",
  "background",
  "shader",
  "component",
  "3d-model",
  "typography-treatment",
  "transition",
  "sound-cue",
  "reference",
]);

export type MemoryItemType = z.infer<typeof MemoryItemTypeSchema>;

export const EmotionalEffectSchema = z.enum([
  "tension",
  "visual-overload",
  "anxiety",
  "relief",
  "delight",
  "awe",
  "urgency",
  "precision",
  "prestige",
  "hyper-focus",
  "playfulness",
]);

export type EmotionalEffect = z.infer<typeof EmotionalEffectSchema>;

export const CompatibleStyleSchema = z.enum([
  "dark-saas",
  "editorial-light",
  "cyber-terminal",
  "industrial-craft",
  "fintech-flow",
  "minimalist",
  "broadcast-bold",
]);

export type CompatibleStyle = z.infer<typeof CompatibleStyleSchema>;

/**
 * The 10 Mandatory Indexing Dimensions for every item in AdCraft's Creative Memory
 */
export const CreativeMemoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: MemoryItemTypeSchema,

  // 1. What it communicates (narrative function & semantic expression)
  whatItCommunicates: z.string().describe("What narrative idea this communicates to the viewer"),

  // 2. Creative problem solved
  creativeProblemSolved: z.string().describe("The specific design or motion hurdle this solves"),

  // 3. Emotional effect
  emotionalEffect: z.array(EmotionalEffectSchema).describe("Primary emotional sensations evoked"),

  // 4. Compatible styles
  compatibleStyles: z.array(CompatibleStyleSchema).describe("Brand aesthetic themes this belongs in"),

  // 5. Compatible compositions
  compatibleCompositions: z.array(z.string()).describe("Framing layouts this fits harmoniously with"),

  // 6. Useful combinations
  usefulCombinations: z.array(z.string()).describe("IDs of synergistic memory items that pair well"),

  // 7. Parameters
  parameters: z.record(z.any()).default({}).describe("Tuning knobs (easing, speed, blur, angles, delays)"),

  // 8. Known failure modes
  knownFailureModes: z.array(z.string()).default([]).describe("Common visual bugs, clipping, or style traps"),

  // 9. Preview or reference example
  previewOrExample: z.object({
    referenceFile: z.string().optional(),
    codeSnippet: z.string().optional(),
    thumbnailUrl: z.string().optional(),
    description: z.string().optional(),
  }),

  // 10. Quality score (baseline human rating + dynamic performance factor)
  qualityScore: z.number().min(0).max(10).default(9.0),

  // Secondary metadata
  tags: z.array(z.string()).default([]),
  provenIn: z.string().optional(),
});

export type CreativeMemoryItem = z.infer<typeof CreativeMemoryItemSchema>;

/**
 * Creative Director Intent Query
 */
export interface CreativeIntentQuery {
  intent: string; // e.g. "Create tension and visual overload" or "Create premium technical precision"
  emotionalNuance?: EmotionalEffect;
  style?: CompatibleStyle;
  creativeProblem?: string;
  compositionFraming?: string;
  brandContext?: string;
}

/**
 * Synthesized Creative Vocabulary Package returned to the Creative Director
 */
export interface CreativeVocabularyPackage {
  intent: string;
  headlineSummary: string;
  compositions: CreativeMemoryItem[];
  techniques: CreativeMemoryItem[];
  backgrounds: CreativeMemoryItem[];
  typographyTreatments: CreativeMemoryItem[];
  transitions: CreativeMemoryItem[];
  soundCues: CreativeMemoryItem[];
  usefulCombinations: string[][];
  failureModesToAvoid: string[];
  referenceInspirations: CreativeMemoryItem[];
}

/**
 * Closed-Loop Learning: Session Outcome
 */
export interface SessionOutcome {
  id: string;
  brand: string;
  conceptAngle: string;
  intent: string;
  style: CompatibleStyle;
  itemsUsed: string[]; // IDs of CreativeMemoryItems used in this ad
  critiqueOverallScore: number;
  critiquePassed: boolean;
  critiqueIssues: Array<{
    sceneId: string;
    category: string;
    severity: string;
    description: string;
  }>;
  userVerdict?: "approved" | "rejected" | "unreviewed";
  userFeedbackNotes?: string;
  timestamp: string;
}

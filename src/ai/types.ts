import { Brand, MotionIR } from "../schema";

export type CampaignGoal =
  | "free_trial"
  | "book_demo"
  | "feature_launch"
  | "brand_awareness"
  | "user_acquisition";

export interface CampaignBrief {
  productName: string;
  productDescription: string;
  websiteUrl?: string;
  targetAudience?: string;
  goal: CampaignGoal;
  targetDurationSeconds?: 15 | 20 | 30;
  aspectRatio?: "9:16" | "16:9" | "1:1";
  keyFeatures?: string[];
  metricsOrSocialProof?: {
    metric: string;
    label: string;
    subtext?: string;
  };
  customAngle?: string;
  constraints?: string[];
  tone?: string[];
  cta?: {
    label: string;
    url?: string;
  };
  visualReferences?: string[];
  outputChannels?: ("tiktok" | "instagram-reels" | "linkedin" | "youtube-shorts")[];
}

export interface CreativeConcept {
  angle: string;
  hookHeadline: string;
  coreNarrative: string;
  visualTreatment: string;
}

export interface CreativeDirectorResult {
  concept: CreativeConcept;
  motionIR: MotionIR;
  generationSource: "llm" | "synthesizer";
}

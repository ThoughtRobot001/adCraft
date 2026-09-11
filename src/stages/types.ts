import { Brand, Element, MotionIR, SceneBackground, SceneTransition } from "../schema";
import { CampaignBrief } from "../ai/types";

export interface BrandVoice {
  tone: "authoritative" | "playful" | "urgent" | "aspirational" | "technical" | "minimalist";
  personality: string;
  avoidWords: string[];
}

export interface BrandPositioning {
  category: string;
  competitors: string[];
  differentiator: string;
}

export interface TargetAudienceProfile {
  primary: string;
  painPoints: string[];
  motivations: string[];
}

export interface BrandProfile {
  identity: Brand;
  voice: BrandVoice;
  positioning: BrandPositioning;
  audience: TargetAudienceProfile;
}

export type CreativeAngle =
  | "pain-agitate-solve"
  | "before-after"
  | "social-proof-first"
  | "product-hero"
  | "velocity-speedrun"
  | "curiosity-hook"
  | "myth-buster"
  | "founder-pitch";

export interface CreativeConcept {
  id: string;
  angle: CreativeAngle;
  angleTitle: string;
  hook: string;
  narrative: string;
  emotionalArc: string;
  visualMood: string;
  estimatedSceneCount: number;
  strategicScore: number;
  reasoning: string;
}

export interface ElementIntent {
  role:
    | "hook-headline"
    | "subtext"
    | "problem-badge"
    | "product-mockup"
    | "status-badge"
    | "metric-hero"
    | "trust-signal"
    | "brand-monogram"
    | "call-to-action";
  description: string;
  importance: "hero" | "supporting" | "ambient";
}

export interface StoryboardScene {
  id: string;
  sceneIndex: number;
  name: string;
  intent: string;
  durationSeconds: number;
  emotionalBeat: string;
  headlineCopy: string;
  supportingCopy?: string;
  visualDescription: string;
  elementIntents: ElementIntent[];
  pacingNotes: string;
}

export interface Storyboard {
  concept: CreativeConcept;
  totalDurationSeconds: number;
  narrativeArc: string;
  pacingStrategy: string;
  scenes: StoryboardScene[];
}

export interface ArtDirectedScene {
  storyboardScene: StoryboardScene;
  background: SceneBackground;
  layoutStrategy: "hero-centered" | "split-depth" | "stacked-cards" | "minimal-focus";
  elements: Element[];
  transition: SceneTransition;
}

export interface CritiqueIssue {
  sceneId: string;
  category:
    | "readability"
    | "visual-hierarchy"
    | "pacing"
    | "contrast"
    | "crowding"
    | "brand-consistency"
    | "empty-scene";
  severity: "critical" | "major" | "minor";
  description: string;
  suggestedFix: string;
}

export interface SceneCritique {
  sceneId: string;
  score: number; // 1-10
  notes: string;
  issues: CritiqueIssue[];
}

export interface CritiqueResult {
  overallScore: number; // 1-10
  passedThreshold: boolean;
  scenes: SceneCritique[];
  summary: string;
  revisionRequired: boolean;
}

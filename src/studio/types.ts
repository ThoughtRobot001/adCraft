import { CampaignBrief } from "../ai/types";
import { BrandInput } from "../ingestion";
import { MotionIR } from "../schema";
import {
  ApprovedKeyframe,
  BrandProfile,
  CandidateKeyframe,
  CreativeConcept,
  CritiqueResult,
  KeyframeAnalysis,
  MotionPlan,
  Storyboard,
  VisualBible,
} from "../stages";

export type ProvenanceSource = "live-ai" | "deterministic-fixture" | "sample-demo";

export type ProviderStatus =
  | "configured"
  | "unauthenticated"
  | "missing-key"
  | "rate-limited"
  | "error";

export interface CapabilityStatus {
  aiProvider: string;
  status: ProviderStatus;
  mode: ProvenanceSource;
  message: string;
  canUseLiveAI: boolean;
}

export interface ArtifactProvenance {
  id: string;
  source: ProvenanceSource;
  timestamp: string;
  upstreamArtifactId?: string;
  version: number;
  reviewStatus: "pending" | "approved" | "rejected" | "auto-recommended";
  reviewedBy?: string;
  reviewNotes?: string;
}

export type StudioJobState =
  | "draft"
  | "running"
  | "needs-review"
  | "approved"
  | "revising"
  | "passed"
  | "failed"
  | "exporting"
  | "complete";

export type StudioStageId =
  | "brief"
  | "evidence"
  | "concepts"
  | "storyboard"
  | "keyframes"
  | "motion"
  | "quality"
  | "export";

export interface QualityDimensions {
  narrativeClarity: number;      // 0-10
  brandFidelity: number;         // 0-10
  visualHierarchy: number;       // 0-10
  typographyReadability: number; // 0-10
  motionHierarchy: number;       // 0-10
  pacing: number;                // 0-10
  technicalValidity: number;     // 0-10
  exportReadiness: number;       // 0-10
  overall: number;               // 0-10
}

export interface ExportPackageManifest {
  jobId: string;
  adId: string;
  timestamp: string;
  brandName: string;
  conceptAngle: string;
  provenance: ArtifactProvenance;
  qualityScore: number;
  qualityDimensions: QualityDimensions;
  approvalAuditTrail: {
    conceptApprovedAt?: string;
    storyboardApprovedAt?: string;
    keyframesApprovedAt?: string;
    qualityGatePassedAt?: string;
    finalApprovedAt?: string;
    verdict: "approved" | "rejected" | "unreviewed";
  };
  files: {
    manifest: string;
    motionIR: string;
    storyboard: string;
    critique: string;
    keyframes: string[];
    mp4Video?: string;
  };
}

export interface StudioConceptOption extends CreativeConcept {
  isRecommended?: boolean;
  provenance: ArtifactProvenance;
}

export type StudioMode = "quick-create" | "creative-studio";

export interface NaturalLanguageRevision {
  id: string;
  instruction: string;
  timestamp: string;
  category: "hook" | "premium" | "brevity" | "product-focus" | "custom";
  summaryOfChanges: string[];
  resultingScore: number;
}

export interface StudioState {
  jobId: string;
  jobState: StudioJobState;
  currentStage: StudioStageId;
  activeMode: StudioMode;
  capability: CapabilityStatus;
  brandInput: BrandInput;
  brief: CampaignBrief;
  creativeDirection?: string;
  brandProfile?: BrandProfile & { provenance: ArtifactProvenance };
  visualBible?: VisualBible & { provenance: ArtifactProvenance };
  concepts?: StudioConceptOption[];
  selectedConceptId?: string;
  storyboard?: Storyboard & { provenance: ArtifactProvenance };
  candidateKeyframes?: Record<string, CandidateKeyframe[]>;
  approvedKeyframes?: Record<string, ApprovedKeyframe>;
  keyframeAnalyses?: Record<string, KeyframeAnalysis>;
  motionPlans?: Record<string, MotionPlan>;
  motionIR?: MotionIR & { provenance: ArtifactProvenance };
  critique?: CritiqueResult & { qualityDimensions: QualityDimensions; provenance: ArtifactProvenance };
  exportPackage?: ExportPackageManifest;
  revisionsApplied: number;
  revisions?: NaturalLanguageRevision[];
  errorMessage?: string;
  auditTrail: { stage: StudioStageId; action: string; timestamp: string }[];
}

export type StageStatus =
  | "draft"
  | "running"
  | "needs-review"
  | "revising"
  | "approved"
  | "blocked"
  | "exporting"
  | "complete"
  | "failed";

export type InspectorSelection =
  | { type: "scene"; sceneId: string }
  | { type: "keyframe"; sceneId: string; candidateId: string }
  | { type: "render" }
  | { type: "concept"; conceptId: string }
  | { type: "none" };

export function getStageStatus(stage: StudioStageId, state: StudioState): StageStatus {
  if (state.jobState === "failed") return "failed";
  switch (stage) {
    case "brief":
      return state.brandProfile ? "approved" : state.jobState === "running" ? "running" : "draft";
    case "evidence":
      if (!state.brandProfile) return "blocked";
      return state.concepts && state.concepts.length > 0
        ? "approved"
        : state.jobState === "running" && state.currentStage === "evidence"
        ? "running"
        : "needs-review";
    case "concepts":
      if (!state.concepts || state.concepts.length === 0) return "blocked";
      return state.selectedConceptId ? "approved" : "needs-review";
    case "storyboard":
      if (!state.storyboard) return "blocked";
      return state.candidateKeyframes && Object.keys(state.candidateKeyframes).length > 0
        ? "approved"
        : "needs-review";
    case "keyframes": {
      if (!state.candidateKeyframes) return "blocked";
      const requiredScenes = state.storyboard?.scenes.length || 0;
      const approvedCount = Object.keys(state.approvedKeyframes || {}).length;
      return approvedCount >= requiredScenes && requiredScenes > 0 ? "approved" : "needs-review";
    }
    case "motion":
      if (!state.motionIR) return "blocked";
      return state.critique ? "approved" : "running";
    case "quality":
      if (!state.critique) return "blocked";
      return state.critique.passedThreshold ? "approved" : "needs-review";
    case "export":
      if (!state.exportPackage) return "blocked";
      return state.exportPackage.qualityScore >= 9.0 ? "complete" : "blocked";
    default:
      return "draft";
  }
}

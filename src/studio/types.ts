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

export interface StudioState {
  jobId: string;
  jobState: StudioJobState;
  currentStage: StudioStageId;
  capability: CapabilityStatus;
  brandInput: BrandInput;
  brief: CampaignBrief;
  brandProfile?: BrandProfile & { provenance: ArtifactProvenance };
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
  errorMessage?: string;
  auditTrail: { stage: StudioStageId; action: string; timestamp: string }[];
}

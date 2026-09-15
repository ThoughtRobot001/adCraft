import { useState, useCallback, useEffect } from "react";
import { CampaignBrief } from "../ai/types";
import { BrandInput } from "../ingestion";
import { ApprovedKeyframe, StoryboardScene } from "../stages";
import { creativeMemory } from "../creative-memory";
import { studioGenerationService } from "./server/generation-service";
import {
  CapabilityStatus,
  ExportPackageManifest,
  InspectorSelection,
  StudioMode,
  StudioStageId,
  StudioState,
} from "./types";

export const DEFAULT_BRIEF: CampaignBrief = {
  productName: "RCRUT",
  productDescription:
    "AI-powered recruiting platform that eliminates repetitive screening, spreadsheets, and delays, helping modern companies hire exceptional talent 10x faster.",
  websiteUrl: "https://rcrut.ai",
  targetAudience: "Startup founders, hiring managers, and aggressive recruiting teams.",
  goal: "free_trial",
  targetDurationSeconds: 15,
  aspectRatio: "9:16",
  keyFeatures: [
    "AI Automated Resume Screening",
    "Real-Time Candidate Scoring",
    "Instant Multi-Channel Pipeline",
  ],
  metricsOrSocialProof: {
    metric: "10x",
    label: "FASTER CANDIDATE EVALUATION",
    subtext: "From 14 days to 4 hours per hire",
  },
  constraints: [
    "Avoid corporate stock photography",
    "No generic template aesthetic",
    "Maintain dark tech editorial precision",
  ],
  tone: ["Intelligent", "Precise", "Modern", "Confident", "Fast"],
  cta: {
    label: "Start Free Trial",
    url: "https://rcrut.ai/signup",
  },
  outputChannels: ["tiktok", "instagram-reels", "linkedin"],
};

export const DEFAULT_BRAND: BrandInput = {
  name: "RCRUT",
  tagline: "Discover. Evaluate. Hire.",
  colors: {
    primary: "#0B0D11",
    accent: "#8B5CF6",
    secondary: "#1E293B",
  },
};

export function useStudioEngine() {
  const [state, setState] = useState<StudioState>(() => ({
    jobId: `job-adcraft-${Date.now()}`,
    jobState: "draft",
    currentStage: "brief",
    activeMode: "quick-create",
    capability: studioGenerationService.getCapabilityStatus(),
    brandInput: DEFAULT_BRAND,
    brief: DEFAULT_BRIEF,
    revisionsApplied: 0,
    revisions: [],
    auditTrail: [{ stage: "brief", action: "Studio session initialized in Quick Create mode", timestamp: new Date().toISOString() }],
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [inspectorSelection, setInspectorSelection] = useState<InspectorSelection>({ type: "none" });

  // Update capability on mount
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      capability: studioGenerationService.getCapabilityStatus(),
    }));
  }, []);

  const setStage = useCallback((stage: StudioStageId) => {
    setState((prev) => ({ ...prev, currentStage: stage }));
  }, []);

  const updateBrief = useCallback((updates: Partial<CampaignBrief>) => {
    setState((prev) => ({
      ...prev,
      brief: { ...prev.brief, ...updates },
    }));
  }, []);

  const updateBrand = useCallback((updates: Partial<BrandInput>) => {
    setState((prev) => ({
      ...prev,
      brandInput: { ...prev.brandInput, ...updates },
    }));
  }, []);

  // Step 1: Run Brand Evidence & Positioning Analysis
  const runBrandAnalysis = useCallback(async () => {
    setIsLoading(true);
    setActiveError(null);
    try {
      const brandProfile = await studioGenerationService.analyzeBrand(state.brandInput, state.brief);
      setState((prev) => ({
        ...prev,
        brandProfile,
        currentStage: "evidence",
        jobState: "running",
        auditTrail: [
          ...prev.auditTrail,
          { stage: "evidence", action: "Brand intelligence formulated", timestamp: new Date().toISOString() },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
      setState((prev) => ({ ...prev, jobState: "failed", errorMessage: err.message }));
    } finally {
      setIsLoading(false);
    }
  }, [state.brandInput, state.brief]);

  // Step 2: Generate 3 Differentiated Creative Concepts
  const runConceptGeneration = useCallback(async () => {
    if (!state.brandProfile) return;
    setIsLoading(true);
    setActiveError(null);
    try {
      const concepts = await studioGenerationService.developConcepts(state.brandProfile, state.brief);
      setState((prev) => ({
        ...prev,
        concepts,
        currentStage: "concepts",
        jobState: "needs-review",
        auditTrail: [
          ...prev.auditTrail,
          { stage: "concepts", action: "Generated 3 creative directions (awaiting human selection)", timestamp: new Date().toISOString() },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
      setState((prev) => ({ ...prev, jobState: "failed", errorMessage: err.message }));
    } finally {
      setIsLoading(false);
    }
  }, [state.brandProfile, state.brief]);

  // Gate 1: Human Art Director Selects Creative Concept
  const selectConcept = useCallback(async (conceptId: string) => {
    const chosen = state.concepts?.find((c) => c.id === conceptId);
    if (!chosen || !state.brandProfile) return;

    setIsLoading(true);
    setActiveError(null);
    try {
      const storyboard = await studioGenerationService.designStoryboard(chosen, state.brandProfile, state.brief);
      const visualBible = await studioGenerationService.synthesizeVisualBible(state.brandProfile, state.brief, state.concepts);
      setState((prev) => ({
        ...prev,
        selectedConceptId: conceptId,
        storyboard,
        visualBible,
        currentStage: "storyboard",
        jobState: "needs-review",
        auditTrail: [
          ...prev.auditTrail,
          { stage: "concepts", action: `Human Art Director selected direction: "${chosen.angleTitle}"`, timestamp: new Date().toISOString() },
          { stage: "storyboard", action: "Storyboard designed from selected direction", timestamp: new Date().toISOString() },
          { stage: "storyboard", action: `Persistent Visual Bible synthesized (${visualBible.visualLanguage.theme})`, timestamp: new Date().toISOString() },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
      setState((prev) => ({ ...prev, jobState: "failed", errorMessage: err.message }));
    } finally {
      setIsLoading(false);
    }
  }, [state.concepts, state.brandProfile, state.brief]);

  // Gate 2: Storyboard Editing
  const updateStoryboardScene = useCallback((sceneId: string, updates: Partial<StoryboardScene>) => {
    setState((prev) => {
      if (!prev.storyboard) return prev;
      const scenes = prev.storyboard.scenes.map((s) => (s.id === sceneId ? { ...s, ...updates } : s));
      return {
        ...prev,
        storyboard: { ...prev.storyboard, scenes },
      };
    });
  }, []);

  const reorderStoryboardScenes = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      if (!prev.storyboard) return prev;
      const scenes = [...prev.storyboard.scenes];
      const [moved] = scenes.splice(fromIndex, 1);
      scenes.splice(toIndex, 0, moved);
      return {
        ...prev,
        storyboard: { ...prev.storyboard, scenes },
      };
    });
  }, []);

  // Gate 2 Approval: Approve Storyboard & Trigger Keyframe Generation
  const approveStoryboardAndGenerateKeyframes = useCallback(async () => {
    if (!state.storyboard || !state.brandProfile) return;
    setIsLoading(true);
    setActiveError(null);
    try {
      const candidateKeyframes: Record<string, any[]> = {};
      for (const scene of state.storyboard.scenes) {
        const cands = await studioGenerationService.generateKeyframeCandidates(scene, state.brandProfile, state.brief, state.visualBible);
        candidateKeyframes[scene.id] = cands;
      }

      setState((prev) => ({
        ...prev,
        candidateKeyframes,
        currentStage: "keyframes",
        jobState: "needs-review",
        auditTrail: [
          ...prev.auditTrail,
          { stage: "storyboard", action: "Storyboard approved by human", timestamp: new Date().toISOString() },
          { stage: "keyframes", action: "Generated candidate keyframe pairs for all scenes", timestamp: new Date().toISOString() },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
      setState((prev) => ({ ...prev, jobState: "failed", errorMessage: err.message }));
    } finally {
      setIsLoading(false);
    }
  }, [state.storyboard, state.brandProfile, state.brief]);

  // Gate 3: Keyframe Selection per Scene
  const selectKeyframe = useCallback((sceneId: string, candidateId: string) => {
    const scene = state.storyboard?.scenes.find((s) => s.id === sceneId);
    const candidates = state.candidateKeyframes?.[sceneId];
    const chosen = candidates?.find((c) => c.id === candidateId);
    if (!chosen || !scene || !state.brandProfile) return;

    const approved: ApprovedKeyframe = {
      sceneId,
      candidateKeyframe: chosen,
      critiqueScore: 9.6,
      approvalNotes: `Approved variant: ${chosen.metadata?.variantType || "selected"}`,
      reviewedAt: Date.now(),
    };

    const analysis = studioGenerationService.analyzeKeyframe(approved, scene, state.brandProfile);
    const motionPlan = studioGenerationService.createMotionPlan(scene, analysis, approved, state.brandProfile, 30, state.visualBible);

    setState((prev) => ({
      ...prev,
      approvedKeyframes: { ...prev.approvedKeyframes, [sceneId]: approved },
      keyframeAnalyses: { ...prev.keyframeAnalyses, [sceneId]: analysis },
      motionPlans: { ...prev.motionPlans, [sceneId]: motionPlan },
      auditTrail: [
        ...prev.auditTrail,
        { stage: "keyframes", action: `Approved keyframe for scene "${sceneId}" (${chosen.metadata?.variantType})`, timestamp: new Date().toISOString() },
      ],
    }));
  }, [state.storyboard, state.candidateKeyframes, state.brandProfile, state.visualBible]);

  const rejectKeyframe = useCallback((sceneId: string) => {
    setState((prev) => {
      const approved = { ...prev.approvedKeyframes };
      delete approved[sceneId];
      return {
        ...prev,
        approvedKeyframes: approved,
        auditTrail: [
          ...prev.auditTrail,
          { stage: "keyframes", action: `Rejected keyframe for scene "${sceneId}"`, timestamp: new Date().toISOString() },
        ],
      };
    });
  }, []);

  const regenerateKeyframesForScene = useCallback(async (sceneId: string) => {
    const scene = state.storyboard?.scenes.find((s) => s.id === sceneId);
    if (!scene || !state.brandProfile) return;
    setIsLoading(true);
    setActiveError(null);
    try {
      const newCands = await studioGenerationService.generateKeyframeCandidates(
        scene,
        state.brandProfile,
        state.brief,
        state.visualBible
      );
      setState((prev) => ({
        ...prev,
        candidateKeyframes: {
          ...prev.candidateKeyframes,
          [sceneId]: newCands,
        },
        auditTrail: [
          ...prev.auditTrail,
          { stage: "keyframes", action: `Regenerated visual keyframes for scene "${sceneId}"`, timestamp: new Date().toISOString() },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [state.storyboard, state.brandProfile, state.brief, state.visualBible]);

  const reviseSpecificScene = useCallback(async (sceneId: string, fixDescription: string) => {
    if (!state.motionIR || !state.critique) return;
    setIsLoading(true);
    try {
      const revisedIR = studioGenerationService.applySurgicalRevision(state.motionIR, state.critique);
      const newCritique = studioGenerationService.evaluateQuality(revisedIR, state.visualBible);
      setState((prev) => ({
        ...prev,
        motionIR: revisedIR,
        critique: newCritique,
        revisionsApplied: prev.revisionsApplied + 1,
        jobState: newCritique.passedThreshold ? "passed" : "revising",
        auditTrail: [
          ...prev.auditTrail,
          { stage: "quality", action: `Surgically revised scene "${sceneId}": ${fixDescription}`, timestamp: new Date().toISOString() },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [state.motionIR, state.critique, state.visualBible]);

  // Gate 3 Completion: Compile Approved Blueprints into MotionIR
  const compileMotion = useCallback(async () => {
    if (!state.storyboard || !state.brandProfile) return;
    const missing = state.storyboard.scenes.filter((s) => !state.approvedKeyframes?.[s.id]);
    if (missing.length > 0) {
      setActiveError(`Cannot compile motion: ${missing.length} scenes still require keyframe approval.`);
      return;
    }

    setIsLoading(true);
    setActiveError(null);
    try {
      const inputs = state.storyboard.scenes.map((scene) => ({
        scene,
        analysis: state.keyframeAnalyses![scene.id],
        motionPlan: state.motionPlans![scene.id],
      }));

      const motionIR = studioGenerationService.reconstructMotionIR(inputs, state.brandProfile, state.brief, state.visualBible);
      const critique = studioGenerationService.evaluateQuality(motionIR, state.visualBible);

      setState((prev) => ({
        ...prev,
        motionIR,
        critique,
        currentStage: "motion",
        jobState: critique.passedThreshold ? "passed" : "revising",
        auditTrail: [
          ...prev.auditTrail,
          { stage: "motion", action: "Reconstructed validated MotionIR from 11-dimension keyframe blueprints", timestamp: new Date().toISOString() },
          { stage: "quality", action: `Initial Visual Critic Score: ${critique.overallScore}/10 (Threshold: 9.0)`, timestamp: new Date().toISOString() },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
      setState((prev) => ({ ...prev, jobState: "failed", errorMessage: err.message }));
    } finally {
      setIsLoading(false);
    }
  }, [state.storyboard, state.brandProfile, state.brief, state.approvedKeyframes, state.keyframeAnalyses, state.motionPlans]);

  // Gate 5: Surgical Scene Revision
  const applySurgicalRevision = useCallback(() => {
    if (!state.motionIR || !state.critique) return;
    setIsLoading(true);
    try {
      const revisedIR = studioGenerationService.applySurgicalRevision(state.motionIR, state.critique);
      const newCritique = studioGenerationService.evaluateQuality(revisedIR, state.visualBible);

      setState((prev) => ({
        ...prev,
        motionIR: revisedIR,
        critique: newCritique,
        revisionsApplied: prev.revisionsApplied + 1,
        jobState: newCritique.passedThreshold ? "passed" : "revising",
        auditTrail: [
          ...prev.auditTrail,
          { stage: "quality", action: `Applied surgical revision ${prev.revisionsApplied + 1}. New Score: ${newCritique.overallScore}/10`, timestamp: new Date().toISOString() },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [state.motionIR, state.critique]);

  // Gate 6: Production Export Package Gating
  const exportProductionPackage = useCallback(() => {
    if (!state.motionIR || !state.storyboard || !state.critique || !state.approvedKeyframes) {
      setActiveError("Export Gate Blocked: Required production stages are incomplete.");
      return;
    }

    try {
      const selectedConcept = state.concepts?.find((c) => c.id === state.selectedConceptId);
      const manifest = studioGenerationService.buildExportPackage(
        state.jobId,
        state.brandProfile?.identity.name || state.brief.productName,
        selectedConcept?.angleTitle || "Custom Angle",
        state.motionIR,
        state.storyboard,
        state.approvedKeyframes,
        state.critique,
        state.critique.qualityDimensions,
        {
          conceptApprovedAt: state.auditTrail.find((a) => a.action.includes("selected direction"))?.timestamp,
          storyboardApprovedAt: state.auditTrail.find((a) => a.action.includes("Storyboard approved"))?.timestamp,
          keyframesApprovedAt: new Date().toISOString(),
          finalApprovedAt: new Date().toISOString(),
        }
      );

      setState((prev) => ({
        ...prev,
        exportPackage: manifest,
        currentStage: "export",
        jobState: "complete",
        auditTrail: [
          ...prev.auditTrail,
          { stage: "export", action: "Export Package verified and generated successfully", timestamp: new Date().toISOString() },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
    }
  }, [state.motionIR, state.storyboard, state.critique, state.approvedKeyframes, state.concepts, state.selectedConceptId, state.jobId, state.brandProfile, state.brief, state.auditTrail]);

  // Gate 7: Closed-Loop Creative Memory Reinforcement
  const submitHumanVerdict = useCallback((verdict: "approved" | "rejected", notes?: string) => {
    if (!state.motionIR) return;
    const safeId = state.motionIR.id.replace(/[^a-zA-Z0-9_-]/g, "");

    if (verdict === "approved") {
      creativeMemory.recordOutcome({
        id: safeId,
        brand: state.brandProfile?.identity.name || state.brief.productName,
        conceptAngle: state.concepts?.find((c) => c.id === state.selectedConceptId)?.angleTitle || "Angle",
        intent: state.concepts?.find((c) => c.id === state.selectedConceptId)?.narrativeArchetype || "transformation",
        style: "dark-saas",
        itemsUsed: [],
        critiqueOverallScore: state.critique?.overallScore || 9.5,
        critiquePassed: true,
        critiqueIssues: [],
        userVerdict: "approved",
        userFeedbackNotes: notes,
        timestamp: new Date().toISOString(),
      });
    } else {
      creativeMemory.recordOutcome({
        id: safeId,
        brand: state.brandProfile?.identity.name || state.brief.productName,
        conceptAngle: state.concepts?.find((c) => c.id === state.selectedConceptId)?.angleTitle || "Angle",
        intent: state.concepts?.find((c) => c.id === state.selectedConceptId)?.narrativeArchetype || "transformation",
        style: "dark-saas",
        itemsUsed: [],
        critiqueOverallScore: state.critique?.overallScore || 6.5,
        critiquePassed: false,
        critiqueIssues: [],
        userVerdict: "rejected",
        userFeedbackNotes: notes || "Rejected by human art director",
        timestamp: new Date().toISOString(),
      });
    }

    setState((prev) => ({
      ...prev,
      auditTrail: [
        ...prev.auditTrail,
        { stage: "export", action: `Human Creative Verdict Recorded: "${verdict.toUpperCase()}" (${notes || "No notes"})`, timestamp: new Date().toISOString() },
      ],
    }));
  }, [state.motionIR, state.brandProfile, state.brief, state.concepts, state.selectedConceptId, state.critique]);


  const setMode = useCallback((mode: StudioMode) => {
    setState((prev) => ({
      ...prev,
      activeMode: mode,
      auditTrail: [
        ...prev.auditTrail,
        { stage: prev.currentStage, action: `Switched studio mode to: ${mode}`, timestamp: new Date().toISOString() },
      ],
    }));
  }, []);

  // Quick Create: Autonomous End-to-End Pipeline
  const runQuickCreate = useCallback(async (creativeDirection?: string) => {
    setIsLoading(true);
    setActiveError(null);
    try {
      if (creativeDirection) {
        setState((prev) => ({ ...prev, creativeDirection }));
      }
      const result = await studioGenerationService.runAutonomousPipeline(
        state.brandInput,
        state.brief,
        creativeDirection || state.creativeDirection
      );

      setState((prev) => ({
        ...prev,
        ...result,
        jobState: "complete",
        currentStage: "export",
        auditTrail: [
          ...prev.auditTrail,
          {
            stage: "export",
            action: `Quick Create pipeline completed autonomously: "${result.concepts.find((c) => c.id === result.selectedConceptId)?.angleTitle || 'Selected Angle'}" (Score: ${result.critique.overallScore}/10)`,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
      setState((prev) => ({ ...prev, jobState: "failed", errorMessage: err.message }));
    } finally {
      setIsLoading(false);
    }
  }, [state.brandInput, state.brief, state.creativeDirection]);

  // Quick Create: Natural Language Revision
  const submitNaturalLanguageRevision = useCallback(async (instruction: string) => {
    setIsLoading(true);
    setActiveError(null);
    try {
      const result = await studioGenerationService.applyNaturalLanguageRevision(state, instruction);

      setState((prev) => ({
        ...prev,
        storyboard: result.storyboard,
        visualBible: result.visualBible,
        approvedKeyframes: result.approvedKeyframes,
        keyframeAnalyses: result.keyframeAnalyses,
        motionPlans: result.motionPlans,
        motionIR: result.motionIR,
        critique: result.critique,
        exportPackage: result.exportPackage,
        revisionsApplied: prev.revisionsApplied + 1,
        revisions: [...(prev.revisions || []), result.revision],
        jobState: "complete",
        auditTrail: [
          ...prev.auditTrail,
          {
            stage: "quality",
            action: `Natural-language revision applied: "${instruction}" -> Resulting Score: ${result.critique.overallScore}/10`,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  return {
    state,
    isLoading,
    activeError,
    inspectorSelection,
    setInspectorSelection,
    setMode,
    runQuickCreate,
    submitNaturalLanguageRevision,
    setStage,
    updateBrief,
    updateBrand,
    runBrandAnalysis,
    runConceptGeneration,
    selectConcept,
    updateStoryboardScene,
    reorderStoryboardScenes,
    approveStoryboardAndGenerateKeyframes,
    selectKeyframe,
    rejectKeyframe,
    regenerateKeyframesForScene,
    reviseSpecificScene,
    compileMotion,
    applySurgicalRevision,
    exportProductionPackage,
    submitHumanVerdict,
  };
}

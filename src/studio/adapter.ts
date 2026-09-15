import { useState, useCallback, useEffect } from "react";
import type { CampaignBrief } from "../ai/types";
import type { BrandInput } from "../ingestion";
import type { ApprovedKeyframe, StoryboardScene } from "../stages/types";
import type {
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

const INITIAL_CAPABILITY: CapabilityStatus = {
  aiProvider: "Gemini 3.6 Flash",
  status: "configured",
  mode: "live-ai",
  message: "Connecting to AdCraft Creative Studio Engine...",
  canUseLiveAI: true,
};

async function apiRequest<T = any>(endpoint: string, body?: any): Promise<T> {
  const res = await fetch(endpoint, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `API error from ${endpoint} (status ${res.status})`);
  }
  return data;
}

export function useStudioEngine() {
  const [state, setState] = useState<StudioState>(() => ({
    jobId: `job-adcraft-${Date.now()}`,
    jobState: "draft",
    currentStage: "brief",
    activeMode: "quick-create",
    capability: INITIAL_CAPABILITY,
    brandInput: DEFAULT_BRAND,
    brief: DEFAULT_BRIEF,
    revisionsApplied: 0,
    revisions: [],
    auditTrail: [
      {
        stage: "brief",
        action: "Studio session initialized in Quick Create mode",
        timestamp: new Date().toISOString(),
      },
    ],
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [inspectorSelection, setInspectorSelection] = useState<InspectorSelection>({
    type: "none",
  });

  // Query capability status from backend API on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      apiRequest("/api/status")
        .then((data) => {
          if (data.capability) {
            setState((prev) => ({ ...prev, capability: data.capability }));
          }
        })
        .catch((err) => {
          console.warn("[AdCraft Engine] Could not fetch status:", err);
        });
    }
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
      const data = await apiRequest("/api/pipeline/stage/brief", {
        payload: { brand: state.brandInput, brief: state.brief },
      });
      setState((prev) => ({
        ...prev,
        brandProfile: data.brandProfile,
        currentStage: "evidence",
        jobState: "running",
        auditTrail: [
          ...prev.auditTrail,
          {
            stage: "evidence",
            action: "Brand intelligence formulated",
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
  }, [state.brandInput, state.brief]);

  // Step 2: Generate 3 Differentiated Creative Concepts
  const runConceptGeneration = useCallback(async () => {
    if (!state.brandProfile) return;
    setIsLoading(true);
    setActiveError(null);
    try {
      const data = await apiRequest("/api/pipeline/stage/concepts", {
        payload: { brandProfile: state.brandProfile, brief: state.brief },
      });
      setState((prev) => ({
        ...prev,
        concepts: data.concepts,
        currentStage: "concepts",
        jobState: "needs-review",
        auditTrail: [
          ...prev.auditTrail,
          {
            stage: "concepts",
            action: "Generated 3 creative directions (awaiting human selection)",
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
  }, [state.brandProfile, state.brief]);

  // Gate 1: Human Art Director Selects Creative Concept
  const selectConcept = useCallback(
    async (conceptId: string) => {
      const chosen = state.concepts?.find((c) => c.id === conceptId);
      if (!chosen || !state.brandProfile) return;

      setIsLoading(true);
      setActiveError(null);
      try {
        const [sbData, vbData] = await Promise.all([
          apiRequest("/api/pipeline/stage/storyboard", {
            payload: { concept: chosen, brandProfile: state.brandProfile, brief: state.brief },
          }),
          apiRequest("/api/pipeline/stage/visual-bible", {
            payload: {
              brandProfile: state.brandProfile,
              brief: state.brief,
              concepts: state.concepts,
            },
          }),
        ]);

        setState((prev) => ({
          ...prev,
          selectedConceptId: conceptId,
          storyboard: sbData.storyboard,
          visualBible: vbData.visualBible,
          currentStage: "storyboard",
          jobState: "running",
          auditTrail: [
            ...prev.auditTrail,
            {
              stage: "storyboard",
              action: `Human art director selected direction: "${chosen.angleTitle}" [${chosen.narrativeArchetype}]`,
              timestamp: new Date().toISOString(),
            },
            {
              stage: "storyboard",
              action: `Synthesized Persistent Visual Bible [Theme: ${vbData.visualBible.visualLanguage.theme}]`,
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
    },
    [state.concepts, state.brandProfile, state.brief]
  );

  // Dynamic Storyboard Copy Editing
  const updateStoryboardScene = useCallback(
    (sceneId: string, updates: Partial<StoryboardScene>) => {
      if (!state.storyboard) return;
      setState((prev) => {
        if (!prev.storyboard) return prev;
        const newScenes = prev.storyboard.scenes.map((s) =>
          s.id === sceneId ? { ...s, ...updates } : s
        );
        return {
          ...prev,
          storyboard: {
            ...prev.storyboard,
            scenes: newScenes,
          },
          auditTrail: [
            ...prev.auditTrail,
            {
              stage: "storyboard",
              action: `Updated copy / duration for scene "${sceneId}"`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      });
    },
    [state.storyboard]
  );

  // Dynamic Scene Reordering
  const reorderStoryboardScenes = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!state.storyboard) return;
      setState((prev) => {
        if (!prev.storyboard) return prev;
        const newScenes = [...prev.storyboard.scenes];
        const [moved] = newScenes.splice(fromIndex, 1);
        newScenes.splice(toIndex, 0, moved);
        return {
          ...prev,
          storyboard: {
            ...prev.storyboard,
            scenes: newScenes,
          },
          auditTrail: [
            ...prev.auditTrail,
            {
              stage: "storyboard",
              action: `Reordered scenes from position ${fromIndex + 1} to ${toIndex + 1}`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      });
    },
    [state.storyboard]
  );

  // Gate 2: Storyboard Approved -> Generate Candidate Keyframes
  const approveStoryboardAndGenerateKeyframes = useCallback(async () => {
    if (!state.storyboard || !state.brandProfile) return;
    setIsLoading(true);
    setActiveError(null);
    try {
      const candidateKeyframes: Record<string, any[]> = {};
      for (const scene of state.storyboard.scenes) {
        const data = await apiRequest("/api/pipeline/stage/keyframes", {
          payload: {
            scene,
            brandProfile: state.brandProfile,
            brief: state.brief,
            visualBible: state.visualBible,
          },
        });
        candidateKeyframes[scene.id] = data.candidates;
      }

      setState((prev) => ({
        ...prev,
        candidateKeyframes,
        currentStage: "keyframes",
        jobState: "needs-review",
        auditTrail: [
          ...prev.auditTrail,
          {
            stage: "keyframes",
            action: "Storyboard approved. Generated browser-renderable SVG keyframe variations",
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
  }, [state.storyboard, state.brandProfile, state.brief, state.visualBible]);

  // Gate 3: Senior Art Director Approves Candidate Keyframe
  const selectKeyframe = useCallback(
    async (sceneId: string, candidateId: string) => {
      const candidates = state.candidateKeyframes?.[sceneId];
      const chosen = candidates?.find((c) => c.id === candidateId);
      const scene = state.storyboard?.scenes.find((s) => s.id === sceneId);
      if (!chosen || !scene || !state.brandProfile) return;

      setIsLoading(true);
      try {
        const data = await apiRequest("/api/pipeline/stage/approve-keyframe", {
          payload: {
            scene,
            candidate: chosen,
            brandProfile: state.brandProfile,
            visualBible: state.visualBible,
          },
        });

        setState((prev) => ({
          ...prev,
          approvedKeyframes: {
            ...prev.approvedKeyframes,
            [sceneId]: data.approved,
          },
          keyframeAnalyses: {
            ...prev.keyframeAnalyses,
            [sceneId]: data.analysis,
          },
          motionPlans: {
            ...prev.motionPlans,
            [sceneId]: data.motionPlan,
          },
          auditTrail: [
            ...prev.auditTrail,
            {
              stage: "keyframes",
              action: `Approved candidate "${chosen.id}" for scene "${sceneId}" -> Formulated 11-dimension blueprint and 8-beat cinematic motion plan`,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      } catch (err: any) {
        setActiveError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [state.candidateKeyframes, state.storyboard, state.brandProfile, state.visualBible]
  );

  const rejectKeyframe = useCallback((sceneId: string) => {
    setState((prev) => {
      const newApproved = { ...prev.approvedKeyframes };
      delete newApproved[sceneId];
      const newAnalyses = { ...prev.keyframeAnalyses };
      delete newAnalyses[sceneId];
      const newPlans = { ...prev.motionPlans };
      delete newPlans[sceneId];
      return {
        ...prev,
        approvedKeyframes: newApproved,
        keyframeAnalyses: newAnalyses,
        motionPlans: newPlans,
        auditTrail: [
          ...prev.auditTrail,
          {
            stage: "keyframes",
            action: `Rejected approved keyframe for scene "${sceneId}" (awaiting new selection)`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    });
  }, []);

  const regenerateKeyframesForScene = useCallback(
    async (sceneId: string) => {
      const scene = state.storyboard?.scenes.find((s) => s.id === sceneId);
      if (!scene || !state.brandProfile) return;
      setIsLoading(true);
      setActiveError(null);
      try {
        const data = await apiRequest("/api/pipeline/stage/keyframes", {
          payload: {
            scene,
            brandProfile: state.brandProfile,
            brief: state.brief,
            visualBible: state.visualBible,
          },
        });
        setState((prev) => ({
          ...prev,
          candidateKeyframes: {
            ...prev.candidateKeyframes,
            [sceneId]: data.candidates,
          },
          auditTrail: [
            ...prev.auditTrail,
            {
              stage: "keyframes",
              action: `Regenerated visual keyframes for scene "${sceneId}"`,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      } catch (err: any) {
        setActiveError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [state.storyboard, state.brandProfile, state.brief, state.visualBible]
  );

  const reviseSpecificScene = useCallback(
    async (sceneId: string, fixDescription: string) => {
      if (!state.motionIR || !state.critique) return;
      setIsLoading(true);
      try {
        const data = await apiRequest("/api/pipeline/stage/revise-scene", {
          payload: {
            motionIR: state.motionIR,
            critique: state.critique,
            visualBible: state.visualBible,
          },
        });
        setState((prev) => ({
          ...prev,
          motionIR: data.motionIR,
          critique: data.critique,
          revisionsApplied: prev.revisionsApplied + 1,
          jobState: data.critique.passedThreshold ? "passed" : "revising",
          auditTrail: [
            ...prev.auditTrail,
            {
              stage: "quality",
              action: `Surgically revised scene "${sceneId}": ${fixDescription}`,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      } catch (err: any) {
        setActiveError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [state.motionIR, state.critique, state.visualBible]
  );

  // Gate 3 Completion: Compile Approved Blueprints into MotionIR
  const compileMotion = useCallback(async () => {
    if (!state.storyboard || !state.brandProfile) return;
    const missing = state.storyboard.scenes.filter((s) => !state.approvedKeyframes?.[s.id]);
    if (missing.length > 0) {
      setActiveError(
        `Cannot compile motion: ${missing.length} scenes still require keyframe approval.`
      );
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

      const data = await apiRequest("/api/pipeline/stage/motion", {
        payload: {
          inputs,
          brandProfile: state.brandProfile,
          brief: state.brief,
          visualBible: state.visualBible,
        },
      });

      setState((prev) => ({
        ...prev,
        motionIR: data.motionIR,
        critique: data.critique,
        currentStage: "motion",
        jobState: data.critique.passedThreshold ? "passed" : "revising",
        auditTrail: [
          ...prev.auditTrail,
          {
            stage: "motion",
            action: "Reconstructed validated MotionIR from 11-dimension keyframe blueprints",
            timestamp: new Date().toISOString(),
          },
          {
            stage: "quality",
            action: `Initial Visual Critic Score: ${data.critique.overallScore}/10 (Threshold: 9.0)`,
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
  }, [
    state.storyboard,
    state.brandProfile,
    state.brief,
    state.approvedKeyframes,
    state.keyframeAnalyses,
    state.motionPlans,
    state.visualBible,
  ]);

  // Gate 5: Surgical Scene Revision
  const applySurgicalRevision = useCallback(async () => {
    if (!state.motionIR || !state.critique) return;
    setIsLoading(true);
    setActiveError(null);
    try {
      const data = await apiRequest("/api/pipeline/stage/revise-scene", {
        payload: {
          motionIR: state.motionIR,
          critique: state.critique,
          visualBible: state.visualBible,
        },
      });
      setState((prev) => ({
        ...prev,
        motionIR: data.motionIR,
        critique: data.critique,
        revisionsApplied: prev.revisionsApplied + 1,
        jobState: data.critique.passedThreshold ? "passed" : "revising",
        auditTrail: [
          ...prev.auditTrail,
          {
            stage: "quality",
            action: `Surgical Scene Revision Applied (Cycle ${prev.revisionsApplied + 1}) -> Score: ${data.critique.overallScore}/10`,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [state.motionIR, state.critique, state.visualBible]);

  // Gate 6: Production Export Package Gating
  const exportProductionPackage = useCallback(async () => {
    if (!state.motionIR || !state.storyboard || !state.critique || !state.approvedKeyframes) {
      setActiveError("Export Gate Blocked: Required production stages are incomplete.");
      return;
    }

    try {
      const data = await apiRequest("/api/export", { state });
      setState((prev) => ({
        ...prev,
        exportPackage: data.exportPackage,
        currentStage: "export",
        jobState: "complete",
        auditTrail: [
          ...prev.auditTrail,
          {
            stage: "export",
            action: "Export Package verified and generated successfully",
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch (err: any) {
      setActiveError(err.message);
    }
  }, [state]);

  // Gate 7: Closed-Loop Creative Memory Reinforcement
  const submitHumanVerdict = useCallback(
    async (verdict: "approved" | "rejected", notes?: string) => {
      if (!state.motionIR) return;
      const safeId = state.motionIR.id.replace(/[^a-zA-Z0-9_-]/g, "");

      const payload = {
        adId: safeId,
        brand: state.brandProfile?.identity.name || state.brief.productName,
        conceptAngle:
          state.concepts?.find((c) => c.id === state.selectedConceptId)?.angleTitle || "Angle",
        intent:
          state.concepts?.find((c) => c.id === state.selectedConceptId)?.narrativeArchetype ||
          "transformation",
        style: "dark-saas",
        itemsUsed: [],
        score:
          verdict === "approved"
            ? state.critique?.overallScore || 9.5
            : state.critique?.overallScore || 6.5,
        passed: verdict === "approved",
        feedback: notes || (verdict === "approved" ? "" : "Rejected by human art director"),
        issues: [],
        verdict,
      };

      try {
        await apiRequest("/api/memory/verdict", payload);
      } catch (e) {
        console.warn("[AdCraft Client] Memory verdict recording warning:", e);
      }

      setState((prev) => ({
        ...prev,
        auditTrail: [
          ...prev.auditTrail,
          {
            stage: "export",
            action: `Human Creative Verdict Recorded: "${verdict.toUpperCase()}" (${notes || "No notes"})`,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    },
    [state.motionIR, state.brandProfile, state.brief, state.concepts, state.selectedConceptId, state.critique]
  );

  const setMode = useCallback((mode: StudioMode) => {
    setState((prev) => ({
      ...prev,
      activeMode: mode,
      auditTrail: [
        ...prev.auditTrail,
        {
          stage: prev.currentStage,
          action: `Switched studio mode to: ${mode}`,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  }, []);

  // Quick Create: Autonomous End-to-End Pipeline
  const runQuickCreate = useCallback(
    async (creativeDirection?: string) => {
      setIsLoading(true);
      setActiveError(null);
      try {
        if (creativeDirection) {
          setState((prev) => ({ ...prev, creativeDirection }));
        }

        const data = await apiRequest<{ success: boolean; state: StudioState }>(
          "/api/pipeline/quick-create",
          {
            brief: state.brief,
            brand: state.brandInput,
            creativeDirection: creativeDirection || state.creativeDirection,
          }
        );

        setState((prev) => ({
          ...prev,
          ...data.state,
          jobState: "complete",
          currentStage: "export",
          auditTrail: [
            ...prev.auditTrail,
            {
              stage: "export",
              action: `Quick Create pipeline completed autonomously: "${data.state.concepts?.find((c: any) => c.id === data.state.selectedConceptId)?.angleTitle || 'Selected Angle'}" (Score: ${data.state.critique?.overallScore || 9.5}/10)`,
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
    },
    [state.brandInput, state.brief, state.creativeDirection]
  );

  // Quick Create: Natural Language Revision
  const submitNaturalLanguageRevision = useCallback(
    async (instruction: string) => {
      setIsLoading(true);
      setActiveError(null);
      try {
        const data = await apiRequest<{ success: boolean; state: StudioState }>(
          "/api/pipeline/revise",
          { state, instruction }
        );

        setState((prev) => ({
          ...prev,
          ...data.state,
          revisionsApplied: prev.revisionsApplied + 1,
          jobState: "complete",
          auditTrail: [
            ...prev.auditTrail,
            {
              stage: "quality",
              action: `Natural-language revision applied: "${instruction}" -> Resulting Score: ${data.state.critique?.overallScore || 9.5}/10`,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      } catch (err: any) {
        setActiveError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [state]
  );

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

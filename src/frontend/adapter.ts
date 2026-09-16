import { useState, useCallback, useEffect } from "react";
import type { CampaignBrief } from "../ai/types";
import type { BrandInput } from "../ingestion";
import type {
  CapabilityStatus,
  StudioState,
} from "../studio/types";

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

export type PipelineLog = {
  id: string;
  sender: "AdCraft" | "System" | "User";
  text: string;
  timestamp: number;
};

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
    auditTrail: [],
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [pipelineLogs, setPipelineLogs] = useState<PipelineLog[]>([]);

  const pushLog = useCallback((sender: PipelineLog["sender"], text: string) => {
    setPipelineLogs((prev) => [
      ...prev,
      { id: `log-${Date.now()}-${Math.random()}`, sender, text, timestamp: Date.now() },
    ]);
  }, []);

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

  const updateBrief = useCallback((updates: Partial<CampaignBrief>) => {
    setState((prev) => ({
      ...prev,
      brief: { ...prev.brief, ...updates },
    }));
  }, []);

  const runPipelineStepByStep = useCallback(
    async (creativeDirection?: string) => {
      setIsLoading(true);
      setActiveError(null);
      
      let currentState = { ...state };
      if (creativeDirection) {
        currentState.creativeDirection = creativeDirection;
      }
      
      try {
        setState((prev) => ({ ...prev, jobState: "running" }));
        pushLog("User", `Create an ad for ${currentState.brief.productName}: ${currentState.brief.productDescription}`);
        
        // 1. Brief
        pushLog("AdCraft", "Analyzing your brand and campaign brief...");
        const brandRes = await apiRequest("/api/pipeline/stage/brief", { payload: { brand: currentState.brandInput, brief: currentState.brief } });
        currentState.brandProfile = brandRes.brandProfile;
        setState((prev) => ({ ...prev, brandProfile: currentState.brandProfile, currentStage: "brief" }));
        pushLog("System", "✓ Brand information understood");
        
        // 2. Concepts
        pushLog("AdCraft", "Developing creative directions...");
        const conceptsRes = await apiRequest("/api/pipeline/stage/concepts", { payload: { brandProfile: currentState.brandProfile, brief: currentState.brief } });
        currentState.concepts = conceptsRes.concepts;
        currentState.selectedConceptId = currentState.concepts![0].id;
        
        // Auto-approve concept for the demo workflow
        currentState.auditTrail = [
          ...(currentState.auditTrail || []),
          { stage: "concepts", action: "User selected direction", timestamp: new Date().toISOString() }
        ];

        setState((prev) => ({ ...prev, concepts: currentState.concepts, selectedConceptId: currentState.selectedConceptId, auditTrail: currentState.auditTrail, currentStage: "concepts" }));
        pushLog("System", `✓ ${currentState.concepts!.length} creative directions developed`);

        // 3. Visual Bible
        pushLog("AdCraft", "Synthesizing visual bible...");
        const enrichedBrief = creativeDirection ? { ...currentState.brief, constraints: [...(currentState.brief.constraints || []), `Creative Direction: ${creativeDirection}`] } : currentState.brief;
        const bibleRes = await apiRequest("/api/pipeline/stage/visual-bible", { payload: { brandProfile: currentState.brandProfile, brief: enrichedBrief, concepts: currentState.concepts } });
        const visualBible = bibleRes.visualBible;
        setState((prev) => ({ ...prev, currentStage: "visual-bible" }));
        pushLog("System", "✓ Visual rules established");

        // 4. Storyboard
        pushLog("AdCraft", "Building the storyboard...");
        const topConcept = currentState.concepts!.find(c => c.id === currentState.selectedConceptId)!;
        const sbRes = await apiRequest("/api/pipeline/stage/storyboard", { payload: { concept: topConcept, brandProfile: currentState.brandProfile, brief: enrichedBrief } });
        currentState.storyboard = sbRes.storyboard;
        
        // Auto-approve storyboard for the demo workflow
        currentState.auditTrail = [
          ...(currentState.auditTrail || []),
          { stage: "storyboard", action: "Storyboard approved", timestamp: new Date().toISOString() }
        ];

        setState((prev) => ({ ...prev, storyboard: currentState.storyboard, auditTrail: currentState.auditTrail, currentStage: "storyboard" }));
        pushLog("System", `✓ Storyboard complete (${currentState.storyboard!.scenes.length} scenes)`);

        // 5. Keyframes & Motion
        pushLog("AdCraft", "Generating keyframes and analyzing motion...");
        currentState.candidateKeyframes = {};
        currentState.approvedKeyframes = {};
        currentState.keyframeAnalyses = {};
        currentState.motionPlans = {};
        
        for(let i = 0; i < currentState.storyboard!.scenes.length; i++) {
           const scene = currentState.storyboard!.scenes[i];
           pushLog("System", `⟳ Working on scene ${i+1} of ${currentState.storyboard!.scenes.length}`);
           
           const kfRes = await apiRequest("/api/pipeline/stage/keyframes", { payload: { scene, brandProfile: currentState.brandProfile, brief: enrichedBrief, visualBible } });
           currentState.candidateKeyframes[scene.id] = kfRes.candidates;
           
           const candidate = kfRes.candidates[0];
           const approveRes = await apiRequest("/api/pipeline/stage/approve-keyframe", { payload: { scene, candidate, brandProfile: currentState.brandProfile, visualBible } });
           
           currentState.approvedKeyframes[scene.id] = approveRes.approved;
           currentState.keyframeAnalyses[scene.id] = approveRes.analysis;
           currentState.motionPlans[scene.id] = approveRes.motionPlan;
           
           setState((prev) => ({ 
             ...prev, 
             candidateKeyframes: currentState.candidateKeyframes,
             approvedKeyframes: currentState.approvedKeyframes,
             currentStage: "keyframes"
           }));
        }
        
        pushLog("System", "✓ Keyframes generated and approved");
        
        // 6. MotionIR
        pushLog("AdCraft", "Reconstructing MotionIR for rendering...");
        const inputs = currentState.storyboard!.scenes.map((scene) => ({
          scene,
          analysis: currentState.keyframeAnalyses![scene.id],
          motionPlan: currentState.motionPlans![scene.id],
        }));
        
        const motionRes = await apiRequest("/api/pipeline/stage/motion", { payload: { inputs, brandProfile: currentState.brandProfile, brief: enrichedBrief, visualBible } });
        currentState.motionIR = motionRes.motionIR;
        currentState.critique = motionRes.critique;
        setState((prev) => ({ ...prev, motionIR: currentState.motionIR, critique: currentState.critique, currentStage: "motion" }));
        
        if (!currentState.critique!.passedThreshold && currentState.critique!.overallScore < 9.0) {
           pushLog("AdCraft", `Quality score ${currentState.critique!.overallScore}/10. Running surgical revision...`);
           const reviseRes = await apiRequest("/api/pipeline/stage/revise-scene", { payload: { motionIR: currentState.motionIR, critique: currentState.critique, visualBible } });
           currentState.motionIR = reviseRes.motionIR;
           currentState.critique = reviseRes.critique;
           setState((prev) => ({ ...prev, motionIR: currentState.motionIR, critique: currentState.critique }));
        }
        
        pushLog("System", "✓ Motion compiled");
        
        // 7. Export
        pushLog("AdCraft", "Finalizing export package...");
        const exportRes = await apiRequest("/api/export", { state: currentState });
        currentState.exportPackage = exportRes.exportPackage;
        
        setState((prev) => ({
          ...prev,
          exportPackage: currentState.exportPackage,
          jobState: "complete",
          currentStage: "export",
        }));
        
        pushLog("System", "✓ Advertisement ready");
        
        return currentState;
      } catch (err: any) {
        setActiveError(err.message);
        pushLog("System", `Error: ${err.message}`);
        setState((prev) => ({ ...prev, jobState: "failed", errorMessage: err.message }));
      } finally {
        setIsLoading(false);
      }
    },
    [state, pushLog]
  );

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
        }));
        return data.state;
      } catch (err: any) {
        setActiveError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [state]
  );

  const resetEngine = useCallback(() => {
    setState((prev) => ({
      ...prev,
      jobState: "draft",
      currentStage: "brief",
      concepts: undefined,
      storyboard: undefined,
      candidateKeyframes: undefined,
      approvedKeyframes: undefined,
      motionIR: undefined,
      critique: undefined,
      exportPackage: undefined,
      auditTrail: [],
      errorMessage: undefined,
    }));
    setPipelineLogs([]);
    setActiveError(null);
  }, []);

  return {
    state,
    isLoading,
    activeError,
    pipelineLogs,
    pushLog,
    runPipelineStepByStep,
    submitNaturalLanguageRevision,
    updateBrief,
    resetEngine,
  };
}

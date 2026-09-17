import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { BrandInput } from "../ingestion";
import { CampaignBrief } from "../ai/types";
import { MotionIR } from "../schema";
import {
  ApprovedKeyframe,
  ArtDirector,
  BrandAnalyst,
  BrandProfile,
  CandidateKeyframe,
  ConceptStrategist,
  CreativeConcept,
  CritiqueResult,
  KeyframeAnalysis,
  KeyframeAnalyzer,
  KeyframeCritic,
  MotionIRCompiler,
  MotionIRReconstructor,
  MotionPlan,
  ReconstructedSceneInput,
  SceneReviser,
  Storyboard,
  StoryboardArchitect,
  TemporalChoreographer,
  VisualBible,
  VisualBibleArchitect,
  VisualCritic,
  VisualKeyframeGenerator,
} from "../stages";
export * from "../stages";
export * from "../technique-bank";
export * from "../creative-memory";
import { creativeMemory, SessionOutcome } from "../creative-memory";

const execAsync = promisify(exec);

export interface GenerateAdOptions {
  brand: BrandInput;
  brief: CampaignBrief;
  outputPath?: string;
  skipRender?: boolean;
  skipCritique?: boolean;
  qualityThreshold?: number; // default 9.0
  maxRevisions?: number; // default 2
}

export interface GenerateStudioAdResult {
  brandProfile: BrandProfile;
  conceptCandidates: CreativeConcept[];
  selectedConcept: CreativeConcept;
  storyboard: Storyboard;
  candidateKeyframes?: Record<string, CandidateKeyframe[]>;
  approvedKeyframes?: Record<string, ApprovedKeyframe>;
  keyframeAnalyses?: Record<string, KeyframeAnalysis>;
  motionPlans?: Record<string, MotionPlan>;
  visualBible?: VisualBible;
  motionIR: MotionIR;
  critique: CritiqueResult;
  revisionsApplied: number;
  jsonPath: string;
  videoPath?: string;
}

export class AdPipeline {
  private brandAnalyst = new BrandAnalyst();
  private conceptStrategist = new ConceptStrategist();
  private storyboardArchitect = new StoryboardArchitect();
  private keyframeGenerator = new VisualKeyframeGenerator();
  private keyframeCritic = new KeyframeCritic();
  private keyframeAnalyzer = new KeyframeAnalyzer();
  private temporalChoreographer = new TemporalChoreographer();
  private reconstructor = new MotionIRReconstructor();
  private artDirector = new ArtDirector();
  private compiler = new MotionIRCompiler();
  private visualCritic = new VisualCritic();
  private sceneReviser = new SceneReviser();
  private visualBibleArchitect = new VisualBibleArchitect();

  /**
   * Complete Visual-First Creative Studio Pipeline:
   * Creative Direction -> Storyboard -> Static Keyframe Generation ->
   * Visual Critique -> Approved Keyframe -> Keyframe Analysis (11 dimensions) ->
   * Temporal Choreography (MotionPlan) -> MotionIR Reconstruction ->
   * Motion Critique & Revision -> Animation & Render
   */
  async generateAd(options: GenerateAdOptions): Promise<GenerateStudioAdResult> {
    console.log(`\n======================================================`);
    console.log(`🎬 [AdCraft Creative Studio] Launching Campaign Production`);
    console.log(`   Product:   ${options.brand.name || options.brief.productName}`);
    console.log(`   Goal:      ${options.brief.goal}`);
    console.log(`======================================================\n`);

    // 1. Brand Understanding (Voice, Positioning, Audience)
    const brandProfile = await this.brandAnalyst.analyze(options.brand, options.brief);
    console.log(`✅ [1/8] Brand Intelligence Established:`);
    console.log(`   Tone: "${brandProfile.voice.tone}" | Differentiator: "${brandProfile.positioning.differentiator}"`);

    // 2. Creative Concept Strategy (3 distinct options -> best selected automatically)
    const { concepts, selectedConcept } = await this.conceptStrategist.developConcepts(
      brandProfile,
      options.brief
    );
    console.log(`✅ [2/8] Creative Concept Selected:`);
    console.log(`   Angle: "${selectedConcept.angleTitle}" (Score: ${selectedConcept.strategicScore}/10)`);
    console.log(`   Hook:  "${selectedConcept.hook}"`);

    // 2b. Persistent Visual Bible Synthesis (Governs all subsequent scenes and assets)
    const visualBible = await this.visualBibleArchitect.synthesizeVisualBible(
      brandProfile,
      options.brief,
      selectedConcept
    );
    console.log(`✅ [Visual Bible] Synthesized 7-Dimension Persistent Style Bible:`);
    console.log(`   Theme: "${visualBible.visualLanguage.theme}" | Baseline Space: ${(visualBible.visualLanguage.negativeSpaceBaseline * 100).toFixed(0)}%`);
    console.log(`   Typography: "${visualBible.typographySystem.headlineFont}" | Shot: "${visualBible.cameraLanguage.primaryShotPhilosophy}"`);

    // 3. Storyboard Architecture (Mandatory Narrative Arc Stage)
    const storyboard = await this.storyboardArchitect.designStoryboard(
      selectedConcept,
      brandProfile,
      options.brief
    );
    console.log(`✅ [3/8] Narrative Storyboard Blueprinted:`);
    console.log(`   Arc: "${storyboard.narrativeArc}"`);
    console.log(`   Scenes: ${storyboard.scenes.length} narrative beats | Pacing: "${storyboard.pacingStrategy}"`);

    // 4. Static Keyframe Generation, Critique & 11-Dimension Analysis
    console.log(`🎨 [4/8] Generating visual candidate keyframes for ${storyboard.scenes.length} scenes...`);
    const candidateKeyframes: Record<string, CandidateKeyframe[]> = {};
    const approvedKeyframes: Record<string, ApprovedKeyframe> = {};
    const keyframeAnalyses: Record<string, KeyframeAnalysis> = {};
    const motionPlans: Record<string, MotionPlan> = {};
    const reconstructedInputs: ReconstructedSceneInput[] = [];

    const fps = 30;

    for (const scene of storyboard.scenes) {
      // 4a. Candidate keyframe synthesis (AI Art-Direction Engine)
      const candidates = await this.keyframeGenerator.generateKeyframesForScene(
        scene,
        brandProfile,
        options.brief,
        {},
        visualBible
      );
      candidateKeyframes[scene.id] = candidates;

      // 4b. Senior Art Director Keyframe Visual Critique & Gate
      const approved = this.keyframeCritic.selectAndApproveKeyframe(
        candidates,
        scene,
        brandProfile
      );
      approvedKeyframes[scene.id] = approved;

      // 4c. 11-Dimension Visual Analysis
      const analysis = this.keyframeAnalyzer.analyzeApprovedKeyframe(
        approved,
        scene,
        brandProfile
      );
      keyframeAnalyses[scene.id] = analysis;

      // 4d. Temporal Choreography & MotionPlan
      const motionPlan = this.temporalChoreographer.createMotionPlan(
        scene,
        analysis,
        approved,
        brandProfile,
        fps,
        visualBible
      );
      motionPlans[scene.id] = motionPlan;

      reconstructedInputs.push({ scene, analysis, motionPlan });
    }
    console.log(`✅ [4/8] Static Keyframes Generated, Critiqued (>=9.0 Gate), Analyzed & Temporal MotionPlans Choreographed.`);

    // 5. MotionIR Reconstruction from 11-Dimension Visual Blueprint
    console.log(`📐 [5/8] Reconstructing MotionIR from 11-dimension keyframe blueprints...`);
    let motionIR = this.reconstructor.reconstructMotionIR(
      reconstructedInputs,
      brandProfile,
      options.brief,
      fps,
      visualBible
    );
    console.log(`✅ [5/8] MotionIR Specification Reconstructed & Validated against Keyframe Blueprint.`);

    // 6. Motion & Visual Critique Quality Gate (Threshold: 9.0/10)
    let critique = this.visualCritic.critique(motionIR, visualBible);
    let revisionsApplied = 0;
    const maxRevisions = options.maxRevisions ?? 2;

    while (critique.revisionRequired && revisionsApplied < maxRevisions && !options.skipCritique) {
      revisionsApplied++;
      console.log(`⚠️ Quality threshold (9.0/10) not met (Score: ${critique.overallScore}). Starting Revision Cycle ${revisionsApplied}/${maxRevisions}...`);
      motionIR = this.sceneReviser.revise(motionIR, critique);
      critique = this.visualCritic.critique(motionIR, visualBible);
    }

    if (critique.passedThreshold) {
      console.log(`🎉 [6/8] Quality Gate Passed! Final Critique Score: ${critique.overallScore}/10.`);
    } else {
      console.warn(`⚠️ Ad shipped with warnings. Final Critique Score: ${critique.overallScore}/10.`);
    }

    // 7. Save MotionIR and Storyboard Artifacts
    const outDir = path.resolve(process.cwd(), "out");
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const safeId = motionIR.id.replace(/[^a-zA-Z0-9_-]/g, "");
    const jsonPath = path.join(outDir, `${safeId}.json`);
    const storyboardPath = path.join(outDir, `${safeId}-storyboard.json`);

    fs.writeFileSync(jsonPath, JSON.stringify(motionIR, null, 2), "utf-8");
    fs.writeFileSync(
      storyboardPath,
      JSON.stringify(
        {
          brandProfile,
          selectedConcept,
          storyboard,
          candidateKeyframes,
          approvedKeyframes,
          keyframeAnalyses,
          critique,
        },
        null,
        2
      ),
      "utf-8"
    );
    console.log(`✅ [7/8] Production Assets Saved:`);
    console.log(`   MotionIR:   ${jsonPath}`);
    console.log(`   Storyboard: ${storyboardPath}`);

    // Render MP4 Video if requested
    let videoPath: string | undefined = undefined;
    if (!options.skipRender) {
      videoPath = options.outputPath || path.join(outDir, `${safeId}.mp4`);
      console.log(`🎬 [8/8] Rendering final production MP4 to ${videoPath}...`);

      const cmd = `npx remotion render src/index.ts AdComposition "${videoPath}" --props="${jsonPath}"`;
      try {
        await execAsync(cmd);
        console.log(`🎉 Render completed: ${videoPath}`);
      } catch (renderErr: any) {
        console.error(`❌ Remotion render failed:`, renderErr.message);
        throw renderErr;
      }
    } else {
      console.log(`⏭️ [8/8] Skipping MP4 video render.`);
    }

    // Closed-Loop Outcome Learning: Record outcome in Creative Memory
    const allUsedMemoryItemIds: string[] = [];
    for (const s of motionIR.scenes) {
      if (s.usedMemoryItemIds) {
        for (const id of s.usedMemoryItemIds) {
          if (!allUsedMemoryItemIds.includes(id)) allUsedMemoryItemIds.push(id);
        }
      }
    }

    const allIssues = critique.scenes.flatMap((s) => s.issues || []);

    const outcome: SessionOutcome = {
      id: safeId,
      brand: brandProfile.identity.name,
      conceptAngle: selectedConcept.angleTitle,
      intent: selectedConcept.narrativeArchetype,
      style: (brandProfile.identity.theme as any) || "dark-saas",
      itemsUsed: allUsedMemoryItemIds,
      critiqueOverallScore: critique.overallScore,
      critiquePassed: critique.passedThreshold,
      critiqueIssues: allIssues.map((iss) => ({
        sceneId: iss.sceneId,
        category: iss.category,
        severity: iss.severity,
        description: iss.description,
      })),
      userVerdict: "unreviewed",
      timestamp: new Date().toISOString(),
    };
    creativeMemory.recordOutcome(outcome);

    return {
      brandProfile,
      conceptCandidates: concepts,
      selectedConcept,
      storyboard,
      candidateKeyframes,
      approvedKeyframes,
      keyframeAnalyses,
      motionPlans,
      visualBible,
      motionIR,
      critique,
      revisionsApplied,
      jsonPath,
      videoPath,
    };
  }

  /**
   * Closed-loop Human Feedback: Approve ad and reinforce successful creative vocabulary
   */
  approveAd(outcomeId: string, notes?: string): void {
    const existing = creativeMemory.getOutcomes().find((o) => o.id === outcomeId);
    if (existing) {
      creativeMemory.recordOutcome({
        ...existing,
        userVerdict: "approved",
        userFeedbackNotes: notes,
      });
      console.log(`🧠 [Creative Memory] Human Approval Recorded for ${outcomeId}: Vocabulary affinity boosted.`);
    }
  }

  /**
   * Closed-loop Human Feedback: Reject ad, penalize failed combinations, and register failure modes
   */
  rejectAd(outcomeId: string, failureNotes: string): void {
    const existing = creativeMemory.getOutcomes().find((o) => o.id === outcomeId);
    if (existing) {
      creativeMemory.recordOutcome({
        ...existing,
        userVerdict: "rejected",
        userFeedbackNotes: failureNotes,
      });
      console.log(`🧠 [Creative Memory] Human Rejection Recorded for ${outcomeId}: Learned failure mode "${failureNotes}".`);
    }
  }
}

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { BrandInput } from "../ingestion";
import { CampaignBrief } from "../ai/types";
import { MotionIR } from "../schema";
import {
  ArtDirector,
  BrandAnalyst,
  BrandProfile,
  ConceptStrategist,
  CreativeConcept,
  CritiqueResult,
  MotionIRCompiler,
  SceneReviser,
  Storyboard,
  StoryboardArchitect,
  VisualCritic,
} from "../stages";

const execAsync = promisify(exec);

export interface GenerateAdOptions {
  brand: BrandInput;
  brief: CampaignBrief;
  outputPath?: string;
  skipRender?: boolean;
  skipCritique?: boolean;
  qualityThreshold?: number; // default 7.0
  maxRevisions?: number; // default 2
}

export interface GenerateStudioAdResult {
  brandProfile: BrandProfile;
  conceptCandidates: CreativeConcept[];
  selectedConcept: CreativeConcept;
  storyboard: Storyboard;
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
  private artDirector = new ArtDirector();
  private compiler = new MotionIRCompiler();
  private visualCritic = new VisualCritic();
  private sceneReviser = new SceneReviser();

  /**
   * Complete 10-stage autonomous creative studio pipeline:
   * Brief -> Brand Understanding -> Concept Strategy -> Storyboard ->
   * Copy & Art Direction -> MotionIR Compilation -> Render -> Visual Critique -> Revision Loop -> Final Ad
   */
  async generateAd(options: GenerateAdOptions): Promise<GenerateStudioAdResult> {
    console.log(`\n======================================================`);
    console.log(`🎬 [AdCraft Creative Studio] Launching Campaign Production`);
    console.log(`   Product:   ${options.brand.name || options.brief.productName}`);
    console.log(`   Goal:      ${options.brief.goal}`);
    console.log(`======================================================\n`);

    // 1. Brand Understanding (Voice, Positioning, Audience)
    const brandProfile = await this.brandAnalyst.analyze(options.brand, options.brief);
    console.log(`✅ [1/7] Brand Intelligence Established:`);
    console.log(`   Tone: "${brandProfile.voice.tone}" | Differentiator: "${brandProfile.positioning.differentiator}"`);

    // 2. Creative Concept Strategy (3 distinct options -> best selected automatically)
    const { concepts, selectedConcept } = await this.conceptStrategist.developConcepts(
      brandProfile,
      options.brief
    );
    console.log(`✅ [2/7] Creative Concept Selected:`);
    console.log(`   Angle: "${selectedConcept.angleTitle}" (Score: ${selectedConcept.strategicScore}/10)`);
    console.log(`   Hook:  "${selectedConcept.hook}"`);

    // 3. Storyboard Architecture (Mandatory Internal Creative Stage)
    const storyboard = await this.storyboardArchitect.designStoryboard(
      selectedConcept,
      brandProfile,
      options.brief
    );
    console.log(`✅ [3/7] Narrative Storyboard Blueprinted:`);
    console.log(`   Arc: "${storyboard.narrativeArc}"`);
    console.log(`   Scenes: ${storyboard.scenes.length} narrative beats | Pacing: "${storyboard.pacingStrategy}"`);

    // 4. Copy & Art Direction (Visual hierarchy, typography, backgrounds)
    const artDirectedScenes = this.artDirector.direct(storyboard, brandProfile, options.brief);
    console.log(`✅ [4/7] Art Direction Completed for ${artDirectedScenes.length} scenes.`);

    // 5. MotionIR Compilation (Deterministic compilation to renderable specification)
    let motionIR = this.compiler.compile(artDirectedScenes, brandProfile, options.brief);
    console.log(`✅ [5/7] MotionIR Specification Compiled & Validated.`);

    // 6. Visual Critique & Quality Gate (Threshold: 7/10)
    let critique = this.visualCritic.critique(motionIR);
    let revisionsApplied = 0;
    const maxRevisions = options.maxRevisions ?? 2;

    while (critique.revisionRequired && revisionsApplied < maxRevisions && !options.skipCritique) {
      revisionsApplied++;
      console.log(`⚠️ Quality threshold (7/10) not met (Score: ${critique.overallScore}). Starting Revision Cycle ${revisionsApplied}/${maxRevisions}...`);
      motionIR = this.sceneReviser.revise(motionIR, critique);
      critique = this.visualCritic.critique(motionIR);
    }

    if (critique.passedThreshold) {
      console.log(`🎉 [6/7] Quality Gate Passed! Final Critique Score: ${critique.overallScore}/10.`);
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
      JSON.stringify({ brandProfile, selectedConcept, storyboard, critique }, null, 2),
      "utf-8"
    );
    console.log(`✅ [7/7] Production Assets Saved:`);
    console.log(`   MotionIR:   ${jsonPath}`);
    console.log(`   Storyboard: ${storyboardPath}`);

    // Render MP4 Video if requested
    let videoPath: string | undefined = undefined;
    if (!options.skipRender) {
      videoPath = options.outputPath || path.join(outDir, `${safeId}.mp4`);
      console.log(`🎬 Rendering final production MP4 to ${videoPath}...`);

      const cmd = `npx remotion render src/index.ts AdComposition "${videoPath}" --props="${jsonPath}"`;
      try {
        await execAsync(cmd);
        console.log(`🎉 Render completed: ${videoPath}`);
      } catch (renderErr: any) {
        console.error(`❌ Remotion render failed:`, renderErr.message);
        throw renderErr;
      }
    } else {
      console.log(`⏭️ Skipping MP4 video render.`);
    }

    return {
      brandProfile,
      conceptCandidates: concepts,
      selectedConcept,
      storyboard,
      motionIR,
      critique,
      revisionsApplied,
      jsonPath,
      videoPath,
    };
  }
}

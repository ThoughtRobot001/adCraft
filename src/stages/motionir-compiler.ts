import { MotionIR, MotionIRSchema } from "../schema";
import { CampaignBrief } from "../ai/types";
import { ArtDirectedScene, BrandProfile } from "./types";

export class MotionIRCompiler {
  compile(
    scenes: ArtDirectedScene[],
    profile: BrandProfile,
    brief: CampaignBrief
  ): MotionIR {
    console.log("⚙️ [Stage 5/7 - MotionIR Compiler] Compiling art-directed scenes into MotionIR specification...");

    const fps = 30;
    const width = brief.aspectRatio === "16:9" ? 1920 : 1080;
    const height = brief.aspectRatio === "16:9" ? 1080 : 1920;

    const brandNameClean = profile.identity.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const id = `${brandNameClean}-studio-ad-${Date.now()}`;

    const rawIR = {
      id,
      meta: {
        title: `${profile.identity.name} - ${brief.goal} Campaign`,
        fps,
        width,
        height,
      },
      brand: profile.identity,
      scenes: scenes.map((s, idx) => ({
        id: s.storyboardScene.id || `scene-${idx + 1}`,
        name: s.storyboardScene.name,
        durationFrames: Math.round((s.storyboardScene.durationSeconds || 3.5) * fps),
        background: s.background,
        elements: s.elements,
        transition: s.transition,
      })),
    };

    // Strict validation against MotionIRSchema
    return MotionIRSchema.parse(rawIR);
  }
}

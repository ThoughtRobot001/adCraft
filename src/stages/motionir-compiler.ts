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
    const aspectRatio = brief.aspectRatio || "16:9";
    const width = aspectRatio === "9:16" ? 1080 : aspectRatio === "1:1" ? 1080 : 1920;
    const height = aspectRatio === "9:16" ? 1920 : aspectRatio === "1:1" ? 1080 : 1080;

    const brandNameClean = profile.identity.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const id = `${brandNameClean}-studio-ad-${Date.now()}`;

    const visualKit = scenes[0]?.visualKit;

    const rawIR = {
      id,
      meta: {
        title: `${profile.identity.name} - ${brief.goal} Campaign`,
        fps,
        width,
        height,
        aspectRatio,
      },
      brand: profile.identity,
      visualKit,
      scenes: scenes.map((s, idx) => ({
        id: s.storyboardScene.id || `scene-${idx + 1}`,
        name: s.storyboardScene.name,
        durationFrames: Math.round((s.storyboardScene.durationSeconds || 3.5) * fps),
        background: s.background,
        elements: s.elements,
        transition: s.transition,
        camera: s.camera,
        atmosphere: s.atmosphere,
        heroElementId: s.heroElementId,
        backgroundAssetId: s.backgroundAssetId || visualKit?.backgroundAssetId,
        atmosphereAssetId: s.atmosphereAssetId || visualKit?.atmosphereAssetId,
        visualKitId: visualKit?.id,
        layoutStrategy: s.layoutStrategy,
        usedMemoryItemIds: s.usedMemoryItemIds || [],
      })),
    };

    // Strict validation against MotionIRSchema
    return MotionIRSchema.parse(rawIR);
  }
}

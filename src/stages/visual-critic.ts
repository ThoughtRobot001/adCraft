import { MotionIR } from "../schema";
import { CritiqueIssue, CritiqueResult, SceneCritique } from "./types";

export class VisualCritic {
  private qualityThreshold = 7.0;

  critique(motionIR: MotionIR): CritiqueResult {
    console.log("🧐 [Stage 6/7 - Visual Critic] Evaluating motion design quality, pacing & composition...");

    const sceneCritiques: SceneCritique[] = [];
    const globalIssues: CritiqueIssue[] = [];

    let totalScore = 0;

    for (const scene of motionIR.scenes) {
      const issues: CritiqueIssue[] = [];
      let sceneScore = 9.5; // Start with high bar, deduct for design flaws

      // 0. Empty Scene Detection (Fatal)
      if (scene.elements.length === 0) {
        sceneScore -= 8.0;
        issues.push({
          sceneId: scene.id,
          category: "empty-scene",
          severity: "critical",
          description: `Scene contains 0 elements, resulting in a blank dead frame.`,
          suggestedFix: "Populate scene with hero copy and visual anchor primitive.",
        });
      }

      // 1. Pacing Evaluation
      const durationSeconds = scene.durationFrames / (motionIR.meta.fps || 30);
      if (durationSeconds < 2.0) {
        sceneScore -= 2.0;
        issues.push({
          sceneId: scene.id,
          category: "pacing",
          severity: "major",
          description: `Scene duration (${durationSeconds.toFixed(1)}s) is too fast for viewer comprehension.`,
          suggestedFix: "Increase duration to at least 2.5s (75 frames).",
        });
      } else if (durationSeconds > 6.0) {
        sceneScore -= 1.5;
        issues.push({
          sceneId: scene.id,
          category: "pacing",
          severity: "minor",
          description: `Scene duration (${durationSeconds.toFixed(1)}s) risks losing viewer momentum.`,
          suggestedFix: "Trim scene to 3.5s - 4.5s for tighter retention.",
        });
      }

      // 2. Element Crowding & Density (excluding transparent overlays & ambient VFX)
      const contentElements = scene.elements.filter(
        (el) => el.type !== "cursor-interaction" && el.type !== "particle-tunnel"
      );
      if (contentElements.length > 4) {
        sceneScore -= 2.0;
        issues.push({
          sceneId: scene.id,
          category: "crowding",
          severity: "major",
          description: `Scene contains ${contentElements.length} content elements, causing visual clutter in mobile viewport.`,
          suggestedFix: "Consolidate or remove supporting elements to keep focus on the hero message.",
        });
      }

      // 3. Typography & Hierarchy Evaluation
      for (const el of scene.elements) {
        if (el.type === "kinetic-text") {
          const fontSize = el.props.fontSize || 48;
          if (motionIR.meta.height === 1920 && fontSize < 42) {
            sceneScore -= 1.5;
            issues.push({
              sceneId: scene.id,
              category: "readability",
              severity: "major",
              description: `Font size (${fontSize}px) is too small for vertical 9:16 mobile headline.`,
              suggestedFix: "Increase headline font size to 58px - 72px.",
            });
          }
        }
      }

      // 4. Overlap Detection (Check Y positions)
      const positions = scene.elements
        .map((el) => (el.props as any).position?.y)
        .filter((y) => typeof y === "number");

      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          if (Math.abs(positions[i] - positions[j]) < 12) {
            sceneScore -= 1.8;
            issues.push({
              sceneId: scene.id,
              category: "visual-hierarchy",
              severity: "critical",
              description: `Elements at Y:${positions[i]}% and Y:${positions[j]}% are dangerously close, risking overlap.`,
              suggestedFix: "Separate element Y positions by at least 18%.",
            });
          }
        }
      }

      const finalSceneScore = Math.max(1.0, Math.min(10.0, parseFloat(sceneScore.toFixed(1))));
      totalScore += finalSceneScore;

      sceneCritiques.push({
        sceneId: scene.id,
        score: finalSceneScore,
        notes: issues.length === 0 ? "Flawless hierarchy, pacing, and visual balance." : `${issues.length} design issues flagged.`,
        issues,
      });
    }

    const overallScore = parseFloat((totalScore / motionIR.scenes.length).toFixed(1));
    const passedThreshold = overallScore >= this.qualityThreshold;
    const allIssues = sceneCritiques.flatMap((s) => s.issues);

    console.log(`📊 [Visual Critic] Score: ${overallScore}/10 (Threshold: ${this.qualityThreshold}/10) -> ${passedThreshold ? "PASSED ✅" : "REVISION REQUIRED ⚠️"}`);
    if (!passedThreshold) {
      console.log(`   Flagged ${allIssues.length} issues needing surgical revision.`);
    }

    return {
      overallScore,
      passedThreshold,
      scenes: sceneCritiques,
      summary: passedThreshold
        ? "Ad meets all motion design quality, typography readability, and pacing benchmarks."
        : "Ad falls below the 7/10 quality bar and requires scene-level design revision.",
      revisionRequired: !passedThreshold,
    };
  }
}

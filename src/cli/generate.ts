import { AdPipeline } from "../pipeline";
import { CampaignGoal } from "../ai";
import { loadEnv } from "../utils/env";

loadEnv();

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "true";
      parsed[key] = val;
    }
  }
  return parsed;
}

async function main() {
  const flags = parseArgs();

  const brandName = flags.name || "Linear";
  const websiteUrl = flags.url || (flags.name ? undefined : "https://linear.app");
  const tagline = flags.tagline || "The Issue Tracker Built for High-Performance Teams";
  const goal = (flags.goal as CampaignGoal) || "free_trial";
  const primaryColor = flags.color || flags.primary || "#5E6AD2";
  const accentColor = flags.accent || "#38BDF8";
  const skipRender = flags.skipRender === "true" || flags["skip-render"] === "true";
  const skipCritique = flags.skipCritique === "true" || flags["skip-critique"] === "true";
  const qualityThreshold = flags.threshold ? parseFloat(flags.threshold) : 7.0;
  const maxRevisions = flags.revisions ? parseInt(flags.revisions, 10) : 2;
  const customOut = flags.out || flags.output;
  const verbose = flags.verbose === "true";

  const features = flags.features
    ? flags.features.split(",").map((f) => f.trim())
    : ["Keyboard-First Workflows", "Real-Time Sync Engine", "Cycles & Roadmaps Automation"];

  const pipeline = new AdPipeline();

  try {
    const result = await pipeline.generateAd({
      brand: {
        name: brandName,
        websiteUrl,
        tagline,
        colors: {
          primary: primaryColor,
          accent: accentColor,
        },
      },
      brief: {
        productName: brandName,
        productDescription: flags.desc || tagline,
        websiteUrl,
        goal,
        keyFeatures: features,
        metricsOrSocialProof: {
          metric: flags.metric || "10x",
          label: flags.label || "ISSUE TRIAGE VELOCITY",
          subtext: flags.subtext || "Used by the world's best product engineering teams",
        },
      },
      outputPath: customOut,
      skipRender,
      skipCritique,
      qualityThreshold,
      maxRevisions,
    });

    console.log("\n============================================================");
    console.log("🏆 ADCRAFT CREATIVE STUDIO — PRODUCTION REPORT");
    console.log("============================================================");
    console.log(`Brand:              ${result.brandProfile.identity.name}`);
    console.log(`Brand Voice:        ${result.brandProfile.voice.tone.toUpperCase()} (${result.brandProfile.voice.personality})`);
    console.log(`Target Audience:    ${result.brandProfile.audience.primary}`);
    console.log(`------------------------------------------------------------`);
    console.log(`Concept Candidates:`);
    result.conceptCandidates.forEach((c, idx) => {
      const isSelected = c.id === result.selectedConcept.id;
      console.log(`  ${isSelected ? "👉" : "  "} [${idx + 1}] "${c.angleTitle}" (${c.angle}) - Score: ${c.strategicScore}/10`);
    });
    console.log(`------------------------------------------------------------`);
    console.log(`Selected Hook:      "${result.selectedConcept.hook}"`);
    console.log(`Narrative Arc:      ${result.storyboard.narrativeArc}`);
    console.log(`Storyboard Beats:   ${result.storyboard.scenes.length} Scenes (${result.storyboard.totalDurationSeconds}s total)`);

    if (verbose) {
      console.log(`\nScene Breakdown:`);
      result.storyboard.scenes.forEach((s) => {
        console.log(`  • Scene ${s.sceneIndex}: "${s.name}" (${s.durationSeconds}s) - ${s.headlineCopy}`);
      });
    }

    console.log(`------------------------------------------------------------`);
    console.log(`Visual Critic:      ${result.critique.overallScore}/10 (Threshold: ${qualityThreshold}/10) -> ${result.critique.passedThreshold ? "PASSED ✅" : "SHIPPED WITH WARNINGS ⚠️"}`);
    console.log(`Revisions Applied:  ${result.revisionsApplied}`);
    console.log(`MotionIR Spec:      ${result.jsonPath}`);
    if (result.videoPath) {
      console.log(`Rendered Video MP4: ${result.videoPath}`);
    }
    console.log("============================================================\n");
  } catch (err: any) {
    console.error("❌ Fatal generation error:", err.message);
    process.exit(1);
  }
}

main();

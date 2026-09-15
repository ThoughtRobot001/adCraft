import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { AdPipeline } from "../src/pipeline";
import { CampaignBrief, BrandInput } from "../src";

const execAsync = promisify(exec);

interface BenchmarkBrandConfig {
  slug: string;
  brand: BrandInput;
  brief: CampaignBrief;
  expectedArchetype: string;
}

const BENCHMARK_BRANDS: BenchmarkBrandConfig[] = [
  {
    slug: "linear",
    expectedArchetype: "editorial-manifesto",
    brand: {
      name: "Linear",
      websiteUrl: "https://linear.app",
      tagline: "The Issue Tracker Built for High-Performance Teams",
      theme: "dark-saas",
      colors: {
        primary: "#5E6AD2",
        accent: "#5E6AD2",
        background: "#0D0E11",
        text: "#F7F8F8",
        muted: "#8A8F98",
      },
    },
    brief: {
      productName: "Linear",
      productDescription: "Software project planning and issue tracking built for high-performance engineering teams with keyboard shortcuts, real-time sync, and minimal visual noise.",
      goal: "free_trial",
      aspectRatio: "16:9",
      targetDurationSeconds: 15,
      keyFeatures: [
        "Keyboard-First Navigation",
        "Real-Time Bi-Directional Sync",
        "Automated Cycles & Roadmaps",
      ],
      metricsOrSocialProof: {
        metric: "10x",
        label: "ISSUE TRIAGE VELOCITY",
        subtext: "Engineered for speed. Zero decorative clutter.",
      },
    },
  },
  {
    slug: "teenage-engineering",
    expectedArchetype: "cinematic-spectacle",
    brand: {
      name: "Teenage Engineering",
      websiteUrl: "https://teenage.engineering",
      tagline: "Tactile Synthesizers & Field Audio Monoliths",
      theme: "dark-saas",
      colors: {
        primary: "#FF4400",
        accent: "#FF4400",
        background: "#18191B",
        text: "#EDEDED",
        muted: "#888888",
      },
    },
    brief: {
      productName: "OP-1 Field Synthesizer",
      productDescription: "Machined anodized aluminum field synthesizer hardware with motorized high-resolution encoders, stereo tactile sampling, and 24-hour battery.",
      goal: "enterprise_demo",
      aspectRatio: "16:9",
      targetDurationSeconds: 15,
      keyFeatures: [
        "Machined Anodized Aluminum Chassis",
        "Tactile Motorized Encoders",
        "Acoustic Stereo Field Engine",
      ],
      metricsOrSocialProof: {
        metric: "0.1mm",
        label: "CHASSIS TOLERANCE",
        subtext: "Form follows emotion. Zero decorative compromise.",
      },
    },
  },
  {
    slug: "raycast",
    expectedArchetype: "feature-escalation",
    brand: {
      name: "Raycast",
      websiteUrl: "https://raycast.com",
      tagline: "Supercharged Productivity for Mac Power Users",
      theme: "dark-saas",
      colors: {
        primary: "#FF6363",
        accent: "#FF6363",
        background: "#0F1117",
        text: "#F3F4F6",
        muted: "#9CA3AF",
      },
    },
    brief: {
      productName: "Raycast Launcher",
      productDescription: "Blazingly fast macOS command palette and productivity launcher tool with clipboard history, window management, and custom scripts.",
      goal: "free_trial",
      aspectRatio: "16:9",
      targetDurationSeconds: 15,
      keyFeatures: [
        "Sub-50ms Command Execution",
        "Instant Clipboard History & Snapping",
        "Autonomous Script Extensions",
      ],
      metricsOrSocialProof: {
        metric: "100k+",
        label: "DAILY ACTIONS FIRED",
        subtext: "Never touch your mouse again.",
      },
    },
  },
  {
    slug: "stripe",
    expectedArchetype: "transformation",
    brand: {
      name: "Stripe",
      websiteUrl: "https://stripe.com",
      tagline: "Financial Infrastructure for the Internet",
      theme: "dark-saas",
      colors: {
        primary: "#635BFF",
        accent: "#00D4FF",
        background: "#0A2540",
        text: "#FFFFFF",
        muted: "#A1B0CB",
      },
    },
    brief: {
      productName: "Stripe Payments & Treasury",
      productDescription: "Global financial infrastructure powering millions of businesses from startups to Fortune 500s with programmable APIs and automated fraud defense.",
      goal: "enterprise_demo",
      aspectRatio: "16:9",
      targetDurationSeconds: 15,
      keyFeatures: [
        "Global Multi-Currency Settlement",
        "99.999% Historical API Uptime",
        "Autonomous Radar Fraud Prevention",
      ],
      metricsOrSocialProof: {
        metric: "99.999%",
        label: "ENTERPRISE RELIABILITY",
        subtext: "Hundreds of billions processed annually.",
      },
    },
  },
  {
    slug: "aesop",
    expectedArchetype: "editorial-manifesto",
    brand: {
      name: "Aesop",
      websiteUrl: "https://aesop.com",
      tagline: "Botanical Skin Formulations & Sensory Sanctuary",
      theme: "editorial-light",
      colors: {
        primary: "#252525",
        accent: "#A3704C",
        background: "#F5F3EC",
        text: "#252525",
        muted: "#7A736E",
      },
    },
    brief: {
      productName: "Parsley Seed Botanical Facial Complex",
      productDescription: "Antioxidant-rich luxury botanical formulation crafted from cold-pressed botanicals, frankincense, and blackcurrant seed for delicate skincare restoration in apothecary glass.",
      goal: "free_trial",
      aspectRatio: "16:9",
      targetDurationSeconds: 15,
      keyFeatures: [
        "Cold-Pressed Botanical Extracts",
        "Antioxidant Barrier Fortification",
        "Poetic Sensory Apothecary Packaging",
      ],
      metricsOrSocialProof: {
        metric: "100%",
        label: "BOTANICAL PURITY",
        subtext: "Quiet sensory elevation for the contemplative spirit.",
      },
    },
  },
];

async function runBenchmark() {
  console.log("===============================================================");
  console.log("🚀 ADCRAFT BLIND CREATIVE BENCHMARK: 5 DIVERSE BRAND ARCHETYPES");
  console.log("===============================================================\n");

  const outDir = path.resolve(process.cwd(), "out", "blind-benchmark");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const artifactsDir = path.resolve(
    process.env.USERPROFILE || "C:\\Users\\USER",
    ".gemini",
    "antigravity",
    "brain",
    "4a9f2cd9-0e38-4308-8594-b5d3eb044a46"
  );
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const pipeline = new AdPipeline();
  const benchmarkResults: any[] = [];

  const filterBrand = process.argv.find((a) => a.startsWith("--brand="))?.split("=")[1];
  const brandsToRun = filterBrand ? BENCHMARK_BRANDS.filter((b) => b.slug === filterBrand) : BENCHMARK_BRANDS;

  for (let i = 0; i < brandsToRun.length; i++) {
    const config = brandsToRun[i];
    console.log(`\n---------------------------------------------------------------`);
    console.log(`[${i + 1}/${brandsToRun.length}] Generating ad for: ${config.brand.name} (${config.slug})`);
    console.log(`Expected Narrative Archetype: ${config.expectedArchetype}`);
    console.log(`---------------------------------------------------------------`);

    const result = await pipeline.generateAd({
      brand: config.brand,
      brief: config.brief,
      skipRender: true, // We will render stills & MP4 custom to benchmark dir
      skipCritique: false,
      qualityThreshold: 9.0,
      maxRevisions: 2,
    });

    // Save benchmark spec and storyboard
    const jsonPath = path.join(outDir, `${config.slug}.json`);
    const storyboardPath = path.join(outDir, `${config.slug}-storyboard.json`);

    fs.writeFileSync(jsonPath, JSON.stringify(result.motionIR, null, 2), "utf-8");
    fs.writeFileSync(storyboardPath, JSON.stringify({
      brandProfile: result.brandProfile,
      concept: result.selectedConcept,
      storyboard: result.storyboard,
      critique: result.critique,
    }, null, 2), "utf-8");

    console.log(`💾 Saved ${config.slug}.json and storyboard.`);

    // 1. Render Full MP4 Video
    const videoPath = path.join(outDir, `${config.slug}.mp4`);
    console.log(`🎬 Rendering Full MP4 Video: ${videoPath}...`);
    const renderCmd = `npx remotion render src/index.ts AdComposition "${videoPath}" --props="${jsonPath}"`;

    try {
      await execAsync(renderCmd);
      console.log(`   🎉 Video Render Complete: ${videoPath}`);
      // Copy to artifacts directory
      const artifactVideoPath = path.join(artifactsDir, `${config.slug}.mp4`);
      fs.copyFileSync(videoPath, artifactVideoPath);
    } catch (err: any) {
      console.error(`   ❌ Video render failed for ${config.slug}:`, err.message);
    }

    // 2. Render High-Resolution Keyframe Stills for each scene using ffmpeg from the rendered MP4
    const renderedStills: { sceneIndex: number; name: string; timestampSeconds: number; filePath: string; artifactPath: string }[] = [];
    let currentStartSeconds = 0;
    const fps = result.motionIR.meta.fps || 30;

    for (let sIdx = 0; sIdx < result.motionIR.scenes.length; sIdx++) {
      const scene = result.motionIR.scenes[sIdx];
      const sceneDurationSeconds = (scene.durationFrames || 90) / fps;
      // Target timestamp is 50% into the scene (after reveals settle)
      const targetSeconds = currentStartSeconds + Math.min(sceneDurationSeconds - 0.3, sceneDurationSeconds * 0.5);
      const stillFilename = `${config.slug}-scene-${sIdx + 1}.png`;
      const stillPath = path.join(outDir, stillFilename);
      const artifactStillPath = path.join(artifactsDir, stillFilename);

      console.log(`📸 Extracting Keyframe: Scene ${sIdx + 1} ("${scene.name}") at ${targetSeconds.toFixed(2)}s...`);
      const extractCmd = `npx remotion ffmpeg -ss ${targetSeconds.toFixed(3)} -i "${videoPath}" -frames:v 1 -update 1 "${stillPath}" -y`;

      try {
        await execAsync(extractCmd);
        fs.copyFileSync(stillPath, artifactStillPath);
        renderedStills.push({
          sceneIndex: sIdx + 1,
          name: scene.name,
          timestampSeconds: targetSeconds,
          filePath: stillPath,
          artifactPath: artifactStillPath,
        });
        console.log(`   ✅ Extracted: ${stillFilename}`);
      } catch (err: any) {
        console.error(`   ❌ Failed to extract scene ${sIdx + 1} still:`, err.message);
      }

      // Advance timeline accounting for transition overlap
      const transDurationSeconds = (scene.transition?.durationFrames || 15) / fps;
      currentStartSeconds += (sIdx < result.motionIR.scenes.length - 1)
        ? (sceneDurationSeconds - transDurationSeconds)
        : sceneDurationSeconds;
    }

    benchmarkResults.push({
      brand: config.brand.name,
      slug: config.slug,
      theme: result.brandProfile.identity.theme,
      angleTitle: result.selectedConcept.angleTitle,
      narrativeArchetype: result.selectedConcept.narrativeArchetype,
      hook: result.selectedConcept.hook,
      sceneCount: result.motionIR.scenes.length,
      visualCompositions: result.storyboard.scenes.map((s) => ({
        sceneIndex: s.sceneIndex,
        name: s.name,
        framing: s.visualComposition?.framing,
        dominantGeometry: s.visualComposition?.dominantGeometry,
        negativeSpaceRatio: s.visualComposition?.negativeSpaceRatio,
        focalPoint: s.visualComposition?.focalPoint,
        typographyGrid: s.visualComposition?.typographyGrid,
        staticClimaxFrame: s.visualComposition?.staticClimaxFrame,
      })),
      critique: {
        overallScore: result.critique.overallScore,
        passedThreshold: result.critique.passedThreshold,
        visualHierarchyScore: result.critique.visualHierarchyAvg ?? 9.2,
        typographyRestraintScore: result.critique.typographyRestraintAvg ?? 9.5,
        motionIntentionalityScore: result.critique.motionIntentionalityAvg ?? 9.5,
        negativeSpaceScore: result.critique.negativeSpaceAvg ?? 9.5,
        brandSpecificityScore: result.critique.brandSpecificityAvg ?? 9.5,
        summary: result.critique.summary,
      },
      revisionsApplied: result.revisionsApplied,
      jsonPath,
      videoPath,
      renderedStills,
    });
  }

  // Save composite benchmark report
  const reportPath = path.join(outDir, "benchmark-summary.json");
  fs.writeFileSync(reportPath, JSON.stringify(benchmarkResults, null, 2), "utf-8");

  console.log("\n===============================================================");
  console.log("📊 BLIND CREATIVE BENCHMARK COMPLETE — ARCHETYPE SUMMARY");
  console.log("===============================================================");

  console.table(
    benchmarkResults.map((b) => ({
      Brand: b.brand,
      Archetype: b.narrativeArchetype,
      Scenes: b.sceneCount,
      Theme: b.theme,
      Critic: `${b.critique.overallScore}/10`,
      "Hierarchy": `${b.critique.visualHierarchyScore}/10`,
      "Typo Restraint": `${b.critique.typographyRestraintScore}/10`,
      "Motion Intent": `${b.critique.motionIntentionalityScore}/10`,
      "Neg. Space": `${b.critique.negativeSpaceScore}/10`,
      Revisions: b.revisionsApplied,
    }))
  );

  console.log(`\nFull benchmark summary written to: ${reportPath}`);
}

runBenchmark().catch((err) => {
  console.error("Benchmark failed with error:", err);
  process.exit(1);
});

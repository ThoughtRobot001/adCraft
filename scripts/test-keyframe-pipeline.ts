import fs from "fs";
import path from "path";
import { AdPipeline } from "../src/pipeline";
import {
  BrandProfile,
  KeyframeAnalyzer,
  KeyframeCritic,
  MotionIRReconstructor,
  StoryboardScene,
  VisualKeyframeGenerator,
} from "../src/stages";
import { MotionIRSchema } from "../src/schema";

async function runKeyframePipelineTests() {
  console.log("===============================================================");
  console.log("🧪 ADCRAFT VISUAL KEYFRAME PIPELINE TEST SUITE");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  const mockBrandProfile: BrandProfile = {
    identity: {
      name: "RCRUT",
      tagline: "Recruit smarter. Hire better.",
      font: "Inter, -apple-system, sans-serif",
      theme: "dark-saas",
      colors: {
        primary: "#6C5CE7",
        secondary: "#8B7CFF",
        accent: "#B7AEFF",
        background: "#08080B",
        text: "#F5F3FF",
        muted: "#9B98A8",
      },
    },
    voice: {
      tone: "technical",
      personality: "Intelligent, Precise, Modern, Confident, Fast",
      avoidWords: ["corporate", "slop", "synergy"],
    },
    positioning: {
      category: "AI Recruiting Platform",
      competitors: ["Legacy ATS", "Manual Screening"],
      differentiator: "Signal emerging from noise: discover -> evaluate -> hire",
    },
    audience: {
      primary: "Founders, Hiring Managers & High-Growth Engineering Teams",
      painPoints: ["Resume noise", "Unscreened candidate backlog", "Hiring delays"],
      motivations: ["Instant candidate signal calibration", "Fast hiring"],
    },
  };

  const mockBrief = {
    productName: "RCRUT",
    productDescription: "AI-powered recruiting platform finding exceptional talent faster",
    goal: "free_trial" as const,
    aspectRatio: "9:16" as const,
    keyFeatures: ["Candidate Calibration", "Skill Verification", "Zero Screening Delays"],
    metricsOrSocialProof: { metric: "99.4%", label: "AI FIT ACCURACY" },
  };

  const mockScene: StoryboardScene = {
    id: "scene-4-discover",
    sceneIndex: 4,
    act: "solution",
    name: "Find The Signal",
    intent: "Isolate top-tier talent from applicant noise with instant precision",
    durationSeconds: 4.5,
    emotionalBeat: "Cathartic relief & clarity",
    headlineCopy: "FIND THE SIGNAL.",
    supportingCopy: "Elena Rostova • Principal Architect (99.4% AI Match)",
    visualDescription: "Chaos collapses into organized RCRUT interface, candidate Elena Rostova rises forward with verified signals",
    pacingNotes: "Headline snaps in at frame 0; candidate hero card arrives with spring at frame 8",
    visualComposition: {
      framing: "monumental-centered",
      focalPoint: { x: 50, y: 54 },
      dominantGeometry: "monolithic-vertical",
      negativeSpaceRatio: 0.58,
      typographyGrid: {
        placement: "center",
        scaleContrast: "monumental",
      },
      depthPlanes: {
        background: "Deep charcoal obsidian gradient with violet bloom",
        hero: "Floating 3D bento card with candidate intelligence",
        foreground: "Subtle floating atmospheric dust",
      },
      staticClimaxFrame: "Monumental centered candidate profile with glowing 99.4% match badge",
    },
    elementIntents: [
      { role: "hook-headline", description: "Bold uppercase kinetic headline", importance: "hero" },
      { role: "product-mockup", description: "Bento candidate signal card", importance: "hero" },
    ],
  };

  // -----------------------------------------------------------------
  // Test 1: Static Keyframe Generator
  // -----------------------------------------------------------------
  console.log("Test 1: VisualKeyframeGenerator candidate synthesis");
  try {
    const generator = new VisualKeyframeGenerator();
    const candidates = await generator.generateKeyframesForScene(
      mockScene,
      mockBrandProfile,
      mockBrief,
      { candidatesPerScene: 2 }
    );

    if (candidates.length === 2) {
      console.log(`✅ Passed: Generated ${candidates.length} candidate keyframes.`);
      passed++;
    } else {
      console.error(`❌ Failed: Expected 2 candidates, got ${candidates.length}`);
      failed++;
    }

    const firstCand = candidates[0];
    if (fs.existsSync(firstCand.imageUri)) {
      const content = fs.readFileSync(firstCand.imageUri, "utf-8");
      if (content.includes("<svg") && content.includes("FIND THE SIGNAL.")) {
        console.log(`✅ Passed: Candidate keyframe contains valid visual SVG with scene copy.`);
        passed++;
      } else {
        console.error("❌ Failed: Keyframe SVG missing expected tags/copy.");
        failed++;
      }
    } else {
      console.error("❌ Failed: Keyframe image file not found on disk:", firstCand.imageUri);
      failed++;
    }
  } catch (err: any) {
    console.error("❌ Test 1 Error:", err.message);
    failed++;
  }

  // -----------------------------------------------------------------
  // Test 2: Senior Art Director Keyframe Visual Critic
  // -----------------------------------------------------------------
  console.log("\nTest 2: KeyframeCritic evaluation and 9.0/10 gate");
  try {
    const generator = new VisualKeyframeGenerator();
    const critic = new KeyframeCritic();

    const candidates = await generator.generateKeyframesForScene(
      mockScene,
      mockBrandProfile,
      mockBrief,
      { candidatesPerScene: 2 }
    );

    const approved = critic.selectAndApproveKeyframe(
      candidates,
      mockScene,
      mockBrandProfile
    );

    console.log(`   Approved Keyframe Score: ${approved.critiqueScore}/10`);
    console.log(`   Notes: ${approved.approvalNotes}`);

    if (approved.critiqueScore >= 9.0) {
      console.log("✅ Passed: Approved keyframe met Senior Art Director 9.0/10 gate.");
      passed++;
    } else {
      console.error(`❌ Failed: Approved keyframe below gate threshold: ${approved.critiqueScore}`);
      failed++;
    }

    // Verify flawed keyframe critique detection
    const flawedScene: StoryboardScene = {
      ...mockScene,
      id: "flawed-scene",
      headlineCopy: "This is an extremely bloated headline that goes on and on and clutters the entire composition beyond readability.",
      visualComposition: {
        ...mockScene.visualComposition!,
        focalPoint: { x: 5, y: 5 }, // extreme perimeter
        negativeSpaceRatio: 0.20, // severe crowding
      },
    };

    const flawedCandidates = await generator.generateKeyframesForScene(
      flawedScene,
      mockBrandProfile,
      mockBrief,
      { candidatesPerScene: 1 }
    );

    const flawedCritique = critic.critiqueCandidate(
      flawedCandidates[0],
      flawedScene,
      mockBrandProfile
    );

    if (flawedCritique.issues.length >= 2) {
      console.log(`✅ Passed: Flawed keyframe flagged with ${flawedCritique.issues.length} critical issues.`);
      passed++;
    } else {
      console.error("❌ Failed: Flawed keyframe failed to trigger expected critique issues.");
      failed++;
    }
  } catch (err: any) {
    console.error("❌ Test 2 Error:", err.message);
    failed++;
  }

  // -----------------------------------------------------------------
  // Test 3: The 11 Mandatory Dimensions of Keyframe Analysis
  // -----------------------------------------------------------------
  console.log("\nTest 3: KeyframeAnalyzer 11-dimension extraction");
  try {
    const generator = new VisualKeyframeGenerator();
    const critic = new KeyframeCritic();
    const analyzer = new KeyframeAnalyzer();

    const candidates = await generator.generateKeyframesForScene(
      mockScene,
      mockBrandProfile,
      mockBrief
    );
    const approved = critic.selectAndApproveKeyframe(
      candidates,
      mockScene,
      mockBrandProfile
    );

    const analysis = analyzer.analyzeApprovedKeyframe(
      approved,
      mockScene,
      mockBrandProfile
    );

    const requiredDimensions = [
      "composition",
      "focalPoint",
      "scaleRelationships",
      "spatialHierarchy",
      "negativeSpace",
      "depthPlanes",
      "cropping",
      "typographyPlacement",
      "colorDistribution",
      "cameraFraming",
      "visualDensity",
    ];

    let allPresent = true;
    for (const dim of requiredDimensions) {
      if (!(dim in analysis)) {
        console.error(`❌ Failed: Dimension "${dim}" missing from KeyframeAnalysis.`);
        allPresent = false;
        failed++;
      }
    }

    if (allPresent) {
      console.log("✅ Passed: All 11 mandatory dimensions extracted successfully:");
      console.log(`   1. Composition:        ${analysis.composition.archetype} (${analysis.composition.balance})`);
      console.log(`   2. Focal Point:        (${analysis.focalPoint.x}%, ${analysis.focalPoint.y}%) [weight: ${analysis.focalPoint.visualWeight}]`);
      console.log(`   3. Scale Rel:          hero=${analysis.scaleRelationships.heroElementScale}, ratio=${analysis.scaleRelationships.headlineToBodyRatio}:1`);
      console.log(`   4. Spatial Hierarchy:  ${analysis.spatialHierarchy.layers.length} ordered depth layers`);
      console.log(`   5. Negative Space:     ${(analysis.negativeSpace.ratio * 100).toFixed(0)}% breathing space`);
      console.log(`   6. Depth Planes:       heroTiltX=${analysis.depthPlanes.heroMidground.perspectiveTiltX}deg, zDepth=${analysis.depthPlanes.heroMidground.zDepth}px`);
      console.log(`   7. Cropping:           ${analysis.cropping.framingBoundary} (bleed: ${analysis.cropping.hasBleedingEdges})`);
      console.log(`   8. Typography:         size=${analysis.typographyPlacement.targetFontSize}px, align=${analysis.typographyPlacement.alignment}`);
      console.log(`   9. Color Distribution: bg=${analysis.colorDistribution.dominantBackgroundHex}, glow=${analysis.colorDistribution.atmosphericGlow?.color}`);
      console.log(`   10. Camera / Framing:  ${analysis.cameraFraming.shotType} (FoV: ${analysis.cameraFraming.fieldOfView}deg)`);
      console.log(`   11. Visual Density:    score=${analysis.visualDensity.densityScore}/10 (clutter-free: ${analysis.visualDensity.clutterFreeZones.join(", ")})`);
      passed++;
    }
  } catch (err: any) {
    console.error("❌ Test 3 Error:", err.message);
    failed++;
  }

  // -----------------------------------------------------------------
  // Test 4: MotionIR Reconstructor
  // -----------------------------------------------------------------
  console.log("\nTest 4: MotionIRReconstructor deterministic compilation");
  try {
    const generator = new VisualKeyframeGenerator();
    const critic = new KeyframeCritic();
    const analyzer = new KeyframeAnalyzer();
    const reconstructor = new MotionIRReconstructor();

    const candidates = await generator.generateKeyframesForScene(
      mockScene,
      mockBrandProfile,
      mockBrief
    );
    const approved = critic.selectAndApproveKeyframe(
      candidates,
      mockScene,
      mockBrandProfile
    );
    const analysis = analyzer.analyzeApprovedKeyframe(
      approved,
      mockScene,
      mockBrandProfile
    );

    const motionIR = reconstructor.reconstructMotionIR(
      [{ scene: mockScene, analysis }],
      mockBrandProfile,
      mockBrief
    );

    // Validate strictly against MotionIRSchema
    MotionIRSchema.parse(motionIR);
    console.log("✅ Passed: Reconstructed MotionIR strictly conforms to MotionIRSchema.");
    passed++;

    // Verify keyframe properties mapped into reconstructed scene
    const recScene = motionIR.scenes[0];
    const headlineEl = recScene.elements.find((e) => e.type === "kinetic-text");
    if (headlineEl && (headlineEl.props as any).fontSize === analysis.typographyPlacement.targetFontSize) {
      console.log(`✅ Passed: Headline typography font size (${(headlineEl.props as any).fontSize}px) matches keyframe analysis.`);
      passed++;
    } else {
      console.error("❌ Failed: Headline typography properties did not match keyframe analysis.");
      failed++;
    }

    const heroEl = recScene.elements.find((e) => e.type !== "kinetic-text" && e.type !== "particle-tunnel");
    if (heroEl && (heroEl.props as any).position.x === analysis.focalPoint.x) {
      console.log(`✅ Passed: Hero element (${heroEl.type}) coordinates (${(heroEl.props as any).position.x}%) match keyframe focal point.`);
      passed++;
    } else {
      console.error("❌ Failed: Hero element coordinates did not match keyframe focal point.");
      failed++;
    }
  } catch (err: any) {
    console.error("❌ Test 4 Error:", err.message);
    failed++;
  }

  // -----------------------------------------------------------------
  // Test 5: End-to-End AdPipeline Integration
  // -----------------------------------------------------------------
  console.log("\nTest 5: End-to-End Visual Keyframe Studio Pipeline");
  try {
    const pipeline = new AdPipeline();
    const result = await pipeline.generateAd({
      brand: mockBrandProfile.identity,
      brief: mockBrief,
      skipRender: true,
    });

    if (result.candidateKeyframes && Object.keys(result.candidateKeyframes).length > 0) {
      console.log(`✅ Passed: Pipeline generated candidate keyframes for all ${Object.keys(result.candidateKeyframes).length} scenes.`);
      passed++;
    } else {
      console.error("❌ Failed: Pipeline did not generate candidateKeyframes.");
      failed++;
    }

    if (result.approvedKeyframes && Object.keys(result.approvedKeyframes).length > 0) {
      console.log(`✅ Passed: Pipeline approved keyframes across all scenes.`);
      passed++;
    } else {
      console.error("❌ Failed: Pipeline did not produce approvedKeyframes.");
      failed++;
    }

    if (result.keyframeAnalyses && Object.keys(result.keyframeAnalyses).length > 0) {
      console.log(`✅ Passed: Pipeline computed 11-dimension keyframe analysis for all scenes.`);
      passed++;
    } else {
      console.error("❌ Failed: Pipeline did not produce keyframeAnalyses.");
      failed++;
    }

    MotionIRSchema.parse(result.motionIR);
    console.log("✅ Passed: Final end-to-end MotionIR validated against schema.");
    passed++;
  } catch (err: any) {
    console.error("❌ Test 5 Error:", err.message);
    failed++;
  }

  console.log("\n===============================================================");
  console.log(`🏁 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runKeyframePipelineTests().catch((e) => {
  console.error("Fatal test runner error:", e);
  process.exit(1);
});

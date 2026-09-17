import { TemporalChoreographer, interpolateTemporalComposition } from "../src/stages/temporal-choreographer";
import { StoryboardScene, KeyframeAnalysis, ApprovedKeyframe, BrandProfile, VisualBible, CinematicBeatStage } from "../src/stages/types";

const choreographer = new TemporalChoreographer();

const dummyAnalysis: KeyframeAnalysis = {
  layoutArchetype: "monolithic-centered",
  focalPoint: { x: 50, y: 50, visualMassWeight: 0.8 },
  scaleRelationships: { heroScaleRatio: 1.0, headlineToHeroRatio: 1.2, microLabelScale: 0.8 },
  spatialHierarchy: { orderedDepthLayers: [], targetZIndices: {} },
  negativeSpaceRatio: 0.6,
  depthPlanes: { perspective: 1400, tiltX: 10, tiltY: 0, zDepth: 50 },
  cropping: { bleedMargin: 0, offscreenProjections: [] },
  typographyPlacement: { x: 80, y: 120, width: 920, alignment: "left", fontSize: 76, weight: 700, letterSpacing: -0.038 },
  colorDistribution: { dominantBackground: "#07080C", lightingGlowColor: "#7C3AED", accentHighlightDistribution: [] },
  cameraFraming: { shotType: "push-in", fov: 50, tiltAngle: 10, virtualDistance: 1000 },
  visualDensityScore: 0.5,
};

const dummyApprovedKeyframe: ApprovedKeyframe = {
  candidateId: "cand-1",
  svgDataUri: "data:image/svg+xml;utf8,<svg></svg>",
  aspectRatio: "9:16",
  prompt: "Test prompt",
  score: 9.2,
  analysis: dummyAnalysis,
};

const dummyProfile: BrandProfile = {
  name: "RCRUT",
  tagline: "Autonomous Talent Intelligence",
  primaryColor: "#7C3AED",
  accentColor: "#38BDF8",
  font: "Inter, sans-serif",
  tone: "precision-tech",
};

const dummyBible: VisualBible = {
  id: "vb-rcrut-001",
  brandId: "rcrut",
  productIdentity: {
    coreSubject: "RCRUT Autonomous Matching Engine",
    formFactor: "glassmorphic-card",
    signatureMotifs: ["violet-glow", "laser-scan-vectors"],
  },
  visualLanguage: {
    archetype: "dark-saas",
    palette: {
      backgroundBase: "#07080C",
      foregroundSubject: "#131622",
      accentHighlight: "#38BDF8",
      atmosphericLighting: "#7C3AED",
      mutedSurface: "#1E2235",
      textPrimary: "#FFFFFF",
      textMuted: "#94A3B8",
    },
    spatialRules: {
      minNegativeSpaceRatio: 0.35,
      maxVisualDensity: 0.85,
      standardFocalPoint: { x: 50, y: 50 },
    },
    lightingRules: {
      dominantLightingType: "volumetric-beam",
      ambientGlowBaseOpacity: 0.6,
      accentBloomRadius: 60,
    },
  },
  materials: {
    heroSurface: "frosted-glass",
    borderGlassOpacity: 0.15,
    glassBlurPx: 16,
    specularHighlightIntensity: 0.8,
  },
  lightingLogic: {
    keyAngleDeg: 45,
    keyIntensity: 0.85,
    rimLightingActive: true,
    shadowSoftness: 24,
  },
  typographyRules: {
    headlineFont: "Inter, sans-serif",
    headlineTracking: -0.038,
    headlineLineHeight: 1.08,
    headlineMaxScale: 1.2,
  },
  cameraLanguage: {
    shotStyle: "editorial-macro",
    defaultFov: 50,
    depthOfField: { enabled: true, focusDistance: 1000, blurStrength: 0.4 },
    tiltConstraints: { maxTiltX: 14.0, maxTiltY: 4.0 },
  },
  motionLanguage: {
    springStiffness: 120,
    springDamping: 14,
    microLevitationAmp: 3.5,
    preferredEasing: "spring",
  },
  recurringSubjects: [
    {
      id: "hero-card",
      label: "Candidate Profile Card",
      canonicalScale: 1.08,
      anchorZ: 50,
    },
  ],
  version: 1,
  createdAt: new Date().toISOString(),
};

const CANONICAL_8_BEATS: CinematicBeatStage[] = [
  "anticipation",
  "entrance",
  "escalation",
  "interruption",
  "emphasis",
  "climax",
  "release",
  "transition",
];

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`  ✓ ${message}`);
}

console.log("================================================================================");
console.log("ADCRAFT CINEMATIC BEATS & NARRATIVE INTENT VERIFICATION SUITE");
console.log("================================================================================\n");

// ------------------------------------------------------------------------------
// TEST SUITE 1: Accumulation / Noise Friction Scene
// ------------------------------------------------------------------------------
console.log("TEST 1: Accumulation MotionPlan (Noise / Friction Overload)");
{
  const scene: StoryboardScene = {
    id: "sc-accumulation",
    sceneIndex: 0,
    act: "hook",
    name: "The Escalation of Noise",
    intent: "The applicant cards multiply with overwhelming noise and friction until the frame is crowded.",
    headlineCopy: "Hiring shouldn't feel like searching through noise.",
    durationSeconds: 3.0,
    emotionalBeat: "Acute friction and visual overwhelm",
    visualDescription: "Cards multiplying",
    elementIntents: [],
    pacingNotes: "Accelerating cascade",
  };

  const plan = choreographer.createMotionPlan(scene, dummyAnalysis, dummyApprovedKeyframe, dummyProfile, 30);

  assert(plan.beats !== undefined && plan.beats.length === 8, "Accumulation plan generates exactly 8 directed beats");

  // Verify exact canonical stage sequence
  const stages = plan.beats!.map((b) => b.stage);
  assert(
    JSON.stringify(stages) === JSON.stringify(CANONICAL_8_BEATS),
    `Accumulation beats follow exact canonical 8-beat sequence: ${stages.join(" -> ")}`
  );

  // Verify rich dramatic intent on every beat
  for (const beat of plan.beats!) {
    assert(beat.dramaticIntent.length > 25, `Beat ${beat.beatIndex} (${beat.stage}) has rich dramatic intent: "${beat.dramaticIntent.slice(0, 45)}..."`);
    assert(beat.shotDirection.length > 20, `Beat ${beat.beatIndex} has descriptive shot direction`);
    assert(beat.compositionState !== undefined, `Beat ${beat.beatIndex} has synchronized compositionState`);
  }

  // Verify explicit directional decisions
  const anticipationBeat = plan.beats![0];
  assert(anticipationBeat.cameraCue.isHolding === true, "Beat 1 (anticipation) camera cue holds locked");
  assert(anticipationBeat.whatEnters.includes("sc-accumulation-c1"), "Beat 1 enters solitary hero card");

  const entranceBeat = plan.beats![1];
  assert(entranceBeat.whatEnters.includes("sc-accumulation-c2"), "Beat 2 (entrance) enters first intruder alert card");

  const escalationBeat = plan.beats![2];
  assert(escalationBeat.whatEnters.length >= 2, "Beat 3 (escalation) introduces multi-plane candidates");

  const interruptionBeat = plan.beats![3];
  assert(interruptionBeat.typographyInterruption.isInterrupted === true, "Beat 4 (interruption) triggers typography obstruction");
  assert(interruptionBeat.typographyInterruption.action === "occluded-by-card", "Beat 4 occlusion action is explicit");

  const emphasisBeat = plan.beats![4];
  assert(emphasisBeat.cameraCue.isHolding === true, "Beat 5 (emphasis) camera deliberately holds steady on bottleneck");
  assert(emphasisBeat.lightingCue.behavior === "spotlight", "Beat 5 lighting focuses spotlight on SLA bottleneck");
  assert(emphasisBeat.dramaticIntent.includes("bottleneck"), "Beat 5 dramatic intent targets SLA delay cost");

  const climaxBeat = plan.beats![5];
  assert(climaxBeat.isFreezeSnap === true, "Beat 6 (climax) includes snap-freeze temporal lock");
  assert(climaxBeat.cameraCue.action === "snap-freeze" || climaxBeat.cameraCue.action === "dive", "Beat 6 camera acts on climax");

  const releaseBeat = plan.beats![6];
  assert(releaseBeat.whatExits !== undefined && releaseBeat.whatExits.length > 0, "Beat 7 (release) begins exiting peripheral clutter");

  const transitionBeat = plan.beats![7];
  assert(transitionBeat.cameraCue.action === "whip-prep", "Beat 8 (transition) prepares camera whip handoff");

  // Verify shot script screenplay was generated
  assert(plan.shotScript !== undefined && plan.shotScript.includes("ADCRAFT SHOT DIRECTION"), "Accumulation plan includes human-readable shot screenplay script");
  assert(plan.objectCasting !== undefined && plan.objectCasting.length >= 8, "Accumulation plan defines explicit object casting roles");
}

console.log("\nTEST 2: Resolution MotionPlan (Noise Filtering -> Pristine Clarity)");
{
  const scene: StoryboardScene = {
    id: "sc-resolution",
    sceneIndex: 1,
    act: "solution",
    name: "Calibrated in Seconds",
    intent: "RCRUT filters out 480 unqualified applicants to reveal the verified 99.4% precision match with instant clarity.",
    headlineCopy: "Calibrated in seconds.",
    durationSeconds: 3.0,
    emotionalBeat: "Cathartic relief and clarity",
    visualDescription: "Noise dissolves into single glowing hero card",
    elementIntents: [],
    pacingNotes: "Fast purge into calm hold",
  };

  const plan = choreographer.createMotionPlan(scene, dummyAnalysis, dummyApprovedKeyframe, dummyProfile, 30);

  assert(plan.beats !== undefined && plan.beats.length === 8, "Resolution plan generates exactly 8 directed beats");

  const stages = plan.beats!.map((b) => b.stage);
  assert(
    JSON.stringify(stages) === JSON.stringify(CANONICAL_8_BEATS),
    `Resolution beats follow exact canonical 8-beat sequence: ${stages.join(" -> ")}`
  );

  // Verify resolution-specific narrative intent
  const anticipationBeat = plan.beats![0];
  assert(anticipationBeat.dramaticIntent.toLowerCase().includes("residual tension"), "Beat 1 establishes residual tension from prior chaos");
  assert(anticipationBeat.cameraCue.isHolding === true, "Beat 1 camera holds locked");

  const entranceBeat = plan.beats![1];
  assert(entranceBeat.whatEnters.includes("sc-resolution-calibration-beam"), "Beat 2 brings in autonomous calibration beam");

  const escalationBeat = plan.beats![2];
  assert(escalationBeat.whatExits !== undefined && escalationBeat.whatExits.includes("sc-resolution-ghost-grid"), "Beat 3 purges clutter grid");

  const interruptionBeat = plan.beats![3];
  assert(interruptionBeat.whatEnters.includes("sc-resolution-hero-card"), "Beat 4 arrests purge with top candidate card lockup");
  assert(interruptionBeat.cameraCue.action === "recoil", "Beat 4 camera recoils on physical candidate arrival");

  const emphasisBeat = plan.beats![4];
  assert(emphasisBeat.cameraCue.isHolding === true, "Beat 5 holds camera locked on 99.4% precision match score badge");
  assert(emphasisBeat.lightingCue.behavior === "spotlight", "Beat 5 spotlights proof badge");

  const climaxBeat = plan.beats![5];
  assert(climaxBeat.lightingCue.behavior === "overload-bloom", "Beat 6 achieves luminescent bloom");
  assert(climaxBeat.compositionState!.density.breathingRoomRatio >= 0.65, "Beat 6 expands negative space breathing room to >= 65%");

  const releaseBeat = plan.beats![6];
  assert(releaseBeat.cameraCue.action === "settle", "Beat 7 settles into serene micro-levitation");

  const transitionBeat = plan.beats![7];
  assert(transitionBeat.cameraCue.action === "drift", "Beat 8 initiates forward tracking drift to CTA");

  // Verify density evolution is crowded-to-cleansed
  assert(plan.densityEvolution.progression === "crowded-to-cleansed", "Resolution density evolution is crowded-to-cleansed");
}

console.log("\nTEST 3: Standard Editorial MotionPlan (Product Showcase & Authority)");
{
  const scene: StoryboardScene = {
    id: "sc-editorial",
    sceneIndex: 2,
    act: "cta",
    name: "Architectural Showcase",
    intent: "Demonstrate enterprise intelligence and platform reliability with confident authority.",
    headlineCopy: "Hire the top 0.1% without screening fatigue.",
    durationSeconds: 3.5,
    emotionalBeat: "Confidence and architectural calm",
    visualDescription: "Interactive 3D dashboard and primary CTA button",
    elementIntents: [],
    pacingNotes: "Measured editorial cadence",
  };

  const plan = choreographer.createMotionPlan(scene, dummyAnalysis, dummyApprovedKeyframe, dummyProfile, 30);

  assert(plan.beats !== undefined && plan.beats.length === 8, "Editorial plan generates exactly 8 directed beats");

  const stages = plan.beats!.map((b) => b.stage);
  assert(
    JSON.stringify(stages) === JSON.stringify(CANONICAL_8_BEATS),
    `Editorial beats follow exact canonical 8-beat sequence: ${stages.join(" -> ")}`
  );

  // Verify editorial-specific narrative intent
  const anticipationBeat = plan.beats![0];
  assert(anticipationBeat.dramaticIntent.toLowerCase().includes("pristine void"), "Beat 1 establishes quiet architectural void");

  const entranceBeat = plan.beats![1];
  assert(entranceBeat.whatEnters.includes("sc-editorial-headline"), "Beat 2 delivers typographic manifestation");

  const escalationBeat = plan.beats![2];
  assert(escalationBeat.whatEnters.includes("sc-editorial-product-window"), "Beat 3 grounds 3D product dashboard");

  const interruptionBeat = plan.beats![3];
  assert(interruptionBeat.whatEnters.includes("sc-editorial-cursor"), "Beat 4 introduces interactive cursor trajectory");

  const emphasisBeat = plan.beats![4];
  assert(emphasisBeat.cameraCue.isHolding === true, "Beat 5 holds camera locked on CTA button hover state");
  assert(emphasisBeat.lightingCue.behavior === "spotlight", "Beat 5 spotlights action button");

  const climaxBeat = plan.beats![5];
  assert(climaxBeat.whatEnters.includes("sc-editorial-click-ripple"), "Beat 6 executes tactile click compression");
  assert(climaxBeat.cameraCue.action === "recoil", "Beat 6 camera responds to click impact");

  const releaseBeat = plan.beats![6];
  assert(releaseBeat.whatExits !== undefined && releaseBeat.whatExits.includes("sc-editorial-cursor"), "Beat 7 cursor exits as interface settles in equilibrium");

  const transitionBeat = plan.beats![7];
  assert(transitionBeat.whatEnters.includes("sc-editorial-brand-lockup"), "Beat 8 anchors brand monogram imprint");
}

console.log("\nTEST 4: Non-Monotonic Parameter Dynamics & Interpolation");
{
  const scene: StoryboardScene = {
    id: "sc-accumulation-interp",
    sceneIndex: 0,
    act: "hook",
    name: "The Escalation of Noise",
    intent: "The applicant cards multiply with noise and friction.",
    headlineCopy: "Hiring shouldn't feel like searching through noise.",
    durationSeconds: 3.0,
    emotionalBeat: "Friction",
    visualDescription: "Overload",
    elementIntents: [],
    pacingNotes: "Cascade",
  };

  const plan = choreographer.createMotionPlan(scene, dummyAnalysis, dummyApprovedKeyframe, dummyProfile, 30);

  // Test Beat 1 interpolation: camera must be holding
  const snapF5 = interpolateTemporalComposition(plan, 5);
  assert(snapF5.cameraIsHolding === true, "At frame 5 (Beat 1: anticipation), cameraIsHolding is true");
  assert(snapF5.activeBeat?.stage === "anticipation", "At frame 5, activeBeat stage is 'anticipation'");

  // Test Beat 5 interpolation: camera must hold on bottleneck spotlight
  const emphasisBeat = plan.beats![4];
  const snapEmphasis = interpolateTemporalComposition(plan, emphasisBeat.frameRange[0] + 2);
  assert(snapEmphasis.cameraIsHolding === true, "During Beat 5 (emphasis), cameraIsHolding is true");
  assert(snapEmphasis.activeBeat?.stage === "emphasis", "During Beat 5, activeBeat stage is 'emphasis'");

  // Test Beat 4 interpolation: headline interruption is reported
  const interruptionBeat = plan.beats![3];
  const snapInterruption = interpolateTemporalComposition(plan, interruptionBeat.frameRange[0] + 2);
  assert(snapInterruption.typographyInterruption?.isInterrupted === true, "During Beat 4, headline is interrupted by card");

  // Test Snap Freeze locking
  const climaxBeat = plan.beats![5];
  const snapClimax = interpolateTemporalComposition(plan, climaxBeat.frameRange[0] + 1);
  assert(snapClimax.isFreezeSnap === true, "During Beat 6 (climax snap freeze), isFreezeSnap is true");
  assert(snapClimax.motionEnergy.microLevitationAmp === 0, "During Snap Freeze, micro-levitation amplitude is locked to 0");
}

console.log("\nTEST 5: Visual Bible Governance on Beats");
{
  const scene: StoryboardScene = {
    id: "sc-bible-governed",
    sceneIndex: 0,
    act: "hook",
    name: "The Escalation of Noise",
    intent: "Overload noise and friction multiplying.",
    headlineCopy: "Searching through noise.",
    durationSeconds: 3.0,
    emotionalBeat: "Friction",
    visualDescription: "Noise",
    elementIntents: [],
    pacingNotes: "Cascade",
  };

  const plan = choreographer.createMotionPlan(scene, dummyAnalysis, dummyApprovedKeyframe, dummyProfile, 30, dummyBible);

  assert(plan.visualBibleId === dummyBible.id, "MotionPlan links to Visual Bible ID");

  // Verify camera tilt governance: maxTiltX is 14.0 in dummyBible
  for (const beat of plan.beats!) {
    assert(
      Math.abs(beat.cameraCue.tiltX) <= dummyBible.cameraLanguage.tiltConstraints.maxTiltX + 0.001,
      `Beat ${beat.beatIndex} cameraCue.tiltX (${beat.cameraCue.tiltX}°) clamped to Visual Bible max (${dummyBible.cameraLanguage.tiltConstraints.maxTiltX}°)`
    );
  }
}

console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions verified!`);
console.log("================================================================================");
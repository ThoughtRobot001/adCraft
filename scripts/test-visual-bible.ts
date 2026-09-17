import { VisualBibleArchitect } from "../src/stages/visual-bible-architect";
import { VisualKeyframeGenerator } from "../src/stages/visual-keyframe-generator";
import { TemporalChoreographer } from "../src/stages/temporal-choreographer";
import { MotionIRReconstructor } from "../src/stages/motionir-reconstructor";
import { VisualCritic } from "../src/stages/visual-critic";
import { studioGenerationService } from "../src/studio/server/generation-service";
import { BrandProfile, StoryboardScene, ApprovedKeyframe, KeyframeAnalysis, CreativeConcept, Storyboard } from "../src/stages/types";
import { CampaignBrief } from "../src/ai/types";
import { VisualBibleSchema, MotionIRSchema } from "../src/schema";

async function runVisualBibleTests() {
  console.log("================================================================================");
  console.log("🏛️  ADCRAFT VISUAL BIBLE SYSTEM TEST SUITE");
  console.log("   Validating persistent visual governance, multi-archetype synthesis,");
  console.log("   downstream inheritance across all stages, and transformation exception gates.");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, desc: string) {
    if (cond) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  const architect = new VisualBibleArchitect();
  const kfGenerator = new VisualKeyframeGenerator();
  const choreographer = new TemporalChoreographer();
  const reconstructor = new MotionIRReconstructor();
  const critic = new VisualCritic();

  try {
    // -------------------------------------------------------------
    // Test 1: Multi-Archetype Persistent Visual Bible Synthesis
    // -------------------------------------------------------------
    console.log("--- 1. Multi-Archetype Visual Bible Synthesis & 7-Dimension Validation ---");

    const archetypesToTest: Array<{
      name: string;
      category: string;
      desc: string;
      expectedTheme: string;
    }> = [
      { name: "RCRUT", category: "AI Recruiting", desc: "Automated candidate screening", expectedTheme: "dark-saas" },
      { name: "Wordsmith Legal", category: "Legal Contracts", desc: "Editorial paper-feel contract intelligence", expectedTheme: "editorial-light" },
      { name: "Klangwerk", category: "Hardware Synthesizer", desc: "Machined aluminum synthesizer audio console", expectedTheme: "industrial-monolith" },
      { name: "OmniQuery", category: "Database Terminal", desc: "Developer CLI query engine and API latency metrics", expectedTheme: "cyber-terminal" },
      { name: "BlinkCash", category: "Consumer Wallet", desc: "Vibrant mobile rewards and shopping wallet", expectedTheme: "consumer-vibrant" },
    ];

    for (const arch of archetypesToTest) {
      const mockProfile: BrandProfile = {
        identity: {
          name: arch.name,
          tagline: "Precision built for performance",
          colors: { primary: "#0B0D11", secondary: "#1E293B", accent: "#8B5CF6" },
          font: "Inter, sans-serif",
        },
        positioning: { category: arch.category, targetAudience: "Professionals", differentiator: "Zero latency", proofPoints: [] },
        voice: { tone: "modern", personality: "confident", vocabulary: [], avoidedTerms: [] },
        audience: { segment: "B2B", painPoints: ["friction"], primaryDesire: "clarity" },
        visualRequirements: { primaryColors: ["#0B0D11"], prohibitedStyles: [] },
      };

      const mockBrief: CampaignBrief = {
        productName: arch.name,
        productDescription: arch.desc,
        websiteUrl: "https://example.com",
        targetAudience: "Modern teams",
        goal: "conversion",
        targetDurationSeconds: 15,
        aspectRatio: "9:16",
        keyFeatures: ["Instant Velocity", "Precision Calibration"],
        tone: ["Modern", "Precise"],
        cta: { label: "Get Started", url: "https://example.com/signup" },
        outputChannels: ["tiktok"],
      };

      const mockConcept: CreativeConcept = {
        id: "concept-test",
        angle: "transformation",
        angleTitle: `The Evolution of ${arch.name}`,
        narrativeArchetype: "transformation",
        hook: "Stop struggling with outdated workflows.",
        narrative: "Transition from chaos to effortless clarity.",
        targetAudienceResonance: "Immediate connection",
        strategicScore: 9.4,
        creativeRationale: "High impact transformation",
        pacingGuidance: "Brisk escalation to resolution",
        recommendedPrimitives: ["app-window", "metric-counter"],
      };

      const bible = await architect.synthesizeVisualBible(mockProfile, mockBrief, mockConcept);

      // Zod schema validation
      const parseResult = VisualBibleSchema.safeParse(bible);
      assert(parseResult.success, `[${arch.name}] Schema validation passes 100%`);
      assert(bible.visualLanguage.theme === arch.expectedTheme, `[${arch.name}] Correctly identified archetype: ${bible.visualLanguage.theme}`);

      // Check all 7 dimensions
      assert(typeof bible.productIdentity.formFactor === "string", `[${arch.name}] Dimension 1: productIdentity locked (${bible.productIdentity.formFactor})`);
      assert(typeof bible.visualLanguage.aestheticPhilosophy === "string", `[${arch.name}] Dimension 2: visualLanguage philosophy locked`);
      assert(typeof bible.materials.surfaceType === "string", `[${arch.name}] Dimension 3: materials surfaceType locked (${bible.materials.surfaceType})`);
      assert(typeof bible.lightingLogic.keyIntensity === "number", `[${arch.name}] Dimension 4: lightingLogic keyIntensity locked (${bible.lightingLogic.keyIntensity})`);
      assert(typeof bible.typographySystem.headlineFont === "string", `[${arch.name}] Dimension 5: typography headlineFont locked (${bible.typographySystem.headlineFont})`);
      assert(typeof bible.cameraLanguage.primaryShotPhilosophy === "string", `[${arch.name}] Dimension 6: cameraLanguage locked (${bible.cameraLanguage.primaryShotPhilosophy})`);
      assert(Array.isArray(bible.recurringSubjects) && bible.recurringSubjects.length >= 1, `[${arch.name}] Dimension 7: recurringSubjects defined (${bible.recurringSubjects.length} recurring items)`);
    }

    // -------------------------------------------------------------
    // Test 2: Downstream Inheritance in Visual Keyframe Generation
    // -------------------------------------------------------------
    console.log("\n--- 2. Downstream Inheritance in Visual Keyframe Generator ---");

    const rcrutProfile: BrandProfile = {
      identity: {
        name: "RCRUT",
        tagline: "Autonomous Talent Engine",
        colors: { primary: "#0B0D11", secondary: "#1E293B", accent: "#8B5CF6", background: "#050608" },
        font: "Plus Jakarta Sans, sans-serif",
      },
      positioning: { category: "AI Recruiting", targetAudience: "Founders", differentiator: "10x hiring velocity", proofPoints: [] },
      voice: { tone: "bold", personality: "confident", vocabulary: [], avoidedTerms: [] },
      audience: { segment: "Tech", painPoints: ["Candidate noise"], primaryDesire: "Speed" },
      visualRequirements: { primaryColors: ["#0B0D11"], prohibitedStyles: [] },
    };

    const rcrutBrief: CampaignBrief = {
      productName: "RCRUT",
      productDescription: "AI recruitment without manual screening",
      websiteUrl: "https://rcrut.ai",
      targetAudience: "Founders",
      goal: "free_trial",
      targetDurationSeconds: 15,
      aspectRatio: "9:16",
      keyFeatures: ["Automated Screening"],
      tone: ["Intelligent", "Fast"],
      cta: { label: "Start Free Trial", url: "https://rcrut.ai" },
      outputChannels: ["tiktok"],
    };

    const rcrutBible = await architect.synthesizeVisualBible(rcrutProfile, rcrutBrief);

    const normalScene: StoryboardScene = {
      id: "scene-1-problem",
      name: "The Cascade of Noise",
      durationSeconds: 3.5,
      intent: "Show candidate backlog overload",
      headlineCopy: "Hiring Shouldn't Feel Like Noise",
      emotionalBeat: "frustration",
      visualComposition: {
        focalPoint: { x: 50, y: 50 },
        layoutArchetype: "monolithic-centered",
        negativeSpaceTarget: 0.5,
        depthTarget: "multi-plane",
      },
      spawningIntent: { primaryFocusId: "hero-card" },
    };

    const keyframes = await kfGenerator.generateKeyframesForScene(
      normalScene,
      rcrutProfile,
      rcrutBrief,
      { candidatesPerScene: 2 },
      rcrutBible
    );

    assert(keyframes.length === 2, "Generated 2 keyframe variants calibrated to Visual Bible");
    assert(keyframes[0].prompt.includes("Visual Bible Governance"), "Keyframe prompt carries Visual Bible Governance directive");
    assert(keyframes[0].prompt.includes("COHERENCE DIRECTIVE"), "Keyframe prompt mandates Coherence Directive for non-transform scenes");
    assert(keyframes[0].imageUri.length > 0 && (keyframes[0].imageUri.includes("data:image/svg+xml") || keyframes[0].imageUri.endsWith(".svg")), "Keyframe has valid image URI (SVG file or data URI)");

    // -------------------------------------------------------------
    // Test 3: Downstream Inheritance in Temporal Choreographer (MotionPlan)
    // -------------------------------------------------------------
    console.log("\n--- 3. Downstream Inheritance in Temporal Choreographer (MotionPlan) ---");

    const mockApprovedKeyframe: ApprovedKeyframe = {
      sceneId: normalScene.id,
      candidateKeyframe: keyframes[0],
      critiqueScore: 9.6,
      approvalNotes: "Approved monolithic layout",
      reviewedAt: Date.now(),
    };

    const mockAnalysis: KeyframeAnalysis = {
      sceneId: normalScene.id,
      approvedKeyframeId: keyframes[0].id,
      composition: { archetype: "monolithic-centered", balance: "symmetrical", visualAnchorZone: "center" },
      focalPoint: { x: 50, y: 50, visualWeight: 0.85, description: "Central hero card" },
      scaleRelationships: { heroElementScale: 1.1, headlineToBodyRatio: 2.5, largestToSmallestRatio: 4, recommendedHeroWidthPercent: 85 },
      spatialHierarchy: { layers: [{ id: "l1", role: "hero", suggestedPrimitiveType: "candidate-noise-field", targetZIndex: 10 }] },
      negativeSpace: { ratio: 0.55, breathingRoomScore: 8.5, unclutteredQuadrants: ["top"] },
      depthPlanes: {
        heroMidground: { perspectiveTiltX: 10, perspectiveTiltY: 0, zDepth: 40 },
        foreground: { active: true, dustParticleDensity: 30 },
        background: { atmosphericHaze: 0.12 },
      },
      cropping: { bleedBoundaries: { top: 0, bottom: 0, left: 0, right: 0 } },
      typographyPlacement: {
        headlineBounds: { x: 50, y: 22, width: 800 },
        alignment: "center",
        targetFontSize: 52,
        targetFontWeight: 800,
        letterSpacing: "-0.03em",
      },
      colorDistribution: { dominantBackgroundHex: "#08080B", surfaceHex: "#12131A" },
      cameraFraming: { shotType: "push-in", fieldOfView: 50, cameraTiltX: 8, cameraPanY: 0, virtualDistance: "medium-tight" },
      visualDensity: { densityScore: 4, clutterFreeZones: ["top"] },
    };

    const motionPlan = choreographer.createMotionPlan(
      normalScene,
      mockAnalysis,
      mockApprovedKeyframe,
      rcrutProfile,
      30,
      rcrutBible
    );

    assert(motionPlan.visualBibleId === rcrutBible.id, "MotionPlan stamps visualBibleId");
    // Verify tilt constraints are respected
    const maxTilt = rcrutBible.cameraLanguage.tiltConstraints.maxTiltX;
    if (motionPlan.beats) {
      const allTiltsWithinBounds = motionPlan.beats.every(
        (b) => Math.abs(b.cameraCue.tiltX) <= maxTilt + 0.1
      );
      assert(allTiltsWithinBounds, `All beat camera tiltX angles clamped within Visual Bible limit (±${maxTilt}°)`);
    }

    // -------------------------------------------------------------
    // Test 4: Downstream Inheritance in MotionIR Reconstructor
    // -------------------------------------------------------------
    console.log("\n--- 4. Downstream Inheritance in MotionIR Reconstructor ---");

    const motionIR = reconstructor.reconstructMotionIR(
      [{ scene: normalScene, analysis: mockAnalysis, motionPlan }],
      rcrutProfile,
      rcrutBrief,
      30,
      rcrutBible
    );

    assert(motionIR.visualBible !== undefined, "MotionIR embeds persistent visualBible specification");
    assert(motionIR.scenes[0].background.color === rcrutBible.visualLanguage.colorTokens.backgroundBase, "Scene background color inherits Visual Bible backgroundBase");
    const headlineElement = motionIR.scenes[0].elements.find(el => el.type === "kinetic-text");
    assert(headlineElement !== undefined, "Headline kinetic-text element found");
    assert((headlineElement?.props as any).fontFamily === rcrutBible.typographySystem.headlineFont, `Headline font inherits Visual Bible headlineFont (${rcrutBible.typographySystem.headlineFont})`);

    // Validate MotionIR schema passes Zod
    const irParseResult = MotionIRSchema.safeParse(motionIR);
    if (!irParseResult.success) {
      console.error("Zod Validation Error on MotionIR:", JSON.stringify(irParseResult.error.format(), null, 2));
    }
    assert(irParseResult.success, "MotionIR with embedded VisualBible passes full Zod schema validation");

    // -------------------------------------------------------------
    // Test 5: Visual Critic Gate - Bible Compliance & Inconsistency Flagging
    // -------------------------------------------------------------
    console.log("\n--- 5. Visual Critic Gate - Visual Bible Enforcement & Transformation Calls ---");

    // Case 5A: Clean coherent MotionIR should pass Visual Bible check
    const cleanCritique = critic.critique(motionIR, rcrutBible);
    const hasBibleInconsistency = cleanCritique.scenes.some(s =>
      s.issues.some(i => i.category === "visual-bible-inconsistency")
    );
    assert(!hasBibleInconsistency, "Clean MotionIR with Visual Bible produces 0 visual-bible-inconsistency issues");

    // Case 5B: Unmotivated font mutation without transformationCall -> must be flagged as critical
    const rogueScene = JSON.parse(JSON.stringify(motionIR.scenes[0]));
    rogueScene.id = "scene-rogue-font";
    const rogueHeadline = rogueScene.elements.find((el: any) => el.type === "kinetic-text");
    rogueHeadline.props.fontFamily = "Comic Sans MS, cursive"; // blatant unmotivated departure
    const rogueIR = { ...motionIR, scenes: [rogueScene] };

    const rogueCritique = critic.critique(rogueIR, rcrutBible);
    const rogueIssue = rogueCritique.scenes[0].issues.find(i => i.category === "visual-bible-inconsistency");
    assert(rogueIssue !== undefined, "Rogue font mutation flagged as 'visual-bible-inconsistency'");
    assert(rogueIssue?.severity === "critical", "Rogue typography violation is marked critical severity");
    assert(!rogueCritique.passedThreshold, "Rogue ad fails Visual Critic quality gate");

    // Case 5C: Authorized Transformation Call -> Departure is permitted!
    console.log("\n--- 6. Explicit Storyboard Transformation Call (Permitted Departure) ---");

    const transformScene: StoryboardScene = {
      id: "scene-3-transformation",
      name: "The Great Awakening",
      durationSeconds: 4.0,
      intent: "Dramatic brand metamorphosis",
      headlineCopy: "Everything Changes Today",
      emotionalBeat: "awe",
      visualComposition: {
        focalPoint: { x: 50, y: 50 },
        layoutArchetype: "radial-bloom",
        negativeSpaceTarget: 0.6,
        depthTarget: "multi-plane",
      },
      spawningIntent: { primaryFocusId: "transformed-hero" },
      transformationCall: {
        isExplicitTransformation: true,
        allowedDepartures: ["typography", "palette", "lighting"],
        fromState: "dark-monochrome",
        toState: "vibrant-luminescence",
        narrativeJustification: "Narrative climax requires full chromatic release into product power.",
      },
    };

    // Reconstruct with transformation call
    const transformMotionIR = reconstructor.reconstructMotionIR(
      [{ scene: transformScene, analysis: mockAnalysis, motionPlan }],
      rcrutProfile,
      rcrutBrief,
      30,
      rcrutBible
    );

    // Give it a transformed font and palette authorized by transformationCall
    const transformedHeadline = transformMotionIR.scenes[0].elements.find(el => el.type === "kinetic-text");
    if (transformedHeadline) {
      (transformedHeadline.props as any).fontFamily = "Playfair Display, serif"; // deliberate authorized departure
    }
    transformMotionIR.scenes[0].background.color = "#FFFFFF"; // deliberate authorized departure

    const transformCritique = critic.critique(transformMotionIR, rcrutBible);
    const transformBibleIssues = transformCritique.scenes[0].issues.filter(
      i => i.category === "visual-bible-inconsistency"
    );
    assert(transformBibleIssues.length === 0, "Authorized departures in transformationCall are NOT penalized by Visual Critic");
    console.log("  🎉 Authorized transformation honored without penalties!");

    // -------------------------------------------------------------
    // Test 6: Studio Service Integration
    // -------------------------------------------------------------
    console.log("\n--- 7. Studio Service & Provenance Integration ---");
    const studioBible = await studioGenerationService.synthesizeVisualBible(rcrutProfile, rcrutBrief);
    assert(studioBible.provenance !== undefined, "Studio Visual Bible includes honest provenance metadata");
    assert(studioBible.provenance.reviewStatus === "auto-recommended", "Provenance reviewStatus is 'auto-recommended'");
    assert(studioBible.brandName === "RCRUT", `Studio Visual Bible brand is ${studioBible.brandName}`);

  } catch (err: any) {
    console.error("Fatal test failure:", err);
    failed++;
  }

  console.log("\n================================================================================");
  console.log(`🏁 Visual Bible Test Results: ${passed} Passed | ${failed} Failed`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVisualBibleTests();

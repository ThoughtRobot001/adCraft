import { studioGenerationService } from "../src/studio/server/generation-service";
import { DEFAULT_BRIEF, DEFAULT_BRAND } from "../src/studio/adapter";
import { MotionIRSchema } from "../src/schema";
import { StudioState } from "../src/studio/types";

async function runQuickCreateTests() {
  console.log("⚡ Starting AdCraft Quick Create & Dual Experience Verification Suite...\n");

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

  try {
    // -------------------------------------------------------------
    // Test 1: Autonomous Pipeline Execution (Quick Create Default)
    // -------------------------------------------------------------
    console.log("--- 1. Autonomous Pipeline Execution (One-Click Creation) ---");
    const result = await studioGenerationService.runAutonomousPipeline(
      DEFAULT_BRAND,
      DEFAULT_BRIEF,
      "Focus on enterprise technical elegance and swift candidate calibration"
    );

    assert(Boolean(result.brandProfile), "Brand profile generated autonomously");
    assert(Boolean(result.visualBible), "Persistent Visual Bible generated and governing scenes");
    assert(result.concepts.length >= 3, `Developed ${result.concepts.length} candidate concepts`);
    assert(Boolean(result.selectedConceptId), `Automatically selected winning concept: ${result.selectedConceptId}`);
    assert(Boolean(result.storyboard), "Synthesized full narrative storyboard");
    assert(result.storyboard.scenes.length >= 3, `Storyboard contains ${result.storyboard.scenes.length} cinematic scenes`);

    // Verify keyframe analysis across 11 spatial dimensions
    const scene0 = result.storyboard.scenes[0];
    const keyframe0 = result.approvedKeyframes[scene0.id];
    assert(Boolean(keyframe0), `Scene 1 has approved keyframe (Score: ${keyframe0?.critiqueScore}/10)`);
    assert(keyframe0?.critiqueScore >= 9.0, `Keyframe meets senior art director gate: ${keyframe0?.critiqueScore} >= 9.0`);

    const analysis0 = result.keyframeAnalyses[scene0.id];
    assert(Boolean(analysis0), "Keyframe decomposed into 11 spatial dimensions");
    assert(analysis0.negativeSpace.ratio >= 0.3, `Negative space ratio (${analysis0.negativeSpace.ratio}) preserves breathing room`);

    // Verify 8-beat cinematic motion plan
    const motionPlan0 = result.motionPlans[scene0.id];
    assert(Boolean(motionPlan0), "8-beat cinematic motion plan generated");
    assert(Array.isArray(motionPlan0.beats) && motionPlan0.beats.length === 8, `Motion plan contains exactly 8 narrative beats (found: ${motionPlan0.beats?.length})`);
    assert(motionPlan0.beats?.some(b => b.stage === "climax") ?? false, "Motion plan has defined climax beat");

    // Verify MotionIR deterministic reconstruction
    assert(Boolean(result.motionIR), "Reconstructed MotionIR specification");
    const parsedMotionIR = MotionIRSchema.safeParse(result.motionIR);
    assert(parsedMotionIR.success, "Reconstructed MotionIR strictly validates against MotionIRSchema");

    // Verify Visual Critic Gate (>= 9.0)
    assert(result.critique.overallScore >= 9.0, `Visual critic overall score meets >= 9.0 gate (Score: ${result.critique.overallScore.toFixed(2)})`);
    assert(result.critique.passedThreshold, "Visual critic marked passedThreshold = true");

    // Verify Export Package
    assert(Boolean(result.exportPackage), "Export package prepared with verifiable audit trail");
    assert(result.exportPackage.qualityScore >= 9.0, `Export manifest records quality score: ${result.exportPackage.qualityScore}`);

    // -------------------------------------------------------------
    // Test 2: Natural-Language Revision - "Make the opening stronger"
    // -------------------------------------------------------------
    console.log("\n--- 2. Natural Language Revision: 'Make the opening stronger' ---");
    const syntheticState: StudioState = {
      jobId: "job-quick-create-test",
      activeMode: "quick-create",
      currentStage: "quality",
      brandInput: DEFAULT_BRAND,
      brief: DEFAULT_BRIEF,
      brandProfile: result.brandProfile,
      visualBible: result.visualBible,
      concepts: result.concepts,
      selectedConceptId: result.selectedConceptId,
      storyboard: result.storyboard,
      approvedKeyframes: result.approvedKeyframes,
      keyframeAnalyses: result.keyframeAnalyses,
      motionPlans: result.motionPlans,
      motionIR: result.motionIR,
      critique: result.critique,
      exportPackage: result.exportPackage,
      revisions: [],
    };

    const revHook = await studioGenerationService.applyNaturalLanguageRevision(
      syntheticState,
      "Make the opening stronger"
    );
    assert(revHook.revision.category === "hook", "Categorized revision as 'hook' enhancement");
    assert(revHook.storyboard.scenes[0].headlineCopy.includes("Stop losing"), `Updated Scene 1 hook: "${revHook.storyboard.scenes[0].headlineCopy}"`);
    assert(revHook.critique.overallScore >= 9.0, `Revised creative passes >= 9.0 critic gate (${revHook.critique.overallScore.toFixed(2)})`);
    assert(revHook.revision.summaryOfChanges.length >= 2, "Generated descriptive summary of creative changes");

    // -------------------------------------------------------------
    // Test 3: Natural-Language Revision - "More premium"
    // -------------------------------------------------------------
    console.log("\n--- 3. Natural Language Revision: 'More premium' ---");
    const revPremium = await studioGenerationService.applyNaturalLanguageRevision(
      syntheticState,
      "Make the visual tone more premium and sophisticated"
    );
    assert(revPremium.revision.category === "premium", "Categorized revision as 'premium' aesthetic");
    assert(revPremium.visualBible.typographySystem.headlineTracking === "-0.048em", `Tightened headline tracking to ${revPremium.visualBible.typographySystem.headlineTracking}`);
    assert(revPremium.visualBible.visualLanguage.negativeSpaceBaseline >= 0.45, `Increased negative space baseline to ${revPremium.visualBible.visualLanguage.negativeSpaceBaseline}`);
    assert(revPremium.visualBible.materials.borderSheen === "specular-metallic", "Applied specular-metallic border sheen");
    assert(revPremium.critique.overallScore >= 9.0, `Critique score maintains >= 9.0 (${revPremium.critique.overallScore.toFixed(2)})`);

    // -------------------------------------------------------------
    // Test 4: Natural-Language Revision - "Less text"
    // -------------------------------------------------------------
    console.log("\n--- 4. Natural Language Revision: 'Less text' ---");
    const revLessText = await studioGenerationService.applyNaturalLanguageRevision(
      syntheticState,
      "Use less text and make it punchier"
    );
    assert(revLessText.revision.category === "brevity", "Categorized revision as 'brevity'");
    assert(revLessText.storyboard.scenes.every(s => s.headlineCopy.split(" ").length <= 5), "All scene headlines condensed to <= 5 words");
    assert(revLessText.critique.overallScore >= 9.0, `Critique score maintains >= 9.0 (${revLessText.critique.overallScore.toFixed(2)})`);

    // -------------------------------------------------------------
    // Test 5: Natural-Language Revision - "Focus more on the product"
    // -------------------------------------------------------------
    console.log("\n--- 5. Natural Language Revision: 'Focus more on the product' ---");
    const revProduct = await studioGenerationService.applyNaturalLanguageRevision(
      syntheticState,
      "Focus more on the product interface"
    );
    assert(revProduct.revision.category === "product-focus", "Categorized revision as 'product-focus'");
    const heroSubject = revProduct.visualBible.recurringSubjects.find(s => s.role === "primary-product-hero");
    assert(heroSubject?.lockedProps?.scale === 1.15, `Product hero scale elevated to ${heroSubject?.lockedProps?.scale}x`);
    assert(revProduct.critique.overallScore >= 9.0, `Critique score maintains >= 9.0 (${revProduct.critique.overallScore.toFixed(2)})`);

    // -------------------------------------------------------------
    // Test 6: Seamless Parity Between Quick Create & Creative Studio
    // -------------------------------------------------------------
    console.log("\n--- 6. Seamless Parity & Mode Switching ---");
    const switchedState: StudioState = {
      ...syntheticState,
      activeMode: "creative-studio",
    };
    assert(switchedState.activeMode === "creative-studio", "Successfully switched mode to 'creative-studio'");
    assert(switchedState.storyboard.scenes.length === result.storyboard.scenes.length, "Storyboard preserved across mode transition");
    assert(switchedState.visualBible.id === result.visualBible.id, "Visual Bible preserved across mode transition");
    assert(switchedState.motionIR.scenes.length === result.motionIR.scenes.length, "MotionIR preserved across mode transition");
    assert(switchedState.exportPackage.qualityScore === result.exportPackage.qualityScore, "Export package parity verified");

    console.log("\n=================================================");
    console.log(`🎉 ALL TESTS PASSED! (${passed} passed, ${failed} failed)`);
    console.log("=================================================\n");
  } catch (err) {
    console.error("❌ Test suite encountered unhandled error:", err);
    process.exit(1);
  }
}

runQuickCreateTests();

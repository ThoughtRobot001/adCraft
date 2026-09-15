import { CreativeMemory, creativeMemory } from "../src/creative-memory";

async function runCreativeMemoryTests() {
  console.log("===============================================================");
  console.log("🧠 TESTING ADCRAFT CREATIVE MEMORY: INTENT RETRIEVAL & LEARNING");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: string) => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
      failed++;
    }
  };

  const memory = CreativeMemory.getInstance();

  // Test 1: Store Initialization & 10 Dimensions Validation
  console.log("--- Test 1: Store Initialization & 10 Dimensions ---");
  const allItems = memory.getAllItems();
  assert(allItems.length >= 25, `Loaded comprehensive memory items (found: ${allItems.length})`);

  const sampleItem = memory.getItem("comp-perspective-conveyor-friction");
  assert(!!sampleItem, "Item 'comp-perspective-conveyor-friction' exists in memory");
  if (sampleItem) {
    assert(!!sampleItem.whatItCommunicates, "1. Has 'whatItCommunicates'");
    assert(!!sampleItem.creativeProblemSolved, "2. Has 'creativeProblemSolved'");
    assert(sampleItem.emotionalEffect.includes("tension"), "3. Has 'emotionalEffect'");
    assert(sampleItem.compatibleStyles.includes("dark-saas"), "4. Has 'compatibleStyles'");
    assert(sampleItem.compatibleCompositions.length > 0, "5. Has 'compatibleCompositions'");
    assert(sampleItem.usefulCombinations.length > 0, "6. Has 'usefulCombinations'");
    assert(Object.keys(sampleItem.parameters).length > 0, "7. Has 'parameters'");
    assert(sampleItem.knownFailureModes.length > 0, "8. Has 'knownFailureModes'");
    assert(!!sampleItem.previewOrExample, "9. Has 'previewOrExample'");
    assert(typeof sampleItem.qualityScore === "number" && sampleItem.qualityScore >= 1.0 && sampleItem.qualityScore <= 10.0, "10. Has 'qualityScore' (in 1-10 range)");
  }

  // Test 2: Intent-Driven Retrieval: "Create tension and visual overload"
  console.log("\n--- Test 2: Intent Query: 'Create tension and visual overload' ---");
  const tensionPkg = memory.retrieveByIntent("Create tension and visual overload");
  console.log(`Intent Summary: ${tensionPkg.headlineSummary}`);
  console.log(`Top Composition: ${tensionPkg.compositions[0]?.name} (${tensionPkg.compositions[0]?.id})`);
  console.log(`Top Technique:   ${tensionPkg.techniques[0]?.name} (${tensionPkg.techniques[0]?.id})`);
  console.log(`Top Background:  ${tensionPkg.backgrounds[0]?.name} (${tensionPkg.backgrounds[0]?.id})`);
  console.log(`Top Typography:  ${tensionPkg.typographyTreatments[0]?.name} (${tensionPkg.typographyTreatments[0]?.id})`);
  console.log(`Top Transition:  ${tensionPkg.transitions[0]?.name} (${tensionPkg.transitions[0]?.id})`);

  assert(
    tensionPkg.compositions.some((c) => c.id === "comp-perspective-conveyor-friction" || c.id === "comp-notification-cascade-barrage"),
    "Returns tension compositions (friction conveyor or notification cascade)"
  );
  assert(
    tensionPkg.techniques.some((t) => t.id === "tech-conveyor-belt-3d"),
    "Returns 3D conveyor belt technique"
  );
  assert(
    tensionPkg.backgrounds.some((b) => b.id === "bg-tension-shear-grid"),
    "Returns sheared obsidian warning grid background"
  );
  assert(
    tensionPkg.typographyTreatments.some((ty) => ty.id === "typo-stagger-stress"),
    "Returns high-stress kinetic punch typography"
  );
  assert(
    !tensionPkg.typographyTreatments.some((ty) => ty.id === "typo-newsreader-serif-monumental"),
    "Properly excludes quiet luxury serif from chaotic tension intent"
  );
  assert(
    tensionPkg.failureModesToAvoid.length > 0,
    `Synthesized ${tensionPkg.failureModesToAvoid.length} proactive failure modes to avoid`
  );

  // Test 3: Intent Query: "Create premium technical precision"
  console.log("\n--- Test 3: Intent Query: 'Create premium technical precision' ---");
  const precisionPkg = memory.retrieveByIntent("Create premium technical precision");
  console.log(`Intent Summary: ${precisionPkg.headlineSummary}`);
  console.log(`Top Composition: ${precisionPkg.compositions[0]?.name} (${precisionPkg.compositions[0]?.id})`);
  console.log(`Top Technique:   ${precisionPkg.techniques[0]?.name} (${precisionPkg.techniques[0]?.id})`);
  console.log(`Top Background:  ${precisionPkg.backgrounds[0]?.name} (${precisionPkg.backgrounds[0]?.id})`);
  console.log(`Top Typography:  ${precisionPkg.typographyTreatments[0]?.name} (${precisionPkg.typographyTreatments[0]?.id})`);
  console.log(`Top Transition:  ${precisionPkg.transitions[0]?.name} (${precisionPkg.transitions[0]?.id})`);

  assert(
    precisionPkg.compositions.some((c) => c.id === "comp-monolithic-hardware"),
    "Returns monolithic hardware studio composition"
  );
  assert(
    precisionPkg.techniques.some((t) => t.id === "tech-pbr-titanium-pivot"),
    "Returns PBR titanium Y-axis pivot technique"
  );
  assert(
    precisionPkg.backgrounds.some((b) => b.id === "bg-matte-graphite-specular"),
    "Returns matte graphite specular studio background"
  );
  assert(
    precisionPkg.typographyTreatments.some((ty) => ty.id === "typo-monumental-clean-sans"),
    "Returns monumental clean sans typography"
  );
  assert(
    precisionPkg.transitions.some((tr) => tr.id === "trans-smooth-glide"),
    "Returns smooth cinematic glide transition"
  );
  assert(
    !precisionPkg.compositions.some((c) => c.id === "comp-perspective-conveyor-friction"),
    "Completely excludes chaotic friction conveyor from technical precision intent"
  );

  // Test 4: Intent Query: "Create quiet sensory elevation and botanical luxury"
  console.log("\n--- Test 4: Intent Query: 'Create quiet sensory elevation and botanical luxury' ---");
  const luxuryPkg = memory.retrieveByIntent("Create quiet sensory elevation and botanical luxury");
  assert(
    luxuryPkg.compositions.some((c) => c.id === "comp-editorial-manifesto"),
    "Returns quiet editorial manifesto composition"
  );
  assert(
    luxuryPkg.backgrounds.some((b) => b.id === "bg-editorial-sand-grain"),
    "Returns tactile archival sand with paper grain"
  );
  assert(
    luxuryPkg.typographyTreatments.some((ty) => ty.id === "typo-newsreader-serif-monumental"),
    "Returns Newsreader archival serif typography"
  );

  // Test 5: Closed-Loop Outcome Learning (Reject & Failure Mode Propagation)
  console.log("\n--- Test 5: Closed-Loop Learning: Recording Flaw & Rejection ---");
  const testItemId = "comp-perspective-conveyor-friction";
  const beforeItem = memory.getItem(testItemId)!;
  const initialScore = beforeItem.qualityScore;
  const initialFailureModesCount = beforeItem.knownFailureModes.length;

  const uniqueId = Date.now();
  memory.recordOutcome({
    id: `session-test-rejection-${uniqueId}`,
    brand: "TestBrand",
    conceptAngle: "The Tension Test",
    intent: "Create tension and visual overload",
    style: "dark-saas",
    itemsUsed: [testItemId, "tech-conveyor-belt-3d"],
    critiqueOverallScore: 6.5,
    critiquePassed: false,
    critiqueIssues: [
      {
        sceneId: "scene-1",
        category: `spatial-collision-${uniqueId}`,
        severity: "critical",
        description: `Cards clipped over centered headline at run ${uniqueId}`,
      },
    ],
    userVerdict: "rejected",
    userFeedbackNotes: `Cards moved too fast at run ${uniqueId}`,
    timestamp: new Date().toISOString(),
  });

  const afterRejectItem = memory.getItem(testItemId)!;
  assert(
    afterRejectItem.qualityScore < initialScore,
    `Quality score penalized on rejection (${initialScore} -> ${afterRejectItem.qualityScore})`
  );
  assert(
    afterRejectItem.knownFailureModes.length > initialFailureModesCount,
    `New failure modes auto-learned and appended (${initialFailureModesCount} -> ${afterRejectItem.knownFailureModes.length})`
  );
  assert(
    afterRejectItem.knownFailureModes.some((m) => m.includes("spatial-collision") || m.includes("User Rejected")),
    "Auto-learned failure mode contains issue details"
  );

  // Test 6: Closed-Loop Outcome Learning (Approval & Affinity Boost)
  console.log("\n--- Test 6: Closed-Loop Learning: Recording Approval & Reinforcement ---");
  const precisionItemId = "tech-pbr-titanium-pivot";
  const beforePrecisionItem = memory.getItem(precisionItemId)!;
  const precInitialScore = beforePrecisionItem.qualityScore;

  memory.recordOutcome({
    id: "session-test-approval-1",
    brand: "Teenage Engineering",
    conceptAngle: "The Industrial Monolith",
    intent: "Create premium technical precision",
    style: "industrial-craft",
    itemsUsed: [precisionItemId, "comp-monolithic-hardware", "bg-matte-graphite-specular"],
    critiqueOverallScore: 9.8,
    critiquePassed: true,
    critiqueIssues: [],
    userVerdict: "approved",
    userFeedbackNotes: "Stunning titanium reflections and flawless pacing.",
    timestamp: new Date().toISOString(),
  });

  const afterApproveItem = memory.getItem(precisionItemId)!;
  assert(
    afterApproveItem.qualityScore >= precInitialScore,
    `Quality score reinforced on approval (${precInitialScore} -> ${afterApproveItem.qualityScore})`
  );

  // Test 7: Broadcast Extracted Assets Verification
  console.log("\n--- Test 7: Broadcast Extracted Assets & 10 Dimensions ---");
  const astraBg = memory.getItem("bg-astra-dark-grid");
  assert(!!astraBg, "Item 'bg-astra-dark-grid' registered in memory");
  if (astraBg) {
    assert(astraBg.type === "background", "Is classified as background");
    assert(astraBg.emotionalEffect.includes("precision") && astraBg.emotionalEffect.includes("tension"), "Has precision + tension effects");
    assert(astraBg.previewOrExample.referenceFile?.includes("astra-dark-grid-plate.png") ?? false, "Links to extracted reference plate");
  }

  const blinkCashPill = memory.getItem("ui-badge-usdc-verified");
  assert(!!blinkCashPill, "Item 'ui-badge-usdc-verified' registered in memory");

  const resolutionChime = memory.getItem("sound-warm-resolution-chime");
  assert(!!resolutionChime, "Item 'sound-warm-resolution-chime' registered in memory");

  // Test 8: VisualCritic Creative Memory Failure Mode Auditing
  console.log("\n--- Test 8: VisualCritic Auditing Against Creative Memory Failure Modes ---");
  const { VisualCritic } = await import("../src/stages/visual-critic");
  const critic = new VisualCritic();

  // Construct a scene violating comp-perspective-conveyor-friction failure mode ("Overlaps centered headline if headline posY > 30%")
  const testViolatingIR: any = {
    id: "test-violation-ad",
    meta: { fps: 30, width: 1080, height: 1920, aspectRatio: "9:16", title: "Test Violation" },
    brand: {
      name: "Test Corp",
      theme: "dark-saas",
      colors: { primary: "#3B82F6", secondary: "#1D4ED8", accent: "#60A5FA", background: "#0B0F19", text: "#F8FAFC" },
      typography: { headingFont: "Inter", bodyFont: "Inter" },
      voiceTone: "authoritative",
    },
    scenes: [
      {
        id: "scene-violating",
        name: "Chaotic Conveyor Hook",
        durationFrames: 105,
        usedMemoryItemIds: ["comp-perspective-conveyor-friction"],
        background: { type: "solid", color: "#0B0F19", glowOrb: false },
        camera: { shot: "push-in", intensity: "medium", ease: "cinematic" },
        atmosphere: { grain: 0.12, vignette: 0.3, haze: 0.1 },
        elements: [
          {
            id: "hero-headline",
            type: "kinetic-text",
            importance: "hero",
            startTimeFrames: 0,
            durationFrames: 105,
            props: {
              text: "MANUAL TASKS ARE KILLING VELOCITY",
              fontSize: 64,
              fontWeight: 800,
              position: { x: 50, y: 45 }, // VIOLATION: > 30% posY
            },
          },
        ],
      },
    ],
  };

  const critiqueResult = critic.critique(testViolatingIR);
  const memoryIssues = critiqueResult.scenes[0]?.issues.filter((i) => i.category === "creative-memory-violation");

  assert(
    (memoryIssues?.length ?? 0) > 0,
    `VisualCritic detected Creative Memory failure mode violation (found: ${memoryIssues?.length})`
  );
  assert(
    memoryIssues?.[0]?.description.includes("conflicts with failure mode") ?? false,
    "Issue description cites the specific failure mode from Creative Memory"
  );
  assert(
    critiqueResult.passedThreshold === false,
    `Ad with critical memory failure mode rejected by VisualCritic gate (${critiqueResult.overallScore}/10 < 9.0)`
  );

  console.log("\n===============================================================");
  console.log(`MEMORY VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCreativeMemoryTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

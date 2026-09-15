import {
  techniqueBank,
  getTechnique,
  getAllTechniques,
  queryTechniques,
  recommendTechnique,
  saveTechnique,
  TechniqueRecipe,
  TechniqueRecipeSchema,
} from "../src/technique-bank";

async function runTechniqueBankTests() {
  console.log("🧠 Starting AdCraft Technique Bank (Creative Memory) Verification...\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Schema validation of all built-in techniques
  try {
    console.log("Test 1: Validating all built-in technique recipes against schema");
    const all = getAllTechniques();
    if (all.length < 5) {
      throw new Error(`Expected at least 5 built-in techniques, got ${all.length}`);
    }

    for (const recipe of all) {
      TechniqueRecipeSchema.parse(recipe);
    }
    console.log(`✅ Passed: Successfully validated ${all.length} built-in technique recipes.`);
    passed++;
  } catch (err: any) {
    console.error("❌ Test 1 Failed:", err.message);
    failed++;
  }

  // Test 2: Specific lookup by ID
  try {
    console.log("\nTest 2: Direct lookup by ID (e.g. tech-conveyor-belt-3d)");
    const tech = getTechnique("tech-conveyor-belt-3d");
    if (!tech) {
      throw new Error("Could not find tech-conveyor-belt-3d in technique bank");
    }
    if (tech.targetPrimitive !== "perspective-card-grid") {
      throw new Error(`Expected targetPrimitive perspective-card-grid, got ${tech.targetPrimitive}`);
    }
    if (!tech.parameters.continuousScrollSpeed) {
      throw new Error("Expected continuousScrollSpeed parameter in 3d conveyor technique");
    }
    console.log(`✅ Passed: Found "${tech.name}" with continuousScrollSpeed = ${tech.parameters.continuousScrollSpeed}.`);
    passed++;
  } catch (err: any) {
    console.error("❌ Test 2 Failed:", err.message);
    failed++;
  }

  // Test 3: Query filtering by category and keywords
  try {
    console.log("\nTest 3: Query filtering by category and keywords");
    const scrollTechs = queryTechniques({ category: "scroll-reveal" });
    if (scrollTechs.length === 0) {
      throw new Error("Expected at least 1 technique in 'scroll-reveal' category");
    }

    const keywordTechs = queryTechniques({ keyword: "kinetic" });
    if (keywordTechs.length === 0) {
      throw new Error("Expected at least 1 technique matching keyword 'kinetic'");
    }
    console.log(`✅ Passed: Category query returned ${scrollTechs.length} items; keyword query returned ${keywordTechs.length} items.`);
    passed++;
  } catch (err: any) {
    console.error("❌ Test 3 Failed:", err.message);
    failed++;
  }

  // Test 4: Intelligent recommendation matching
  try {
    console.log("\nTest 4: Contextual technique recommendation");
    
    // Test matching scroll/conveyor intent
    const rec1 = recommendTechnique("Hook scene with endless conveyor belt cards flowing down");
    if (!rec1 || rec1.id !== "tech-conveyor-belt-3d") {
      throw new Error(`Expected recommendation 'tech-conveyor-belt-3d', got '${rec1?.id}'`);
    }
    console.log(`✅ Passed: Recommended "${rec1.name}" for conveyor belt scene.`);

    // Test matching cursor click intent
    const rec2 = recommendTechnique("User clicks primary CTA button with mouse pointer");
    if (!rec2 || rec2.id !== "tech-bezier-cursor-interaction") {
      throw new Error(`Expected recommendation 'tech-bezier-cursor-interaction', got '${rec2?.id}'`);
    }
    console.log(`✅ Passed: Recommended "${rec2.name}" for CTA click interaction.`);

    // Test matching kinetic text intent
    const rec3 = recommendTechnique("Kinetic typography headline with glow punch on keywords");
    if (!rec3 || rec3.id !== "tech-kinetic-glow-punch") {
      throw new Error(`Expected recommendation 'tech-kinetic-glow-punch', got '${rec3?.id}'`);
    }
    console.log(`✅ Passed: Recommended "${rec3.name}" for kinetic typography headline.`);

    passed++;
  } catch (err: any) {
    console.error("❌ Test 4 Failed:", err.message);
    failed++;
  }

  // Test 5: Dynamic technique registration (Memory & Persistence)
  try {
    console.log("\nTest 5: Registering and saving a new custom technique dynamically");
    const newTechnique: TechniqueRecipe = {
      id: "tech-custom-hologram-shimmer",
      name: "Custom Holographic Shimmer Wipe",
      category: "scene-transition",
      description: "Prismatic diagonal chromatic aberration wipe across the screen.",
      visualPurpose: "High-energy futuristic brand transition beat.",
      whenToUse: ["hologram", "shimmer", "prismatic", "chromatic wipe"],
      targetPrimitive: "particle-tunnel",
      motionCurve: "whip",
      parameters: {
        shimmerAngle: 45,
        chromaticOffset: 8,
      },
      defaultProps: {
        direction: "inward",
      },
      codeSnippet: "// Custom holographic shimmer implementation",
      provenIn: "Unit Test Custom Memory",
      qualityRating: 9.9,
      tags: ["hologram", "shimmer", "wipe", "custom"],
    };

    saveTechnique(newTechnique);

    const retrieved = getTechnique("tech-custom-hologram-shimmer");
    if (!retrieved) {
      throw new Error("Saved custom technique was not found in registry");
    }
    if (retrieved.name !== "Custom Holographic Shimmer Wipe") {
      throw new Error(`Unexpected technique name: ${retrieved.name}`);
    }

    const recCustom = recommendTechnique("High energy prismatic hologram shimmer wipe");
    if (recCustom?.id !== "tech-custom-hologram-shimmer") {
      throw new Error(`Expected custom recommendation, got ${recCustom?.id}`);
    }

    console.log(`✅ Passed: Successfully saved, retrieved, and recommended custom technique "${retrieved.name}".`);
    passed++;
  } catch (err: any) {
    console.error("❌ Test 5 Failed:", err.message);
    failed++;
  }

  // Test 6: Code snippet retrieval
  try {
    console.log("\nTest 6: Retrieving verified code snippet from bank");
    const snippet = techniqueBank.getCodeSnippet("tech-conveyor-belt-3d");
    if (!snippet || !snippet.includes("interpolateWithCurve") || !snippet.includes("MotionCurves.glide")) {
      throw new Error("Snippet did not contain expected motion curves code");
    }
    console.log(`✅ Passed: Verified code snippet retrieved correctly (${snippet.length} chars).`);
    passed++;
  } catch (err: any) {
    console.error("❌ Test 6 Failed:", err.message);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`📊 Verification Complete: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTechniqueBankTests().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});

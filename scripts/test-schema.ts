import { MotionIRSchema, resolveColor } from "../src/schema";
import sampleAd from "../examples/saas-product-ad.json";

function runTests() {
  console.log("🧪 Running MotionIR validation tests...\n");

  // Test 1: Validate sample JSON
  try {
    const parsed = MotionIRSchema.parse(sampleAd);
    console.log("✅ Test 1 Passed: Sample MotionIR JSON validates successfully.");
    console.log(`   - ID: ${parsed.id}`);
    console.log(`   - Brand: ${parsed.brand.name}`);
    console.log(`   - Scenes count: ${parsed.scenes.length}`);
    const totalFrames = parsed.scenes.reduce((sum, s) => sum + s.durationFrames, 0);
    console.log(`   - Total duration: ${totalFrames} frames (${(totalFrames / (parsed.meta?.fps || 30)).toFixed(1)}s)`);
  } catch (err: any) {
    console.error("❌ Test 1 Failed: Could not parse sample JSON", err);
    process.exit(1);
  }

  // Test 2: Color resolution
  const mockBrand = {
    name: "TestBrand",
    colors: {
      primary: "#FF5500",
      secondary: "#CC4400",
      accent: "#00FF88",
      background: "#111111",
      text: "#FFFFFF",
      muted: "#888888",
    },
    font: "Inter",
  };

  const resolvedPrimary = resolveColor("brand.primary", mockBrand);
  if (resolvedPrimary !== "#FF5500") {
    console.error(`❌ Test 2 Failed: Expected #FF5500, got ${resolvedPrimary}`);
    process.exit(1);
  }

  const resolvedLiteral = resolveColor("#123456", mockBrand);
  if (resolvedLiteral !== "#123456") {
    console.error(`❌ Test 2 Failed: Expected literal #123456, got ${resolvedLiteral}`);
    process.exit(1);
  }
  console.log("✅ Test 2 Passed: Brand color resolution logic is verified.");

  // Test 3: Rejection of invalid schema
  try {
    MotionIRSchema.parse({
      id: "invalid-ad",
      brand: { name: "No Colors" },
      scenes: [
        {
          id: "bad-scene",
          // Missing required durationFrames
          elements: [],
        },
      ],
    });
    console.error("❌ Test 3 Failed: Invalid schema should have thrown an error.");
    process.exit(1);
  } catch (err) {
    console.log("✅ Test 3 Passed: Incomplete MotionIR was correctly rejected by Zod.");
  }

  console.log("\n🎉 All schema tests passed!\n");
}

runTests();

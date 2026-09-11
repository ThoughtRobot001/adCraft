import { AdPipeline } from "../src/pipeline";
import { MotionIRSchema } from "../src/schema";
import { VisualCritic } from "../src/stages/visual-critic";
import { SceneReviser } from "../src/stages/scene-reviser";

async function runStudioTests() {
  console.log("🧪 Starting AdCraft Creative Studio Automated Verification...\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Brand Analyst + Concept Strategist variety
  try {
    console.log("Test 1: Multi-concept generation and distinct angles");
    const pipeline = new AdPipeline();
    const result = await pipeline.generateAd({
      brand: {
        name: "Vercel",
        tagline: "Develop. Preview. Ship.",
        colors: { primary: "#000000", accent: "#0070F3" },
      },
      brief: {
        productName: "Vercel",
        productDescription: "The frontend cloud platform",
        goal: "feature_launch",
        keyFeatures: ["Edge Functions", "Instant Rollbacks", "Turbopack"],
        metricsOrSocialProof: { metric: "350ms", label: "GLOBAL EDGE LATENCY" },
      },
      skipRender: true,
    });

    if (result.conceptCandidates.length >= 3) {
      console.log(`✅ Passed: Produced ${result.conceptCandidates.length} distinct concept candidates.`);
      passed++;
    } else {
      console.error("❌ Failed: Did not produce 3 distinct concepts.");
      failed++;
    }

    if (result.storyboard.scenes.length >= 3) {
      console.log(`✅ Passed: Mandatory Storyboard designed with ${result.storyboard.scenes.length} scenes.`);
      passed++;
    } else {
      console.error("❌ Failed: Storyboard missing scenes.");
      failed++;
    }

    // Verify MotionIR validation
    MotionIRSchema.parse(result.motionIR);
    console.log("✅ Passed: MotionIR specification strictly validated against schema.");
    passed++;
  } catch (err: any) {
    console.error("❌ Test 1 Error:", err.message);
    failed++;
  }

  // Test 2: Visual Critic Quality Gate & Revision Loop
  try {
    console.log("\nTest 2: Visual Critic & Scene Reviser");
    const critic = new VisualCritic();
    const reviser = new SceneReviser();

    // Create an intentionally flawed MotionIR (tiny font 24px and overlapping Y positions)
    const flawedIR: any = {
      id: "flawed-test-ad",
      meta: { title: "Flawed Ad", fps: 30, width: 1080, height: 1920 },
      brand: {
        name: "TestBrand",
        colors: { primary: "#FF0000", background: "#000000" },
        font: "sans-serif",
      },
      scenes: [
        {
          id: "s1",
          durationFrames: 45, // Too fast (1.5s)
          background: { type: "gradient" },
          transition: { type: "fade" },
          elements: [
            {
              id: "e1",
              type: "kinetic-text",
              props: { text: "Too small headline", fontSize: 24, position: { x: 50, y: 50 } },
            },
            {
              id: "e2",
              type: "cta-button",
              props: { text: "Click Here", position: { x: 50, y: 54 } }, // Overlapping (diff 4%)
            },
          ],
        },
      ],
    };

    const initialCritique = critic.critique(flawedIR);
    console.log(`   Initial Flawed Score: ${initialCritique.overallScore}/10 (Passed: ${initialCritique.passedThreshold})`);

    if (initialCritique.revisionRequired) {
      console.log("✅ Passed: Visual Critic detected flaws and required revision.");
      passed++;

      const revisedIR = reviser.revise(flawedIR, initialCritique);
      const secondCritique = critic.critique(revisedIR);
      console.log(`   Revised Score: ${secondCritique.overallScore}/10`);

      if (secondCritique.overallScore > initialCritique.overallScore) {
        console.log("✅ Passed: Scene Reviser successfully improved design quality score.");
        passed++;
      } else {
        console.error("❌ Failed: Revision did not improve quality score.");
        failed++;
      }
    } else {
      console.error("❌ Failed: Critic did not flag flawed ad.");
      failed++;
    }
  } catch (err: any) {
    console.error("❌ Test 2 Error:", err.message);
    failed++;
  }

  // Test 3: New Primitives (SplitScreen, ComparisonTable, TestimonialCard, ProgressBar)
  try {
    console.log("\nTest 3: Schema validation for new primitives");
    const complexIR: any = {
      id: "complex-primitives-ad",
      meta: { title: "Complex Primitives", fps: 30, width: 1080, height: 1920 },
      brand: {
        name: "Acme Cloud",
        colors: { primary: "#6366F1", accent: "#10B981", background: "#090D16" },
        font: "system-ui",
      },
      scenes: [
        {
          id: "scene-split",
          durationFrames: 90,
          background: { type: "gradient" },
          transition: { type: "fade" },
          elements: [
            {
              id: "split-1",
              type: "split-screen",
              props: {
                left: { title: "Legacy Slow Setup", items: ["Manual configs", "Downtime"] },
                right: { title: "Acme Velocity", items: ["Zero config", "Instant deploys"] },
              },
            },
          ],
        },
        {
          id: "scene-comparison",
          durationFrames: 90,
          background: { type: "gradient" },
          transition: { type: "fade" },
          elements: [
            {
              id: "comp-1",
              type: "comparison-table",
              props: {
                rows: [
                  { feature: "Edge Functions", brandHas: true, competitorHas: false },
                  { feature: "Sub-50ms Cold Starts", brandHas: true, competitorHas: false },
                ],
              },
            },
          ],
        },
        {
          id: "scene-testimonial",
          durationFrames: 90,
          background: { type: "gradient" },
          transition: { type: "fade" },
          elements: [
            {
              id: "testi-1",
              type: "testimonial-card",
              props: {
                quote: "Acme cut our cycle time from days to under 5 minutes.",
                author: "Sarah Chen",
                role: "VP of Engineering",
                company: "Stripe",
              },
            },
          ],
        },
        {
          id: "scene-progress",
          durationFrames: 90,
          background: { type: "gradient" },
          transition: { type: "fade" },
          elements: [
            {
              id: "prog-1",
              type: "progress-bar",
              props: {
                label: "COLD START LATENCY",
                value: 98,
                displayValue: "42ms",
              },
            },
          ],
        },
      ],
    };

    MotionIRSchema.parse(complexIR);
    console.log("✅ Passed: All 4 new primitives passed MotionIR schema validation.");
    passed++;
  } catch (err: any) {
    console.error("❌ Test 3 Error:", err.message);
    failed++;
  }

  // Test 4: Phase 5 Benchmark Primitives & Seamless Transitions
  try {
    console.log("\nTest 4: Benchmark primitives & transition duration computation");
    const benchmarkIR: any = {
      id: "benchmark-fintech-ad",
      meta: { title: "BlinkCash Benchmark Ad", fps: 30, width: 1080, height: 1920 },
      brand: {
        name: "BlinkCash",
        tagline: "Instant Stablecoin Savings",
        colors: { primary: "#00E599", accent: "#38BDF8", background: "#090D16" },
        font: "system-ui",
      },
      audio: {
        src: "https://example.com/audio.mp3",
        sfx: [
          { type: "whoosh", atFrame: 10, volume: 0.8 },
          { type: "click", atFrame: 70, volume: 1.0 },
        ],
      },
      scenes: [
        {
          id: "s-phone",
          durationFrames: 90,
          background: { type: "gradient" },
          transition: { type: "slide-left", presentation: "slide", direction: "from-right", durationFrames: 15 },
          elements: [
            {
              id: "phone-1",
              type: "phone-mockup",
              props: {
                title: "BlinkCash",
                appCategory: "fintech",
                theme: "dark",
                screenType: "wallet",
                value: "$27.38",
                pedestal: true,
                badges: [
                  { text: "⚡ +5.4% APY", position: "orbit-left" },
                  { text: "🔒 Zero Gas", position: "orbit-right" },
                ],
              },
            },
            {
              id: "cursor-1",
              type: "cursor-interaction",
              props: {
                from: { x: 20, y: 85 },
                to: { x: 50, y: 55 },
                clickAtFrame: 35,
                clickRipple: true,
                cursorType: "hand",
              },
            },
          ],
        },
        {
          id: "s-tunnel",
          durationFrames: 90,
          background: { type: "solid", color: "#000000" },
          transition: { type: "fade", presentation: "fade", durationFrames: 15 },
          elements: [
            {
              id: "tunnel-1",
              type: "particle-tunnel",
              props: {
                speed: 20,
                density: 200,
                color: "brand.primary",
                direction: "outward",
              },
            },
          ],
        },
      ],
    };

    const parsed = MotionIRSchema.parse(benchmarkIR);
    console.log("✅ Passed: PhoneMockup, CursorInteraction, and ParticleTunnel validated against schema.");
    passed++;

    // Verify transition duration overlap calculation
    const { computeTotalDurationFrames } = await import("../src/compositions/AdComposition");
    const totalFrames = computeTotalDurationFrames(parsed.scenes);
    // 90 + 90 - 15 (overlap) = 165 frames
    if (totalFrames === 165) {
      console.log(`✅ Passed: computeTotalDurationFrames correctly accounts for transition overlaps (165 frames).`);
      passed++;
    } else {
      console.error(`❌ Failed: computeTotalDurationFrames returned ${totalFrames}, expected 165.`);
      failed++;
    }
  } catch (err: any) {
    console.error("❌ Test 4 Error:", err.message);
    failed++;
  }

  console.log("\n============================================");
  console.log(`VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("============================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runStudioTests();


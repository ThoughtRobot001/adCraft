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

  // Test 5: Broadcast Parity (16:9 Landscape, Editorial Theme, New Primitives)
  try {
    console.log("\nTest 5: Broadcast 16:9 Widescreen Parity & New Primitives (Wordsmith Benchmark)");
    const wordsmithIR: any = {
      id: "wordsmith-benchmark-ad",
      meta: { title: "Wordsmith AI Legal Agent", fps: 30, width: 1920, height: 1080, aspectRatio: "16:9" },
      brand: {
        name: "Wordsmith",
        tagline: "The AI Legal Team for Enterprise",
        theme: "editorial-light",
        serifFont: "'Newsreader', 'Playfair Display', Georgia, serif",
        colors: { primary: "#1E293B", accent: "#10B981", background: "#F8F7F3", text: "#0F172A", muted: "#64748B" },
      },
      audio: {
        sfx: [
          { type: "whoosh", atFrame: 75, volume: 0.6 },
          { type: "click", atFrame: 120, volume: 0.8 },
          { type: "impact", atFrame: 160, volume: 0.9 },
        ],
      },
      scenes: [
        {
          id: "s-hook-notifications",
          durationFrames: 90,
          camera: { shot: "fly-through", intensity: "aggressive", ease: "cinematic" },
          atmosphere: { grain: 0.14, vignette: 0.32, haze: 0.1 },
          heroElementId: "ws-cascade",
          layoutStrategy: "hero-centered",
          background: { type: "gradient", color: "#F8F7F3", gradientTo: "#F1EFE9" },
          transition: { type: "none", presentation: "none", durationFrames: 15 },
          elements: [
            {
              id: "ws-title",
              type: "kinetic-text",
              importance: "supporting",
              z: -24,
              parallax: 0.22,
              props: {
                text: "Your Legal Queue Never Sleeps",
                fontSize: 58,
                fontWeight: 800,
                position: { x: 50, y: 22 },
                animation: "cinematic-scale",
                fontFamily: "'Newsreader', serif",
              },
            },
            {
              id: "ws-cascade",
              type: "notification-cascade",
              importance: "hero",
              z: 48,
              parallax: 0.08,
              props: {
                width: 65,
                position: { x: 50, y: 58 },
                items: [
                  { app: "slack", sender: "#deal-desk", message: "Review MSA for Series C round", tag: "Contract" },
                  { app: "compliance", sender: "DORA Compliance", message: "Automated vendor audit ready", tag: "Passed" },
                ],
              },
            },
          ],
        },
        {
          id: "s-execution-task",
          durationFrames: 90,
          camera: { shot: "push-in", intensity: "medium", ease: "cinematic" },
          atmosphere: { grain: 0.14, vignette: 0.32, haze: 0.1 },
          heroElementId: "ws-agent-card",
          layoutStrategy: "split-depth",
          background: { type: "gradient", color: "#F8F7F3", gradientTo: "#F1EFE9" },
          transition: { type: "none", presentation: "none", durationFrames: 15 },
          elements: [
            {
              id: "ws-agent-card",
              type: "agent-task-card",
              importance: "hero",
              z: 48,
              parallax: 0.08,
              props: {
                title: "Autonomous MSA Review",
                status: "Executing",
                actionText: "Review & Sign",
                width: 60,
                position: { x: 50, y: 52 },
                items: [
                  { text: "Parse Enterprise Indemnification", status: "completed", tag: "Done" },
                  { text: "Highlight liability caps", status: "in-progress", tag: "Scanning" },
                ],
              },
            },
            {
              id: "ws-prompt-box",
              type: "prompt-input",
              importance: "supporting",
              z: -24,
              parallax: 0.22,
              props: {
                promptText: "Draft revised intellectual property carveouts",
                width: 60,
                position: { x: 50, y: 86 },
              },
            },
          ],
        },
        {
          id: "s-kanban-full",
          durationFrames: 90,
          camera: { shot: "orbit", intensity: "subtle", ease: "cinematic" },
          atmosphere: { grain: 0.14, vignette: 0.32, haze: 0.1 },
          heroElementId: "ws-kanban",
          layoutStrategy: "hero-centered",
          background: { type: "gradient", color: "#F8F7F3", gradientTo: "#F1EFE9" },
          transition: { type: "none", presentation: "none", durationFrames: 15 },
          elements: [
            {
              id: "ws-kanban",
              type: "app-window",
              importance: "hero",
              z: 48,
              parallax: 0.08,
              props: {
                title: "Wordsmith Legal Command",
                url: "app.wordsmith.ai/workspace",
                mockType: "diff",
                theme: "light",
                width: 88,
                position: { x: 50, y: 55 },
              },
            },
          ],
        },
        {
          id: "s-bento-proof",
          durationFrames: 90,
          camera: { shot: "pull-back", intensity: "medium", ease: "cinematic" },
          atmosphere: { grain: 0.14, vignette: 0.32, haze: 0.1 },
          heroElementId: "ws-bento",
          layoutStrategy: "hero-centered",
          background: { type: "gradient", color: "#F8F7F3", gradientTo: "#F1EFE9" },
          transition: { type: "none", presentation: "none", durationFrames: 15 },
          elements: [
            {
              id: "ws-bento",
              type: "bento-grid",
              importance: "hero",
              z: 48,
              parallax: 0.08,
              props: {
                cards: [
                  { id: "hero-diff", type: "diff-preview" },
                  { id: "metric-stat", type: "metric-stat" },
                  { id: "audit-feed", type: "audit-feed" },
                ],
                position: { x: 50, y: 52 },
                width: 90,
              },
            },
          ],
        },
      ],
    };

    // Strict validation
    const parsedWs = MotionIRSchema.parse(wordsmithIR);
    console.log("✅ Passed: 16:9 Widescreen, NotificationCascade, AgentTaskCard, PromptInput, BentoGrid & diff mock passed schema validation.");
    passed++;

    // Evaluate with Visual Critic
    const critic = new VisualCritic();
    const critique = critic.critique(parsedWs);
    console.log(`   Wordsmith 16:9 Quality Score: ${critique.overallScore}/10 (Passed: ${critique.passedThreshold})`);

    if (critique.passedThreshold) {
      console.log(`✅ Passed: 16:9 Broadcast composition passed the Visual Critic gate (>= 7.0/10).`);
      passed++;
    } else {
      console.error(`❌ Failed: Visual critic score (${critique.overallScore}) fell below 7.0 gate.`);
      failed++;
    }
  } catch (err: any) {
    console.error("❌ Test 5 Error:", err.message);
    failed++;
  }

  // Test 6: Curated Asset Bank Integration & Quality Gate
  try {
    console.log("\nTest 6: Curated Asset Bank Integration & Quality Gate");
    const { selectVisualKit, ALL_ASSETS, ALL_VISUAL_KITS } = await import("../src/asset-bank");
    const { ArtDirector } = await import("../src/stages/art-director");
    const { MotionIRCompiler } = await import("../src/stages/motionir-compiler");
    const { SceneReviser } = await import("../src/stages/scene-reviser");

    // 1. Verify Asset Bank catalog completeness
    if (ALL_ASSETS.length >= 30 && ALL_VISUAL_KITS.length >= 8) {
      console.log(`✅ Passed: Asset Bank catalog contains ${ALL_ASSETS.length} assets and ${ALL_VISUAL_KITS.length} visual kits.`);
      passed++;
    } else {
      console.error(`❌ Failed: Expected >= 30 assets and >= 8 visual kits, got ${ALL_ASSETS.length} / ${ALL_VISUAL_KITS.length}`);
      failed++;
    }

    // 2. Verify Intelligent Visual Kit Selection
    const editorialProfile: any = {
      identity: {
        name: "Wordsmith",
        theme: "editorial-light",
        colors: { background: "#F8F7F3", primary: "#1E293B", text: "#0F172A", accent: "#10B981" },
      },
      voice: { tone: "authoritative" },
    };
    const editorialBrief: any = {
      productName: "Wordsmith",
      aspectRatio: "16:9",
      goal: "enterprise_demo",
    };
    const selectedEditorialKit = selectVisualKit(editorialProfile, editorialBrief);
    if (selectedEditorialKit.id === "kit-editorial-light") {
      console.log(`✅ Passed: selectVisualKit correctly matched editorial light brand to 'kit-editorial-light'.`);
      passed++;
    } else {
      console.error(`❌ Failed: Expected 'kit-editorial-light', got '${selectedEditorialKit.id}'.`);
      failed++;
    }

    const techProfile: any = {
      identity: {
        name: "NeonDB",
        theme: "dark",
        colors: { background: "#0B0F19", primary: "#00E599", text: "#FFFFFF", accent: "#6366F1" },
      },
      voice: { tone: "technical" },
    };
    const techBrief: any = {
      productName: "NeonDB",
      aspectRatio: "16:9",
      goal: "developer_signup",
    };
    const selectedTechKit = selectVisualKit(techProfile, techBrief);
    if (selectedTechKit.id === "kit-clean-tech" || selectedTechKit.id === "kit-cinematic-dark") {
      console.log(`✅ Passed: selectVisualKit matched technical brand to curated dark kit '${selectedTechKit.id}'.`);
      passed++;
    } else {
      console.error(`❌ Failed: Expected technical dark kit, got '${selectedTechKit.id}'.`);
      failed++;
    }

    // 2b. Verify Creative / Aurora Kit Matching
    const auroraProfile: any = {
      identity: {
        name: "Lumina AI",
        theme: "dark",
        colors: { background: "#060A14", primary: "#6366F1", text: "#FFFFFF", accent: "#00F0FF" },
      },
      voice: { tone: "creative" },
    };
    const auroraBrief: any = {
      productName: "Lumina AI",
      aspectRatio: "16:9",
      goal: "feature_launch",
    };
    const selectedAuroraKit = selectVisualKit(auroraProfile, auroraBrief);
    if (selectedAuroraKit.id === "kit-boreal-aurora") {
      console.log(`✅ Passed: selectVisualKit matched creative tone to 'kit-boreal-aurora'.`);
      passed++;
    } else {
      console.error(`❌ Failed: Expected 'kit-boreal-aurora', got '${selectedAuroraKit.id}'.`);
      failed++;
    }

    // 2c. Verify Fintech / Mobile Kit Matching
    const fintechProfile: any = {
      identity: {
        name: "NovaPay",
        theme: "dark",
        colors: { background: "#0A0D14", primary: "#0052FF", text: "#FFFFFF", accent: "#00D395" },
      },
      voice: { tone: "authoritative" },
    };
    const fintechBrief: any = {
      productName: "NovaPay",
      aspectRatio: "9:16",
      goal: "mobile_download",
    };
    const selectedFintechKit = selectVisualKit(fintechProfile, fintechBrief);
    if (selectedFintechKit.id === "kit-fintech-mobile") {
      console.log(`✅ Passed: selectVisualKit matched 9:16 mobile goal to 'kit-fintech-mobile'.`);
      passed++;
    } else {
      console.error(`❌ Failed: Expected 'kit-fintech-mobile', got '${selectedFintechKit.id}'.`);
      failed++;
    }

    // 3. ArtDirector pipeline execution with kit tagging
    const mockStoryboard: any = {
      scenes: [
        {
          id: "s-hook",
          act: "hook",
          durationSeconds: 3.5,
          headlineCopy: "Manual contract review is draining your deals.",
          elementIntents: [
            { role: "headline", priority: "hero" },
            { role: "app-window", priority: "supporting" },
          ],
        },
        {
          id: "s-cta",
          act: "cta",
          durationSeconds: 3.5,
          headlineCopy: "Ship contracts at lightspeed.",
          elementIntents: [
            { role: "headline", priority: "hero" },
            { role: "cta-button", priority: "supporting" },
          ],
        },
      ],
      estimatedDurationSeconds: 7.0,
      totalScenes: 2,
    };

    const artDirector = new ArtDirector();
    const directedScenes = artDirector.direct(mockStoryboard, editorialProfile, editorialBrief);

    const hasKitOnScene = directedScenes.every((s) => s.visualKit?.id === "kit-editorial-light");
    const hasTaggedButton = directedScenes.some((s) =>
      s.elements.some((el) => el.type === "cta-button" && el.buttonStyleId === "btn-minimal-editorial")
    );

    if (hasKitOnScene && hasTaggedButton) {
      console.log("✅ Passed: ArtDirector assigned VisualKit and tagged primitives with curated asset IDs.");
      passed++;
    } else {
      console.error("❌ Failed: ArtDirector did not properly tag scenes or primitives with curated asset IDs.");
      failed++;
    }

    // 4. MotionIRCompiler forwards visualKit and element asset styling
    const compiler = new MotionIRCompiler();
    const compiledIR = compiler.compile(directedScenes, editorialProfile, editorialBrief);

    if (compiledIR.visualKit?.id === "kit-editorial-light" && compiledIR.scenes[0].backgroundAssetId === "bg-editorial-sand-grain") {
      console.log("✅ Passed: MotionIRCompiler compiled and validated root visualKit and scene asset references.");
      passed++;
    } else {
      console.error("❌ Failed: MotionIRCompiler did not preserve visualKit or scene backgroundAssetId.");
      failed++;
    }

    // 5. VisualCritic detects style mismatch and SceneReviser repairs it
    const mismatchedIR = JSON.parse(JSON.stringify(compiledIR));
    mismatchedIR.scenes[0].backgroundAssetId = "bg-cyber-obsidian-glow"; // Mismatch on editorial light brand!

    const critic = new VisualCritic();
    const critiqueMismatch = critic.critique(mismatchedIR);
    const allMismatchIssues = critiqueMismatch.scenes.flatMap((s) => s.issues);
    const hasMismatchIssue = allMismatchIssues.some((iss) => iss.category === "asset-kit");

    if (hasMismatchIssue) {
      console.log("✅ Passed: VisualCritic flagged asset-kit style mismatch on editorial light brand.");
      passed++;
    } else {
      console.error("❌ Failed: VisualCritic did not flag asset-kit mismatch penalty.");
      failed++;
    }

    // Test SceneReviser repair of asset-kit mismatch
    const reviser = new SceneReviser();
    const revisedIR = reviser.revise(mismatchedIR, critiqueMismatch);

    if (revisedIR.scenes[0].backgroundAssetId === "bg-editorial-sand-grain") {
      console.log("✅ Passed: SceneReviser surgically corrected asset-kit mismatch back to editorial sand.");
      passed++;
    } else {
      console.error(`❌ Failed: SceneReviser did not correct backgroundAssetId, got ${revisedIR.scenes[0].backgroundAssetId}.`);
      failed++;
    }

  } catch (err: any) {
    console.error("❌ Test 6 Error:", err.message);
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


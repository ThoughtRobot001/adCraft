import { Brand, Element, SceneBackground, SceneTransition } from "../schema";
import { CampaignBrief } from "../ai/types";
import { ArtDirectedScene, BrandProfile, Storyboard, StoryboardScene } from "./types";

export class ArtDirector {
  direct(
    storyboard: Storyboard,
    profile: BrandProfile,
    brief: CampaignBrief
  ): ArtDirectedScene[] {
    console.log("🎨 [Stage 4/7 - Art Director] Art directing scenes with visual hierarchy & typography...");

    return storyboard.scenes.map((scene, index) =>
      this.directScene(scene, index, profile, brief, storyboard.scenes.length, storyboard)
    );
  }

  private directScene(
    scene: StoryboardScene,
    index: number,
    profile: BrandProfile,
    brief: CampaignBrief,
    totalScenes: number,
    storyboard: Storyboard
  ): ArtDirectedScene {
    const brand = profile.identity;
    const isFirst = index === 0;
    const isLast = index === totalScenes - 1;

    // Theme detection: light-mode support for modern consumer & fintech apps (Astra / BlinkCash style)
    const isLightTheme = (brand.colors.background && (brand.colors.background.toLowerCase() === "#ffffff" || brand.colors.background.toLowerCase() === "#f8fafc" || brand.colors.background.toLowerCase() === "#f1f5f9")) || profile.voice.tone === "minimalist";

    // Background selection based on narrative mood and theme
    const background: SceneBackground = {
      type: "gradient",
      color: isLightTheme ? (brand.colors.background || "#F8FAFC") : (brand.colors.background || "#090D16"),
      gradientTo: isLightTheme
        ? (isFirst ? "#F1F5F9" : isLast ? "#E2E8F0" : "#F8FAFC")
        : (isFirst
          ? "#0F172A"
          : isLast
          ? "#1E1B4B"
          : index % 2 === 1
          ? "#1E1B4B"
          : "#064E3B"),
      angle: 135,
      glowOrb: !isLightTheme,
    };

    // Seamless transitions tailored to scene progression (no dip-through-black)
    const transition: SceneTransition = {
      type: isFirst ? "slide-left" : index % 2 === 1 ? "fade" : "slide-left",
      presentation: isFirst ? "slide" : index % 2 === 1 ? "fade" : "slide",
      direction: "from-right",
      durationFrames: 15,
    };

    const elements: Element[] = [];

    // Helper to detect mockType based on context
    const detectMockType = (): "code" | "analytics" | "chat" | "kanban" => {
      const text = `${brand.name} ${brief.productDescription || ""} ${brief.keyFeatures?.join(" ") || ""} ${scene.visualDescription || ""}`.toLowerCase();
      if (text.includes("kanban") || text.includes("issue") || text.includes("tracker") || text.includes("triage") || text.includes("sprint") || text.includes("cycle")) {
        return "kanban";
      }
      if (text.includes("terminal") || text.includes("code") || text.includes("cli") || text.includes("api") || text.includes("bash") || text.includes("sql") || text.includes("database") || text.includes("postgres")) {
        return "code";
      }
      if (text.includes("chat") || text.includes("ai assistant") || text.includes("message") || text.includes("copilot")) {
        return "chat";
      }
      return "analytics";
    };

    const roleMatches = (role: string, ...keywords: string[]): boolean => {
      const lower = role.toLowerCase().replace(/[-_]/g, " ");
      return keywords.some((kw) => lower.includes(kw));
    };

    // 1. Map element intents to concrete primitives
    for (const intent of scene.elementIntents) {
      const role = intent.role || "";

      // A. Headline / Text Copy
      if (roleMatches(role, "headline", "hook", "title", "statement", "agitation", "copy", "text")) {
        const isHook = isFirst;
        elements.push({
          id: `${scene.id}-headline`,
          type: "kinetic-text",
          props: {
            text: scene.headlineCopy || brand.tagline || brand.name,
            fontSize: isHook ? 66 : isLast ? 54 : 56,
            fontWeight: 800,
            color: "brand.text",
            position: { x: 50, y: isHook ? 38 : isLast ? 22 : 18 },
            align: "center",
            animation: isHook ? "word-by-word" : "fade-up",
            delay: 0,
            maxWidth: 90,
            highlightWords: isHook
              ? ["manually?", "broken", "losing", "15+", "hours", "trap", "drift", "admin"]
              : [brief.productName.toLowerCase(), "automate", "milliseconds", "velocity", "10x"],
          },
        });
      }

      // B. Product Showcase / Phone Mockup / UI Mockup / Terminal / Code / Kanban
      else if (roleMatches(role, "product", "demo", "mockup", "app", "window", "dashboard", "interface", "terminal", "code", "kanban", "phone", "mobile", "wallet")) {
        const isMobileOrFintech = (): boolean => {
          const text = `${brand.name} ${brief.productDescription || ""} ${brief.keyFeatures?.join(" ") || ""} ${scene.visualDescription || ""} ${role}`.toLowerCase();
          return /phone|mobile|wallet|fintech|crypto|stablecoin|yield|deposit|cash|bank|savings|ios|android|app\b|duolingo|language|ticket|lottery/.test(text);
        };

        if (isMobileOrFintech()) {
          const text = `${brand.name} ${brief.productDescription || ""} ${brief.keyFeatures?.join(" ") || ""}`.toLowerCase();
          const screenType = text.includes("language") || text.includes("learn") ? "learning" : text.includes("prompt") || text.includes("chat") ? "prompt" : "wallet";
          const rawMetric = brief.metricsOrSocialProof?.metric || "$27.38";

          elements.push({
            id: `${scene.id}-phone-mockup`,
            type: "phone-mockup",
            props: {
              title: brand.name,
              appCategory: "fintech",
              theme: isLightTheme ? "light" : "dark",
              screenType,
              headline: brand.tagline || `${brand.name} Mobile`,
              value: rawMetric,
              width: 78,
              position: { x: 50, y: 56 },
              tilt: true,
              rotateY: -8,
              rotateX: 10,
              pedestal: true,
              delay: 6,
              badges: [
                {
                  text: brief.keyFeatures?.[0] || "Instant Yield",
                  icon: "⚡",
                  color: "brand.primary",
                  position: "orbit-left",
                },
                {
                  text: brief.keyFeatures?.[1] || "Zero Gas Fees",
                  icon: "🔒",
                  color: "brand.accent",
                  position: "orbit-right",
                },
              ],
            },
          });

          // Interactive cursor clicking on phone action button
          elements.push({
            id: `${scene.id}-cursor`,
            type: "cursor-interaction",
            props: {
              from: { x: 22, y: 88 },
              to: { x: 50, y: 58 },
              clickAtFrame: 38,
              clickRipple: true,
              cursorType: "hand",
              color: "#FFFFFF",
              durationFrames: 50,
              delay: 14,
            },
          });
        } else {
          const mockType = detectMockType();
          elements.push({
            id: `${scene.id}-app-window`,
            type: "app-window",
            props: {
              title: `${brand.name} Command Engine`,
              url: brief.websiteUrl || `app.${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.io`,
              mockType,
              width: 92,
              position: { x: 50, y: 58 },
              tilt: true,
              shadow: true,
              delay: 8,
              animation: "float-up",
              badges: [
                {
                  text: `⚡ ${brief.keyFeatures?.[0] || "Instant Keyboard Sync"}`,
                  position: "top-right",
                  color: "brand.primary",
                },
                {
                  text: `🔒 ${brief.keyFeatures?.[1] || "Zero-Latency Cycles"}`,
                  position: "bottom-left",
                  color: "brand.accent",
                },
              ],
            },
          });
        }
      }

      // C. Metric / Data / Counter / Social Proof Numbers
      else if (roleMatches(role, "metric", "stat", "counter", "number", "growth", "proof", "velocity")) {
        const rawMetric = brief.metricsOrSocialProof?.metric || "10x";
        const val = parseFloat(rawMetric.replace(/[^0-9.]/g, "")) || 10;
        const sfx = rawMetric.includes("x") ? "x" : rawMetric.includes("%") ? "%" : rawMetric.includes("ms") ? "ms" : "x";

        elements.push({
          id: `${scene.id}-counter`,
          type: "metric-counter",
          props: {
            label: brief.metricsOrSocialProof?.label || "CYCLE VELOCITY BOOST",
            value: val,
            suffix: sfx,
            decimals: 0,
            color: "brand.accent",
            position: { x: 50, y: 50 },
            delay: 10,
            durationFrames: 35,
            trend: "up",
            subtext: brief.metricsOrSocialProof?.subtext || "Verified across 250+ high-growth engineering teams",
          },
        });
      }

      // D. Badges / Feature Pills / Trust Signals / Problem Tags
      else if (roleMatches(role, "badge", "pill", "tag", "trust", "security", "problem", "friction", "feature")) {
        const isProblem = roleMatches(role, "problem", "friction", "pain", "terminal", "agitation");
        const isTrust = roleMatches(role, "trust", "security", "compliance");

        if (isProblem) {
          elements.push({
            id: `${scene.id}-problem-badges`,
            type: "feature-pills",
            props: {
              items: [
                { text: "❌ Fragmented Tooling", color: "#EF4444", highlight: false },
                { text: "❌ High Latency Iteration", color: "#EF4444", highlight: false },
              ],
              position: { x: 50, y: 64 },
              layout: "vertical",
              staggerFrames: 8,
              delay: 18,
            },
          });
        } else if (isTrust) {
          elements.push({
            id: `${scene.id}-trust-badges`,
            type: "feature-pills",
            props: {
              items: [
                { icon: "🛡️", text: "Enterprise SOC2 Type II", highlight: true, color: "brand.accent" },
                { icon: "⚡", text: "Zero-Downtime Migration", highlight: false },
              ],
              position: { x: 50, y: 76 },
              layout: "horizontal",
              staggerFrames: 6,
              delay: 20,
            },
          });
        } else {
          const featureItems = (brief.keyFeatures || ["Keyboard-First", "Instant Sync", "Real-Time Roadmaps"])
            .slice(0, 3)
            .map((f, i) => ({
              text: f,
              highlight: i === 0,
              color: i === 0 ? "brand.accent" : undefined,
            }));

          elements.push({
            id: `${scene.id}-feature-pills`,
            type: "feature-pills",
            props: {
              items: featureItems,
              position: { x: 50, y: 74 },
              layout: "horizontal",
              staggerFrames: 6,
              delay: 16,
            },
          });
        }
      }

      // E. Split Screen Comparison
      else if (roleMatches(role, "split", "comparison", "versus", "vs", "contrast", "before after")) {
        elements.push({
          id: `${scene.id}-split-screen`,
          type: "split-screen",
          props: {
            left: {
              title: "Legacy Tools",
              subtitle: "Slow sync & cluttered UI",
              badge: "Friction",
              color: "#EF4444",
              items: ["5s UI Lag", "Endless Menus", "Manual Triage"],
            },
            right: {
              title: brand.name,
              subtitle: "Real-time command engine",
              badge: "Velocity",
              color: "brand.primary",
              items: ["Sub-50ms", "Keyboard Shortcuts", "Autonomous Sync"],
            },
            position: { x: 50, y: 56 },
            width: 90,
            delay: 8,
          },
        });
      }

      // F. Comparison Table
      else if (roleMatches(role, "table", "matrix", "grid", "checklist")) {
        elements.push({
          id: `${scene.id}-comparison-table`,
          type: "comparison-table",
          props: {
            title: "Performance Benchmark",
            competitorName: "Legacy Trackers",
            brandName: brand.name,
            rows: [
              { feature: "Instant UI Response", brandHas: true, competitorHas: false },
              { feature: "Command Menu Shortcuts", brandHas: true, competitorHas: false },
              { feature: "Real-Time Git Bidirectional Sync", brandHas: true, competitorHas: false },
            ],
            position: { x: 50, y: 56 },
            width: 90,
            delay: 8,
          },
        });
      }

      // G. Testimonial Card
      else if (roleMatches(role, "testimonial", "quote", "review", "customer", "social proof")) {
        elements.push({
          id: `${scene.id}-testimonial`,
          type: "testimonial-card",
          props: {
            quote: `"${brand.name} revolutionized our development cycles. We ship twice as fast."`,
            author: "Head of Engineering",
            company: "Series B Scaleup",
            stars: 5,
            position: { x: 50, y: 55 },
            delay: 10,
          },
        });
      }

      // H. Progress Bar
      else if (roleMatches(role, "progress", "speed", "gauge", "latency", "meter", "benchmark")) {
        elements.push({
          id: `${scene.id}-progress-bar`,
          type: "progress-bar",
          props: {
            label: "Sprint Velocity",
            value: 98,
            displayValue: "98% Efficiency",
            color: "brand.accent",
            subtext: "Eliminated 15+ hours of manual administrative overhead",
            position: { x: 50, y: 52 },
            delay: 10,
          },
        });
      }

      // I. Call to Action Button
      else if (roleMatches(role, "cta", "button", "action", "primary", "convert", "trial", "demo")) {
        const ctaText =
          brief.goal === "book_demo"
            ? "Book a Tailored Demo"
            : brief.goal === "feature_launch"
            ? "Explore The Platform"
            : "Start Free Trial";

        elements.push({
          id: `${scene.id}-cta`,
          type: "cta-button",
          props: {
            text: ctaText,
            subtext: "No credit card required • Instant setup",
            url: brief.websiteUrl || `${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
            position: { x: 50, y: 68 },
            pulse: true,
            delay: 12,
            color: "#FFFFFF",
            backgroundColor: "brand.primary",
          },
        });
      }

      // J. Brand Monogram / Logo Reveal
      else if (roleMatches(role, "logo", "brand", "monogram", "symbol", "mark")) {
        elements.push({
          id: `${scene.id}-logo`,
          type: "logo-reveal",
          props: {
            brandName: brand.name,
            tagline: brand.tagline || "The Modern Operating System",
            size: 130,
            position: { x: 50, y: 34 },
            animation: "fade-glow",
            delay: 0,
          },
        });
      }

      // K. Particle Tunnel / Hyperspace Warp VFX (Video 7 Benchmark)
      else if (roleMatches(role, "tunnel", "warp", "particle", "vfx", "speedrun", "hyperspace", "energy")) {
        elements.push({
          id: `${scene.id}-particle-tunnel`,
          type: "particle-tunnel",
          props: {
            speed: 18,
            density: 220,
            color: "brand.primary",
            accentColor: "brand.accent",
            direction: "outward",
            streakLength: 2.8,
            delay: 0,
            fadeFrames: 12,
          },
        });
      }
    }

    // 2. Headline Guarantee: If scene has headlineCopy and NO kinetic-text was added yet, add it!
    const hasKineticText = elements.some((el) => el.type === "kinetic-text");
    if (!hasKineticText && scene.headlineCopy) {
      elements.unshift({
        id: `${scene.id}-headline-auto`,
        type: "kinetic-text",
        props: {
          text: scene.headlineCopy,
          fontSize: isFirst ? 66 : isLast ? 52 : 56,
          fontWeight: 800,
          color: "brand.text",
          position: { x: 50, y: isFirst ? 38 : isLast ? 22 : 18 },
          align: "center",
          animation: isFirst ? "word-by-word" : "fade-up",
          delay: 0,
          maxWidth: 90,
          highlightWords: isFirst
            ? ["losing", "15+", "hours", "broken", "manual"]
            : [brief.productName.toLowerCase(), "automate", "velocity", "10x"],
        },
      });
    }

    // 3. Last Scene Guarantee: The closing scene must ALWAYS include Brand Logo, Headline, and CTA Button
    if (isLast) {
      const hasLogo = elements.some((el) => el.type === "logo-reveal");
      if (!hasLogo) {
        elements.unshift({
          id: `${scene.id}-logo-auto`,
          type: "logo-reveal",
          props: {
            brandName: brand.name,
            tagline: brand.tagline || "The Modern Operating System",
            size: 120,
            position: { x: 50, y: 30 },
            animation: "scale-in",
            delay: 0,
          },
        });
      }

      const hasCTA = elements.some((el) => el.type === "cta-button");
      if (!hasCTA) {
        const ctaText =
          brief.goal === "book_demo"
            ? "Book a Tailored Demo"
            : brief.goal === "feature_launch"
            ? "Explore The Platform"
            : "Start Free Trial";

        elements.push({
          id: `${scene.id}-cta-auto`,
          type: "cta-button",
          props: {
            text: ctaText,
            subtext: "No credit card required • Instant setup",
            url: brief.websiteUrl || `${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
            position: { x: 50, y: 72 },
            pulse: true,
            delay: 12,
            color: "#FFFFFF",
            backgroundColor: "brand.primary",
          },
        });
      }

      // Closing Scene Cursor Choreography: Animate pointer clicking the primary CTA button
      const hasCursor = elements.some((el) => el.type === "cursor-interaction");
      if (!hasCursor) {
        elements.push({
          id: `${scene.id}-cta-cursor`,
          type: "cursor-interaction",
          props: {
            from: { x: 26, y: 92 },
            to: { x: 50, y: 72 },
            clickAtFrame: 34,
            clickRipple: true,
            cursorType: "pointer",
            color: "#FFFFFF",
            durationFrames: 50,
            delay: 16,
          },
        });
      }
    }

    // 4. Dead Scene Fallback: A scene must NEVER be empty under any circumstances
    if (elements.length === 0) {
      if (isFirst) {
        elements.push(
          {
            id: `${scene.id}-fallback-headline`,
            type: "kinetic-text",
            props: {
              text: scene.headlineCopy || `Still fighting fragmented workflows?`,
              fontSize: 66,
              fontWeight: 800,
              color: "brand.text",
              position: { x: 50, y: 38 },
              align: "center",
              animation: "word-by-word",
              delay: 0,
              maxWidth: 90,
            },
          },
          {
            id: `${scene.id}-fallback-badges`,
            type: "feature-pills",
            props: {
              items: [
                { text: "❌ High Administrative Friction", color: "#EF4444", highlight: false },
                { text: "❌ Slow Team Feedback Loops", color: "#EF4444", highlight: false },
              ],
              position: { x: 50, y: 64 },
              layout: "vertical",
              staggerFrames: 8,
              delay: 15,
            },
          }
        );
      } else if (index === 1) {
        elements.push(
          {
            id: `${scene.id}-fallback-headline`,
            type: "kinetic-text",
            props: {
              text: scene.headlineCopy || `Automate with ${brand.name}`,
              fontSize: 56,
              fontWeight: 800,
              color: "brand.text",
              position: { x: 50, y: 18 },
              align: "center",
              animation: "fade-up",
              delay: 0,
              maxWidth: 90,
            },
          },
          {
            id: `${scene.id}-fallback-app`,
            type: "app-window",
            props: {
              title: `${brand.name} Command Engine`,
              url: brief.websiteUrl || `app.${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.io`,
              mockType: detectMockType(),
              width: 92,
              position: { x: 50, y: 58 },
              tilt: true,
              shadow: true,
              delay: 8,
              animation: "float-up",
              badges: [
                { text: `⚡ ${brief.keyFeatures?.[0] || "Autonomous Sync"}`, position: "top-right", color: "brand.primary" },
              ],
            },
          }
        );
      } else {
        elements.push(
          {
            id: `${scene.id}-fallback-headline`,
            type: "kinetic-text",
            props: {
              text: scene.headlineCopy || `Proven Results`,
              fontSize: 56,
              fontWeight: 800,
              color: "brand.text",
              position: { x: 50, y: 18 },
              align: "center",
              animation: "fade-up",
              delay: 0,
            },
          },
          {
            id: `${scene.id}-fallback-counter`,
            type: "metric-counter",
            props: {
              label: brief.metricsOrSocialProof?.label || "CYCLE VELOCITY",
              value: 10,
              suffix: "x",
              color: "brand.accent",
              decimals: 0,
              position: { x: 50, y: 50 },
              delay: 8,
              durationFrames: 30,
              trend: "up",
            },
          }
        );
      }
    }

    return {
      storyboardScene: scene,
      background,
      layoutStrategy: isFirst ? "hero-centered" : isLast ? "stacked-cards" : "split-depth",
      elements,
      transition,
    };
  }
}

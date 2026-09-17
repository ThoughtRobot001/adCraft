import { Brand, Element, SceneBackground, SceneTransition } from "../schema";
import { CampaignBrief } from "../ai/types";
import { ArtDirectedScene, BrandProfile, Storyboard, StoryboardScene } from "./types";
import { applyHeroLaw, cameraForScene, cinematicTransition, defaultAtmosphere } from "./directing";
import { getAsset, selectVisualKit, VisualKit } from "../asset-bank";
import { DramaticIntent, getTechnique, recommendTechnique, TechniqueBank } from "../technique-bank";
import { creativeMemory } from "../creative-memory";

export class ArtDirector {
  direct(
    storyboard: Storyboard,
    profile: BrandProfile,
    brief: CampaignBrief
  ): ArtDirectedScene[] {
    const visualKit = selectVisualKit(profile, brief);
    console.log(`🎨 [Stage 4/7 - Art Director] Art directing with Visual Kit: "${visualKit.name}" (${visualKit.id})...`);

    return storyboard.scenes.map((scene, index) =>
      this.directScene(scene, index, profile, brief, storyboard.scenes.length, storyboard, visualKit)
    );
  }

  private directScene(
    scene: StoryboardScene,
    index: number,
    profile: BrandProfile,
    brief: CampaignBrief,
    totalScenes: number,
    storyboard: Storyboard,
    visualKit: VisualKit
  ): ArtDirectedScene {
    const brand = profile.identity;
    const isFirst = index === 0;
    const isLast = index === totalScenes - 1;
    const is16x9 = brief.aspectRatio === "16:9" || brief.aspectRatio === undefined;

    const comp = scene.visualComposition;
    const archetype = storyboard.concept?.narrativeArchetype;

    const dramaticIntent: DramaticIntent =
      archetype === "editorial-manifesto"
        ? "monumental-prestige"
        : archetype === "cinematic-spectacle"
        ? "precision-craft"
        : archetype === "feature-escalation"
        ? "playful-momentum"
        : archetype === "problem-absurdity" || scene.act === "pain-point"
        ? "tension-friction"
        : archetype === "transformation" || scene.act === "solution" || scene.act === "value-outcome"
        ? "cathartic-relief"
        : "precision-craft";

    // Theme detection: light-mode and editorial paper support
    const isEditorial = brand.theme === "editorial-light" || (brand.colors?.background && brand.colors?.background.toLowerCase() === "#f8f7f3");
    const isLightTheme = isEditorial || (brand.colors?.background && (brand.colors?.background.toLowerCase() === "#ffffff" || brand.colors?.background.toLowerCase() === "#f8fafc" || brand.colors?.background.toLowerCase() === "#f1f5f9")) || profile.voice.tone === "minimalist";
    const isRestrained = (comp?.negativeSpaceRatio ?? 0) >= 0.50 || archetype === "editorial-manifesto" || profile.voice.tone === "minimalist";

    // 0. Creative Memory Intent Retrieval
    const intentQuery = `${scene.intent || ""} ${scene.emotionalBeat || ""} ${archetype || ""}`.trim();
    const vocabPackage = creativeMemory.retrieveByIntent({
      intent: intentQuery || "Create premium technical precision",
      style: isEditorial ? "editorial-light" : isLightTheme ? "minimalist" : "dark-saas",
      brandContext: `${brand.name} ${brief.productDescription || ""}`,
    });

    const usedMemoryItemIds: string[] = [];
    if (vocabPackage.compositions[0]) usedMemoryItemIds.push(vocabPackage.compositions[0].id);
    if (vocabPackage.techniques[0]) usedMemoryItemIds.push(vocabPackage.techniques[0].id);
    if (vocabPackage.backgrounds[0]) usedMemoryItemIds.push(vocabPackage.backgrounds[0].id);
    if (vocabPackage.typographyTreatments[0]) usedMemoryItemIds.push(vocabPackage.typographyTreatments[0].id);
    if (vocabPackage.transitions[0]) usedMemoryItemIds.push(vocabPackage.transitions[0].id);

    // Curated Asset Bank Integration: resolve background & atmosphere
    const bgAsset = getAsset(visualKit.backgroundAssetId);
    const atmoAsset = getAsset(visualKit.atmosphereAssetId);

    // Background selection based on curated Asset Bank kit
    const background: SceneBackground = {
      type: (bgAsset?.properties?.type as any) || "gradient",
      color: bgAsset?.properties?.color || (isEditorial ? "#F8F7F3" : isLightTheme ? (brand.colors?.background || "#F8FAFC") : (brand.colors?.background || "#090D16")),
      gradientTo: bgAsset?.properties?.gradientTo || (isEditorial ? "#F1EFE9" : isLightTheme ? (isFirst ? "#F1F5F9" : isLast ? "#E2E8F0" : "#F8FAFC") : (isFirst ? "#0F172A" : isLast ? "#1E1B4B" : "#064E3B")),
      angle: bgAsset?.properties?.angle || 135,
      glowOrb: bgAsset?.properties?.glowOrb ?? !isLightTheme,
    };

    // Seamless transitions tailored to scene progression (no dip-through-black)
    const transition: SceneTransition = {
      type: isFirst ? "slide-left" : index % 2 === 1 ? "fade" : "slide-left",
      presentation: isFirst ? "slide" : index % 2 === 1 ? "fade" : "slide",
      direction: "from-right",
      durationFrames: 15,
    };

    const elements: any[] = [];

    // Helper to detect mockType based on context with strict word boundaries
    const detectMockType = (): "code" | "analytics" | "chat" | "kanban" | "kanban-full" | "diff" | "table" | "custom" => {
      const text = `${brand.name} ${brief.productDescription || ""} ${brief.keyFeatures?.join(" ") || ""} ${scene.visualDescription || ""}`.toLowerCase();
      if (/\b(legal|contract|redline|msa|clause|liability)\b/i.test(text)) {
        return "diff";
      }
      if (/\b(audit|compliance|procurement|risk|table)\b/i.test(text)) {
        return "table";
      }
      if (/\b(kanban|issue|tracker|triage|sprint|cycle|backlog)\b/i.test(text)) {
        return is16x9 || text.includes("full") || isEditorial ? "kanban-full" : "kanban";
      }
      if (/\b(terminal|code|cli|api|bash|sql|database|postgres|developer|sdk)\b/i.test(text)) {
        return "code";
      }
      if (/\b(chat|assistant|message|copilot)\b/i.test(text)) {
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
        const isHook = isFirst || scene.act === "hook";
        const isPainPoint = scene.act === "pain-point";
        const isOutcome = scene.act === "value-outcome";

        // Visual Blueprint driven typography placement & scale contrast
        const gridPlacement = comp?.typographyGrid?.placement;
        const scaleContrast = comp?.typographyGrid?.scaleContrast;

        const hasMetricInScene = scene.elementIntents.some((ei) =>
          roleMatches(ei.role || "", "metric", "stat", "counter", "number", "growth", "proof", "velocity")
        );
        const hasHeroWindowInScene = scene.elementIntents.some((ei) =>
          roleMatches(ei.role || "", "product", "demo", "mockup", "app", "window", "dashboard", "interface")
        );

        let posX = 50;
        let posY = isHook ? (is16x9 ? 42 : 44) : isLast ? 22 : isPainPoint ? 16 : isOutcome ? 18 : 16;
        let align: "center" | "left" | "right" = "center";
        let maxWidth = is16x9 ? 82 : 90;

        if (hasMetricInScene) {
          // Strict composite vertical stack: Headline stays safely at top
          posX = 50;
          posY = is16x9 ? 22 : 24;
          align = "center";
          maxWidth = is16x9 ? 82 : 86;
        } else if (hasHeroWindowInScene) {
          if (gridPlacement === "top-left") {
            posX = 26;
            posY = 18;
            align = "left";
            maxWidth = is16x9 ? 64 : 70;
          } else {
            posX = 50;
            posY = is16x9 ? 18 : 20;
            align = "center";
            maxWidth = is16x9 ? 80 : 86;
          }
        } else if (gridPlacement === "bottom-left") {
          posX = comp?.focalPoint?.x ?? 26;
          posY = comp?.focalPoint?.y ?? 68;
          align = "left";
          maxWidth = is16x9 ? 64 : 70;
        } else if (gridPlacement === "top-left") {
          posX = 26;
          posY = 18;
          align = "left";
          maxWidth = is16x9 ? 64 : 70;
        } else if (gridPlacement === "split-margins") {
          posX = 20;
          posY = 50;
          align = "left";
          maxWidth = 42;
        } else if (comp?.focalPoint) {
          posX = comp.focalPoint.x;
          posY = comp.focalPoint.y;
        }

        // Bounding Box Safety Clearance: Guarantee text never overflows canvas
        if (align === "left") {
          maxWidth = Math.min(maxWidth, Math.max(30, 90 - posX));
        } else if (align === "center") {
          const availableMargin = Math.min(posX, 100 - posX);
          maxWidth = Math.min(maxWidth, Math.max(30, Math.floor((availableMargin - 6) * 2)));
        }

        let fontSize = isHook ? (is16x9 ? 60 : 66) : isLast ? 48 : isPainPoint ? (is16x9 ? 44 : 50) : isOutcome ? (is16x9 ? 44 : 50) : (is16x9 ? 48 : 54);
        if (scaleContrast === "monumental") {
          fontSize = is16x9 ? 66 : 74;
        } else if (scaleContrast === "editorial-restrained") {
          fontSize = is16x9 ? 42 : 46;
        } else if (scaleContrast === "bold-punch") {
          fontSize = is16x9 ? 54 : 60;
        }

        const fontWeight = (archetype === "editorial-manifesto" || isEditorial || profile.voice.tone === "minimalist")
          ? 400
          : 800;

        const anim = (archetype === "editorial-manifesto" || isEditorial)
          ? "fade-up"
          : isHook
          ? "cinematic-scale"
          : isPainPoint
          ? "glow-punch"
          : "cinematic-scale";

        elements.push({
          id: `${scene.id}-headline`,
          type: "kinetic-text",
          props: {
            text: scene.headlineCopy || brand.tagline || brand.name,
            fontSize,
            fontWeight,
            color: "brand.text",
            position: { x: posX, y: posY },
            align,
            animation: anim,
            delay: 0,
            maxWidth,
            highlightWords: (archetype === "editorial-manifesto" || isRestrained)
              ? [] // Editorial restraint: zero shouty neon highlights
              : isHook
              ? ["manually?", "broken", "losing", "15+", "hours", "trap", "drift", "admin", "friction"]
              : isPainPoint
              ? ["draining", "velocity", "manual", "workflows", "burnout"]
              : [brief.productName.toLowerCase(), "automate", "milliseconds", "velocity", "10x", "proven", "impact"],
          },
        });
      }

      // B. Product Showcase / Phone Mockup / UI Mockup / Terminal / Code / Kanban
      else if (roleMatches(role, "product", "demo", "mockup", "app", "window", "dashboard", "interface", "terminal", "code", "kanban", "phone", "mobile", "wallet")) {
        const isMobileOrFintech = (): boolean => {
          if (isEditorial) return false;
          const text = `${brand.name} ${brief.productDescription || ""} ${brief.keyFeatures?.join(" ") || ""} ${scene.visualDescription || ""} ${role}`.toLowerCase();
          return /phone|mobile app|ios app|android app|wallet|crypto|stablecoin|deposit flow|duolingo|language learning/.test(text);
        };

        if (isMobileOrFintech()) {
          const text = `${brand.name} ${brief.productDescription || ""} ${brief.keyFeatures?.join(" ") || ""}`.toLowerCase();
          const screenType = text.includes("language") || text.includes("learn") ? "learning" : text.includes("prompt") || text.includes("chat") ? "prompt" : "wallet";
          const rawMetric = brief.metricsOrSocialProof?.metric || "$27.38";

          const phonePosX = comp?.framing === "asymmetric-editorial" ? 64 : comp?.focalPoint?.x ?? 50;
          const phonePosY = comp?.framing === "asymmetric-editorial" ? 44 : comp?.focalPoint?.y ?? 56;
          const phoneBadges = isRestrained
            ? []
            : [
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
              ];

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
              width: comp?.framing === "macro-extreme" ? 92 : 78,
              position: { x: phonePosX, y: phonePosY },
              tilt: true,
              rotateY: -8,
              rotateX: 10,
              pedestal: true,
              delay: 6,
              badges: phoneBadges,
            },
          });

          // Interactive cursor clicking on phone action button
          elements.push({
            id: `${scene.id}-cursor`,
            type: "cursor-interaction",
            props: {
              from: { x: 22, y: 88 },
              to: { x: phonePosX, y: phonePosY + 2 },
              clickAtFrame: 38,
              clickRipple: true,
              cursorType: "hand",
              color: "#FFFFFF",
              durationFrames: 50,
              delay: 14,
            },
          });
        } else {
          const brandContext = `${brand.name} ${brief.productDescription || ""} ${brief.keyFeatures?.join(" ") || ""}`.toLowerCase();
          const isHardware = /\b(synth|synthesizer|hardware|audio|chassis|dial|encoder|monolith|dsp)\b/i.test(brandContext);
          const isBotanical = isEditorial || /\b(botanical|skincare|apothecary|fragrance|cosmetics|formulation|aesop)\b/i.test(brandContext);
          const isRaycast = brand.name.toLowerCase().includes("raycast");
          const isStripe = brand.name.toLowerCase().includes("stripe");

          const mockType = detectMockType();
          const heroPosX = comp?.framing === "asymmetric-editorial" ? 62 : comp?.focalPoint?.x ?? 50;
          const heroPosY = comp?.framing === "asymmetric-editorial" ? 42 : comp?.focalPoint?.y ?? 58;
          const heroWidth = comp?.framing === "macro-extreme" ? 95 : is16x9 ? 88 : 92;

          let windowTitle = `${brand.name} Command Engine`;
          let windowUrl = brief.websiteUrl || `app.${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.io`;
          let codeSnippet: any = undefined;
          let customStats: any = undefined;
          let chartTitle: string | undefined = undefined;
          let windowBadges = isRestrained
            ? []
            : [
                {
                  text: `⚡ ${brief.keyFeatures?.[0] || "Instant Execution"}`,
                  position: "top-right" as const,
                  color: "brand.primary",
                },
                {
                  text: `🔒 ${brief.keyFeatures?.[1] || "Verified Engine"}`,
                  position: "bottom-left" as const,
                  color: "brand.accent",
                },
              ];

          if (isBotanical) {
            windowTitle = `${brand.name} Formulation Ledger`;
            windowUrl = `${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com/botanical-purity`;
            customStats = [
              { label: "Active Botanicals", val: "100%", change: "Cold-Pressed", color: "brand.accent" },
              { label: "Aromatherapeutics", val: "Pure", change: "Cedar & Rind", color: "brand.primary" },
              { label: "Synthetic Additives", val: "0%", change: "Zero Fillers", color: "#F59E0B" },
            ];
            chartTitle = "Botanical Extraction Potency Profile";
            windowBadges = [
              { text: "🌿 Cold-Pressed Botanicals", position: "top-right" as const, color: "brand.accent" },
              { text: "✨ 100% Certified Vegan", position: "bottom-left" as const, color: "brand.primary" },
            ];
          } else if (isHardware) {
            windowTitle = `${brand.name} Field Calibration`;
            windowUrl = `${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.engineering/dsp`;
            customStats = [
              { label: "SAMPLING DEPTH", val: "24-bit", change: "96kHz PCM", color: "brand.primary" },
              { label: "CHASSIS TOLERANCE", val: "0.1mm", change: "CNC Milled", color: "brand.accent" },
              { label: "BATTERY RESERVE", val: "24 hrs", change: "⚡ Field Ready", color: "#F59E0B" },
            ];
            chartTitle = "Acoustic Stereo Frequency Response";
            windowBadges = [
              { text: `⚡ ${brief.keyFeatures?.[0] || "Machined Aluminum"}`, position: "top-right" as const, color: "brand.primary" },
              { text: `🎛️ ${brief.keyFeatures?.[1] || "Tactile Encoders"}`, position: "bottom-left" as const, color: "brand.accent" },
            ];
          } else if (isRaycast) {
            windowTitle = "Raycast Command Palette";
            windowUrl = "raycast.com/store";
            codeSnippet = [
              { text: "import { showHUD, Clipboard } from '@raycast/api';", color: "brand.primary" },
              { text: "// Sub-50ms instant command execution" },
              { text: "export default async function Command() {", color: "brand.primary" },
              { text: "  await Clipboard.copy('https://raycast.com');" },
              { text: "  await showHUD('Copied to clipboard in 12ms');", color: "brand.accent" },
              { text: "⚡ Hotkey executed in 12ms • Zero latency", badge: "true" },
            ];
            windowBadges = [
              { text: `⚡ Sub-50ms Hotkey`, position: "top-right" as const, color: "brand.primary" },
              { text: `⌨️ Command Palette`, position: "bottom-left" as const, color: "brand.accent" },
            ];
          } else if (isStripe) {
            windowTitle = "Stripe Global Treasury & Payments";
            windowUrl = "dashboard.stripe.com";
            codeSnippet = [
              { text: "import Stripe from 'stripe';", color: "brand.primary" },
              { text: "const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);" },
              { text: "const payment = await stripe.paymentIntents.create({", color: "brand.primary" },
              { text: "  amount: 24900, currency: 'usd', automatic_payment_methods: { enabled: true }" },
              { text: "⚡ Settled globally in 24ms • 99.999% uptime", badge: "true" },
            ];
            windowBadges = [
              { text: `⚡ 99.999% Uptime SLA`, position: "top-right" as const, color: "brand.primary" },
              { text: `🌍 135+ Currencies`, position: "bottom-left" as const, color: "brand.accent" },
            ];
          }

          elements.push({
            id: `${scene.id}-app-window`,
            type: "app-window",
            props: {
              title: windowTitle,
              url: windowUrl,
              mockType: (isBotanical || isHardware) ? "custom" : mockType,
              width: heroWidth,
              position: { x: heroPosX, y: heroPosY },
              tilt: true,
              shadow: true,
              delay: 8,
              animation: "float-up",
              badges: windowBadges,
              codeSnippet,
              customStats,
              chartTitle,
            },
          });
        }
      }

      // C. Metric / Data / Counter / Social Proof Numbers
      else if (roleMatches(role, "metric", "stat", "counter", "number", "growth", "proof", "velocity")) {
        const hasHeroWindow = elements.some((el) => el.type === "app-window" || el.type === "phone-mockup" || el.type === "bento-grid");
        if (hasHeroWindow) {
          continue;
        }

        const rawMetric = brief.metricsOrSocialProof?.metric || "10x";
        const val = parseFloat(rawMetric.replace(/[^0-9.]/g, "")) || 10;
        const sfx = rawMetric.includes("x") ? "x" : rawMetric.includes("%") ? "%" : rawMetric.includes("ms") ? "ms" : "x";

        // Vertical Anchor Discipline: Hero metric sits comfortably at center
        const counterPosX = 50;
        const counterPosY = is16x9 ? 52 : 54;

        elements.push({
          id: `${scene.id}-counter`,
          type: "metric-counter",
          props: {
            label: brief.metricsOrSocialProof?.label || "CYCLE VELOCITY BOOST",
            value: val,
            suffix: sfx,
            decimals: 0,
            color: "brand.primary",
            position: { x: counterPosX, y: counterPosY },
            delay: 8,
            durationFrames: 35,
            trend: "up",
            trendBadge: "4.8x Faster",
            displayMode: "hero-typographic",
            subtext: isRestrained ? undefined : (brief.metricsOrSocialProof?.subtext || "Verified across enterprise teams"),
          },
        });
      }

      // D. Badges / Feature Pills / Trust Signals / Problem Tags
      else if (roleMatches(role, "badge", "pill", "tag", "trust", "security", "problem", "friction", "feature")) {
        // Senior Art Director Restraint: If negative space is high or brand is minimalist, suppress secondary pill clutter!
        if (isRestrained && elements.length > 0) {
          continue;
        }

        const isProblem = roleMatches(role, "problem", "friction", "pain", "terminal", "agitation");
        const isTrust = roleMatches(role, "trust", "security", "compliance");

        if (isProblem) {
          const sceneContext = `${scene.visualDescription || ""} ${scene.headlineCopy || ""} ${scene.intent || ""}`.toLowerCase();
          const wantsGridConveyor = /conveyor|grid|cards flowing|stream of tasks|friction cards/.test(sceneContext);

          if (wantsGridConveyor) {
            const tech = recommendTechnique(sceneContext, "scroll-reveal", dramaticIntent) || getTechnique("tech-conveyor-belt-3d");
            if (tech) {
              console.log(`🧠 [Stage 4/7 - Art Director] Technique Recall: Applied "${tech.name}" (${tech.id}) [${dramaticIntent}]`);
              elements.push({
                id: `${scene.id}-perspective-grid`,
                type: "perspective-card-grid",
                props: {
                  ...tech.defaultProps,
                  cards: [
                    { title: "Manual Review Latency", value: "15+ hrs" },
                    { title: "Compliance Drift", value: "48%" },
                    { title: "Liability Exposure", value: "High" },
                    { title: "Admin Overhead", value: "Blocked" },
                  ],
                },
              });
              continue;
            }
          }

          const isLegal = `${brand.name} ${brief.productDescription || ""} ${brief.keyFeatures?.join(" ") || ""}`.toLowerCase().includes("legal") ||
            `${brand.name} ${brief.productDescription || ""}`.toLowerCase().includes("contract");

          const notificationItems = isLegal
            ? [
                { app: "slack" as const, sender: "#deal-desk", message: "Enterprise MSA draft updated for Goldman • Review required", tag: "Legal", time: "Just now", badgeColor: "#4A154B" },
                { app: "compliance" as const, sender: "DORA Audit", message: "Risk management controls flagged in Section 14.2", tag: "Audit Needed", time: "2m ago", badgeColor: "#EF4444" },
                { app: "teams" as const, sender: "Procurement Ops", message: "PO #8849 delayed pending supplier indemnity caps", tag: "Blocked", time: "5m ago", badgeColor: "#F59E0B" },
                { app: "calendar" as const, sender: "Strategy Review", message: "Board executive sync bottlenecked on compliance", tag: "Calendar", time: "10m ago", badgeColor: "#6B7280" },
              ]
            : [
                { app: "slack" as const, sender: "#incident", message: "Production latency spike > 4200ms across EU clusters", tag: "Incident", time: "Just now", badgeColor: "#EF4444" },
                { app: "compliance" as const, sender: "SOC2 Audit", message: "4 security controls awaiting evidence collection", tag: "Action Required", time: "4m ago", badgeColor: "#F59E0B" },
                { app: "teams" as const, sender: "Sprint Planning", message: "Cycle delivery delayed due to manual triage backlog", tag: "Blocked", time: "8m ago", badgeColor: "#464EB8" },
                { app: "calendar" as const, sender: "Release Review", message: "Deployment freeze pending manual approvals", tag: "Freeze", time: "15m ago", badgeColor: "#6B7280" },
              ];

          elements.push({
            id: `${scene.id}-notification-cascade`,
            type: "notification-cascade",
            props: {
              position: { x: 50, y: is16x9 ? 50 : 48 },
              width: is16x9 ? 65 : 88,
              staggerFrames: 8,
              delay: 8,
              angle: -6,
              items: notificationItems,
            },
          });

          const problemItems = isLegal
            ? [
                { text: "❌ 15+ Hours Lost to Manual Contract Review", color: "#EF4444", highlight: false },
                { text: "❌ High Liability Exposure & Compliance Drift", color: "#EF4444", highlight: false },
              ]
            : [
                { text: "❌ 15+ Hours Lost to Manual Administrative Overhead", color: "#EF4444", highlight: false },
                { text: "❌ High Human Error & Uncoordinated Workflows", color: "#EF4444", highlight: false },
              ];

          elements.push({
            id: `${scene.id}-problem-badges`,
            type: "feature-pills",
            props: {
              items: problemItems,
              position: { x: 50, y: is16x9 ? 84 : 84 },
              layout: is16x9 ? "horizontal" : "vertical",
              staggerFrames: 8,
              delay: 18,
            },
          });
        } else if (isTrust) {
          const trust1 = brief.keyFeatures?.[0] || (isEditorial ? "100% Certified Vegan" : "Enterprise Grade Reliability");
          const trust2 = brief.keyFeatures?.[1] || (isEditorial ? "Cruelty-Free Botanical Extraction" : "Sub-50ms Global Infrastructure");
          elements.push({
            id: `${scene.id}-trust-badges`,
            type: "feature-pills",
            props: {
              items: [
                { icon: isEditorial ? "🌿" : "🛡️", text: trust1, highlight: true, color: "brand.accent" },
                { icon: isEditorial ? "💧" : "⚡", text: trust2, highlight: false },
              ],
              position: { x: 50, y: is16x9 ? 80 : 82 },
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
        const isLuxury = isEditorial || brand.theme === "editorial-light" || /\b(botanical|skincare|apothecary|fragrance|cosmetics|aesop)\b/i.test(`${brand.name} ${brand.tagline || ""}`);
        const isHardware = /hardware|synth|synthesizer|chassis|monolith|dial/i.test(`${brand.name} ${brief.productDescription || ""}`);

        const ctaText = isLuxury
          ? "Experience the Collection"
          : isHardware
          ? "Reserve Your Unit"
          : brief.goal === "book_demo"
          ? "Book a Tailored Demo"
          : brief.goal === "feature_launch"
          ? "Explore The Platform"
          : "Start Free Trial";

        const ctaSubtext = isLuxury
          ? "Complimentary shipping on orders over $50 • Store consultations"
          : isHardware
          ? "Precision engineered in Stockholm • Express worldwide dispatch"
          : "No credit card required • Instant setup";

        elements.push({
          id: `${scene.id}-cta`,
          type: "cta-button",
          props: {
            text: ctaText,
            subtext: ctaSubtext,
            url: brief.websiteUrl || `${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
            position: { x: 50, y: is16x9 ? 68 : 70 },
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

      // L. Notification Cascade (Wordsmith Video 8 Parity)
      else if (roleMatches(role, "notification", "cascade", "waterfall", "alerts", "inbox", "slack", "teams", "messages")) {
        elements.push({
          id: `${scene.id}-notification-cascade`,
          type: "notification-cascade",
          props: {
            position: { x: 50, y: is16x9 ? 54 : 52 },
            width: is16x9 ? 65 : 88,
            staggerFrames: 8,
            delay: 8,
            angle: -6,
            items: [
              { app: "slack", sender: "#deal-desk", message: "Enterprise MSA draft updated for Goldman", tag: "Legal", time: "Just now" },
              { app: "compliance", sender: "DORA Audit", message: "Risk management controls automated", tag: "Audit Pass", time: "2m ago" },
              { app: "teams", sender: "Procurement Ops", message: "PO #8849 approved by VP of Finance", tag: "Approved", time: "5m ago" },
              { app: "calendar", sender: "Strategy Review", message: "Board executive sync materials ready", tag: "Calendar", time: "10m ago" },
            ],
          },
        });
      }

      // M. Agent Task Card (Video 7 & 8 Parity)
      else if (roleMatches(role, "agent", "task", "checklist", "execution", "autonomous", "flow", "approval")) {
        elements.push({
          id: `${scene.id}-agent-task-card`,
          type: "agent-task-card",
          props: {
            title: `${brand.name} Autonomous Engine`,
            status: "Executing",
            actionText: "Review & Approve",
            position: { x: 50, y: is16x9 ? 54 : 52 },
            width: is16x9 ? 62 : 86,
            tilt: true,
            rotateX: 8,
            rotateY: -6,
            delay: 8,
            items: [
              { text: "Ingest and structure raw business workflows", status: "completed", tag: "Done" },
              { text: "Cross-validate regulatory compliance and SLA bounds", status: "completed", tag: "Verified" },
              { text: "Synthesize high-liability clauses & mitigations", status: "in-progress", tag: "Review Needed" },
              { text: "Deploy automated execution to production pipelines", status: "pending", tag: "Pending" },
            ],
          },
        });

        // Add choreographed cursor interaction clicking the task card button
        elements.push({
          id: `${scene.id}-task-cursor`,
          type: "cursor-interaction",
          props: {
            from: { x: 25, y: 88 },
            to: { x: 50, y: is16x9 ? 66 : 72 },
            clickAtFrame: 38,
            clickRipple: true,
            cursorType: "pointer",
            color: "#FFFFFF",
            durationFrames: 50,
            delay: 16,
          },
        });
      }

      // N. Prompt Input (Video 2 & 8 Parity)
      else if (roleMatches(role, "prompt", "input", "query", "typewriter", "ask")) {
        elements.push({
          id: `${scene.id}-prompt-input`,
          type: "prompt-input",
          props: {
            promptText: scene.headlineCopy || `Run real-time autonomous audit with ${brand.name}`,
            placeholder: "Ask an agent anything...",
            position: { x: 50, y: 50 },
            width: is16x9 ? 65 : 88,
            typewriterSpeed: 2,
            delay: 8,
            showSendButton: true,
            showMic: true,
            badge: "Agentic v2",
          },
        });
      }

      // O. 3D Perspective Card Grid / Conveyor Scroll (Astra/Hedge Benchmark via Technique Bank)
      else if (roleMatches(role, "conveyor", "perspective-grid", "card-grid", "flow-grid", "friction-grid", "tasks-stream")) {
        const tech = recommendTechnique(`${role} ${scene.visualDescription || ""} ${scene.intent || ""}`) || getTechnique("tech-conveyor-belt-3d");
        if (tech) {
          console.log(`🧠 [Stage 4/7 - Art Director] Technique Recall: Applied "${tech.name}" (${tech.id})`);
        }
        elements.push({
          id: `${scene.id}-perspective-grid`,
          type: "perspective-card-grid",
          props: {
            cards: [
              { title: "Manual Processing", value: "15+ hrs" },
              { title: "Error Drift", value: "32%" },
              { title: "Compliance Risk", value: "High" },
              { title: "Bottleneck Delay", value: "Blocked" },
            ],
            scaleStart: tech?.parameters?.scaleStart ?? 1.02,
            scaleEnd: tech?.parameters?.scaleEnd ?? 1.09,
            rotateXStart: tech?.parameters?.rotateXStart ?? 6,
            rotateXEnd: tech?.parameters?.rotateXEnd ?? 2,
            translateYStart: tech?.parameters?.translateYStart ?? 20,
            translateYEnd: tech?.parameters?.translateYEnd ?? -15,
            continuousScrollSpeed: tech?.parameters?.continuousScrollSpeed ?? 22,
            useMotionCurves: true,
          },
        });
      }
    }

    // 2. Headline Guarantee: If scene has headlineCopy and NO kinetic-text was added yet, add it!
    const hasKineticText = elements.some((el) => el.type === "kinetic-text");
    const isRedundantLastScene = isLast && (
      scene.headlineCopy?.toLowerCase().trim() === brand.name.toLowerCase().trim() ||
      scene.headlineCopy?.toLowerCase().trim() === brand.tagline?.toLowerCase().trim()
    );

    if (!hasKineticText && scene.headlineCopy && !isRedundantLastScene) {
      const isHook = isFirst || scene.act === "hook";
      const isPainPoint = scene.act === "pain-point";
      const isOutcome = scene.act === "value-outcome";

      const gridPlacement = comp?.typographyGrid?.placement;
      const scaleContrast = comp?.typographyGrid?.scaleContrast;

      let posX = 50;
      let posY = isHook ? (is16x9 ? 42 : 44) : isLast ? (is16x9 ? 16 : 18) : isPainPoint ? 16 : isOutcome ? 18 : (is16x9 ? 16 : 18);
      let align: "center" | "left" | "right" = "center";
      let maxWidth = is16x9 ? 82 : 90;

      if (gridPlacement === "bottom-left") {
        posX = comp?.focalPoint?.x ?? 26;
        posY = comp?.focalPoint?.y ?? 68;
        align = "left";
        maxWidth = is16x9 ? 74 : 80;
      } else if (gridPlacement === "top-left") {
        posX = 26;
        posY = 18;
        align = "left";
        maxWidth = is16x9 ? 74 : 80;
      } else if (gridPlacement === "split-margins") {
        posX = 20;
        posY = 50;
        align = "left";
        maxWidth = 42;
      } else if (comp?.focalPoint) {
        posX = comp.focalPoint.x;
        posY = comp.focalPoint.y;
      }

      let fontSize = isHook ? (is16x9 ? 60 : 66) : isLast ? (is16x9 ? 44 : 48) : isPainPoint ? (is16x9 ? 44 : 50) : isOutcome ? (is16x9 ? 44 : 50) : (is16x9 ? 48 : 56);
      if (scaleContrast === "monumental") {
        fontSize = is16x9 ? 66 : 74;
      } else if (scaleContrast === "editorial-restrained") {
        fontSize = is16x9 ? 42 : 46;
      } else if (scaleContrast === "bold-punch") {
        fontSize = is16x9 ? 54 : 60;
      }

      const fontWeight = (archetype === "editorial-manifesto" || isEditorial || profile.voice.tone === "minimalist")
        ? 400
        : 800;

      const anim = (archetype === "editorial-manifesto" || isEditorial)
        ? "fade-up"
        : isHook
        ? "word-by-word"
        : "fade-up";

      elements.unshift({
        id: `${scene.id}-headline-auto`,
        type: "kinetic-text",
        props: {
          text: scene.headlineCopy,
          fontSize,
          fontWeight,
          color: "brand.text",
          position: { x: posX, y: posY },
          align,
          animation: anim,
          delay: 0,
          maxWidth,
          highlightWords: (archetype === "editorial-manifesto" || isRestrained)
            ? []
            : isHook
            ? ["losing", "15+", "hours", "broken", "manual", "page", "liability", "manually?"]
            : isPainPoint
            ? ["draining", "velocity", "manual", "workflows", "burnout"]
            : [brief.productName.toLowerCase(), "automate", "velocity", "10x", "proven", "impact"],
        },
      });
    }

    // 3. Last Scene Guarantee: The closing scene must ALWAYS include Brand Logo, Headline, and CTA Button
    if (isLast) {
      const hasLogo = elements.some((el) => el.type === "logo-reveal");
      const hasHeadline = elements.some((el) => el.type === "kinetic-text");
      if (!hasLogo) {
        elements.unshift({
          id: `${scene.id}-logo-auto`,
          type: "logo-reveal",
          props: {
            brandName: brand.name,
            tagline: brand.tagline || "The Modern Operating System",
            size: is16x9 ? 100 : 120,
            position: { x: 50, y: hasHeadline ? 36 : 30 },
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
        const isAiProduct = /\b(ai|agent|copilot|llm|model|intelligence)\b/i.test(`${brand.name} ${brief.productDescription || ""} ${brief.keyFeatures?.join(" ") || ""}`);
        elements.push({
          id: `${scene.id}-cta-cursor`,
          type: "cursor-interaction",
          props: {
            from: { x: 26, y: 92 },
            to: { x: 50, y: is16x9 ? 74 : 72 },
            clickAtFrame: 34,
            clickRipple: true,
            cursorType: "macos-arrow",
            agentTag: isAiProduct ? `${brand.name} AI` : undefined,
            color: "#000000",
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
              displayMode: "hero-typographic",
            },
          }
        );
      }
    }

    // 2. Tag elements with curated visual kit styling
    for (const el of elements) {
      if (["notification-cascade", "bento-grid", "agent-task-card", "testimonial-card"].includes(el.type)) {
        el.cardStyleId = visualKit.cardStyleAssetId;
      } else if (el.type === "cta-button") {
        el.buttonStyleId = visualKit.buttonStyleAssetId;
      } else if (el.type === "app-window" || el.type === "phone-mockup") {
        el.deviceAssetId = visualKit.deviceAssetId;
        el.cardStyleId = visualKit.cardStyleAssetId;
      }
    }

    // Enforce strict single-hero law and Z-spatial depth
    const { elements: heroDirectedElements, heroElementId } = applyHeroLaw(elements);
    const camera = cameraForScene(scene, index, totalScenes);
    const atmosphere = {
      grain: atmoAsset?.properties?.grain ?? (isLightTheme ? 0.14 : 0.10),
      vignette: atmoAsset?.properties?.vignette ?? (isLightTheme ? 0.32 : 0.42),
      haze: atmoAsset?.properties?.haze ?? (isLightTheme ? 0.10 : 0.16),
    };
    const directedTransition = cinematicTransition();
    const layoutStrategy =
      comp?.framing === "asymmetric-editorial" || isRestrained
        ? ("minimal-focus" as const)
        : comp?.framing === "wide-cinematic" || comp?.dominantGeometry === "split-plane"
        ? ("split-depth" as const)
        : isFirst || scene.act === "hook" || scene.act === "value-outcome" || isLast || scene.act === "cta"
        ? ("hero-centered" as const)
        : ("stacked-cards" as const);

    return {
      storyboardScene: scene,
      background,
      layoutStrategy,
      elements: heroDirectedElements,
      transition: directedTransition,
      camera,
      atmosphere,
      heroElementId,
      visualKit,
      backgroundAssetId: visualKit.backgroundAssetId,
      atmosphereAssetId: visualKit.atmosphereAssetId,
      usedMemoryItemIds,
    };
  }
}

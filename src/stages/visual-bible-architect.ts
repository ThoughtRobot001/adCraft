import { CampaignBrief } from "../ai/types";
import { GeminiClient } from "./gemini-client";
import { VisualBibleSchema } from "../schema/composition";
import {
  BrandProfile,
  CreativeConcept,
  Storyboard,
  VisualBible,
  VisualBibleCameraLanguage,
  VisualBibleLightingLogic,
  VisualBibleMaterials,
  VisualBibleProductIdentity,
  VisualBibleRecurringSubject,
  VisualBibleTypographySystem,
  VisualBibleVisualLanguage,
} from "./types";

export class VisualBibleArchitect {
  private gemini = new GeminiClient();

  /**
   * Synthesizes the persistent Visual Bible that governs all scenes and generated assets
   * for a campaign.
   */
  async synthesizeVisualBible(
    brandProfile: BrandProfile,
    brief: CampaignBrief,
    concept?: CreativeConcept | CreativeConcept[],
    storyboard?: Storyboard
  ): Promise<VisualBible> {
    const brand = brandProfile.identity;
    const campaignId = `bible-${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
    const primaryConcept = Array.isArray(concept) ? concept[0] : concept;

    // 1. Check for explicit transformation calls in storyboard
    const allowedSceneIndices: number[] = [];
    const transformationRules: string[] = [];

    if (storyboard?.scenes) {
      storyboard.scenes.forEach((scene, idx) => {
        if (scene.transformationCall?.isExplicitTransformation) {
          allowedSceneIndices.push(idx);
          transformationRules.push(
            `Scene ${idx + 1} ("${scene.name}"): Permitted departures: [${scene.transformationCall.allowedDepartures.join(
              ", "
            )}]. Justification: ${scene.transformationCall.narrativeJustification}`
          );
        }
      });
    }

    // 2. Try Gemini Live Synthesis if authenticated
    if (this.gemini.hasKey() && primaryConcept) {
      try {
        const liveBible = await this.synthesizeWithGemini(
          brandProfile,
          brief,
          primaryConcept,
          campaignId,
          allowedSceneIndices,
          transformationRules
        );
        if (liveBible) {
          const parsed = VisualBibleSchema.safeParse(liveBible);
          if (parsed.success) {
            return parsed.data as any;
          } else {
            console.warn(
              `⚠️ VisualBible Gemini output had validation discrepancies, falling back to deterministic: ${parsed.error.message}`
            );
          }
        }
      } catch (err: any) {
        console.warn(`⚠️ Gemini Visual Bible synthesis failed, using expert deterministic archetype: ${err.message}`);
      }
    }

    // 3. High-fidelity Deterministic Archetype Synthesis
    return this.synthesizeDeterministicBible(
      brandProfile,
      brief,
      primaryConcept,
      campaignId,
      allowedSceneIndices,
      transformationRules
    );
  }

  /**
   * Deterministic visual bible synthesis calibrated across 5 core studio archetypes.
   */
  private synthesizeDeterministicBible(
    profile: BrandProfile,
    brief: CampaignBrief,
    concept: CreativeConcept | undefined,
    campaignId: string,
    allowedSceneIndices: number[],
    transformationRules: string[]
  ): VisualBible {
    const brand = profile.identity;
    const conceptText = concept ? `${concept.angleTitle} ${concept.narrativeArchetype}` : "";
    const textContext = `${brand.name} ${brief.productName || ""} ${brief.productDescription || ""} ${conceptText}`.toLowerCase();

    const isEditorial =
      brand.theme === "editorial-light" ||
      Boolean(textContext.match(/wordsmith|legal|contract|law|policy|editorial|paper|writing|author|serif|compliance|aesop|luxury|botanical|coffee|roast|brew|beans|ritual/i));
    const isHardware = Boolean(
      textContext.match(/hardware|synthesizer|audio|device|tactile|encoder|aluminum|chassis|machined|headphones|speaker|gear|physical/i)
    );
    const isTerminal = Boolean(
      textContext.match(/terminal|code|developer|cli|database|query|api|latency|devops|cyber|security/i)
    );
    const isConsumer =
      brand.theme === "consumer-vibrant" ||
      Boolean(textContext.match(/blinkcash|consumer|wallet|savings|rewards|mobile|creator|social|shopping/i));

    // Determine Theme
    const theme: VisualBibleVisualLanguage["theme"] = isEditorial
      ? "editorial-light"
      : isHardware
      ? "industrial-monolith"
      : isTerminal
      ? "cyber-terminal"
      : isConsumer
      ? "consumer-vibrant"
      : "dark-saas";

    // 1. Product Identity
    const formFactor: VisualBibleProductIdentity["formFactor"] = isHardware
      ? "hardware-console"
      : isConsumer || brief.aspectRatio === "9:16"
      ? "mobile-device"
      : "desktop-browser";

    const productIdentity: VisualBibleProductIdentity = {
      name: brand.name,
      category: profile.positioning?.category || "Modern Platform",
      formFactor,
      signatureElement: isHardware
        ? "Precision-milled anodized aluminum chassis with laser-etched monochrome dial markers"
        : formFactor === "mobile-device"
        ? "Floating 3D glassmorphic mobile frame with illuminated category badges and ambient specular glare"
        : "Curved 3D browser card with semi-translucent titlebar, glowing status orb, and dark obsidian surface",
      monogramOrLogo: {
        symbol: brand.name.substring(0, 2).toUpperCase(),
        placement: "top-left",
        treatment: isEditorial ? "minimal-monochrome" : isHardware ? "embossed-metallic" : "glow-bloom",
      },
      keyDifferentiatorVisual: profile.positioning?.differentiator || brief.keyFeatures?.[0] || "Autonomous Pipeline",
    };

    // 2. Visual Language
    const primary = brand.colors?.primary || (isEditorial ? "#18181B" : "#8B5CF6");
    const secondary = brand.colors?.secondary || (isEditorial ? "#71717A" : "#3B82F6");
    const accent = brand.colors?.accent || (isEditorial ? "#0F766E" : "#A78BFA");
    const bgBase = isEditorial ? "#F8F7F3" : brand.colors?.background || "#08080B";

    const visualLanguage: VisualBibleVisualLanguage = {
      theme,
      aestheticPhilosophy: isEditorial
        ? "Quiet luxury and architectural restraint: high negative space, warm archival paper, and razor-sharp serif typography."
        : isHardware
        ? "Monolithic Scandinavian industrial design: raw machined surfaces, tactile controls, and uncompromising material honesty."
        : isTerminal
        ? "High-velocity cybernetic precision: monospaced data streams, obsidian panels, and sharp emerald/cyan telemetry."
        : "Apple and Linear caliber dark-mode SaaS: translucent glassmorphism, volumetric violet lighting, and razor letter tracking.",
      colorTokens: {
        backgroundBase: bgBase,
        surfaceElevated: isEditorial ? "#FFFFFF" : "#12131A",
        surfaceOverlay: isEditorial ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.04)",
        borderSubtle: isEditorial ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
        primaryBrand: primary,
        secondaryBrand: secondary,
        accentHighlight: accent,
        textPrimary: isEditorial ? "#18181B" : "#FFFFFF",
        textMuted: isEditorial ? "#71717A" : "#94A3B8",
      },
      negativeSpaceBaseline: isEditorial ? 0.62 : isHardware ? 0.55 : 0.48,
      cornerRadii: {
        container: isHardware ? 8 : isEditorial ? 12 : 24,
        card: isHardware ? 6 : isEditorial ? 8 : 16,
        pill: 9999,
      },
    };

    // 3. Materials
    const materials: VisualBibleMaterials = {
      surfaceType: isEditorial
        ? "tactile-paper"
        : isHardware
        ? "anodized-aluminum"
        : "glassmorphism",
      backdropBlur: isEditorial ? 0 : 24,
      borderSheen: isEditorial
        ? "subtle-hairline"
        : isHardware
        ? "specular-metallic"
        : "specular-metallic",
      roughness: isEditorial ? 0.9 : isHardware ? 0.4 : 0.15,
      transmissionOpacity: isEditorial ? 1.0 : isHardware ? 1.0 : 0.82,
      shadowTokens: {
        elevation: isEditorial
          ? "0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 2px 10px rgba(0, 0, 0, 0.03)"
          : "0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.5)",
        ambientGlow: isEditorial
          ? "0 0 20px rgba(0, 0, 0, 0.03)"
          : `0 0 35px ${accent}25`,
      },
    };

    // 4. Lighting Logic
    const lightingLogic: VisualBibleLightingLogic = {
      keyLightVector: isEditorial
        ? { angleDeg: 160, elevationDeg: 75 } // Soft overhead daylight
        : isHardware
        ? { angleDeg: 45, elevationDeg: 55 }  // Sharp dramatic rim
        : { angleDeg: 145, elevationDeg: 60 }, // Balanced volumetric rim
      keyIntensity: isEditorial ? 0.6 : 0.88,
      ambientFillOpacity: isEditorial ? 0.4 : 0.22,
      atmosphericGlowOrb: {
        enabled: !isEditorial,
        color: primary,
        radiusPercent: 65,
        blurPx: 140,
      },
      shadowFalloff: isEditorial
        ? "diffuse-soft"
        : isHardware
        ? "crisp-contact"
        : "cinematic-volumetric",
    };

    // 5. Typography System
    const typographySystem: VisualBibleTypographySystem = {
      headlineFont: isEditorial
        ? "'Newsreader', 'Playfair Display', Georgia, serif"
        : isTerminal
        ? "'JetBrains Mono', 'Fira Code', monospace"
        : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      bodyFont: isEditorial
        ? "'Inter', -apple-system, sans-serif"
        : isTerminal
        ? "'JetBrains Mono', monospace"
        : "'Inter', -apple-system, sans-serif",
      monoFont: "'JetBrains Mono', 'SF Mono', monospace",
      headlineTracking: isEditorial ? "-0.015em" : isTerminal ? "0.0em" : "-0.038em",
      headlineLineHeight: isEditorial ? 1.15 : 1.05,
      capitalization: isHardware ? "uppercase" : "none",
      scaleRatios: {
        heroDisplay: 72,
        sectionHeadline: 48,
        bodySubtext: 24,
        badgeLabel: 13,
      },
      weightHierarchy: {
        hero: isEditorial ? 700 : 800,
        subtext: 400,
        badge: 600,
      },
    };

    // 6. Camera Language
    const cameraLanguage: VisualBibleCameraLanguage = {
      baseFieldOfView: 50,
      primaryShotPhilosophy: isHardware
        ? "orbital-pivot"
        : isEditorial
        ? "subtle-drift"
        : "controlled-push-in",
      tiltConstraints: {
        maxTiltX: isHardware ? 18 : 12,
        maxTiltY: isHardware ? 15 : 8,
      },
      virtualDistance: isHardware ? "macro-tight" : "medium-balanced",
      cameraMotionCurve: "cinematic-smooth",
    };

    // 7. Recurring Subjects
    const recurringSubjects: VisualBibleRecurringSubject[] = [
      {
        id: "subj-primary-hero",
        name: "Primary Product Artifact",
        role: "primary-product-hero",
        primitiveType: formFactor === "mobile-device" ? "phone-mockup" : "app-window",
        lockedProps: {
          surfaceType: materials.surfaceType,
          borderRadius: visualLanguage.cornerRadii.card,
          borderSheen: materials.borderSheen,
        },
        consistencyRules: [
          "Must retain uniform corner radius and border treatment across all non-transformation scenes.",
          "Must anchor visual attention within the normalized focal range.",
        ],
      },
      {
        id: "subj-brand-monogram",
        name: "Brand Monogram Anchor",
        role: "brand-monogram",
        primitiveType: "logo-reveal",
        lockedProps: {
          symbol: productIdentity.monogramOrLogo.symbol,
          treatment: productIdentity.monogramOrLogo.treatment,
        },
        consistencyRules: [
          "Monogram typography must strictly use primary display font.",
          "Must maintain locked brand primary color.",
        ],
      },
      {
        id: "subj-interactive-cursor",
        name: "Interaction Director Pointer",
        role: "interaction-pointer",
        primitiveType: "cursor-interaction",
        lockedProps: {
          fillColor: "#FFFFFF",
          outlineColor: primary,
        },
        consistencyRules: [
          "Trajectory must follow smooth bezier curves with physics compression.",
        ],
      },
      {
        id: "subj-status-badge",
        name: "Verified Capability Pill",
        role: "verification-badge",
        primitiveType: "feature-pills",
        lockedProps: {
          borderRadius: visualLanguage.cornerRadii.pill,
          background: visualLanguage.colorTokens.surfaceOverlay,
        },
        consistencyRules: [
          "Pill borders must adhere to borderSubtle tokens.",
        ],
      },
    ];

    return {
      id: campaignId,
      campaignId,
      brandName: brand.name,
      createdAt: Date.now(),
      version: 1,
      productIdentity,
      visualLanguage,
      materials,
      lightingLogic,
      typographySystem,
      cameraLanguage,
      recurringSubjects,
      transformationExceptions: {
        allowedSceneIndices,
        rules: transformationRules,
      },
    };
  }

  /**
   * Optional Gemini Live Synthesis for custom or experimental brand briefs.
   */
  private async synthesizeWithGemini(
    profile: BrandProfile,
    brief: CampaignBrief,
    concept: CreativeConcept,
    campaignId: string,
    allowedSceneIndices: number[],
    transformationRules: string[]
  ): Promise<VisualBible | null> {
    const prompt = `You are a World-Class Executive Art Director formulating a persistent Visual Bible for a high-end motion advertisement.
Brand: ${profile.identity.name}
Tone: ${profile.voice?.tone || "professional"}
Category: ${profile.positioning?.category || "Software"}
Concept: "${concept.angleTitle}" [Archetype: ${concept.narrativeArchetype}]
Brief Goal: ${brief.goal}
Key Features: ${brief.keyFeatures?.join(", ")}

Generate a complete, authoritative Visual Bible adhering to the schema. The Visual Bible locks:
1. productIdentity (formFactor, signatureElement, monogramOrLogo, keyDifferentiatorVisual)
2. visualLanguage (theme, aestheticPhilosophy, colorTokens, negativeSpaceBaseline, cornerRadii)
3. materials (surfaceType, backdropBlur, borderSheen, roughness, transmissionOpacity, shadowTokens)
4. lightingLogic (keyLightVector, keyIntensity, ambientFillOpacity, atmosphericGlowOrb, shadowFalloff)
5. typographySystem (headlineFont, bodyFont, monoFont, headlineTracking, headlineLineHeight, capitalization, scaleRatios, weightHierarchy)
6. cameraLanguage (baseFieldOfView, primaryShotPhilosophy, tiltConstraints, virtualDistance, cameraMotionCurve)
7. recurringSubjects (primary-product-hero, brand-monogram, interaction-pointer, verification-badge)
`;

    const result = await this.gemini.generateStructuredJSON<any>(
      "You are an expert creative studio art director specializing in broadcast motion identity. Always reply with strict JSON matching the schema requirements.",
      prompt
    );

    if (!result || !result.productIdentity || !result.visualLanguage) {
      return null;
    }

    // Ensure objects exist before trying to patch them
    if (!result.materials) result.materials = {};
    if (!result.lightingLogic) result.lightingLogic = {};
    if (!result.typographySystem) result.typographySystem = {};
    if (!result.cameraLanguage) result.cameraLanguage = {};
    
    // Fallbacks for productIdentity
    if (result.productIdentity.formFactor && !["desktop-browser", "mobile-device", "hardware-console", "bento-dashboard", "fintech-card", "abstract-metric"].includes(result.productIdentity.formFactor)) {
      result.productIdentity.formFactor = "desktop-browser";
    }
    if (!result.productIdentity.name) result.productIdentity.name = profile.identity.name || "Brand";
    if (!result.productIdentity.category) result.productIdentity.category = profile.positioning?.category || "Specialty Brand";
    if (!result.productIdentity.signatureElement) {
      result.productIdentity.signatureElement = `${profile.identity.name} Signature Product Package`;
    }
    if (!result.productIdentity.keyDifferentiatorVisual) {
      result.productIdentity.keyDifferentiatorVisual = profile.positioning?.differentiator || "Refined ritual and high-craft tactile packaging";
    }
    if (typeof result.productIdentity.monogramOrLogo !== "object" || result.productIdentity.monogramOrLogo === null) {
      result.productIdentity.monogramOrLogo = {
        symbol: profile.identity.name.substring(0, 2).toUpperCase(),
        placement: "top-left",
        treatment: "minimal-monochrome",
      };
    } else {
      const ml = result.productIdentity.monogramOrLogo;
      if (!ml.symbol) ml.symbol = profile.identity.name.substring(0, 2).toUpperCase();
      if (!["top-left", "top-center", "center-watermark"].includes(ml.placement)) {
        ml.placement = "top-left";
      }
      if (!["glow-bloom", "minimal-monochrome", "embossed-metallic"].includes(ml.treatment)) {
        ml.treatment = "minimal-monochrome";
      }
    }

    // Fallbacks for visualLanguage
    if (result.visualLanguage.theme && !["dark-saas", "editorial-light", "cyber-terminal", "industrial-monolith", "consumer-vibrant"].includes(result.visualLanguage.theme)) {
      result.visualLanguage.theme = profile.identity.theme === "editorial-light" ? "editorial-light" : "dark-saas";
    }
    if (!result.visualLanguage.aestheticPhilosophy) {
      result.visualLanguage.aestheticPhilosophy = "Quiet luxury, deliberate pacing, high negative space, and refined typography.";
    }
    if (!result.visualLanguage.colorTokens || typeof result.visualLanguage.colorTokens !== "object") {
      result.visualLanguage.colorTokens = {};
    }
    const ct = result.visualLanguage.colorTokens;
    if (!ct.primaryBrand) ct.primaryBrand = profile.identity.colors?.primary || "#2C1810";
    if (!ct.accentHighlight) ct.accentHighlight = profile.identity.colors?.accent || "#D4A373";
    if (!ct.secondaryBrand) ct.secondaryBrand = profile.identity.colors?.secondary || "#1A0F0A";
    if (!ct.backgroundBase) ct.backgroundBase = result.visualLanguage.theme === "editorial-light" ? "#F8F7F3" : (profile.identity.colors?.background || "#08080B");
    if (!ct.surfaceElevated) ct.surfaceElevated = result.visualLanguage.theme === "editorial-light" ? "#FFFFFF" : "#12131A";
    if (!ct.surfaceOverlay) ct.surfaceOverlay = result.visualLanguage.theme === "editorial-light" ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.04)";
    if (!ct.borderSubtle) ct.borderSubtle = result.visualLanguage.theme === "editorial-light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)";
    if (!ct.textPrimary) ct.textPrimary = result.visualLanguage.theme === "editorial-light" ? "#18181B" : "#FFFFFF";
    if (!ct.textMuted) ct.textMuted = result.visualLanguage.theme === "editorial-light" ? "#71717A" : "#94A3B8";

    if (typeof result.visualLanguage.negativeSpaceBaseline === "string") {
      result.visualLanguage.negativeSpaceBaseline = parseFloat(result.visualLanguage.negativeSpaceBaseline) || 0.48;
    }
    if (typeof result.visualLanguage.negativeSpaceBaseline !== "number" || isNaN(result.visualLanguage.negativeSpaceBaseline)) {
      result.visualLanguage.negativeSpaceBaseline = 0.55;
    }
    result.visualLanguage.negativeSpaceBaseline = Math.min(1.0, Math.max(0.0, result.visualLanguage.negativeSpaceBaseline));

    if (typeof result.visualLanguage.cornerRadii !== "object" || result.visualLanguage.cornerRadii === null) {
      result.visualLanguage.cornerRadii = { container: 24, card: 16, pill: 9999 };
    }

    // Try to normalize fields the LLM might hallucinate based on enum requirements
    if (result.materials.surfaceType && !["glassmorphism", "matte-ceramic", "anodized-aluminum", "tactile-paper", "glossy-acrylic"].includes(result.materials.surfaceType)) {
      result.materials.surfaceType = result.visualLanguage.theme === "editorial-light" ? "tactile-paper" : "glassmorphism";
    }
    if (!result.materials.surfaceType) {
      result.materials.surfaceType = result.visualLanguage.theme === "editorial-light" ? "tactile-paper" : "glassmorphism";
    }
    if (result.materials.borderSheen && !["specular-metallic", "subtle-hairline", "neon-glow", "none"].includes(result.materials.borderSheen)) {
      result.materials.borderSheen = "subtle-hairline";
    }
    if (!result.materials.borderSheen) result.materials.borderSheen = "subtle-hairline";

    if (typeof result.materials.backdropBlur === "string") result.materials.backdropBlur = parseFloat(result.materials.backdropBlur) || 20;
    if (typeof result.materials.backdropBlur !== "number" || isNaN(result.materials.backdropBlur)) result.materials.backdropBlur = 20;
    if (typeof result.materials.roughness === "string") result.materials.roughness = parseFloat(result.materials.roughness) || 0.2;
    if (typeof result.materials.roughness !== "number" || isNaN(result.materials.roughness)) result.materials.roughness = 0.2;
    if (typeof result.materials.transmissionOpacity === "string") result.materials.transmissionOpacity = parseFloat(result.materials.transmissionOpacity) || 0.85;
    if (typeof result.materials.transmissionOpacity !== "number" || isNaN(result.materials.transmissionOpacity)) result.materials.transmissionOpacity = 0.85;

    // Fix shadowTokens: must be object with elevation and ambientGlow strings
    if (typeof result.materials.shadowTokens !== "object" || result.materials.shadowTokens === null) {
      result.materials.shadowTokens = {
        elevation: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
        ambientGlow: `0 0 30px ${ct.accentHighlight}25`,
      };
    } else {
      if (typeof result.materials.shadowTokens.elevation !== "string") {
        result.materials.shadowTokens.elevation = "0 25px 50px -12px rgba(0, 0, 0, 0.6)";
      }
      if (typeof result.materials.shadowTokens.ambientGlow !== "string") {
        result.materials.shadowTokens.ambientGlow = `0 0 30px ${ct.accentHighlight}25`;
      }
    }

    if (typeof result.lightingLogic.keyLightVector !== "object" || result.lightingLogic.keyLightVector === null) {
      result.lightingLogic.keyLightVector = { angleDeg: 145, elevationDeg: 60 };
    }
    let kInt = typeof result.lightingLogic.keyIntensity === "string" ? parseFloat(result.lightingLogic.keyIntensity) : (result.lightingLogic.keyIntensity ?? 0.8);
    if (isNaN(kInt)) kInt = 0.8;
    if (kInt > 1) kInt = kInt > 10 ? kInt / 100 : kInt / 10;
    result.lightingLogic.keyIntensity = Math.min(1.0, Math.max(0.0, kInt));

    let ambFill = typeof result.lightingLogic.ambientFillOpacity === "string" ? parseFloat(result.lightingLogic.ambientFillOpacity) : (result.lightingLogic.ambientFillOpacity ?? 0.25);
    if (isNaN(ambFill)) ambFill = 0.25;
    if (ambFill > 1) ambFill = ambFill > 10 ? ambFill / 100 : ambFill / 10;
    result.lightingLogic.ambientFillOpacity = Math.min(1.0, Math.max(0.0, ambFill));

    if (typeof result.lightingLogic.atmosphericGlowOrb !== "object" || result.lightingLogic.atmosphericGlowOrb === null) {
      result.lightingLogic.atmosphericGlowOrb = { enabled: true, color: ct.accentHighlight || "#8B5CF6", radiusPercent: 65, blurPx: 120 };
    } else {
      const orb = result.lightingLogic.atmosphericGlowOrb;
      if (typeof orb.enabled !== "boolean") orb.enabled = true;
      if (typeof orb.color !== "string") orb.color = ct.accentHighlight || "#8B5CF6";
      if (typeof orb.radiusPercent !== "number" || isNaN(orb.radiusPercent)) orb.radiusPercent = 65;
      if (typeof orb.blurPx !== "number" || isNaN(orb.blurPx)) orb.blurPx = 120;
    }
    if (result.lightingLogic.shadowFalloff && !["crisp-contact", "diffuse-soft", "cinematic-volumetric"].includes(result.lightingLogic.shadowFalloff)) {
      result.lightingLogic.shadowFalloff = "diffuse-soft";
    }
    if (!result.lightingLogic.shadowFalloff) result.lightingLogic.shadowFalloff = "diffuse-soft";

    if (result.typographySystem.capitalization && !["none", "uppercase", "title-case"].includes(result.typographySystem.capitalization)) {
      result.typographySystem.capitalization = "none";
    }
    if (!result.typographySystem.headlineFont) {
      result.typographySystem.headlineFont = result.visualLanguage.theme === "editorial-light" ? "'Newsreader', 'Playfair Display', Georgia, serif" : "'Inter', sans-serif";
    }
    if (!result.typographySystem.bodyFont) {
      result.typographySystem.bodyFont = "'Inter', -apple-system, sans-serif";
    }
    if (!result.typographySystem.monoFont) {
      result.typographySystem.monoFont = "'JetBrains Mono', monospace";
    }
    if (!result.typographySystem.headlineTracking) {
      result.typographySystem.headlineTracking = result.visualLanguage.theme === "editorial-light" ? "-0.015em" : "-0.038em";
    }
    if (typeof result.typographySystem.headlineLineHeight === "string") result.typographySystem.headlineLineHeight = parseFloat(result.typographySystem.headlineLineHeight) || 1.08;
    if (typeof result.typographySystem.headlineLineHeight !== "number" || isNaN(result.typographySystem.headlineLineHeight)) result.typographySystem.headlineLineHeight = 1.08;
    
    if (typeof result.typographySystem.scaleRatios !== "object" || result.typographySystem.scaleRatios === null) {
      result.typographySystem.scaleRatios = { heroDisplay: 72, sectionHeadline: 48, bodySubtext: 24, badgeLabel: 13 };
    }
    if (typeof result.typographySystem.weightHierarchy !== "object" || result.typographySystem.weightHierarchy === null) {
      result.typographySystem.weightHierarchy = { hero: 800, subtext: 500, badge: 700 };
    } else {
      const wh = result.typographySystem.weightHierarchy;
      if (![700, 800, 900].includes(wh.hero)) wh.hero = 800;
      if (![400, 500, 600].includes(wh.subtext)) wh.subtext = 500;
      if (![600, 700].includes(wh.badge)) wh.badge = 700;
    }

    if (typeof result.cameraLanguage.baseFieldOfView === "string") result.cameraLanguage.baseFieldOfView = parseFloat(result.cameraLanguage.baseFieldOfView) || 50;
    if (typeof result.cameraLanguage.baseFieldOfView !== "number" || isNaN(result.cameraLanguage.baseFieldOfView)) result.cameraLanguage.baseFieldOfView = 50;
    if (typeof result.cameraLanguage.tiltConstraints !== "object" || result.cameraLanguage.tiltConstraints === null) {
      result.cameraLanguage.tiltConstraints = { maxTiltX: 12, maxTiltY: 8 };
    }
    if (result.cameraLanguage.primaryShotPhilosophy && !["controlled-push-in", "subtle-drift", "orbital-pivot", "locked-monumental"].includes(result.cameraLanguage.primaryShotPhilosophy)) {
      result.cameraLanguage.primaryShotPhilosophy = "controlled-push-in";
    }
    if (!result.cameraLanguage.primaryShotPhilosophy) result.cameraLanguage.primaryShotPhilosophy = "controlled-push-in";

    if (result.cameraLanguage.virtualDistance && !["macro-tight", "medium-balanced", "wide-architectural"].includes(result.cameraLanguage.virtualDistance)) {
      result.cameraLanguage.virtualDistance = "medium-balanced";
    }
    if (!result.cameraLanguage.virtualDistance) result.cameraLanguage.virtualDistance = "medium-balanced";

    if (result.cameraLanguage.cameraMotionCurve && !["cinematic-smooth", "snappy-tech", "elastic-settle"].includes(result.cameraLanguage.cameraMotionCurve)) {
      result.cameraLanguage.cameraMotionCurve = "cinematic-smooth";
    }
    if (!result.cameraLanguage.cameraMotionCurve) result.cameraLanguage.cameraMotionCurve = "cinematic-smooth";
    
    if (!Array.isArray(result.recurringSubjects)) {
      result.recurringSubjects = [];
    }

    return {
      id: campaignId,
      campaignId,
      brandName: profile.identity.name,
      createdAt: Date.now(),
      version: 1,
      productIdentity: result.productIdentity,
      visualLanguage: result.visualLanguage,
      materials: result.materials,
      lightingLogic: result.lightingLogic,
      typographySystem: result.typographySystem,
      cameraLanguage: result.cameraLanguage,
      recurringSubjects: result.recurringSubjects || [],
      transformationExceptions: {
        allowedSceneIndices,
        rules: transformationRules,
      },
    };
  }
}

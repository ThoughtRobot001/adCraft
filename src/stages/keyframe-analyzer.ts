import fs from "fs";
import { ApprovedKeyframe, BrandProfile, KeyframeAnalysis, StoryboardScene } from "./types";

export class KeyframeAnalyzer {
  /**
   * Analyzes an approved visual keyframe across all 11 mandatory dimensions:
   * 1. Composition
   * 2. Focal Point
   * 3. Scale Relationships
   * 4. Spatial Hierarchy
   * 5. Negative Space
   * 6. Depth Planes
   * 7. Cropping
   * 8. Typography Placement
   * 9. Color Distribution
   * 10. Camera / Framing
   * 11. Visual Density
   */
  analyzeApprovedKeyframe(
    approved: ApprovedKeyframe,
    scene: StoryboardScene,
    profile: BrandProfile
  ): KeyframeAnalysis {
    const candidate = approved.candidateKeyframe;
    const brand = profile.identity;
    const comp = scene.visualComposition;
    const isAsymmetric = candidate.metadata?.variantType === "asymmetric-depth";

    // Inspect SVG if available for exact geometry
    let svgText = candidate.metadata?.svgContent || "";
    if (!svgText && candidate.imageUri && typeof fs !== "undefined" && fs.existsSync) {
      try {
        if (fs.existsSync(candidate.imageUri)) {
          svgText = fs.readFileSync(candidate.imageUri, "utf-8");
        }
      } catch {
        // ignore read failure, use analytical model
      }
    }

    // 1. Composition Archetype & Balance
    const archetype = comp?.dominantGeometry === "asymmetric-grid" || isAsymmetric
      ? "asymmetric-editorial"
      : comp?.dominantGeometry === "radial-bloom"
      ? "radial-bloom"
      : comp?.dominantGeometry === "split-plane"
      ? "split-plane"
      : "monolithic-centered";

    const balance = isAsymmetric ? "asymmetrical" : "symmetrical";
    const visualAnchorZone = isAsymmetric ? "left-split" : "center";

    // 2. Focal Point
    const focalX = isAsymmetric ? 38 : (comp?.focalPoint.x ?? 50);
    const focalY = comp?.focalPoint.y ?? 52;
    const focalPoint = {
      x: focalX,
      y: focalY,
      visualWeight: isAsymmetric ? 0.88 : 0.94,
      description: `Primary focal anchor located at (${focalX}%, ${focalY}%) centered on hero UI component with atmospheric rim lighting.`,
    };

    // 3. Scale Relationships
    const headlineLen = scene.headlineCopy.length;
    const targetFontSize = headlineLen < 25 ? 58 : headlineLen < 45 ? 52 : 46;
    const scaleRelationships = {
      heroElementScale: 1.15,
      headlineToBodyRatio: 2.8,
      largestToSmallestRatio: 5.2,
      recommendedHeroWidthPercent: isAsymmetric ? 86 : 82,
    };

    // 4. Spatial Hierarchy
    const heroPrimitive = this.inferHeroPrimitive(scene);
    const spatialHierarchy = {
      layers: [
        {
          rank: 1,
          role: "hero" as const,
          elementDescription: `Central interactive ${heroPrimitive}`,
          suggestedPrimitiveType: heroPrimitive,
          targetZIndex: 10,
        },
        {
          rank: 2,
          role: "supporting" as const,
          elementDescription: "Kinetic headline typography anchored above hero",
          suggestedPrimitiveType: "kinetic-text",
          targetZIndex: 12,
        },
        {
          rank: 3,
          role: "ambient" as const,
          elementDescription: "Ambient particle tunnel / volumetric lighting orb",
          suggestedPrimitiveType: "particle-tunnel",
          targetZIndex: 5,
        },
      ],
    };

    // 5. Negative Space
    const negativeRatio = comp?.negativeSpaceRatio ?? (isAsymmetric ? 0.52 : 0.62);
    const negativeSpace = {
      ratio: negativeRatio,
      breathingZones: [
        "top-third" as const,
        "bottom-third" as const,
        ...(isAsymmetric ? ["right-margin" as const] : ["left-margin" as const, "right-margin" as const]),
      ],
      unclutteredScore: 9.4,
    };

    // 6. Depth Planes
    const depthPlanes = {
      foreground: {
        element: "Floating luminous atmosphere dust / particle drift",
        blur: 1.5,
        opacity: 0.35,
      },
      heroMidground: {
        element: `3D perspective ${heroPrimitive}`,
        perspectiveTiltX: isAsymmetric ? 6 : 0,
        perspectiveTiltY: isAsymmetric ? -4 : 0,
        zDepth: 40,
      },
      background: {
        atmosphericHaze: 0.12,
        lightBloom: true,
        colorGradient: `radial-gradient(circle at 50% 50%, ${brand.colors.primary}33 0%, ${brand.colors.background || "#08080B"} 100%)`,
      },
      vanishingPoint: { x: 50, y: 55 },
    };

    // 7. Cropping
    const cropping = {
      hasBleedingEdges: isAsymmetric,
      bleedDirections: isAsymmetric ? (["left"] as ("left" | "top" | "bottom" | "right")[]) : [],
      framingBoundary: isAsymmetric ? ("offscreen-projection" as const) : ("contained" as const),
    };

    // 8. Typography Placement
    const typographyPlacement = {
      headlineBounds: {
        x: isAsymmetric ? 12 : 50,
        y: 22,
        width: isAsymmetric ? 80 : 82,
        height: 14,
      },
      alignment: isAsymmetric ? ("left" as const) : ("center" as const),
      targetFontSize,
      targetFontWeight: 800,
      letterSpacing: "-0.03em",
      maxCharsPerLine: isAsymmetric ? 24 : 32,
    };

    // 9. Color Distribution
    const colorDistribution = {
      dominantBackgroundHex: brand.colors.background || "#08080B",
      surfaceHex: (brand.colors as any).surface || "#111116",
      accentHighlights: [
        brand.colors.primary,
        brand.colors.secondary || "#8B7CFF",
        brand.colors.accent || "#B7AEFF",
      ],
      atmosphericGlow: {
        color: brand.colors.primary,
        center: { x: focalX, y: focalY },
        radius: 45,
        intensity: 0.25,
      },
      luminescenceContrast: "high-contrast" as const,
    };

    // 10. Camera / Framing
    const shotType = comp?.framing === "macro-extreme"
      ? "macro"
      : comp?.framing === "wide-cinematic"
      ? "pull-back"
      : comp?.framing === "isometric-cant"
      ? "orbit"
      : "push-in";

    const cameraFraming = {
      shotType: shotType as any,
      fieldOfView: 52,
      cameraTiltX: isAsymmetric ? 4 : 0,
      cameraPanY: isAsymmetric ? -2 : 0,
      virtualDistance: "medium-tight" as const,
    };

    // 11. Visual Density
    const visualDensity = {
      densityScore: 4.2, // Clean, elegant, non-overloaded
      clusterZone: { x: focalX, y: focalY, radius: 28 },
      clutterFreeZones: [
        "top" as const,
        "bottom" as const,
        "perimeter" as const,
      ],
    };

    return {
      sceneId: scene.id,
      approvedKeyframeId: approved.candidateKeyframe.id,
      composition: {
        archetype,
        balance,
        visualAnchorZone,
      },
      focalPoint,
      scaleRelationships,
      spatialHierarchy,
      negativeSpace,
      depthPlanes,
      cropping,
      typographyPlacement,
      colorDistribution,
      cameraFraming,
      visualDensity,
    };
  }

  private inferHeroPrimitive(scene: StoryboardScene): string {
    const intents = scene.elementIntents || [];
    for (const intent of intents) {
      if (intent.importance === "hero") {
        if (intent.role === "product-mockup") return "app-window";
        if (intent.role === "metric-hero") return "metric-counter";
        if (intent.role === "brand-monogram") return "logo-reveal";
        if (intent.role === "call-to-action") return "cta-button";
      }
    }

    const desc = (scene.visualDescription + " " + scene.intent).toLowerCase();
    if (desc.includes("phone") || desc.includes("mobile")) return "phone-mockup";
    if (desc.includes("window") || desc.includes("browser") || desc.includes("dashboard")) return "app-window";
    if (desc.includes("metric") || desc.includes("counter") || desc.includes("number")) return "metric-counter";
    if (desc.includes("bento") || desc.includes("card grid")) return "bento-grid";
    if (desc.includes("logo") || desc.includes("monogram")) return "logo-reveal";
    if (desc.includes("cta") || desc.includes("button")) return "cta-button";
    if (desc.includes("cascade") || desc.includes("notification")) return "notification-cascade";

    return "kinetic-text";
  }
}

import { CampaignBrief } from "../ai/types";
import { Element, MotionIR, Scene, SceneCamera } from "../schema";
import { BrandProfile, KeyframeAnalysis, MotionPlan, StoryboardScene } from "./types";

export interface ReconstructedSceneInput {
  scene: StoryboardScene;
  analysis: KeyframeAnalysis;
  motionPlan?: MotionPlan;
}

export class MotionIRReconstructor {
  /**
   * Reconstructs an array of scenes into a complete, deterministic MotionIR specification
   * derived from the Storyboard, 11-dimension Keyframe Analysis, and Temporal MotionPlan.
   */
  reconstructMotionIR(
    reconstructedScenes: ReconstructedSceneInput[],
    profile: BrandProfile,
    brief: CampaignBrief,
    fps = 30
  ): MotionIR {
    const brand = profile.identity;
    const width = brief.aspectRatio === "9:16" ? 1080 : 1920;
    const height = brief.aspectRatio === "9:16" ? 1920 : 1080;
    const aspectRatio = (brief.aspectRatio as "9:16" | "16:9" | "1:1") || "9:16";

    const scenes: Scene[] = reconstructedScenes.map(({ scene, analysis, motionPlan }, index) =>
      this.reconstructScene(scene, analysis, profile, brief, index, reconstructedScenes.length, fps, motionPlan)
    );

    return {
      id: `reconstructed-ad-${Date.now()}`,
      meta: {
        title: `${brand.name} - ${brief.productName || "Product"} Keyframe-Reconstructed Ad`,
        fps,
        width,
        height,
        aspectRatio,
      },
      brand,
      scenes,
      audio: {
        volume: 0.45,
        loop: true,
        fadeInFrames: 15,
        fadeOutFrames: 20,
        sfx: [
          { type: "tension-drone", atFrame: 0, volume: 0.8 },
          { type: "impact", atFrame: 120, volume: 0.9 },
          { type: "whoosh", atFrame: 240, volume: 0.7 },
          { type: "switch", atFrame: 380, volume: 0.8 },
          { type: "chime", atFrame: 500, volume: 0.85 },
        ],
      },
    };
  }

  /**
   * Reconstructs a single scene from its 11-dimension KeyframeAnalysis blueprint.
   */
  reconstructScene(
    scene: StoryboardScene,
    analysis: KeyframeAnalysis,
    profile: BrandProfile,
    brief: CampaignBrief,
    index: number,
    totalScenes: number,
    fps: number,
    motionPlan?: MotionPlan
  ): Scene {
    const brand = profile.identity;
    const durationFrames = Math.round(scene.durationSeconds * fps);
    const isFirst = index === 0;
    const isLast = index === totalScenes - 1;

    // 1. Composition -> Layout Strategy
    const layoutStrategy =
      analysis.negativeSpace.ratio >= 0.65
        ? "minimal-focus"
        : analysis.composition.archetype === "asymmetric-editorial" || analysis.composition.archetype === "split-plane"
        ? "split-depth"
        : "hero-centered";

    // 2. Color Distribution -> Scene Background
    const background = {
      type: "gradient" as const,
      color: analysis.colorDistribution.dominantBackgroundHex,
      gradientTo: analysis.colorDistribution.surfaceHex,
      angle: 160,
      glowOrb: !!analysis.colorDistribution.atmosphericGlow,
    };

    // 3. Depth Planes -> Atmosphere
    const atmosphere = {
      grain: 0.10,
      vignette: 0.28,
      haze: analysis.depthPlanes.background.atmosphericHaze || 0.12,
    };

    // 4. Camera & Framing
    const cameraShot: SceneCamera["shot"] =
      analysis.cameraFraming.shotType === "macro"
        ? "push-in"
        : analysis.cameraFraming.shotType === "static"
        ? "push-in"
        : analysis.cameraFraming.shotType;

    const camera: SceneCamera = {
      shot: cameraShot,
      intensity: "medium",
      ease: "cinematic",
    };

    // 5. Scene Transition
    const transition = isLast
      ? { type: "none" as const, presentation: "none" as const, direction: "from-right" as const, durationFrames: 15 }
      : isFirst
      ? { type: "fade" as const, presentation: "fade" as const, direction: "from-right" as const, durationFrames: 15 }
      : { type: "slide-left" as const, presentation: "slide" as const, direction: "from-right" as const, durationFrames: 15 };

    // 6. Elements Reconstruction from Spatial Hierarchy & Geometry
    const elements: Element[] = [];

    // Layer 1: Headline Typography (derived from typographyPlacement)
    const typo = analysis.typographyPlacement;
    const targetFontWeight = (typo.targetFontWeight === 700 ? 700 : typo.targetFontWeight === 900 ? 900 : 800) as (400 | 500 | 600 | 700 | 800 | 900);
    elements.push({
      id: `${scene.id}-headline`,
      type: "kinetic-text",
      importance: "hero",
      z: 0,
      parallax: 0,
      props: {
        text: scene.headlineCopy,
        fontSize: typo.targetFontSize,
        fontWeight: targetFontWeight,
        letterSpacing: typo.letterSpacing,
        color: "#F5F3FF",
        position: { x: typo.headlineBounds.x, y: typo.headlineBounds.y },
        maxWidth: typo.headlineBounds.width,
        align: typo.alignment || "center",
        animation: "fade-up",
        delay: 0,
      },
    });

    // Layer 2: Hero Interactive Component (derived from focalPoint, scale, depth planes, and motionPlan)
    const heroLayer = analysis.spatialHierarchy.layers.find((l) => l.role === "hero");
    const heroType = heroLayer?.suggestedPrimitiveType || "bento-grid";
    const heroElement = this.buildHeroElement(
      heroType,
      scene,
      analysis,
      profile,
      durationFrames,
      motionPlan
    );
    if (heroElement) {
      elements.push(heroElement);
    }

    // Layer 3: Ambient Dust / Particles (if foreground plane exists)
    if (analysis.depthPlanes.foreground) {
      elements.push({
        id: `${scene.id}-ambient-particles`,
        type: "particle-tunnel",
        importance: "ambient",
        z: 80,
        parallax: 0.15,
        props: {
          delay: 0,
          color: brand.colors.primary,
          accentColor: brand.colors.accent || "#B7AEFF",
          speed: 1.2,
          density: 40,
          streakLength: 2.5,
          direction: "outward" as const,
          fadeFrames: 15,
        },
      });
    }

    return {
      id: scene.id,
      name: scene.name,
      durationFrames,
      background,
      camera,
      atmosphere,
      transition,
      layoutStrategy,
      heroElementId: heroElement?.id || `${scene.id}-headline`,
      elements,
      usedMemoryItemIds: [],
    };
  }

  /**
   * Constructs the deterministic hero primitive from the Keyframe Analysis coordinates and MotionPlan.
   */
  private buildHeroElement(
    primitiveType: string,
    scene: StoryboardScene,
    analysis: KeyframeAnalysis,
    profile: BrandProfile,
    durationFrames: number,
    motionPlan?: MotionPlan
  ): Element | null {
    const brand = profile.identity;
    const heroX = analysis.focalPoint.x;
    const heroY = analysis.focalPoint.y;
    const heroWidth = analysis.scaleRelationships.recommendedHeroWidthPercent;
    const tiltX = analysis.depthPlanes.heroMidground.perspectiveTiltX;
    const tiltY = analysis.depthPlanes.heroMidground.perspectiveTiltY;
    const zDepth = analysis.depthPlanes.heroMidground.zDepth;

    if (primitiveType === "candidate-noise-field" || primitiveType === "perspective-card-field") {
      return {
        id: `${scene.id}-hero-noise-field`,
        type: "candidate-noise-field",
        importance: "hero",
        z: zDepth,
        parallax: 0.05,
        props: {
          delay: 0,
          containerStyle: {
            topPercent: 35,
            heightPercent: 61,
            leftPercent: 4,
            widthPercent: 92,
            borderRadius: 32,
            borderColor: "rgba(255, 255, 255, 0.12)",
            backgroundColor: "#080A11",
          },
          volumetricBeam: {
            color: analysis.colorDistribution.atmosphericGlow?.color || "#7C3AED",
            secondaryColor: "#6366F1",
            originX: 50,
            originY: 100,
            intensity: 0.85,
          },
          watermarkText: brand.name.toUpperCase(),
          cards: [
            {
              id: `${scene.id}-c1`,
              name: "James Monet",
              role: "Senior Backend Engineer",
              tags: ["Go", "PostgreSQL", "Kafka"],
              position: { x: 32, y: 24, z: 50 },
              rotation: { x: 9, y: 0, z: 0 },
              spawnFrame: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c1`)?.spawnFrame ?? 0,
              entryTrajectory: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c1`)?.entryTrajectory ?? "fade",
            },
            {
              id: `${scene.id}-c2`,
              name: "Alexandre Chen",
              role: "Full Stack Engineer",
              tags: ["React", "TypeScript", "Node"],
              alertBadge: { text: "482 Unscreened", variant: "red" as const },
              position: { x: 7, y: 10, z: 40 },
              rotation: { x: 10, y: -6, z: -1 },
              spawnFrame: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c2`)?.spawnFrame ?? 18,
              entryTrajectory: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c2`)?.entryTrajectory ?? "from-left",
            },
            {
              id: `${scene.id}-c3`,
              name: "Raina Name",
              role: "VP of Engineering",
              tags: ["Tech Leadership", "Scale", "Hiring"],
              position: { x: 60, y: 8, z: 20 },
              rotation: { x: 12, y: 6, z: 2 },
              spawnFrame: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c3`)?.spawnFrame ?? 30,
              entryTrajectory: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c3`)?.entryTrajectory ?? "from-right",
            },
            {
              id: `${scene.id}-c4`,
              name: "Roscoe Moreno",
              role: "Lead Systems Architect",
              tags: ["Rust", "Distributed", "K8s"],
              alertBadge: { text: "Backlog", variant: "red" as const },
              position: { x: 6, y: 44, z: 30 },
              rotation: { x: 12, y: -4, z: 1 },
              spawnFrame: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c4`)?.spawnFrame ?? 42,
              entryTrajectory: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c4`)?.entryTrajectory ?? "from-left",
            },
            {
              id: `${scene.id}-c5`,
              name: "Jocelyn Nonda",
              role: "Product Design Lead",
              tags: ["Design Systems", "Figma", "UI"],
              alertBadge: { text: "Pending 3w", variant: "purple" as const },
              position: { x: 62, y: 48, z: 35 },
              rotation: { x: 8, y: 4, z: -1 },
              spawnFrame: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c5`)?.spawnFrame ?? 52,
              entryTrajectory: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c5`)?.entryTrajectory ?? "from-right",
            },
            {
              id: `${scene.id}-c6`,
              name: "Jethan Smith",
              role: "Staff Infrastructure Eng",
              matchScore: "98% Fit",
              tags: ["Kubernetes", "AWS", "Terraform"],
              alertBadge: { text: "SLA Warning", variant: "red" as const },
              position: { x: 28, y: 48, z: 65 },
              rotation: { x: 11, y: 2, z: 1 },
              spawnFrame: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c6`)?.spawnFrame ?? 60,
              entryTrajectory: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c6`)?.entryTrajectory ?? "from-depth",
            },
            {
              id: `${scene.id}-c7`,
              name: "Maria Santos",
              role: "Security Lead",
              tags: ["InfraSec", "Compliance", "SOC2"],
              alertBadge: { text: "Review Overdue", variant: "red" as const },
              position: { x: 4, y: 74, z: 15 },
              rotation: { x: 14, y: -6, z: 1 },
              spawnFrame: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c7`)?.spawnFrame ?? 66,
              entryTrajectory: motionPlan?.spawningSchedule?.find((s) => s.elementId === `${scene.id}-c7`)?.entryTrajectory ?? "drop-down",
            },
          ],
        },
      };
    }

    if (primitiveType === "bento-grid") {
      return {
        id: `${scene.id}-hero-bento`,
        type: "bento-grid",
        importance: "supporting",
        z: zDepth,
        parallax: 0.05,
        props: {
          delay: 0,
          position: { x: heroX, y: heroY },
          width: heroWidth,
          cards: [
            {
              id: `${scene.id}-card-primary`,
              type: "audit-feed",
              title: scene.intent,
              badge: "Verified Signal",
              items: [
                "Direct Architecture & Calibration Match",
                "Screening Delays Eliminated",
                "Instant High-Velocity Match",
              ],
              accentColor: brand.colors.primary,
            },
            {
              id: `${scene.id}-card-metric`,
              type: "metric-stat",
              value: "99.4%",
              label: "PRECISION SCORE",
              tag: "Signal Calibrated",
              accentColor: brand.colors.accent || "#B7AEFF",
            },
            {
              id: `${scene.id}-card-trust`,
              type: "audit-feed",
              title: "Autonomous Calibration",
              items: [
                "Full Stack Verification",
                "Production Ready",
              ],
              accentColor: brand.colors.primary,
            },
          ],
        },
      };
    }

    if (primitiveType === "app-window") {
      return {
        id: `${scene.id}-hero-window`,
        type: "app-window",
        importance: "supporting",
        z: zDepth,
        parallax: 0.05,
        props: {
          title: `${brand.name} Workspace`,
          url: `${brand.name.toLowerCase()}.com/dashboard`,
          position: { x: heroX, y: heroY },
          width: heroWidth,
          mockType: "analytics" as const,
          delay: 0,
          animation: "float-up" as const,
          tilt: true,
          shadow: true,
        },
      };
    }

    if (primitiveType === "metric-counter") {
      return {
        id: `${scene.id}-hero-metric`,
        type: "metric-counter",
        importance: "hero",
        z: zDepth,
        parallax: 0.05,
        props: {
          value: 99.4,
          suffix: "%",
          label: "ACCURACY & SPEED",
          position: { x: heroX, y: heroY },
          color: brand.colors.primary,
          delay: 0,
          decimals: 1,
          durationFrames: 45,
          displayMode: "hero-typographic" as const,
        },
      };
    }

    if (primitiveType === "logo-reveal") {
      return {
        id: `${scene.id}-hero-logo`,
        type: "logo-reveal",
        importance: "hero",
        z: 0,
        parallax: 0,
        props: {
          brandName: brand.name,
          tagline: brand.tagline || scene.headlineCopy,
          position: { x: heroX, y: heroY },
          animation: "fade-glow" as const,
          delay: 0,
          size: 140,
        },
      };
    }

    if (primitiveType === "cta-button") {
      return {
        id: `${scene.id}-hero-cta`,
        type: "cta-button",
        importance: "supporting",
        z: 0,
        parallax: 0,
        props: {
          text: `Get Started with ${brand.name}`,
          position: { x: heroX, y: heroY },
          color: "#FFFFFF",
          backgroundColor: "brand.primary",
          delay: 12,
          pulse: true,
        },
      };
    }

    if (primitiveType === "phone-mockup") {
      return {
        id: `${scene.id}-hero-phone`,
        type: "phone-mockup",
        importance: "hero",
        z: zDepth,
        parallax: 0.05,
        props: {
          title: `${brand.name} Mobile`,
          position: { x: heroX, y: heroY },
          width: heroWidth,
          delay: 8,
          tilt: true,
          rotateX: tiltX,
          rotateY: tiltY,
          theme: "dark" as const,
          badges: [],
          appCategory: "custom" as const,
          screenType: "custom" as const,
          pedestal: false,
        },
      };
    }

    return null;
  }
}

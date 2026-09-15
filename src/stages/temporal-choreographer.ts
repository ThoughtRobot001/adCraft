import {
  ApprovedKeyframe,
  BrandProfile,
  CinematicBeat,
  CinematicObjectRole,
  KeyframeAnalysis,
  MotionPlan,
  SpawningEvent,
  StoryboardScene,
  TemporalCameraPosition,
  TemporalCompositionGeometry,
  TemporalCompositionSnapshot,
  TemporalDensity,
  TemporalDepthDistribution,
  TemporalLightingIntensity,
  TemporalMotionEnergy,
  TemporalPeripheralActivity,
  TemporalScaleHierarchy,
  TemporalState,
  TemporalTypographyState,
} from "./types";

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(min: number, max: number, value: number): number {
  if (max <= min) return 0;
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Formats a human-readable screenplay shot direction script from cinematic beats.
 */
export function formatShotScript(
  sceneName: string,
  narrativeIntent: string,
  durationFrames: number,
  fps: number,
  beats: CinematicBeat[]
): string {
  const lines: string[] = [];
  lines.push("================================================================================");
  lines.push(`ADCRAFT SHOT DIRECTION: ${sceneName.toUpperCase()}`);
  lines.push(`Narrative Intent: ${narrativeIntent}`);
  lines.push(`Total Duration: ${durationFrames} frames (${(durationFrames / fps).toFixed(2)}s @ ${fps}fps) | ${beats.length} Directed Beats`);
  lines.push("================================================================================\n");

  for (const beat of beats) {
    const startSec = (beat.frameRange[0] / fps).toFixed(2);
    const endSec = (beat.frameRange[1] / fps).toFixed(2);
    const timecode = `[${startSec}s - ${endSec}s | f${beat.frameRange[0]}–f${beat.frameRange[1]}]`;

    lines.push(`${timecode} ${beat.name.toUpperCase()} [${beat.stage.toUpperCase()}]`);
    lines.push(`  • Direction: ${beat.shotDirection}`);
    lines.push(`  • Dramatic Intent: ${beat.dramaticIntent}`);
    if (beat.whatEnters.length > 0) {
      lines.push(`  • Enters: ${beat.whatEnters.join(", ")}`);
    }
    if (beat.whatExits && beat.whatExits.length > 0) {
      lines.push(`  • Exits: ${beat.whatExits.join(", ")}`);
    }
    if (beat.dominantElementId) {
      lines.push(`  • Dominant Focus: ${beat.dominantElementId}`);
    }
    if (beat.foregroundBackgroundCrossings.length > 0) {
      for (const cross of beat.foregroundBackgroundCrossings) {
        lines.push(`  • Spatial Crossing: ${cross.elementId} (${cross.path}) — ${cross.description}`);
      }
    }
    if (beat.typographyInterruption.isInterrupted) {
      lines.push(`  • Typography: ⚠ INTERRUPTED by ${beat.typographyInterruption.interrupterElementId} [${beat.typographyInterruption.action}]`);
    } else {
      lines.push(`  • Typography: ${beat.typographyInterruption.action}`);
    }
    lines.push(`  • Camera: ${beat.cameraCue.action.toUpperCase()} (${beat.cameraCue.isHolding ? "HOLD" : "MOVE"}) | Scale: ${beat.cameraCue.scale.toFixed(3)}x, TiltX: ${beat.cameraCue.tiltX.toFixed(1)}°`);
    lines.push(`  • Lighting: ${beat.lightingCue.behavior.toUpperCase()} (${Math.round(beat.lightingCue.intensity * 100)}% intensity, ${beat.lightingCue.beamWidth}px beam)`);
    lines.push(`  • Viewer Attention: (${beat.viewerAttention.from.x}, ${beat.viewerAttention.from.y}) -> (${beat.viewerAttention.to.x}, ${beat.viewerAttention.to.y}) @ f${beat.viewerAttention.landingMomentFrame} [${beat.viewerAttention.focalDescription}]`);
    if (beat.isFreezeSnap) {
      lines.push(`  • ⚡ SNAP FREEZE: All physics, continuous motion, and springs locked for ${beat.frameRange[1] - beat.frameRange[0]} frames.`);
    }
    lines.push("");
  }
  lines.push("================================================================================");
  return lines.join("\n");
}

/**
 * Interpolates the entire visual environment across all 10 composition dimensions at a given frame,
 * incorporating beat-level cinematic direction (camera holds, recoil jolts, typography interruptions, snap freezes).
 */
export function interpolateTemporalComposition(
  motionPlan: MotionPlan,
  frame: number
): TemporalCompositionSnapshot {
  // Check active cinematic beat if beats exist
  const activeBeat = motionPlan.beats?.find(
    (b) => frame >= b.frameRange[0] && frame < b.frameRange[1]
  ) || (motionPlan.beats && motionPlan.beats.length > 0 ? motionPlan.beats[motionPlan.beats.length - 1] : undefined);

  // 3-Frame Snap Freeze check
  const isFreezeSnap = Boolean(activeBeat?.isFreezeSnap || (frame >= 84 && frame <= 87));
  const effectiveFrame = isFreezeSnap ? (activeBeat ? activeBeat.frameRange[0] : 84) : frame;

  const states = [
    motionPlan.startingState,
    ...(motionPlan.intermediateStates || []),
    motionPlan.climaxState,
  ].sort((a, b) => a.frameRange[0] - b.frameRange[0]);

  const defaultGeom: TemporalCompositionGeometry = {
    archetype: "monolithic-centered",
    containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 91, leftPercent: 4.5, borderRadius: 36 },
  };
  const defaultDensity: TemporalDensity = { score: 0.5, breathingRoomRatio: 0.5 };
  const defaultScale: TemporalScaleHierarchy = { heroScale: 1.0, secondaryScale: 0.92 };
  const defaultDepth: TemporalDepthDistribution = { perspective: 1400, tiltX: 12, tiltY: -2, zSpread: 60 };
  const defaultCam: TemporalCameraPosition = { scale: 1.0, translateY: 0 };
  const defaultTypo: TemporalTypographyState = { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08 };
  const defaultLight: TemporalLightingIntensity = { beamIntensity: 0.8, beamWidth: 800, ambientGlowOpacity: 0.6, bloomRadius: 50 };
  const defaultMotion: TemporalMotionEnergy = { springStiffness: 120, springDamping: 14, microLevitationAmp: 4, microLevitationFreq: 0.06, alertPulseRate: 1.0 };
  const defaultPeripheral: TemporalPeripheralActivity = { backgroundBlur: 0, vignetteDarkness: 0.65, edgeOverflow: 0 };

  const getFullState = (s: TemporalState) => ({
    name: s.name,
    dominantFocalPoint: s.dominantFocalPoint || { x: s.focalPoint?.x ?? 50, y: s.focalPoint?.y ?? 50, weight: 0.8 },
    compositionGeometry: s.compositionGeometry || defaultGeom,
    density: s.density || { score: s.visualDensity ?? defaultDensity.score, breathingRoomRatio: 1 - (s.visualDensity ?? 0.5) },
    scaleHierarchy: s.scaleHierarchy || defaultScale,
    depthDistribution: s.depthDistribution || defaultDepth,
    cameraPosition: s.cameraPosition || { scale: s.cameraState?.scale ?? 1.0, translateY: s.cameraState?.translateY ?? 0 },
    typographyState: s.typographyState || defaultTypo,
    lightingIntensity: s.lightingIntensity || defaultLight,
    motionEnergy: s.motionEnergy || defaultMotion,
    peripheralActivity: s.peripheralActivity || defaultPeripheral,
    activeElementIds: s.activeElementIds || [],
  });

  const progress = Math.min(1, Math.max(0, effectiveFrame / Math.max(1, motionPlan.durationFrames)));

  // If before first state anchor
  if (effectiveFrame <= states[0].frameRange[0]) {
    const s0 = getFullState(states[0]);
    return {
      frame,
      effectiveFrame,
      progress,
      activeStateName: s0.name,
      activeBeat,
      isFreezeSnap,
      cameraIsHolding: activeBeat?.cameraCue?.isHolding ?? true,
      typographyInterruption: activeBeat?.typographyInterruption ? {
        isInterrupted: activeBeat.typographyInterruption.isInterrupted,
        interrupterElementId: activeBeat.typographyInterruption.interrupterElementId,
        action: activeBeat.typographyInterruption.action,
      } : undefined,
      ...s0,
    };
  }

  // If at or beyond last state anchor
  const lastState = states[states.length - 1];
  if (effectiveFrame >= lastState.frameRange[0]) {
    const sLast = getFullState(lastState);
    return {
      frame,
      effectiveFrame,
      progress,
      activeStateName: sLast.name,
      activeBeat,
      isFreezeSnap,
      cameraIsHolding: activeBeat?.cameraCue?.isHolding ?? false,
      typographyInterruption: activeBeat?.typographyInterruption ? {
        isInterrupted: activeBeat.typographyInterruption.isInterrupted,
        interrupterElementId: activeBeat.typographyInterruption.interrupterElementId,
        action: activeBeat.typographyInterruption.action,
      } : undefined,
      ...sLast,
    };
  }

  // Find bracketing states using effectiveFrame
  let k = 0;
  for (let i = 0; i < states.length - 1; i++) {
    if (effectiveFrame >= states[i].frameRange[0] && effectiveFrame < states[i + 1].frameRange[0]) {
      k = i;
      break;
    }
  }

  const sA = getFullState(states[k]);
  const sB = getFullState(states[k + 1]);
  const t = smoothstep(states[k].frameRange[0], states[k + 1].frameRange[0], effectiveFrame);

  // Derive active element IDs from scheduled spawning at effectiveFrame
  const spawnedIds = new Set<string>(sA.activeElementIds);
  for (const spawn of motionPlan.spawningSchedule || []) {
    if (spawn.spawnFrame <= effectiveFrame) {
      spawnedIds.add(spawn.elementId);
    }
  }

  // Determine non-monotonic camera values if activeBeat defines specific camera behavior
  let camScale = lerp(sA.cameraPosition.scale, sB.cameraPosition.scale, t);
  let camTranslateY = lerp(sA.cameraPosition.translateY, sB.cameraPosition.translateY, t);
  let camTiltX = lerp(sA.cameraPosition.tiltX ?? 0, sB.cameraPosition.tiltX ?? 0, t);
  let camTiltY = lerp(sA.depthDistribution.tiltY, sB.depthDistribution.tiltY, t);

  // If active beat enforces a steady hold or recoil:
  if (activeBeat) {
    if (activeBeat.cameraCue.isHolding) {
      camScale = activeBeat.cameraCue.scale;
      camTranslateY = activeBeat.cameraCue.translateY;
      camTiltX = activeBeat.cameraCue.tiltX;
    } else if (activeBeat.cameraCue.action === "recoil") {
      // Recoil jolt on interruption
      const beatProg = smoothstep(activeBeat.frameRange[0], activeBeat.frameRange[1], effectiveFrame);
      camScale = lerp(1.0, activeBeat.cameraCue.scale, beatProg);
      camTiltX = lerp(6.0, activeBeat.cameraCue.tiltX, beatProg);
      if (activeBeat.cameraCue.tiltY) camTiltY = activeBeat.cameraCue.tiltY;
    }
  }

  // Typography state stress / interruption
  const isInterrupted = Boolean(activeBeat?.typographyInterruption?.isInterrupted);
  const typoTracking = isInterrupted
    ? lerp(sA.typographyState.tracking, -0.052, t)
    : lerp(sA.typographyState.tracking, sB.typographyState.tracking, t);
  const typoOpacity = isInterrupted
    ? lerp(sA.typographyState.opacity, 0.76, t)
    : lerp(sA.typographyState.opacity, sB.typographyState.opacity, t);

  return {
    frame,
    effectiveFrame,
    progress,
    activeStateName: t < 0.5 ? sA.name : sB.name,
    activeBeat,
    isFreezeSnap,
    cameraIsHolding: activeBeat?.cameraCue?.isHolding ?? false,
    typographyInterruption: activeBeat?.typographyInterruption ? {
      isInterrupted: activeBeat.typographyInterruption.isInterrupted,
      interrupterElementId: activeBeat.typographyInterruption.interrupterElementId,
      action: activeBeat.typographyInterruption.action,
    } : undefined,
    dominantFocalPoint: {
      x: lerp(sA.dominantFocalPoint.x, sB.dominantFocalPoint.x, t),
      y: lerp(sA.dominantFocalPoint.y, sB.dominantFocalPoint.y, t),
      weight: lerp(sA.dominantFocalPoint.weight, sB.dominantFocalPoint.weight, t),
      targetDescription: t < 0.5 ? sA.dominantFocalPoint.targetDescription : sB.dominantFocalPoint.targetDescription,
    },
    compositionGeometry: {
      archetype: t < 0.5 ? sA.compositionGeometry.archetype : sB.compositionGeometry.archetype,
      containerBounds: {
        topPercent: lerp(sA.compositionGeometry.containerBounds.topPercent, sB.compositionGeometry.containerBounds.topPercent, t),
        heightPercent: lerp(sA.compositionGeometry.containerBounds.heightPercent, sB.compositionGeometry.containerBounds.heightPercent, t),
        widthPercent: lerp(sA.compositionGeometry.containerBounds.widthPercent, sB.compositionGeometry.containerBounds.widthPercent, t),
        leftPercent: lerp(sA.compositionGeometry.containerBounds.leftPercent, sB.compositionGeometry.containerBounds.leftPercent, t),
        borderRadius: lerp(sA.compositionGeometry.containerBounds.borderRadius, sB.compositionGeometry.containerBounds.borderRadius, t),
        borderOpacity: lerp(sA.compositionGeometry.containerBounds.borderOpacity ?? 0.12, sB.compositionGeometry.containerBounds.borderOpacity ?? 0.12, t),
      },
      cropping: {
        bleedMargin: lerp(sA.compositionGeometry.cropping?.bleedMargin ?? 0, sB.compositionGeometry.cropping?.bleedMargin ?? 0, t),
        edgeTension: lerp(sA.compositionGeometry.cropping?.edgeTension ?? 0, sB.compositionGeometry.cropping?.edgeTension ?? 0, t),
      },
    },
    density: {
      score: lerp(sA.density.score, sB.density.score, t),
      breathingRoomRatio: lerp(sA.density.breathingRoomRatio, sB.density.breathingRoomRatio, t),
      clutterFreeZones: t < 0.5 ? sA.density.clutterFreeZones : sB.density.clutterFreeZones,
    },
    scaleHierarchy: {
      heroScale: lerp(sA.scaleHierarchy.heroScale, sB.scaleHierarchy.heroScale, t),
      secondaryScale: lerp(sA.scaleHierarchy.secondaryScale, sB.scaleHierarchy.secondaryScale, t),
      headlineToHeroRatio: lerp(sA.scaleHierarchy.headlineToHeroRatio ?? 1.2, sB.scaleHierarchy.headlineToHeroRatio ?? 1.0, t),
    },
    depthDistribution: {
      perspective: lerp(sA.depthDistribution.perspective, sB.depthDistribution.perspective, t),
      tiltX: lerp(sA.depthDistribution.tiltX, sB.depthDistribution.tiltX, t),
      tiltY: camTiltY,
      zSpread: lerp(sA.depthDistribution.zSpread, sB.depthDistribution.zSpread, t),
    },
    cameraPosition: {
      scale: camScale,
      translateY: camTranslateY,
      tiltX: camTiltX,
      fov: lerp(sA.cameraPosition.fov ?? 50, sB.cameraPosition.fov ?? 50, t),
    },
    typographyState: {
      fontSize: lerp(sA.typographyState.fontSize, sB.typographyState.fontSize, t),
      tracking: typoTracking,
      opacity: typoOpacity,
      lineHeight: lerp(sA.typographyState.lineHeight, sB.typographyState.lineHeight, t),
      blur: lerp(sA.typographyState.blur ?? 0, sB.typographyState.blur ?? 0, t),
    },
    lightingIntensity: {
      beamIntensity: lerp(sA.lightingIntensity.beamIntensity, sB.lightingIntensity.beamIntensity, t),
      beamWidth: lerp(sA.lightingIntensity.beamWidth, sB.lightingIntensity.beamWidth, t),
      ambientGlowOpacity: lerp(sA.lightingIntensity.ambientGlowOpacity, sB.lightingIntensity.ambientGlowOpacity, t),
      bloomRadius: lerp(sA.lightingIntensity.bloomRadius, sB.lightingIntensity.bloomRadius, t),
    },
    motionEnergy: {
      springStiffness: lerp(sA.motionEnergy.springStiffness, sB.motionEnergy.springStiffness, t),
      springDamping: lerp(sA.motionEnergy.springDamping, sB.motionEnergy.springDamping, t),
      microLevitationAmp: isFreezeSnap ? 0 : lerp(sA.motionEnergy.microLevitationAmp, sB.motionEnergy.microLevitationAmp, t),
      microLevitationFreq: isFreezeSnap ? 0 : lerp(sA.motionEnergy.microLevitationFreq, sB.motionEnergy.microLevitationFreq, t),
      alertPulseRate: isFreezeSnap ? 0 : lerp(sA.motionEnergy.alertPulseRate, sB.motionEnergy.alertPulseRate, t),
    },
    peripheralActivity: {
      backgroundBlur: lerp(sA.peripheralActivity.backgroundBlur, sB.peripheralActivity.backgroundBlur, t),
      vignetteDarkness: lerp(sA.peripheralActivity.vignetteDarkness, sB.peripheralActivity.vignetteDarkness, t),
      edgeOverflow: lerp(sA.peripheralActivity.edgeOverflow, sB.peripheralActivity.edgeOverflow, t),
    },
    activeElementIds: Array.from(spawnedIds),
  };
}

export class TemporalChoreographer {
  /**
   * Plans the temporal progression of a scene across time, answering the 5 cinematic questions
   * and generating the complete MotionPlan that bridges the static keyframe blueprint with
   * motivated narrative motion.
   */
  createMotionPlan(
    scene: StoryboardScene,
    analysis: KeyframeAnalysis,
    keyframe: ApprovedKeyframe,
    profile: BrandProfile,
    fps = 30
  ): MotionPlan {
    const durationFrames = Math.round(scene.durationSeconds * fps);
    const intentLower = (scene.intent + " " + scene.headlineCopy).toLowerCase();

    // Check if narrative intent requires an accumulation/crowding progression
    const isAccumulation =
      intentLower.includes("crowded") ||
      intentLower.includes("multiply") ||
      intentLower.includes("noise") ||
      intentLower.includes("friction") ||
      intentLower.includes("overload") ||
      intentLower.includes("searching");

    const isResolution =
      intentLower.includes("filter") ||
      intentLower.includes("clarity") ||
      intentLower.includes("clean") ||
      intentLower.includes("instant") ||
      intentLower.includes("eliminate");

    if (isAccumulation) {
      return this.buildAccumulationMotionPlan(scene, analysis, durationFrames, fps);
    }

    if (isResolution) {
      return this.buildResolutionMotionPlan(scene, analysis, durationFrames);
    }

    return this.buildStandardEditorialMotionPlan(scene, analysis, durationFrames);
  }

  /**
   * MotionPlan for "The Escalation of Noise"
   * Expressed as 7 Directed Cinematic Beats:
   * Beat 1 (Silence) -> Beat 2 (Interruption) -> Beat 3 (Accumulation) ->
   * Beat 4 (Invasion / Occlusion) -> Beat 5 (Overload) -> Beat 6 (Snap Freeze) -> Beat 7 (Release)
   */
  private buildAccumulationMotionPlan(
    scene: StoryboardScene,
    analysis: KeyframeAnalysis,
    durationFrames: number,
    fps = 30
  ): MotionPlan {
    // 1. Explicit Object Roles & Casting
    const objectCasting: CinematicObjectRole[] = [
      {
        elementId: `${scene.id}-c1`,
        role: "hero",
        importance: "primary",
        zPlane: "hero-plane",
        trajectory: "static-anchor",
        entryFrame: 0,
        scale: 1.08,
      },
      {
        elementId: `${scene.id}-c2`,
        role: "interrupter",
        importance: "primary",
        zPlane: "midground",
        trajectory: "from-left",
        entryFrame: 18,
        scale: 0.98,
      },
      {
        elementId: `${scene.id}-c3`,
        role: "peripheral-swarm",
        importance: "secondary",
        zPlane: "midground",
        trajectory: "from-right",
        entryFrame: 30,
        scale: 0.95,
      },
      {
        elementId: `${scene.id}-c4`,
        role: "alarm-beacon",
        importance: "secondary",
        zPlane: "midground",
        trajectory: "drop-down",
        entryFrame: 42,
        scale: 0.94,
      },
      {
        elementId: `${scene.id}-c5`,
        role: "alarm-beacon",
        importance: "secondary",
        zPlane: "midground",
        trajectory: "from-right",
        entryFrame: 50,
        scale: 0.95,
      },
      {
        elementId: `${scene.id}-c6`,
        role: "foreground-occluder",
        importance: "primary",
        zPlane: "foreground-occluder",
        trajectory: "foreground-slice",
        entryFrame: 54,
        scale: 1.06,
        occludesTypography: true,
      },
      {
        elementId: `${scene.id}-c7`,
        role: "alarm-beacon",
        importance: "secondary",
        zPlane: "midground",
        trajectory: "drop-down",
        entryFrame: 66,
        scale: 0.90,
      },
      {
        elementId: `${scene.id}-c8`,
        role: "depth-anchor",
        importance: "atmospheric",
        zPlane: "deep-background",
        trajectory: "float-up",
        entryFrame: 72,
        scale: 0.90,
      },
      {
        elementId: `${scene.id}-c9`,
        role: "peripheral-swarm",
        importance: "atmospheric",
        zPlane: "deep-background",
        trajectory: "from-depth",
        entryFrame: 76,
        scale: 0.88,
      },
      {
        elementId: `${scene.id}-c10`,
        role: "peripheral-swarm",
        importance: "atmospheric",
        zPlane: "deep-background",
        trajectory: "from-right",
        entryFrame: 80,
        scale: 0.86,
      },
      {
        elementId: `${scene.id}-c11`,
        role: "depth-anchor",
        importance: "atmospheric",
        zPlane: "deep-background",
        trajectory: "drop-down",
        entryFrame: 82,
        scale: 0.84,
      },
    ];

    // Spawning schedule derived from object casting
    const spawningSchedule: SpawningEvent[] = objectCasting.map((cast) => ({
      id: `spawn-${cast.elementId}`,
      elementId: cast.elementId,
      spawnFrame: cast.entryFrame,
      entryTrajectory: (cast.trajectory as any) || "from-depth",
      easing: cast.role === "interrupter" ? "accelerate" : "spring",
    }));

    // 2. The 7 Directed Cinematic Beats
    const beats: CinematicBeat[] = [
      // Beat 1: Silence (f0 - f18)
      {
        id: "beat-1-silence",
        beatIndex: 1,
        name: "Beat 1 — Silence",
        stage: "anticipation",
        frameRange: [0, 18],
        dramaticIntent: "Establish false tranquility. One applicant profile sits alone in abundant negative space. Recruiter feels in calm control.",
        shotDirection: "One applicant (James Monet) floats alone in tranquil negative space. Camera holds locked at 1.00x. Whisper purple beam at 35%.",
        whatEnters: [`${scene.id}-c1`, `${scene.id}-headline`],
        dominantElementId: `${scene.id}-c1`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Expansive negative space; clean word reveals",
        },
        cameraCue: {
          action: "hold",
          isHolding: true,
          scale: 1.0,
          translateY: 0,
          tiltX: 6.0,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "whisper",
          intensity: 0.35,
          beamWidth: 480,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 50, y: 50 },
          landingMomentFrame: 0,
          focalDescription: "Solitary pristine profile with 100% focal authority",
        },
        compositionState: {
          name: "Beat 1 — Silence",
          frameRange: [0, 18],
          description: "Quiet negative space with single centered hero card",
          visualDensity: 0.15,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-c1`],
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.0, translateY: 0 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.9, targetDescription: "Single pristine applicant card" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 38, heightPercent: 56, widthPercent: 88, leftPercent: 6, borderRadius: 40, borderOpacity: 0.10 },
            cropping: { bleedMargin: 0, edgeTension: 0.1 },
          },
          density: { score: 0.15, breathingRoomRatio: 0.70, clutterFreeZones: ["top", "left", "right", "bottom"] },
          scaleHierarchy: { heroScale: 1.12, secondaryScale: 0.95, headlineToHeroRatio: 1.35 },
          depthDistribution: { perspective: 1800, tiltX: 6.0, tiltY: 0, zSpread: 30 },
          cameraPosition: { scale: 1.0, translateY: 0, tiltX: 0, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.35, beamWidth: 480, ambientGlowOpacity: 0.25, bloomRadius: 30 },
          motionEnergy: { springStiffness: 75, springDamping: 18, microLevitationAmp: 2.5, microLevitationFreq: 0.04, alertPulseRate: 1.0 },
          peripheralActivity: { backgroundBlur: 0, vignetteDarkness: 0.48, edgeOverflow: 0.0 },
        },
      },

      // Beat 2: Interruption (f18 - f34)
      {
        id: "beat-2-interruption",
        beatIndex: 2,
        name: "Beat 2 — Interruption",
        stage: "interruption",
        frameRange: [18, 34],
        dramaticIntent: "Shatter the quiet. An unread application violently punches in from the left flank with glowing neon crimson warning '⚠ 482 UNSCREENED'.",
        shotDirection: "An unread application punches in from left flank. Glowing red alarm '482 UNSCREENED' triggers. Attention violently jerks left. Camera jolts.",
        whatEnters: [`${scene.id}-c2`],
        dominantElementId: `${scene.id}-c2`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "stressed",
          description: "Attention pulled away from headline into alarm",
        },
        cameraCue: {
          action: "recoil",
          isHolding: false,
          scale: 1.015,
          translateY: -2,
          tiltX: 9.5,
          tiltY: -2.0,
        },
        lightingCue: {
          behavior: "flare",
          intensity: 0.58,
          beamWidth: 640,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 25, y: 48 },
          landingMomentFrame: 22,
          focalDescription: "Violent focal jerk to left flank warning beacon",
        },
        compositionState: {
          name: "Beat 2 — Interruption",
          frameRange: [18, 34],
          description: "Asymmetric tension with first flashing alert beacon",
          visualDensity: 0.42,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-c1`, `${scene.id}-c2`],
          focalPoint: { x: 38, y: 52 },
          cameraState: { scale: 1.012, translateY: -3 },
          dominantFocalPoint: { x: 38, y: 52, weight: 0.75, targetDescription: "First warning badge (482 Unscreened)" },
          compositionGeometry: {
            archetype: "asymmetric-editorial",
            containerBounds: { topPercent: 37, heightPercent: 58, widthPercent: 90, leftPercent: 5, borderRadius: 36, borderOpacity: 0.12 },
            cropping: { bleedMargin: 5, edgeTension: 0.25 },
          },
          density: { score: 0.42, breathingRoomRatio: 0.48, clutterFreeZones: ["top", "bottom"] },
          scaleHierarchy: { heroScale: 1.04, secondaryScale: 0.94, headlineToHeroRatio: 1.20 },
          depthDistribution: { perspective: 1600, tiltX: 9.5, tiltY: -1.5, zSpread: 65 },
          cameraPosition: { scale: 1.012, translateY: -3, tiltX: 1.0, fov: 52 },
          typographyState: { fontSize: 75, tracking: -0.041, opacity: 0.96, lineHeight: 1.07, blur: 0 },
          lightingIntensity: { beamIntensity: 0.58, beamWidth: 640, ambientGlowOpacity: 0.45, bloomRadius: 45 },
          motionEnergy: { springStiffness: 95, springDamping: 15, microLevitationAmp: 4.0, microLevitationFreq: 0.06, alertPulseRate: 1.2 },
          peripheralActivity: { backgroundBlur: 0.8, vignetteDarkness: 0.60, edgeOverflow: 0.08 },
        },
      },

      // Beat 3: Accumulation (f34 - f52)
      {
        id: "beat-3-accumulation",
        beatIndex: 3,
        name: "Beat 3 — Accumulation",
        stage: "escalation",
        frameRange: [34, 52],
        dramaticIntent: "Backlog cascade begins. Applications flood from multiple 3D planes. '⚠ BACKLOG' badge drops in. Controlled forward glide begins.",
        shotDirection: "Candidates arrive across multiple depth planes (Raina Name, Roscoe Moreno). 'BACKLOG' alert drops in. Layer Z-spread expands to 95px.",
        whatEnters: [`${scene.id}-c3`, `${scene.id}-c4`],
        dominantElementId: `${scene.id}-c4`,
        obscuredElementIds: [`${scene.id}-c1`],
        foregroundBackgroundCrossings: [
          { elementId: `${scene.id}-c4`, path: "depth-plunge", description: "Drops behind card-2, occluding lower corner" },
        ],
        typographyInterruption: {
          isInterrupted: false,
          action: "stressed",
          description: "Tracking tightens to -0.045em",
        },
        cameraCue: {
          action: "push-in",
          isHolding: false,
          scale: 1.026,
          translateY: -6,
          tiltX: 12.5,
          tiltY: -2.8,
        },
        lightingCue: {
          behavior: "strobe-tension",
          intensity: 0.76,
          beamWidth: 780,
        },
        viewerAttention: {
          from: { x: 25, y: 48 },
          to: { x: 50, y: 58 },
          landingMomentFrame: 44,
          focalDescription: "Multi-depth stacking begins",
        },
        compositionState: {
          name: "Beat 3 — Accumulation",
          frameRange: [34, 52],
          description: "Accelerating cascade with multi-card stacking",
          visualDensity: 0.72,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-c1`, `${scene.id}-c2`, `${scene.id}-c3`, `${scene.id}-c4`],
          focalPoint: { x: 50, y: 58 },
          cameraState: { scale: 1.026, translateY: -6 },
          dominantFocalPoint: { x: 50, y: 58, weight: 0.65, targetDescription: "Multi-layer stacking and proliferating alert tags" },
          compositionGeometry: {
            archetype: "compressed-horizon",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 92, leftPercent: 4, borderRadius: 34, borderOpacity: 0.14 },
            cropping: { bleedMargin: 15, edgeTension: 0.5 },
          },
          density: { score: 0.72, breathingRoomRatio: 0.30, clutterFreeZones: ["top"] },
          scaleHierarchy: { heroScale: 0.99, secondaryScale: 0.91, headlineToHeroRatio: 1.10 },
          depthDistribution: { perspective: 1420, tiltX: 12.5, tiltY: -2.8, zSpread: 100 },
          cameraPosition: { scale: 1.025, translateY: -6, tiltX: 2.0, fov: 55 },
          typographyState: { fontSize: 74, tracking: -0.045, opacity: 0.90, lineHeight: 1.06, blur: 0.1 },
          lightingIntensity: { beamIntensity: 0.76, beamWidth: 780, ambientGlowOpacity: 0.68, bloomRadius: 58 },
          motionEnergy: { springStiffness: 125, springDamping: 13, microLevitationAmp: 5.2, microLevitationFreq: 0.08, alertPulseRate: 1.6 },
          peripheralActivity: { backgroundBlur: 2.0, vignetteDarkness: 0.72, edgeOverflow: 0.18 },
        },
      },

      // Beat 4: Invasion & Headline Occlusion (f52 - f68)
      {
        id: "beat-4-invasion",
        beatIndex: 4,
        name: "Beat 4 — Invasion",
        stage: "interruption",
        frameRange: [52, 68],
        dramaticIntent: "CRITICAL INVASION: A massive foreground card (Jethan Smith, SLA Warning) surges forward to Z=140, slicing across the frame and physically occluding headline copy ('feel like searching through noise'). Recruiter's workspace is breached.",
        shotDirection: "Foreground card surges forward to Z=140, physically occluding the headline! Camera holds steady to let the shock of invasion land.",
        whatEnters: [`${scene.id}-c5`, `${scene.id}-c6`],
        dominantElementId: `${scene.id}-c6`,
        obscuredElementIds: [`${scene.id}-headline`],
        foregroundBackgroundCrossings: [
          {
            elementId: `${scene.id}-c6`,
            path: "headline-occlude",
            description: "Card surges forward to Z=140 and physically occludes lower line of headline",
          },
        ],
        typographyInterruption: {
          isInterrupted: true,
          interrupterElementId: `${scene.id}-c6`,
          action: "occluded-by-card",
          description: "Lower line of headline physically obstructed by foreground card",
        },
        cameraCue: {
          action: "hold",
          isHolding: true,
          scale: 1.032,
          translateY: -8,
          tiltX: 13.8,
          tiltY: -3.2,
        },
        lightingCue: {
          behavior: "strobe-tension",
          intensity: 0.84,
          beamWidth: 840,
        },
        viewerAttention: {
          from: { x: 50, y: 58 },
          to: { x: 40, y: 44 },
          landingMomentFrame: 58,
          focalDescription: "Shocking foreground invasion occluding copy",
        },
        compositionState: {
          name: "Beat 4 — Invasion",
          frameRange: [52, 68],
          description: "Breach of canvas boundaries with headline occlusion",
          visualDensity: 0.85,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-c1`, `${scene.id}-c2`, `${scene.id}-c3`, `${scene.id}-c4`, `${scene.id}-c5`, `${scene.id}-c6`],
          focalPoint: { x: 40, y: 44 },
          cameraState: { scale: 1.032, translateY: -8 },
          dominantFocalPoint: { x: 40, y: 44, weight: 0.8, targetDescription: "Foreground card occluding headline" },
          compositionGeometry: {
            archetype: "compressed-horizon",
            containerBounds: { topPercent: 35.5, heightPercent: 61, widthPercent: 92.5, leftPercent: 3.75, borderRadius: 33, borderOpacity: 0.15 },
            cropping: { bleedMargin: 20, edgeTension: 0.7 },
          },
          density: { score: 0.85, breathingRoomRatio: 0.18, clutterFreeZones: [] },
          scaleHierarchy: { heroScale: 0.97, secondaryScale: 0.89, headlineToHeroRatio: 1.0 },
          depthDistribution: { perspective: 1320, tiltX: 14.2, tiltY: -3.5, zSpread: 130 },
          cameraPosition: { scale: 1.032, translateY: -8, tiltX: 2.6, fov: 57 },
          typographyState: { fontSize: 73, tracking: -0.048, opacity: 0.84, lineHeight: 1.05, blur: 0.3 },
          lightingIntensity: { beamIntensity: 0.84, beamWidth: 840, ambientGlowOpacity: 0.78, bloomRadius: 68 },
          motionEnergy: { springStiffness: 145, springDamping: 11, microLevitationAmp: 6.2, microLevitationFreq: 0.10, alertPulseRate: 2.0 },
          peripheralActivity: { backgroundBlur: 2.8, vignetteDarkness: 0.78, edgeOverflow: 0.25 },
        },
      },

      // Beat 5: Overload (f68 - f84)
      {
        id: "beat-5-overload",
        beatIndex: 5,
        name: "Beat 5 — Overload",
        stage: "climax",
        frameRange: [68, 84],
        dramaticIntent: "Peak cognitive overload. 5 alert beacons flash simultaneously in discordant rhythms. 11 candidates saturate the 3D perspective trench. Camera dives deep.",
        shotDirection: "5 alert beacons flash simultaneously in discordant rhythms. 11 candidates saturate 3D trench. Camera dives deep. Volumetric beam explodes.",
        whatEnters: [`${scene.id}-c7`, `${scene.id}-c8`, `${scene.id}-c9`, `${scene.id}-c10`, `${scene.id}-c11`],
        dominantElementId: "total-overload-field",
        obscuredElementIds: [`${scene.id}-c1`, `${scene.id}-c3`, `${scene.id}-headline`],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: true,
          interrupterElementId: `${scene.id}-c6`,
          action: "occluded-by-card",
          description: "Total visual clutter suffocating typography",
        },
        cameraCue: {
          action: "dive",
          isHolding: false,
          scale: 1.045,
          translateY: -14,
          tiltX: 16.5,
          tiltY: -4.5,
        },
        lightingCue: {
          behavior: "overload-bloom",
          intensity: 0.96,
          beamWidth: 960,
        },
        viewerAttention: {
          from: { x: 40, y: 44 },
          to: { x: 50, y: 62 },
          landingMomentFrame: 78,
          focalDescription: "Total cognitive overload",
        },
        compositionState: {
          name: "Beat 5 — Overload",
          frameRange: [68, 84],
          description: "Maximum visual density and 3D trench saturation",
          visualDensity: 0.98,
          activeElementIds: objectCasting.map((c) => c.elementId),
          focalPoint: { x: 50, y: 62 },
          cameraState: { scale: 1.045, translateY: -14 },
          dominantFocalPoint: { x: 50, y: 62, weight: 0.4, targetDescription: "Diffuse cognitive overload" },
          compositionGeometry: {
            archetype: "chaotic-bleed",
            containerBounds: { topPercent: 35, heightPercent: 62, widthPercent: 93.5, leftPercent: 3.25, borderRadius: 32, borderOpacity: 0.16 },
            cropping: { bleedMargin: 25, edgeTension: 0.85 },
          },
          density: { score: 0.98, breathingRoomRatio: 0.10, clutterFreeZones: [] },
          scaleHierarchy: { heroScale: 0.95, secondaryScale: 0.86, headlineToHeroRatio: 0.92 },
          depthDistribution: { perspective: 1200, tiltX: 16.5, tiltY: -4.5, zSpread: 160 },
          cameraPosition: { scale: 1.045, translateY: -14, tiltX: 3.5, fov: 60 },
          typographyState: { fontSize: 72, tracking: -0.050, opacity: 0.80, lineHeight: 1.05, blur: 0.4 },
          lightingIntensity: { beamIntensity: 0.96, beamWidth: 960, ambientGlowOpacity: 0.92, bloomRadius: 80 },
          motionEnergy: { springStiffness: 165, springDamping: 9, microLevitationAmp: 7.5, microLevitationFreq: 0.12, alertPulseRate: 2.6 },
          peripheralActivity: { backgroundBlur: 4.0, vignetteDarkness: 0.86, edgeOverflow: 0.35 },
        },
      },

      // Beat 6: Snap Freeze (f84 - f87)
      {
        id: "beat-6-snap",
        beatIndex: 6,
        name: "Beat 6 — Snap Freeze",
        stage: "snap",
        frameRange: [84, 87],
        dramaticIntent: "THE 3-FRAME TEMPORAL FREEZE: Complete abrupt stop of all motion for 3 frames (f84-87). Micro-levitation pauses. Camera locks. Flash-freeze highlight sears overload into memory.",
        shotDirection: "TOTAL TEMPORAL FREEZE. All springs, drifts, and pulses freeze for 3 frames. Stroboscopic flash-freeze locks peak overload into viewer's retina.",
        whatEnters: [],
        dominantElementId: "total-overload-field",
        obscuredElementIds: [`${scene.id}-c1`, `${scene.id}-headline`],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: true,
          action: "frozen",
          description: "Frozen in acute tension",
        },
        cameraCue: {
          action: "snap-freeze",
          isHolding: true,
          scale: 1.045,
          translateY: -14,
          tiltX: 16.5,
          tiltY: -4.5,
        },
        lightingCue: {
          behavior: "snap-freeze",
          intensity: 1.0,
          beamWidth: 980,
        },
        viewerAttention: {
          from: { x: 50, y: 62 },
          to: { x: 50, y: 62 },
          landingMomentFrame: 84,
          focalDescription: "Frozen image of acute panic",
        },
        isFreezeSnap: true,
        compositionState: {
          name: "Beat 6 — Snap Freeze",
          frameRange: [84, 87],
          description: "3-frame frozen temporal lock",
          visualDensity: 0.98,
          activeElementIds: objectCasting.map((c) => c.elementId),
          focalPoint: { x: 50, y: 62 },
          cameraState: { scale: 1.045, translateY: -14 },
          dominantFocalPoint: { x: 50, y: 62, weight: 0.4, targetDescription: "Frozen image of acute panic" },
          compositionGeometry: {
            archetype: "chaotic-bleed",
            containerBounds: { topPercent: 35, heightPercent: 62, widthPercent: 93.5, leftPercent: 3.25, borderRadius: 32, borderOpacity: 0.16 },
            cropping: { bleedMargin: 25, edgeTension: 0.85 },
          },
          density: { score: 0.98, breathingRoomRatio: 0.10, clutterFreeZones: [] },
          scaleHierarchy: { heroScale: 0.95, secondaryScale: 0.86, headlineToHeroRatio: 0.92 },
          depthDistribution: { perspective: 1200, tiltX: 16.5, tiltY: -4.5, zSpread: 160 },
          cameraPosition: { scale: 1.045, translateY: -14, tiltX: 3.5, fov: 60 },
          typographyState: { fontSize: 72, tracking: -0.050, opacity: 0.80, lineHeight: 1.05, blur: 0.4 },
          lightingIntensity: { beamIntensity: 1.0, beamWidth: 980, ambientGlowOpacity: 0.95, bloomRadius: 85 },
          motionEnergy: { springStiffness: 165, springDamping: 9, microLevitationAmp: 0, microLevitationFreq: 0, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 4.0, vignetteDarkness: 0.88, edgeOverflow: 0.35 },
        },
      },

      // Beat 7: Release (f87 - f90)
      {
        id: "beat-7-release",
        beatIndex: 7,
        name: "Beat 7 — Release",
        stage: "release",
        frameRange: [87, 90],
        dramaticIntent: "The chaotic noise begins a rapid spatial contraction toward center, creating an irresistible forward visual momentum whipping into Scene 2 (RCRUT instant calibration).",
        shotDirection: "Overwhelming noise contracts inward with forward momentum, whipping into Scene 2 (RCRUT instant calibration).",
        whatEnters: [],
        dominantElementId: "transition-vortex",
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Prepares for solution reveal",
        },
        cameraCue: {
          action: "whip-prep",
          isHolding: false,
          scale: 1.052,
          translateY: -15,
          tiltX: 17.0,
          tiltY: -4.5,
        },
        lightingCue: {
          behavior: "release-prep",
          intensity: 0.75,
          beamWidth: 600,
        },
        viewerAttention: {
          from: { x: 50, y: 62 },
          to: { x: 50, y: 50 },
          landingMomentFrame: 89,
          focalDescription: "Convergence into solution",
        },
        compositionState: {
          name: "Beat 7 — Release",
          frameRange: [87, 90],
          description: "Transition momentum and vortex release",
          visualDensity: 0.85,
          activeElementIds: objectCasting.map((c) => c.elementId),
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.052, translateY: -15 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.7, targetDescription: "Convergence into solution" },
          compositionGeometry: {
            archetype: "chaotic-bleed",
            containerBounds: { topPercent: 35.5, heightPercent: 61, widthPercent: 92.5, leftPercent: 3.75, borderRadius: 34, borderOpacity: 0.14 },
            cropping: { bleedMargin: 15, edgeTension: 0.5 },
          },
          density: { score: 0.85, breathingRoomRatio: 0.20, clutterFreeZones: [] },
          scaleHierarchy: { heroScale: 0.98, secondaryScale: 0.88, headlineToHeroRatio: 1.0 },
          depthDistribution: { perspective: 1300, tiltX: 17.0, tiltY: -4.5, zSpread: 140 },
          cameraPosition: { scale: 1.052, translateY: -15, tiltX: 3.8, fov: 58 },
          typographyState: { fontSize: 72, tracking: -0.045, opacity: 0.85, lineHeight: 1.05, blur: 0.2 },
          lightingIntensity: { beamIntensity: 0.75, beamWidth: 600, ambientGlowOpacity: 0.75, bloomRadius: 65 },
          motionEnergy: { springStiffness: 150, springDamping: 10, microLevitationAmp: 4.0, microLevitationFreq: 0.08, alertPulseRate: 1.8 },
          peripheralActivity: { backgroundBlur: 3.0, vignetteDarkness: 0.80, edgeOverflow: 0.20 },
        },
      },
    ];

    // 3. Human-Readable Shot Direction Screenplay
    const shotScript = formatShotScript(scene.name, scene.intent, durationFrames, fps, beats);

    // Map to legacy state slots for backward compatibility
    const startingState = beats[0].compositionState!;
    const intermediateStates = [
      beats[1].compositionState!,
      beats[2].compositionState!,
      beats[3].compositionState!,
    ];
    const climaxState = {
      ...beats[4].compositionState!,
      climaxFrame: 78,
      emotionalTension: "Acute friction and visual overwhelm: dozens of applicants suffocating the workspace, neon warnings flashing simultaneously.",
    };

    return {
      sceneId: scene.id,
      narrativeIntent: scene.intent,
      durationFrames,
      shotScript,
      beats,
      objectCasting,
      cinematicQuestions: {
        whatChanges:
          "The scene is directed across 7 distinct visual beats: starting in tranquil silence with a locked camera, violently interrupted on the left flank, cascading into multi-plane accumulation, invaded by a foreground card that physically occludes the headline copy, diving into peak cognitive overload, executing a dramatic 3-frame temporal snap freeze, and releasing into forward transition momentum.",
        whyItChanges:
          "To make the recruiter viscerally feel the recruiting process slipping from manageable calm into uncontrollable suffocation before introducing RCRUT's solution.",
        whenItChanges:
          "Beat 1: Silence (0-18f) -> Beat 2: Interruption (18-34f) -> Beat 3: Accumulation (34-52f) -> Beat 4: Invasion (52-68f) -> Beat 5: Overload (68-84f) -> Beat 6: Snap (84-87f) -> Beat 7: Release (87-90f).",
        howAttentionShifts:
          "Foveal lock on solitary hero card -> violent jerk to left flank alarm -> multi-plane search -> shock of headline occlusion -> diffuse cognitive overload -> retinal burn on 3-frame snap freeze -> convergence.",
        visualClimax:
          "Frames 68-84: 5 simultaneous flashing alarms and 11 stacked cards in a deep 3D perspective trench, followed by the 3-frame temporal freeze at frame 84.",
      },
      startingState,
      intermediateStates,
      climaxState,
      densityEvolution: {
        progression: "sparse-to-crowded",
        curve: [
          { frame: 0, density: 0.15 },
          { frame: 18, density: 0.25 },
          { frame: 42, density: 0.50 },
          { frame: 68, density: 0.85 },
          { frame: 84, density: 0.98 },
        ],
      },
      spawningSchedule,
      cameraEvolution: {
        trajectory: "subtle-push-in",
        scaleRange: [1.0, 1.052],
        tiltRange: [6, 17],
      },
      typographyEvolution: {
        revealType: "staggered-word",
        revealFrameRange: [0, 22],
        holdUntilFrame: durationFrames,
      },
      visualEmphasisShifts: [
        { frame: 0, target: "Solitary Pristine Profile", focalPoint: { x: 50, y: 50 }, reason: "Establish premise" },
        { frame: 22, target: "482 Unscreened Alert", focalPoint: { x: 25, y: 48 }, reason: "First trigger of backlog friction" },
        { frame: 44, target: "Backlog Alert & Stacking", focalPoint: { x: 50, y: 58 }, reason: "Escalation into multi-team bottleneck" },
        { frame: 58, target: "Invading Foreground Card", focalPoint: { x: 40, y: 44 }, reason: "Breach of workspace and copy occlusion" },
        { frame: 78, target: "Total Climax Grid", focalPoint: { x: 50, y: 62 }, reason: "Full cognitive overload" },
        { frame: 84, target: "Snap Freeze Lockup", focalPoint: { x: 50, y: 62 }, reason: "Retinal burn freeze" },
      ],
      transitionPreparation: {
        startFrame: 87,
        momentum: "accelerate-forward",
      },
    };
  }


  /**
   * MotionPlan for solution scenes (filtering noise -> pristine clarity)
   */
  private buildResolutionMotionPlan(
    scene: StoryboardScene,
    analysis: KeyframeAnalysis,
    durationFrames: number
  ): MotionPlan {
    const startingState: TemporalState = {
      name: "Impending Resolution",
      frameRange: [0, 20],
      description: "Fast-moving elements begin filtering out as the central solution locks in.",
      visualDensity: 0.8,
      activeElementIds: [],
      focalPoint: { x: 50, y: 50 },
      cameraState: { scale: 1.0 },
    };

    const climaxState: TemporalState & { climaxFrame: number; emotionalTension: string } = {
      name: "Pristine Calibration",
      frameRange: [Math.round(durationFrames * 0.6), durationFrames],
      climaxFrame: Math.round(durationFrames * 0.7),
      emotionalTension: "Cathartic relief: the noise vanishes, leaving only the calibrated top match.",
      description: "Only the verified 99.4% precision match remains, bathed in calm violet luminescence.",
      visualDensity: 0.35,
      activeElementIds: [],
      focalPoint: { x: 50, y: 50 },
      cameraState: { scale: 1.03 },
    };

    return {
      sceneId: scene.id,
      narrativeIntent: scene.intent,
      durationFrames,
      cinematicQuestions: {
        whatChanges: "Chaotic peripheral elements dissolve or slide off, leaving one pristine hero card.",
        whyItChanges: "Demonstrates RCRUT's core promise: eliminating repetitive noise.",
        whenItChanges: "Immediate sweep at frame 15, locked precision by frame 45.",
        howAttentionShifts: "From diffuse searching to concentrated laser focus on the candidate match.",
        visualClimax: "The instant the precision badge locks with a glowing emerald or violet bloom.",
      },
      startingState,
      intermediateStates: [],
      climaxState,
      densityEvolution: {
        progression: "crowded-to-cleansed",
        curve: [
          { frame: 0, density: 0.8 },
          { frame: 25, density: 0.45 },
          { frame: 60, density: 0.3 },
        ],
      },
      spawningSchedule: [],
      cameraEvolution: {
        trajectory: "subtle-push-in",
        scaleRange: [1.0, 1.03],
      },
      typographyEvolution: {
        revealType: "staggered-word",
        revealFrameRange: [0, 20],
        holdUntilFrame: durationFrames,
      },
      visualEmphasisShifts: [],
      transitionPreparation: {
        startFrame: Math.round(durationFrames * 0.9),
        momentum: "accelerate-forward",
      },
    };
  }

  /**
   * Standard motion plan for typographic / manifesto scenes
   */
  private buildStandardEditorialMotionPlan(
    scene: StoryboardScene,
    analysis: KeyframeAnalysis,
    durationFrames: number
  ): MotionPlan {
    const startingState: TemporalState = {
      name: "Clean Entrance",
      frameRange: [0, 25],
      description: "Quiet negative space, typography gently revealing.",
      visualDensity: 0.3,
      activeElementIds: [],
      focalPoint: { x: 50, y: 50 },
      cameraState: { scale: 1.0 },
    };

    const climaxState: TemporalState & { climaxFrame: number; emotionalTension: string } = {
      name: "Balanced Authority",
      frameRange: [30, durationFrames],
      climaxFrame: Math.round(durationFrames * 0.6),
      emotionalTension: "Confidence and architectural calm.",
      description: "Hero primitive and headline achieve balanced equilibrium.",
      visualDensity: 0.5,
      activeElementIds: [],
      focalPoint: { x: 50, y: 50 },
      cameraState: { scale: 1.025 },
    };

    return {
      sceneId: scene.id,
      narrativeIntent: scene.intent,
      durationFrames,
      cinematicQuestions: {
        whatChanges: "Elements glide into place and hold steady with micro-drift.",
        whyItChanges: "Communicates modern stability and craft.",
        whenItChanges: "Entry in first third, balanced hold for remainder.",
        howAttentionShifts: "Headline first, hero graphic second, brand anchor third.",
        visualClimax: "Full lockup at 60% duration.",
      },
      startingState,
      intermediateStates: [],
      climaxState,
      densityEvolution: {
        progression: "steady-focus",
        curve: [
          { frame: 0, density: 0.2 },
          { frame: 30, density: 0.5 },
          { frame: durationFrames, density: 0.5 },
        ],
      },
      spawningSchedule: [],
      cameraEvolution: {
        trajectory: "steady-drift",
        scaleRange: [1.0, 1.025],
      },
      typographyEvolution: {
        revealType: "staggered-word",
        revealFrameRange: [0, 25],
        holdUntilFrame: durationFrames,
      },
      visualEmphasisShifts: [],
      transitionPreparation: {
        startFrame: Math.round(durationFrames * 0.9),
        momentum: "freeze-anticipation",
      },
    };
  }
}

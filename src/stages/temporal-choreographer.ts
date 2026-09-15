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
  VisualBible,
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

  // Snap Freeze check: active beat marked as freeze snap, or stage is "snap", or legacy frame clamp
  const isFreezeSnap = Boolean(activeBeat?.isFreezeSnap || activeBeat?.stage === "snap" || (!activeBeat && frame >= 84 && frame <= 87));
  const effectiveFrame = isFreezeSnap && activeBeat ? activeBeat.frameRange[0] : (isFreezeSnap && !activeBeat ? 84 : frame);

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
      if (!spawn.durationFrames || effectiveFrame < spawn.spawnFrame + spawn.durationFrames) {
        spawnedIds.add(spawn.elementId);
      }
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
      if (activeBeat.cameraCue.tiltY !== undefined) camTiltY = activeBeat.cameraCue.tiltY;
    } else if (activeBeat.cameraCue.action === "recoil") {
      // Recoil jolt on interruption
      const beatProg = smoothstep(activeBeat.frameRange[0], activeBeat.frameRange[1], effectiveFrame);
      camScale = lerp(1.0, activeBeat.cameraCue.scale, beatProg);
      camTiltX = lerp(6.0, activeBeat.cameraCue.tiltX, beatProg);
      if (activeBeat.cameraCue.tiltY !== undefined) camTiltY = activeBeat.cameraCue.tiltY;
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
   * motivated narrative motion structured across 8 canonical cinematic beats:
   * anticipation -> entrance -> escalation -> interruption -> emphasis -> climax -> release -> transition.
   */
  createMotionPlan(
    scene: StoryboardScene,
    analysis: KeyframeAnalysis,
    keyframe: ApprovedKeyframe,
    profile: BrandProfile,
    fps = 30,
    bible?: VisualBible
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

    let plan: MotionPlan;
    if (isAccumulation) {
      plan = this.buildAccumulationMotionPlan(scene, analysis, durationFrames, fps);
    } else if (isResolution) {
      plan = this.buildResolutionMotionPlan(scene, analysis, durationFrames, fps);
    } else {
      plan = this.buildStandardEditorialMotionPlan(scene, analysis, durationFrames, fps);
    }

    if (bible) {
      plan.visualBibleId = bible.id;
      const isTransform = !!scene.transformationCall?.isExplicitTransformation;
      const departures = scene.transformationCall?.allowedDepartures || [];

      // Camera governance
      if (!isTransform || !departures.includes("camera")) {
        const maxTiltX = bible.cameraLanguage.tiltConstraints.maxTiltX;
        const maxTiltY = bible.cameraLanguage.tiltConstraints.maxTiltY;
        if (plan.beats) {
          for (const beat of plan.beats) {
            if (beat.cameraCue) {
              beat.cameraCue.tiltX = Math.max(-maxTiltX, Math.min(maxTiltX, beat.cameraCue.tiltX));
              if (beat.cameraCue.tiltY !== undefined) {
                beat.cameraCue.tiltY = Math.max(-maxTiltY, Math.min(maxTiltY, beat.cameraCue.tiltY));
              }
            }
            if (beat.compositionState?.cameraPosition?.tiltX !== undefined) {
              beat.compositionState.cameraPosition.tiltX = Math.max(
                -maxTiltX,
                Math.min(maxTiltX, beat.compositionState.cameraPosition.tiltX)
              );
            }
          }
        }
      }

      // Lighting governance
      if (!isTransform || !departures.includes("lighting")) {
        const keyIntensityScale = bible.lightingLogic.keyIntensity / 0.8;
        if (plan.beats) {
          for (const beat of plan.beats) {
            if (beat.lightingCue) {
              beat.lightingCue.intensity = Math.min(
                1.0,
                parseFloat((beat.lightingCue.intensity * keyIntensityScale).toFixed(2))
              );
            }
          }
        }
      }
    }

    return plan;
  }

  /**
   * MotionPlan for "The Escalation of Noise"
   * Expressed across the 8 Canonical Directed Beats:
   * 1. anticipation (Silence & Baseline)
   * 2. entrance (Alert Intrusion)
   * 3. escalation (Cascading Flood)
   * 4. interruption (Foreground Breach & Headline Occlusion)
   * 5. emphasis (SLA Bottleneck Spotlight)
   * 6. climax (Peak Cognitive Overload & Snap Freeze)
   * 7. release (Inward Gravitational Pull)
   * 8. transition (Forward Whip Handoff)
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
        entryFrame: Math.round(durationFrames * 0.18),
        scale: 0.98,
      },
      {
        elementId: `${scene.id}-c3`,
        role: "peripheral-swarm",
        importance: "secondary",
        zPlane: "midground",
        trajectory: "from-right",
        entryFrame: Math.round(durationFrames * 0.33),
        scale: 0.95,
      },
      {
        elementId: `${scene.id}-c4`,
        role: "alarm-beacon",
        importance: "secondary",
        zPlane: "midground",
        trajectory: "drop-down",
        entryFrame: Math.round(durationFrames * 0.42),
        scale: 0.94,
      },
      {
        elementId: `${scene.id}-c5`,
        role: "alarm-beacon",
        importance: "secondary",
        zPlane: "midground",
        trajectory: "from-right",
        entryFrame: Math.round(durationFrames * 0.50),
        scale: 0.95,
      },
      {
        elementId: `${scene.id}-c6`,
        role: "foreground-occluder",
        importance: "primary",
        zPlane: "foreground-occluder",
        trajectory: "foreground-slice",
        entryFrame: Math.round(durationFrames * 0.54),
        scale: 1.06,
        occludesTypography: true,
      },
      {
        elementId: `${scene.id}-c7`,
        role: "alarm-beacon",
        importance: "primary",
        zPlane: "midground",
        trajectory: "drop-down",
        entryFrame: Math.round(durationFrames * 0.65),
        scale: 0.92,
      },
      {
        elementId: `${scene.id}-c8`,
        role: "depth-anchor",
        importance: "atmospheric",
        zPlane: "deep-background",
        trajectory: "float-up",
        entryFrame: Math.round(durationFrames * 0.76),
        scale: 0.90,
      },
      {
        elementId: `${scene.id}-c9`,
        role: "peripheral-swarm",
        importance: "atmospheric",
        zPlane: "deep-background",
        trajectory: "from-depth",
        entryFrame: Math.round(durationFrames * 0.80),
        scale: 0.88,
      },
      {
        elementId: `${scene.id}-c10`,
        role: "peripheral-swarm",
        importance: "atmospheric",
        zPlane: "deep-background",
        trajectory: "from-right",
        entryFrame: Math.round(durationFrames * 0.82),
        scale: 0.86,
      },
      {
        elementId: `${scene.id}-c11`,
        role: "depth-anchor",
        importance: "atmospheric",
        zPlane: "deep-background",
        trajectory: "drop-down",
        entryFrame: Math.round(durationFrames * 0.84),
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

    // Dynamic frame boundaries scaled to durationFrames
    const f0 = 0;
    const f1 = Math.round(durationFrames * 0.18); // e.g. 16
    const f2 = Math.round(durationFrames * 0.33); // e.g. 30
    const f3 = Math.round(durationFrames * 0.50); // e.g. 45
    const f4 = Math.round(durationFrames * 0.65); // e.g. 58
    const f5 = Math.round(durationFrames * 0.78); // e.g. 70
    const f6 = Math.round(durationFrames * 0.93); // e.g. 84
    const f7 = Math.round(durationFrames * 0.97); // e.g. 87
    const f8 = durationFrames;                    // e.g. 90

    // 2. The 8 Canonical Directed Cinematic Beats
    const beats: CinematicBeat[] = [
      // Beat 1: Anticipation (Silence & Baseline)
      {
        id: "beat-1-anticipation",
        beatIndex: 1,
        name: "Beat 1 — Silence & Baseline",
        stage: "anticipation",
        frameRange: [f0, f1],
        dramaticIntent: "Establish false tranquility and baseline security. Recruiter believes the hiring pipeline is manageable with a solitary applicant card floating peacefully in 70% negative space.",
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
          name: "Beat 1 — Silence & Baseline",
          frameRange: [f0, f1],
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

      // Beat 2: Entrance (Initial Alert Intrusion)
      {
        id: "beat-2-entrance",
        beatIndex: 2,
        name: "Beat 2 — Alert Intrusion",
        stage: "entrance",
        frameRange: [f1, f2],
        dramaticIntent: "First breach of tranquility. An unread applicant card violently enters from the left flank bearing a flashing crimson alert tag ('⚠ 482 UNSCREENED').",
        shotDirection: "First intruder card punches in from left flank with glowing crimson alert badge. Viewer attention violently snaps from center to flank.",
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
          landingMomentFrame: Math.round(f1 + (f2 - f1) * 0.3),
          focalDescription: "Violent focal jerk to left flank warning beacon",
        },
        compositionState: {
          name: "Beat 2 — Alert Intrusion",
          frameRange: [f1, f2],
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

      // Beat 3: Escalation (Cascading Flood & Stacking)
      {
        id: "beat-3-escalation",
        beatIndex: 3,
        name: "Beat 3 — Cascading Accumulation",
        stage: "escalation",
        frameRange: [f2, f3],
        dramaticIntent: "The dam breaks. Applications cascade across multiple depth layers (Z=40 to Z=100). The recruiter loses solitary focus as cards stack aggressively.",
        shotDirection: "Candidates arrive across multiple depth planes. 'BACKLOG' alert drops in. Layer Z-spread expands to 100px. Controlled forward glide begins.",
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
          landingMomentFrame: Math.round(f2 + (f3 - f2) * 0.5),
          focalDescription: "Multi-depth stacking begins",
        },
        compositionState: {
          name: "Beat 3 — Cascading Accumulation",
          frameRange: [f2, f3],
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

      // Beat 4: Interruption (Foreground Breach & Headline Occlusion)
      {
        id: "beat-4-interruption",
        beatIndex: 4,
        name: "Beat 4 — Foreground Breach & Occlusion",
        stage: "interruption",
        frameRange: [f3, f4],
        dramaticIntent: "CRITICAL BREACH: A massive foreground card surges forward to Z=140, slicing across the frame and physically occluding the headline copy ('feel like searching through noise'). Recruiter's cognitive territory is directly obstructed.",
        shotDirection: "Foreground card surges forward to Z=140, physically occluding the headline! Camera jolts with recoil.",
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
          action: "recoil",
          isHolding: false,
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
          landingMomentFrame: Math.round(f3 + (f4 - f3) * 0.4),
          focalDescription: "Shocking foreground invasion occluding copy",
        },
        compositionState: {
          name: "Beat 4 — Foreground Breach & Occlusion",
          frameRange: [f3, f4],
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

      // Beat 5: Emphasis (SLA Bottleneck Spotlight)
      {
        id: "beat-5-emphasis",
        beatIndex: 5,
        name: "Beat 5 — SLA Bottleneck Spotlight",
        stage: "emphasis",
        frameRange: [f4, f5],
        dramaticIntent: "Confrontation with the bottleneck. The camera deliberately holds dead steady, freezing forward momentum to force the viewer's gaze onto an urgent glowing amber SLA alert beacon ('OVERDUE: 14 DAYS'). The recruiter is made to feel the real business risk of uncalibrated delay.",
        shotDirection: "Camera locks into a focused hold. A narrow, high-intensity spotlight beam (88% intensity) pinpoints the critical SLA breach alert, freezing attention on the operational bottleneck.",
        whatEnters: [`${scene.id}-c7`],
        dominantElementId: `${scene.id}-c7`,
        obscuredElementIds: [`${scene.id}-c1`],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: true,
          interrupterElementId: `${scene.id}-c6`,
          action: "occluded-by-card",
          description: "Attention locked onto urgent SLA bottleneck",
        },
        cameraCue: {
          action: "hold",
          isHolding: true,
          scale: 1.036,
          translateY: -9,
          tiltX: 14.5,
          tiltY: -3.4,
        },
        lightingCue: {
          behavior: "spotlight",
          intensity: 0.88,
          beamWidth: 520,
        },
        viewerAttention: {
          from: { x: 40, y: 44 },
          to: { x: 50, y: 55 },
          landingMomentFrame: Math.round(f4 + (f5 - f4) * 0.35),
          focalDescription: "Focused lock on the urgent SLA bottleneck alert",
        },
        compositionState: {
          name: "Beat 5 — SLA Bottleneck Spotlight",
          frameRange: [f4, f5],
          description: "Spotlight hold on critical bottleneck beacon",
          visualDensity: 0.90,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-c1`, `${scene.id}-c2`, `${scene.id}-c3`, `${scene.id}-c4`, `${scene.id}-c5`, `${scene.id}-c6`, `${scene.id}-c7`],
          focalPoint: { x: 50, y: 55 },
          cameraState: { scale: 1.036, translateY: -9 },
          dominantFocalPoint: { x: 50, y: 55, weight: 0.85, targetDescription: "Critical bottleneck beacon" },
          compositionGeometry: {
            archetype: "compressed-horizon",
            containerBounds: { topPercent: 35.5, heightPercent: 61.5, widthPercent: 93, leftPercent: 3.5, borderRadius: 32.5, borderOpacity: 0.15 },
            cropping: { bleedMargin: 22, edgeTension: 0.75 },
          },
          density: { score: 0.90, breathingRoomRatio: 0.14, clutterFreeZones: [] },
          scaleHierarchy: { heroScale: 0.96, secondaryScale: 0.88, headlineToHeroRatio: 0.96 },
          depthDistribution: { perspective: 1260, tiltX: 14.5, tiltY: -3.4, zSpread: 145 },
          cameraPosition: { scale: 1.036, translateY: -9, tiltX: 3.0, fov: 58 },
          typographyState: { fontSize: 72.5, tracking: -0.049, opacity: 0.82, lineHeight: 1.05, blur: 0.35 },
          lightingIntensity: { beamIntensity: 0.88, beamWidth: 520, ambientGlowOpacity: 0.85, bloomRadius: 72 },
          motionEnergy: { springStiffness: 155, springDamping: 10, microLevitationAmp: 6.8, microLevitationFreq: 0.11, alertPulseRate: 2.3 },
          peripheralActivity: { backgroundBlur: 3.4, vignetteDarkness: 0.82, edgeOverflow: 0.30 },
        },
      },

      // Beat 6: Climax (Peak Cognitive Overload & Snap Freeze)
      {
        id: "beat-6-climax",
        beatIndex: 6,
        name: "Beat 6 — Peak Overload & Snap Freeze",
        stage: "climax",
        frameRange: [f5, f6],
        dramaticIntent: "Peak cognitive overload. 5 alert beacons flash simultaneously in discordant rhythms across 11 stacked cards. The 3-frame snap freeze (f82-84) locks the absolute peak of friction into the viewer's retina.",
        shotDirection: "5 alert beacons flash simultaneously in discordant rhythms. 11 candidates saturate 3D trench. Camera dives deep. Volumetric bloom explodes into 3-frame snap freeze.",
        whatEnters: [`${scene.id}-c8`, `${scene.id}-c9`, `${scene.id}-c10`, `${scene.id}-c11`],
        dominantElementId: "total-overload-field",
        obscuredElementIds: [`${scene.id}-c1`, `${scene.id}-c3`, `${scene.id}-headline`],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: true,
          interrupterElementId: `${scene.id}-c6`,
          action: "frozen",
          description: "Total visual clutter suffocating typography; frozen in peak tension",
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
          behavior: "overload-bloom",
          intensity: 0.98,
          beamWidth: 960,
        },
        viewerAttention: {
          from: { x: 50, y: 55 },
          to: { x: 50, y: 62 },
          landingMomentFrame: Math.round(f5 + (f6 - f5) * 0.7),
          focalDescription: "Total cognitive overload and stroboscopic retinal freeze",
        },
        isFreezeSnap: true,
        compositionState: {
          name: "Beat 6 — Peak Overload & Snap Freeze",
          frameRange: [f5, f6],
          description: "Maximum visual density and 3D trench saturation with snap-freeze lock",
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
          lightingIntensity: { beamIntensity: 0.98, beamWidth: 960, ambientGlowOpacity: 0.95, bloomRadius: 85 },
          motionEnergy: { springStiffness: 165, springDamping: 9, microLevitationAmp: 0, microLevitationFreq: 0, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 4.0, vignetteDarkness: 0.88, edgeOverflow: 0.35 },
        },
      },

      // Beat 7: Release (Inward Gravitational Collapse)
      {
        id: "beat-7-release",
        beatIndex: 7,
        name: "Beat 7 — Inward Collapse",
        stage: "release",
        frameRange: [f6, f7],
        dramaticIntent: "The chaotic noise reaches its breaking point and begins an abrupt inward spatial contraction toward center. Visual density starts retreating as tension releases.",
        shotDirection: "Overwhelming clutter contracts inward under gravitational pull. Visual density retreats toward center as tension yields.",
        whatEnters: [],
        whatExits: [`${scene.id}-c8`, `${scene.id}-c9`, `${scene.id}-c10`, `${scene.id}-c11`],
        dominantElementId: "transition-vortex",
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Prepares for solution reveal",
        },
        cameraCue: {
          action: "settle",
          isHolding: false,
          scale: 1.050,
          translateY: -14,
          tiltX: 15.5,
          tiltY: -4.0,
        },
        lightingCue: {
          behavior: "release-prep",
          intensity: 0.75,
          beamWidth: 650,
        },
        viewerAttention: {
          from: { x: 50, y: 62 },
          to: { x: 50, y: 50 },
          landingMomentFrame: Math.round(f6 + (f7 - f6) * 0.5),
          focalDescription: "Convergence into solution vortex",
        },
        compositionState: {
          name: "Beat 7 — Inward Collapse",
          frameRange: [f6, f7],
          description: "Transition momentum and vortex release",
          visualDensity: 0.85,
          activeElementIds: objectCasting.slice(0, 7).map((c) => c.elementId),
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.050, translateY: -14 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.7, targetDescription: "Convergence into solution" },
          compositionGeometry: {
            archetype: "chaotic-bleed",
            containerBounds: { topPercent: 35.5, heightPercent: 61, widthPercent: 92.5, leftPercent: 3.75, borderRadius: 34, borderOpacity: 0.14 },
            cropping: { bleedMargin: 15, edgeTension: 0.5 },
          },
          density: { score: 0.85, breathingRoomRatio: 0.20, clutterFreeZones: [] },
          scaleHierarchy: { heroScale: 0.98, secondaryScale: 0.88, headlineToHeroRatio: 1.0 },
          depthDistribution: { perspective: 1300, tiltX: 15.5, tiltY: -4.0, zSpread: 140 },
          cameraPosition: { scale: 1.050, translateY: -14, tiltX: 3.6, fov: 58 },
          typographyState: { fontSize: 72, tracking: -0.045, opacity: 0.85, lineHeight: 1.05, blur: 0.2 },
          lightingIntensity: { beamIntensity: 0.75, beamWidth: 650, ambientGlowOpacity: 0.75, bloomRadius: 65 },
          motionEnergy: { springStiffness: 150, springDamping: 10, microLevitationAmp: 4.0, microLevitationFreq: 0.08, alertPulseRate: 1.8 },
          peripheralActivity: { backgroundBlur: 3.0, vignetteDarkness: 0.80, edgeOverflow: 0.20 },
        },
      },

      // Beat 8: Transition (Forward Whip Handoff)
      {
        id: "beat-8-transition",
        beatIndex: 8,
        name: "Beat 8 — Forward Whip Handoff",
        stage: "transition",
        frameRange: [f7, f8],
        dramaticIntent: "Forward kinetic whip handoff. The compressed vortex accelerates forward through the z-axis, launching directly into the solution scene where RCRUT calibrates the top match.",
        shotDirection: "Camera whips forward with accelerated momentum, transitioning visual energy smoothly into Scene 2 (RCRUT instant calibration).",
        whatEnters: [],
        dominantElementId: "transition-vortex",
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Momentum handoff to solution",
        },
        cameraCue: {
          action: "whip-prep",
          isHolding: false,
          scale: 1.055,
          translateY: -15,
          tiltX: 17.0,
          tiltY: -4.5,
        },
        lightingCue: {
          behavior: "whip-prep",
          intensity: 0.70,
          beamWidth: 580,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 50, y: 50 },
          landingMomentFrame: f8 - 1,
          focalDescription: "Forward momentum handoff into Scene 2",
        },
        compositionState: {
          name: "Beat 8 — Forward Whip Handoff",
          frameRange: [f7, f8],
          description: "Forward kinetic whip transition",
          visualDensity: 0.75,
          activeElementIds: objectCasting.slice(0, 5).map((c) => c.elementId),
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.055, translateY: -15 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.8, targetDescription: "Forward transition handoff" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 92, leftPercent: 4, borderRadius: 36, borderOpacity: 0.12 },
            cropping: { bleedMargin: 10, edgeTension: 0.3 },
          },
          density: { score: 0.75, breathingRoomRatio: 0.30, clutterFreeZones: [] },
          scaleHierarchy: { heroScale: 1.0, secondaryScale: 0.90, headlineToHeroRatio: 1.05 },
          depthDistribution: { perspective: 1350, tiltX: 17.0, tiltY: -4.5, zSpread: 120 },
          cameraPosition: { scale: 1.055, translateY: -15, tiltX: 3.8, fov: 58 },
          typographyState: { fontSize: 72, tracking: -0.040, opacity: 0.90, lineHeight: 1.06, blur: 0.1 },
          lightingIntensity: { beamIntensity: 0.70, beamWidth: 580, ambientGlowOpacity: 0.70, bloomRadius: 60 },
          motionEnergy: { springStiffness: 140, springDamping: 12, microLevitationAmp: 3.0, microLevitationFreq: 0.06, alertPulseRate: 1.5 },
          peripheralActivity: { backgroundBlur: 2.0, vignetteDarkness: 0.75, edgeOverflow: 0.15 },
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
      beats[4].compositionState!,
      beats[6].compositionState!,
      beats[7].compositionState!,
    ];
    const climaxState = {
      ...beats[5].compositionState!,
      climaxFrame: Math.round(f5 + (f6 - f5) * 0.7),
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
          "The scene is directed across 8 distinct visual beats: starting in tranquil silence with a locked camera, breached by an unread applicant alert on the flank, cascading into multi-plane accumulation, invaded by a foreground card that physically occludes the headline copy, pausing forward motion for a dedicated spotlight hold on the SLA bottleneck alert, diving into peak cognitive overload with a 3-frame snap freeze, collapsing inward under gravitational pull, and whipping forward into the solution scene.",
        whyItChanges:
          "To make the recruiter viscerally feel the hiring workflow slipping from manageable calm into uncontrollable suffocation before introducing RCRUT's automated solution.",
        whenItChanges:
          `Beat 1: Silence (f${f0}-f${f1}) -> Beat 2: Entrance (f${f1}-f${f2}) -> Beat 3: Escalation (f${f2}-f${f3}) -> Beat 4: Interruption (f${f3}-f${f4}) -> Beat 5: Emphasis (f${f4}-f${f5}) -> Beat 6: Climax (f${f5}-f${f6}) -> Beat 7: Release (f${f6}-f${f7}) -> Beat 8: Transition (f${f7}-f${f8}).`,
        howAttentionShifts:
          "Foveal lock on solitary hero card -> violent jerk to left flank alarm -> multi-plane search -> shock of headline occlusion -> focused hold on SLA bottleneck alert -> diffuse cognitive overload & retinal snap freeze -> inward convergence -> forward handoff.",
        visualClimax:
          `Frames ${f5}-${f6}: 5 simultaneous flashing alarms and 11 stacked cards in a deep 3D perspective trench, seared into memory with a 3-frame temporal freeze.`,
      },
      startingState,
      intermediateStates,
      climaxState,
      densityEvolution: {
        progression: "sparse-to-crowded",
        curve: [
          { frame: f0, density: 0.15 },
          { frame: f1, density: 0.25 },
          { frame: f3, density: 0.72 },
          { frame: f4, density: 0.85 },
          { frame: f5, density: 0.98 },
          { frame: f7, density: 0.85 },
        ],
      },
      spawningSchedule,
      cameraEvolution: {
        trajectory: "subtle-push-in",
        scaleRange: [1.0, 1.055],
        tiltRange: [6, 17],
      },
      typographyEvolution: {
        revealType: "staggered-word",
        revealFrameRange: [0, Math.min(22, f2)],
        holdUntilFrame: durationFrames,
      },
      visualEmphasisShifts: [
        { frame: f0, target: "Solitary Pristine Profile", focalPoint: { x: 50, y: 50 }, reason: "Establish baseline tranquility" },
        { frame: f1, target: "482 Unscreened Alert", focalPoint: { x: 25, y: 48 }, reason: "First intrusion into recruiter workspace" },
        { frame: f2, target: "Backlog Alert & Stacking", focalPoint: { x: 50, y: 58 }, reason: "Escalation into multi-team backlog" },
        { frame: f3, target: "Invading Foreground Card", focalPoint: { x: 40, y: 44 }, reason: "Breach of workspace and copy occlusion" },
        { frame: f4, target: "Urgent SLA Bottleneck Beacon", focalPoint: { x: 50, y: 55 }, reason: "Camera holds on critical delay cost" },
        { frame: f5, target: "Total Climax Grid & Freeze", focalPoint: { x: 50, y: 62 }, reason: "Full cognitive overload and snap freeze" },
        { frame: f7, target: "Convergence Vortex", focalPoint: { x: 50, y: 50 }, reason: "Forward handoff momentum" },
      ],
      transitionPreparation: {
        startFrame: f7,
        momentum: "accelerate-forward",
      },
    };
  }

  /**
   * MotionPlan for solution scenes (filtering noise -> pristine clarity)
   * Expressed across the 8 Canonical Directed Beats:
   * 1. anticipation (Residual Tension at Precipice)
   * 2. entrance (Autonomous Calibration Ingress)
   * 3. escalation (High-Velocity Clutter Purge)
   * 4. interruption (Surgical Lockup Stoppage)
   * 5. emphasis (99.4% Match Score Spotlight)
   * 6. climax (Cathartic Clarity & Monolithic Luminescence)
   * 7. release (Serene Negative Space Equilibrium)
   * 8. transition (Momentum into Proof / CTA)
   */
  private buildResolutionMotionPlan(
    scene: StoryboardScene,
    analysis: KeyframeAnalysis,
    durationFrames: number,
    fps = 30
  ): MotionPlan {
    const f0 = 0;
    const f1 = Math.round(durationFrames * 0.14);
    const f2 = Math.round(durationFrames * 0.28);
    const f3 = Math.round(durationFrames * 0.44);
    const f4 = Math.round(durationFrames * 0.58);
    const f5 = Math.round(durationFrames * 0.72);
    const f6 = Math.round(durationFrames * 0.84);
    const f7 = Math.round(durationFrames * 0.93);
    const f8 = durationFrames;

    // 1. Explicit Object Roles & Casting for Solution
    const objectCasting: CinematicObjectRole[] = [
      {
        elementId: `${scene.id}-headline`,
        role: "hero",
        importance: "primary",
        zPlane: "hero-plane",
        trajectory: "fade",
        entryFrame: 0,
        scale: 1.0,
      },
      {
        elementId: `${scene.id}-ghost-grid`,
        role: "peripheral-swarm",
        importance: "secondary",
        zPlane: "midground",
        trajectory: "static-anchor",
        entryFrame: 0,
        exitFrame: f4,
        scale: 0.92,
      },
      {
        elementId: `${scene.id}-calibration-beam`,
        role: "interrupter",
        importance: "primary",
        zPlane: "foreground-occluder",
        trajectory: "from-right",
        entryFrame: f1,
        scale: 1.0,
      },
      {
        elementId: `${scene.id}-vector-stream`,
        role: "depth-anchor",
        importance: "atmospheric",
        zPlane: "deep-background",
        trajectory: "from-left",
        entryFrame: f1,
        exitFrame: f4,
        scale: 0.85,
      },
      {
        elementId: `${scene.id}-hero-card`,
        role: "hero",
        importance: "primary",
        zPlane: "hero-plane",
        trajectory: "from-depth",
        entryFrame: f3,
        scale: 1.08,
      },
      {
        elementId: `${scene.id}-match-pill`,
        role: "alarm-beacon",
        importance: "primary",
        zPlane: "hero-plane",
        trajectory: "pop-in",
        entryFrame: f4,
        scale: 1.02,
      },
      {
        elementId: `${scene.id}-bloom-glow`,
        role: "depth-anchor",
        importance: "atmospheric",
        zPlane: "deep-background",
        trajectory: "fade",
        entryFrame: f5,
        scale: 1.2,
      },
    ];

    const spawningSchedule: SpawningEvent[] = objectCasting.map((cast) => ({
      id: `spawn-${cast.elementId}`,
      elementId: cast.elementId,
      spawnFrame: cast.entryFrame,
      durationFrames: cast.exitFrame ? cast.exitFrame - cast.entryFrame : undefined,
      entryTrajectory: (cast.trajectory as any) || "from-depth",
      easing: cast.role === "hero" ? "spring" : cast.role === "interrupter" ? "accelerate" : "ease-out",
    }));

    // 2. The 8 Canonical Directed Beats for Resolution
    const beats: CinematicBeat[] = [
      // Beat 1: Anticipation (Residual Tension at Precipice)
      {
        id: "beat-1-anticipation",
        beatIndex: 1,
        name: "Beat 1 — Residual Tension at Precipice",
        stage: "anticipation",
        frameRange: [f0, f1],
        dramaticIntent: "Establish residual tension from the preceding chaos. Faded ghost silhouettes of unqualified cards hover at the canvas periphery. The recruiter braces for more manual screening.",
        shotDirection: "Subtle camera hold at 1.00x. Residual card outlines hover in subdued half-light. Single central candidate placeholder waits at center.",
        whatEnters: [`${scene.id}-headline`, `${scene.id}-ghost-grid`],
        dominantElementId: `${scene.id}-ghost-grid`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Clean headline reveal begins",
        },
        cameraCue: {
          action: "hold",
          isHolding: true,
          scale: 1.0,
          translateY: 0,
          tiltX: 8.0,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "whisper",
          intensity: 0.40,
          beamWidth: 500,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 50, y: 50 },
          landingMomentFrame: 0,
          focalDescription: "Peripheral noise residue waiting for calibration",
        },
        compositionState: {
          name: "Beat 1 — Residual Tension at Precipice",
          frameRange: [f0, f1],
          description: "Residual card silhouettes waiting for algorithmic filtration",
          visualDensity: 0.80,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-ghost-grid`],
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.0, translateY: 0 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.7, targetDescription: "Periphery residue" },
          compositionGeometry: {
            archetype: "compressed-horizon",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 91, leftPercent: 4.5, borderRadius: 36, borderOpacity: 0.12 },
            cropping: { bleedMargin: 10, edgeTension: 0.3 },
          },
          density: { score: 0.80, breathingRoomRatio: 0.25, clutterFreeZones: ["top"] },
          scaleHierarchy: { heroScale: 1.0, secondaryScale: 0.90, headlineToHeroRatio: 1.15 },
          depthDistribution: { perspective: 1500, tiltX: 8.0, tiltY: 0, zSpread: 70 },
          cameraPosition: { scale: 1.0, translateY: 0, tiltX: 0, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 0.95, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.40, beamWidth: 500, ambientGlowOpacity: 0.35, bloomRadius: 40 },
          motionEnergy: { springStiffness: 90, springDamping: 16, microLevitationAmp: 3.0, microLevitationFreq: 0.05, alertPulseRate: 1.0 },
          peripheralActivity: { backgroundBlur: 1.5, vignetteDarkness: 0.65, edgeOverflow: 0.10 },
        },
      },

      // Beat 2: Entrance (Autonomous Calibration Ingress)
      {
        id: "beat-2-entrance",
        beatIndex: 2,
        name: "Beat 2 — Autonomous Calibration Ingress",
        stage: "entrance",
        frameRange: [f1, f2],
        dramaticIntent: "The algorithmic engine ignites. RCRUT's signature violet calibration beam sweeps into frame from top-right, carving through the residual gloom with instant authority.",
        shotDirection: "Luminescent violet calibration beam enters diagonally. Stream of semantic skill vectors begins streaming across the midground.",
        whatEnters: [`${scene.id}-calibration-beam`, `${scene.id}-vector-stream`],
        dominantElementId: `${scene.id}-calibration-beam`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [
          { elementId: `${scene.id}-calibration-beam`, path: "foreground-cross", description: "Slices diagonally across viewport" },
        ],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Beam highlights typography path",
        },
        cameraCue: {
          action: "push-in",
          isHolding: false,
          scale: 1.008,
          translateY: -2,
          tiltX: 9.0,
          tiltY: 1.0,
        },
        lightingCue: {
          behavior: "sweep",
          intensity: 0.65,
          beamWidth: 680,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 70, y: 35 },
          landingMomentFrame: Math.round(f1 + (f2 - f1) * 0.4),
          focalDescription: "Diagnostic violet beam entry from upper flank",
        },
        compositionState: {
          name: "Beat 2 — Autonomous Calibration Ingress",
          frameRange: [f1, f2],
          description: "Laser calibration sweep initiates across midground",
          visualDensity: 0.65,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-ghost-grid`, `${scene.id}-calibration-beam`, `${scene.id}-vector-stream`],
          focalPoint: { x: 65, y: 40 },
          cameraState: { scale: 1.008, translateY: -2 },
          dominantFocalPoint: { x: 65, y: 40, weight: 0.8, targetDescription: "Calibration beam trajectory" },
          compositionGeometry: {
            archetype: "asymmetric-editorial",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 91, leftPercent: 4.5, borderRadius: 36, borderOpacity: 0.14 },
            cropping: { bleedMargin: 8, edgeTension: 0.2 },
          },
          density: { score: 0.65, breathingRoomRatio: 0.35, clutterFreeZones: ["bottom-left"] },
          scaleHierarchy: { heroScale: 1.02, secondaryScale: 0.91, headlineToHeroRatio: 1.20 },
          depthDistribution: { perspective: 1450, tiltX: 9.0, tiltY: 1.0, zSpread: 80 },
          cameraPosition: { scale: 1.008, translateY: -2, tiltX: 0.5, fov: 51 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.65, beamWidth: 680, ambientGlowOpacity: 0.50, bloomRadius: 50 },
          motionEnergy: { springStiffness: 110, springDamping: 14, microLevitationAmp: 3.5, microLevitationFreq: 0.06, alertPulseRate: 1.2 },
          peripheralActivity: { backgroundBlur: 1.2, vignetteDarkness: 0.62, edgeOverflow: 0.08 },
        },
      },

      // Beat 3: Escalation (High-Velocity Clutter Purge)
      {
        id: "beat-3-escalation",
        beatIndex: 3,
        name: "Beat 3 — High-Velocity Clutter Purge",
        stage: "escalation",
        frameRange: [f2, f3],
        dramaticIntent: "Violent elimination of waste. Unqualified profiles and false positives peel away and dissolve off-screen at high velocity. The recruiter watches hundreds of hours of manual resume triage vanish in milliseconds.",
        shotDirection: "Rapid horizontal and depth sweep. 480 unqualified cards dissolve and peel offscreen into motion blur. Visual density plummets from 0.65 to 0.40.",
        whatEnters: [],
        whatExits: [`${scene.id}-ghost-grid`, `${scene.id}-vector-stream`],
        dominantElementId: `${scene.id}-calibration-beam`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Rapid clearing of background noise",
        },
        cameraCue: {
          action: "push-in",
          isHolding: false,
          scale: 1.018,
          translateY: -4,
          tiltX: 10.5,
          tiltY: 0.5,
        },
        lightingCue: {
          behavior: "strobe-tension",
          intensity: 0.78,
          beamWidth: 780,
        },
        viewerAttention: {
          from: { x: 70, y: 35 },
          to: { x: 50, y: 50 },
          landingMomentFrame: Math.round(f2 + (f3 - f2) * 0.5),
          focalDescription: "High-velocity purge converging inward",
        },
        compositionState: {
          name: "Beat 3 — High-Velocity Clutter Purge",
          frameRange: [f2, f3],
          description: "Rapid dissolution of peripheral clutter",
          visualDensity: 0.45,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-calibration-beam`],
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.018, translateY: -4 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.75, targetDescription: "Purge vortex clearing the frame" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 90, leftPercent: 5, borderRadius: 36, borderOpacity: 0.16 },
            cropping: { bleedMargin: 5, edgeTension: 0.15 },
          },
          density: { score: 0.45, breathingRoomRatio: 0.55, clutterFreeZones: ["left", "right"] },
          scaleHierarchy: { heroScale: 1.04, secondaryScale: 0.92, headlineToHeroRatio: 1.25 },
          depthDistribution: { perspective: 1400, tiltX: 10.5, tiltY: 0.5, zSpread: 60 },
          cameraPosition: { scale: 1.018, translateY: -4, tiltX: 1.2, fov: 52 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.78, beamWidth: 780, ambientGlowOpacity: 0.65, bloomRadius: 60 },
          motionEnergy: { springStiffness: 130, springDamping: 12, microLevitationAmp: 4.0, microLevitationFreq: 0.07, alertPulseRate: 1.4 },
          peripheralActivity: { backgroundBlur: 0.8, vignetteDarkness: 0.58, edgeOverflow: 0.05 },
        },
      },

      // Beat 4: Interruption (Surgical Lockup Stoppage)
      {
        id: "beat-4-interruption",
        beatIndex: 4,
        name: "Beat 4 — Surgical Lockup Stoppage",
        stage: "interruption",
        frameRange: [f3, f4],
        dramaticIntent: "ABRUPT KINETIC HALT: The rapid purge instantly stops dead. The single verified top candidate (Elena Rostova, Staff Systems Architect) drops into dead center with a resonant physical thud, arresting all motion.",
        shotDirection: "Purge motion snaps to an instant halt. Hero candidate card slams into focal center with high spring damping. Peripheral noise vanishes completely.",
        whatEnters: [`${scene.id}-hero-card`],
        dominantElementId: `${scene.id}-hero-card`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [
          { elementId: `${scene.id}-hero-card`, path: "depth-plunge", description: "Locks into hero Z-plane with resonant thud" },
        ],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Typography commands top space with zero obstruction",
        },
        cameraCue: {
          action: "recoil",
          isHolding: false,
          scale: 1.025,
          translateY: -5,
          tiltX: 11.5,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "flare",
          intensity: 0.85,
          beamWidth: 620,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 50, y: 50 },
          landingMomentFrame: Math.round(f3 + (f4 - f3) * 0.3),
          focalDescription: "Resonant physical lock on the single verified top candidate",
        },
        compositionState: {
          name: "Beat 4 — Surgical Lockup Stoppage",
          frameRange: [f3, f4],
          description: "Verified top candidate card locks into dead center",
          visualDensity: 0.38,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-hero-card`],
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.025, translateY: -5 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.9, targetDescription: "Hero verified candidate card" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 37, heightPercent: 58, widthPercent: 89, leftPercent: 5.5, borderRadius: 38, borderOpacity: 0.18 },
            cropping: { bleedMargin: 0, edgeTension: 0.1 },
          },
          density: { score: 0.38, breathingRoomRatio: 0.62, clutterFreeZones: ["left", "right", "top"] },
          scaleHierarchy: { heroScale: 1.08, secondaryScale: 0.93, headlineToHeroRatio: 1.30 },
          depthDistribution: { perspective: 1400, tiltX: 11.5, tiltY: 0, zSpread: 45 },
          cameraPosition: { scale: 1.025, translateY: -5, tiltX: 1.5, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.85, beamWidth: 620, ambientGlowOpacity: 0.70, bloomRadius: 65 },
          motionEnergy: { springStiffness: 140, springDamping: 18, microLevitationAmp: 2.0, microLevitationFreq: 0.04, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0, vignetteDarkness: 0.55, edgeOverflow: 0 },
        },
      },

      // Beat 5: Emphasis (99.4% Match Score Spotlight)
      {
        id: "beat-5-emphasis",
        beatIndex: 5,
        name: "Beat 5 — 99.4% Match Score Spotlight",
        stage: "emphasis",
        frameRange: [f4, f5],
        dramaticIntent: "Laser focus on definitive proof. Camera holds completely steady. A high-contrast emerald/violet halo spotlights the '99.4% CALIBRATED MATCH' verification pill, validating the recruiter's hiring confidence.",
        shotDirection: "Camera holds dead still. Narrow focused spotlight isolates the '99.4% Precision' verification pill and core competency tags. Attention is 100% concentrated.",
        whatEnters: [`${scene.id}-match-pill`],
        dominantElementId: `${scene.id}-match-pill`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Crisp copy alignment",
        },
        cameraCue: {
          action: "hold",
          isHolding: true,
          scale: 1.028,
          translateY: -5,
          tiltX: 11.5,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "spotlight",
          intensity: 0.92,
          beamWidth: 540,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 50, y: 46 },
          landingMomentFrame: Math.round(f4 + (f5 - f4) * 0.35),
          focalDescription: "Laser spotlight on 99.4% calibrated match score badge",
        },
        compositionState: {
          name: "Beat 5 — 99.4% Match Score Spotlight",
          frameRange: [f4, f5],
          description: "Spotlight beam isolates the verified precision score pill",
          visualDensity: 0.35,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-hero-card`, `${scene.id}-match-pill`],
          focalPoint: { x: 50, y: 46 },
          cameraState: { scale: 1.028, translateY: -5 },
          dominantFocalPoint: { x: 50, y: 46, weight: 0.95, targetDescription: "99.4% Match score badge" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 37, heightPercent: 58, widthPercent: 89, leftPercent: 5.5, borderRadius: 38, borderOpacity: 0.20 },
            cropping: { bleedMargin: 0, edgeTension: 0.05 },
          },
          density: { score: 0.35, breathingRoomRatio: 0.65, clutterFreeZones: ["left", "right", "top", "bottom"] },
          scaleHierarchy: { heroScale: 1.10, secondaryScale: 0.94, headlineToHeroRatio: 1.32 },
          depthDistribution: { perspective: 1400, tiltX: 11.5, tiltY: 0, zSpread: 40 },
          cameraPosition: { scale: 1.028, translateY: -5, tiltX: 1.5, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.92, beamWidth: 540, ambientGlowOpacity: 0.78, bloomRadius: 70 },
          motionEnergy: { springStiffness: 80, springDamping: 20, microLevitationAmp: 1.8, microLevitationFreq: 0.03, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0, vignetteDarkness: 0.52, edgeOverflow: 0 },
        },
      },

      // Beat 6: Climax (Cathartic Clarity & Monolithic Luminescence)
      {
        id: "beat-6-climax",
        beatIndex: 6,
        name: "Beat 6 — Cathartic Clarity & Luminescence",
        stage: "climax",
        frameRange: [f5, f6],
        dramaticIntent: "Deep cathartic relief and triumph. Pristine negative space (65% breathing room) floods the frame. The headline copy 'Calibrated in seconds' punches in with pure white clarity. The recruiter realizes hiring can be effortless.",
        shotDirection: "Atmospheric bloom expands across the background. Hero card hovers in monolithic luminescence. Headline reaches peak typographic punch.",
        whatEnters: [`${scene.id}-bloom-glow`],
        dominantElementId: `${scene.id}-hero-card`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Pure white typographic punch with maximum contrast",
        },
        cameraCue: {
          action: "push-in",
          isHolding: false,
          scale: 1.032,
          translateY: -6,
          tiltX: 12.0,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "overload-bloom",
          intensity: 0.95,
          beamWidth: 920,
        },
        viewerAttention: {
          from: { x: 50, y: 46 },
          to: { x: 50, y: 50 },
          landingMomentFrame: Math.round(f5 + (f6 - f5) * 0.5),
          focalDescription: "Monolithic hero card surrounded by violet radiance",
        },
        compositionState: {
          name: "Beat 6 — Cathartic Clarity & Luminescence",
          frameRange: [f5, f6],
          description: "Full monolithic luminescence and pristine spatial equilibrium",
          visualDensity: 0.30,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-hero-card`, `${scene.id}-match-pill`, `${scene.id}-bloom-glow`],
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.032, translateY: -6 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.95, targetDescription: "Radiant calibrated candidate profile" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 37, heightPercent: 58, widthPercent: 89, leftPercent: 5.5, borderRadius: 38, borderOpacity: 0.22 },
            cropping: { bleedMargin: 0, edgeTension: 0 },
          },
          density: { score: 0.30, breathingRoomRatio: 0.70, clutterFreeZones: ["left", "right", "top", "bottom"] },
          scaleHierarchy: { heroScale: 1.12, secondaryScale: 0.95, headlineToHeroRatio: 1.35 },
          depthDistribution: { perspective: 1400, tiltX: 12.0, tiltY: 0, zSpread: 40 },
          cameraPosition: { scale: 1.032, translateY: -6, tiltX: 1.8, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.95, beamWidth: 920, ambientGlowOpacity: 0.88, bloomRadius: 80 },
          motionEnergy: { springStiffness: 70, springDamping: 22, microLevitationAmp: 2.2, microLevitationFreq: 0.04, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0, vignetteDarkness: 0.50, edgeOverflow: 0 },
        },
      },

      // Beat 7: Release (Serene Negative Space Equilibrium)
      {
        id: "beat-7-release",
        beatIndex: 7,
        name: "Beat 7 — Serene Equilibrium",
        stage: "release",
        frameRange: [f6, f7],
        dramaticIntent: "Total serenity and stability. Physics settles into gentle micro-levitation. The candidate profile sits in unshakeable spatial balance.",
        shotDirection: "Physics smoothly damps out. Card floats with gentle 2px levitation. Breathing room stabilizes at 65%.",
        whatEnters: [],
        dominantElementId: `${scene.id}-hero-card`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Authoritative calm typography",
        },
        cameraCue: {
          action: "settle",
          isHolding: false,
          scale: 1.030,
          translateY: -6,
          tiltX: 11.5,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "release-prep",
          intensity: 0.80,
          beamWidth: 700,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 50, y: 50 },
          landingMomentFrame: Math.round(f6 + (f7 - f6) * 0.5),
          focalDescription: "Serene levitation and complete visual resolution",
        },
        compositionState: {
          name: "Beat 7 — Serene Equilibrium",
          frameRange: [f6, f7],
          description: "Harmonic steady state with breathing room",
          visualDensity: 0.32,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-hero-card`, `${scene.id}-match-pill`, `${scene.id}-bloom-glow`],
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.030, translateY: -6 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.9, targetDescription: "Calibrated candidate in equilibrium" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 37, heightPercent: 58, widthPercent: 89, leftPercent: 5.5, borderRadius: 38, borderOpacity: 0.20 },
            cropping: { bleedMargin: 0, edgeTension: 0 },
          },
          density: { score: 0.32, breathingRoomRatio: 0.68, clutterFreeZones: ["left", "right", "top", "bottom"] },
          scaleHierarchy: { heroScale: 1.10, secondaryScale: 0.94, headlineToHeroRatio: 1.32 },
          depthDistribution: { perspective: 1400, tiltX: 11.5, tiltY: 0, zSpread: 40 },
          cameraPosition: { scale: 1.030, translateY: -6, tiltX: 1.5, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.80, beamWidth: 700, ambientGlowOpacity: 0.80, bloomRadius: 70 },
          motionEnergy: { springStiffness: 60, springDamping: 24, microLevitationAmp: 2.0, microLevitationFreq: 0.03, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0, vignetteDarkness: 0.52, edgeOverflow: 0 },
        },
      },

      // Beat 8: Transition (Momentum into Proof / CTA)
      {
        id: "beat-8-transition",
        beatIndex: 8,
        name: "Beat 8 — Transition into Action",
        stage: "transition",
        frameRange: [f7, f8],
        dramaticIntent: "Forward handoff. Camera begins a smooth forward drift, preparing viewer attention to travel naturally to the action button / proof metrics in the following scene.",
        shotDirection: "Smooth forward tracking drift guides eye line downward toward next action.",
        whatEnters: [],
        dominantElementId: `${scene.id}-hero-card`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Clean forward handoff",
        },
        cameraCue: {
          action: "drift",
          isHolding: false,
          scale: 1.035,
          translateY: -7,
          tiltX: 12.0,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "drift",
          intensity: 0.75,
          beamWidth: 650,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 50, y: 70 },
          landingMomentFrame: f8 - 1,
          focalDescription: "Downward eye trace preparing for call to action",
        },
        compositionState: {
          name: "Beat 8 — Transition into Action",
          frameRange: [f7, f8],
          description: "Forward drift handoff into decisive next scene",
          visualDensity: 0.35,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-hero-card`, `${scene.id}-match-pill`],
          focalPoint: { x: 50, y: 70 },
          cameraState: { scale: 1.035, translateY: -7 },
          dominantFocalPoint: { x: 50, y: 70, weight: 0.85, targetDescription: "Handoff to bottom action zone" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 37, heightPercent: 58, widthPercent: 89, leftPercent: 5.5, borderRadius: 38, borderOpacity: 0.18 },
            cropping: { bleedMargin: 0, edgeTension: 0 },
          },
          density: { score: 0.35, breathingRoomRatio: 0.65, clutterFreeZones: ["left", "right", "top"] },
          scaleHierarchy: { heroScale: 1.08, secondaryScale: 0.93, headlineToHeroRatio: 1.30 },
          depthDistribution: { perspective: 1400, tiltX: 12.0, tiltY: 0, zSpread: 40 },
          cameraPosition: { scale: 1.035, translateY: -7, tiltX: 1.8, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.75, beamWidth: 650, ambientGlowOpacity: 0.75, bloomRadius: 65 },
          motionEnergy: { springStiffness: 60, springDamping: 24, microLevitationAmp: 1.8, microLevitationFreq: 0.03, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0, vignetteDarkness: 0.54, edgeOverflow: 0 },
        },
      },
    ];

    const shotScript = formatShotScript(scene.name, scene.intent, durationFrames, fps, beats);

    const startingState = beats[0].compositionState!;
    const intermediateStates = [
      beats[1].compositionState!,
      beats[2].compositionState!,
      beats[3].compositionState!,
      beats[4].compositionState!,
      beats[6].compositionState!,
      beats[7].compositionState!,
    ];
    const climaxState = {
      ...beats[5].compositionState!,
      climaxFrame: Math.round(f5 + (f6 - f5) * 0.5),
      emotionalTension: "Cathartic relief: the noise vanishes, leaving only the calibrated top match in pure radiance.",
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
          "The scene is directed across 8 distinct visual beats: starting in residual clutter tension, introducing the autonomous violet calibration beam, purging 480 unqualified cards across a high-velocity sweep, arresting all motion with an abrupt lockup as the top candidate drops into center, holding camera steady for a laser spotlight on the 99.4% precision match badge, blooming into cathartic clarity, settling into serene negative space equilibrium, and drifting forward into the final proof/action call.",
        whyItChanges:
          "Demonstrates RCRUT's core promise: eliminating repetitive triage noise and delivering surgical recruiting precision in seconds.",
        whenItChanges:
          `Beat 1: Residual Tension (f${f0}-f${f1}) -> Beat 2: Calibration Ingress (f${f1}-f${f2}) -> Beat 3: Clutter Purge (f${f2}-f${f3}) -> Beat 4: Lockup (f${f3}-f${f4}) -> Beat 5: 99.4% Match Spotlight (f${f4}-f${f5}) -> Beat 6: Cathartic Bloom (f${f5}-f${f6}) -> Beat 7: Equilibrium (f${f6}-f${f7}) -> Beat 8: Transition (f${f7}-f${f8}).`,
        howAttentionShifts:
          "From diffuse searching across residual clutter -> diagonal tracking of the violet calibration beam -> dramatic inward convergence -> sudden focal lock on hero card -> concentrated spotlight on 99.4% badge -> serene expansive awareness -> forward handoff.",
        visualClimax:
          `Frames ${f5}-${f6}: The instant the verified candidate card is bathed in monolithic violet luminescence with 65% pristine negative space.`,
      },
      startingState,
      intermediateStates,
      climaxState,
      densityEvolution: {
        progression: "crowded-to-cleansed",
        curve: [
          { frame: f0, density: 0.80 },
          { frame: f2, density: 0.65 },
          { frame: f3, density: 0.45 },
          { frame: f4, density: 0.38 },
          { frame: f5, density: 0.30 },
          { frame: f8, density: 0.35 },
        ],
      },
      spawningSchedule,
      cameraEvolution: {
        trajectory: "subtle-push-in",
        scaleRange: [1.0, 1.035],
        tiltRange: [8, 12],
      },
      typographyEvolution: {
        revealType: "staggered-word",
        revealFrameRange: [0, Math.min(20, f2)],
        holdUntilFrame: durationFrames,
      },
      visualEmphasisShifts: [
        { frame: f0, target: "Residual Noise Outlines", focalPoint: { x: 50, y: 50 }, reason: "Recall initial pain point" },
        { frame: f1, target: "Violet Calibration Beam", focalPoint: { x: 65, y: 40 }, reason: "Autonomous intelligence arrives" },
        { frame: f2, target: "High-Velocity Purge Sweep", focalPoint: { x: 50, y: 50 }, reason: "Elimination of waste" },
        { frame: f3, target: "Top Candidate Card Slam", focalPoint: { x: 50, y: 50 }, reason: "Motion arrests onto verified solution" },
        { frame: f4, target: "99.4% Precision Badge", focalPoint: { x: 50, y: 46 }, reason: "Spotlight holds on proof metric" },
        { frame: f5, target: "Radiant Monolithic Profile", focalPoint: { x: 50, y: 50 }, reason: "Cathartic clarity and relief" },
        { frame: f7, target: "Action Handoff", focalPoint: { x: 50, y: 70 }, reason: "Forward transition" },
      ],
      transitionPreparation: {
        startFrame: f7,
        momentum: "accelerate-forward",
      },
    };
  }

  /**
   * Standard motion plan for typographic / manifesto scenes
   * Expressed across the 8 Canonical Directed Beats:
   * 1. anticipation (The Pristine Void)
   * 2. entrance (Typographic Manifestation)
   * 3. escalation (Architectural 3D Grounding)
   * 4. interruption (Interactive Intent / Cursor Trajectory)
   * 5. emphasis (Action Trigger Spotlight)
   * 6. climax (Kinetic Click Compression Impact)
   * 7. release (Verified Equilibrium)
   * 8. transition (Enduring Brand Imprint)
   */
  private buildStandardEditorialMotionPlan(
    scene: StoryboardScene,
    analysis: KeyframeAnalysis,
    durationFrames: number,
    fps = 30
  ): MotionPlan {
    const f0 = 0;
    const f1 = Math.round(durationFrames * 0.14);
    const f2 = Math.round(durationFrames * 0.28);
    const f3 = Math.round(durationFrames * 0.42);
    const f4 = Math.round(durationFrames * 0.56);
    const f5 = Math.round(durationFrames * 0.70);
    const f6 = Math.round(durationFrames * 0.82);
    const f7 = Math.round(durationFrames * 0.92);
    const f8 = durationFrames;

    // 1. Explicit Object Roles & Casting for Editorial / Product Showcase
    const objectCasting: CinematicObjectRole[] = [
      {
        elementId: `${scene.id}-headline`,
        role: "hero",
        importance: "primary",
        zPlane: "hero-plane",
        trajectory: "fade",
        entryFrame: f1,
        scale: 1.0,
      },
      {
        elementId: `${scene.id}-product-window`,
        role: "hero",
        importance: "primary",
        zPlane: "hero-plane",
        trajectory: "from-depth",
        entryFrame: f2,
        scale: 1.04,
      },
      {
        elementId: `${scene.id}-metric-cards`,
        role: "depth-anchor",
        importance: "secondary",
        zPlane: "midground",
        trajectory: "pop-in",
        entryFrame: Math.round(durationFrames * 0.32),
        scale: 0.95,
      },
      {
        elementId: `${scene.id}-cursor`,
        role: "interrupter",
        importance: "primary",
        zPlane: "foreground-occluder",
        trajectory: "from-left",
        entryFrame: f3,
        exitFrame: f6,
        scale: 1.0,
      },
      {
        elementId: `${scene.id}-cta-button`,
        role: "hero",
        importance: "primary",
        zPlane: "hero-plane",
        trajectory: "pop-in",
        entryFrame: f4,
        scale: 1.0,
      },
      {
        elementId: `${scene.id}-click-ripple`,
        role: "interrupter",
        importance: "secondary",
        zPlane: "foreground-occluder",
        trajectory: "pop-in",
        entryFrame: f5,
        exitFrame: f6,
        scale: 1.1,
      },
      {
        elementId: `${scene.id}-brand-lockup`,
        role: "depth-anchor",
        importance: "primary",
        zPlane: "hero-plane",
        trajectory: "fade",
        entryFrame: f7,
        scale: 1.0,
      },
    ];

    const spawningSchedule: SpawningEvent[] = objectCasting.map((cast) => ({
      id: `spawn-${cast.elementId}`,
      elementId: cast.elementId,
      spawnFrame: cast.entryFrame,
      durationFrames: cast.exitFrame ? cast.exitFrame - cast.entryFrame : undefined,
      entryTrajectory: (cast.trajectory as any) || "from-depth",
      easing: cast.role === "hero" ? "spring" : cast.role === "interrupter" ? "accelerate" : "ease-out",
    }));

    // 2. The 8 Canonical Directed Beats for Editorial Showcase
    const beats: CinematicBeat[] = [
      // Beat 1: Anticipation (The Pristine Void)
      {
        id: "beat-1-anticipation",
        beatIndex: 1,
        name: "Beat 1 — The Pristine Void",
        stage: "anticipation",
        frameRange: [f0, f1],
        dramaticIntent: "Pristine void and quiet architectural expectation. The canvas opens with deep obsidian tones and subtle ambient vignette. Recruiter's attention is focused squarely on the center void.",
        shotDirection: "Empty canvas with subtle vignette and deep violet background glow. Camera holds locked at 1.00x scale.",
        whatEnters: [],
        dominantElementId: "canvas-void",
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Clean canvas awaiting statement",
        },
        cameraCue: {
          action: "hold",
          isHolding: true,
          scale: 1.0,
          translateY: 0,
          tiltX: 4.0,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "whisper",
          intensity: 0.30,
          beamWidth: 450,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 50, y: 50 },
          landingMomentFrame: 0,
          focalDescription: "Atmospheric stillness and poised anticipation",
        },
        compositionState: {
          name: "Beat 1 — The Pristine Void",
          frameRange: [f0, f1],
          description: "Clean negative space poised for typographic entry",
          visualDensity: 0.18,
          activeElementIds: [],
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.0, translateY: 0 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.5, targetDescription: "Poised central void" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 90, leftPercent: 5, borderRadius: 36, borderOpacity: 0.10 },
            cropping: { bleedMargin: 0, edgeTension: 0 },
          },
          density: { score: 0.18, breathingRoomRatio: 0.82, clutterFreeZones: ["top", "left", "right", "bottom"] },
          scaleHierarchy: { heroScale: 1.0, secondaryScale: 0.90, headlineToHeroRatio: 1.20 },
          depthDistribution: { perspective: 1600, tiltX: 4.0, tiltY: 0, zSpread: 30 },
          cameraPosition: { scale: 1.0, translateY: 0, tiltX: 0, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.30, beamWidth: 450, ambientGlowOpacity: 0.25, bloomRadius: 35 },
          motionEnergy: { springStiffness: 80, springDamping: 18, microLevitationAmp: 1.5, microLevitationFreq: 0.03, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0, vignetteDarkness: 0.45, edgeOverflow: 0 },
        },
      },

      // Beat 2: Entrance (Typographic Manifestation)
      {
        id: "beat-2-entrance",
        beatIndex: 2,
        name: "Beat 2 — Typographic Manifestation",
        stage: "entrance",
        frameRange: [f1, f2],
        dramaticIntent: "Authority manifests in type. The headline copy reveals word-by-word with tight editorial tracking (-0.038em), delivering the core brand thesis with unhurried confidence.",
        shotDirection: "Word-by-word typographic reveal across top third. Crisp letterforms punch through with pure white luminescence.",
        whatEnters: [`${scene.id}-headline`],
        dominantElementId: `${scene.id}-headline`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Word-by-word clean staggering",
        },
        cameraCue: {
          action: "drift",
          isHolding: false,
          scale: 1.008,
          translateY: -1,
          tiltX: 5.5,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "whisper",
          intensity: 0.45,
          beamWidth: 550,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 50, y: 25 },
          landingMomentFrame: Math.round(f1 + (f2 - f1) * 0.4),
          focalDescription: "Headline typographic manifestation in upper third",
        },
        compositionState: {
          name: "Beat 2 — Typographic Manifestation",
          frameRange: [f1, f2],
          description: "Headline words staggering in with crisp optical clarity",
          visualDensity: 0.30,
          activeElementIds: [`${scene.id}-headline`],
          focalPoint: { x: 50, y: 25 },
          cameraState: { scale: 1.008, translateY: -1 },
          dominantFocalPoint: { x: 50, y: 25, weight: 0.85, targetDescription: "Revealing headline copy" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 90, leftPercent: 5, borderRadius: 36, borderOpacity: 0.12 },
            cropping: { bleedMargin: 0, edgeTension: 0 },
          },
          density: { score: 0.30, breathingRoomRatio: 0.70, clutterFreeZones: ["bottom", "left", "right"] },
          scaleHierarchy: { heroScale: 1.02, secondaryScale: 0.92, headlineToHeroRatio: 1.30 },
          depthDistribution: { perspective: 1550, tiltX: 5.5, tiltY: 0, zSpread: 35 },
          cameraPosition: { scale: 1.008, translateY: -1, tiltX: 0.5, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.45, beamWidth: 550, ambientGlowOpacity: 0.40, bloomRadius: 42 },
          motionEnergy: { springStiffness: 90, springDamping: 16, microLevitationAmp: 2.0, microLevitationFreq: 0.04, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0, vignetteDarkness: 0.50, edgeOverflow: 0 },
        },
      },

      // Beat 3: Escalation (Architectural 3D Grounding)
      {
        id: "beat-3-escalation",
        beatIndex: 3,
        name: "Beat 3 — Architectural 3D Grounding",
        stage: "escalation",
        frameRange: [f2, f3],
        dramaticIntent: "Structural embodiment. The product dashboard / glassmorphic window manifests from depth, tilting with authentic 3D perspective (10° tiltX, 1400px perspective) to ground the claim in real software.",
        shotDirection: "3D application window rises from depth into the lower two-thirds of frame. Sub-components and telemetry gauges settle into place.",
        whatEnters: [`${scene.id}-product-window`, `${scene.id}-metric-cards`],
        dominantElementId: `${scene.id}-product-window`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [
          { elementId: `${scene.id}-product-window`, path: "from-depth", description: "Rises into 3D perspective plane" },
        ],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Balanced relationship with product window",
        },
        cameraCue: {
          action: "push-in",
          isHolding: false,
          scale: 1.016,
          translateY: -3,
          tiltX: 8.0,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "sculpt",
          intensity: 0.65,
          beamWidth: 700,
        },
        viewerAttention: {
          from: { x: 50, y: 25 },
          to: { x: 50, y: 55 },
          landingMomentFrame: Math.round(f2 + (f3 - f2) * 0.5),
          focalDescription: "3D product dashboard interface manifesting from depth",
        },
        compositionState: {
          name: "Beat 3 — Architectural 3D Grounding",
          frameRange: [f2, f3],
          description: "3D perspective interface window grounded in lower frame",
          visualDensity: 0.48,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-product-window`, `${scene.id}-metric-cards`],
          focalPoint: { x: 50, y: 55 },
          cameraState: { scale: 1.016, translateY: -3 },
          dominantFocalPoint: { x: 50, y: 55, weight: 0.85, targetDescription: "3D product window" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 91, leftPercent: 4.5, borderRadius: 36, borderOpacity: 0.16 },
            cropping: { bleedMargin: 5, edgeTension: 0.15 },
          },
          density: { score: 0.48, breathingRoomRatio: 0.52, clutterFreeZones: ["left", "right"] },
          scaleHierarchy: { heroScale: 1.04, secondaryScale: 0.94, headlineToHeroRatio: 1.25 },
          depthDistribution: { perspective: 1400, tiltX: 8.0, tiltY: 0, zSpread: 55 },
          cameraPosition: { scale: 1.016, translateY: -3, tiltX: 1.0, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.65, beamWidth: 700, ambientGlowOpacity: 0.60, bloomRadius: 55 },
          motionEnergy: { springStiffness: 110, springDamping: 15, microLevitationAmp: 3.0, microLevitationFreq: 0.05, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0.5, vignetteDarkness: 0.58, edgeOverflow: 0.05 },
        },
      },

      // Beat 4: Interruption (Interactive Intent / Cursor Trajectory)
      {
        id: "beat-4-interruption",
        beatIndex: 4,
        name: "Beat 4 — Interactive Trajectory",
        stage: "interruption",
        frameRange: [f3, f4],
        dramaticIntent: "Human agency enters the system. A razor-sharp pointer cursor arcs across the negative space on a smooth bezier trajectory, interrupting the passive showcase and directing focus toward action.",
        shotDirection: "Hardware pointer sweeps in from bottom-left on a smooth bezier curve toward primary action button. Eye line follows pointer trajectory.",
        whatEnters: [`${scene.id}-cursor`],
        dominantElementId: `${scene.id}-cursor`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [
          { elementId: `${scene.id}-cursor`, path: "foreground-cross", description: "Smooth bezier traversal across negative space" },
        ],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Attention guided gracefully downward",
        },
        cameraCue: {
          action: "push-in",
          isHolding: false,
          scale: 1.022,
          translateY: -4,
          tiltX: 9.5,
          tiltY: -0.5,
        },
        lightingCue: {
          behavior: "focus",
          intensity: 0.75,
          beamWidth: 620,
        },
        viewerAttention: {
          from: { x: 50, y: 55 },
          to: { x: 45, y: 68 },
          landingMomentFrame: Math.round(f3 + (f4 - f3) * 0.6),
          focalDescription: "Pointer trajectory tracking across dashboard toward CTA",
        },
        compositionState: {
          name: "Beat 4 — Interactive Trajectory",
          frameRange: [f3, f4],
          description: "Pointer cursor sweeping smoothly across negative space",
          visualDensity: 0.52,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-product-window`, `${scene.id}-metric-cards`, `${scene.id}-cursor`],
          focalPoint: { x: 45, y: 68 },
          cameraState: { scale: 1.022, translateY: -4 },
          dominantFocalPoint: { x: 45, y: 68, weight: 0.9, targetDescription: "Moving pointer cursor" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 91, leftPercent: 4.5, borderRadius: 36, borderOpacity: 0.16 },
            cropping: { bleedMargin: 5, edgeTension: 0.15 },
          },
          density: { score: 0.52, breathingRoomRatio: 0.48, clutterFreeZones: ["top-right"] },
          scaleHierarchy: { heroScale: 1.05, secondaryScale: 0.94, headlineToHeroRatio: 1.20 },
          depthDistribution: { perspective: 1400, tiltX: 9.5, tiltY: -0.5, zSpread: 60 },
          cameraPosition: { scale: 1.022, translateY: -4, tiltX: 1.2, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.75, beamWidth: 620, ambientGlowOpacity: 0.68, bloomRadius: 60 },
          motionEnergy: { springStiffness: 120, springDamping: 14, microLevitationAmp: 3.5, microLevitationFreq: 0.05, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0.8, vignetteDarkness: 0.62, edgeOverflow: 0.06 },
        },
      },

      // Beat 5: Emphasis (Action Trigger Spotlight)
      {
        id: "beat-5-emphasis",
        beatIndex: 5,
        name: "Beat 5 — Action Trigger Spotlight",
        stage: "emphasis",
        frameRange: [f4, f5],
        dramaticIntent: "Focus narrows onto the tipping point. Camera holds completely steady as the cursor arrives over the high-conversion CTA button. The button enters a glowing hover state, inviting the decisive click.",
        shotDirection: "Camera locks into a steady hold. Cursor hovers over CTA button. Radial glow expands behind the button with 88% lighting intensity.",
        whatEnters: [`${scene.id}-cta-button`],
        dominantElementId: `${scene.id}-cta-button`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Headline remains anchor; focal eye rests on button",
        },
        cameraCue: {
          action: "hold",
          isHolding: true,
          scale: 1.025,
          translateY: -5,
          tiltX: 10.0,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "spotlight",
          intensity: 0.88,
          beamWidth: 500,
        },
        viewerAttention: {
          from: { x: 45, y: 68 },
          to: { x: 50, y: 72 },
          landingMomentFrame: Math.round(f4 + (f5 - f4) * 0.35),
          focalDescription: "Focused spotlight hold on the primary action button hover state",
        },
        compositionState: {
          name: "Beat 5 — Action Trigger Spotlight",
          frameRange: [f4, f5],
          description: "Spotlight beam holds steady on the primary action button",
          visualDensity: 0.50,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-product-window`, `${scene.id}-metric-cards`, `${scene.id}-cursor`, `${scene.id}-cta-button`],
          focalPoint: { x: 50, y: 72 },
          cameraState: { scale: 1.025, translateY: -5 },
          dominantFocalPoint: { x: 50, y: 72, weight: 0.95, targetDescription: "Glowing CTA button" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 91, leftPercent: 4.5, borderRadius: 36, borderOpacity: 0.18 },
            cropping: { bleedMargin: 5, edgeTension: 0.12 },
          },
          density: { score: 0.50, breathingRoomRatio: 0.50, clutterFreeZones: ["top", "left", "right"] },
          scaleHierarchy: { heroScale: 1.06, secondaryScale: 0.95, headlineToHeroRatio: 1.20 },
          depthDistribution: { perspective: 1400, tiltX: 10.0, tiltY: 0, zSpread: 55 },
          cameraPosition: { scale: 1.025, translateY: -5, tiltX: 1.4, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.88, beamWidth: 500, ambientGlowOpacity: 0.75, bloomRadius: 65 },
          motionEnergy: { springStiffness: 90, springDamping: 18, microLevitationAmp: 2.0, microLevitationFreq: 0.03, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0.5, vignetteDarkness: 0.60, edgeOverflow: 0.04 },
        },
      },

      // Beat 6: Climax (Kinetic Click Compression Impact)
      {
        id: "beat-6-climax",
        beatIndex: 6,
        name: "Beat 6 — Kinetic Click Compression",
        stage: "climax",
        frameRange: [f5, f6],
        dramaticIntent: "The moment of commitment. The cursor executes a decisive spring click compression (0.94 scale); a crisp shockwave ripple radiates outward. Telemetry metrics count up instantly, delivering on the promise.",
        shotDirection: "Cursor click compression triggers ripple effect. Metric counter surges with spring velocity. Peak brightness and bloom.",
        whatEnters: [`${scene.id}-click-ripple`],
        dominantElementId: `${scene.id}-cta-button`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Authoritative click confirmation",
        },
        cameraCue: {
          action: "recoil",
          isHolding: false,
          scale: 1.028,
          translateY: -5,
          tiltX: 10.5,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "bloom",
          intensity: 0.94,
          beamWidth: 850,
        },
        viewerAttention: {
          from: { x: 50, y: 72 },
          to: { x: 50, y: 72 },
          landingMomentFrame: Math.round(f5 + (f6 - f5) * 0.25),
          focalDescription: "Decisive tactile click compression and ripple bloom",
        },
        compositionState: {
          name: "Beat 6 — Kinetic Click Compression",
          frameRange: [f5, f6],
          description: "Tactile click compression impact and telemetry surge",
          visualDensity: 0.55,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-product-window`, `${scene.id}-metric-cards`, `${scene.id}-cursor`, `${scene.id}-cta-button`, `${scene.id}-click-ripple`],
          focalPoint: { x: 50, y: 72 },
          cameraState: { scale: 1.028, translateY: -5 },
          dominantFocalPoint: { x: 50, y: 72, weight: 0.95, targetDescription: "Click compression epicenter" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 91, leftPercent: 4.5, borderRadius: 36, borderOpacity: 0.20 },
            cropping: { bleedMargin: 5, edgeTension: 0.15 },
          },
          density: { score: 0.55, breathingRoomRatio: 0.45, clutterFreeZones: ["top"] },
          scaleHierarchy: { heroScale: 1.08, secondaryScale: 0.95, headlineToHeroRatio: 1.20 },
          depthDistribution: { perspective: 1400, tiltX: 10.5, tiltY: 0, zSpread: 50 },
          cameraPosition: { scale: 1.028, translateY: -5, tiltX: 1.5, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.94, beamWidth: 850, ambientGlowOpacity: 0.85, bloomRadius: 75 },
          motionEnergy: { springStiffness: 140, springDamping: 14, microLevitationAmp: 2.8, microLevitationFreq: 0.05, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0.8, vignetteDarkness: 0.64, edgeOverflow: 0.08 },
        },
      },

      // Beat 7: Release (Verified Equilibrium)
      {
        id: "beat-7-release",
        beatIndex: 7,
        name: "Beat 7 — Verified Equilibrium",
        stage: "release",
        frameRange: [f6, f7],
        dramaticIntent: "Resolution and confidence. The interface settles into serene operational equilibrium. Verified status checkmarks glow softly. The user feels in absolute mastery.",
        shotDirection: "Click ripple dissipates. All gauges hold steady in verified state. Camera settles with gentle micro-levitation.",
        whatEnters: [],
        whatExits: [`${scene.id}-cursor`, `${scene.id}-click-ripple`],
        dominantElementId: `${scene.id}-product-window`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Stable authoritative lockup",
        },
        cameraCue: {
          action: "settle",
          isHolding: false,
          scale: 1.026,
          translateY: -5,
          tiltX: 10.0,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "release-prep",
          intensity: 0.78,
          beamWidth: 680,
        },
        viewerAttention: {
          from: { x: 50, y: 72 },
          to: { x: 50, y: 50 },
          landingMomentFrame: Math.round(f6 + (f7 - f6) * 0.5),
          focalDescription: "Harmonic equilibrium across headline and interface",
        },
        compositionState: {
          name: "Beat 7 — Verified Equilibrium",
          frameRange: [f6, f7],
          description: "Interface rests in verified operational equilibrium",
          visualDensity: 0.48,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-product-window`, `${scene.id}-metric-cards`, `${scene.id}-cta-button`],
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.026, translateY: -5 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.85, targetDescription: "Harmonic product interface" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 91, leftPercent: 4.5, borderRadius: 36, borderOpacity: 0.16 },
            cropping: { bleedMargin: 5, edgeTension: 0.10 },
          },
          density: { score: 0.48, breathingRoomRatio: 0.52, clutterFreeZones: ["top", "left", "right"] },
          scaleHierarchy: { heroScale: 1.05, secondaryScale: 0.94, headlineToHeroRatio: 1.22 },
          depthDistribution: { perspective: 1400, tiltX: 10.0, tiltY: 0, zSpread: 48 },
          cameraPosition: { scale: 1.026, translateY: -5, tiltX: 1.2, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.78, beamWidth: 680, ambientGlowOpacity: 0.72, bloomRadius: 65 },
          motionEnergy: { springStiffness: 70, springDamping: 22, microLevitationAmp: 1.8, microLevitationFreq: 0.03, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0.3, vignetteDarkness: 0.58, edgeOverflow: 0.02 },
        },
      },

      // Beat 8: Transition (Enduring Brand Imprint)
      {
        id: "beat-8-transition",
        beatIndex: 8,
        name: "Beat 8 — Enduring Brand Imprint",
        stage: "transition",
        frameRange: [f7, f8],
        dramaticIntent: "Permanent impression. Camera executes a measured drift-pull, anchoring the brand monogram and core metric into long-term recall as the scene completes.",
        shotDirection: "Subtle camera drift backward to reveal full composition balance. Ambient glow wraps the brand monogram.",
        whatEnters: [`${scene.id}-brand-lockup`],
        dominantElementId: `${scene.id}-brand-lockup`,
        obscuredElementIds: [],
        foregroundBackgroundCrossings: [],
        typographyInterruption: {
          isInterrupted: false,
          action: "unobstructed",
          description: "Enduring brand impression",
        },
        cameraCue: {
          action: "drift",
          isHolding: false,
          scale: 1.024,
          translateY: -4,
          tiltX: 9.0,
          tiltY: 0,
        },
        lightingCue: {
          behavior: "settle",
          intensity: 0.70,
          beamWidth: 600,
        },
        viewerAttention: {
          from: { x: 50, y: 50 },
          to: { x: 50, y: 50 },
          landingMomentFrame: f8 - 1,
          focalDescription: "Brand monogram imprint and complete scene resolution",
        },
        compositionState: {
          name: "Beat 8 — Enduring Brand Imprint",
          frameRange: [f7, f8],
          description: "Brand imprint lockup with steady ambient illumination",
          visualDensity: 0.42,
          activeElementIds: [`${scene.id}-headline`, `${scene.id}-product-window`, `${scene.id}-brand-lockup`],
          focalPoint: { x: 50, y: 50 },
          cameraState: { scale: 1.024, translateY: -4 },
          dominantFocalPoint: { x: 50, y: 50, weight: 0.9, targetDescription: "Brand imprint lockup" },
          compositionGeometry: {
            archetype: "monolithic-centered",
            containerBounds: { topPercent: 36, heightPercent: 60, widthPercent: 91, leftPercent: 4.5, borderRadius: 36, borderOpacity: 0.14 },
            cropping: { bleedMargin: 5, edgeTension: 0.08 },
          },
          density: { score: 0.42, breathingRoomRatio: 0.58, clutterFreeZones: ["top", "left", "right"] },
          scaleHierarchy: { heroScale: 1.04, secondaryScale: 0.93, headlineToHeroRatio: 1.25 },
          depthDistribution: { perspective: 1400, tiltX: 9.0, tiltY: 0, zSpread: 45 },
          cameraPosition: { scale: 1.024, translateY: -4, tiltX: 1.0, fov: 50 },
          typographyState: { fontSize: 76, tracking: -0.038, opacity: 1.0, lineHeight: 1.08, blur: 0 },
          lightingIntensity: { beamIntensity: 0.70, beamWidth: 600, ambientGlowOpacity: 0.65, bloomRadius: 55 },
          motionEnergy: { springStiffness: 60, springDamping: 24, microLevitationAmp: 1.5, microLevitationFreq: 0.03, alertPulseRate: 0 },
          peripheralActivity: { backgroundBlur: 0, vignetteDarkness: 0.55, edgeOverflow: 0 },
        },
      },
    ];

    const shotScript = formatShotScript(scene.name, scene.intent, durationFrames, fps, beats);

    const startingState = beats[0].compositionState!;
    const intermediateStates = [
      beats[1].compositionState!,
      beats[2].compositionState!,
      beats[3].compositionState!,
      beats[4].compositionState!,
      beats[6].compositionState!,
      beats[7].compositionState!,
    ];
    const climaxState = {
      ...beats[5].compositionState!,
      climaxFrame: Math.round(f5 + (f6 - f5) * 0.25),
      emotionalTension: "Confidence and architectural calm: kinetic commitment locks into verified execution.",
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
          "The scene is directed across 8 distinct visual beats: beginning in a poised obsidian void, staggering in authoritative headline typography, manifesting the 3D product dashboard from perspective depth, guiding viewer attention with a smooth cursor trajectory, pausing for a steady spotlight hold on the CTA button, executing a crisp click compression and ripple bloom, settling into verified operational equilibrium, and concluding with an enduring brand imprint drift.",
        whyItChanges:
          "Communicates premium architectural craft, effortless software agency, and immediate certainty.",
        whenItChanges:
          `Beat 1: The Void (f${f0}-f${f1}) -> Beat 2: Typographic Manifestation (f${f1}-f${f2}) -> Beat 3: 3D Grounding (f${f2}-f${f3}) -> Beat 4: Pointer Trajectory (f${f3}-f${f4}) -> Beat 5: Button Spotlight (f${f4}-f${f5}) -> Beat 6: Click Compression (f${f5}-f${f6}) -> Beat 7: Equilibrium (f${f6}-f${f7}) -> Beat 8: Brand Imprint (f${f7}-f${f8}).`,
        howAttentionShifts:
          "Empty void -> upper headline words -> 3D product interface rising from depth -> pointer traversal arc -> intense spotlight on CTA button -> kinetic impact epicenter -> balanced equilibrium -> brand monogram recall.",
        visualClimax:
          `Frames ${f5}-${f6}: The instant of tactile click compression when ripple radiates and telemetry metrics surge under blooming illumination.`,
      },
      startingState,
      intermediateStates,
      climaxState,
      densityEvolution: {
        progression: "steady-focus",
        curve: [
          { frame: f0, density: 0.18 },
          { frame: f1, density: 0.30 },
          { frame: f2, density: 0.48 },
          { frame: f4, density: 0.50 },
          { frame: f5, density: 0.55 },
          { frame: f8, density: 0.42 },
        ],
      },
      spawningSchedule,
      cameraEvolution: {
        trajectory: "steady-drift",
        scaleRange: [1.0, 1.028],
        tiltRange: [4, 10.5],
      },
      typographyEvolution: {
        revealType: "staggered-word",
        revealFrameRange: [f1, Math.min(f1 + 22, f3)],
        holdUntilFrame: durationFrames,
      },
      visualEmphasisShifts: [
        { frame: f0, target: "Poised Void", focalPoint: { x: 50, y: 50 }, reason: "Quiet architectural opening" },
        { frame: f1, target: "Manifesting Headline", focalPoint: { x: 50, y: 25 }, reason: "Thesis delivery" },
        { frame: f2, target: "3D Product Window", focalPoint: { x: 50, y: 55 }, reason: "Real software embodiment" },
        { frame: f3, target: "Bezier Cursor Arc", focalPoint: { x: 45, y: 68 }, reason: "Human agency enters" },
        { frame: f4, target: "CTA Hover Spotlight", focalPoint: { x: 50, y: 72 }, reason: "Action readiness hold" },
        { frame: f5, target: "Click Compression", focalPoint: { x: 50, y: 72 }, reason: "Commitment and metric surge" },
        { frame: f7, target: "Brand Monogram Imprint", focalPoint: { x: 50, y: 50 }, reason: "Enduring memory anchor" },
      ],
      transitionPreparation: {
        startFrame: f7,
        momentum: "freeze-anticipation",
      },
    };
  }
}

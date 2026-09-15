import React, { useMemo } from "react";
import { Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { MotionIR, MotionIRSchema, Scene } from "../schema";
import { SceneRenderer } from "./SceneRenderer";
import { GlobalAtmosphere } from "../primitives/GlobalAtmosphere";
import { getAsset } from "../asset-bank";
import defaultAd from "../../examples/saas-product-ad.json";

export interface AdCompositionProps {
  motionIR?: MotionIR;
  [key: string]: any;
}

export interface SceneTimelineItem {
  scene: Scene;
  index: number;
  startFrame: number;
  endFrame: number;
  grossDuration: number;
  transitionDuration: number;
}

/**
 * Calculates net frames accounting for seamless spatial camera overlaps between scenes.
 */
export function computeTotalDurationFrames(scenes: Scene[]): number {
  if (!scenes || scenes.length === 0) return 300;
  let total = 0;
  for (let i = 0; i < scenes.length; i++) {
    total += scenes[i].durationFrames || 90;
    if (i < scenes.length - 1) {
      const trans = scenes[i].transition;
      const transDur = trans?.durationFrames || 15;
      total -= transDur;
    }
  }
  return Math.max(30, total);
}

// Cinematic cubic bezier easing for camera movements
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const AdComposition: React.FC<AdCompositionProps> = (props) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Support either direct MotionIR JSON (passed via --props=ad.json) or { motionIR: ... }
  const rawIR = (props as any).scenes ? props : props.motionIR || defaultAd;
  const parsed = MotionIRSchema.parse(rawIR);
  const { brand, scenes, audio } = parsed;

  const totalFrames = computeTotalDurationFrames(scenes);

  // 1. Build Continuous Global Timeline for Scenes
  const timeline = useMemo<SceneTimelineItem[]>(() => {
    const items: SceneTimelineItem[] = [];
    let currentStart = 0;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const grossDuration = scene.durationFrames || 90;
      const trans = scene.transition;
      const transDur = trans?.durationFrames || 15;

      items.push({
        scene,
        index: i,
        startFrame: currentStart,
        endFrame: currentStart + grossDuration,
        grossDuration,
        transitionDuration: transDur,
      });

      // Next scene starts before this scene finishes (spatial overlap)
      currentStart += grossDuration - transDur;
    }
    return items;
  }, [scenes]);

  // Active scene & atmosphere detection
  const activeSceneItem = useMemo(() => {
    return (
      timeline.find((item) => frame >= item.startFrame && frame <= item.endFrame) ||
      timeline[0]
    );
  }, [timeline, frame]);

  const activeAtmosphere = activeSceneItem?.scene.atmosphere || {
    grain: 0.12,
    vignette: 0.28,
    haze: 0.1,
  };

  const activeAtmoAsset = activeSceneItem?.scene.atmosphereAssetId
    ? getAsset(activeSceneItem.scene.atmosphereAssetId)
    : undefined;

  // 2. Global Camera Rig & Continuous Breathing Motion
  const globalCameraBreathe = useMemo(() => {
    // Continuous subtle slow drift across the entire ad
    const scale = interpolate(frame, [0, totalFrames], [1.0, 1.04], {
      extrapolateRight: "clamp",
    });
    const rotateZ = Math.sin(frame / 90) * 0.35;
    const translateX = Math.sin(frame / 70) * 8;
    const translateY = Math.cos(frame / 60) * 6;

    return { scale, rotateZ, translateX, translateY };
  }, [frame, totalFrames]);

  // 3. Frame-Synced SFX List
  const resolvedSFXList = useMemo(() => {
    const list = [...(audio?.sfx || [])];

    if (list.length === 0) {
      timeline.forEach((item) => {
        const currentTimelineFrame = item.startFrame;

        item.scene.elements.forEach((el) => {
          if (el.type === "cursor-interaction") {
            const clickFrame = currentTimelineFrame + (el.props.delay || 0) + (el.props.clickAtFrame || 35);
            list.push({
              type: "click",
              atFrame: clickFrame,
              volume: 0.65,
              trimBefore: 0,
            });
          } else if (el.type === "metric-counter") {
            const impactFrame = currentTimelineFrame + (el.props.delay || 0) + (el.props.durationFrames || 30);
            list.push({
              type: "impact",
              atFrame: impactFrame,
              volume: 0.7,
              trimBefore: 0,
            });
          }
        });

        // Scene transition whoosh
        if (item.index < timeline.length - 1) {
          const whooshFrame = item.endFrame - item.transitionDuration;
          list.push({
            type: "whoosh",
            atFrame: whooshFrame,
            volume: 0.55,
            trimBefore: 0,
          });
        }
      });
    }

    return list;
  }, [timeline, audio?.sfx]);

  const resolveAudioSrc = (item: { type?: string; src?: string }) => {
    if (item.src) return item.src;
    try {
      return staticFile(`audio/sfx/${item.type || "whoosh"}.wav`);
    } catch {
      return undefined;
    }
  };

  const isLight =
    brand.theme === "editorial-light" ||
    brand.colors.background === "#F8F7F3" ||
    brand.colors.background === "#FFFFFF" ||
    brand.colors.background === "#F8FAFC";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: brand.colors.background || "#0B0F19",
        position: "relative",
        overflow: "hidden",
        perspective: "1400px",
        perspectiveOrigin: "center center",
      }}
    >
      {/* Background Audio Track */}
      {audio?.src && (
        <Audio
          src={audio.src}
          loop={audio.loop ?? true}
          volume={(f) => {
            const baseVol = audio.volume ?? 0.8;
            const fadeIn = audio.fadeInFrames || 15;
            const fadeOut = audio.fadeOutFrames || 20;

            if (f < fadeIn) {
              return interpolate(f, [0, fadeIn], [0, baseVol]);
            }
            if (f > totalFrames - fadeOut) {
              return interpolate(f, [totalFrames - fadeOut, totalFrames], [baseVol, 0]);
            }
            return baseVol;
          }}
        />
      )}

      {/* Frame-Synced Sound Effects */}
      {resolvedSFXList.map((sfxItem, sfxIdx) => {
        const audioSrc = resolveAudioSrc(sfxItem);
        if (!audioSrc) return null;
        return (
          <Sequence key={sfxIdx} from={sfxItem.atFrame}>
            <Audio
              src={audioSrc}
              volume={sfxItem.volume ?? 0.7}
              trimBefore={sfxItem.trimBefore || 0}
            />
          </Sequence>
        );
      })}

      {/* Global Environmental Atmosphere under Camera Rig */}
      <GlobalAtmosphere
        brand={brand}
        isLight={isLight}
        grain={activeAtmosphere.grain}
        vignette={activeAtmosphere.vignette}
        haze={activeAtmosphere.haze}
        particleCount={activeAtmoAsset?.properties?.particleCount}
        hasVolumetricBloom={activeAtmoAsset?.properties?.hasVolumetricBloom}
      />

      {/* Unified 3D Camera World Canvas */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `translate3d(${globalCameraBreathe.translateX}px, ${globalCameraBreathe.translateY}px, 0) scale(${globalCameraBreathe.scale}) rotateZ(${globalCameraBreathe.rotateZ}deg)`,
        }}
      >
        {timeline.map((item) => {
          const isMounted = frame >= item.startFrame && frame <= item.endFrame;
          if (!isMounted) return null;

          const localFrame = frame - item.startFrame;
          const transDur = item.transitionDuration;
          const isEntering = localFrame < transDur && item.index > 0;
          const isExiting = frame > item.endFrame - transDur && item.index < timeline.length - 1;

          // Per-Scene Directed Camera Shot Execution
          const cameraConfig = item.scene.camera || {
            shot: "push-in",
            intensity: "medium",
            ease: "cinematic",
          };

          const intensityMul =
            cameraConfig.intensity === "aggressive"
              ? 1.7
              : cameraConfig.intensity === "subtle"
              ? 0.55
              : 1.0;

          const progress = Math.min(1, Math.max(0, localFrame / item.grossDuration));

          let shotTranslateX = 0;
          let shotTranslateY = 0;
          let shotTranslateZ = 0;
          let shotScale = 1.0;
          let shotRotateX = 0;
          let shotRotateY = 0;

          if (cameraConfig.shot === "push-in") {
            shotScale = interpolate(progress, [0, 1], [1.0, 1.0 + 0.08 * intensityMul]);
            shotTranslateZ = interpolate(progress, [0, 1], [0, 110 * intensityMul]);
            shotRotateX = interpolate(progress, [0, 1], [0, -1.2 * intensityMul]);
          } else if (cameraConfig.shot === "pull-back") {
            shotScale = interpolate(progress, [0, 1], [1.0 + 0.09 * intensityMul, 1.0]);
            shotTranslateZ = interpolate(progress, [0, 1], [90 * intensityMul, -25]);
            shotRotateX = interpolate(progress, [0, 1], [-1.2 * intensityMul, 0]);
          } else if (cameraConfig.shot === "fly-through") {
            shotTranslateZ = interpolate(progress, [0, 1], [-60, 200 * intensityMul]);
            shotScale = interpolate(progress, [0, 1], [0.95, 1.08 * intensityMul]);
            shotRotateY = interpolate(progress, [0, 1], [1.2, -1.2]);
          } else if (cameraConfig.shot === "orbit") {
            shotRotateY = interpolate(progress, [0, 1], [-3.2 * intensityMul, 3.2 * intensityMul]);
            shotRotateX = interpolate(progress, [0, 1], [1.8 * intensityMul, -0.8]);
            shotScale = 1.0 + Math.sin(progress * Math.PI) * 0.035;
          } else if (cameraConfig.shot === "vertical-rise") {
            shotTranslateY = interpolate(progress, [0, 1], [22 * intensityMul, -22 * intensityMul]);
            shotRotateX = interpolate(progress, [0, 1], [2.0 * intensityMul, -0.8]);
            shotScale = interpolate(progress, [0, 1], [1.0, 1.04 * intensityMul]);
          } else {
            // "drift"
            shotTranslateX = Math.sin(progress * Math.PI * 2) * 6;
            shotTranslateY = Math.cos(progress * Math.PI * 2) * 5;
            shotScale = 1.0 + progress * 0.025;
          }

          let sceneOpacity = 1;
          let transitionZ = 0;
          let transitionScale = 1;

          // 3D Spatial Entry
          if (isEntering) {
            const enterProgress = easeInOutCubic(Math.min(1, Math.max(0, localFrame / transDur)));
            sceneOpacity = enterProgress;
            transitionZ = interpolate(enterProgress, [0, 1], [-220, 0]);
            transitionScale = interpolate(enterProgress, [0, 1], [0.93, 1]);
          }

          // 3D Spatial Exit
          if (isExiting) {
            const exitRaw = (frame - (item.endFrame - transDur)) / transDur;
            const exitProgress = easeInOutCubic(Math.min(1, Math.max(0, exitRaw)));
            sceneOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
            transitionZ = interpolate(exitProgress, [0, 1], [0, 180]);
            transitionScale = interpolate(exitProgress, [0, 1], [1, 1.1]);
          }

          const combinedScale = shotScale * transitionScale;
          const combinedZ = shotTranslateZ + transitionZ;

          return (
            <div
              key={item.scene.id}
              style={{
                position: "absolute",
                inset: 0,
                transformStyle: "preserve-3d",
                transform: `translate3d(${shotTranslateX}px, ${shotTranslateY}px, ${combinedZ}px) scale(${combinedScale}) rotateX(${shotRotateX}deg) rotateY(${shotRotateY}deg)`,
                opacity: sceneOpacity,
                zIndex: item.index + 10,
              }}
            >
              <Sequence
                from={item.startFrame}
                durationInFrames={item.grossDuration}
                layout="none"
              >
                <SceneRenderer scene={item.scene} brand={brand} />
              </Sequence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

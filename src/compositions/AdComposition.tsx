import React from "react";
import { Audio, Sequence, interpolate } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { MotionIR, MotionIRSchema, Scene } from "../schema";
import { SceneRenderer } from "./SceneRenderer";
import defaultAd from "../../examples/saas-product-ad.json";

export interface AdCompositionProps {
  motionIR?: MotionIR;
  [key: string]: any;
}

export function computeTotalDurationFrames(scenes: Scene[]): number {
  if (!scenes || scenes.length === 0) return 300;
  let total = 0;
  for (let i = 0; i < scenes.length; i++) {
    total += scenes[i].durationFrames || 90;
    if (i < scenes.length - 1) {
      const trans = scenes[i].transition;
      if (trans && trans.presentation !== "none" && trans.type !== "none") {
        const transDur = trans.durationFrames || 15;
        total -= transDur;
      }
    }
  }
  return Math.max(30, total);
}

export const AdComposition: React.FC<AdCompositionProps> = (props) => {
  // Support either direct MotionIR JSON (passed via --props=ad.json) or { motionIR: ... }
  const rawIR = (props as any).scenes ? props : props.motionIR || defaultAd;
  const parsed = MotionIRSchema.parse(rawIR);
  const { brand, scenes, audio } = parsed;

  const totalFrames = computeTotalDurationFrames(scenes);

  const getTransitionPresentation = (scene: Scene) => {
    const trans = scene.transition || {};
    const p = trans.presentation || (trans.type === "crossfade" ? "fade" : trans.type);
    const d = trans.direction || "from-right";

    if (p === "slide" || trans.type === "slide-left" || trans.type === "slide-right") {
      const dir = trans.type === "slide-left" ? "from-right" : trans.type === "slide-right" ? "from-left" : d;
      return slide({ direction: dir as any });
    }
    if (p === "wipe" || trans.type === "wipe") {
      return wipe({ direction: d as any });
    }
    if (p === "flip") {
      return flip();
    }
    if (p === "clock-wipe") {
      return clockWipe({ width: parsed.meta.width || 1080, height: parsed.meta.height || 1920 });
    }
    // Default to smooth cross-fade
    return fade();
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: brand.colors.background || "#0B0F19",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background audio track if configured */}
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

      {/* Frame-Synced Sound Effects (SFX) */}
      {audio?.sfx?.map((sfxItem, sfxIdx) => {
        if (!sfxItem.src) return null;
        return (
          <Sequence key={sfxIdx} from={sfxItem.atFrame}>
            <Audio
              src={sfxItem.src}
              volume={sfxItem.volume ?? 0.7}
              trimBefore={sfxItem.trimBefore || 0}
            />
          </Sequence>
        );
      })}

      {/* Sequential Scenes with Seamless TransitionSeries */}
      <TransitionSeries>
        {scenes.map((scene, idx) => {
          const trans = scene.transition || {};
          const transDur = trans.durationFrames || 15;
          const isLast = idx === scenes.length - 1;
          const hasTransition = !isLast && trans.presentation !== "none" && trans.type !== "none";

          return (
            <React.Fragment key={scene.id}>
              <TransitionSeries.Sequence durationInFrames={scene.durationFrames}>
                <SceneRenderer scene={scene} brand={brand} />
              </TransitionSeries.Sequence>
              {hasTransition && (
                <TransitionSeries.Transition
                  presentation={getTransitionPresentation(scene) as any}
                  timing={linearTiming({ durationInFrames: transDur })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </div>
  );
};


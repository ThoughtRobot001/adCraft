import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Brand, resolveColor, SceneBackground, SceneTransition as SceneTransitionType } from "../schema";
import { getAsset } from "../asset-bank";
import { ShaderGradient } from "./ShaderGradient";
import { VideoBackground } from "./VideoBackground";

interface Props {
  background: SceneBackground;
  transition: SceneTransitionType;
  durationFrames: number;
  brand: Brand;
  backgroundAssetId?: string;
  children: React.ReactNode;
}

export const SceneTransition: React.FC<Props> = ({
  background,
  transition,
  durationFrames,
  brand,
  backgroundAssetId,
  children,
}) => {
  const frame = useCurrentFrame();

  const transitionDuration = transition.durationFrames || 10;
  const isEntering = frame < transitionDuration;
  const isExiting = frame > durationFrames - transitionDuration;

  // Continuous cinematic drift across the scene duration (no static pauses)
  const driftScale = 1 + (frame / durationFrames) * 0.035;
  const driftY = Math.sin(frame / 50) * 6;
  const driftX = Math.cos(frame / 65) * 4;

  let opacity = 1;
  let transform = `translate3d(${driftX}px, ${driftY}px, 0) scale(${driftScale})`;

  // Smooth cinematic enter/exit fades and pushes
  if (isEntering && transition.type !== "none") {
    const enterProgress = frame / transitionDuration;
    opacity = interpolate(enterProgress, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  }

  if (isExiting && transition.type !== "none") {
    const exitProgress = (frame - (durationFrames - transitionDuration)) / transitionDuration;
    opacity = interpolate(exitProgress, [0, 1], [1, 0], { extrapolateRight: "clamp" });
  }

  const bgColor = resolveColor(background.color || "brand.background", brand);
  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);

  // Background style computation
  let bgStyle: React.CSSProperties = {
    backgroundColor: bgColor,
  };

  if (background.type === "gradient") {
    const gradTo = resolveColor(background.gradientTo || "#030712", brand);
    bgStyle = {
      background: `linear-gradient(${background.angle || 135}deg, ${bgColor} 0%, ${gradTo} 100%)`,
    };
  }

  // Ambient floating glow orb motion
  const orb1X = 30 + Math.sin((frame / 45)) * 15;
  const orb1Y = 30 + Math.cos((frame / 45)) * 10;
  const orb2X = 70 + Math.cos((frame / 50)) * 12;
  const orb2Y = 65 + Math.sin((frame / 50)) * 14;

  const isLight = brand.theme === "editorial-light" || bgColor === "#F8F7F3" || bgColor === "#FFFFFF" || bgColor === "#F8FAFC";

  // Asset Bank background styling properties
  const bgAsset = backgroundAssetId ? getAsset(backgroundAssetId) : undefined;
  const bgProps = bgAsset?.properties;
  const hasPaperGrain = bgProps?.hasPaperGrain ?? isLight;
  const hasStudioLight = bgProps?.hasStudioLight ?? isLight;
  const dotGridOpacity = bgProps?.dotGridOpacity ?? (isLight ? 0.05 : 0.08);

  const isShader = bgAsset?.mediaType === "shader" || bgAsset?.category === "shader";
  const isVideo = bgAsset?.mediaType === "video";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        opacity,
        transform,
        ...bgStyle,
      }}
    >
      {/* Real-time Mathematical Shader Gradient */}
      {isShader && (
        <ShaderGradient
          preset={bgProps?.shaderPreset || bgProps?.preset || "aurora"}
          speed={bgProps?.speed ?? 1.0}
          opacity={bgProps?.opacity ?? 0.9}
          brand={brand}
          blendMode={bgAsset?.blendMode || "normal"}
        />
      )}

      {/* Cinematic High-Depth Video Loop */}
      {isVideo && (
        <VideoBackground
          src={bgAsset?.src}
          opacity={bgProps?.opacity ?? 0.85}
          playbackRate={bgAsset?.playbackRate ?? 1.0}
          blendMode={bgAsset?.blendMode || "normal"}
          fallbackColor={bgProps?.fallbackColor || bgColor}
        />
      )}

      {/* Subtle paper / tech dot grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: isLight
            ? `radial-gradient(rgba(0, 0, 0, ${dotGridOpacity}) 1px, transparent 1px)`
            : `radial-gradient(rgba(255, 255, 255, ${dotGridOpacity}) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: isLight ? 0.8 : 0.4,
          pointerEvents: "none",
        }}
      />

      {/* Physical Paper / Studio Micro-Grain Overlay */}
      {hasPaperGrain && (
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: isLight ? 0.038 : 0.025,
            pointerEvents: "none",
            zIndex: 1,
            mixBlendMode: isLight ? "multiply" : "screen",
          }}
        >
          <filter id="adcraft-paper-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#adcraft-paper-grain)" />
        </svg>
      )}

      {/* Editorial Roving Studio Light */}
      {hasStudioLight && (
        <div
          style={{
            position: "absolute",
            left: `${45 + Math.sin(frame / 60) * 8}%`,
            top: `${40 + Math.cos(frame / 60) * 6}%`,
            width: "900px",
            height: "900px",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, rgba(255, 255, 255, 0.75) 0%, rgba(248, 247, 243, 0) 65%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}

      {/* Dynamic Ambient Background Glow Orbs for Dark Mode */}
      {background.glowOrb && !isLight && (
        <>
          <div
            style={{
              position: "absolute",
              left: `${orb1X}%`,
              top: `${orb1Y}%`,
              width: "550px",
              height: "550px",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${primaryColor}26 0%, transparent 65%)`,
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `${orb2X}%`,
              top: `${orb2Y}%`,
              width: "480px",
              height: "480px",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle, ${accentColor}18 0%, transparent 60%)`,
              filter: "blur(70px)",
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {children}
    </div>
  );
};

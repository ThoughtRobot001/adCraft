import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Brand, resolveColor, SceneBackground, SceneTransition as SceneTransitionType } from "../schema";

interface Props {
  background: SceneBackground;
  transition: SceneTransitionType;
  durationFrames: number;
  brand: Brand;
  children: React.ReactNode;
}

export const SceneTransition: React.FC<Props> = ({
  background,
  transition,
  durationFrames,
  brand,
  children,
}) => {
  const frame = useCurrentFrame();

  const transitionDuration = transition.durationFrames || 10;
  const isEntering = frame < transitionDuration;
  const isExiting = frame > durationFrames - transitionDuration;

  let opacity = 1;
  let transform = "";

  // Enter animation
  if (isEntering && transition.type !== "none") {
    const enterProgress = frame / transitionDuration;
    if (transition.type === "fade") {
      opacity = interpolate(enterProgress, [0, 1], [0, 1]);
    } else if (transition.type === "slide-left") {
      const x = interpolate(enterProgress, [0, 1], [100, 0]);
      transform = `translateX(${x}px)`;
      opacity = enterProgress;
    } else if (transition.type === "slide-up") {
      const y = interpolate(enterProgress, [0, 1], [80, 0]);
      transform = `translateY(${y}px)`;
      opacity = enterProgress;
    } else if (transition.type === "zoom-out") {
      const scale = interpolate(enterProgress, [0, 1], [1.15, 1]);
      transform = `scale(${scale})`;
      opacity = enterProgress;
    }
  }

  // Exit animation
  if (isExiting && transition.type !== "none") {
    const exitProgress = (frame - (durationFrames - transitionDuration)) / transitionDuration;
    if (transition.type === "fade") {
      opacity = interpolate(exitProgress, [0, 1], [1, 0]);
    } else if (transition.type === "slide-left") {
      const x = interpolate(exitProgress, [0, 1], [0, -100]);
      transform = `translateX(${x}px)`;
      opacity = 1 - exitProgress;
    } else if (transition.type === "slide-up") {
      const y = interpolate(exitProgress, [0, 1], [0, -80]);
      transform = `translateY(${y}px)`;
      opacity = 1 - exitProgress;
    } else if (transition.type === "zoom-out") {
      const scale = interpolate(exitProgress, [0, 1], [1, 0.9]);
      transform = `scale(${scale})`;
      opacity = 1 - exitProgress;
    }
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
      {/* Dynamic Ambient Background Glow Orbs */}
      {background.glowOrb && (
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
          {/* Subtle tech grid texture */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
              backgroundSize: "36px 36px",
              opacity: 0.4,
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {children}
    </div>
  );
};

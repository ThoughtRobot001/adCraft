import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile, Img, Easing } from "remotion";

export const SceneLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Part 1: "This is" (local frames 0 - 36)
  const thisIsOpacity = interpolate(frame, [0, 8, 28, 36], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const thisIsScale = interpolate(frame, [0, 32], [0.96, 1.02], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });

  // Part 2: Centered Shield Logo pop (local frames 35 - 65)
  const shieldSpring = spring({ fps, frame: frame - 35, config: { damping: 13, stiffness: 120 } });
  const shieldScale = interpolate(shieldSpring, [0, 1], [0.75, 1]);
  const shieldOpacity = interpolate(frame, [35, 42, 60, 68], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Part 3: Full Logo Lockup & Tagline (local frames 65 - 162)
  const fullLogoSpring = spring({ fps, frame: frame - 64, config: { damping: 14, stiffness: 110 } });
  const fullLogoScale = interpolate(fullLogoSpring, [0, 1], [0.92, 1]);
  const fullLogoOpacity = interpolate(frame, [64, 74], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Final audio-visual fade out (local 148 - 162)
  const tailFade = interpolate(frame, [150, 162], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A0A0C",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: tailFade,
      }}
    >
      {/* 1. "This is" */}
      {frame < 38 && (
        <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center", opacity: thisIsOpacity }}>
          <div
            style={{
              fontSize: "88px",
              fontWeight: 500,
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
              transform: `scale(${thisIsScale})`,
            }}
          >
            This is
          </div>
        </AbsoluteFill>
      )}

      {/* 2. Centered Faceted Shield Logo */}
      {frame >= 35 && frame < 70 && (
        <AbsoluteFill style={{ display: "flex", justifyContent: "center", alignItems: "center", opacity: shieldOpacity }}>
          <div style={{ transform: `scale(${shieldScale})` }}>
            <Img
              src={staticFile("assets/hedge/shield_logo.png")}
              style={{
                width: "280px",
                height: "auto",
                filter: "drop-shadow(0 15px 35px rgba(255,255,255,0.08))",
              }}
            />
          </div>
        </AbsoluteFill>
      )}

      {/* 3. Full Logo + Wordmark + Tagline Lockup */}
      {frame >= 64 && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            opacity: fullLogoOpacity,
            transform: `scale(${fullLogoScale})`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Img
              src={staticFile("assets/hedge/full_logo.png")}
              style={{
                width: "980px",
                height: "auto",
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.8))",
              }}
            />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

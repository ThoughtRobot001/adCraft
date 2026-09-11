import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, ProgressBarProps, resolveColor } from "../schema";

interface Props {
  props: ProgressBarProps;
  brand: Brand;
}

export const ProgressBar: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    label,
    value = 100,
    displayValue,
    color = "brand.accent",
    subtext,
    position = { x: 50, y: 50 },
    delay = 0,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const resolvedColor = resolveColor(color, brand);
  const mutedColor = resolveColor("brand.muted", brand);

  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 16, mass: 0.9, stiffness: 80 },
  });

  const progress = interpolate(spr, [0, 1], [0, Math.min(100, Math.max(0, value))]);
  const opacity = interpolate(currentFrame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        width: "84%",
        maxWidth: "880px",
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        fontFamily: brand.font,
        opacity,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF" }}>{label}</span>
        <span style={{ fontSize: "28px", fontWeight: 900, color: resolvedColor }}>
          {displayValue || `${Math.round(progress)}%`}
        </span>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: "100%",
          height: "18px",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          borderRadius: "999px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: resolvedColor,
            boxShadow: `0 0 20px ${resolvedColor}`,
            borderRadius: "999px",
          }}
        />
      </div>

      {subtext && (
        <div style={{ fontSize: "15px", color: mutedColor, fontWeight: 500 }}>
          {subtext}
        </div>
      )}
    </div>
  );
};

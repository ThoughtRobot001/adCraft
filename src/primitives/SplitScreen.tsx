import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, resolveColor, SplitScreenProps } from "../schema";

interface Props {
  props: SplitScreenProps;
  brand: Brand;
}

export const SplitScreen: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    left,
    right,
    width = 90,
    position = { x: 50, y: 55 },
    delay = 0,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 100 },
  });

  const translateY = interpolate(spr, [0, 1], [80, 0]);
  const opacity = interpolate(currentFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const leftColor = resolveColor(left.color || "#EF4444", brand);
  const rightColor = resolveColor(right.color || "brand.primary", brand);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) translateY(${translateY}px)`,
        width: `${width}%`,
        opacity,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        zIndex: 10,
      }}
    >
      {/* Left (Before / Pain / Legacy) */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: `1px solid ${leftColor}44`,
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: leftColor, textTransform: "uppercase" }}>
            {left.badge || "Legacy Workflow"}
          </span>
        </div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF", fontFamily: brand.font }}>
          {left.title}
        </div>
        {left.items && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            {left.items.map((item, i) => (
              <div key={i} style={{ fontSize: "15px", color: "#94A3B8", display: "flex", gap: "8px" }}>
                <span>✕</span> <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right (After / Solution / Modern) */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: `2px solid ${rightColor}`,
          boxShadow: `0 0 40px ${rightColor}33`,
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: rightColor, textTransform: "uppercase" }}>
            {right.badge || `${brand.name} Autonomous`}
          </span>
        </div>
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#FFFFFF", fontFamily: brand.font }}>
          {right.title}
        </div>
        {right.items && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            {right.items.map((item, i) => (
              <div key={i} style={{ fontSize: "15px", color: "#F8FAFC", display: "flex", gap: "8px", fontWeight: 600 }}>
                <span style={{ color: rightColor }}>✓</span> <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

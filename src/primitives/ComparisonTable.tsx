import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, ComparisonTableProps, resolveColor } from "../schema";

interface Props {
  props: ComparisonTableProps;
  brand: Brand;
}

export const ComparisonTable: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    title,
    competitorName = "Legacy Solutions",
    brandName = brand.name,
    rows = [],
    width = 90,
    position = { x: 50, y: 55 },
    delay = 0,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        width: `${width}%`,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px ${primaryColor}22`,
        fontFamily: brand.font,
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: 700, color: "#94A3B8" }}>
          {title || "Capability Matrix"}
        </div>
        <div style={{ fontSize: "16px", fontWeight: 800, color: primaryColor, textAlign: "center" }}>
          ✦ {brandName}
        </div>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#64748B", textAlign: "center" }}>
          {competitorName}
        </div>
      </div>

      {/* Rows */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((row, i) => {
          const rowDelay = delay + 8 + i * 6;
          const rFrame = Math.max(0, frame - rowDelay);
          const rSpr = spring({
            frame: rFrame,
            fps,
            config: { damping: 12, mass: 0.5, stiffness: 120 },
          });

          const opacity = interpolate(rFrame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
          const translateY = interpolate(rSpr, [0, 1], [20, 0]);

          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                padding: "18px 24px",
                borderBottom: i < rows.length - 1 ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
                alignItems: "center",
                opacity,
                transform: `translateY(${translateY}px)`,
              }}
            >
              <div style={{ fontSize: "17px", color: "#F8FAFC", fontWeight: 500 }}>
                {row.feature}
              </div>
              <div style={{ textAlign: "center", fontSize: "20px", color: accentColor, fontWeight: 800 }}>
                {row.brandHas ? "✓" : "—"}
              </div>
              <div style={{ textAlign: "center", fontSize: "20px", color: "#EF4444", fontWeight: 700 }}>
                {row.competitorHas ? "✓" : "✕"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

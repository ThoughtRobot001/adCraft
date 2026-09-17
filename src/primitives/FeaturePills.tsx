import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, FeaturePillsProps, resolveColor } from "../schema";

interface Props {
  props: FeaturePillsProps;
  brand: Brand;
}

export const FeaturePills: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    items = [],
    position = { x: 50, y: 50 },
    layout = "horizontal",
    staggerFrames = 6,
    delay = 0,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const isLight = brand.theme === "editorial-light" || brand.colors?.background === "#F8F7F3" || brand.colors?.background === "#FFFFFF" || brand.colors?.background === "#F8FAFC";
  const primaryColor = resolveColor("brand.primary", brand);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: layout === "vertical" ? "column" : "row",
        flexWrap: layout === "grid" || layout === "horizontal" ? "wrap" : "nowrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "14px",
        maxWidth: "92%",
        zIndex: 10,
      }}
    >
      {items.map((item, index) => {
        const itemDelay = index * staggerFrames;
        const itemFrame = Math.max(0, currentFrame - itemDelay);
        const spr = spring({
          frame: itemFrame,
          fps,
          config: { damping: 15, mass: 0.5, stiffness: 130 },
        });

        if (currentFrame < itemDelay) return null;

        const scale = interpolate(spr, [0, 1], [0.5, 1]);
        const translateY = interpolate(spr, [0, 1], [14, 0]);
        const opacity = interpolate(itemFrame, [0, 6], [0, 1], {
          extrapolateRight: "clamp",
        });

        const isHighlight = Boolean(item.highlight);

        return (
          <div
            key={index}
            style={{
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              backgroundColor: isLight
                ? isHighlight
                  ? "rgba(255, 255, 255, 0.98)"
                  : "rgba(255, 255, 255, 0.92)"
                : isHighlight
                ? "rgba(30, 41, 59, 0.95)"
                : "rgba(15, 23, 42, 0.8)",
              border: isLight
                ? isHighlight
                  ? `1.5px solid ${primaryColor}55`
                  : "1px solid rgba(15, 23, 42, 0.1)"
                : isHighlight
                ? `1.5px solid ${primaryColor}88`
                : "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "9999px",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backdropFilter: "blur(16px)",
              boxShadow: isLight
                ? isHighlight
                  ? `0 10px 25px rgba(0, 0, 0, 0.06), 0 0 15px ${primaryColor}15`
                  : "0 8px 20px rgba(0, 0, 0, 0.04)"
                : isHighlight
                ? `0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${primaryColor}33`
                : "0 10px 25px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Subtle Highlight Indicator Dot */}
            {isHighlight && (
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 8px ${primaryColor}`,
                }}
              />
            )}

            {item.icon && (
              <span style={{ fontSize: "18px", display: "flex", alignItems: "center" }}>
                {item.icon}
              </span>
            )}

            <span
              style={{
                fontFamily: brand.font,
                fontSize: "18px",
                fontWeight: 600,
                color: isLight ? "#0F172A" : "#FFFFFF",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {item.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};

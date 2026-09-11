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

  const primaryColor = resolveColor("brand.primary", brand);
  const textColor = resolveColor("brand.text", brand);

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
        gap: "16px",
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
          config: { damping: 13, mass: 0.6, stiffness: 120 },
        });

        if (currentFrame < itemDelay) return null;

        const scale = interpolate(spr, [0, 1], [0.4, 1]);
        const opacity = interpolate(itemFrame, [0, 6], [0, 1], {
          extrapolateRight: "clamp",
        });

        const isHighlight = item.highlight;
        const itemColor = item.color ? resolveColor(item.color, brand) : primaryColor;

        return (
          <div
            key={index}
            style={{
              transform: `scale(${scale})`,
              opacity,
              backgroundColor: isHighlight ? `${itemColor}22` : "rgba(30, 41, 59, 0.75)",
              border: `1.5px solid ${isHighlight ? itemColor : "rgba(255, 255, 255, 0.12)"}`,
              borderRadius: "9999px",
              padding: "18px 36px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              backdropFilter: "blur(20px)",
              boxShadow: isHighlight
                ? `0 14px 30px ${itemColor}55, 0 0 20px ${itemColor}33`
                : "0 12px 25px rgba(0,0,0,0.4)",
            }}
          >
            {item.icon && (
              <span style={{ fontSize: "28px" }}>{item.icon}</span>
            )}
            <span
              style={{
                fontFamily: brand.font,
                fontSize: "24px",
                fontWeight: 600,
                color: isHighlight ? "#FFFFFF" : textColor,
                letterSpacing: "-0.01em",
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

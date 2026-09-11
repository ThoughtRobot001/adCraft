import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, CTAButtonProps, resolveColor } from "../schema";

interface Props {
  props: CTAButtonProps;
  brand: Brand;
}

export const CTAButton: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    text,
    subtext,
    url,
    position = { x: 50, y: 70 },
    color = "#FFFFFF",
    backgroundColor = "brand.primary",
    pulse = true,
    delay = 10,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const bgColor = resolveColor(backgroundColor, brand);
  const secondaryColor = resolveColor("brand.secondary", brand);
  const mutedColor = resolveColor("brand.muted", brand);

  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 140 },
  });

  const scale = interpolate(spr, [0, 1], [0.5, 1]);
  const opacity = interpolate(currentFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Micro pulse after spring finishes
  const pulseFactor = pulse && currentFrame > 20
    ? 1 + Math.sin((currentFrame / fps) * 4) * 0.03
    : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) scale(${scale * pulseFactor})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, ${secondaryColor} 100%)`,
          color,
          padding: "24px 64px",
          borderRadius: "9999px",
          fontFamily: brand.font,
          fontSize: "28px",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          boxShadow: `0 24px 50px ${bgColor}77, 0 0 35px ${bgColor}44, inset 0 1px 2px rgba(255,255,255,0.45)`,
          border: "1.5px solid rgba(255, 255, 255, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          cursor: "pointer",
        }}
      >
        <span>{text}</span>
        <span style={{ fontSize: "28px", transform: "translateX(4px)" }}>→</span>
      </div>

      {subtext && (
        <div
          style={{
            marginTop: "16px",
            fontSize: "18px",
            color: mutedColor,
            fontFamily: brand.font,
            fontWeight: 500,
            letterSpacing: "0.01em",
          }}
        >
          {subtext}
        </div>
      )}

      {url && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "16px",
            color: bgColor,
            fontFamily: brand.font,
            fontWeight: 600,
            textDecoration: "underline",
          }}
        >
          {url}
        </div>
      )}
    </div>
  );
};

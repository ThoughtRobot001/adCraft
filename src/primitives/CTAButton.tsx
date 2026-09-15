import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, CTAButtonProps, resolveColor } from "../schema";
import { getAsset } from "../asset-bank";

interface Props {
  props: CTAButtonProps;
  brand: Brand;
  buttonStyleId?: string;
}

export const CTAButton: React.FC<Props> = ({ props, brand, buttonStyleId: propButtonStyleId }) => {
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

  // Asset Bank Resolution
  const resolvedButtonStyleId = (props as any).buttonStyleId || propButtonStyleId;
  const btnAsset = resolvedButtonStyleId ? getAsset(resolvedButtonStyleId) : undefined;
  const btnProps = btnAsset?.properties;

  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 140 },
  });

  const scale = interpolate(spr, [0, 1], [0.5, 1]);
  const opacity = interpolate(currentFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const shouldPulse = btnProps?.hasPulse !== undefined ? btnProps.hasPulse : pulse;

  // Micro pulse after spring finishes
  const pulseFactor = shouldPulse && currentFrame > 20
    ? 1 + Math.sin((currentFrame / fps) * 4) * 0.03
    : 1;

  const isLight =
    brand.theme === "editorial-light" ||
    brand.colors.background === "#F8F7F3" ||
    brand.colors.background === "#FFFFFF" ||
    brand.colors.background === "#F8FAFC";

  // Resolved dynamic styles from asset bank or defaults
  const padding = btnProps?.padding || "24px 64px";
  const borderRadius = btnProps?.borderRadius || "9999px";
  const fontSize = btnProps?.fontSize || "28px";
  const fontWeight = btnProps?.fontWeight || 700;
  const borderSheen = btnProps?.borderSheen || (isLight ? "1px solid rgba(255, 255, 255, 0.15)" : "1.5px solid rgba(255, 255, 255, 0.3)");
  const backdropFilter = btnProps?.backdropFilter || "none";

  let backgroundStyle: string;
  let textColor: string;
  let shadowStyle: string;

  if (btnAsset?.id === "btn-ghost-glass") {
    backgroundStyle = isLight ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.08)";
    textColor = isLight ? "#0F172A" : "#FFFFFF";
    shadowStyle = isLight
      ? "0 14px 30px rgba(0, 0, 0, 0.06)"
      : "0 18px 40px rgba(0, 0, 0, 0.4)";
  } else if (btnAsset?.id === "btn-minimal-editorial") {
    backgroundStyle = isLight ? "#0F172A" : "#FFFFFF";
    textColor = isLight ? "#FFFFFF" : "#0F172A";
    shadowStyle = isLight
      ? "0 20px 40px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)"
      : "0 20px 40px rgba(0, 0, 0, 0.4)";
  } else {
    // btn-glow-primary or default
    const bloom = btnProps?.shadowBloomIntensity || 35;
    backgroundStyle = isLight ? "#0F172A" : `linear-gradient(135deg, ${bgColor} 0%, ${secondaryColor} 100%)`;
    textColor = "#FFFFFF";
    shadowStyle = isLight
      ? "0 20px 40px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(0, 0, 0, 0.08)"
      : `0 24px 50px ${bgColor}77, 0 0 ${bloom}px ${bgColor}44, inset 0 1px 2px rgba(255,255,255,0.45)`;
  }

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
          background: backgroundStyle,
          color: textColor,
          padding,
          borderRadius,
          fontFamily: brand.font,
          fontSize,
          fontWeight,
          letterSpacing: "-0.01em",
          boxShadow: shadowStyle,
          border: borderSheen,
          backdropFilter,
          display: "flex",
          alignItems: "center",
          gap: "14px",
          cursor: "pointer",
        }}
      >
        <span>{text}</span>
        {!text.trim().endsWith("→") && !text.trim().endsWith("->") && (
          <span style={{ fontSize, transform: "translateX(4px)" }}>→</span>
        )}
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

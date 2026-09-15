import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, MetricCounterProps, resolveColor } from "../schema";

interface Props {
  props: MetricCounterProps;
  brand: Brand;
}

export const MetricCounter: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    label,
    value,
    prefix = "",
    suffix = "",
    decimals = 0,
    color = "brand.primary",
    position = { x: 50, y: 50 },
    delay = 0,
    durationFrames = 35,
    trend = "up",
    trendBadge,
    displayMode = "hero-typographic",
    subtext,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const isLight = brand.theme === "editorial-light" || brand.colors.background === "#F8F7F3" || brand.colors.background === "#FFFFFF" || brand.colors.background === "#F8FAFC";
  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);
  const displayFont = brand.theme === "editorial-light" && brand.serifFont ? brand.serifFont : brand.font;

  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 15, mass: 0.6, stiffness: 110 },
  });

  const scale = interpolate(spr, [0, 1], [0.82, 1]);
  const translateY = interpolate(spr, [0, 1], [24, 0]);
  const opacity = interpolate(currentFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Smooth number count-up interpolation (cubic ease-out)
  const progress = Math.min(1, currentFrame / durationFrames);
  const easeOut = 1 - Math.pow(1 - progress, 3);
  const currentValue = (value * easeOut).toFixed(decimals);

  // 1. HERO TYPOGRAPHIC MODE (Editorial Agency Standard — No Trapped Charcoal Box)
  if (displayMode === "hero-typographic") {
    return (
      <div
        style={{
          position: "absolute",
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
          opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          zIndex: 10,
          maxWidth: "880px",
          width: "90%",
        }}
      >
        {/* Label and Trend Badge Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isLight ? "#475569" : "#94A3B8",
              fontFamily: brand.font,
            }}
          >
            {label}
          </span>
          <span
            style={{
              backgroundColor: isLight ? "rgba(15, 23, 42, 0.05)" : "rgba(255, 255, 255, 0.1)",
              border: isLight ? "1px solid rgba(15, 23, 42, 0.12)" : "1px solid rgba(255, 255, 255, 0.18)",
              borderRadius: "999px",
              padding: "4px 12px",
              fontSize: "14px",
              fontWeight: 700,
              color: isLight ? "#0F172A" : "#F8FAFC",
              fontFamily: brand.font,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {trend === "up" && "↗"}
            {trend === "down" && "↘"}
            {trend === "neutral" && "→"}
            {trendBadge || (trend === "up" ? "Verified" : "")}
          </span>
        </div>

        {/* Majestic Display Number */}
        <div
          style={{
            fontSize: "112px",
            fontWeight: 800,
            fontFamily: displayFont,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            color: isLight ? "#0F172A" : "#FFFFFF",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            margin: "4px 0 16px 0",
          }}
        >
          {prefix && (
            <span style={{ fontSize: "64px", marginRight: "4px", opacity: 0.75 }}>
              {prefix}
            </span>
          )}
          <span>{currentValue}</span>
          {suffix && (
            <span
              style={{
                fontSize: "72px",
                marginLeft: "4px",
                color: isLight ? primaryColor : accentColor,
              }}
            >
              {suffix}
            </span>
          )}
        </div>

        {/* Editorial Subtitle */}
        {subtext && (
          <div
            style={{
              fontSize: "20px",
              fontWeight: 500,
              color: isLight ? "#64748B" : "rgba(255, 255, 255, 0.65)",
              fontFamily: brand.font,
              maxWidth: "580px",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    );
  }

  // 2. BENTO CARD MODE (Clean, Fine-Borders, Zero Neon Glow)
  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(20px)",
        padding: "40px 64px",
        borderRadius: "24px",
        border: isLight ? "1.5px solid rgba(15, 23, 42, 0.08)" : "1.5px solid rgba(255, 255, 255, 0.12)",
        boxShadow: isLight
          ? "0 20px 45px -15px rgba(0, 0, 0, 0.07), 0 2px 10px rgba(0, 0, 0, 0.04)"
          : "0 30px 70px -15px rgba(0, 0, 0, 0.7)",
        zIndex: 10,
        maxWidth: "680px",
      }}
    >
      {/* Label Badge */}
      <div
        style={{
          fontSize: "15px",
          fontWeight: 700,
          color: isLight ? "#475569" : "#94A3B8",
          fontFamily: brand.font,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {label}
        {trend === "up" && <span style={{ color: primaryColor, fontSize: "18px" }}>↗</span>}
        {trend === "down" && <span style={{ color: "#EF4444", fontSize: "18px" }}>↘</span>}
      </div>

      {/* Number Display */}
      <div
        style={{
          fontSize: "76px",
          fontWeight: 800,
          fontFamily: displayFont,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          color: isLight ? "#0F172A" : "#FFFFFF",
          marginBottom: "12px",
        }}
      >
        {prefix}
        {currentValue}
        <span style={{ color: isLight ? primaryColor : accentColor }}>{suffix}</span>
      </div>

      {/* Subtitle */}
      {subtext && (
        <div
          style={{
            fontSize: "16px",
            color: isLight ? "#64748B" : "rgba(255, 255, 255, 0.55)",
            fontFamily: brand.font,
            maxWidth: "460px",
            lineHeight: 1.4,
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
};

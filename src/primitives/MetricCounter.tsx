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
    subtext,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const resolvedColor = resolveColor(color, brand);
  const textColor = resolveColor("brand.text", brand);
  const mutedColor = resolveColor("brand.muted", brand);

  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 100 },
  });

  const scale = interpolate(spr, [0, 1], [0.6, 1]);
  const opacity = interpolate(currentFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Number count up interpolation
  const progress = Math.min(1, currentFrame / durationFrames);
  // Ease out cubic
  const easeOut = 1 - Math.pow(1 - progress, 3);
  const currentValue = (value * easeOut).toFixed(decimals);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(20px)",
        padding: "48px 80px",
        borderRadius: "32px",
        border: `2px solid ${resolvedColor}55`,
        boxShadow: `0 35px 80px -10px rgba(0,0,0,0.8), 0 0 60px ${resolvedColor}44`,
        zIndex: 10,
      }}
    >
      {/* Label Badge */}
      <div
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: mutedColor,
          fontFamily: brand.font,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {label}
        {trend === "up" && (
          <span style={{ color: resolvedColor, fontSize: "24px" }}>↗</span>
        )}
        {trend === "down" && (
          <span style={{ color: "#EF4444", fontSize: "24px" }}>↘</span>
        )}
        {trend === "neutral" && (
          <span style={{ color: mutedColor, fontSize: "24px" }}>→</span>
        )}
      </div>

      {/* Big Counter Number */}
      <div
        style={{
          fontSize: "124px",
          fontWeight: 900,
          color: textColor,
          fontFamily: brand.font,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          textShadow: `0 0 50px ${resolvedColor}aa`,
        }}
      >
        <span style={{ color: resolvedColor }}>{prefix}</span>
        {currentValue}
        <span style={{ color: resolvedColor }}>{suffix}</span>
      </div>

      {/* Subtext */}
      {subtext && (
        <div
          style={{
            fontSize: "20px",
            color: mutedColor,
            fontFamily: brand.font,
            marginTop: "20px",
            fontWeight: 500,
            maxWidth: "600px",
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
};

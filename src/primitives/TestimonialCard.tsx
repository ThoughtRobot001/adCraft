import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, resolveColor, TestimonialCardProps } from "../schema";

interface Props {
  props: TestimonialCardProps;
  brand: Brand;
}

export const TestimonialCard: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    quote,
    author,
    role,
    company,
    avatarUrl,
    stars = 5,
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

  const translateY = interpolate(spr, [0, 1], [60, 0]);
  const opacity = interpolate(currentFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) translateY(${translateY}px)`,
        width: "88%",
        maxWidth: "920px",
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: `0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px ${primaryColor}22`,
        borderRadius: "28px",
        padding: "36px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontFamily: brand.font,
        opacity,
        zIndex: 10,
      }}
    >
      {/* 5 Stars */}
      <div style={{ display: "flex", gap: "6px", color: "#F59E0B", fontSize: "24px" }}>
        {Array.from({ length: stars }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>

      {/* Quote */}
      <div
        style={{
          fontSize: "26px",
          fontWeight: 600,
          color: "#F8FAFC",
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
        }}
      >
        &ldquo;{quote}&rdquo;
      </div>

      {/* Author Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
        {avatarUrl ? (
          <Img
            src={avatarUrl}
            style={{ width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "22px",
              color: "#FFFFFF",
            }}
          >
            {author.charAt(0)}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF" }}>{author}</div>
          <div style={{ fontSize: "15px", color: "#94A3B8" }}>
            {role}{company ? ` • ${company}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

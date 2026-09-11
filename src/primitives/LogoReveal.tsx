import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, LogoRevealProps, resolveColor } from "../schema";

interface Props {
  props: LogoRevealProps;
  brand: Brand;
}

export const LogoReveal: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    logoUrl,
    brandName,
    tagline,
    size = 96,
    position = { x: 50, y: 45 },
    animation = "scale-in",
    delay = 0,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const primaryColor = resolveColor("brand.primary", brand);
  const textColor = resolveColor("brand.text", brand);
  const mutedColor = resolveColor("brand.muted", brand);

  const springConfig =
    animation === "bounce-in"
      ? { damping: 8, mass: 0.5, stiffness: 180 }
      : animation === "fade-glow"
      ? { damping: 18, mass: 0.9, stiffness: 90 }
      : { damping: 12, mass: 0.6, stiffness: 130 };

  const spr = spring({
    frame: currentFrame,
    fps,
    config: springConfig,
  });

  const scale =
    animation === "fade-glow"
      ? interpolate(spr, [0, 1], [0.85, 1])
      : animation === "bounce-in"
      ? interpolate(spr, [0, 1], [0.2, 1])
      : interpolate(spr, [0, 1], [0.4, 1]);

  const opacity = interpolate(currentFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const glowSpread =
    animation === "fade-glow"
      ? interpolate(currentFrame, [0, 15, 30], [20, 80, 45])
      : interpolate(currentFrame, [0, 15, 30], [10, 50, 30]);

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
        justifyContent: "center",
        gap: "18px",
        zIndex: 10,
      }}
    >
      {/* Glow orb behind logo */}
      <div
        style={{
          position: "absolute",
          width: `${size * 2}px`,
          height: `${size * 2}px`,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryColor}55 0%, transparent 70%)`,
          filter: `blur(${glowSpread}px)`,
          zIndex: -1,
        }}
      />

      {/* Logo Icon or Monogram */}
      {logoUrl ? (
        <Img
          src={logoUrl}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            objectFit: "contain",
            filter: `drop-shadow(0 10px 25px ${primaryColor}66)`,
          }}
        />
      ) : (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "26px",
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${resolveColor("brand.secondary", brand)} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 15px 35px ${primaryColor}55, inset 0 1px 1px rgba(255,255,255,0.4)`,
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <span
            style={{
              fontSize: `${size * 0.48}px`,
              fontWeight: 800,
              color: "#FFFFFF",
              fontFamily: brand.font,
            }}
          >
            {brandName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Brand Name */}
      <div
        style={{
          fontSize: `${size * 0.45}px`,
          fontWeight: 800,
          color: textColor,
          fontFamily: brand.font,
          letterSpacing: "-0.03em",
          textAlign: "center",
        }}
      >
        {brandName}
      </div>

      {/* Tagline */}
      {tagline && (
        <div
          style={{
            fontSize: `${size * 0.22}px`,
            fontWeight: 500,
            color: mutedColor,
            fontFamily: brand.font,
            letterSpacing: "-0.01em",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          {tagline}
        </div>
      )}
    </div>
  );
};

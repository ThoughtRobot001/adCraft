import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, CursorInteractionProps, resolveColor } from "../schema";

interface Props {
  props: CursorInteractionProps;
  brand: Brand;
}

export const CursorInteraction: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    from = { x: 25, y: 85 },
    to = { x: 50, y: 50 },
    clickAtFrame = 35,
    clickRipple = true,
    cursorType = "macos-arrow",
    agentTag,
    color = "#000000",
    delay = 0,
    durationFrames = 50,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const isLight = brand.theme === "editorial-light" || brand.colors?.background === "#F8F7F3" || brand.colors?.background === "#FFFFFF" || brand.colors?.background === "#F8FAFC";
  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);

  // Smooth cubic-bezier travel progress
  const travelProgress = interpolate(
    currentFrame,
    [0, clickAtFrame],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Smooth acceleration & deceleration (smooth human curve)
  const easedTravel = travelProgress < 0.5
    ? 2 * travelProgress * travelProgress
    : 1 - Math.pow(-2 * travelProgress + 2, 2) / 2;

  // Curvature arc for organic trajectory
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const arcHeight = Math.sin(travelProgress * Math.PI) * 4;

  const currentX = from.x + dx * easedTravel - (dy / 100) * arcHeight;
  const currentY = from.y + dy * easedTravel + (dx / 100) * arcHeight;

  // Refined click depression bounce
  const clickRelFrame = Math.max(0, currentFrame - clickAtFrame);
  const clickSpr = spring({
    frame: clickRelFrame,
    fps,
    config: { damping: 16, mass: 0.35, stiffness: 260 },
    from: 0.88,
    to: 1.0,
  });

  const cursorScale = currentFrame < clickAtFrame ? 1 : clickSpr;

  // Refined subtle haptic ripple ring (agency standard, non-neon)
  const rippleScale = interpolate(clickRelFrame, [0, 22], [0.5, 2.2], { extrapolateRight: "clamp" });
  const rippleOpacity = interpolate(clickRelFrame, [0, 18], [0.45, 0], { extrapolateRight: "clamp" });

  const isTouchMode = cursorType === "touch" || cursorType === "hand";
  const isAgentTag = cursorType === "agent-tag" || Boolean(agentTag);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      {/* Refined Haptic Click Ripple */}
      {clickRipple && currentFrame >= clickAtFrame && clickRelFrame <= 22 && (
        <div
          style={{
            position: "absolute",
            left: `${to.x}%`,
            top: `${to.y}%`,
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            transform: `translate(-50%, -50%) scale(${rippleScale})`,
            backgroundColor: isLight ? "rgba(15, 23, 42, 0.06)" : `${accentColor}25`,
            border: isLight ? "1.5px solid rgba(15, 23, 42, 0.25)" : `1.5px solid ${accentColor}88`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* Touch Disc Indicator (iOS Authentic Haptic) */}
      {isTouchMode ? (
        <div
          style={{
            position: "absolute",
            left: `${currentX}%`,
            top: `${currentY}%`,
            transform: "translate(-50%, -50%)",
            width: currentFrame >= clickAtFrame ? "42px" : "36px",
            height: currentFrame >= clickAtFrame ? "42px" : "36px",
            borderRadius: "50%",
            backgroundColor: isLight ? "rgba(15, 23, 42, 0.16)" : "rgba(255, 255, 255, 0.32)",
            backdropFilter: "blur(4px)",
            border: isLight ? "1px solid rgba(15, 23, 42, 0.2)" : "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            transition: "all 0.1s ease-out",
          }}
        />
      ) : (
        /* Precision macOS Vector Pointer & Multiplayer Agent Tag */
        <div
          style={{
            position: "absolute",
            left: `${currentX}%`,
            top: `${currentY}%`,
            transform: `scale(${cursorScale})`,
            transformOrigin: "top left",
            filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35))",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          {/* Authentic macOS Vector Arrow */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
              fill={color === "#FFFFFF" && isLight ? "#000000" : color}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          {/* Multiplayer / Collaborative Agent Tag (Figma / Linear agency style) */}
          {isAgentTag && (
            <div
              style={{
                marginLeft: "8px",
                marginTop: "16px",
                backgroundColor: primaryColor,
                color: "#FFFFFF",
                borderRadius: "6px",
                padding: "3px 8px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: brand.font,
                letterSpacing: "-0.01em",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "11px" }}>✦</span>
              <span>{agentTag || `${brand.name} AI`}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

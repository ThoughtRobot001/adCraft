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
    cursorType = "pointer",
    color = "#FFFFFF",
    delay = 0,
    durationFrames = 50,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);

  // Smooth travel progress (ease-in-out curve)
  const travelProgress = interpolate(
    currentFrame,
    [0, clickAtFrame],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  // Quadratic easing for organic human movement
  const easedTravel = travelProgress < 0.5
    ? 2 * travelProgress * travelProgress
    : 1 - Math.pow(-2 * travelProgress + 2, 2) / 2;

  // Compute slight curved arc in travel (control point perpendicular to trajectory)
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const arcHeight = Math.sin(travelProgress * Math.PI) * 5; // 5% curved trajectory

  const currentX = from.x + dx * easedTravel - (dy / 100) * arcHeight;
  const currentY = from.y + dy * easedTravel + (dx / 100) * arcHeight;

  // Click bounce spring
  const clickRelFrame = Math.max(0, currentFrame - clickAtFrame);
  const clickSpr = spring({
    frame: clickRelFrame,
    fps,
    config: { damping: 14, mass: 0.4, stiffness: 220 },
    from: 0.82,
    to: 1.0,
  });

  const cursorScale = currentFrame < clickAtFrame ? 1 : clickSpr;

  // Expanding ripple ring
  const rippleScale = interpolate(clickRelFrame, [0, 24], [0.3, 2.6], { extrapolateRight: "clamp" });
  const rippleOpacity = interpolate(clickRelFrame, [0, 20], [0.85, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      {/* Click Ripple Effect */}
      {clickRipple && currentFrame >= clickAtFrame && clickRelFrame <= 26 && (
        <div
          style={{
            position: "absolute",
            left: `${to.x}%`,
            top: `${to.y}%`,
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            transform: `translate(-50%, -50%) scale(${rippleScale})`,
            backgroundColor: `${accentColor}35`,
            border: `2px solid ${accentColor}`,
            boxShadow: `0 0 20px ${accentColor}`,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* Cursor Body */}
      <div
        style={{
          position: "absolute",
          left: `${currentX}%`,
          top: `${currentY}%`,
          transform: `scale(${cursorScale})`,
          transformOrigin: "top left",
          filter: "drop-shadow(0 6px 14px rgba(0, 0, 0, 0.6))",
        }}
      >
        {cursorType === "pointer" || cursorType === "arrow" ? (
          /* Sleek macOS Arrow Cursor */
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3L10.07 20.97L13.58 13.58L20.97 10.07L3 3Z"
              fill={color}
              stroke="#090D16"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          /* Mobile Touch Hand Pointer */
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 11V4C9 2.89543 9.89543 2 11 2C12.1046 2 13 2.89543 13 4V10M13 10V6C13 4.89543 13.8954 4 15 4C16.1046 4 17 4.89543 17 6V11M17 11V8C17 6.89543 17.8954 6 19 6C20.1046 6 21 6.89543 21 8V14C21 18.4183 17.4183 22 13 22C8.58172 22 5 18.4183 5 14V11.5C5 10.6716 5.67157 10 6.5 10C7.32843 10 8 10.6716 8 11.5V11"
              stroke="#090D16"
              strokeWidth="2.5"
              fill={color}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

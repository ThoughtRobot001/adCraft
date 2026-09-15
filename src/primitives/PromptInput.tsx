import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, PromptInputProps, resolveColor } from "../schema";

interface Props {
  props: PromptInputProps;
  brand: Brand;
}

export const PromptInput: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    promptText = "Review and draft high-liability indemnification clauses",
    placeholder = "Ask an agent anything...",
    position = { x: 50, y: 50 },
    width = 75,
    typewriterSpeed = 2,
    delay = 0,
    showSendButton = true,
    showMic = true,
    badge = "Agentic v2",
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const primaryColor = resolveColor("brand.primary", brand);
  const textColor = resolveColor("brand.text", brand);
  const mutedColor = resolveColor("brand.muted", brand);
  const isLight = brand.theme === "editorial-light" || brand.colors.background === "#F8F7F3" || brand.colors.background === "#FFFFFF";

  // Box entrance spring
  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 130 },
  });

  const translateY = interpolate(spr, [0, 1], [40, 0]);
  const scale = interpolate(spr, [0, 1], [0.92, 1]);
  const opacity = interpolate(currentFrame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Typewriter effect starts after 10 frames of entrance
  const typingStartFrame = 10;
  const typingProgress = Math.max(0, currentFrame - typingStartFrame);
  const charactersToShow = Math.min(
    promptText.length,
    Math.floor(typingProgress / Math.max(1, typewriterSpeed))
  );
  const displayedText = promptText.slice(0, charactersToShow);
  const isTypingDone = charactersToShow >= promptText.length;

  // Blinking caret (toggles every 15 frames)
  const showCaret = Math.floor(currentFrame / 15) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${width}%`,
        transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
        opacity,
        zIndex: 15,
      }}
    >
      <div
        style={{
          backgroundColor: isLight ? "rgba(255, 255, 255, 0.96)" : "rgba(17, 24, 39, 0.92)",
          border: isLight
            ? "1.5px solid rgba(0, 0, 0, 0.1)"
            : "1.5px solid rgba(255, 255, 255, 0.14)",
          borderRadius: "20px",
          padding: "18px 24px",
          boxShadow: isLight
            ? "0 20px 40px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)"
            : `0 25px 50px rgba(0, 0, 0, 0.6), 0 0 30px ${primaryColor}22`,
          backdropFilter: "blur(24px)",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Optional Badge / Icon */}
        {badge && (
          <div
            style={{
              padding: "5px 12px",
              borderRadius: "9999px",
              backgroundColor: `${primaryColor}22`,
              border: `1px solid ${primaryColor}44`,
              color: primaryColor,
              fontFamily: brand.font,
              fontSize: "13px",
              fontWeight: 600,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "12px" }}>✨</span>
            <span>{badge}</span>
          </div>
        )}

        {/* Input Text Area */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontFamily: brand.font,
              fontSize: "20px",
              fontWeight: 500,
              color: charactersToShow > 0
                ? (isLight ? "#0F172A" : textColor)
                : mutedColor,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {charactersToShow > 0 ? displayedText : placeholder}
          </span>
          {(!isTypingDone || showCaret) && (
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "22px",
                backgroundColor: primaryColor,
                marginLeft: "3px",
              }}
            />
          )}
        </div>

        {/* Right Action Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {showMic && (
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: mutedColor,
              }}
            >
              🎙️
            </div>
          )}

          {showSendButton && (
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: isTypingDone ? primaryColor : (isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.12)"),
                color: isTypingDone ? "#FFFFFF" : mutedColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 700,
                boxShadow: isTypingDone ? `0 6px 16px ${primaryColor}66` : "none",
                transition: "all 0.2s ease",
              }}
            >
              ↑
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AgentTaskCardProps, Brand, resolveColor } from "../schema";
import { getAsset } from "../asset-bank";

interface Props {
  props: AgentTaskCardProps;
  brand: Brand;
  cardStyleId?: string;
}

const DEFAULT_ITEMS = [
  { text: "Ingest vendor Master Services Agreement (MSA)", status: "completed" as const, tag: "100% Parsed" },
  { text: "Cross-reference DORA compliance risk parameters", status: "completed" as const, tag: "Compliant" },
  { text: "Draft revised liability clause and indemnification", status: "in-progress" as const, tag: "Review Needed" },
  { text: "Route to General Counsel for cryptographic sign-off", status: "pending" as const, tag: "Pending" },
];

export const AgentTaskCard: React.FC<Props> = ({ props, brand, cardStyleId: propCardStyleId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    title = "Autonomous Review Task",
    status = "Executing",
    actionText = "Review & Approve",
    items = DEFAULT_ITEMS,
    position = { x: 50, y: 52 },
    width = 76,
    tilt = true,
    rotateX = 9,
    rotateY = -7,
    delay = 0,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);
  const textColor = resolveColor("brand.text", brand);
  const mutedColor = resolveColor("brand.muted", brand);
  const isLight = brand.theme === "editorial-light" || brand.colors?.background === "#F8F7F3" || brand.colors?.background === "#FFFFFF" || brand.colors?.background === "#F8FAFC";

  // Resolve styling from Asset Bank
  const resolvedCardStyleId = (props as any).cardStyleId || propCardStyleId;
  const cardAsset = resolvedCardStyleId ? getAsset(resolvedCardStyleId) : undefined;
  const cardProps = cardAsset?.properties;
  const modeProps = isLight ? cardProps?.light : cardProps?.dark;

  // Card entrance spring
  const cardSpr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 15, mass: 0.7, stiffness: 120 },
  });

  const translateY = interpolate(cardSpr, [0, 1], [80, 0]);
  const scale = interpolate(cardSpr, [0, 1], [0.85, 1]);
  const opacity = interpolate(currentFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  // Floating continuous motion
  const floatY = Math.sin(currentFrame / 22) * 5;
  const dynamicRotateX = tilt ? rotateX + Math.sin(currentFrame / 25) * 1.5 : 0;
  const dynamicRotateY = tilt ? rotateY + Math.cos(currentFrame / 25) * 1.5 : 0;

  // Spinner rotation for in-progress tasks
  const spinAngle = (currentFrame * 12) % 360;

  const containerBg = modeProps?.backgroundColor || (isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 23, 42, 0.9)");
  const containerBorder = modeProps?.border || (isLight ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.14)");
  const containerRadius = cardProps?.borderRadius || "24px";
  const containerBlur = cardProps?.backdropFilter || "blur(28px)";
  const containerShadow = modeProps?.boxShadow || (isLight
    ? "0 30px 60px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.04)"
    : `0 35px 70px rgba(0, 0, 0, 0.6), 0 0 35px ${primaryColor}22`);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${width}%`,
        transform: `translate(-50%, -50%) perspective(1400px) rotateX(${dynamicRotateX}deg) rotateY(${dynamicRotateY}deg) translateY(${translateY + floatY}px) scale(${scale})`,
        transformStyle: "preserve-3d",
        opacity,
        zIndex: 10,
      }}
    >
      <div
        style={{
          backgroundColor: containerBg,
          border: containerBorder,
          borderRadius: containerRadius,
          padding: "32px 36px",
          boxShadow: containerShadow,
          backdropFilter: containerBlur,
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: isLight ? "1px solid rgba(0, 0, 0, 0.06)" : "1px solid rgba(255, 255, 255, 0.08)",
            paddingBottom: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: accentColor,
                boxShadow: `0 0 12px ${accentColor}`,
              }}
            />
            <span
              style={{
                fontFamily: brand.font,
                fontSize: "22px",
                fontWeight: 700,
                color: isLight ? "#0F172A" : textColor,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </span>
          </div>

          <div
            style={{
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: `${accentColor}22`,
              border: `1px solid ${accentColor}55`,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: accentColor,
              }}
            />
            <span
              style={{
                fontFamily: brand.font,
                fontSize: "14px",
                fontWeight: 600,
                color: accentColor,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Checklist Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {items.map((item, idx) => {
            const itemDelay = idx * 6 + 6;
            const itemFrame = Math.max(0, currentFrame - itemDelay);
            const isCompleted = item.status === "completed";
            const isInProgress = item.status === "in-progress";

            const itemSpr = spring({
              frame: itemFrame,
              fps,
              config: { damping: 14, mass: 0.5, stiffness: 140 },
            });

            const itemX = interpolate(itemSpr, [0, 1], [-20, 0]);
            const itemOpacity = interpolate(itemFrame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

            return (
              <div
                key={idx}
                style={{
                  transform: `translateX(${itemX}px)`,
                  opacity: itemOpacity,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  backgroundColor: isInProgress
                    ? (isLight ? "rgba(99, 102, 241, 0.06)" : "rgba(99, 102, 241, 0.12)")
                    : "transparent",
                  border: isInProgress
                    ? `1px solid ${primaryColor}44`
                    : "1px solid transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* Status Indicator */}
                  {isCompleted ? (
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: `${accentColor}22`,
                        border: `1.5px solid ${accentColor}`,
                        color: accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </div>
                  ) : isInProgress ? (
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: `2px solid ${primaryColor}33`,
                        borderTopColor: primaryColor,
                        transform: `rotate(${spinAngle}deg)`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: isLight ? "1.5px solid #CBD5E1" : "1.5px solid rgba(255, 255, 255, 0.2)",
                      }}
                    />
                  )}

                  <span
                    style={{
                      fontFamily: brand.font,
                      fontSize: "17px",
                      fontWeight: isInProgress ? 600 : 500,
                      color: isCompleted
                        ? (isLight ? "#64748B" : mutedColor)
                        : (isLight ? "#0F172A" : textColor),
                      textDecoration: isCompleted ? "line-through" : "none",
                    }}
                  >
                    {item.text}
                  </span>
                </div>

                {item.tag && (
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: brand.font,
                      backgroundColor: isInProgress
                        ? `${primaryColor}22`
                        : isCompleted
                        ? `${accentColor}18`
                        : isLight
                        ? "#F1F5F9"
                        : "rgba(255, 255, 255, 0.08)",
                      color: isInProgress
                        ? primaryColor
                        : isCompleted
                        ? accentColor
                        : mutedColor,
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {actionText && (
          <div
            style={{
              marginTop: "6px",
              padding: "16px 24px",
              borderRadius: "14px",
              backgroundColor: primaryColor,
              color: "#FFFFFF",
              fontFamily: brand.font,
              fontSize: "18px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: `0 10px 25px ${primaryColor}55`,
              cursor: "pointer",
            }}
          >
            <span>{actionText}</span>
            {!actionText.trim().endsWith("→") && !actionText.trim().endsWith("->") && (
              <span style={{ fontSize: "20px" }}>→</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, NotificationCascadeProps, resolveColor } from "../schema";
import { getAsset } from "../asset-bank";

interface Props {
  props: NotificationCascadeProps;
  brand: Brand;
  cardStyleId?: string;
}

const DEFAULT_ITEMS: NotificationCascadeProps["items"] = [
  {
    app: "slack" as const,
    sender: "#deal-desk",
    message: "Enterprise MSA draft updated for Goldman • Terms approved",
    tag: "Contract",
    time: "Just now",
    badgeColor: "#4A154B",
  },
  {
    app: "compliance" as const,
    sender: "DORA Compliance",
    message: "Risk management framework validated across all microservices",
    tag: "Audit Pass",
    time: "2m ago",
    badgeColor: "#10B981",
  },
  {
    app: "teams" as const,
    sender: "Procurement Ops",
    message: "PO #8849 approved by VP of Finance • Ready for execution",
    tag: "Approved",
    time: "5m ago",
    badgeColor: "#464EB8",
  },
  {
    app: "calendar" as const,
    sender: "Strategy Sync",
    message: "Board meeting review package automatically prepared",
    tag: "Calendar",
    time: "12m ago",
    badgeColor: "#F59E0B",
  },
];

export const NotificationCascade: React.FC<Props> = ({ props, brand, cardStyleId: propCardStyleId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    items = DEFAULT_ITEMS,
    position = { x: 50, y: 50 },
    width = 72,
    staggerFrames = 8,
    delay = 0,
    angle = -7,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);
  const textColor = resolveColor("brand.text", brand);
  const mutedColor = resolveColor("brand.muted", brand);
  const isLight =
    brand.theme === "editorial-light" ||
    brand.colors.background === "#F8F7F3" ||
    brand.colors.background === "#FFFFFF" ||
    brand.colors.background === "#F8FAFC";

  // Resolve styling from Asset Bank if cardStyleId is present
  const resolvedCardStyleId = (props as any).cardStyleId || propCardStyleId;
  const cardAsset = resolvedCardStyleId ? getAsset(resolvedCardStyleId) : undefined;
  const cardProps = cardAsset?.properties;
  const modeProps = isLight ? cardProps?.light : cardProps?.dark;

  // Staggered Entrance Spring
  const cascadeSpr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 120 },
  });

  const baseScale = interpolate(cascadeSpr, [0, 1], [0.82, 1]);
  const cascadeOpacity = interpolate(currentFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Dynamic 3D perspective & rotation
  const tiltRotateX = 8 + Math.sin(currentFrame / 30) * 1.5;
  const tiltRotateY = -6 + Math.cos(currentFrame / 35) * 1.5;

  const getAppIcon = (app: string) => {
    switch (app) {
      case "slack":
        return "💬";
      case "teams":
        return "👥";
      case "calendar":
        return "📅";
      case "compliance":
        return "🛡️";
      case "procurement":
        return "💳";
      case "email":
        return "✉️";
      default:
        return "⚡";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${width}%`,
        maxWidth: "960px",
        transform: `translate(-50%, -50%) perspective(1400px) rotateX(${tiltRotateX}deg) rotateY(${tiltRotateY}deg) rotateZ(${angle}deg) scale(${baseScale})`,
        transformStyle: "preserve-3d",
        opacity: cascadeOpacity,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        fontFamily: brand.font,
      }}
    >
      {items.map((item, index) => {
        const itemDelay = index * staggerFrames;
        const itemFrame = Math.max(0, currentFrame - itemDelay);
        if (currentFrame < itemDelay) return null;

        const spr = spring({
          frame: itemFrame,
          fps,
          config: { damping: 14, mass: 0.6, stiffness: 130 },
        });

        const translateY = interpolate(spr, [0, 1], [60, 0]);
        const translateX = interpolate(spr, [0, 1], [-30, 0]);
        const scale = interpolate(spr, [0, 1], [0.88, 1]);
        const opacity = interpolate(itemFrame, [0, 8], [0, 1], {
          extrapolateRight: "clamp",
        });

        // Continuous natural fluid floating drift across time
        const floatY = Math.sin((currentFrame + index * 16) / 22) * 6;
        const floatX = Math.cos((currentFrame + index * 14) / 26) * 4;
        const zDepth = index * 35; // True Z-layering for spatial parallax

        const itemBgColor = modeProps?.backgroundColor || (isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(17, 24, 39, 0.88)");
        const itemBorder = modeProps?.border || (isLight ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.12)");
        const itemRadius = cardProps?.borderRadius || "16px";
        const itemBlur = cardProps?.backdropFilter || "blur(28px)";
        const itemBoxShadow = modeProps?.boxShadow || (isLight
          ? `0 ${20 + index * 4}px ${45 + index * 8}px rgba(0, 0, 0, 0.08), 0 4px 14px rgba(0, 0, 0, 0.04)`
          : `0 ${24 + index * 6}px ${55 + index * 10}px rgba(0, 0, 0, 0.5), 0 0 24px rgba(99, 102, 241, 0.12)`);

        return (
          <div
            key={index}
            style={{
              transform: `translate3d(${translateX + floatX}px, ${translateY + floatY}px, ${zDepth}px) scale(${scale})`,
              opacity,
              backgroundColor: itemBgColor,
              border: itemBorder,
              borderRadius: itemRadius,
              padding: "16px 24px",
              boxShadow: itemBoxShadow,
              backdropFilter: itemBlur,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            {/* Left App Icon and Details */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: item.badgeColor ? `${item.badgeColor}22` : `${primaryColor}22`,
                  border: `1px solid ${item.badgeColor || primaryColor}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                {item.icon || getAppIcon(item.app)}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontFamily: brand.font,
                      fontSize: "17px",
                      fontWeight: 700,
                      color: isLight ? "#0F172A" : textColor,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.sender}
                  </span>
                  {item.time && (
                    <span
                      style={{
                        fontFamily: brand.font,
                        fontSize: "13px",
                        color: mutedColor,
                      }}
                    >
                      • {item.time}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: brand.font,
                    fontSize: "15px",
                    fontWeight: 500,
                    color: isLight ? "#475569" : "rgba(243, 244, 246, 0.8)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.message}
                </span>
              </div>
            </div>

            {/* Right Tag */}
            {item.tag && (
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  backgroundColor: item.badgeColor ? `${item.badgeColor}22` : `${primaryColor}22`,
                  border: `1px solid ${item.badgeColor || primaryColor}55`,
                  color: item.badgeColor || primaryColor,
                  fontFamily: brand.font,
                  fontSize: "13px",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {item.tag}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

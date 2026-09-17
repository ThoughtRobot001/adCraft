import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BentoGridProps, Brand, resolveColor } from "../schema";
import { DiffEditorMockup } from "./shadcn/DiffEditorMockup";
import { DataTableMockup } from "./shadcn/DataTableMockup";
import { getAsset } from "../asset-bank";

interface Props {
  props: BentoGridProps;
  brand: Brand;
  cardStyleId?: string;
}

export const BentoGrid: React.FC<Props> = ({ props, brand, cardStyleId: propCardStyleId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    title,
    subtitle,
    cards = [],
    position = { x: 50, y: 52 },
    width = 90,
    delay = 0,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const isLight = brand.theme === "editorial-light" || brand.colors.background === "#F8F7F3" || brand.colors.background === "#FFFFFF" || brand.colors.background === "#F8FAFC";
  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);

  // Asset Bank card style resolution
  const resolvedCardStyleId = (props as any).cardStyleId || propCardStyleId;
  const cardAsset = resolvedCardStyleId ? getAsset(resolvedCardStyleId) : undefined;
  const cardProps = cardAsset?.properties;
  const modeProps = isLight ? cardProps?.light : cardProps?.dark;

  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 16, mass: 0.7, stiffness: 100 },
  });

  const translateY = interpolate(spr, [0, 1], [30, 0]);
  const opacity = interpolate(currentFrame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });

  const cardBg = modeProps?.backgroundColor || (isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.85)");
  const cardBorder = modeProps?.border || (isLight ? "1px solid rgba(15, 23, 42, 0.08)" : "1px solid rgba(255, 255, 255, 0.12)");
  const cardShadow = modeProps?.boxShadow || (isLight
    ? "0 20px 45px -15px rgba(0, 0, 0, 0.06), 0 2px 10px rgba(0, 0, 0, 0.03)"
    : "0 25px 60px -10px rgba(0, 0, 0, 0.7)");
  const cardRadius = cardProps?.borderRadius || "20px";
  const cardBlur = cardProps?.backdropFilter || "none";

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) translateY(${translateY}px)`,
        width: `${width}%`,
        maxWidth: "1440px",
        opacity,
        zIndex: 10,
        fontFamily: brand.font,
      }}
    >
      {/* Optional Bento Header */}
      {title && (
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: 800,
              color: isLight ? "#0F172A" : "#FFFFFF",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: "6px 0 0 0", fontSize: "16px", color: isLight ? "#64748B" : "#94A3B8" }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Bento 3-Card Grid Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 0.9fr",
          gridTemplateRows: "1fr 1fr",
          gap: "20px",
          height: "480px",
        }}
      >
        {/* Card A: Hero UI / Diff / Data Table (Spans both rows on left) */}
        <div
          style={{
            gridRow: "span 2",
            backgroundColor: cardBg,
            border: cardBorder,
            borderRadius: cardRadius,
            boxShadow: cardShadow,
            backdropFilter: cardBlur,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Chrome Top Bar */}
          <div
            style={{
              height: "42px",
              backgroundColor: isLight ? "#F8FAFC" : "#1E293B",
              borderBottom: cardBorder,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: "8px",
            }}
          >
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#EF4444" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#F59E0B" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10B981" }} />
            <span
              style={{
                marginLeft: "12px",
                fontSize: "12px",
                fontWeight: 600,
                color: isLight ? "#64748B" : "#94A3B8",
              }}
            >
              🔒 {brand.name.toLowerCase()}.ai/workspace
            </span>
          </div>

          {/* Dynamic Hero Content */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {cards.length > 0 && cards[0].type !== "diff-preview" ? (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                {/* Candidate / Entity Header */}
                <div
                  style={{
                    padding: "20px 24px 14px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderBottom: isLight ? "1px solid rgba(15, 23, 42, 0.06)" : "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: "16px",
                        letterSpacing: "0.02em",
                        boxShadow: `0 0 20px ${primaryColor}44`,
                      }}
                    >
                      {cards[0].title
                        ? cards[0].title
                            .split(" ")
                            .filter((w) => /^[a-zA-Z]/.test(w))
                            .slice(0, 2)
                            .map((n) => n[0].toUpperCase())
                            .join("")
                        : "AI"}
                    </div>
                    <div>
                      <div style={{ fontSize: "17px", fontWeight: 700, color: isLight ? "#0F172A" : "#FFFFFF" }}>
                        {cards[0].title || "Candidate Signal Profile"}
                      </div>
                      <div style={{ fontSize: "12px", color: isLight ? "#64748B" : "#94A3B8", marginTop: "2px" }}>
                        {cards[0].subtitle || "Signal Stream • Fully Calibrated"}
                      </div>
                    </div>
                  </div>
                  {cards[0].badge && (
                    <div
                      style={{
                        padding: "5px 12px",
                        borderRadius: "20px",
                        backgroundColor: `${accentColor}20`,
                        border: `1px solid ${accentColor}50`,
                        color: accentColor,
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        boxShadow: `0 0 12px ${accentColor}25`,
                      }}
                    >
                      {cards[0].badge}
                    </div>
                  )}
                </div>

                {/* Candidate Key Signal Tags */}
                <div style={{ padding: "12px 24px 0 24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["Systems Architecture", "Distributed Consensus", "Staff Level"].map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: "6px",
                        backgroundColor: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)",
                        color: isLight ? "#475569" : "#CBD5E1",
                        border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Signal Highlights / Feed */}
                <div style={{ padding: "12px 24px 20px 24px", display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "center" }}>
                  {(cards[0].items || ["Zero Screening Delays", "Verified Track Record", "Instant Match"]).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 14px",
                        borderRadius: "10px",
                        backgroundColor: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.035)",
                        border: isLight ? "1px solid #E2E8F0" : "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cards[0].accentColor || primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: isLight ? "#1E293B" : "#F1F5F9" }}>
                          {item}
                        </span>
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#10B981" }}>
                        ✓ Signal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <DiffEditorMockup brand={brand} isLight={isLight} />
            )}
          </div>
        </div>

        {/* Card B: High-Impact Metric Punch Card (Top Right) */}
        {(() => {
          const cardB = cards.length > 1 ? cards[1] : null;
          return (
            <div
              style={{
                backgroundColor: cardBg,
                border: cardBorder,
                borderRadius: cardRadius,
                boxShadow: cardShadow,
                backdropFilter: cardBlur,
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: isLight ? "#64748B" : "#94A3B8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{cardB?.label || "AI MATCH RATE"}</span>
                <span style={{ color: cardB?.accentColor || primaryColor, fontSize: "14px", fontWeight: 700 }}>
                  {cardB?.tag ? `↗ ${cardB.tag}` : "↗ Top 0.1%"}
                </span>
              </div>
              <div
                style={{
                  fontSize: "58px",
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: cardB?.accentColor || (isLight ? "#0F172A" : "#FFFFFF"),
                  fontFamily: brand.theme === "editorial-light" && brand.serifFont ? brand.serifFont : brand.font,
                }}
              >
                {cardB?.value || "99.4%"}
              </div>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "13px",
                  color: isLight ? "#475569" : "#94A3B8",
                  lineHeight: 1.4,
                }}
              >
                {cardB?.subtitle || "Instant signal isolation across 480+ candidate pipeline applications."}
              </p>
            </div>
          );
        })()}

        {/* Card C: Live Audit & Trust Stream (Bottom Right) */}
        {(() => {
          const cardC = cards.length > 2 ? cards[2] : null;
          return (
            <div
              style={{
                backgroundColor: cardBg,
                border: cardBorder,
                borderRadius: cardRadius,
                boxShadow: cardShadow,
                backdropFilter: cardBlur,
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: isLight ? "#64748B" : "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {cardC?.title || "Autonomous Calibration"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(cardC?.items || [
                  "Direct Code & Architecture Calibration",
                  "Screening Friction Eliminated",
                ]).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor: isLight ? "#F8FAFC" : "rgba(255, 255, 255, 0.04)",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: isLight ? "#0F172A" : "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={cardC?.accentColor || primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      <span>{item}</span>
                    </span>
                    <span style={{ color: "#10B981", fontWeight: 700 }}>
                      ✓ Signal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

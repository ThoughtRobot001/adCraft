import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppWindowProps, Brand, resolveColor } from "../schema";
import { DataTableMockup } from "./shadcn/DataTableMockup";
import { DiffEditorMockup } from "./shadcn/DiffEditorMockup";
import { getAsset } from "../asset-bank";

interface Props {
  props: AppWindowProps;
  brand: Brand;
  deviceAssetId?: string;
  cardStyleId?: string;
}

export const AppWindow: React.FC<Props> = ({
  props,
  brand,
  deviceAssetId: propDeviceId,
  cardStyleId: propCardStyleId,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    title = "Dashboard",
    url = "app.product.io",
    screenshotUrl,
    mockType = "analytics",
    width = 86,
    position = { x: 50, y: 55 },
    tilt = true,
    shadow = true,
    delay = 0,
    animation = "float-up",
    badges = [],
    codeSnippet,
    customStats,
    chartTitle,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);
  const mutedColor = resolveColor("brand.muted", brand);

  const isLight =
    props.theme === "light" ||
    (props.theme === undefined &&
      (brand.theme === "editorial-light" ||
        brand.colors.background === "#F8F7F3" ||
        brand.colors.background === "#FFFFFF" ||
        brand.colors.background === "#F8FAFC"));

  // Asset Bank resolution
  const resolvedDeviceId = (props as any).deviceAssetId || propDeviceId;
  const deviceAsset = resolvedDeviceId ? getAsset(resolvedDeviceId) : undefined;
  const deviceProps = deviceAsset?.properties;

  const resolvedCardStyleId = (props as any).cardStyleId || propCardStyleId;
  const cardAsset = resolvedCardStyleId ? getAsset(resolvedCardStyleId) : undefined;
  const cardProps = cardAsset?.properties;
  const modeProps = isLight ? cardProps?.light : cardProps?.dark;

  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 15, mass: 0.8, stiffness: 90 },
  });

  // Entry animation based on animation prop
  let animTranslateX = 0;
  let animTranslateY = 0;
  let animScale = 1;

  if (animation === "slide-in-right") {
    animTranslateX = interpolate(spr, [0, 1], [140, 0]);
    animTranslateY = 0;
  } else if (animation === "zoom-focus") {
    animScale = interpolate(spr, [0, 1], [0.72, 1]);
    animTranslateY = interpolate(spr, [0, 1], [30, 0]);
  } else {
    // "float-up" default
    animTranslateY = interpolate(spr, [0, 1], [120, 0]);
  }

  const opacity = interpolate(currentFrame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtle floating oscillation after entry
  const baseTiltX = deviceProps?.tiltAngles?.rotateX ?? 6;
  const baseTiltY = deviceProps?.tiltAngles?.rotateY ?? -4;
  const floatOffset = Math.sin((currentFrame / fps) * 2) * 6;
  const tiltRotateX = tilt ? baseTiltX + Math.sin((currentFrame / fps) * 1.5) * 2 : 0;
  const tiltRotateY = tilt ? baseTiltY + Math.cos((currentFrame / fps) * 1.5) * 2 : 0;

  const windowBg = modeProps?.backgroundColor || (isLight ? "#FFFFFF" : "#0F172A");
  const chromeBg = isLight ? "#F1F5F9" : "#1E293B";
  const contentBg = isLight ? "#F8FAFC" : "#090D16";
  const borderColor = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.14)";
  const windowBorder = modeProps?.border || `1.5px solid ${borderColor}`;
  const windowRadius = deviceProps?.borderRadius || cardProps?.borderRadius || "24px";
  const headerHeight = deviceProps?.headerHeight || "56px";
  const windowBlur = cardProps?.backdropFilter || "none";
  const textColor = isLight ? "#0F172A" : "#FFFFFF";

  const windowShadow = shadow
    ? isLight
      ? deviceProps?.shadowLight || modeProps?.boxShadow || `0 35px 70px -15px rgba(0, 0, 0, 0.12), 0 0 40px ${primaryColor}15`
      : deviceProps?.shadowDark || modeProps?.boxShadow || `0 45px 90px -20px rgba(0, 0, 0, 0.8), 0 0 70px -10px ${primaryColor}44`
    : "none";

  const perspective = deviceProps?.perspective || "1200px";

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) perspective(${perspective}) rotateX(${tiltRotateX}deg) rotateY(${tiltRotateY}deg) translate(${animTranslateX}px, ${animTranslateY + floatOffset}px) scale(${animScale})`,
        width: `${width}%`,
        opacity,
        zIndex: 10,
      }}
    >
      {/* Floating Badges */}
      {badges.map((badge, idx) => {
        const badgeDelay = delay + 10 + idx * 6;
        const bFrame = Math.max(0, frame - badgeDelay);
        const bSpr = spring({
          frame: bFrame,
          fps,
          config: { damping: 12, mass: 0.5, stiffness: 140 },
        });
        if (frame < badgeDelay) return null;

        const isRight = badge.position.includes("right");
        const isTop = badge.position.includes("top");

        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              [isTop ? "top" : "bottom"]: "-28px",
              [isRight ? "right" : "left"]: "-20px",
              transform: `scale(${bSpr})`,
              backgroundColor: isLight ? "rgba(255, 255, 255, 0.95)" : "#1E293BEE",
              backdropFilter: "blur(16px)",
              border: isLight ? `1.5px solid ${primaryColor}66` : `2px solid ${primaryColor}aa`,
              borderRadius: "9999px",
              padding: "12px 26px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: isLight
                ? `0 14px 30px rgba(0,0,0,0.1), 0 0 20px ${primaryColor}33`
                : `0 16px 35px rgba(0,0,0,0.6), 0 0 25px ${primaryColor}55`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}`,
              }}
            />
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: isLight ? "#0F172A" : "#FFFFFF",
                fontFamily: brand.font,
                whiteSpace: "nowrap",
              }}
            >
              {badge.text}
            </span>
          </div>
        );
      })}

      {/* Main Window Container */}
      <div
        style={{
          borderRadius: windowRadius,
          overflow: "hidden",
          backgroundColor: windowBg,
          border: windowBorder,
          boxShadow: windowShadow,
          backdropFilter: windowBlur,
        }}
      >
        {/* Window Chrome / Titlebar */}
        <div
          style={{
            height: headerHeight,
            backgroundColor: chromeBg,
            display: "flex",
            alignItems: "center",
            padding: "0 22px",
            gap: "16px",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          {/* Traffic light dots */}
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#EF4444" }} />
            <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#F59E0B" }} />
            <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#10B981" }} />
          </div>

          {/* URL Pill */}
          <div
            style={{
              flex: 1,
              maxWidth: "340px",
              height: "34px",
              backgroundColor: isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(0, 0, 0, 0.4)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontSize: "15px",
              fontWeight: 500,
              color: isLight ? "#475569" : mutedColor,
              fontFamily: brand.font,
              padding: "0 14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            🔒 {url}
          </div>

          <div style={{ width: "50px" }} />
        </div>

        {/* Window Content */}
        <div style={{ position: "relative", minHeight: "440px", backgroundColor: contentBg }}>
          {screenshotUrl ? (
            <Img
              src={screenshotUrl}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          ) : mockType === "diff" ? (
            <DiffEditorMockup brand={brand} isLight={isLight} />
          ) : mockType === "table" ? (
            <DataTableMockup brand={brand} isLight={isLight} />
          ) : mockType === "code" ? (
            /* Sleek Code Mockup */
            <div style={{ padding: "30px", fontFamily: "Consolas, Menlo, Monaco, monospace", fontSize: "16px", lineHeight: "1.7" }}>
              {codeSnippet && codeSnippet.length > 0 ? (
                codeSnippet.map((line, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "16px", color: line.color || mutedColor, marginTop: line.badge ? "14px" : "0px" }}>
                    <span style={{ opacity: 0.4 }}>{(idx + 1).toString().padStart(2, "0")}</span>
                    {line.badge ? (
                      <span style={{ backgroundColor: `${accentColor}22`, border: `1px solid ${accentColor}55`, color: accentColor, padding: "4px 12px", borderRadius: "8px", fontWeight: 600, fontSize: "14px" }}>
                        {line.text}
                      </span>
                    ) : (
                      <span>{line.text}</span>
                    )}
                  </div>
                ))
              ) : (
                <>
                  <div style={{ display: "flex", gap: "16px", color: mutedColor }}>
                    <span style={{ opacity: 0.4 }}>01</span>
                    <span><span style={{ color: primaryColor }}>import</span> &#123; createClient &#125; <span style={{ color: primaryColor }}>from</span> <span style={{ color: accentColor }}>&apos;@{brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}/sdk&apos;</span>;</span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", color: mutedColor }}>
                    <span style={{ opacity: 0.4 }}>02</span>
                    <span style={{ color: isLight ? "#94A3B8" : "rgba(255,255,255,0.4)" }}>// Instant isolated execution</span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", color: mutedColor }}>
                    <span style={{ opacity: 0.4 }}>03</span>
                    <span><span style={{ color: primaryColor }}>const</span> client = <span style={{ color: primaryColor }}>await</span> createClient(&#123; latency: <span style={{ color: "#F59E0B" }}>&apos;zero&apos;</span> &#125;);</span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", color: mutedColor }}>
                    <span style={{ opacity: 0.4 }}>04</span>
                    <span><span style={{ color: primaryColor }}>const</span> result = <span style={{ color: primaryColor }}>await</span> client.<span style={{ color: accentColor }}>execute</span>();</span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", color: mutedColor, marginTop: "14px" }}>
                    <span style={{ opacity: 0.4 }}>05</span>
                    <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: `1px solid ${accentColor}55`, color: accentColor, padding: "4px 12px", borderRadius: "8px", fontWeight: 600, fontSize: "14px" }}>
                      ⚡ Sub-50ms execution confirmed
                    </span>
                  </div>
                </>
              )}
            </div>
          ) : mockType === "chat" ? (
            /* AI Chat Mockup */
            <div style={{ padding: "26px", display: "flex", flexDirection: "column", gap: "18px", fontFamily: brand.font }}>
              <div style={{ alignSelf: "flex-end", maxWidth: "80%", backgroundColor: isLight ? "rgba(99, 102, 241, 0.1)" : "rgba(255, 255, 255, 0.08)", borderRadius: "18px 18px 4px 18px", padding: "16px 20px", fontSize: "16px", color: textColor }}>
                Generate real-time analytics sync across 50 regional nodes.
              </div>
              <div style={{ alignSelf: "flex-start", maxWidth: "88%", backgroundColor: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.04)", border: `1px solid ${primaryColor}44`, borderRadius: "18px 18px 18px 4px", padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: primaryColor, fontWeight: 700, fontSize: "14px", marginBottom: "8px" }}>
                  <span>✦ {brand.name} Engine</span>
                  <span style={{ color: accentColor }}>• Executed in 12ms</span>
                </div>
                <div style={{ fontSize: "15px", color: isLight ? "#334155" : "#F8FAFC", lineHeight: "1.5" }}>
                  Configured edge replicas with automated conflict resolution. Replication lag is currently &lt; 2ms.
                </div>
              </div>
            </div>
          ) : mockType === "kanban-full" ? (
            /* Professional 4-Column Kanban Mockup (Video 8 Wordsmith Parity) */
            <div style={{ padding: "22px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", fontFamily: brand.font }}>
              {[
                {
                  title: "Triage / Backlog",
                  count: "4",
                  items: [
                    { title: "Review Master MSA", tag: "Contract", priority: "High", avatar: "JD" },
                    { title: "Vendor Risk Audit", tag: "DORA", priority: "Med", avatar: "SC" },
                  ],
                },
                {
                  title: "In Execution",
                  count: "2",
                  active: true,
                  items: [
                    { title: "Draft Liability Clause", tag: "Legal", priority: "Urgent", avatar: "AI" },
                    { title: "Escrow Verification", tag: "Finance", priority: "High", avatar: "KL" },
                  ],
                },
                {
                  title: "Needs Judgement",
                  count: "1",
                  items: [
                    { title: "Indemnification Cap", tag: "Approval", priority: "Critical", avatar: "GC" },
                  ],
                },
                {
                  title: "Approved / Done",
                  count: "12",
                  items: [
                    { title: "SOC2 Compliance Cert", tag: "Security", priority: "Done", avatar: "✓" },
                    { title: "Cryptographic Sign-off", tag: "Executive", priority: "Done", avatar: "✓" },
                  ],
                },
              ].map((col, ci) => (
                <div
                  key={ci}
                  style={{
                    backgroundColor: isLight ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.03)",
                    borderRadius: "14px",
                    padding: "14px",
                    border: col.active ? `1.5px solid ${primaryColor}55` : "1px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: isLight ? "#475569" : mutedColor, textTransform: "uppercase" }}>
                      {col.title}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 700, backgroundColor: isLight ? "#E2E8F0" : "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "10px", color: isLight ? "#1E293B" : "#FFF" }}>
                      {col.count}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {col.items.map((item, ii) => (
                      <div
                        key={ii}
                        style={{
                          backgroundColor: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.06)",
                          border: col.active && ii === 0 ? `1.5px solid ${primaryColor}` : isLight ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "10px",
                          padding: "12px",
                          boxShadow: isLight ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
                        }}
                      >
                        <div style={{ fontSize: "13px", color: textColor, fontWeight: 600, marginBottom: "8px" }}>
                          {item.title}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", fontWeight: 600, color: primaryColor, backgroundColor: `${primaryColor}15`, padding: "2px 8px", borderRadius: "6px" }}>
                            {item.tag}
                          </span>
                          <span style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: isLight ? "#E2E8F0" : "#334155", color: isLight ? "#0F172A" : "#FFF", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                            {item.avatar}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : mockType === "kanban" ? (
            /* Modern Kanban / Workflow Mockup */
            <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", fontFamily: brand.font }}>
              {[
                { title: "Incoming", items: ["Sync Postgres Cluster", "SSL Certificate"] },
                { title: "In Velocity", items: ["Auto-Rebalance Shards", "Migration #409"] },
                { title: "Completed", items: ["10k Replicas Active", "SOC2 Audit Log"] },
              ].map((col, ci) => (
                <div key={ci} style={{ backgroundColor: isLight ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.03)", borderRadius: "14px", padding: "14px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: isLight ? "#475569" : mutedColor, textTransform: "uppercase", marginBottom: "12px" }}>{col.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {col.items.map((item, ii) => (
                      <div key={ii} style={{ backgroundColor: isLight ? "#FFFFFF" : "rgba(255, 255, 255, 0.06)", border: ci === 1 ? `1px solid ${primaryColor}` : isLight ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "12px", fontSize: "13px", color: textColor, fontWeight: 500 }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* High-fidelity Vector Mockup (Analytics or Custom Stats) */
            <div style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "22px" }}>
              {/* Top Stats Bar */}
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, (customStats && customStats.length > 0 ? customStats.length : 3))}, 1fr)`, gap: "18px" }}>
                {(customStats && customStats.length > 0
                  ? customStats
                  : [
                      { label: "Cycle Velocity", val: "4.8x", change: "+48.2%", color: accentColor },
                      { label: "Execution Time", val: "12ms", change: "⚡ sub-50ms", color: primaryColor },
                      { label: "Reliability", val: "99.99%", change: "✓ Verified", color: "#F59E0B" },
                    ]
                ).map((st, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: isLight ? "rgba(15, 23, 42, 0.03)" : "rgba(255, 255, 255, 0.04)",
                      border: isLight ? "1px solid rgba(15, 23, 42, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "16px",
                      padding: "18px",
                    }}
                  >
                    <div style={{ fontSize: "14px", color: isLight ? "#64748B" : mutedColor, fontFamily: brand.font }}>{st.label}</div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: isLight ? "#0F172A" : "#FFFFFF", fontFamily: brand.font, marginTop: "6px" }}>
                      {st.val}
                    </div>
                    <div style={{ fontSize: "14px", color: st.color || primaryColor, fontWeight: 700, marginTop: "6px" }}>
                      {st.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Visual Graphic */}
              <div
                style={{
                  backgroundColor: isLight ? "rgba(15, 23, 42, 0.02)" : "rgba(255, 255, 255, 0.03)",
                  border: isLight ? "1px solid rgba(15, 23, 42, 0.08)" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "18px",
                  padding: "24px",
                  height: "230px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 600, color: isLight ? "#475569" : mutedColor, fontFamily: brand.font, marginBottom: "16px" }}>
                  {chartTitle || `${brand.name} Performance Profile`}
                </div>
                {/* SVG Curve */}
                <svg viewBox="0 0 500 100" style={{ width: "100%", height: "130px", overflow: "visible" }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={primaryColor} stopOpacity="0.45" />
                      <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 80 Q 75 40 150 60 T 300 20 T 420 30 T 500 10 L 500 100 L 0 100 Z"
                    fill="url(#chartGrad)"
                  />
                  <path
                    d="M 0 80 Q 75 40 150 60 T 300 20 T 420 30 T 500 10"
                    fill="none"
                    stroke={primaryColor}
                    strokeWidth="4"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

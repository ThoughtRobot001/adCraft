import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppWindowProps, Brand, resolveColor } from "../schema";

interface Props {
  props: AppWindowProps;
  brand: Brand;
}

export const AppWindow: React.FC<Props> = ({ props, brand }) => {
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
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);
  const mutedColor = resolveColor("brand.muted", brand);

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
  const floatOffset = Math.sin((currentFrame / fps) * 2) * 6;
  const tiltRotateX = tilt ? 6 + Math.sin((currentFrame / fps) * 1.5) * 2 : 0;
  const tiltRotateY = tilt ? -4 + Math.cos((currentFrame / fps) * 1.5) * 2 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) perspective(1200px) rotateX(${tiltRotateX}deg) rotateY(${tiltRotateY}deg) translate(${animTranslateX}px, ${animTranslateY + floatOffset}px) scale(${animScale})`,
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
              backgroundColor: "#1E293BEE",
              backdropFilter: "blur(16px)",
              border: `2px solid ${primaryColor}aa`,
              borderRadius: "9999px",
              padding: "12px 26px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: `0 16px 35px rgba(0,0,0,0.6), 0 0 25px ${primaryColor}55`,
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
                color: "#FFFFFF",
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
          borderRadius: "24px",
          overflow: "hidden",
          backgroundColor: "#0F172A",
          border: "1.5px solid rgba(255, 255, 255, 0.16)",
          boxShadow: shadow
            ? `0 45px 90px -20px rgba(0, 0, 0, 0.8), 0 0 70px -10px ${primaryColor}44`
            : "none",
        }}
      >
        {/* Window Chrome / Titlebar */}
        <div
          style={{
            height: "56px",
            backgroundColor: "#1E293B",
            display: "flex",
            alignItems: "center",
            padding: "0 22px",
            gap: "16px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
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
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontSize: "15px",
              fontWeight: 500,
              color: mutedColor,
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
        <div style={{ position: "relative", minHeight: "440px", backgroundColor: "#090D16" }}>
          {screenshotUrl ? (
            <Img
              src={screenshotUrl}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          ) : mockType === "code" ? (
            /* Sleek Code Mockup */
            <div style={{ padding: "30px", fontFamily: "Consolas, Menlo, Monaco, monospace", fontSize: "16px", lineHeight: "1.7" }}>
              <div style={{ display: "flex", gap: "16px", color: mutedColor }}>
                <span style={{ opacity: 0.4 }}>01</span>
                <span><span style={{ color: primaryColor }}>import</span> &#123; createClient &#125; <span style={{ color: primaryColor }}>from</span> <span style={{ color: accentColor }}>&apos;@{brand.name.toLowerCase()}/sdk&apos;</span>;</span>
              </div>
              <div style={{ display: "flex", gap: "16px", color: mutedColor }}>
                <span style={{ opacity: 0.4 }}>02</span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>// Instant isolated branch creation</span>
              </div>
              <div style={{ display: "flex", gap: "16px", color: mutedColor }}>
                <span style={{ opacity: 0.4 }}>03</span>
                <span><span style={{ color: primaryColor }}>const</span> client = <span style={{ color: primaryColor }}>await</span> createClient(&#123; autoscaling: <span style={{ color: "#F59E0B" }}>true</span> &#125;);</span>
              </div>
              <div style={{ display: "flex", gap: "16px", color: mutedColor }}>
                <span style={{ opacity: 0.4 }}>04</span>
                <span><span style={{ color: primaryColor }}>const</span> branch = <span style={{ color: primaryColor }}>await</span> client.<span style={{ color: accentColor }}>provision</span>(&apos;preview-pr-42&apos;);</span>
              </div>
              <div style={{ display: "flex", gap: "16px", color: mutedColor, marginTop: "14px" }}>
                <span style={{ opacity: 0.4 }}>05</span>
                <span style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", border: `1px solid ${accentColor}55`, color: accentColor, padding: "4px 12px", borderRadius: "8px", fontWeight: 600, fontSize: "14px" }}>
                  ⚡ Provisioned in 48ms • Zero cold start
                </span>
              </div>
            </div>
          ) : mockType === "chat" ? (
            /* AI Chat Mockup */
            <div style={{ padding: "26px", display: "flex", flexDirection: "column", gap: "18px", fontFamily: brand.font }}>
              <div style={{ alignSelf: "flex-end", maxWidth: "80%", backgroundColor: "rgba(255, 255, 255, 0.08)", borderRadius: "18px 18px 4px 18px", padding: "16px 20px", fontSize: "16px", color: "#FFFFFF" }}>
                Generate real-time analytics sync across 50 regional nodes.
              </div>
              <div style={{ alignSelf: "flex-start", maxWidth: "88%", backgroundColor: "rgba(255, 255, 255, 0.04)", border: `1px solid ${primaryColor}44`, borderRadius: "18px 18px 18px 4px", padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: primaryColor, fontWeight: 700, fontSize: "14px", marginBottom: "8px" }}>
                  <span>✦ {brand.name} Engine</span>
                  <span style={{ color: accentColor }}>• Executed in 12ms</span>
                </div>
                <div style={{ fontSize: "15px", color: "#F8FAFC", lineHeight: "1.5" }}>
                  Configured edge replicas with automated conflict resolution. Replication lag is currently &lt; 2ms.
                </div>
              </div>
            </div>
          ) : mockType === "kanban" ? (
            /* Modern Kanban / Workflow Mockup */
            <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", fontFamily: brand.font }}>
              {[
                { title: "Incoming", items: ["Sync Postgres Cluster", "SSL Certificate"] },
                { title: "In Velocity", items: ["Auto-Rebalance Shards", "Migration #409"] },
                { title: "Completed", items: ["10k Replicas Active", "SOC2 Audit Log"] },
              ].map((col, ci) => (
                <div key={ci} style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", borderRadius: "14px", padding: "14px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: mutedColor, textTransform: "uppercase", marginBottom: "12px" }}>{col.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {col.items.map((item, ii) => (
                      <div key={ii} style={{ backgroundColor: "rgba(255, 255, 255, 0.06)", border: ci === 1 ? `1px solid ${primaryColor}` : "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px", padding: "12px", fontSize: "13px", color: "#FFFFFF", fontWeight: 500 }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* High-fidelity Vector SaaS Mockup (Analytics Default) */
            <div style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "22px" }}>
              {/* Top Stats Bar */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
                {[
                  { label: "Active Pipelines", val: "1,429", change: "+24.8%", color: accentColor },
                  { label: "Conversion Rate", val: "68.4%", change: "+14.2%", color: primaryColor },
                  { label: "Efficiency Gain", val: "4.8x", change: "⚡ peak", color: "#F59E0B" },
                ].map((st, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "16px",
                      padding: "18px",
                    }}
                  >
                    <div style={{ fontSize: "14px", color: mutedColor, fontFamily: brand.font }}>{st.label}</div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#FFFFFF", fontFamily: brand.font, marginTop: "6px" }}>
                      {st.val}
                    </div>
                    <div style={{ fontSize: "14px", color: st.color, fontWeight: 700, marginTop: "6px" }}>
                      {st.change}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Visual Graphic */}
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "18px",
                  padding: "24px",
                  height: "230px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 600, color: mutedColor, fontFamily: brand.font, marginBottom: "16px" }}>
                  Autonomous Velocity Breakdown
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

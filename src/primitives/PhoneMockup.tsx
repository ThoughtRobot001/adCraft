import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, PhoneMockupProps, resolveColor } from "../schema";

interface Props {
  props: PhoneMockupProps;
  brand: Brand;
}

export const PhoneMockup: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    title = "Mobile App",
    theme = "dark",
    screenType = "wallet",
    screenshotUrl,
    headline,
    value,
    badges = [],
    position = { x: 50, y: 55 },
    width = 75,
    tilt = true,
    rotateY: targetRotateY = -10,
    rotateX: targetRotateX = 12,
    pedestal = false,
    delay = 0,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);
  const mutedColor = resolveColor("brand.muted", brand);

  // Damped spring entrance
  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 16, mass: 0.8, stiffness: 90 },
  });

  // Continuous subtle 3D floating oscillation
  const floatY = Math.sin(currentFrame / (fps * 0.75)) * 8;
  const floatX = Math.cos(currentFrame / (fps * 0.95)) * 4;

  const rotY = tilt ? interpolate(spr, [0, 1], [targetRotateY * 1.8, targetRotateY]) + floatX * 0.4 : 0;
  const rotX = tilt ? interpolate(spr, [0, 1], [targetRotateX * 1.5, targetRotateX]) + floatY * 0.2 : 0;
  const scale = interpolate(spr, [0, 1], [0.82, 1]);
  const opacity = interpolate(currentFrame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  // Moving specular glare
  const glareX = interpolate(rotY, [-20, 20], [-40, 140]);

  const isLight = theme === "light";
  const screenBg = isLight ? "#F8FAFC" : "#0A0E1A";
  const textColor = isLight ? "#0F172A" : "#F8FAFC";
  const cardBg = isLight ? "rgba(255, 255, 255, 0.85)" : "rgba(30, 41, 59, 0.75)";
  const cardBorder = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.12)";

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) translateY(${floatY}px)`,
        width: `${width}%`,
        maxWidth: "460px",
        perspective: 1400,
        zIndex: 15,
        opacity,
      }}
    >
      {/* 3D Phone Chassis */}
      <div
        style={{
          width: "100%",
          aspectRatio: "9 / 19",
          transformStyle: "preserve-3d",
          transform: `scale(${scale}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          borderRadius: "52px",
          backgroundColor: "#18181B",
          border: "4px solid #3F3F46",
          boxShadow: `
            0 35px 70px rgba(0, 0, 0, 0.7),
            0 12px 25px rgba(0, 0, 0, 0.4),
            inset 0 0 0 2px rgba(255, 255, 255, 0.15)
          `,
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Screen Display Area */}
        <div
          style={{
            flex: 1,
            borderRadius: "42px",
            overflow: "hidden",
            backgroundColor: screenBg,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            fontFamily: brand.font,
          }}
        >
          {/* Dynamic Island Pill */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "108px",
              height: "28px",
              backgroundColor: "#000000",
              borderRadius: "20px",
              zIndex: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "10px",
            }}
          >
            {/* Camera sensor glint */}
            <div
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                backgroundColor: "#0C1B33",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>

          {/* Status Bar Header */}
          <div
            style={{
              padding: "16px 24px 8px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: textColor,
              opacity: 0.8,
              zIndex: 35,
            }}
          >
            <span>9:41</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* Screen Body Content */}
          <div
            style={{
              flex: 1,
              padding: "16px 20px 24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              zIndex: 30,
              overflow: "hidden",
            }}
          >
            {screenshotUrl ? (
              <div style={{ width: "100%", height: "100%", borderRadius: "24px", overflow: "hidden" }}>
                <Img src={screenshotUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : screenType === "wallet" ? (
              <>
                {/* Fintech Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <div>
                    <div style={{ fontSize: "12px", color: mutedColor, fontWeight: 600, textTransform: "uppercase" }}>
                      {title}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: textColor }}>
                      {headline || "Yield Portfolio"}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: primaryColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "14px",
                      boxShadow: `0 0 15px ${primaryColor}66`,
                    }}
                  >
                    {brand.name.charAt(0)}
                  </div>
                </div>

                {/* Hero Balance Card */}
                <div
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: "24px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: mutedColor, fontWeight: 600 }}>Total Balance</span>
                  <div style={{ fontSize: "34px", fontWeight: 900, color: textColor, letterSpacing: "-0.03em" }}>
                    {value || "$27.38"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        backgroundColor: `${accentColor}25`,
                        color: accentColor,
                        padding: "3px 8px",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    >
                      ↗ +5.4% APY
                    </span>
                    <span style={{ fontSize: "11px", color: mutedColor }}>Daily compounding</span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
                  {["Deposit", "Withdraw", "Send"].map((action, i) => (
                    <div
                      key={action}
                      style={{
                        flex: 1,
                        backgroundColor: i === 0 ? primaryColor : cardBg,
                        color: i === 0 ? "#FFFFFF" : textColor,
                        border: `1px solid ${i === 0 ? "transparent" : cardBorder}`,
                        borderRadius: "16px",
                        padding: "10px 0",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        boxShadow: i === 0 ? `0 6px 16px ${primaryColor}55` : "none",
                      }}
                    >
                      {action}
                    </div>
                  ))}
                </div>

                {/* Activity Card */}
                <div
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: "20px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700 }}>
                    <span style={{ color: textColor }}>Latest Reward</span>
                    <span style={{ color: accentColor }}>Paid</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "10px",
                          backgroundColor: `${accentColor}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                        }}
                      >
                        ⚡
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: textColor }}>USDC Yield</div>
                        <div style={{ fontSize: "10px", color: mutedColor }}>One-tap deposit</div>
                      </div>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: textColor }}>+$27.38</span>
                  </div>
                </div>
              </>
            ) : screenType === "learning" ? (
              <>
                {/* Language / Gamified Screen */}
                <div style={{ marginTop: "10px" }}>
                  <div style={{ fontSize: "12px", color: mutedColor, fontWeight: 700 }}>DAILY QUEST</div>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: textColor }}>
                    {headline || "Learn New Language"}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: "22px",
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: textColor }}>⚡ Earn 100 XP</span>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: accentColor }}>80%</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "12px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "80%",
                        height: "100%",
                        backgroundColor: accentColor,
                        borderRadius: "999px",
                        boxShadow: `0 0 12px ${accentColor}`,
                      }}
                    />
                  </div>
                </div>

                {/* Course Pill */}
                <div
                  style={{
                    backgroundColor: primaryColor,
                    color: "#FFFFFF",
                    borderRadius: "20px",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    boxShadow: `0 8px 20px ${primaryColor}66`,
                  }}
                >
                  <div style={{ fontSize: "24px" }}>🇯🇵</div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 800 }}>Japanese</div>
                    <div style={{ fontSize: "11px", opacity: 0.9 }}>25.5M active learners</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Prompt / AI Screen */}
                <div style={{ marginTop: "12px" }}>
                  <div style={{ fontSize: "12px", color: mutedColor, fontWeight: 700 }}>AI PROMPT STUDIO</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: textColor }}>
                    {headline || brand.name}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: "22px",
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.5, color: textColor }}>
                    {value || "Build a high-performance application with automated scaling and instant branching."}
                  </p>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        backgroundColor: primaryColor,
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                      }}
                    >
                      ↑
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dynamic Specular Glass Glare */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `linear-gradient(120deg, transparent 25%, rgba(255, 255, 255, 0.16) ${glareX}%, transparent ${glareX + 28}%)`,
              zIndex: 45,
            }}
          />
        </div>
      </div>

      {/* Orbiting Category Pill Badges (Inspired by Kobolytics Video 6) */}
      {badges.map((badge, idx) => {
        const badgeDelay = idx * 4;
        const badgeFrame = Math.max(0, currentFrame - badgeDelay);
        const badgeSpr = spring({
          frame: badgeFrame,
          fps,
          config: { damping: 14, mass: 0.6, stiffness: 120 },
        });

        const orbitOffset = Math.sin((currentFrame + idx * 25) / 16) * 8;
        const isLeft = badge.position === "orbit-left" || idx % 2 === 0;

        return (
          <div
            key={idx}
            style={{
              position: "absolute",
              top: `${25 + idx * 24}%`,
              left: isLeft ? "-15%" : "auto",
              right: isLeft ? "auto" : "-15%",
              transform: `translateY(${orbitOffset}px) scale(${badgeSpr})`,
              backgroundColor: badge.color || (isLeft ? primaryColor : accentColor),
              color: "#FFFFFF",
              padding: "10px 18px",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: 800,
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.35)",
              border: "2px solid rgba(255, 255, 255, 0.25)",
              zIndex: 50,
            }}
          >
            {badge.icon && <span>{badge.icon}</span>}
            <span>{badge.text}</span>
          </div>
        );
      })}

      {/* Optional Pedestal Cylinder (Kobolytics Video 6 style) */}
      {pedestal && (
        <div
          style={{
            position: "absolute",
            bottom: "-35px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "70px",
            borderRadius: "50%",
            backgroundColor: `${primaryColor}40`,
            border: `2px solid ${primaryColor}80`,
            boxShadow: `0 0 50px ${primaryColor}88`,
            zIndex: 5,
          }}
        />
      )}
    </div>
  );
};

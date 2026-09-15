import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, resolveColor } from "../schema";

export interface DeviceFrameProps {
  deviceType?: "macbook-pro-16" | "iphone16-pro" | "ipad-pro" | "studio-browser";
  theme?: "light" | "dark";
  colorVariant?: "space-black" | "silver" | "natural-titanium" | "desert-titanium";
  title?: string;
  url?: string;
  width?: number; // percentage (e.g. 80)
  tilt?: boolean;
  rotateX?: number;
  rotateY?: number;
  shadow?: boolean;
  brand?: Brand;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceType = "macbook-pro-16",
  theme = "dark",
  colorVariant = "space-black",
  title = "Dashboard",
  url = "app.workspace.io",
  width = 85,
  tilt = false,
  rotateX = 6,
  rotateY = -6,
  shadow = true,
  brand,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isLight = theme === "light";
  const primaryColor = brand ? resolveColor("brand.primary", brand) : "#6366F1";

  // Dynamic floating tilt if enabled
  const dynamicTiltX = tilt ? rotateX + Math.sin((frame / fps) * 1.5) * 1.5 : 0;
  const dynamicTiltY = tilt ? rotateY + Math.cos((frame / fps) * 1.5) * 1.5 : 0;

  // 1. MacBook Pro 16"
  if (deviceType === "macbook-pro-16") {
    const isSpaceBlack = colorVariant === "space-black" || !isLight;
    const bodyBg = isSpaceBlack ? "#16171B" : "#D4D5D9";
    const bodyRim = isSpaceBlack ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.15)";
    const hingeBg = isSpaceBlack ? "#0B0C0E" : "#8A8B90";

    return (
      <div
        style={{
          width: `${width}%`,
          maxWidth: "1400px",
          margin: "0 auto",
          perspective: "1400px",
          transform: `rotateX(${dynamicTiltX}deg) rotateY(${dynamicTiltY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Screen Bezel (Aluminum Lid) */}
        <div
          style={{
            backgroundColor: bodyBg,
            border: bodyRim,
            borderRadius: "22px 22px 0 0",
            padding: "16px 16px 0 16px",
            boxShadow: shadow
              ? isLight
                ? "0 35px 80px rgba(0, 0, 0, 0.14), 0 10px 25px rgba(0, 0, 0, 0.05)"
                : "0 45px 95px rgba(0, 0, 0, 0.75), 0 15px 35px rgba(0, 0, 0, 0.5)"
              : "none",
            position: "relative",
          }}
        >
          {/* Inner Display Area (Liquid Retina XDR) */}
          <div
            style={{
              position: "relative",
              backgroundColor: isLight ? "#FFFFFF" : "#090D16",
              borderRadius: "14px 14px 0 0",
              overflow: "hidden",
              border: "1px solid rgba(0, 0, 0, 0.5)",
              aspectRatio: "16 / 10",
            }}
          >
            {/* Authentic Display Camera Notch */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "140px",
                height: "24px",
                backgroundColor: bodyBg,
                borderRadius: "0 0 10px 10px",
                zIndex: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {/* Camera Lens */}
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#030406",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              />
              {/* TrueTone / Green Indicator */}
              <div
                style={{
                  width: "3px",
                  height: "3px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  boxShadow: "0 0 6px #10B981",
                }}
              />
            </div>

            {/* Screen Viewport Content */}
            <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
              {children}
            </div>

            {/* Subtle Glass Reflection Ray */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%)",
                pointerEvents: "none",
                zIndex: 35,
              }}
            />
          </div>
        </div>

        {/* MacBook Bottom Base & Keyboard Hinge */}
        <div
          style={{
            height: "14px",
            backgroundColor: bodyBg,
            border: bodyRim,
            borderRadius: "0 0 16px 16px",
            position: "relative",
            boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
          }}
        >
          {/* Thumb Opening Indentation */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "120px",
              height: "5px",
              backgroundColor: hingeBg,
              borderRadius: "0 0 6px 6px",
            }}
          />
        </div>
      </div>
    );
  }

  // 2. iPhone 16 Pro (Titanium)
  if (deviceType === "iphone16-pro") {
    const isDesert = colorVariant === "desert-titanium";
    const titaniumRim = isDesert
      ? "linear-gradient(135deg, #D4B69B 0%, #A68A72 100%)"
      : "linear-gradient(135deg, #717277 0%, #48494E 100%)";

    return (
      <div
        style={{
          width: `${width}%`,
          maxWidth: "480px",
          margin: "0 auto",
          perspective: "1400px",
          transform: `rotateX(${dynamicTiltX}deg) rotateY(${dynamicTiltY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Brushed Titanium Outer Chassis */}
        <div
          style={{
            background: titaniumRim,
            borderRadius: "56px",
            padding: "8px",
            boxShadow: shadow
              ? isLight
                ? "0 30px 70px rgba(0, 0, 0, 0.16), 0 8px 24px rgba(0, 0, 0, 0.06)"
                : `0 40px 85px rgba(0, 0, 0, 0.8), 0 0 40px ${primaryColor}22`
              : "none",
            border: "1px solid rgba(255, 255, 255, 0.22)",
          }}
        >
          {/* Razor-Thin Black Inner Bezel */}
          <div
            style={{
              backgroundColor: "#000000",
              borderRadius: "48px",
              padding: "4px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Screen Display Area (OLED Super Retina XDR) */}
            <div
              style={{
                position: "relative",
                backgroundColor: isLight ? "#F8FAFC" : "#090D16",
                borderRadius: "44px",
                overflow: "hidden",
                aspectRatio: "9 / 19.5",
              }}
            >
              {/* Interactive Dynamic Island */}
              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "115px",
                  height: "32px",
                  backgroundColor: "#000000",
                  borderRadius: "20px",
                  zIndex: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 10px",
                  boxShadow: "0 0 8px rgba(0,0,0,0.8)",
                }}
              >
                <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#064E3B" }} />
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#0B1528" }} />
              </div>

              {/* Viewport Content */}
              <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                {children}
              </div>

              {/* Home Indicator Bar */}
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "135px",
                  height: "4px",
                  backgroundColor: isLight ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
                  borderRadius: "2px",
                  zIndex: 40,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. iPad Pro M4
  if (deviceType === "ipad-pro") {
    return (
      <div
        style={{
          width: `${width}%`,
          maxWidth: "960px",
          margin: "0 auto",
          perspective: "1400px",
          transform: `rotateX(${dynamicTiltX}deg) rotateY(${dynamicTiltY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            backgroundColor: isLight ? "#E2E8F0" : "#1E222B",
            borderRadius: "36px",
            padding: "12px",
            boxShadow: shadow
              ? "0 35px 80px rgba(0, 0, 0, 0.6), 0 10px 25px rgba(0, 0, 0, 0.3)"
              : "none",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div
            style={{
              position: "relative",
              backgroundColor: isLight ? "#FFFFFF" : "#090D16",
              borderRadius: "26px",
              overflow: "hidden",
              aspectRatio: "4 / 3",
            }}
          >
            {/* Viewport Content */}
            <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Default: Studio Safari Browser Window (macOS Sequoia)
  const windowBg = isLight ? "#FFFFFF" : "#0F172A";
  const chromeBg = isLight ? "rgba(241, 245, 249, 0.95)" : "rgba(30, 41, 59, 0.95)";
  const borderColor = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.14)";
  const pillBg = isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.75)";

  return (
    <div
      style={{
        width: `${width}%`,
        maxWidth: "1400px",
        margin: "0 auto",
        perspective: "1400px",
        transform: `rotateX(${dynamicTiltX}deg) rotateY(${dynamicTiltY}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{
          borderRadius: "18px",
          overflow: "hidden",
          backgroundColor: windowBg,
          border: `1px solid ${borderColor}`,
          boxShadow: shadow
            ? isLight
              ? "0 35px 70px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.04)"
              : "0 40px 90px rgba(0, 0, 0, 0.7), 0 12px 30px rgba(0, 0, 0, 0.3)"
            : "none",
        }}
      >
        {/* macOS Sequoia Studio Chrome */}
        <div
          style={{
            height: "48px",
            backgroundColor: chromeBg,
            backdropFilter: "blur(24px)",
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            gap: "14px",
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          {/* Traffic Lights */}
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#EF4444" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#F59E0B" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#10B981" }} />
          </div>

          {/* Centered URL Pill */}
          <div
            style={{
              flex: 1,
              maxWidth: "480px",
              margin: "0 auto",
              height: "30px",
              backgroundColor: pillBg,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              border: `1px solid ${borderColor}`,
              fontSize: "12px",
              color: isLight ? "#64748B" : "#94A3B8",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <span>🔒</span>
            <span style={{ fontWeight: 600 }}>{url}</span>
          </div>
        </div>

        {/* Viewport Content */}
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

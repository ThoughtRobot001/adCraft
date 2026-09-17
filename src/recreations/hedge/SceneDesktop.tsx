import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile, Img, Easing } from "remotion";

export const SceneDesktop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance of desktop scene (local 0 - 20)
  const sceneEnterOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const desktopScale = interpolate(
    spring({ fps, frame, config: { damping: 14, stiffness: 100 } }),
    [0, 1],
    [0.92, 1]
  );

  // Text swap: "Trade the event" -> "Not the outcome" (around frame 55)
  const isAfterClick = frame >= 55;
  const headline1Opacity = interpolate(frame, [0, 8, 48, 55], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headline2Opacity = interpolate(frame, [55, 63, 175, 185], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Desktop blur and dim when modal appears
  const appDim = interpolate(frame, [55, 68], [1, 0.35], { extrapolateRight: "clamp" });
  const appBlur = interpolate(frame, [55, 68], [0, 5], { extrapolateRight: "clamp" });

  // Cursor animation: drags slider then clicks button (local 10 - 55)
  const cursorX = interpolate(frame, [10, 25, 42, 53], [1650, 1465, 1500, 1520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [10, 25, 42, 53], [850, 720, 720, 875], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorOpacity = interpolate(frame, [8, 15, 54, 60], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorScale = interpolate(frame, [51, 54, 58], [1, 0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Modal entrance (local 56 - 72)
  const modalSpring = spring({ fps, frame: frame - 56, config: { damping: 13, stiffness: 130 } });
  const modalScale = interpolate(modalSpring, [0, 1], [0.85, 1]);
  const modalOpacity = interpolate(frame, [56, 64], [0, 1], { extrapolateRight: "clamp" });

  // Circular progress (local 60 - 110: 0% -> 95%)
  const isOrderPlaced = frame >= 115;
  const progressPercent = Math.min(
    95,
    Math.floor(interpolate(frame, [60, 110], [0, 95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
  );
  const strokeDashoffset = interpolate(progressPercent, [0, 100], [440, 0]);

  // Scene exit fade (local 175 - 195)
  const sceneExitOpacity = interpolate(frame, [178, 195], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A0A0C",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "60px",
        opacity: sceneEnterOpacity * sceneExitOpacity,
        overflow: "hidden",
      }}
    >
      {/* Dynamic Headline: "Trade the event" -> "Not the outcome" */}
      <div style={{ position: "relative", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {!isAfterClick && (
          <div
            style={{
              position: "absolute",
              fontSize: "96px",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
              opacity: headline1Opacity,
              whiteSpace: "nowrap",
            }}
          >
            Trade the event
          </div>
        )}
        {isAfterClick && (
          <div
            style={{
              position: "absolute",
              fontSize: "96px",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.04em",
              opacity: headline2Opacity,
              whiteSpace: "nowrap",
            }}
          >
            Not the outcome
          </div>
        )}
      </div>

      {/* Main Desktop Browser Frame Container */}
      <div
        style={{
          position: "relative",
          width: "1720px",
          height: "800px",
          transform: `scale(${desktopScale})`,
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(226, 254, 82, 0.22), 0 30px 80px rgba(0,0,0,0.85)",
          border: "1.5px solid rgba(226, 254, 82, 0.38)",
          marginTop: "20px",
        }}
      >
        {/* Authentic Desktop Interface Plate */}
        <div
          style={{
            width: "100%",
            height: "100%",
            opacity: appDim,
            filter: `blur(${appBlur}px)`,
            transition: "opacity 0.2s, filter 0.2s",
          }}
        >
          <Img
            src={staticFile("assets/hedge/desktop_app.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Interactive Pointer Cursor */}
        <div
          style={{
            position: "absolute",
            left: `${cursorX - 100}px`,
            top: `${cursorY - 270}px`,
            opacity: cursorOpacity,
            transform: `scale(${cursorScale})`,
            pointerEvents: "none",
            zIndex: 90,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
          }}
        >
          {/* Authentic Hand / Pointer Icon */}
          <svg width="28" height="32" viewBox="0 0 24 28" fill="none">
            <path
              d="M3 2L11 22L14.5 14.5L22 11L3 2Z"
              fill="white"
              stroke="#111"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Circular Buying Progress / Order Placed Modal */}
        {frame >= 56 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 100,
            }}
          >
            <div
              style={{
                width: "440px",
                backgroundColor: "#1C1C1E",
                borderRadius: "32px",
                border: "1.5px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 40px 90px rgba(0,0,0,0.9)",
                padding: "44px 36px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                transform: `scale(${modalScale})`,
                opacity: modalOpacity,
              }}
            >
              {!isOrderPlaced ? (
                <>
                  {/* Progress Ring */}
                  <div
                    style={{
                      position: "relative",
                      width: "160px",
                      height: "160px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                      {/* Background Ring */}
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#2C2C2E" strokeWidth="12" />
                      {/* Animated Yellow Meter */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="#FFE600"
                        strokeWidth="12"
                        strokeDasharray="440"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ color: "#FFFFFF", fontSize: "38px", fontWeight: 700, letterSpacing: "-0.03em" }}>
                      {progressPercent}%
                    </div>
                  </div>

                  {/* Buying status */}
                  <div style={{ color: "#FFFFFF", fontSize: "28px", fontWeight: 600, marginTop: "8px" }}>
                    Buying
                  </div>
                  <div style={{ color: "#8E8E93", fontSize: "22px", fontWeight: 500 }}>
                    $4.54
                  </div>
                </>
              ) : (
                <>
                  {/* Success Green Checkmark Badge */}
                  <div
                    style={{
                      width: "110px",
                      height: "110px",
                      backgroundColor: "#2ECC71",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#FFFFFF",
                      fontSize: "52px",
                      boxShadow: "0 10px 30px rgba(46, 204, 113, 0.4)",
                    }}
                  >
                    ✓
                  </div>

                  {/* Order Placed Details */}
                  <div style={{ color: "#FFFFFF", fontSize: "32px", fontWeight: 700, marginTop: "4px" }}>
                    Order placed
                  </div>
                  <div style={{ color: "#8E8E93", fontSize: "22px", fontWeight: 500 }}>
                    $4.54
                  </div>

                  {/* Done Button */}
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#FFE600",
                      color: "#000000",
                      padding: "18px",
                      borderRadius: "100px",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "22px",
                      marginTop: "12px",
                      boxShadow: "0 8px 24px rgba(255, 230, 0, 0.3)",
                    }}
                  >
                    Done
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface KylianCheckinWidgetProps {
  checkinClickFrame?: number;
  opacity?: number;
}

export const KylianCheckinWidget: React.FC<KylianCheckinWidgetProps> = ({
  checkinClickFrame = 70,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isCheckedIn = frame >= checkinClickFrame;
  const clickRel = Math.max(0, frame - checkinClickFrame);

  // Button spring compression on click
  const buttonScale =
    frame >= checkinClickFrame && clickRel < 12
      ? spring({
          frame: clickRel,
          fps,
          config: { damping: 14, mass: 0.3, stiffness: 300 },
          from: 0.92,
          to: 1.0,
        })
      : 1.0;

  // Live timer calculation (starts after checkin click)
  const elapsedSeconds = isCheckedIn ? Math.floor((frame - checkinClickFrame) / 10) : 0;
  const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
  const timerText = `${hours}:${minutes}:${seconds}`;

  // Pulse animation for checked-in status indicator
  const pulseOpacity = isCheckedIn
    ? 0.5 + 0.5 * Math.sin((frame - checkinClickFrame) * 0.25)
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: 114,
        left: 258,
        width: 1420,
        height: 60,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        zIndex: 25,
        opacity,
      }}
    >
      {/* Left side: Checkin Button + Live Timer */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Checkin Action Button */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            height: "40px",
            padding: "0 18px",
            borderRadius: "6px",
            backgroundColor: isCheckedIn ? "#16A34A" : "#C90A0A",
            color: "#FCFCFC",
            fontSize: "14px",
            fontWeight: 600,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            transform: `scale(${buttonScale})`,
            transformOrigin: "center center",
            boxShadow: isCheckedIn
              ? "0 2px 8px rgba(22, 163, 74, 0.25)"
              : "0 2px 8px rgba(201, 10, 10, 0.25)",
            transition: "background-color 0.2s ease",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {/* Alarm Clock Check Icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            style={{ display: "block" }}
          >
            <path
              d="M9.54 13.53L7.41 11.4L6.35 12.46L9.53 15.64L15.53 9.64L14.47 8.58L9.54 13.53ZM11 19C9.143 19 7.363 18.263 6.05 16.95C4.737 15.637 4 13.857 4 12C4 10.144 4.737 8.363 6.05 7.051C7.363 5.738 9.143 5 11 5C12.857 5 14.637 5.738 15.95 7.051C17.263 8.363 18 10.144 18 12C18 13.857 17.263 15.637 15.95 16.95C14.637 18.263 12.857 19 11 19ZM11 3C8.613 3 6.324 3.949 4.636 5.636C2.948 7.324 2 9.613 2 12C2 14.387 2.948 16.676 4.636 18.364C6.324 20.052 8.613 21 11 21C13.387 21 15.676 20.052 17.364 18.364C19.052 16.676 20 14.387 20 12C20 9.613 19.052 7.324 17.364 5.636C15.676 3.949 13.387 3 11 3ZM6.88 2.39L5.6 0.86L1 4.71L2.29 6.24L6.88 2.39ZM21 4.72L16.4 0.86L15.11 2.39L19.71 6.25L21 4.72Z"
              fill="white"
            />
          </svg>
          <span>{isCheckedIn ? "Checked In" : "Checkin"}</span>
          {isCheckedIn && (
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                opacity: pulseOpacity,
                marginLeft: "2px",
              }}
            />
          )}
        </div>

        {/* Live Timer Display */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "5px",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <span
            style={{
              color: isCheckedIn ? "#006699" : "#00002B",
              fontSize: "17px",
              fontWeight: 700,
              letterSpacing: "0.8px",
              fontVariantNumeric: "tabular-nums",
              transition: "color 0.3s ease",
            }}
          >
            {timerText}
          </span>
          <span
            style={{
              color: "#64748B",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Hrs
          </span>
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Refresh Icon */}
        <div
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748B",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
              fill="#64748B"
            />
          </svg>
        </div>

        {/* All Leave Button */}
        <div
          style={{
            height: "32px",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "7.5px",
            border: "1px solid #006699",
            color: "#006699",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          All Leave
        </div>

        {/* Log History Button */}
        <div
          style={{
            height: "32px",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "7.5px",
            border: "1px solid #006699",
            color: "#006699",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            backgroundColor: "transparent",
            cursor: "pointer",
          }}
        >
          Log History
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface PayrollCompletedModalProps {
  appearFrame?: number; // default 135
}

export const PayrollCompletedModal: React.FC<PayrollCompletedModalProps> = ({
  appearFrame = 135,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < appearFrame) return null;

  const relFrame = frame - appearFrame;

  // Backdrop fade-in
  const backdropOpacity = interpolate(relFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Modal card spring entrance
  const modalSpring = spring({
    frame: relFrame,
    fps,
    config: { damping: 15, mass: 0.5, stiffness: 180 },
    from: 0,
    to: 1,
  });

  const modalScale = interpolate(modalSpring, [0, 1], [0.86, 1.0]);
  const modalOpacity = interpolate(modalSpring, [0, 1], [0, 1]);
  const modalY = interpolate(modalSpring, [0, 1], [24, 0]);

  // Checkmark spring
  const checkSpring = spring({
    frame: Math.max(0, relFrame - 6),
    fps,
    config: { damping: 12, mass: 0.4, stiffness: 220 },
    from: 0,
    to: 1,
  });

  // Success halo pulse
  const pulseScale = interpolate(relFrame, [10, 45], [1, 1.4], {
    extrapolateRight: "clamp",
  });
  const pulseOpacity = interpolate(relFrame, [10, 45], [0.6, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {/* Backdrop overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 16, 38, 0.48)",
          backdropFilter: "blur(7px)",
          WebkitBackdropFilter: "blur(7px)",
          opacity: backdropOpacity,
        }}
      />

      {/* Modal Dialog Card */}
      <div
        style={{
          position: "relative",
          width: "490px",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          padding: "36px 32px 30px",
          boxShadow:
            "0 25px 60px -12px rgba(0, 16, 38, 0.35), 0 0 1px 1px rgba(0, 16, 38, 0.08)",
          transform: `translateY(${modalY}px) scale(${modalScale})`,
          opacity: modalOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          zIndex: 85,
        }}
      >
        {/* Success Icon with Halo Pulse */}
        <div
          style={{
            position: "relative",
            width: "76px",
            height: "76px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Animated pulse ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              transform: `scale(${pulseScale})`,
              opacity: pulseOpacity,
            }}
          />

          {/* Success Badge */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
              border: "2px solid #A7F3D0",
              boxShadow: "0 8px 20px -4px rgba(16, 185, 129, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${checkSpring})`,
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#059669"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Modal Title */}
        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "26px",
            fontWeight: 700,
            color: "#001026",
            letterSpacing: "-0.025em",
          }}
        >
          Payroll completed
        </h2>

        {/* Subtitle */}
        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "14.5px",
            color: "#64748B",
            lineHeight: 1.55,
            maxWidth: "380px",
          }}
        >
          Monthly payroll for 4 employees has been processed successfully and
          scheduled for disbursement.
        </p>

        {/* Detail Summary Panel (Clean SaaS Card) */}
        <div
          style={{
            width: "100%",
            backgroundColor: "#F8FAFC",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#94A3B8",
                marginBottom: "3px",
              }}
            >
              Total Disbursed
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#001026",
              }}
            >
              ₦1,420,000
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "28px",
              backgroundColor: "#E2E8F0",
            }}
          />

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#94A3B8",
                marginBottom: "3px",
              }}
            >
              Recipients
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#001026",
              }}
            >
              4 / 4 Active
            </div>
          </div>

          <div
            style={{
              width: "1px",
              height: "28px",
              backgroundColor: "#E2E8F0",
            }}
          />

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#94A3B8",
                marginBottom: "3px",
              }}
            >
              Status
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "5px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                }}
              />
              Processed
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          style={{
            width: "100%",
            height: "46px",
            backgroundColor: "#00568E",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0, 86, 142, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            letterSpacing: "-0.01em",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

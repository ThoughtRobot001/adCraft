import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MotionCurves, interpolateWithCurve } from "../../utils/motion-curves";

export const SceneText: React.FC = () => {
  const frame = useCurrentFrame();

  // Part 1: "Prediction markets capped you at 1x" (local frames 0 - 64)
  const p1Opacity =
    frame < 56
      ? interpolateWithCurve(frame, 6, 16, 0, 1, MotionCurves.punch)
      : interpolateWithCurve(frame, 56, 64, 1, 0, MotionCurves.snappy);
  const p1Scale = interpolateWithCurve(frame, 6, 56, 0.96, 1.02, MotionCurves.snappy);

  // Part 2: "We unlocked the rest." (local frames 64 - 104)
  const p2Opacity =
    frame < 96
      ? interpolateWithCurve(frame, 64, 72, 0, 1, MotionCurves.punch)
      : interpolateWithCurve(frame, 96, 104, 1, 0, MotionCurves.snappy);
  const p2Scale = interpolateWithCurve(frame, 64, 96, 0.96, 1.02, MotionCurves.snappy);

  // Part 3: "Meet" (local frames 104 - 130)
  const p3Opacity =
    frame < 124
      ? interpolateWithCurve(frame, 104, 112, 0, 1, MotionCurves.punch)
      : interpolateWithCurve(frame, 124, 132, 1, 0, MotionCurves.snappy);
  const p3Scale = interpolateWithCurve(frame, 104, 128, 0.95, 1.01, MotionCurves.snappy);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {/* 1. Prediction markets capped you at 1x */}
      {frame <= 66 && (
        <div
          style={{
            opacity: p1Opacity,
            transform: `scale(${p1Scale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.06,
            letterSpacing: "-0.045em",
          }}
        >
          <div style={{ fontSize: "100px", fontWeight: 700, color: "#FFFFFF" }}>
            Prediction markets
          </div>
          <div style={{ fontSize: "100px", fontWeight: 700, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "18px" }}>
            <span>capped you at</span>
            <span style={{ color: "#CCCCCC" }}>1×</span>
          </div>
        </div>
      )}

      {/* 2. We unlocked the rest. */}
      {frame >= 64 && frame <= 106 && (
        <div
          style={{
            opacity: p2Opacity,
            transform: `scale(${p2Scale})`,
            fontSize: "100px",
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.045em",
            lineHeight: 1.1,
          }}
        >
          We unlocked the rest.
        </div>
      )}

      {/* 3. Meet */}
      {frame >= 104 && (
        <div
          style={{
            opacity: p3Opacity,
            transform: `scale(${p3Scale})`,
            fontSize: "132px",
            fontWeight: 700,
            color: "#555558",
            letterSpacing: "-0.05em",
          }}
        >
          Meet
        </div>
      )}
    </AbsoluteFill>
  );
};

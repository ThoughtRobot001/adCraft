import React from "react";
import { spring, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";

export const ActionProgressModalSchema = z.object({
  title: z.string().default("Buying"),
  successTitle: z.string().default("Order placed"),
  successButton: z.string().default("Done"),
  startFrame: z.number().default(0),
  durationFrames: z.number().default(100),
  color: z.string().default("#ffcc00"),
});

export const ActionProgressModal: React.FC<z.infer<typeof ActionProgressModalSchema>> = ({
  title,
  successTitle,
  successButton,
  startFrame,
  durationFrames,
  color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  if (localFrame < 0) return null;

  const scale = interpolate(spring({ fps, frame: localFrame, config: { damping: 14 } }), [0, 1], [0.8, 1]);
  
  const isComplete = localFrame > durationFrames;
  
  const progressPhase = interpolate(localFrame, [0, durationFrames], [0, 100], { extrapolateRight: "clamp" });
  const circleOffset = interpolate(progressPhase, [0, 100], [283, 0]);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
      <div style={{ width: "300px", backgroundColor: "#222", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", border: "1px solid #333", transform: `scale(${scale})` }}>
        {!isComplete ? (
          <>
            <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="6" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6" strokeDasharray="283" strokeDashoffset={circleOffset} strokeLinecap="round" />
              </svg>
              <div style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}>{Math.floor(progressPhase)}%</div>
            </div>
            <div style={{ color: "white", fontSize: "20px", fontWeight: 600 }}>{title}</div>
          </>
        ) : (
          <>
            <div style={{ width: "100px", height: "100px", backgroundColor: "rgba(0, 200, 100, 0.2)", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "#00c864", fontSize: "48px" }}>✓</div>
            <div style={{ color: "white", fontSize: "20px", fontWeight: 600 }}>{successTitle}</div>
            <div style={{ width: "100%", backgroundColor: color, color: "black", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>{successButton}</div>
          </>
        )}
      </div>
    </div>
  );
};

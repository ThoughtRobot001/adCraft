import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { interpolateWithCurve, MotionCurves } from "../utils/motion-curves";
import { z } from "zod";

export const PerspectiveCardGridSchema = z.object({
  cards: z.array(z.object({
    title: z.string(),
    value: z.string(),
  })),
  scaleStart: z.number().default(1),
  scaleEnd: z.number().default(1.1),
  rotateXStart: z.number().default(10),
  rotateXEnd: z.number().default(5),
  translateYStart: z.number().default(50),
  translateYEnd: z.number().default(-20),
  continuousScrollSpeed: z.number().optional().default(0).describe("Pixels per frame to continuously scroll downwards"),
  useMotionCurves: z.boolean().optional().default(true).describe("Use cinematic AE motion curves instead of linear"),
});

export const PerspectiveCardGrid: React.FC<z.infer<typeof PerspectiveCardGridSchema>> = ({
  cards, scaleStart, scaleEnd, rotateXStart, rotateXEnd, translateYStart, translateYEnd, continuousScrollSpeed, useMotionCurves
}) => {
  const frame = useCurrentFrame();

  const scale = useMotionCurves 
    ? interpolateWithCurve(frame, 0, 90, scaleStart, scaleEnd, MotionCurves.glide)
    : interpolate(frame, [0, 90], [scaleStart, scaleEnd], { extrapolateRight: "clamp" });
    
  const rotateX = useMotionCurves
    ? interpolateWithCurve(frame, 0, 90, rotateXStart, rotateXEnd, MotionCurves.glide)
    : interpolate(frame, [0, 90], [rotateXStart, rotateXEnd]);
    
  let translateY = useMotionCurves
    ? interpolateWithCurve(frame, 0, 90, translateYStart, translateYEnd, MotionCurves.glide)
    : interpolate(frame, [0, 90], [translateYStart, translateYEnd]);

  // Apply continuous conveyor-belt scrolling effect
  if (continuousScrollSpeed) {
    translateY += (frame * continuousScrollSpeed);
  }

  return (
    <AbsoluteFill style={{ perspective: 1200, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{
        transform: `scale(${scale}) rotateX(${rotateX}deg) translateY(${translateY}px)`,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "40px",
        width: "1200px"
      }}>
        {cards.map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: "#1c1c1e",
            borderRadius: "24px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(circle at top right, rgba(200, 255, 0, 0.15), transparent 50%)" }} />
            <div style={{ color: "#d1d1d6", fontSize: "24px", lineHeight: 1.4, fontWeight: 500, zIndex: 1 }}>{card.title}</div>
            <div style={{ color: "white", fontSize: "72px", fontWeight: 700, zIndex: 1 }}>{card.value}</div>
            <div style={{ display: "flex", gap: "16px", marginTop: "auto", zIndex: 1 }}>
              <div style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "1px solid rgba(0, 200, 100, 0.3)", color: "#00c864", textAlign: "center", fontWeight: 600 }}>Yes</div>
              <div style={{ flex: 1, padding: "16px", borderRadius: "12px", border: "1px solid rgba(255, 60, 60, 0.3)", color: "#ff3c3c", textAlign: "center", fontWeight: 600 }}>No</div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

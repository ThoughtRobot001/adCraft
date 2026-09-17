import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { interpolateWithCurve, MotionCurves } from "../../utils/motion-curves";

interface CardData {
  id: string;
  avatarImg: string;
  question: string;
  percentage: string;
  yesText?: string;
  noText?: string;
  volume: string;
  date: string;
}

// Exact 8 cards in chronological scroll order from the reference frames
const GRID_ROWS: [CardData, CardData][] = [
  // Row 0 (Reaches center around frame 70-80)
  [
    {
      id: "taiwan",
      avatarImg: "avatar_taiwan.png",
      question: "Will China invade Taiwan by end of 2026?",
      percentage: "4%",
      volume: "$297k Vol.",
      date: "Dec 31, 1:00 AM",
    },
    {
      id: "dodgers",
      avatarImg: "avatar_dodgers.png",
      question: "Los Angeles Dodgers vs. Atlanta Braves",
      percentage: "54%",
      yesText: "Los Angeles ...",
      noText: "Atlanta Braves",
      volume: "$142k Vol.",
      date: "Oct 15, 8:00 PM",
    },
  ],
  // Row 1 (Reaches center around frame 45-60)
  [
    {
      id: "mitch",
      avatarImg: "avatar_mitch.png",
      question: "Mitch McConnell steps down from Senate before his term ends?",
      percentage: "11%",
      volume: "$186k Vol.",
      date: "Jan 3, 1:00 AM",
    },
    {
      id: "capitol",
      avatarImg: "avatar_capitol.png",
      question: "Clarity Act (H.R.3633) signed into law in 2026?",
      percentage: "14%",
      volume: "$176k Vol.",
      date: "Jan 1, 6:00 AM",
    },
  ],
  // Row 2 (Reaches center around frame 20-35)
  [
    {
      id: "kanye",
      avatarImg: "avatar_kanye.png",
      question: "Kanye West performs in Russia by October 31?",
      percentage: "26%",
      volume: "$76k Vol.",
      date: "Nov 1, 12:59 AM",
    },
    {
      id: "redsox",
      avatarImg: "avatar_mlb.png",
      question: "Boston Red Sox vs. Miami Marlins",
      percentage: "56%",
      yesText: "Boston Red ...",
      noText: "Miami Marlins",
      volume: "$72k Vol.",
      date: "Sep 2, 11:40 PM",
    },
  ],
  // Row 3 (Centered at opening frame 0)
  [
    {
      id: "iran",
      avatarImg: "avatar_iran.png",
      question: "Will the U.S. invade Iran before 2027?",
      percentage: "16%",
      volume: "$277k Vol.",
      date: "Dec 31, 1:00 AM",
    },
    {
      id: "aliens",
      avatarImg: "avatar_aliens.png",
      question: "Will the US confirm that aliens exist by...?",
      percentage: "2%",
      volume: "$195k Vol.",
      date: "Jan 1, 5:59 AM",
    },
  ],
];

export const SceneGrid: React.FC = () => {
  const frame = useCurrentFrame();

  // 1. Camera dolly zoom & 3D tilt tracking matching reference video
  const scale = interpolateWithCurve(frame, 0, 75, 1.0, 1.06, MotionCurves.glide);
  const rotateX = interpolateWithCurve(frame, 0, 75, 11, 5, MotionCurves.glide);
  const rotateZ = -0.9;

  // 2. Downward conveyor belt stream: Row 3 -> Row 2 -> Row 1 -> Row 0
  const initialY = -1100;
  const conveyorProgress = frame * 25.76;

  // 3. Snappy exit drop-down (frames 72 - 90)
  const exitDropY = interpolateWithCurve(frame, 74, 90, 0, 1500, MotionCurves.snappy);
  const exitOpacity = interpolate(frame, [76, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 4. Dynamic warm golden spotlight moving across the upper grid
  const spotX = interpolate(frame, [0, 35, 75], [42, 72, 48], { extrapolateRight: "clamp" });
  const spotY = interpolate(frame, [0, 35, 75], [26, 20, 32], { extrapolateRight: "clamp" });
  const spotAlpha = interpolate(frame, [0, 14, 65, 82], [0.08, 0.82, 0.9, 0.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const totalY = initialY + conveyorProgress + exitDropY;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A0A0C",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        perspective: 1350,
        opacity: exitOpacity,
      }}
    >
      {/* 3D Perspective Grid Camera Rig */}
      <div
        style={{
          width: 1540,
          position: "relative",
          transform: `translateY(${totalY}px) scale(${scale}) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
          transformOrigin: "center 50%",
          transformStyle: "preserve-3d",
          display: "flex",
          flexDirection: "column",
          gap: 44,
        }}
      >
        {GRID_ROWS.map((row, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 44,
              width: "100%",
            }}
          >
            {row.map((card) => (
              <div
                key={card.id}
                style={{
                  width: 730,
                  height: 600,
                  backgroundColor: "#161618",
                  borderRadius: 48,
                  padding: "44px 48px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: "1.5px solid rgba(255, 255, 255, 0.08)",
                  boxShadow:
                    "0 32px 64px -12px rgba(0, 0, 0, 0.82), inset 0 1.5px 2px rgba(255, 255, 255, 0.14)",
                  boxSizing: "border-box",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Subtle top glare gradient */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "45%",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Header Row: Authentic Avatar + Question */}
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: "50%",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: "2px solid rgba(255, 255, 255, 0.16)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                      backgroundColor: "#1E1E22",
                    }}
                  >
                    <Img
                      src={staticFile(`assets/hedge/${card.avatarImg}`)}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      color: "#E2E2E6",
                      fontSize: 27,
                      fontWeight: 500,
                      lineHeight: 1.28,
                      letterSpacing: "-0.015em",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {card.question}
                  </div>
                </div>

                {/* Value Row: Huge Bold Percentage */}
                <div
                  style={{
                    fontSize: 118,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    margin: "8px 0",
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {card.percentage}
                </div>

                {/* Buttons Row: Yes / No Pills */}
                <div style={{ display: "flex", gap: 22 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 84,
                      borderRadius: 42,
                      border: "2px solid rgba(52, 199, 89, 0.55)",
                      backgroundColor: "rgba(52, 199, 89, 0.08)",
                      color: "#34C759",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {card.yesText || "Yes"}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 84,
                      borderRadius: 42,
                      border: "2px solid rgba(255, 69, 58, 0.55)",
                      backgroundColor: "rgba(255, 69, 58, 0.08)",
                      color: "#FF453A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {card.noText || "No"}
                  </div>
                </div>

                {/* Footer Row: Volume + Date */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#6E6E73",
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    paddingTop: 6,
                  }}
                >
                  <span>{card.volume}</span>
                  <span>{card.date}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Dynamic Golden Spotlight in Upper Camera Space (Pure CSS, No Ghost Overlay) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          background: `radial-gradient(ellipse 720px 620px at ${spotX}% ${spotY}%, rgba(255, 226, 40, ${
            spotAlpha * 0.82
          }) 0%, rgba(255, 195, 20, ${spotAlpha * 0.38}) 45%, transparent 75%)`,
          mixBlendMode: "screen",
          filter: "blur(24px)",
        }}
      />

      {/* Cinematic Vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 92% 84% at 50% 50%, transparent 62%, rgba(8, 8, 10, 0.9) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

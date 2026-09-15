import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile, Img, Easing } from "remotion";

export const SceneFlyingText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Part 1: Flying Cards & Trade major news/elections (local frames 0 - 62)
  const part1Opacity = interpolate(frame, [0, 8, 55, 62], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background flying cards motion
  const cardsScale1 = interpolate(frame, [0, 32], [0.95, 1.15], { extrapolateRight: "clamp" });
  const cardsScale2 = interpolate(frame, [30, 62], [0.95, 1.2], { extrapolateRight: "clamp" });

  // Word swap: "news" -> "elections" around frame 30
  const newsExitProgress = interpolate(frame, [28, 36], [0, 1], {
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const newsY = interpolate(newsExitProgress, [0, 1], [0, -60]);
  const newsOpacity = interpolate(newsExitProgress, [0, 1], [1, 0]);

  const electionsEnterProgress = interpolate(frame, [30, 39], [0, 1], {
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const electionsY = interpolate(electionsEnterProgress, [0, 1], [60, 0]);
  const electionsOpacity = interpolate(electionsEnterProgress, [0, 1], [0, 1]);

  // Part 2: "with up to 10× leverage on Robinhood." (local frames 60 - 115)
  const part2Opacity = interpolate(frame, [62, 70, 106, 114], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const part2Scale = interpolate(frame, [62, 110], [0.96, 1.02], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0A0A0C", overflow: "hidden" }}>
      {/* 1. Flying Cards Layer */}
      {frame < 64 && (
        <AbsoluteFill style={{ opacity: part1Opacity, perspective: 1200 }}>
          {/* Background card streaks */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transform: `scale(${frame < 30 ? cardsScale1 : cardsScale2})`,
              transformOrigin: "center center",
            }}
          >
            <Img
              src={staticFile(frame < 30 ? "assets/hedge/flying_cards_1.png" : "assets/hedge/flying_cards_2.png")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Centered Kinetic Text: Trade major [news -> elections] */}
          <AbsoluteFill
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "110px",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.04em",
                gap: "28px",
              }}
            >
              <span>Trade major</span>
              <div style={{ position: "relative", width: "480px", height: "120px" }}>
                {newsOpacity > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      opacity: newsOpacity,
                      transform: `translateY(${newsY}px)`,
                      filter: `blur(${interpolate(newsExitProgress, [0, 1], [0, 10])}px)`,
                    }}
                  >
                    news
                  </div>
                )}
                {electionsOpacity > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      opacity: electionsOpacity,
                      transform: `translateY(${electionsY}px)`,
                      filter: `blur(${interpolate(electionsEnterProgress, [0, 1], [10, 0])}px)`,
                    }}
                  >
                    elections
                  </div>
                )}
              </div>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}

      {/* 2. with up to 10× leverage on Robinhood. */}
      {frame >= 60 && (
        <AbsoluteFill
          style={{
            opacity: part2Opacity,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            transform: `scale(${part2Scale})`,
            letterSpacing: "-0.045em",
            textAlign: "center",
            lineHeight: 1.08,
          }}
        >
          <div style={{ fontSize: "104px", fontWeight: 700, color: "#FFFFFF" }}>
            with up to 10× leverage
          </div>
          <div style={{ fontSize: "104px", fontWeight: 700, color: "#FFFFFF" }}>
            on Robinhood.
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

import React, { useState } from "react";
import { Loop, OffthreadVideo, staticFile } from "remotion";

export interface VideoBackgroundProps {
  src?: string;
  opacity?: number;
  playbackRate?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  fallbackColor?: string;
  loopDurationFrames?: number;
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  src,
  opacity = 0.85,
  playbackRate = 1.0,
  blendMode = "normal",
  fallbackColor = "#0B0F19",
  loopDurationFrames = 150,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: fallbackColor,
          pointerEvents: "none",
        }}
      />
    );
  }

  let videoSrc = src;
  if (!src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("data:")) {
    try {
      videoSrc = staticFile(src);
    } catch {
      videoSrc = src;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity,
        mixBlendMode: blendMode,
      }}
    >
      <Loop durationInFrames={loopDurationFrames}>
        <OffthreadVideo
          src={videoSrc}
          playbackRate={playbackRate}
          onError={() => setHasError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.05)",
          }}
        />
      </Loop>
    </div>
  );
};

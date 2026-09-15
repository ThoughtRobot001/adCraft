import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";

interface ThreeViewportProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
  style?: React.CSSProperties;
}

export const ThreeViewport: React.FC<ThreeViewportProps> = ({
  children,
  cameraPosition = [0, 0, 5],
  fov = 45,
  style,
}) => {
  const { width, height } = useVideoConfig();

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0, ...style }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          fov,
          position: cameraPosition,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        {children}
      </ThreeCanvas>
    </div>
  );
};

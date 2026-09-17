import React from "react";
import { useCurrentFrame } from "remotion";

interface LightingRigProps {
  ambientIntensity?: number;
  keyIntensity?: number;
  rimIntensity?: number;
  rimColor?: string;
  enableMovingGlint?: boolean;
}

export const LightingRig3D: React.FC<LightingRigProps> = ({
  ambientIntensity = 0.6,
  keyIntensity = 1.4,
  rimIntensity = 1.8,
  rimColor = "#ffffff",
  enableMovingGlint = true,
}) => {
  const frame = useCurrentFrame();

  // Dynamic moving glint light tracking across surfaces
  const glintX = enableMovingGlint ? Math.sin(frame * 0.04) * 4 : 2;
  const glintY = enableMovingGlint ? Math.cos(frame * 0.03) * 3 : 3;

  return (
    <>
      {/* Ambient soft fill */}
      <ambientLight intensity={ambientIntensity} color="#e0e4f0" />

      {/* Main key light from top-right */}
      <directionalLight
        position={[5, 8, 6]}
        intensity={keyIntensity}
        color="#ffffff"
      />

      {/* Rim light from behind/left for metallic chamfer edges */}
      <directionalLight
        position={[-6, -4, -4]}
        intensity={rimIntensity}
        color={rimColor}
      />

      {/* Moving studio spotlight generating active specular sweeps */}
      <pointLight
        position={[glintX, glintY, 4]}
        intensity={1.2}
        distance={15}
        color="#fff8e7"
      />
    </>
  );
};

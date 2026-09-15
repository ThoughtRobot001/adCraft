import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeViewport, LightingRig3D, Phone3DMesh } from "../../primitives/three";
import { MotionCurves, interpolateWithCurve } from "../../utils/motion-curves";

export const ScenePhone: React.FC = () => {
  const frame = useCurrentFrame();

  // 1. Phone Entrance from bottom in true 3D space (local 0 - 24)
  const phoneY = interpolateWithCurve(frame, 0, 24, -6.5, 0, MotionCurves.snappy);
  const phoneRotX = interpolateWithCurve(frame, 0, 24, 0.4, 0, MotionCurves.snappy);

  // 2. Phone Shifts Left and Tilts toward viewer on beat drop (local 24 - 46)
  const phoneX = interpolateWithCurve(frame, 24, 46, 0, -1.55, MotionCurves.snappy);
  const phoneRotY = interpolateWithCurve(frame, 24, 46, 0, 0.28, MotionCurves.snappy);
  const phoneZ = interpolateWithCurve(frame, 24, 46, 0, 0.45, MotionCurves.snappy);

  // 3. Kinetic Text Entrance on Right (local 28 - 48)
  const textX = interpolateWithCurve(frame, 28, 46, 280, 0, MotionCurves.snappy);
  const textOpacity = interpolateWithCurve(frame, 28, 38, 0, 1, MotionCurves.punch);

  // 4. Explosive Departure into Camera (local 94 - 110)
  const exitZ = interpolateWithCurve(frame, 94, 110, 0, 4.5, MotionCurves.punch);
  const exitOpacity = interpolateWithCurve(frame, 98, 110, 1, 0, MotionCurves.punch);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A0A0C",
        overflow: "hidden",
        opacity: exitOpacity,
      }}
    >
      {/* Dynamic Moving Hexagonal Matrix Background */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          backgroundImage: `radial-gradient(rgba(255, 230, 0, 0.14) 1.5px, transparent 1.5px)`,
          backgroundSize: "36px 36px",
          transform: `translateY(${frame * 0.9}px) rotate(${frame * 0.04}deg)`,
          opacity: 0.55,
        }}
      />

      {/* Hardware-Accelerated WebGL 3D Canvas */}
      <ThreeViewport cameraPosition={[0, 0, 6.2]} fov={38}>
        {/* Dynamic Studio Lighting Rig (Active Specular Glints on Titanium Chamfers) */}
        <LightingRig3D
          ambientIntensity={0.65}
          keyIntensity={1.8}
          rimIntensity={2.4}
          rimColor="#ffe600"
          enableMovingGlint
        />

        {/* Photoreal 3D Extruded Phone with Brushed Titanium & Specular Glass */}
        <Phone3DMesh
          position={[phoneX, phoneY, phoneZ + exitZ]}
          rotation={[phoneRotX, phoneRotY, 0]}
          scale={1.05}
          screenTexturePath="assets/hedge/phone_mockup.png"
          titaniumColor="#1F1F24"
        />
      </ThreeViewport>

      {/* Kinetic Typography Layer (Right-aligned, AE Speed Curve) */}
      <div
        style={{
          position: "absolute",
          left: "980px",
          top: "50%",
          transform: `translate(${textX}px, -50%)`,
          opacity: textOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          lineHeight: 0.94,
          letterSpacing: "-0.045em",
          pointerEvents: "none",
        }}
      >
        <div style={{ color: "#77777D", fontSize: "76px", fontWeight: 500, marginBottom: "10px" }}>
          the
        </div>
        <div style={{ color: "#FFFFFF", fontSize: "112px", fontWeight: 700, letterSpacing: "-0.05em" }}>
          leverage
        </div>
        <div style={{ color: "#FFFFFF", fontSize: "112px", fontWeight: 700, letterSpacing: "-0.05em" }}>
          layer for event
        </div>
        <div style={{ color: "#FFFFFF", fontSize: "112px", fontWeight: 700, letterSpacing: "-0.05em" }}>
          markets.
        </div>
      </div>
    </AbsoluteFill>
  );
};

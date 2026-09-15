import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand } from "../schema";
import { CandidateNoiseFieldProps } from "../schema/primitives";
import { TemporalCompositionSnapshot } from "../stages/types";

interface Props {
  props: CandidateNoiseFieldProps & {
    compositionSnapshot?: TemporalCompositionSnapshot;
  };
  brand?: Brand;
  compositionSnapshot?: TemporalCompositionSnapshot;
}

export const CandidateNoiseField: React.FC<Props> = ({ props, brand, compositionSnapshot: directSnapshot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const compositionSnapshot = directSnapshot || props.compositionSnapshot;

  const {
    cards = [],
    volumetricBeam = {
      color: "#7C3AED",
      secondaryColor: "#6366F1",
      originX: 50,
      originY: 100,
      intensity: 0.85,
    },
    containerStyle = {
      topPercent: 35,
      heightPercent: 61,
      leftPercent: 4,
      widthPercent: 92,
      borderRadius: 32,
      borderColor: "rgba(255, 255, 255, 0.12)",
      backgroundColor: "#080A11",
    },
    watermarkText = "RCRUT",
    isStatic = false,
    delay = 0,
  } = props;

  const effectiveFrame = compositionSnapshot ? compositionSnapshot.effectiveFrame : (isStatic ? 82 : frame);
  const currentFrame = isStatic ? 82 : Math.max(0, effectiveFrame - delay);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const smoothstep = (min: number, max: number, v: number) => {
    if (max <= min) return 0;
    const x = Math.max(0, Math.min(1, (v - min) / (max - min)));
    return x * x * (3 - 2 * x);
  };

  // Volumetric beam pulse
  const beamPulse = isStatic ? 1 : 0.88 + 0.12 * Math.sin(currentFrame / 22);

  // 1. Dynamic Geometry from Composition Snapshot
  const topPercent = compositionSnapshot
    ? compositionSnapshot.compositionGeometry.containerBounds.topPercent
    : (containerStyle.topPercent ?? 35);
  const heightPercent = compositionSnapshot
    ? compositionSnapshot.compositionGeometry.containerBounds.heightPercent
    : (containerStyle.heightPercent ?? 61);
  const leftPercent = compositionSnapshot
    ? compositionSnapshot.compositionGeometry.containerBounds.leftPercent
    : (containerStyle.leftPercent ?? 4);
  const widthPercent = compositionSnapshot
    ? compositionSnapshot.compositionGeometry.containerBounds.widthPercent
    : (containerStyle.widthPercent ?? 92);
  const borderRadius = compositionSnapshot
    ? compositionSnapshot.compositionGeometry.containerBounds.borderRadius
    : (containerStyle.borderRadius ?? 32);
  const borderColor = compositionSnapshot?.compositionGeometry.containerBounds.borderOpacity !== undefined
    ? `rgba(255, 255, 255, ${compositionSnapshot.compositionGeometry.containerBounds.borderOpacity})`
    : (containerStyle.borderColor || "rgba(255, 255, 255, 0.12)");

  // 2. Dynamic 3D Depth & Perspective
  const perspectiveVal = compositionSnapshot
    ? `${compositionSnapshot.depthDistribution.perspective}px`
    : "1400px";
  const camRotateX = compositionSnapshot
    ? compositionSnapshot.depthDistribution.tiltX
    : (isStatic ? 12 : interpolate(currentFrame, [0, 90], [14, 9], { extrapolateRight: "clamp" }));
  const camRotateY = compositionSnapshot
    ? compositionSnapshot.depthDistribution.tiltY
    : (isStatic ? -2 : interpolate(currentFrame, [0, 90], [-4, -1], { extrapolateRight: "clamp" }));
  const zSpread = compositionSnapshot
    ? (compositionSnapshot.depthDistribution.zSpread / 60)
    : 1.0;

  // 3. Dynamic Lighting & Atmospheric Bloom
  const beamIntensity = compositionSnapshot
    ? compositionSnapshot.lightingIntensity.beamIntensity
    : (volumetricBeam.intensity ?? 0.85);
  const beamWidth = compositionSnapshot
    ? `${compositionSnapshot.lightingIntensity.beamWidth}px`
    : "900px";
  const bloomFilter = compositionSnapshot
    ? `blur(${compositionSnapshot.lightingIntensity.bloomRadius}px)`
    : "blur(40px)";
  const ambientGlowOpacity = compositionSnapshot
    ? compositionSnapshot.lightingIntensity.ambientGlowOpacity * beamPulse
    : 0.9 * beamPulse;

  // 4. Dynamic Physics & Motion Energy
  const microLevitationAmp = compositionSnapshot
    ? compositionSnapshot.motionEnergy.microLevitationAmp
    : 4.5;
  const microLevitationFreq = compositionSnapshot
    ? compositionSnapshot.motionEnergy.microLevitationFreq
    : 0.045;
  const alertPulseRate = compositionSnapshot
    ? compositionSnapshot.motionEnergy.alertPulseRate
    : (isStatic ? 1 : interpolate(currentFrame, [0, 85], [1, 2.2], { extrapolateRight: "clamp" }));
  const springStiffness = compositionSnapshot
    ? compositionSnapshot.motionEnergy.springStiffness
    : 120;
  const springDamping = compositionSnapshot
    ? compositionSnapshot.motionEnergy.springDamping
    : 14;

  // 5. Dynamic Scale Hierarchy
  const heroScaleMultiplier = compositionSnapshot
    ? compositionSnapshot.scaleHierarchy.heroScale
    : 1.0;
  const secondaryScaleMultiplier = compositionSnapshot
    ? compositionSnapshot.scaleHierarchy.secondaryScale
    : 0.95;

  return (
    <div
      style={{
        position: "absolute",
        top: `${topPercent}%`,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        zIndex: 100,
      }}
    >
      {/* 1. Container Background Chassis (clipped to rounded corners) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: `${borderRadius}px`,
          backgroundColor: containerStyle.backgroundColor || "#080A11",
          border: `1px solid ${compositionSnapshot?.isFreezeSnap ? "rgba(255, 255, 255, 0.45)" : borderColor}`,
          boxShadow: compositionSnapshot?.isFreezeSnap
            ? "0 30px 100px rgba(124, 58, 237, 0.55), 0 0 50px rgba(255, 255, 255, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
            : "0 30px 80px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
          overflow: "hidden",
          transition: "border 0.15s ease-out, box-shadow 0.15s ease-out",
        }}
      >
        {/* Volumetric Light Beam shooting upward */}
        <div
          style={{
            position: "absolute",
            left: `${volumetricBeam.originX}%`,
            bottom: 0,
            width: beamWidth,
            height: "100%",
            transform: "translateX(-50%)",
            background: `conic-gradient(from 180deg at 50% 100%, transparent 68deg, ${volumetricBeam.color}55 84deg, ${volumetricBeam.secondaryColor || volumetricBeam.color}88 90deg, ${volumetricBeam.color}55 96deg, transparent 112deg)`,
            filter: bloomFilter,
            opacity: beamIntensity * beamPulse,
            pointerEvents: "none",
          }}
        />

        {/* Atmospheric center soft radial glow */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "15%",
            width: "750px",
            height: "550px",
            transform: "translateX(-50%)",
            background: `radial-gradient(ellipse at center, ${volumetricBeam.secondaryColor || "#6366F1"}40 0%, ${volumetricBeam.color}20 50%, transparent 75%)`,
            filter: "blur(60px)",
            opacity: ambientGlowOpacity,
            pointerEvents: "none",
          }}
        />

        {/* Brand Watermark */}
        {watermarkText && (
          <div
            style={{
              position: "absolute",
              right: "32px",
              bottom: "28px",
              fontSize: "26px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              color: "#FFFFFF",
              opacity: 0.9,
              textTransform: "uppercase",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {watermarkText}
          </div>
        )}
      </div>

      {/* 2. 3D Perspective Card Canvas (isolated perspective context, overflow: visible) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: perspectiveVal,
          overflow: "visible",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transform: `rotateX(${camRotateX}deg) rotateY(${camRotateY}deg)`,
            overflow: "visible",
          }}
        >
        {cards.map((card, idx) => {
          const spawnTime = isStatic ? 0 : (card.spawnFrame !== undefined ? card.spawnFrame : idx * 5);
          if (!isStatic && currentFrame < spawnTime) {
            return null; // Element has not yet entered the temporal timeline
          }

          const cardFrame = Math.max(0, currentFrame - spawnTime);

          const spr = isStatic
            ? 1
            : spring({
                frame: cardFrame,
                fps,
                config: { damping: springDamping, mass: 0.7, stiffness: springStiffness },
              });

          // Directional offsets driven by entryTrajectory
          const trajectory = card.entryTrajectory || "from-depth";
          let initialX = 0;
          let initialY = 0;
          let initialZ = -120;

          if (trajectory === "from-left") {
            initialX = -130;
            initialZ = -40;
          } else if (trajectory === "from-right") {
            initialX = 130;
            initialZ = -40;
          } else if (trajectory === "drop-down") {
            initialY = -90;
            initialZ = -30;
          } else if (trajectory === "float-up") {
            initialY = 110;
            initialZ = -30;
          } else if (trajectory === "fade") {
            initialZ = 0;
          }

          const entranceX = isStatic ? 0 : interpolate(spr, [0, 1], [initialX, 0]);
          const entranceY = isStatic ? 0 : interpolate(spr, [0, 1], [initialY, 0]);
          const entranceZ = isStatic ? 0 : interpolate(spr, [0, 1], [initialZ, 0]);
          const entranceOpacity = isStatic ? 1 : interpolate(cardFrame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

          // Ambient micro-levitation with dynamic frequency & amplitude
          const floatY = isStatic ? 0 : Math.sin((currentFrame + idx * 17) * microLevitationFreq * 20) * microLevitationAmp;
          const floatX = isStatic ? 0 : Math.cos((currentFrame + idx * 13) * microLevitationFreq * 16) * (microLevitationAmp * 0.6);

          const baseZ = (card.position.z || 0) * zSpread;
          const rotX = card.rotation?.x || 0;
          const rotY = card.rotation?.y || 0;
          const rotZ = card.rotation?.z || 0;

          // Peripheral activity blur
          const isHero = idx === 0 || card.id === "card-1";
          const dynamicPeripheralBlur = (compositionSnapshot && !isHero && idx >= 3)
            ? compositionSnapshot.peripheralActivity.backgroundBlur * (idx >= 8 ? 1.0 : 0.5)
            : 0;
          const cardBlur = Math.max(card.blur || 0, dynamicPeripheralBlur);
          const cardOpacity = (card.opacity ?? 1) * entranceOpacity;

          // Alert badge pulse driven by dynamic motion energy
          const alertPulse = isStatic ? 1 : 0.82 + 0.18 * Math.sin(((currentFrame + idx * 8) * alertPulseRate) / 5);

          // Dynamic scale hierarchy
          const roleScale = isHero ? heroScaleMultiplier : secondaryScaleMultiplier;
          const finalScale = (card.scale || 1) * roleScale;

          // Occlusion trajectory for foreground-occluder card (card-6 / occludesTypography)
          const isOccluder = Boolean(card.occludesTypography || card.id === "card-6");
          let occluderTranslateY = 0;
          let occluderTranslateZ = 0;
          let occluderRotateX = 0;

          if (isOccluder) {
            // Surges upward across container boundary into upper negative space to occlude the headline ("through noise.")
            const surgeT = isStatic ? 1 : smoothstep(52, 66, currentFrame);
            occluderTranslateY = lerp(0, -370, surgeT);
            occluderTranslateZ = lerp(0, 160, surgeT);
            occluderRotateX = lerp(0, -6, surgeT);
          }

          const finalTranslateX = floatX + entranceX;
          const finalTranslateY = floatY + entranceY + occluderTranslateY;
          const finalTranslateZ = baseZ + entranceZ + occluderTranslateZ;
          const finalRotX = rotX + occluderRotateX;
          const finalZIndex = isOccluder ? 500 : Math.round(baseZ + 100);

          return (
            <div
              key={card.id || idx}
              style={{
                position: "absolute",
                left: `${card.position.x}%`,
                top: `${card.position.y}%`,
                width: "360px",
                transform: `translate3d(${finalTranslateX}px, ${finalTranslateY}px, ${finalTranslateZ}px) rotateX(${finalRotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${finalScale})`,
                opacity: cardOpacity,
                filter: cardBlur > 0 ? `blur(${cardBlur}px)` : "none",
                transformStyle: "preserve-3d",
                zIndex: finalZIndex,
              }}
            >

              {/* Alert Badge floating on/above card */}
              {card.alertBadge && (
                <div
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "7px 16px",
                    borderRadius: "9999px",
                    marginBottom: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    textTransform: "uppercase",
                    backgroundColor:
                      card.alertBadge.variant === "purple"
                        ? "rgba(168, 85, 247, 0.22)"
                        : "rgba(255, 51, 75, 0.22)",
                    border: `1.5px solid ${card.alertBadge.variant === "purple" ? "#A855F7" : "#FF334B"}`,
                    color: card.alertBadge.variant === "purple" ? "#E9D5FF" : "#FFECEE",
                    boxShadow:
                      card.alertBadge.variant === "purple"
                        ? `0 0 ${20 * alertPulse}px rgba(168, 85, 247, 0.85), 0 0 ${40 * alertPulse}px rgba(168, 85, 247, 0.4)`
                        : `0 0 ${20 * alertPulse}px rgba(255, 51, 75, 0.85), 0 0 ${40 * alertPulse}px rgba(255, 51, 75, 0.4)`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>
                    {card.alertBadge.variant === "purple" ? "⏱" : "⚠"}
                  </span>
                  <span>{card.alertBadge.text}</span>
                </div>
              )}

              {/* Glassmorphic Card Container */}
              <div
                style={{
                  backgroundColor: isOccluder
                    ? "rgba(10, 13, 22, 0.98)"
                    : "rgba(14, 18, 28, 0.76)",
                  border: isOccluder
                    ? "1px solid rgba(255, 255, 255, 0.32)"
                    : "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: "20px",
                  padding: "20px 22px",
                  backdropFilter: "blur(28px)",
                  boxShadow: isOccluder
                    ? "0 35px 90px rgba(0, 0, 0, 0.95), 0 0 35px rgba(239, 68, 68, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3)"
                    : "0 24px 50px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.14)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {/* Header: Avatar, Name, Title, Match Pill */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      backgroundColor: card.avatarBg || "rgba(124, 58, 237, 0.25)",
                      border: "1.5px solid rgba(255, 255, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "16px",
                      flexShrink: 0,
                    }}
                  >
                    {card.avatarInitials || card.name.charAt(0)}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span
                        style={{
                          color: "#FFFFFF",
                          fontSize: "17px",
                          fontWeight: 700,
                          letterSpacing: "-0.01em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {card.name}
                      </span>
                      {card.matchScore && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: "6px",
                            backgroundColor: "rgba(34, 197, 94, 0.2)",
                            color: "#4ADE80",
                            border: "1px solid rgba(74, 222, 128, 0.3)",
                          }}
                        >
                          {card.matchScore}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        color: "#94A3B8",
                        fontSize: "13px",
                        fontWeight: 500,
                        marginTop: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {card.role}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {card.tags && card.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {card.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "4px 9px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(255, 255, 255, 0.06)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          color: "rgba(241, 245, 249, 0.85)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Mini Stat / Activity Sparkline Bars */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    paddingTop: "6px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "#64748B", marginRight: "auto" }}>
                    {card.location || "San Francisco, CA"}
                  </span>
                  {[35, 65, 85, 45, 95, 75, 90].map((h, bIdx) => (
                    <div
                      key={bIdx}
                      style={{
                        width: "4px",
                        height: `${h * 0.16 + 4}px`,
                        backgroundColor:
                          bIdx === 4 || bIdx === 6
                            ? "#7C3AED"
                            : "rgba(255, 255, 255, 0.15)",
                        borderRadius: "2px",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* 3. Stroboscopic Snap Freeze Highlight Overlay (f84 - f87) */}
      {compositionSnapshot?.isFreezeSnap && (
        <div
          style={{
            position: "absolute",
            inset: -60,
            background: "radial-gradient(ellipse at 50% 45%, rgba(255, 255, 255, 0.28) 0%, rgba(168, 85, 247, 0.20) 40%, transparent 75%)",
            mixBlendMode: "screen",
            pointerEvents: "none",
            zIndex: 600,
          }}
        />
      )}
    </div>
  );
};

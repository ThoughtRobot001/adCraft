import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, resolveColor } from "../schema";

interface Props {
  brand: Brand;
  isLight?: boolean;
  grain?: number;
  vignette?: number;
  haze?: number;
  particleCount?: number;
  hasVolumetricBloom?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  blur: number;
}

export const GlobalAtmosphere: React.FC<Props> = ({
  brand,
  isLight: propIsLight,
  grain = 0.12,
  vignette = 0.28,
  haze = 0.1,
  particleCount,
  hasVolumetricBloom,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const isLight =
    propIsLight !== undefined
      ? propIsLight
      : brand.theme === "editorial-light" ||
        brand.colors.background === "#F8F7F3" ||
        brand.colors.background === "#FFFFFF" ||
        brand.colors.background === "#F8FAFC";

  const primaryColor = resolveColor("brand.primary", brand);
  const accentColor = resolveColor("brand.accent", brand);

  // Deterministic 3D atmospheric particle field
  const particles = useMemo<Particle[]>(() => {
    const list: Particle[] = [];
    const count = particleCount ?? 35;
    for (let i = 0; i < count; i++) {
      // Deterministic pseudo-random seed
      const seed1 = Math.sin(i * 997.13) * 10000;
      const seed2 = Math.cos(i * 357.71) * 10000;
      const seed3 = Math.sin(i * 123.45) * 10000;

      const norm1 = seed1 - Math.floor(seed1);
      const norm2 = seed2 - Math.floor(seed2);
      const norm3 = seed3 - Math.floor(seed3);

      list.push({
        id: i,
        x: norm1 * 100,
        y: norm2 * 100,
        z: norm3 * 600 - 300, // Z depth range from -300 to +300
        size: 3 + norm1 * 9,
        speedY: 0.12 + norm2 * 0.28,
        speedX: (norm3 - 0.5) * 0.15,
        opacity: 0.15 + norm1 * 0.35,
        blur: norm3 > 0.6 ? 2 : norm3 < 0.2 ? 4 : 0.5,
      });
    }
    return list;
  }, []);

  // Moving volumetric studio lights
  const light1X = interpolate(Math.sin(frame / 75), [-1, 1], [25, 75]);
  const light1Y = interpolate(Math.cos(frame / 60), [-1, 1], [20, 60]);
  const light2X = interpolate(Math.cos(frame / 85), [-1, 1], [80, 20]);
  const light2Y = interpolate(Math.sin(frame / 95), [-1, 1], [70, 30]);

  // Subtle breathing scale on the lighting
  const pulse = 1 + Math.sin(frame / 40) * 0.05;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 5,
      }}
    >
      {/* Volumetric Studio Lights */}
      {hasVolumetricBloom !== false && (
        <>
          {/* Volumetric Studio Light 1 */}
          <div
            style={{
              position: "absolute",
              left: `${light1X}%`,
              top: `${light1Y}%`,
              width: `${width * 0.75}px`,
              height: `${width * 0.75}px`,
              borderRadius: "50%",
              transform: `translate(-50%, -50%) scale(${pulse})`,
              background: isLight
                ? `radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, rgba(240, 235, 225, 0.4) 40%, rgba(248, 247, 243, 0) 70%)`
                : `radial-gradient(circle, ${primaryColor}22 0%, ${primaryColor}08 45%, transparent 70%)`,
              filter: isLight ? "blur(50px)" : "blur(80px)",
              mixBlendMode: isLight ? "soft-light" : "screen",
            }}
          />

          {/* Volumetric Studio Light 2 (Accent Bloom) */}
          <div
            style={{
              position: "absolute",
              left: `${light2X}%`,
              top: `${light2Y}%`,
              width: `${width * 0.65}px`,
              height: `${width * 0.65}px`,
              borderRadius: "50%",
              transform: `translate(-50%, -50%) scale(${pulse * 1.05})`,
              background: isLight
                ? `radial-gradient(circle, rgba(245, 240, 230, 0.6) 0%, rgba(255, 255, 255, 0.1) 45%, transparent 70%)`
                : `radial-gradient(circle, ${accentColor}18 0%, transparent 65%)`,
              filter: isLight ? "blur(60px)" : "blur(90px)",
              mixBlendMode: isLight ? "overlay" : "screen",
            }}
          />
        </>
      )}

      {/* Floating 3D Depth Particle Field */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: "1000px",
          transformStyle: "preserve-3d",
        }}
      >
        {particles.map((p) => {
          // Continuous floating drift
          const currentY = (p.y - frame * p.speedY) % 110;
          const normalizedY = currentY < -10 ? currentY + 120 : currentY;
          const currentX = (p.x + Math.sin((frame * 0.02) + p.id) * 3 + frame * p.speedX) % 105;
          const normalizedX = currentX < -5 ? currentX + 110 : currentX;

          // Parallax depth calculation
          const zScale = interpolate(p.z, [-300, 300], [0.6, 1.4]);
          const particleColor = isLight
            ? `rgba(180, 160, 140, ${p.opacity * 0.4})`
            : `${primaryColor}${Math.round(p.opacity * 255).toString(16).padStart(2, "0")}`;

          return (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${normalizedX}%`,
                top: `${normalizedY}%`,
                width: `${p.size * zScale}px`,
                height: `${p.size * zScale}px`,
                borderRadius: "50%",
                backgroundColor: particleColor,
                filter: `blur(${p.blur}px)`,
                transform: `translate3d(0, 0, ${p.z}px)`,
                boxShadow: isLight
                  ? undefined
                  : `0 0 ${p.size * 2}px ${primaryColor}88`,
                mixBlendMode: isLight ? "multiply" : "screen",
              }}
            />
          );
        })}
      </div>

      {/* Luminous Edge Flare */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: isLight
            ? "linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)"
            : `linear-gradient(90deg, transparent, ${primaryColor}66, transparent)`,
        }}
      />

      {/* Directed Vignette Layer */}
      {vignette > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isLight
              ? `radial-gradient(circle at center, transparent 48%, rgba(15, 23, 42, ${vignette * 0.4}) 100%)`
              : `radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, ${vignette * 0.72}) 100%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Cinematic Depth Haze */}
      {haze > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isLight
              ? `linear-gradient(180deg, transparent 65%, rgba(248, 247, 243, ${haze * 0.7}) 100%)`
              : `linear-gradient(180deg, transparent 55%, rgba(11, 15, 25, ${haze * 0.75}) 100%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

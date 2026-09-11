import React, { useEffect, useMemo, useRef } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, ParticleTunnelProps, resolveColor } from "../schema";

interface Star {
  id: number;
  angle: number;
  baseRadius: number;
  speed: number;
  size: number;
  hueShift: number;
}

interface Props {
  props: ParticleTunnelProps;
  brand: Brand;
}

export const ParticleTunnel: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    speed: baseSpeed = 16,
    density = 220,
    color = "brand.primary",
    accentColor = "brand.accent",
    streakLength = 2.5,
    direction = "outward",
    delay = 0,
    fadeFrames = 15,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const primaryColor = resolveColor(color, brand);
  const secondaryColor = resolveColor(accentColor, brand);

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.sqrt(cx * cx + cy * cy);

  // Deterministically pre-calculate star distribution with seed
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: density }, (_, i) => {
      const angle = random(`tunnel-angle-${i}`) * Math.PI * 2;
      const baseRadius = random(`tunnel-rad-${i}`) * maxRadius;
      const speed = baseSpeed * (0.6 + random(`tunnel-spd-${i}`) * 0.9);
      const size = 1.2 + random(`tunnel-size-${i}`) * 2.8;
      const hueShift = random(`tunnel-hue-${i}`);
      return {
        id: i,
        angle,
        baseRadius,
        speed,
        size,
        hueShift,
      };
    });
  }, [density, baseSpeed, maxRadius]);

  // Overall opacity with fade-in and subtle pulsing
  const opacity = Math.min(1, currentFrame / fadeFrames);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
      // Deterministic radius at currentFrame
      const dirMult = direction === "outward" ? 1 : -1;
      const rawDist = (star.baseRadius + dirMult * currentFrame * star.speed) % maxRadius;
      const currentDist = rawDist < 0 ? rawDist + maxRadius : rawDist;

      // Tail distance based on velocity
      const tailLength = star.speed * streakLength;
      const tailDist = Math.max(0, currentDist - tailLength);

      const headX = cx + Math.cos(star.angle) * currentDist;
      const headY = cy + Math.sin(star.angle) * currentDist;
      const tailX = cx + Math.cos(star.angle) * tailDist;
      const tailY = cy + Math.sin(star.angle) * tailDist;

      const progress = currentDist / maxRadius;
      const starAlpha = Math.min(1, progress * 1.8) * opacity;

      // Color interpolation from primary to accent
      const starColor = star.hueShift > 0.5 ? primaryColor : secondaryColor;

      const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
      grad.addColorStop(0, "rgba(0, 0, 0, 0)");
      grad.addColorStop(1, starColor);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = star.size * (0.8 + progress * 2.2);
      ctx.lineCap = "round";
      ctx.globalAlpha = starAlpha;
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }, [currentFrame, width, height, stars, cx, cy, maxRadius, primaryColor, secondaryColor, direction, streakLength, opacity]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 1 }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </AbsoluteFill>
  );
};

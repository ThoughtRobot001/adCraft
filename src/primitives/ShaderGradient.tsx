import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, resolveColor } from "../schema";

export interface ShaderGradientProps {
  preset?: "aurora" | "warp" | "mesh-blobs";
  colors?: string[];
  speed?: number;
  opacity?: number;
  brand?: Brand;
  blendMode?: React.CSSProperties["mixBlendMode"];
}

export const ShaderGradient: React.FC<ShaderGradientProps> = ({
  preset = "aurora",
  colors,
  speed = 1.0,
  opacity = 1.0,
  brand,
  blendMode = "normal",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Default palette resolution
  const primary = brand ? resolveColor("brand.primary", brand) : "#6366F1";
  const secondary = brand ? resolveColor("brand.secondary", brand) : "#3B82F6";
  const accent = brand ? resolveColor("brand.accent", brand) : "#10B981";
  const bg = brand ? resolveColor("brand.background", brand) : "#0B0F19";

  const palette = colors && colors.length >= 3 ? colors : [primary, secondary, accent, bg];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render scaled for performance without sacrificing blur quality
    const w = canvas.width;
    const h = canvas.height;
    const t = (frame * speed) / 30;

    ctx.clearRect(0, 0, w, h);

    if (preset === "aurora") {
      // Background base
      ctx.fillStyle = palette[3] || "#090D16";
      ctx.fillRect(0, 0, w, h);

      // Aurora Wave 1
      const grad1 = ctx.createLinearGradient(
        w * 0.1 + Math.sin(t * 0.6) * (w * 0.2),
        0,
        w * 0.9 + Math.cos(t * 0.5) * (w * 0.2),
        h
      );
      grad1.addColorStop(0, `${palette[0]}cc`);
      grad1.addColorStop(0.5, `${palette[1]}88`);
      grad1.addColorStop(1, "transparent");

      ctx.save();
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.2);
      for (let x = 0; x <= w; x += 40) {
        const wave = Math.sin(x * 0.003 + t * 0.8) * 90 + Math.cos(x * 0.006 - t * 0.4) * 45;
        ctx.lineTo(x, h * 0.45 + wave);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Aurora Wave 2 (Accent Glow)
      const grad2 = ctx.createRadialGradient(
        w * 0.5 + Math.cos(t * 0.7) * (w * 0.3),
        h * 0.4 + Math.sin(t * 0.5) * (h * 0.2),
        40,
        w * 0.5,
        h * 0.5,
        w * 0.7
      );
      grad2.addColorStop(0, `${palette[2]}aa`);
      grad2.addColorStop(0.4, `${palette[0]}44`);
      grad2.addColorStop(1, "transparent");

      ctx.save();
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

    } else if (preset === "warp") {
      // Domain-Warp fluid simulation
      ctx.fillStyle = palette[3] || "#050508";
      ctx.fillRect(0, 0, w, h);

      const numBands = 5;
      for (let i = 0; i < numBands; i++) {
        const bandColor = palette[i % palette.length];
        const cx = w * (0.3 + 0.4 * Math.sin(t * 0.4 + i * 1.5));
        const cy = h * (0.3 + 0.4 * Math.cos(t * 0.3 + i * 1.2));
        const r = Math.min(w, h) * (0.4 + 0.2 * Math.sin(t * 0.5 + i));

        const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
        radGrad.addColorStop(0, `${bandColor}99`);
        radGrad.addColorStop(0.5, `${bandColor}33`);
        radGrad.addColorStop(1, "transparent");

        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, w, h);
      }

    } else {
      // Mesh-Blobs
      ctx.fillStyle = palette[3] || "#0B0F19";
      ctx.fillRect(0, 0, w, h);

      const blobs = [
        { x: 0.25, y: 0.3, col: palette[0], r: 0.5, phase: 0 },
        { x: 0.75, y: 0.35, col: palette[1], r: 0.45, phase: 2 },
        { x: 0.5, y: 0.7, col: palette[2], r: 0.55, phase: 4 },
      ];

      for (const b of blobs) {
        const bx = w * (b.x + Math.sin(t * 0.5 + b.phase) * 0.15);
        const by = h * (b.y + Math.cos(t * 0.6 + b.phase) * 0.15);
        const br = Math.min(w, h) * b.r;

        const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, `${b.col}bb`);
        g.addColorStop(0.6, `${b.col}33`);
        g.addColorStop(1, "transparent");

        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    }
  }, [frame, width, height, palette, preset, speed]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity,
        mixBlendMode: blendMode,
        pointerEvents: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        width={width / 2}
        height={height / 2}
        style={{
          width: "100%",
          height: "100%",
          filter: "blur(45px)",
          transform: "scale(1.15)",
        }}
      />
    </div>
  );
};

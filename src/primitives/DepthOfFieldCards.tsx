import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { z } from "zod";

export const DepthOfFieldCardsSchema = z.object({
  cards: z.array(z.object({
    x: z.number(),
    y: z.number(),
    rotationY: z.number(),
    blur: z.number(),
    startZ: z.number(),
    speed: z.number(),
  })).default([
    { x: 10, y: 20, rotationY: 15, blur: 8, startZ: 0, speed: 5 },
    { x: 70, y: 60, rotationY: -15, blur: 12, startZ: 0, speed: 8 },
  ]),
});

export const DepthOfFieldCards: React.FC<z.infer<typeof DepthOfFieldCardsSchema>> = ({ cards }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ perspective: 800 }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          position: "absolute", 
          top: `${card.y}%`, 
          left: `${card.x}%`,
          width: "200px", 
          height: "150px", 
          backgroundColor: "#222", 
          borderRadius: "16px",
          border: "1px solid #333",
          filter: `blur(${card.blur}px)`, 
          transform: `translateZ(${card.startZ + frame * card.speed}px) rotateY(${card.rotationY}deg)`,
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }} />
      ))}
    </AbsoluteFill>
  );
};

import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, ImageElementProps, resolveColor } from "../schema";

interface Props {
  props: ImageElementProps;
  brand: Brand;
}

export const ImageElement: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    src,
    width = 50,
    position = { x: 50, y: 50 },
    borderRadius = 16,
    animation = "scale",
    delay = 0,
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  if (frame < delay) return null;

  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 110 },
  });

  let animTransform = "";
  let animOpacity = 1;

  if (animation === "fade") {
    animOpacity = interpolate(currentFrame, [0, 10], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else if (animation === "slide-up") {
    const translateY = interpolate(spr, [0, 1], [60, 0]);
    animTransform = `translateY(${translateY}px)`;
    animOpacity = interpolate(currentFrame, [0, 8], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else {
    // "scale" default
    const scale = interpolate(spr, [0, 1], [0.8, 1]);
    animTransform = `scale(${scale})`;
    animOpacity = interpolate(currentFrame, [0, 8], [0, 1], {
      extrapolateRight: "clamp",
    });
  }

  const primaryColor = resolveColor("brand.primary", brand);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) ${animTransform}`,
        width: `${width}%`,
        opacity: animOpacity,
        zIndex: 10,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          borderRadius: `${borderRadius}px`,
          overflow: "hidden",
          boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${primaryColor}33`,
          border: "1px solid rgba(255, 255, 255, 0.12)",
          width: "100%",
        }}
      >
        <Img
          src={src}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

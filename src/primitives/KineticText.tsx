import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, KineticTextProps, resolveColor } from "../schema";

interface Props {
  props: KineticTextProps;
  brand: Brand;
}

export const KineticText: React.FC<Props> = ({ props, brand }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    text,
    fontSize = 48,
    fontWeight = 700,
    color = "brand.text",
    position = { x: 50, y: 50 },
    align = "center",
    animation = "fade-up",
    delay = 0,
    maxWidth = 90,
    highlightWords = [],
    letterSpacing = "-0.02em",
  } = props;

  const currentFrame = Math.max(0, frame - delay);
  const resolvedColor = resolveColor(color, brand);
  const primaryColor = resolveColor("brand.primary", brand);

  // Position transform styles
  const left = `${position.x}%`;
  const top = `${position.y}%`;
  const transformOrigin =
    align === "center" ? "center center" : align === "left" ? "left center" : "right center";
  const translateAlign =
    align === "center" ? "-50%, -50%" : align === "left" ? "0%, -50%" : "-100%, -50%";

  if (frame < delay) {
    return null;
  }

  // Word-by-word animation
  if (animation === "word-by-word") {
    const words = text.split(" ");
    return (
      <div
        style={{
          position: "absolute",
          left,
          top,
          transform: `translate(${translateAlign})`,
          transformOrigin,
          width: maxWidth ? `${maxWidth}%` : "auto",
          textAlign: align,
          fontFamily: brand.font,
          fontSize: `${fontSize}px`,
          fontWeight,
          letterSpacing,
          lineHeight: 1.15,
          color: resolvedColor,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
          gap: "0.28em",
        }}
      >
        {words.map((word, index) => {
          const wordDelay = index * 3;
          const wordFrame = Math.max(0, currentFrame - wordDelay);
          const spr = spring({
            frame: wordFrame,
            fps,
            config: { damping: 14, mass: 0.6, stiffness: 120 },
          });

          const translateY = interpolate(spr, [0, 1], [30, 0]);
          const opacity = interpolate(wordFrame, [0, 6], [0, 1], {
            extrapolateRight: "clamp",
          });

          const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          const isHighlighted = highlightWords.some((hw) => {
            const cleanHw = hw.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            return cleanHw.length > 0
              ? cleanHw === cleanWord
              : hw.trim().toLowerCase() === word.trim().toLowerCase();
          });

          return (
            <span
              key={index}
              style={{
                display: "inline-block",
                transform: `translateY(${translateY}px) scale(${spr})`,
                opacity,
                color: isHighlighted ? primaryColor : resolvedColor,
                textShadow: isHighlighted
                  ? `0 0 35px ${primaryColor}66`
                  : undefined,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  }

  // Default animations (fade-up, scale-in, glow-punch, reveal-left)
  const spr = spring({
    frame: currentFrame,
    fps,
    config: { damping: 14, mass: 0.7, stiffness: 100 },
  });

  let animTransform = "";
  let animOpacity = 1;
  let textShadow = undefined;

  if (animation === "fade-up") {
    const translateY = interpolate(spr, [0, 1], [40, 0]);
    animTransform = `translateY(${translateY}px)`;
    animOpacity = interpolate(currentFrame, [0, 8], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else if (animation === "scale-in") {
    const scale = interpolate(spr, [0, 1], [0.75, 1]);
    animTransform = `scale(${scale})`;
    animOpacity = interpolate(currentFrame, [0, 6], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else if (animation === "reveal-left") {
    const translateX = interpolate(spr, [0, 1], [-60, 0]);
    animTransform = `translateX(${translateX}px)`;
    animOpacity = interpolate(currentFrame, [0, 8], [0, 1], {
      extrapolateRight: "clamp",
    });
  } else if (animation === "glow-punch") {
    const scale = interpolate(spr, [0, 1], [1.3, 1]);
    animTransform = `scale(${scale})`;
    animOpacity = interpolate(currentFrame, [0, 4], [0, 1], {
      extrapolateRight: "clamp",
    });
    const glowIntensity = interpolate(currentFrame, [0, 10, 25], [0, 40, 15]);
    textShadow = `0 0 ${glowIntensity}px ${primaryColor}`;
  }

  const renderContent = () => {
    if (!highlightWords || highlightWords.length === 0) {
      return text;
    }
    const words = text.split(" ");
    return words.map((word, i) => {
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const isHighlighted = highlightWords.some((hw) => {
        const cleanHw = hw.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        return cleanHw.length > 0
          ? cleanHw === cleanWord
          : hw.trim().toLowerCase() === word.trim().toLowerCase();
      });
      return (
        <span
          key={i}
          style={{
            color: isHighlighted ? primaryColor : resolvedColor,
            textShadow: isHighlighted ? `0 0 35px ${primaryColor}66` : undefined,
          }}
        >
          {word}{i < words.length - 1 ? " " : ""}
        </span>
      );
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        transform: `translate(${translateAlign}) ${animTransform}`,
        transformOrigin,
        width: maxWidth ? `${maxWidth}%` : "auto",
        textAlign: align,
        fontFamily: brand.font,
        fontSize: `${fontSize}px`,
        fontWeight,
        letterSpacing,
        lineHeight: 1.15,
        color: resolvedColor,
        opacity: animOpacity,
        textShadow,
      }}
    >
      {renderContent()}
    </div>
  );
};

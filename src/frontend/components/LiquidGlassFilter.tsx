import React from "react";

/**
 * Embedded SVG Displacement Map & Noise Refraction Filters
 * Provides authentic optical light bending through liquid (5% scale distortion)
 */
export const LiquidGlassFilter: React.FC = () => {
  return (
    <svg
      className="fixed pointer-events-none -z-50 w-0 h-0 overflow-hidden"
      aria-hidden="true"
    >
      <defs>
        {/* SVG displacement map to warp background shapes and mimic light bending through liquid */}
        <filter
          id="liquid-refract"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Optical 5% micro-refraction grain */}
        <filter id="liquid-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves="3"
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.05 0"
          />
        </filter>
      </defs>
    </svg>
  );
};

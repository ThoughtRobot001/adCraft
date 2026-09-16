import React from "react";

interface AdCraftLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  hideText?: boolean;
}

export const AdCraftLogo: React.FC<AdCraftLogoProps> = ({
  className = "",
  size = "md",
  hideText = false,
}) => {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-lg font-bold",
    md: "text-xl font-bold tracking-tight",
    lg: "text-2xl font-extrabold tracking-tight",
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Geometric Origami Ribbon Mark */}
      <div
        className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center`}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Facet 1: Left vibrant wing */}
          <path d="M6 8L16 2L20 14L8 18L6 8Z" fill="#00E575" />
          {/* Facet 2: Upper right facet */}
          <path d="M16 2L30 10L20 14L16 2Z" fill="#10B981" />
          {/* Facet 3: Lower right facet */}
          <path d="M20 14L30 10L26 28L18 20L20 14Z" fill="#059669" />
          {/* Facet 4: Bottom anchor facet */}
          <path d="M8 18L20 14L18 20L10 32L8 18Z" fill="#00C964" />
        </svg>
      </div>

      {!hideText && (
        <span
          className={`${textSizes[size]} text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif]`}
        >
          AdCraft
        </span>
      )}
    </div>
  );
};

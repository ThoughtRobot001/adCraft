import { Brand } from "./brand";

export * from "./brand";
export * from "./primitives";
export * from "./scene";
export * from "./composition";

/**
 * Resolves dynamic brand color references like "brand.primary" or "brand.accent"
 * to their actual hex values from the composition's brand settings.
 */
export function resolveColor(colorStr: string, brand: Brand): string {
  const isLight = brand.theme === "editorial-light" || brand.colors.background === "#F8F7F3" || brand.colors.background === "#FFFFFF" || brand.colors.background === "#F8FAFC";

  if (!colorStr) return isLight ? "#0F172A" : (brand.colors.text || "#F9FAFB");
  
  if (colorStr.startsWith("brand.")) {
    const key = colorStr.replace("brand.", "") as keyof typeof brand.colors;
    if (brand.colors && brand.colors[key]) {
      const val = brand.colors[key];
      // Auto-correct white/pale text on light backgrounds
      if (key === "text" && isLight && (val === "#F9FAFB" || val === "#F8FAFC" || val === "#FFFFFF" || val.toLowerCase() === "#fff")) {
        return "#0F172A";
      }
      if (key === "muted" && isLight && (val === "#9CA3AF" || val === "#94A3B8")) {
        return "#64748B";
      }
      return val;
    }
    // Fallback if key doesn't match
    if (key === "primary") return brand.colors.primary || (isLight ? "#1E293B" : "#6366F1");
    if (key === "secondary") return brand.colors.secondary || (isLight ? "#334155" : "#4F46E5");
    if (key === "accent") return brand.colors.accent || (isLight ? "#0284C7" : "#10B981");
    if (key === "background") return isLight ? "#F8F7F3" : (brand.colors.background || "#0B0F19");
    if (key === "text") return isLight ? "#0F172A" : (brand.colors.text || "#F9FAFB");
    if (key === "muted") return isLight ? "#64748B" : (brand.colors.muted || "#9CA3AF");
  }

  // Prevent white text on light canvas if explicitly passed
  if (isLight && (colorStr.toLowerCase() === "#ffffff" || colorStr.toLowerCase() === "#fff" || colorStr === "rgba(255, 255, 255, 1)")) {
    return "#0F172A";
  }

  return colorStr;
}

/**
 * Returns theme-safe typography and surface design tokens.
 */
export function getThemeTokens(brand: Brand) {
  const isLight = brand.theme === "editorial-light" || brand.colors.background === "#F8F7F3" || brand.colors.background === "#FFFFFF" || brand.colors.background === "#F8FAFC";

  return {
    isLight,
    text: isLight ? "#0F172A" : "#FFFFFF",
    textMuted: isLight ? "#64748B" : "#94A3B8",
    cardBg: isLight ? "#FFFFFF" : "rgba(15, 23, 42, 0.85)",
    cardBorder: isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.12)",
    cardShadow: isLight
      ? "0 20px 40px -15px rgba(0, 0, 0, 0.06), 0 2px 10px rgba(0, 0, 0, 0.04)"
      : "0 25px 60px -10px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.5)",
    surfaceMuted: isLight ? "#F1F5F9" : "rgba(255, 255, 255, 0.05)",
  };
}

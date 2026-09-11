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
  if (!colorStr) return brand.colors.text;
  
  if (colorStr.startsWith("brand.")) {
    const key = colorStr.replace("brand.", "") as keyof typeof brand.colors;
    if (brand.colors && brand.colors[key]) {
      return brand.colors[key];
    }
    // Fallback if key doesn't match
    if (key === "primary") return brand.colors.primary || "#6366F1";
    if (key === "secondary") return brand.colors.secondary || "#4F46E5";
    if (key === "accent") return brand.colors.accent || "#10B981";
    if (key === "background") return brand.colors.background || "#0B0F19";
    if (key === "text") return brand.colors.text || "#F9FAFB";
    if (key === "muted") return brand.colors.muted || "#9CA3AF";
  }

  return colorStr;
}

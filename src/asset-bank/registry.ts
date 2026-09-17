import { ALL_ASSETS } from "./assets";
import { AssetCategory, AssetMetadata, VisualKit } from "./types";
import { BrandProfile } from "../stages/types";
import { CampaignBrief } from "../ai/types";

// Curated Cohesive Visual Kits
export const CURATED_VISUAL_KITS: VisualKit[] = [
  {
    id: "kit-editorial-light",
    name: "Editorial Sand & Serif Luxury",
    tone: "editorial-light",
    description: "Warm tactile paper grain, soft ambient elevation shadows, and minimal monochrome CTA buttons.",
    backgroundAssetId: "bg-editorial-sand-grain",
    cardStyleAssetId: "card-soft-elevated",
    deviceAssetId: "device-macos-safari-studio",
    buttonStyleAssetId: "btn-minimal-editorial",
    atmosphereAssetId: "atmo-editorial-studio",
  },
  {
    id: "kit-cinematic-dark",
    name: "Cinematic Midnight Broadcast",
    tone: "authoritative",
    description: "Deep obsidian-to-navy background, frosted glassmorphic cards, MacBook Pro 16\", and glowing CTA.",
    backgroundAssetId: "bg-cinematic-midnight-mesh",
    cardStyleAssetId: "card-frosted-glassmorphism",
    deviceAssetId: "device-macbook-pro-16",
    buttonStyleAssetId: "btn-glow-primary",
    atmosphereAssetId: "atmo-dark-cinematic",
  },
  {
    id: "kit-cyber-high-velocity",
    name: "Cyber Obsidian & Electric Rim",
    tone: "high-velocity",
    description: "Ultra-deep obsidian backdrop with electric rim glows, dark obsidian cards, and iPhone 16 Pro titanium frame.",
    backgroundAssetId: "bg-cyber-obsidian-glow",
    cardStyleAssetId: "card-dark-obsidian",
    deviceAssetId: "device-iphone16-pro-titanium",
    buttonStyleAssetId: "btn-holographic-shimmer",
    atmosphereAssetId: "atmo-dark-cinematic",
  },
  {
    id: "kit-clean-tech",
    name: "Clean Slate & Sharp Enterprise",
    tone: "technical",
    description: "Slate engineering background, micro-dot grid, sharp enterprise cards, and restrained clear atmosphere.",
    backgroundAssetId: "bg-studio-clean-slate",
    cardStyleAssetId: "card-sharp-enterprise",
    deviceAssetId: "device-macos-safari-studio",
    buttonStyleAssetId: "btn-glow-primary",
    atmosphereAssetId: "atmo-clean-tech",
  },
  {
    id: "kit-boreal-aurora",
    name: "Boreal Aurora & Liquid Glass",
    tone: "creative",
    description: "Dynamic fluid aurora shader background, translucent liquid glass cards, and holographic CTA button.",
    backgroundAssetId: "bg-shader-fluid-aurora",
    cardStyleAssetId: "card-boreal-liquid-glass",
    deviceAssetId: "device-macbook-pro-16",
    buttonStyleAssetId: "btn-holographic-shimmer",
    atmosphereAssetId: "atmo-dust-scratches",
    shaderAssetId: "shader-fluid-aurora",
  },
  {
    id: "kit-domain-warp",
    name: "Domain Warp & Modern Fintech Flow",
    tone: "fintech",
    description: "Mathematical domain-warp flow gradient, frosted glass cards, and luminous primary action button.",
    backgroundAssetId: "bg-shader-domain-warp",
    cardStyleAssetId: "card-frosted-glassmorphism",
    deviceAssetId: "device-macbook-pro-16",
    buttonStyleAssetId: "btn-glow-primary",
    atmosphereAssetId: "atmo-dark-cinematic",
    shaderAssetId: "shader-domain-warp",
  },
  {
    id: "kit-fintech-mobile",
    name: "Mobile Velocity & Titanium Frame",
    tone: "mobile-consumer",
    description: "Cosmic particle field, iPhone 16 Pro titanium chassis, and frosted notification cascade.",
    backgroundAssetId: "bg-shader-fluid-aurora",
    cardStyleAssetId: "card-frosted-glassmorphism",
    deviceAssetId: "device-iphone16-pro-titanium",
    buttonStyleAssetId: "btn-glow-primary",
    atmosphereAssetId: "atmo-clean-tech",
  },
  {
    id: "kit-developer-terminal",
    name: "Developer Terminal & Command Pill",
    tone: "developer-focused",
    description: "High-density engineering slate, sharp enterprise panels, macOS browser, and command hotkey CTA.",
    backgroundAssetId: "bg-studio-clean-slate",
    cardStyleAssetId: "card-sharp-enterprise",
    deviceAssetId: "device-macos-safari-studio",
    buttonStyleAssetId: "btn-enterprise-pill",
    atmosphereAssetId: "atmo-clean-tech",
  },
];

export const ALL_VISUAL_KITS: VisualKit[] = CURATED_VISUAL_KITS;

const assetMap = new Map<string, AssetMetadata>(ALL_ASSETS.map((a) => [a.id, a]));
const kitMap = new Map<string, VisualKit>(CURATED_VISUAL_KITS.map((k) => [k.id, k]));

export function getAsset(id: string): AssetMetadata | undefined {
  return assetMap.get(id);
}

export function getVisualKit(id: string): VisualKit | undefined {
  return kitMap.get(id);
}

export function queryAssets(filter: {
  category?: AssetCategory;
  tag?: string;
  brandFit?: string;
}): AssetMetadata[] {
  return ALL_ASSETS.filter((asset) => {
    if (filter.category && asset.category !== filter.category) return false;
    if (filter.tag && !asset.tags.includes(filter.tag)) return false;
    if (filter.brandFit && !asset.brandFit.includes(filter.brandFit)) return false;
    return true;
  });
}

/**
 * Intelligently selects a cohesive VisualKit based on brand identity, voice, and campaign brief.
 */
export function selectVisualKit(
  profile: BrandProfile,
  brief?: CampaignBrief
): VisualKit {
  const brand = profile.identity;
  const isEditorial =
    brand.theme === "editorial-light" ||
    brand.colors.background?.toLowerCase() === "#f8f7f3" ||
    brand.colors.background?.toLowerCase() === "#ffffff" ||
    brand.colors.background?.toLowerCase() === "#f8fafc";

  if (isEditorial) {
    return CURATED_VISUAL_KITS[0]; // kit-editorial-light
  }

  const tone = profile.voice.tone?.toLowerCase() || "";
  const goal = brief?.goal?.toLowerCase() || "";
  const text = `${brand.name} ${brief?.productDescription || ""} ${brief?.keyFeatures?.join(" ") || ""}`.toLowerCase();

  // 1. Creative / Fluid Aurora aesthetic
  if (tone === "creative" || text.includes("aurora") || text.includes("generative") || text.includes("liquid")) {
    return CURATED_VISUAL_KITS[4]; // kit-boreal-aurora
  }

  // 2. Mobile consumer / iPhone Frame
  if (
    goal === "mobile_download" ||
    text.includes("mobile app") ||
    text.includes("ios app") ||
    text.includes("iphone") ||
    brief?.aspectRatio === "9:16"
  ) {
    return CURATED_VISUAL_KITS[6]; // kit-fintech-mobile
  }

  // 3. Modern Fintech / Flow
  if (
    tone === "fintech" ||
    text.includes("fintech") ||
    text.includes("payment") ||
    text.includes("billing") ||
    text.includes("checkout")
  ) {
    return CURATED_VISUAL_KITS[5]; // kit-domain-warp
  }

  // 4. High-velocity / Crypto / Cyberpunk
  if (
    tone === "high-velocity" ||
    tone === "cyberpunk" ||
    text.includes("crypto") ||
    text.includes("web3") ||
    text.includes("velocity")
  ) {
    return CURATED_VISUAL_KITS[2]; // kit-cyber-high-velocity
  }

  // 5. Developer Terminal / CLI
  if (
    tone === "developer-focused" ||
    text.includes("terminal") ||
    text.includes("cli") ||
    text.includes("devops")
  ) {
    return CURATED_VISUAL_KITS[7]; // kit-developer-terminal
  }

  // 6. Developer tools / Engineering / Clean Tech
  if (
    tone === "minimalist" ||
    tone === "technical" ||
    text.includes("database") ||
    text.includes("sql") ||
    text.includes("cloud")
  ) {
    return CURATED_VISUAL_KITS[3]; // kit-clean-tech
  }

  // 7. Default to broadcast-grade cinematic dark
  return CURATED_VISUAL_KITS[1]; // kit-cinematic-dark
}

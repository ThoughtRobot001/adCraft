import { AssetMetadata } from "../types";

export const CARD_ASSETS: AssetMetadata[] = [
  {
    id: "card-frosted-glassmorphism",
    category: "card",
    name: "Frosted Glassmorphism",
    description: "Multi-stop backdrop blur with luminous translucent borders and deep multi-stage elevation.",
    tags: ["glass", "modern", "blur", "translucent", "elevation"],
    brandFit: ["authoritative", "technical", "enterprise", "modern"],
    properties: {
      borderRadius: "16px",
      backdropFilter: "blur(28px)",
      dark: {
        backgroundColor: "rgba(17, 24, 39, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.14)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5), 0 0 24px rgba(99, 102, 241, 0.1)",
      },
      light: {
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.08), 0 4px 14px rgba(0, 0, 0, 0.03)",
      },
    },
    usageNotes: "Standard for notification cascades, agent task cards, and modal previews in cinematic dark mode.",
  },
  {
    id: "card-soft-elevated",
    category: "card",
    name: "Soft Elevated Luxury",
    description: "Warm, tactile card with ultra-soft ambient shadow diffusion and crisp microscopic edge highlights.",
    tags: ["light", "editorial", "luxury", "tactile", "warm"],
    brandFit: ["editorial-light", "authoritative", "minimalist"],
    properties: {
      borderRadius: "16px",
      backdropFilter: "blur(20px)",
      dark: {
        backgroundColor: "rgba(23, 29, 44, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 18px 45px rgba(0, 0, 0, 0.35)",
      },
      light: {
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        border: "1px solid rgba(0, 0, 0, 0.07)",
        boxShadow: "0 22px 55px rgba(0, 0, 0, 0.07), 0 4px 14px rgba(0, 0, 0, 0.03)",
      },
    },
    usageNotes: "Essential for editorial light mode. Complements Newsreader serif headings and contract redlines.",
  },
  {
    id: "card-sharp-enterprise",
    category: "card",
    name: "Sharp Enterprise Grid",
    description: "Compact, geometric panel treatment with high data density, 12px radius, and razor-sharp borders.",
    tags: ["enterprise", "grid", "geometric", "crisp", "dense"],
    brandFit: ["technical", "authoritative", "developer-focused"],
    properties: {
      borderRadius: "12px",
      backdropFilter: "none",
      dark: {
        backgroundColor: "#111827",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        boxShadow: "0 14px 35px rgba(0, 0, 0, 0.45)",
      },
      light: {
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.12)",
        boxShadow: "0 14px 35px rgba(0, 0, 0, 0.06)",
      },
    },
    usageNotes: "Perfect for data tables, audit logs, and SOC2 compliance matrices where clarity beats decoration.",
  },
  {
    id: "card-dark-obsidian",
    category: "card",
    name: "Dark Obsidian & Rim Glow",
    description: "Monolithic deep obsidian card with electric accent border glow and floating specular reflection.",
    tags: ["dark", "obsidian", "glow", "electric", "crypto"],
    brandFit: ["high-velocity", "cyberpunk", "technical"],
    properties: {
      borderRadius: "16px",
      backdropFilter: "blur(24px)",
      dark: {
        backgroundColor: "rgba(10, 12, 18, 0.95)",
        border: "1px solid rgba(99, 102, 241, 0.35)",
        boxShadow: "0 28px 75px rgba(0, 0, 0, 0.7), 0 0 35px rgba(99, 102, 241, 0.18)",
      },
      light: {
        backgroundColor: "rgba(240, 242, 248, 0.95)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        boxShadow: "0 20px 45px rgba(99, 102, 241, 0.1)",
      },
    },
    usageNotes: "Best for AI agent execution steps and live diff viewers in high-velocity tech ads.",
  },
  {
    id: "card-boreal-liquid-glass",
    category: "card",
    name: "Boreal Liquid Glass",
    description: "Deep translucent glass refraction with chromatic edge dispersion and high-specular rim lighting.",
    tags: ["liquid-glass", "boreal", "refraction", "luxury-tech", "chromatic"],
    brandFit: ["modern", "fintech", "creative", "luxury"],
    properties: {
      borderRadius: "20px",
      backdropFilter: "blur(36px) saturate(180%)",
      dark: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "1.5px solid rgba(255, 255, 255, 0.22)",
        boxShadow: "0 30px 70px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.4)",
      },
      light: {
        backgroundColor: "rgba(255, 255, 255, 0.75)",
        border: "1.5px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.09), inset 0 1px 2px rgba(255, 255, 255, 0.9)",
      },
    },
    usageNotes: "Pairs with fluid aurora shader backgrounds for breathtaking consumer tech spots.",
  },
  {
    id: "card-neumorphic-minimal",
    category: "card",
    name: "Neumorphic Minimalist Surface",
    description: "Clean monolithic panel with soft dual-tone debossed shadows and subtle tactile edge.",
    tags: ["neumorphic", "soft", "minimalist", "clean", "tactile"],
    brandFit: ["minimalist", "editorial-light"],
    properties: {
      borderRadius: "18px",
      backdropFilter: "none",
      dark: {
        backgroundColor: "#161B26",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: "10px 10px 30px #0D1017, -10px -10px 30px #1F2635",
      },
      light: {
        backgroundColor: "#F1F5F9",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "10px 10px 25px #D1D5DB, -10px -10px 25px #FFFFFF",
      },
    },
    usageNotes: "Provides tangible physical weight without noisy glowing borders.",
  },
];

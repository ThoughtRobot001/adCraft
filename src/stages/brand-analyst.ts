import { BrandIngestor, BrandInput } from "../ingestion";
import { CampaignBrief } from "../ai/types";
import { GeminiClient } from "./gemini-client";
import { BrandProfile } from "./types";

export class BrandAnalyst {
  private ingestor = new BrandIngestor();
  private gemini = new GeminiClient();

  async analyze(input: BrandInput, brief: CampaignBrief): Promise<BrandProfile> {
    const brand = await this.ingestor.ingest(input);

    if (this.gemini.hasKey()) {
      try {
        console.log("🔍 [Stage 1/7 - Brand Analyst] Deep brand analysis via Gemini...");
        return await this.analyzeWithLLM(brand, brief);
      } catch (err: any) {
        console.warn("⚠️ Gemini brand analysis failed, using deterministic brand intelligence:", err.message);
      }
    }

    console.log("⚡ [Stage 1/7 - Brand Analyst] Deterministic brand intelligence formulated.");
    return this.synthesizeBrandProfile(brand, brief);
  }

  private async analyzeWithLLM(brand: any, brief: CampaignBrief): Promise<BrandProfile> {
    const systemPrompt = `You are an executive brand strategist at a top-tier creative studio.
Analyze this brand and produce a comprehensive BrandProfile in JSON matching this exact structure:
{
  "voice": {
    "tone": "technical" | "authoritative" | "urgent" | "aspirational" | "playful" | "minimalist",
    "personality": "2-3 sentences describing personality",
    "avoidWords": ["buzzword1", "buzzword2"]
  },
  "positioning": {
    "category": "Market category",
    "competitors": ["comp1", "comp2"],
    "differentiator": "Core unique value proposition"
  },
  "audience": {
    "primary": "Target persona",
    "painPoints": ["pain1", "pain2", "pain3"],
    "motivations": ["motivation1", "motivation2"]
  }
}`;

    const userPrompt = `Brand: ${brand.name}
Tagline: ${brand.tagline || "Modern Cloud Platform"}
Product: ${brief.productName}
Description: ${brief.productDescription}
Features: ${brief.keyFeatures?.join(", ") || "Real-time sync, automated workflows"}
Goal: ${brief.goal}`;

    const aiAnalysis = await this.gemini.generateStructuredJSON<any>(systemPrompt, userPrompt);

    return {
      identity: brand,
      voice: aiAnalysis.voice || {
        tone: "technical",
        personality: "Engineered for precision and high-velocity teams.",
        avoidWords: ["synergy", "disrupt", "leverage"],
      },
      positioning: aiAnalysis.positioning || {
        category: "Cloud Software",
        competitors: ["Legacy Solutions"],
        differentiator: brief.keyFeatures?.[0] || "Next-generation automation",
      },
      audience: aiAnalysis.audience || {
        primary: brief.targetAudience || "High-growth engineering and operations leaders",
        painPoints: ["Manual friction", "Slow iteration cycles"],
        motivations: ["Scale faster", "Eliminate errors"],
      },
    };
  }

  private synthesizeBrandProfile(brand: any, brief: CampaignBrief): BrandProfile {
    const name = brand.name;
    const textContext = `${name} ${brief.productName || ""} ${brief.productDescription || ""} ${brief.customAngle || ""}`.toLowerCase();
    const isHardware = Boolean(textContext.match(/hardware|synthesizer|audio|device|tactile|encoder|aluminum|chassis|machined|headphones|speaker|gear|mechanical|physical/i));
    const isEditorial = brand.theme === "editorial-light" || Boolean(textContext.match(/wordsmith|legal|contract|law|policy|editorial|paper|writing|author|serif|compliance|aesop|botanical|luxury|apothecary|fragrance|skincare|linear|craft|minimal/i));
    const isPowerTool = Boolean(textContext.match(/launcher|raycast|command palette|alfred|omnibar|command-bar/i));
    const isConsumer = brand.theme === "consumer-vibrant" || Boolean(textContext.match(/blinkcash|cash|wallet|crypto|savings|yield|mobile|game|learn|language/i));

    if (isEditorial && (!brand.theme || brand.theme === "dark-saas")) {
      if (textContext.match(/aesop|botanical|luxury|apothecary|fragrance|skincare/i) || brand.theme === "editorial-light") {
        brand.theme = "editorial-light";
        if (!brand.colors.background || brand.colors.background === "#0B0F19") {
          brand.colors.background = "#F5F3EC";
          brand.colors.text = "#252525";
          brand.colors.muted = "#7A736E";
        }
        brand.serifFont = "'Newsreader', 'Playfair Display', Georgia, serif";
      }
    } else if (isConsumer && (!brand.theme || brand.theme === "dark-saas")) {
      brand.theme = "consumer-vibrant";
    } else if (!brand.theme) {
      brand.theme = "dark-saas";
    }

    // 1. Hardware / Tactile Audio / Industrial Monolith
    if (isHardware) {
      return {
        identity: brand,
        voice: {
          tone: "authoritative",
          personality: "Uncompromising industrial honesty, tactile precision, and sculptural Scandinavian design.",
          avoidWords: ["all-in-one platform", "game changer", "synergistic", "disruption", "cloud-native"],
        },
        positioning: {
          category: `${name} Industrial Audio Hardware`,
          competitors: ["Mass-Market Plastic Consumer Electronics", "Fragmented Software Emulators"],
          differentiator: brief.keyFeatures?.[0] || "Machined Anodized Aluminum Chassis",
        },
        audience: {
          primary: brief.targetAudience || "Musicians, sound designers, industrial purists, and hardware collectors",
          painPoints: [
            "Disposable plastic gadgets with zero tactile soul",
            "High latency and fiddly touchscreen interfaces",
            "Cluttered setups lacking tactile immediacy",
          ],
          motivations: [
            "Pure tactile immediacy and physical delight in creation",
            "Timeless museum-grade industrial hardware",
          ],
        },
      };
    }

    // 2. Editorial Luxury / Botanical Sanctuary
    if (textContext.match(/aesop|botanical|luxury|apothecary|fragrance|skincare/i)) {
      return {
        identity: brand,
        voice: {
          tone: "minimalist",
          personality: "Poetic contemplation, architectural restraint, and reverence for botanical integrity.",
          avoidWords: ["disruption", "hustle", "viral", "miracle cure", "instant fix"],
        },
        positioning: {
          category: `${name} Botanical Sensory Apothecary`,
          competitors: ["Mass-Market Synthetic Cosmetics", "Loud Commercial Beauty Brands"],
          differentiator: brief.keyFeatures?.[0] || "Cold-Pressed Botanical Extracts",
        },
        audience: {
          primary: brief.targetAudience || "Aesthetes, design purists, and discerning patrons of quiet luxury",
          painPoints: [
            "Harsh synthetic additives that compromise delicate skin",
            "Overbearing sensory noise in commercial personal care",
            "Superficial packaging lacking literary or material depth",
          ],
          motivations: [
            "Restorative quietude and sensory elevation",
            "Immaculate botanical formulation in timeless amber glass",
          ],
        },
      };
    }

    // 3. Editorial Craft Software (e.g. Linear)
    if (isEditorial) {
      return {
        identity: brand,
        voice: {
          tone: "minimalist",
          personality: "Razor-sharp focus, quiet discipline, and latency-free keyboard-first workflow.",
          avoidWords: ["all-in-one platform", "game changer", "synergistic", "disruption", "turnkey"],
        },
        positioning: {
          category: `${name} High-Craft Workspace`,
          competitors: ["Bloated Legacy Trackers", "Noisy Multi-Tool Chaos"],
          differentiator: brief.keyFeatures?.[0] || "Keyboard-First Navigation",
        },
        audience: {
          primary: brief.targetAudience || "High-velocity product teams, engineering leads, and software craftsmen",
          painPoints: [
            "Bloated legacy software that slows teams to a crawl",
            "Context switching across 10 fragmented, lagging dashboards",
            "Cluttered UIs with excessive decorative distraction",
          ],
          motivations: [
            "Execution at the speed of thought",
            "Calm, focused, uninterrupted flow state",
          ],
        },
      };
    }

    // 4. Power Tools / Velocity Launchers (e.g. Raycast)
    if (isPowerTool) {
      return {
        identity: brand,
        voice: {
          tone: "playful",
          personality: "Blazingly fast, delightfully tactile, and obsessed with shaving 50ms off every action.",
          avoidWords: ["enterprise-ready", "holistic", "synergistic", "paradigm shift"],
        },
        positioning: {
          category: `${name} Power Productivity Tool`,
          competitors: ["Mouse-Heavy Menus", "Default System Search", "Fragmented Utility Apps"],
          differentiator: brief.keyFeatures?.[0] || "Sub-50ms Command Execution",
        },
        audience: {
          primary: brief.targetAudience || "Power users, developers, Mac aficionados, and keyboard-first pros",
          painPoints: [
            "Reaching for the mouse 500 times a day to navigate deep menus",
            "Fragmented utility apps that hog memory and break focus",
            "Sluggish system search interrupting flow state",
          ],
          motivations: [
            "Executing any workflow in 2 keystrokes in under 50 milliseconds",
            "Total desktop mastery with zero friction",
          ],
        },
      };
    }

    // 5. Global Financial & Cloud Infrastructure (e.g. Stripe, Vercel)
    return {
      identity: brand,
      voice: {
        tone: "authoritative",
        personality: "Foundational global scale, bulletproof reliability, and architectural elegance.",
        avoidWords: ["all-in-one platform", "game changer", "synergistic", "disruption"],
      },
      positioning: {
        category: `${name} Global Infrastructure`,
        competitors: ["Legacy Banking Portals", "Fragmented In-House Scripts", "Sluggish Monoliths"],
        differentiator: brief.keyFeatures?.[0] || `${name} native orchestration`,
      },
      audience: {
        primary: brief.targetAudience || "CTOs, engineering executives, fintech leaders, and global founders",
        painPoints: [
          "Fragile manual pipelines causing unpredictable downtime",
          "Fragmented systems leaking revenue and slowing iteration",
          "High friction when scaling to international markets",
        ],
        motivations: [
          "99.999% uptime with enterprise peace of mind",
          "Autonomous fraud defense and multi-region settlement",
        ],
      },
    };
  }
}

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
    const isDev = name.match(/postgres|db|data|code|cloud|ai|api|server|ops/i);

    return {
      identity: brand,
      voice: {
        tone: isDev ? "technical" : "authoritative",
        personality: `Confident, highly refined, and focused on tangible velocity for modern teams.`,
        avoidWords: ["all-in-one platform", "game changer", "synergistic", "disruption"],
      },
      positioning: {
        category: `${name} Cloud Architecture`,
        competitors: ["Legacy Manual Tools", "Fragmented Scripts"],
        differentiator: brief.keyFeatures?.[0] || `${name} native orchestration`,
      },
      audience: {
        primary: brief.targetAudience || "Tech founders, developers, ops managers",
        painPoints: [
          `Wasting 15+ hours weekly maintaining manual setups`,
          `Unpredictable downtime and configuration drift`,
          `High friction when onboarding new team members`,
        ],
        motivations: [
          `10x faster execution without operational complexity`,
          `Enterprise peace of mind with continuous reliability`,
        ],
      },
    };
  }
}

import { CampaignBrief } from "../ai/types";
import { GeminiClient } from "./gemini-client";
import { BrandProfile, CreativeConcept } from "./types";

export class ConceptStrategist {
  private gemini = new GeminiClient();

  async developConcepts(
    profile: BrandProfile,
    brief: CampaignBrief
  ): Promise<{ concepts: CreativeConcept[]; selectedConcept: CreativeConcept }> {
    let concepts: CreativeConcept[];

    if (this.gemini.hasKey()) {
      try {
        console.log("💡 [Stage 2/7 - Concept Strategist] Generating 3 creative angles via Gemini...");
        concepts = await this.generateConceptsWithLLM(profile, brief);
      } catch (err: any) {
        console.warn("⚠️ Gemini concept strategy failed, using strategic concept generator:", err.message);
        concepts = this.synthesizeConcepts(profile, brief);
      }
    } else {
      console.log("⚡ [Stage 2/7 - Concept Strategist] Strategic concept synthesizer running...");
      concepts = this.synthesizeConcepts(profile, brief);
    }

    // Automatically pick the highest strategic score (User confirmed: "Automatic for now")
    const sorted = [...concepts].sort((a, b) => b.strategicScore - a.strategicScore);
    const selectedConcept = sorted[0];

    console.log(`🎯 [Concept Strategist] Selected Angle: "${selectedConcept.angleTitle}" (Score: ${selectedConcept.strategicScore}/10)`);
    console.log(`   Hook: "${selectedConcept.hook}"`);

    return {
      concepts,
      selectedConcept,
    };
  }

  private async generateConceptsWithLLM(
    profile: BrandProfile,
    brief: CampaignBrief
  ): Promise<CreativeConcept[]> {
    const systemPrompt = `You are an elite creative director at a performance ad agency.
Your task is to devise 3 DISTINCT creative advertising concepts for this brand.
Do NOT repeat structures. Give each concept a unique hook, narrative arc, scene count (3 to 5), and visual mood.
Return valid JSON:
{
  "concepts": [
    {
      "id": "concept-1",
      "angle": "pain-agitate-solve",
      "angleTitle": "Tension to Freedom",
      "hook": "Aggressive, provocative hook copy",
      "narrative": "Storyline description",
      "emotionalArc": "Frustration -> Epiphany -> Power",
      "visualMood": "Dark obsidian with neon emerald contrast",
      "estimatedSceneCount": 4,
      "strategicScore": 9.2,
      "reasoning": "Why this angle converts for this specific audience"
    }
  ]
}`;

    const userPrompt = `Brand: ${profile.identity.name}
Tone: ${profile.voice.tone}
Audience: ${profile.audience.primary}
Core Differentiator: ${profile.positioning.differentiator}
Audience Pain Points: ${profile.audience.painPoints.join("; ")}
Campaign Goal: ${brief.goal}
Key Metric: ${brief.metricsOrSocialProof?.metric || "10x"} (${brief.metricsOrSocialProof?.label || "Speedup"})`;

    const result = await this.gemini.generateStructuredJSON<{ concepts: CreativeConcept[] }>(
      systemPrompt,
      userPrompt
    );

    if (result.concepts && Array.isArray(result.concepts) && result.concepts.length > 0) {
      return result.concepts;
    }
    throw new Error("Invalid concepts returned from LLM");
  }

  private synthesizeConcepts(profile: BrandProfile, brief: CampaignBrief): CreativeConcept[] {
    const brandName = profile.identity.name;
    const diff = profile.positioning.differentiator;

    const concept1: CreativeConcept = {
      id: "concept-pain-solve",
      angle: "pain-agitate-solve",
      angleTitle: "The Broken Legacy Cycle",
      hook: `Still losing 15+ hours every week to manual ${brief.productName.toLowerCase()} tasks?`,
      narrative: `Confronts developer frustration with fragile legacy scripts, demonstrates ${brandName} automating the entire pipeline in milliseconds, and seals conversion with enterprise compliance.`,
      emotionalArc: "High Friction → Instant Relief → Confident Control",
      visualMood: "Dark glassmorphic canvas with pulsing warning badges resolving to brand glow.",
      estimatedSceneCount: 4,
      strategicScore: brief.goal === "user_acquisition" || brief.goal === "free_trial" ? 9.5 : 8.8,
      reasoning: "Pain-driven hooks consistently achieve the highest 3-second hold rate on social feeds.",
    };

    const concept2: CreativeConcept = {
      id: "concept-speedrun",
      angle: "velocity-speedrun",
      angleTitle: "Zero to Production Velocity",
      hook: `What if your database provisioned in 48 milliseconds?`,
      narrative: `Pure adrenaline speedrun: shows code running live, instant branch deployment, zero cold starts, and immediate proof numbers.`,
      emotionalArc: "Curiosity → Kinetic Surprise → Urgency to Adopt",
      visualMood: "High-contrast IDE terminal aesthetic with electric neon highlights.",
      estimatedSceneCount: 4,
      strategicScore: brief.goal === "feature_launch" ? 9.6 : 8.9,
      reasoning: "Engineers and technical buyers convert fastest when shown raw speed metrics and code execution.",
    };

    const concept3: CreativeConcept = {
      id: "concept-social-proof",
      angle: "social-proof-first",
      angleTitle: "The Enterprise Migration",
      hook: `Why high-velocity teams are abandoning legacy setups for ${brandName}.`,
      narrative: `Opens with top-tier validation, showcases mission-critical architecture at scale, proves 99.99% reliability, and invites enterprise demo bookings.`,
      emotionalArc: "FOMO → Reassurance → Strategic Action",
      visualMood: "Polished corporate glassmorphism with glowing certification emblems.",
      estimatedSceneCount: 4,
      strategicScore: brief.goal === "book_demo" ? 9.7 : 8.5,
      reasoning: "For demo conversions, proof and peer adoption de-risk the purchasing decision immediately.",
    };

    return [concept1, concept2, concept3];
  }
}

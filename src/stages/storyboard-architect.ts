import { CampaignBrief } from "../ai/types";
import { GeminiClient } from "./gemini-client";
import { BrandProfile, CreativeConcept, Storyboard, StoryboardScene } from "./types";

export class StoryboardArchitect {
  private gemini = new GeminiClient();

  async designStoryboard(
    concept: CreativeConcept,
    profile: BrandProfile,
    brief: CampaignBrief
  ): Promise<Storyboard> {
    if (this.gemini.hasKey()) {
      try {
        console.log("🎬 [Stage 3/7 - Storyboard Architect] Crafting narrative storyboard via Gemini...");
        return await this.designWithLLM(concept, profile, brief);
      } catch (err: any) {
        console.warn("⚠️ Gemini storyboarding failed, using expert motion storyboard architect:", err.message);
      }
    }

    console.log("⚡ [Stage 3/7 - Storyboard Architect] Architectural storyboard synthesized.");
    return this.synthesizeStoryboard(concept, profile, brief);
  }

  private async designWithLLM(
    concept: CreativeConcept,
    profile: BrandProfile,
    brief: CampaignBrief
  ): Promise<Storyboard> {
    const systemPrompt = `You are a world-class motion graphics director and advertising story architect.
Your job is to translate a creative advertising concept into an internal production Storyboard.
Design between 3 to 5 scenes totaling 15 seconds.
Every scene must have clear psychological intent, typography copy (headlineCopy), visual description, and element intents.

Available element intent roles:
- "hook-headline", "solution-headline", "cta-headline", "headline" (Kinetic typography copy)
- "product-demo", "app-window" (UI mockup / code window / kanban board)
- "metric-hero" (Animated number / stat counter)
- "feature-pills", "problem-badge", "trust-badges" (Floating badges / tag pills)
- "split-screen", "comparison-table" (Side-by-side or table comparison)
- "testimonial-card" (Social proof quote card)
- "progress-bar" (Speed or completion indicator)
- "cta-button" (Interactive primary call-to-action button)
- "brand-monogram" (Animated logo mark reveal)

Return valid JSON:
{
  "totalDurationSeconds": 15,
  "narrativeArc": "Tension -> Solution -> Proof -> Action",
  "pacingStrategy": "Rapid visual hook (3s), fluid product discovery (4s), metric anchor (4s), high-urgency close (4s)",
  "scenes": [
    {
      "id": "scene-1",
      "sceneIndex": 1,
      "name": "The Agitation Hook",
      "intent": "Disrupt scrolling feed with unignorable pain question",
      "durationSeconds": 3.0,
      "emotionalBeat": "Tension and recognition",
      "headlineCopy": "...",
      "supportingCopy": "...",
      "visualDescription": "...",
      "pacingNotes": "Stagger elements by 6-12 frames",
      "elementIntents": [
        { "role": "hook-headline", "description": "Kinetic typography text", "importance": "hero" },
        { "role": "problem-badge", "description": "Warning badges", "importance": "supporting" }
      ]
    }
  ]
}`;

    const userPrompt = `Concept: ${concept.angleTitle} (${concept.angle})
Hook: "${concept.hook}"
Narrative: ${concept.narrative}
Brand: ${profile.identity.name} (${profile.identity.colors.primary})
Tone: ${profile.voice.tone}
Product: ${brief.productName}
Key Proof: ${brief.metricsOrSocialProof?.metric || "10x"} ${brief.metricsOrSocialProof?.label || "Speedup"}`;

    const result = await this.gemini.generateStructuredJSON<Storyboard>(systemPrompt, userPrompt);
    result.concept = concept;
    return result;
  }

  private synthesizeStoryboard(
    concept: CreativeConcept,
    profile: BrandProfile,
    brief: CampaignBrief
  ): Storyboard {
    const brandName = profile.identity.name;
    const isCodeFocused = concept.angle === "velocity-speedrun";

    const scenes: StoryboardScene[] = [
      {
        id: "scene-1-hook",
        sceneIndex: 1,
        name: "The Disruptive Hook",
        intent: "Seize viewer attention within 800ms by framing the cost of legacy habits.",
        durationSeconds: 3.0,
        emotionalBeat: "Friction & Tension",
        headlineCopy: concept.hook,
        visualDescription: "Deep obsidian backdrop with glowing red constraint badges appearing under kinetic copy.",
        pacingNotes: "Word-by-word reveal with fast 3-frame stagger; badges arrive at frame 20.",
        elementIntents: [
          { role: "hook-headline", description: "Bold kinetic headline", importance: "hero" },
          { role: "problem-badge", description: "Friction pill badges", importance: "supporting" },
        ],
      },
      {
        id: "scene-2-showcase",
        sceneIndex: 2,
        name: "The Velocity Discovery",
        intent: `Show ${brandName} replacing friction with effortless modern execution.`,
        durationSeconds: 4.0,
        emotionalBeat: "Relief & Breakthrough",
        headlineCopy: isCodeFocused
          ? `Instant infrastructure with zero configuration.`
          : `One unified platform for modern ${brief.productName.toLowerCase()}.`,
        visualDescription: isCodeFocused
          ? "3D developer window showing live SDK code provisioning instant branches in 48ms."
          : "3D glassmorphic command center with real-time analytics curve and live status badges.",
        pacingNotes: "Headline reveals at 0f; 3D perspective window glides in at 10f with floating physics.",
        elementIntents: [
          { role: "hook-headline", description: "Solution headline", importance: "hero" },
          { role: "product-mockup", description: isCodeFocused ? "Code editor window" : "Analytics dashboard window", importance: "hero" },
          { role: "status-badge", description: "Floating operational status pills", importance: "supporting" },
        ],
      },
      {
        id: "scene-3-proof",
        sceneIndex: 3,
        name: "The Quantitative Anchor",
        intent: "Anchor credibility with concrete, verifiable performance numbers.",
        durationSeconds: 4.0,
        emotionalBeat: "Confidence & Certainty",
        headlineCopy: "Proven impact at high-growth scale.",
        visualDescription: "Giant 124px glowing metric counter surging from zero, flanked by security trust badges.",
        pacingNotes: "Headline at 0f; counter animates over 35 frames with smooth cubic ease-out.",
        elementIntents: [
          { role: "hook-headline", description: "Proof headline", importance: "supporting" },
          { role: "metric-hero", description: "Big bold animated counter", importance: "hero" },
          { role: "trust-signal", description: "SOC2 and enterprise certification pills", importance: "supporting" },
        ],
      },
      {
        id: "scene-4-close",
        sceneIndex: 4,
        name: "The Decisive Action",
        intent: "Compel immediate conversion with minimal friction reassurance.",
        durationSeconds: 4.0,
        emotionalBeat: "Empowerment & Action",
        headlineCopy: brandName,
        supportingCopy: profile.identity.tagline || "The Modern Operating System",
        visualDescription: "Glowing brand monogram scale-in with glowing ambient backlight and a pulsing CTA button.",
        pacingNotes: "Monogram lands at 0f; CTA button arrives at 12f with continuous breathing pulse.",
        elementIntents: [
          { role: "brand-monogram", description: "Brand logo reveal with radial glow", importance: "hero" },
          { role: "call-to-action", description: "Pulsing primary action button", importance: "hero" },
        ],
      },
    ];

    return {
      concept,
      totalDurationSeconds: 15,
      narrativeArc: "Disrupt → Demonstrate → Prove → Convert",
      pacingStrategy: "Fast hook (3s) → Deep product showcase (4s) → Proof punch (4s) → Decisive CTA (4s)",
      scenes,
    };
  }
}

import { CampaignBrief } from "../ai/types";
import { GeminiClient } from "./gemini-client";
import { BrandProfile, CreativeConcept, NarrativeArchetype } from "./types";

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

    console.log(`🎯 [Concept Strategist] Selected Angle: "${selectedConcept.angleTitle}" [${selectedConcept.narrativeArchetype}] (Score: ${selectedConcept.strategicScore}/10, Scenes: ${selectedConcept.estimatedSceneCount})`);
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
    const systemPrompt = `You are an elite creative director at a world-class motion design studio.
Devise 3 DISTINCT creative advertising concepts for this brand.
CRITICAL DESIGN RULES:
1. Primitives are VOCABULARY, not templates. Never force a generic 4-act SaaS template.
2. Narrative archetypes MUST be chosen dynamically:
   - "editorial-manifesto": Literary voice, high negative space, restrained monumental typography (ideal for luxury, design tools, Linear, Aesop).
   - "cinematic-spectacle": Hardware/tactile precision, macro lighting, monolithic scale (ideal for physical devices, Teenage Engineering, Apple).
   - "visual-metaphor": Abstract visual representing complex value propositions (ideal for Stripe, cloud infrastructure, AI models).
   - "feature-escalation": Rapid rhythmic layering of capabilities building to a climax (ideal for Raycast, fast devtools).
   - "problem-absurdity": Surreal or exaggerated friction of status quo (ideal for consumer apps, workflow fatigue).
   - "transformation": Dramatic before/after from overwhelming chaos to effortless order.
3. Scene counts MUST vary organically between 2 and 5 scenes based on what the story demands.
Return valid JSON:
{
  "concepts": [
    {
      "id": "concept-1",
      "angle": "pain-agitate-solve",
      "angleTitle": "Tension to Freedom",
      "narrativeArchetype": "editorial-manifesto",
      "hook": "Provocative, unexpected hook copy",
      "narrative": "Storyline description",
      "emotionalArc": "Frustration -> Epiphany -> Power",
      "visualMood": "Dark obsidian with neon emerald contrast",
      "estimatedSceneCount": 3,
      "strategicScore": 9.3,
      "reasoning": "Why this specific archetype resonates deeply with this audience"
    }
  ]
}`;

    const userPrompt = `Brand: ${profile.identity.name}
Tone: ${profile.voice?.tone || "professional"}
Audience: ${profile.audience?.primary || "General Audience"}
Category: ${profile.positioning?.category || "Software"}
Core Differentiator: ${profile.positioning?.differentiator || "Quality"}
Audience Pain Points: ${(profile.audience?.painPoints || []).join("; ")}
Product Name: ${brief.productName}
Product Description: ${brief.productDescription}
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
    const cat = (profile.positioning.category || "").toLowerCase();
    const tone = profile.voice.tone;
    const textContext = `${brandName} ${brief.productName || ""} ${brief.productDescription || ""} ${cat}`.toLowerCase();

    // Archetype 1: Hardware / Tactile / Precision (e.g. Teenage Engineering, Apple, industrial design)
    if (cat.includes("hardware") || cat.includes("audio") || cat.includes("device") || cat.includes("tactile") || textContext.match(/hardware|synthesizer|audio|encoder|chassis/i)) {
      return [
        {
          id: "concept-hardware-spectacle",
          angle: "product-hero",
          angleTitle: "Tactile Monolith",
          narrativeArchetype: "cinematic-spectacle",
          hook: `Form follows emotion. Precision meets play.`,
          narrative: `A macro camera sweep across industrial aluminum details, tactile encoders, and custom mechanical switches culminating in acoustic perfection.`,
          emotionalArc: "Sensory Awe → Physical Desire → Immediate Acquisition",
          visualMood: "Brushed anodized metal, studio rim lighting, tactile monochrome palette with bold industrial accent.",
          estimatedSceneCount: 3,
          strategicScore: 9.7,
          reasoning: "Hardware buyers judge products by material honesty, tactile cues, and monolithic industrial design.",
        },
        {
          id: "concept-hardware-metaphor",
          angle: "curiosity-hook",
          angleTitle: "The Engineering Blueprint",
          narrativeArchetype: "visual-metaphor",
          hook: `Every millimeter intentional. Zero decorative compromise.`,
          narrative: `Exploded isometric view showcasing the mathematical harmony inside ${brandName}'s industrial enclosure.`,
          emotionalArc: "Curiosity → Appreciation → Obsession",
          visualMood: "High-contrast technical blueprint with stark cast shadows.",
          estimatedSceneCount: 3,
          strategicScore: 9.1,
          reasoning: "Designers and audiophiles appreciate the raw architectural integrity of unadorned hardware.",
        },
        {
          id: "concept-hardware-escalation",
          angle: "velocity-speedrun",
          angleTitle: "Instant Sonic Genesis",
          narrativeArchetype: "feature-escalation",
          hook: `From thought to sound in three tactile moves.`,
          narrative: `Rapid rhythmic montage of mechanical button snaps, parameter tweaks, and real-time audio generation.`,
          emotionalArc: "Anticipation → Kinetic Rush → Creative Mastery",
          visualMood: "Matte black with high-contrast safety-orange indicators.",
          estimatedSceneCount: 4,
          strategicScore: 9.0,
          reasoning: "Demonstrates immediate playful immediacy without needing a manual.",
        },
      ];
    }

    // Archetype 2: Power Tools / Velocity / Keyboard-First (e.g. Raycast, Alfred, Superhuman)
    if (cat.includes("productivity") || cat.includes("speed") || cat.includes("launcher") || cat.includes("tool") || textContext.match(/launcher|raycast|palette|keystroke|shortcut/i)) {
      return [
        {
          id: "concept-feature-escalation",
          angle: "velocity-speedrun",
          angleTitle: "Speed of Thought",
          narrativeArchetype: "feature-escalation",
          hook: `Never touch your mouse again.`,
          narrative: `Rapid-fire keyboard shortcuts triggering clipboard history, window snapping, API calls, and AI queries in sub-50ms keystrokes.`,
          emotionalArc: "Stunned Curiosity → Adrenaline Rush → Unstoppable Speed",
          visualMood: "Deep macOS dark mode, glowing fuzzy-search text, fluid spring physics.",
          estimatedSceneCount: 4,
          strategicScore: 9.6,
          reasoning: "Power users convert instantaneously when they see someone flying through their computer at 10x speed.",
        },
        {
          id: "concept-problem-absurdity",
          angle: "pain-agitate-solve",
          angleTitle: "The Tab Cemetery",
          narrativeArchetype: "problem-absurdity",
          hook: `47 open tabs. 12 desktop windows. And you still can't find that link.`,
          narrative: `Exaggerates the cognitive drag of context switching before cutting cleanly to ${brandName}'s single-keystroke omnibar.`,
          emotionalArc: "Painful Recognition → Sudden Calm → Total Control",
          visualMood: "Desaturated chaos collapsing into pure focused macOS typography.",
          estimatedSceneCount: 4,
          strategicScore: 9.3,
          reasoning: "Every professional feels the visceral pain of messy multitasking daily.",
        },
        {
          id: "concept-transformation-speed",
          angle: "before-after",
          angleTitle: "The Zero Latency Shift",
          narrativeArchetype: "transformation",
          hook: `What if your operating system worked as fast as your brain?`,
          narrative: `Direct side-by-side: 45 seconds of clicking through menus versus a 0.2 second keystroke with ${brandName}.`,
          emotionalArc: "Frustration → Revelation → Instant Adoption",
          visualMood: "Side-by-side comparative split screen resolving into centered hero command prompt.",
          estimatedSceneCount: 3,
          strategicScore: 9.1,
          reasoning: "Direct comparison makes the old way look laughably archaic.",
        },
      ];
    }

    // Archetype 3: Editorial / High-Craft (e.g. Linear, Aesop, Morrow Coffee, minimal premium)
    const isBotanical = Boolean(textContext.match(/aesop|botanical|luxury|apothecary|fragrance|skincare/i));
    const isCoffee = Boolean(textContext.match(/coffee|beans|roast|brew|ritual|morning|cafe|espresso|pourover|barista/i));
    if (tone === "minimalist" || cat.includes("design") || cat.includes("luxury") || cat.includes("editorial") || cat.includes("craft") || isBotanical || isCoffee) {
      return [
        {
          id: "concept-editorial-manifesto",
          angle: "product-hero",
          angleTitle: isCoffee ? "The Morning Ritual" : "The Discipline of Craft",
          narrativeArchetype: "editorial-manifesto",
          hook: isCoffee
            ? `The first cup of the day is not an afterthought. It is a ritual.`
            : isBotanical
            ? `Formulations crafted for those who demand quiet sensory elevation.`
            : `Software built for the few who still care about speed.`,
          narrative: isCoffee
            ? `Opens with the sensory anticipation of dawn, frames ${brandName}'s beautifully packaged beans as the hero, and unfolds the meditative craft of brewing something worth slowing down for.`
            : isBotanical
            ? `Opens with whisper-quiet typographic restraint, presents ${brandName}'s deliberate botanical precision, and closes on a timeless apothecary mark with vast negative space.`
            : `Opens with whisper-quiet typographic restraint, presents ${brandName}'s deliberate engineering precision, and closes on a timeless brand mark with vast negative space.`,
          emotionalArc: isCoffee ? "Sensory Anticipation → Unhurried Craft → Refined Awakening" : "Reverence → Deep Alignment → Lasting Conviction",
          visualMood: isCoffee
            ? "Rich espresso tones, warm linen backdrop, editorial serif typography, and soft atmospheric morning light."
            : isBotanical
            ? "Warm linen canvas, razor-sharp serif typography, and amber glass illumination."
            : "Deep obsidian backdrop, razor-sharp monochrome typography, generous breathing room.",
          estimatedSceneCount: 3,
          strategicScore: 9.7,
          reasoning: isCoffee
            ? "Specialty coffee drinkers value unhurried morning rituals and tangible craft over noisy advertising."
            : "High-discretion craft audiences reject noisy marketing; quiet confidence signals undisputed industry authority.",
        },
        {
          id: "concept-transformation-clarity",
          angle: "before-after",
          angleTitle: isCoffee ? "The Mindful Morning" : "Subtraction as Superiority",
          narrativeArchetype: "transformation",
          hook: isCoffee
            ? `Most coffee is made for rushing. ${brandName} is made for savoring.`
            : isBotanical
            ? `Most formulations add synthetic noise. ${brandName} eliminates it.`
            : `Most tools add clutter. ${brandName} eliminates it.`,
          narrative: isCoffee
            ? `Contrasts the chaotic, uninspired rush of generic commercial coffee with the rich, aromatic calm of ${brandName}'s single-origin craft.`
            : `Demonstrates the quiet dissolution of superfluous clutter into a single, pure, restorative ritual.`,
          emotionalArc: "Relief → Clarity → Elevation",
          visualMood: isCoffee ? "Warm terracotta and roasted umber with luminous morning highlights." : "Monochrome slate with subtle warm directional lighting.",
          estimatedSceneCount: 3,
          strategicScore: 9.4,
          reasoning: isCoffee
            ? "Direct contrast highlights the sensory superiority of specialty micro-roasting."
            : "Contrasts the chaotic industry norm with the calm sanctuary of exceptional design.",
        },
        {
          id: "concept-visual-metaphor",
          angle: "curiosity-hook",
          angleTitle: isCoffee ? "The Art of the Pour" : "Frictionless Momentum",
          narrativeArchetype: "visual-metaphor",
          hook: isCoffee ? `What does craft taste like at dawn?` : `What does absolute purity feel like?`,
          narrative: isCoffee
            ? `A macro cinematic progression through aroma, whole bean texture, and deep rich extraction.`
            : `Uses pure spatial geometry and restrained motion to demonstrate undisturbed clarity.`,
          emotionalArc: "Intrigue → Sensory Bloom → Pure Satisfaction",
          visualMood: isCoffee ? "Deep roast obsidian with golden crema accents." : "Minimalist dark canvas with crisp kinetic typography.",
          estimatedSceneCount: 3,
          strategicScore: 9.1,
          reasoning: "Appeals directly to the connoisseur's sensory appreciation.",
        },
      ];
    }

    // Default / Universal High-Performing Concepts (Infrastructure / Enterprise)
    return [
      {
        id: "concept-transformation-universal",
        angle: "pain-agitate-solve",
        angleTitle: "The Modern Infrastructure Shift",
        narrativeArchetype: "transformation",
        hook: `Still losing 15+ hours every week to manual ${brief.productName.toLowerCase()} tasks?`,
        narrative: `Confronts professional frustration with fragile manual workflows, demonstrates ${brandName} automating the entire loop in milliseconds, and seals conversion with bulletproof proof points.`,
        emotionalArc: "High Friction → Instant Relief → Confident Control",
        visualMood: "Dark glassmorphic canvas with pulsing warning badges resolving to brand glow.",
        estimatedSceneCount: 4,
        strategicScore: 9.5,
        reasoning: "Pain-driven hooks consistently achieve the highest 3-second hold rate on social feeds.",
      },
      {
        id: "concept-speedrun-universal",
        angle: "velocity-speedrun",
        angleTitle: "Zero to Production Velocity",
        narrativeArchetype: "feature-escalation",
        hook: `What if your workflow executed in 48 milliseconds?`,
        narrative: `Pure adrenaline speedrun: shows software running live, instant branch deployment, zero cold starts, and immediate proof numbers.`,
        emotionalArc: "Curiosity → Kinetic Surprise → Urgency to Adopt",
        visualMood: "High-contrast IDE terminal aesthetic with electric neon highlights.",
        estimatedSceneCount: 4,
        strategicScore: 9.3,
        reasoning: "Engineers and technical buyers convert fastest when shown raw speed metrics and code execution.",
      },
      {
        id: "concept-metaphor-universal",
        angle: "social-proof-first",
        angleTitle: "The Enterprise Migration",
        narrativeArchetype: "visual-metaphor",
        hook: `Why high-velocity teams are abandoning legacy setups for ${brandName}.`,
        narrative: `Opens with top-tier validation, showcases mission-critical architecture at scale, proves 99.99% reliability, and invites enterprise demo bookings.`,
        emotionalArc: "FOMO → Reassurance → Strategic Action",
        visualMood: "Polished corporate glassmorphism with glowing certification emblems.",
        estimatedSceneCount: 4,
        strategicScore: 9.0,
        reasoning: "For demo conversions, proof and peer adoption de-risk the purchasing decision immediately.",
      },
    ];
  }
}


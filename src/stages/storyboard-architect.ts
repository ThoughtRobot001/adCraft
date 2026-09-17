import { CampaignBrief } from "../ai/types";
import { GeminiClient } from "./gemini-client";
import { BrandProfile, CreativeConcept, Storyboard, StoryboardScene, VisualComposition } from "./types";

export class StoryboardArchitect {
  private gemini = new GeminiClient();

  async designStoryboard(
    concept: CreativeConcept,
    profile: BrandProfile,
    brief: CampaignBrief
  ): Promise<Storyboard> {
    if (this.gemini.hasKey()) {
      try {
        console.log("🎬 [Stage 3/7 - Storyboard Architect] Crafting visual storyboard via Gemini...");
        return await this.designWithLLM(concept, profile, brief);
      } catch (err: any) {
        console.warn("⚠️ Gemini storyboarding failed, using expert motion storyboard architect:", err.message);
      }
    }

    console.log(`⚡ [Stage 3/7 - Storyboard Architect] Visual Storyboard blueprint synthesized for [${concept.narrativeArchetype}].`);
    return this.synthesizeStoryboard(concept, profile, brief);
  }

  private async designWithLLM(
    concept: CreativeConcept,
    profile: BrandProfile,
    brief: CampaignBrief
  ): Promise<Storyboard> {
    const systemPrompt = `You are a world-class motion graphics director and advertising story architect.
Your job is to translate a creative advertising concept into a production Storyboard.
CRITICAL DESIGN PHILOSOPHY:
1. VISUAL STORYBOARD FIRST: Every single scene MUST specify a static visual composition blueprint (framing, focal point, negative space ratio, dominant geometry, typography grid) BEFORE any animation is considered.
2. PRIMITIVES ARE VOCABULARY, NOT TEMPLATES: Do not assemble predictable widgets. Compose deliberate layouts.
3. Narrative Archetype: ${concept.narrativeArchetype}. Respect its pacing and structural rhythm.

Return valid JSON:
{
  "totalDurationSeconds": 15,
  "narrativeArc": "Archetype-specific emotional arc",
  "pacingStrategy": "Scene by scene rhythm and timing breakdown",
  "scenes": [
    {
      "id": "scene-1",
      "sceneIndex": 1,
      "act": "manifesto",
      "name": "Scene Name",
      "intent": "Psychological objective of this scene",
      "durationSeconds": 3.5,
      "emotionalBeat": "Tension / Clarity / Awe",
      "headlineCopy": "Exact on-screen headline",
      "supportingCopy": "Optional secondary text",
      "visualDescription": "High-fidelity visual blueprint",
      "visualComposition": {
        "framing": "asymmetric-editorial",
        "focalPoint": { "x": 35, "y": 48 },
        "dominantGeometry": "asymmetric-grid",
        "negativeSpaceRatio": 0.55,
        "typographyGrid": {
          "placement": "bottom-left",
          "scaleContrast": "monumental"
        },
        "depthPlanes": {
          "background": "Deep obsidian gradient with subtle directional rim light",
          "hero": "Asymmetric kinetic headline block anchored to left margin",
          "foreground": "Quiet floating brand monogram"
        },
        "staticClimaxFrame": "High-fashion editorial poster layout with stark left-anchored typography and vast negative space"
      },
      "pacingNotes": "Stagger elements by 6-12 frames",
      "elementIntents": [
        { "role": "hook-headline", "description": "Kinetic typography text", "importance": "hero" }
      ]
    }
  ]
}`;

    const userPrompt = `Concept: ${concept.angleTitle} (${concept.angle})
Archetype: ${concept.narrativeArchetype}
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
    const archetype = concept.narrativeArchetype;

    // Archetype 1: Editorial Manifesto (e.g. Linear, Aesop, minimal luxury)
    if (archetype === "editorial-manifesto") {
      const isBotanical = Boolean(`${brandName} ${brief.productName || ""} ${brief.productDescription || ""}`.toLowerCase().match(/aesop|botanical|luxury|apothecary|fragrance|skincare/i));
      const scenes: StoryboardScene[] = [
        {
          id: "scene-1-manifesto",
          sceneIndex: 1,
          act: "manifesto",
          name: "The Quiet Provocation",
          intent: "Disrupt sensory overload through radical typographic restraint and vast negative space.",
          durationSeconds: 4.5,
          emotionalBeat: "Reverence & Intrigue",
          headlineCopy: concept.hook,
          visualDescription: isBotanical
            ? "Warm linen editorial canvas with restrained serif typography anchored to bottom-left."
            : "Deep obsidian editorial canvas with monumental lowercase typography anchored to bottom-left.",
          visualComposition: {
            framing: "asymmetric-editorial",
            focalPoint: { x: 30, y: 65 },
            dominantGeometry: "asymmetric-grid",
            negativeSpaceRatio: 0.62,
            typographyGrid: {
              placement: "bottom-left",
              scaleContrast: "monumental",
            },
            depthPlanes: {
              background: isBotanical ? "Warm linen canvas with subtle paper grain" : "Pure obsidian void with 4% micro-texture",
              hero: "Monumental restrained typography block",
              foreground: "Subtle hairline coordinate accent",
            },
            staticClimaxFrame: "Quiet luxury editorial print layout with 62% negative space and razor-sharp typographic scale.",
          },
          pacingNotes: "Slow deliberate micro-letterspacing expansion over 45 frames; total stillness thereafter.",
          elementIntents: [
            { role: "hook-headline", description: "Monumental editorial typography", importance: "hero" },
          ],
        },
        {
          id: "scene-2-artifact",
          sceneIndex: 2,
          act: "solution",
          name: isBotanical ? "The Botanical Integrity" : "The Monolithic Craft",
          intent: isBotanical ? "Showcase the immaculate purity and poetic formulation." : "Showcase the immaculate beauty and raw precision of the interface.",
          durationSeconds: 5.5,
          emotionalBeat: "Aesthetic Elevation",
          headlineCopy: isBotanical ? `Botanical precision in every formulation.` : `Every interaction calibrated for speed.`,
          supportingCopy: isBotanical ? `Cold-pressed botanical extracts. Zero synthetic noise.` : `Zero latency. Zero decorative noise.`,
          visualDescription: isBotanical
            ? "Architectural amber formulation canvas with razor-sharp serif typography and natural linen textures."
            : "Floating 3D perspective application canvas with razor-sharp typography and pristine glass reflection.",
          visualComposition: {
            framing: "wide-cinematic",
            focalPoint: { x: 50, y: 50 },
            dominantGeometry: "monolithic-vertical",
            negativeSpaceRatio: 0.52,
            typographyGrid: {
              placement: "top-left",
              scaleContrast: "editorial-restrained",
            },
            depthPlanes: {
              background: isBotanical ? "Warm sand gradient with soft organic ambient rim" : "Deep gradient with subtle directional ambient rim",
              hero: isBotanical ? "Centered bespoke amber formulation canvas" : "Centered high-precision application canvas floating in 3D perspective",
              foreground: "Soft specular sheen passing across the upper rim",
            },
            staticClimaxFrame: "Pristine industrial monolith suspended with balanced negative margins.",
          },
          pacingNotes: "Window elevates with smooth snappy ease; specular sheen sweeps across top rim at 30f.",
          elementIntents: [
            { role: "hook-headline", description: "Quiet title label", importance: "supporting" },
            { role: "product-mockup", description: isBotanical ? "Bespoke formulation canvas" : "High-precision application canvas", importance: "hero" },
          ],
        },
        {
          id: "scene-3-signature",
          sceneIndex: 3,
          act: "cta",
          name: "The Quiet Signature",
          intent: "Seal the brand authority with an unforgettable, confident brand mark.",
          durationSeconds: 5.0,
          emotionalBeat: "Conviction & Lasting Authority",
          headlineCopy: brandName,
          supportingCopy: profile.identity.tagline || (isBotanical ? "Quiet sensory elevation" : "Engineered for clarity"),
          visualDescription: "Minimalist brand monogram emerging with subtle radial glow and razor-sharp call-to-action.",
          visualComposition: {
            framing: "monumental-centered",
            focalPoint: { x: 50, y: 48 },
            dominantGeometry: "radial-bloom",
            negativeSpaceRatio: 0.58,
            typographyGrid: {
              placement: "center",
              scaleContrast: "bold-punch",
            },
            depthPlanes: {
              background: "Deep dark canvas with ultra-soft center luminescence",
              hero: "Precision brand monogram and sharp tagline",
              foreground: "Subtle primary CTA button with tactile border",
            },
            staticClimaxFrame: "Timeless brand identity lockup with high negative space and crisp typography.",
          },
          pacingNotes: "Monogram resolves at 0f; primary action button snaps in cleanly at 20f.",
          elementIntents: [
            { role: "brand-monogram", description: "Brand monogram with quiet ambient glow", importance: "hero" },
            { role: "call-to-action", description: "Restrained action trigger", importance: "supporting" },
          ],
        },
      ];

      return {
        concept,
        totalDurationSeconds: 15.0,
        narrativeArc: "Quiet Provocation → Monolithic Craft → Timeless Signature",
        pacingStrategy: "Extended reading holds, deliberate micro-motion, zero erratic movement, 60% negative space.",
        scenes,
      };
    }

    // Archetype 2: Cinematic Spectacle (e.g. Teenage Engineering, Apple hardware, industrial craft)
    if (archetype === "cinematic-spectacle") {
      const scenes: StoryboardScene[] = [
        {
          id: "scene-1-hardware-reveal",
          sceneIndex: 1,
          act: "hook",
          name: "The Industrial Monolith",
          intent: "Command awe through tactile material honesty and industrial geometry.",
          durationSeconds: 4.5,
          emotionalBeat: "Sensory Awe & Desire",
          headlineCopy: concept.hook,
          visualDescription: "Macro architectural typography framed against matte graphite and ambient orange rim light.",
          visualComposition: {
            framing: "macro-extreme",
            focalPoint: { x: 50, y: 46 },
            dominantGeometry: "diagonal-shear",
            negativeSpaceRatio: 0.56,
            typographyGrid: {
              placement: "center",
              scaleContrast: "monumental",
            },
            depthPlanes: {
              background: "Matte graphite studio backdrop with sharp rim luminescence",
              hero: "Monumental industrial typography block",
              foreground: "Subtle safety-accent hardware indicators",
            },
            staticClimaxFrame: "Stark industrial typography with dramatic scale contrast and ambient rim light.",
          },
          pacingNotes: "Monumental headline reveals with high-impact kinetic punch; subtle dust embers drift.",
          elementIntents: [
            { role: "hook-headline", description: "Monumental architectural headline", importance: "hero" },
          ],
        },
        {
          id: "scene-2-tactile-precision",
          sceneIndex: 2,
          act: "solution",
          name: "The Tactile Control Surface",
          intent: "Prove tactile delight, physical immediacy, and flawless engineering precision.",
          durationSeconds: 5.5,
          emotionalBeat: "Playful Precision",
          headlineCopy: `Every dial calibrated. Every keystroke instant.`,
          visualDescription: "Multi-plane floating interface module with tactile click triggers and responsive gauges.",
          visualComposition: {
            framing: "medium-tight",
            focalPoint: { x: 45, y: 52 },
            dominantGeometry: "horizontal-pill",
            negativeSpaceRatio: 0.44,
            typographyGrid: {
              placement: "top-left",
              scaleContrast: "bold-punch",
            },
            depthPlanes: {
              background: "Dark studio plane with geometric grid coordinates",
              hero: "Interactive control module with tactile mechanical switches",
              foreground: "Floating parameter readout pills",
            },
            staticClimaxFrame: "Harmonious balance of industrial controls, technical indicators, and clean margins.",
          },
          pacingNotes: "Switches snap in with tactile spring bounce at 12f intervals.",
          elementIntents: [
            { role: "product-mockup", description: "Interactive tactile interface", importance: "hero" },
            { role: "status-badge", description: "Precision parameter tags", importance: "supporting" },
          ],
        },
        {
          id: "scene-3-hardware-close",
          sceneIndex: 3,
          act: "cta",
          name: "The Physical Apex",
          intent: "Drive instant acquisition of the physical product.",
          durationSeconds: 5.0,
          emotionalBeat: "Acquisition Urgency",
          headlineCopy: brandName,
          supportingCopy: "Limited production run. Available now.",
          visualDescription: "Heroic centered hardware lockup with bold industrial action button.",
          visualComposition: {
            framing: "monumental-centered",
            focalPoint: { x: 50, y: 50 },
            dominantGeometry: "monolithic-vertical",
            negativeSpaceRatio: 0.50,
            typographyGrid: {
              placement: "center",
              scaleContrast: "monumental",
            },
            depthPlanes: {
              background: "Graphite pedestal with soft overhead spotlight",
              hero: "Heroic hardware device angled on pedestal",
              foreground: "High-contrast action trigger with cursor click choreography",
            },
            staticClimaxFrame: "Museum-grade product exhibition poster with centered brand anchor.",
          },
          pacingNotes: "Spotlight blooms at 0f; tactile CTA clicks firmly at 28f.",
          elementIntents: [
            { role: "brand-monogram", description: "Monolithic brand mark", importance: "hero" },
            { role: "call-to-action", description: "Tactile action button", importance: "supporting" },
          ],
        },
      ];

      return {
        concept,
        totalDurationSeconds: 15.0,
        narrativeArc: "Industrial Monolith → Tactile Control Surface → Physical Apex",
        pacingStrategy: "Heavy mechanical snaps, stark lighting transitions, rhythmic tactile feedback.",
        scenes,
      };
    }

    // Archetype 3: Feature Escalation (e.g. Raycast, fast dev tools, velocity apps)
    if (archetype === "feature-escalation") {
      const scenes: StoryboardScene[] = [
        {
          id: "scene-1-spark",
          sceneIndex: 1,
          act: "hook",
          name: "The Kinetic Spark",
          intent: "Electrify the viewer with immediate promise of boundless speed.",
          durationSeconds: 3.5,
          emotionalBeat: "Adrenaline & Focus",
          headlineCopy: concept.hook,
          visualDescription: "Staggered kinetic typography bursting into focus with neon highlight trails.",
          visualComposition: {
            framing: "medium-tight",
            focalPoint: { x: 45, y: 50 },
            dominantGeometry: "horizontal-pill",
            negativeSpaceRatio: 0.48,
            typographyGrid: {
              placement: "center",
              scaleContrast: "monumental",
            },
            depthPlanes: {
              background: "Dark obsidian matrix with subtle speed grid",
              hero: "Kinetic glow-punch typography block",
              foreground: "Floating keyboard shortcut glyph",
            },
            staticClimaxFrame: "Punchy centered typographic lockup with vivid contrast.",
          },
          pacingNotes: "Word-by-word reveal in 18 frames with rapid bloom.",
          elementIntents: [
            { role: "hook-headline", description: "Kinetic typography punch", importance: "hero" },
          ],
        },
        {
          id: "scene-2-speedrun",
          sceneIndex: 2,
          act: "escalation",
          name: "The Sub-50ms Speedrun",
          intent: "Demonstrate relentless keyboard-driven execution across multiple capabilities.",
          durationSeconds: 4.5,
          emotionalBeat: "Kinetic Thrill",
          headlineCopy: `One keystroke. Every workflow executed.`,
          visualDescription: "Rapid floating application launcher executing instant actions with live cursor trails.",
          visualComposition: {
            framing: "wide-cinematic",
            focalPoint: { x: 50, y: 52 },
            dominantGeometry: "asymmetric-grid",
            negativeSpaceRatio: 0.42,
            typographyGrid: {
              placement: "top-left",
              scaleContrast: "editorial-restrained",
            },
            depthPlanes: {
              background: "High-contrast IDE backdrop with dark glass blur",
              hero: "Fluid command palette cycling results at lightning speed",
              foreground: "Active bezier pointer executing instant click",
            },
            staticClimaxFrame: "Dense power-user workspace organized with spatial discipline and clean margins.",
          },
          pacingNotes: "Command palette drops in at 0f; 3 actions fire in rapid 10-frame successions.",
          elementIntents: [
            { role: "product-mockup", description: "Lightning-fast command window", importance: "hero" },
            { role: "status-badge", description: "Rapid execution status pills", importance: "supporting" },
          ],
        },
        {
          id: "scene-3-proof-gauge",
          sceneIndex: 3,
          act: "value-outcome",
          name: "The Velocity Gauge",
          intent: "Anchor the speed claim with explosive quantitative numbers.",
          durationSeconds: 3.5,
          emotionalBeat: "Total Validation",
          headlineCopy: `Speed that redefines your entire day.`,
          visualDescription: "Massive spring count-up counter surging to peak speed surrounded by verified badges.",
          visualComposition: {
            framing: "monumental-centered",
            focalPoint: { x: 50, y: 48 },
            dominantGeometry: "radial-bloom",
            negativeSpaceRatio: 0.46,
            typographyGrid: {
              placement: "center",
              scaleContrast: "monumental",
            },
            depthPlanes: {
              background: "Radial brand glow bloom on dark void",
              hero: "Giant 112px kinetic metric counter",
              foreground: "Validated efficiency badges",
            },
            staticClimaxFrame: "Monumental numerical sculpture commanding total visual focus.",
          },
          pacingNotes: "Counter springs up in 25 frames; badges pop with overshoot.",
          elementIntents: [
            { role: "metric-hero", description: "Surging metric counter", importance: "hero" },
            { role: "trust-signal", description: "Performance verification badges", importance: "supporting" },
          ],
        },
        {
          id: "scene-4-instant-cta",
          sceneIndex: 4,
          act: "cta",
          name: "The Instant Launch",
          intent: "Compel immediate install or free trial trigger.",
          durationSeconds: 3.5,
          emotionalBeat: "Empowerment & Action",
          headlineCopy: brandName,
          supportingCopy: profile.identity.tagline || "Download for free. Works in seconds.",
          visualDescription: "Pulsing brand lockup with glowing install CTA and animated cursor click.",
          visualComposition: {
            framing: "monumental-centered",
            focalPoint: { x: 50, y: 50 },
            dominantGeometry: "monolithic-vertical",
            negativeSpaceRatio: 0.52,
            typographyGrid: {
              placement: "center",
              scaleContrast: "bold-punch",
            },
            depthPlanes: {
              background: "Refined dark canvas with brand accent glow",
              hero: "Glowing brand monogram",
              foreground: "Action button with expanding ripple ring",
            },
            staticClimaxFrame: "High-converting action terminal with immediate visual payoff.",
          },
          pacingNotes: "Monogram resolves at 0f; CTA button clicks at 24f with spring ripple.",
          elementIntents: [
            { role: "brand-monogram", description: "Brand monogram", importance: "hero" },
            { role: "call-to-action", description: "Glowing action button", importance: "supporting" },
          ],
        },
      ];

      return {
        concept,
        totalDurationSeconds: 15.0,
        narrativeArc: "Kinetic Spark → Sub-50ms Speedrun → Velocity Gauge → Instant Launch",
        pacingStrategy: "Rapid spring curves, escalating tempo, instant tactile payoffs.",
        scenes,
      };
    }

    // Default: Dynamic Transformation / Solution Arc (General SaaS / Infrastructure)
    const is30s = (brief.targetDurationSeconds || 15) >= 25;
    const scenes: StoryboardScene[] = [
      {
        id: "scene-1-provocation",
        sceneIndex: 1,
        act: "hook",
        name: "The Provocation",
        intent: "Disrupt scrolling feed with unignorable friction inquiry.",
        durationSeconds: is30s ? 4.0 : 3.0,
        emotionalBeat: "Tension & Recognition",
        headlineCopy: concept.hook,
        visualDescription: "Dark architectural canvas with kinetic headline copy revealing word-by-word.",
        visualComposition: {
          framing: "asymmetric-editorial",
          focalPoint: { x: 35, y: 50 },
          dominantGeometry: "asymmetric-grid",
          negativeSpaceRatio: 0.55,
          typographyGrid: {
            placement: "bottom-left",
            scaleContrast: "monumental",
          },
          depthPlanes: {
            background: "Deep charcoal void with soft directional ambient light",
            hero: "High-contrast kinetic headline block",
            foreground: "Friction warning badges",
          },
          staticClimaxFrame: "Editorial problem statement with generous breathing room and sharp focus.",
        },
        pacingNotes: "Stagger words across 24 frames; hold cleanly for viewer absorption.",
        elementIntents: [
          { role: "hook-headline", description: "Provocative kinetic headline", importance: "hero" },
        ],
      },
      {
        id: "scene-2-transformation",
        sceneIndex: 2,
        act: "solution",
        name: "The Breakthrough Interface",
        intent: `Demonstrate ${brandName} replacing complexity with real-time autonomous execution.`,
        durationSeconds: is30s ? 7.0 : 4.0,
        emotionalBeat: "Relief & Clarity",
        headlineCopy: `One unified platform for modern ${brief.productName.toLowerCase()}.`,
        visualDescription: "High-precision 3D perspective product canvas executing smoothly.",
        visualComposition: {
          framing: "wide-cinematic",
          focalPoint: { x: 50, y: 52 },
          dominantGeometry: "monolithic-vertical",
          negativeSpaceRatio: 0.46,
          typographyGrid: {
            placement: "top-left",
            scaleContrast: "editorial-restrained",
          },
          depthPlanes: {
            background: "Subtle brand gradient depth plane",
            hero: "3D application window with live workflow execution",
            foreground: "Capability badges floating with parallax",
          },
          staticClimaxFrame: "Pristine application window floating with natural perspective and balanced negative space.",
        },
        pacingNotes: "Window glides upward at 6f; status badges pop in at 18f.",
        elementIntents: [
          { role: "hook-headline", description: "Solution headline", importance: "supporting" },
          { role: "product-mockup", description: "Core product workflow window", importance: "hero" },
        ],
      },
      {
        id: "scene-3-proof",
        sceneIndex: 3,
        act: "value-outcome",
        name: "The Quantitative Validation",
        intent: "Anchor enterprise credibility with proven metrics and certification badges.",
        durationSeconds: is30s ? 8.0 : 4.0,
        emotionalBeat: "Confidence & Proof",
        headlineCopy: "Proven impact at high-growth scale.",
        visualDescription: "Heroic typographic metric counter flanked by verified trust seals.",
        visualComposition: {
          framing: "monumental-centered",
          focalPoint: { x: 50, y: 48 },
          dominantGeometry: "radial-bloom",
          negativeSpaceRatio: 0.48,
          typographyGrid: {
            placement: "center",
            scaleContrast: "monumental",
          },
          depthPlanes: {
            background: "Dark glass canvas with radial bloom",
            hero: "Heroic typographic metric counter",
            foreground: "Verified trust signals",
          },
          staticClimaxFrame: "Monumental metric typography commanding attention.",
        },
        pacingNotes: "Headline at 0f; metric surges up over 35 frames.",
        elementIntents: [
          { role: "metric-hero", description: "Heroic metric counter", importance: "hero" },
          { role: "trust-signal", description: "Certification badges", importance: "supporting" },
        ],
      },
      {
        id: "scene-4-action",
        sceneIndex: 4,
        act: "cta",
        name: "The Decisive Action",
        intent: "Compel immediate conversion with minimal friction reassurance.",
        durationSeconds: is30s ? 6.0 : 4.0,
        emotionalBeat: "Empowerment & Action",
        headlineCopy: brandName,
        supportingCopy: profile.identity.tagline || "The Modern Operating System",
        visualDescription: "Brand monogram reveal with glowing CTA button and precision cursor click.",
        visualComposition: {
          framing: "monumental-centered",
          focalPoint: { x: 50, y: 50 },
          dominantGeometry: "monolithic-vertical",
          negativeSpaceRatio: 0.52,
          typographyGrid: {
            placement: "center",
            scaleContrast: "bold-punch",
          },
          depthPlanes: {
            background: "Dark obsidian void with centered ambient illumination",
            hero: "Brand monogram mark",
            foreground: "Action trigger with cursor click choreography",
          },
          staticClimaxFrame: "Clean centered brand mark with glowing CTA.",
        },
        pacingNotes: "Monogram at 0f; CTA button at 10f; cursor click at 28f.",
        elementIntents: [
          { role: "brand-monogram", description: "Brand monogram", importance: "hero" },
          { role: "call-to-action", description: "Primary action button", importance: "supporting" },
        ],
      },
    ];

    const totalDurationSeconds = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

    return {
      concept,
      totalDurationSeconds,
      narrativeArc: "Provocation → Breakthrough → Quantitative Validation → Decisive Action",
      pacingStrategy: "Carefully calibrated hold times, smooth spring eases, high negative space.",
      scenes,
    };
  }
}


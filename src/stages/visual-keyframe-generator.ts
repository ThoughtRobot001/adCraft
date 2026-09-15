import fs from "fs";
import path from "path";
import { CampaignBrief } from "../ai/types";
import { BrandProfile, CandidateKeyframe, StoryboardScene } from "./types";
import { GeminiClient } from "./gemini-client";

export interface KeyframeGenerationOptions {
  candidatesPerScene?: number; // default 2
  outDir?: string;
  aspectRatio?: "9:16" | "16:9" | "1:1";
}

export class VisualKeyframeGenerator {
  private gemini = new GeminiClient();

  /**
   * Generates candidate keyframes for a storyboard scene.
   * Explores distinct compositional variations (e.g. monolithic centered vs asymmetric editorial).
   */
  async generateKeyframesForScene(
    scene: StoryboardScene,
    profile: BrandProfile,
    brief: CampaignBrief,
    options: KeyframeGenerationOptions = {}
  ): Promise<CandidateKeyframe[]> {
    const candidatesCount = options.candidatesPerScene ?? 2;
    const aspectRatio = options.aspectRatio || brief.aspectRatio || "9:16";
    const width = aspectRatio === "9:16" ? 1080 : 1920;
    const height = aspectRatio === "9:16" ? 1920 : 1080;

    const outDir =
      options.outDir ||
      (typeof path !== "undefined" && path.join ? path.join(process.cwd(), "out", "keyframes") : "");
    if (outDir && typeof fs !== "undefined" && fs.existsSync && !fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const candidates: CandidateKeyframe[] = [];

    for (let variant = 1; variant <= candidatesCount; variant++) {
      const variantType = variant === 1 ? "monolithic-focus" : "asymmetric-depth";
      const prompt = this.craftArtDirectionPrompt(scene, profile, brief, variantType, aspectRatio);
      const candidateId = `keyframe-${scene.id}-var${variant}-${Date.now()}`;
      const filename = `${candidateId}.svg`;
      const filePath =
        outDir && typeof path !== "undefined" && path.join ? path.join(outDir, filename) : "";

      // Synthesize high-definition compositional reference frame
      const svgContent = this.synthesizeCompositionFrame(
        scene,
        profile,
        variantType,
        width,
        height
      );
      if (filePath && typeof fs !== "undefined" && fs.writeFileSync) {
        fs.writeFileSync(filePath, svgContent, "utf-8");
      }

      candidates.push({
        id: candidateId,
        sceneId: scene.id,
        prompt,
        imageUri: filePath || `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`,
        width,
        height,
        aspectRatio: aspectRatio as any,
        source: "local-synthesizer",
        timestamp: Date.now(),
        metadata: {
          variantType,
          headlineCopy: scene.headlineCopy,
          emotionalBeat: scene.emotionalBeat,
        },
      });
    }

    return candidates;
  }

  /**
   * Constructs an exhaustive art-direction prompt describing the visual composition,
   * lighting, depth planes, scale contrast, and cinematography.
   */
  craftArtDirectionPrompt(
    scene: StoryboardScene,
    profile: BrandProfile,
    brief: CampaignBrief,
    variant: "monolithic-focus" | "asymmetric-depth",
    aspectRatio: string
  ): string {
    const brand = profile.identity;
    const comp = scene.visualComposition;
    const primaryColor = brand.colors.primary;
    const secondaryColor = brand.colors.secondary || "#8B7CFF";
    const bgColor = brand.colors.background || "#08080B";

    return [
      `A broadcast-quality motion advertisement keyframe for ${brand.name}.`,
      `Aspect Ratio: ${aspectRatio} vertical 1080x1920 composition.`,
      `Scene Intent: "${scene.intent}". Emotional Beat: "${scene.emotionalBeat}".`,
      `Composition Layout: ${variant === "monolithic-focus" ? "Monumental centered hero with 60% negative space" : "Asymmetric high-fashion editorial balance with dramatic left-anchored typography"}.`,
      `Color Palette: Deep obsidian/charcoal background (${bgColor}), volumetric atmospheric rim lighting and diffuse glow in ${primaryColor} and ${secondaryColor}, sharp white typography (#F5F3FF).`,
      `Depth & Layers: Foreground atmospheric dust particles, 3D floating glassmorphic UI card with 1400px perspective, metallic edge sheen, diffuse ambient shadow, and dark luminous background.`,
      `Typography: Bold modern geometric sans-serif reading "${scene.headlineCopy}". Tight negative letter tracking (-0.03em), monumental scale contrast.`,
      `Focal Point: Target coordinates at x=${comp?.focalPoint.x ?? 50}%, y=${comp?.focalPoint.y ?? 50}%.`,
      `Style & Materials: Apple/Stripe-tier premium Dark SaaS product aesthetic, tactile translucent glass panels, subtle edge reflections, clean negative space, zero visual clutter, 8k resolution, cinematic Octane render.`,
    ].join(" ");
  }

  /**
   * Deterministic high-definition compositional visual synthesizer.
   * Renders the spatial layout, typography bounds, atmospheric lighting orbs,
   * depth planes, and hero cards into an inspectable SVG artifact.
   */
  public synthesizeCompositionFrame(
    scene: StoryboardScene,
    profile: BrandProfile,
    variant: "monolithic-focus" | "asymmetric-depth",
    width: number,
    height: number
  ): string {
    const brand = profile.identity;
    const primary = brand.colors.primary;
    const secondary = brand.colors.secondary || "#8B7CFF";
    const accent = brand.colors.accent || "#B7AEFF";
    const bg = brand.colors.background || "#08080B";
    const isAsymmetric = variant === "asymmetric-depth";

    const headlineX = isAsymmetric ? width * 0.12 : width * 0.5;
    const headlineAnchor = isAsymmetric ? "start" : "middle";
    const headlineY = height * 0.22;

    const heroCardX = isAsymmetric ? width * 0.08 : width * 0.1;
    const heroCardWidth = width * 0.8;
    const heroCardY = height * 0.44;
    const heroCardHeight = height * 0.28;

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGlow" cx="${isAsymmetric ? "35%" : "50%"}" cy="48%" r="65%">
      <stop offset="0%" stop-color="${primary}" stop-opacity="0.22" />
      <stop offset="55%" stop-color="${secondary}" stop-opacity="0.08" />
      <stop offset="100%" stop-color="${bg}" stop-opacity="1" />
    </radialGradient>

    <!-- Volumetric Rim Light -->
    <linearGradient id="cardRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.6" />
      <stop offset="40%" stop-color="${primary}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${primary}" stop-opacity="0.05" />
    </linearGradient>

    <!-- Glass Surface -->
    <linearGradient id="cardSurface" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#181822" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#0E0E14" stop-opacity="0.95" />
    </linearGradient>

    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Deep Obsidian Background -->
  <rect width="${width}" height="${height}" fill="${bg}" />
  <rect width="${width}" height="${height}" fill="url(#bgGlow)" />

  <!-- Ambient Micro-Particles / Noise Simulation -->
  <g opacity="0.35">
    <circle cx="${width * 0.2}" cy="${height * 0.18}" r="2" fill="${accent}" />
    <circle cx="${width * 0.82}" cy="${height * 0.25}" r="3" fill="${primary}" />
    <circle cx="${width * 0.15}" cy="${height * 0.72}" r="1.5" fill="#FFFFFF" />
    <circle cx="${width * 0.75}" cy="${height * 0.8}" r="2.5" fill="${accent}" />
    <circle cx="${width * 0.48}" cy="${height * 0.92}" r="2" fill="${secondary}" />
  </g>

  <!-- Headline Typography Block -->
  <g id="typography-headline">
    <text
      x="${headlineX}"
      y="${headlineY}"
      text-anchor="${headlineAnchor}"
      font-family="${brand.font}, -apple-system, sans-serif"
      font-size="${isAsymmetric ? 58 : 52}"
      font-weight="800"
      letter-spacing="-0.03em"
      fill="#F5F3FF"
    >
      ${this.escapeXml(scene.headlineCopy)}
    </text>
  </g>

  <!-- Hero Depth Plane: 3D Floating UI Card -->
  <g id="hero-depth-plane" transform="${isAsymmetric ? "rotate(-1.5 540 960)" : "none"}">
    <!-- Drop Shadow -->
    <rect
      x="${heroCardX}"
      y="${heroCardY + 12}"
      width="${heroCardWidth}"
      height="${heroCardHeight}"
      rx="24"
      fill="#000000"
      opacity="0.6"
      filter="url(#softGlow)"
    />

    <!-- Hero Card Body -->
    <rect
      x="${heroCardX}"
      y="${heroCardY}"
      width="${heroCardWidth}"
      height="${heroCardHeight}"
      rx="24"
      fill="url(#cardSurface)"
      stroke="url(#cardRim)"
      stroke-width="1.5"
    />

    <!-- Card Chrome Top Bar -->
    <circle cx="${heroCardX + 32}" cy="${heroCardY + 28}" r="5" fill="#EF4444" />
    <circle cx="${heroCardX + 50}" cy="${heroCardY + 28}" r="5" fill="#F59E0B" />
    <circle cx="${heroCardX + 68}" cy="${heroCardY + 28}" r="5" fill="#10B981" />
    <text
      x="${heroCardX + 90}"
      y="${heroCardY + 32}"
      font-family="${brand.font}, sans-serif"
      font-size="13"
      font-weight="600"
      fill="#94A3B8"
    >
      ${brand.name.toLowerCase()}.com • ${this.escapeXml(scene.name)}
    </text>

    <!-- Card Content / Signal Lines -->
    <text
      x="${heroCardX + 36}"
      y="${heroCardY + 80}"
      font-family="${brand.font}, sans-serif"
      font-size="20"
      font-weight="700"
      fill="#FFFFFF"
    >
      ${this.escapeXml(scene.intent)}
    </text>

    <!-- Highlight Badges -->
    <rect x="${heroCardX + 36}" y="${heroCardY + 104}" width="140" height="28" rx="14" fill="${primary}" fill-opacity="0.18" stroke="${primary}" stroke-width="1" />
    <text x="${heroCardX + 52}" y="${heroCardY + 123}" font-family="${brand.font}, sans-serif" font-size="12" font-weight="700" fill="${accent}">
      ✓ Verified Signal
    </text>

    <rect x="${heroCardX + 188}" y="${heroCardY + 104}" width="160" height="28" rx="14" fill="#FFFFFF" fill-opacity="0.05" stroke="#FFFFFF" stroke-opacity="0.1" stroke-width="1" />
    <text x="${heroCardX + 204}" y="${heroCardY + 123}" font-family="${brand.font}, sans-serif" font-size="12" font-weight="600" fill="#CBD5E1">
      Scale: 99.4% Precision
    </text>
  </g>

  <!-- Negative Space Breathing Zones Indicator (Visual Reference) -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="${primary}" stroke-width="1" stroke-opacity="0.08" />
</svg>
    `.trim();
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}

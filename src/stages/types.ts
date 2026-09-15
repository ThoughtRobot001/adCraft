import { Brand, Element, MotionIR, SceneAtmosphere, SceneBackground, SceneCamera, SceneTransition } from "../schema";
import { CampaignBrief } from "../ai/types";
import { VisualKit } from "../asset-bank/types";

export interface BrandVoice {
  tone: "authoritative" | "playful" | "urgent" | "aspirational" | "technical" | "minimalist";
  personality: string;
  avoidWords: string[];
}

export interface BrandPositioning {
  category: string;
  competitors: string[];
  differentiator: string;
}

export interface TargetAudienceProfile {
  primary: string;
  painPoints: string[];
  motivations: string[];
}

export interface BrandProfile {
  identity: Brand;
  voice: BrandVoice;
  positioning: BrandPositioning;
  audience: TargetAudienceProfile;
}

export type CreativeAngle =
  | "pain-agitate-solve"
  | "before-after"
  | "social-proof-first"
  | "product-hero"
  | "velocity-speedrun"
  | "curiosity-hook"
  | "myth-buster"
  | "founder-pitch";

export type NarrativeArchetype =
  | "transformation"       // Dramatic before/after, friction to frictionless
  | "visual-metaphor"       // Abstract or physical concept representing the value proposition
  | "feature-escalation"   // Rapid layering of capabilities building to an emotional climax
  | "problem-absurdity"    // Leaning into the ridiculous friction of status quo
  | "cinematic-spectacle"  // Hardware/physical precision, macro lighting, monumental scale
  | "editorial-manifesto"  // Typographic restraint, literary voice, high negative space
  | "bespoke";

export interface CreativeConcept {
  id: string;
  angle: CreativeAngle;
  angleTitle: string;
  narrativeArchetype: NarrativeArchetype;
  hook: string;
  narrative: string;
  emotionalArc: string;
  visualMood: string;
  estimatedSceneCount: number;
  strategicScore: number;
  reasoning: string;
}

export interface ElementIntent {
  role:
    | "hook-headline"
    | "subtext"
    | "problem-badge"
    | "product-mockup"
    | "status-badge"
    | "metric-hero"
    | "trust-signal"
    | "brand-monogram"
    | "call-to-action";
  description: string;
  importance: "hero" | "supporting" | "ambient";
}

export interface VisualComposition {
  framing:
    | "macro-extreme"
    | "medium-tight"
    | "wide-cinematic"
    | "isometric-cant"
    | "monumental-centered"
    | "asymmetric-editorial";
  focalPoint: { x: number; y: number }; // 0-100 canvas percentage coordinates
  dominantGeometry:
    | "monolithic-vertical"
    | "horizontal-pill"
    | "radial-bloom"
    | "diagonal-shear"
    | "split-plane"
    | "asymmetric-grid";
  negativeSpaceRatio: number; // 0.30 - 0.75 (target empty canvas space for breathing room)
  typographyGrid: {
    placement: "bottom-left" | "top-left" | "center" | "split-margins" | "hero-stacked" | "monumental-header";
    scaleContrast: "monumental" | "editorial-restrained" | "bold-punch";
  };
  depthPlanes: {
    background?: string;
    hero: string;
    foreground?: string;
  };
  staticClimaxFrame: string; // Description of the scene as a static print/poster composition at peak tension/clarity
}

export interface SceneTransformationCall {
  isExplicitTransformation: boolean;
  allowedDepartures: Array<"lighting" | "materials" | "typography" | "palette" | "density" | "camera">;
  fromState?: string;
  toState?: string;
  narrativeJustification: string;
}

export interface StoryboardScene {
  id: string;
  sceneIndex: number;
  act?: "hook" | "pain-point" | "solution" | "value-outcome" | "cta" | "manifesto" | "escalation" | "metaphor" | "climax";
  name: string;
  intent: string;
  durationSeconds: number;
  emotionalBeat: string;
  headlineCopy: string;
  supportingCopy?: string;
  visualDescription: string;
  visualComposition?: VisualComposition;
  elementIntents: ElementIntent[];
  pacingNotes: string;
  transformationCall?: SceneTransformationCall;
}

export interface Storyboard {
  concept: CreativeConcept;
  totalDurationSeconds: number;
  narrativeArc: string;
  pacingStrategy: string;
  scenes: StoryboardScene[];
}

export interface ArtDirectedScene {
  storyboardScene: StoryboardScene;
  background: SceneBackground;
  layoutStrategy: "hero-centered" | "split-depth" | "stacked-cards" | "minimal-focus";
  elements: Element[];
  transition: SceneTransition;
  camera: SceneCamera;
  atmosphere: SceneAtmosphere;
  heroElementId?: string;
  visualKit?: VisualKit;
  backgroundAssetId?: string;
  atmosphereAssetId?: string;
  usedMemoryItemIds?: string[];
}

export interface CritiqueIssue {
  sceneId: string;
  category:
    | "readability"
    | "visual-hierarchy"
    | "spatial-collision"
    | "margin-overflow"
    | "brand-domain-mismatch"
    | "cta-collision"
    | "pacing"
    | "contrast"
    | "crowding"
    | "brand-consistency"
    | "empty-scene"
    | "hero-focus"
    | "camera"
    | "atmosphere"
    | "kinetic-energy"
    | "explainer-slide"
    | "asset-kit"
    | "typography-restraint"
    | "negative-space-crowding"
    | "motion-intentionality"
    | "template-repetition"
    | "brand-specificity"
    | "creative-memory-violation"
    | "visual-bible-inconsistency";
  severity: "critical" | "major" | "minor";
  description: string;
  suggestedFix: string;
}

export interface SceneCritique {
  sceneId: string;
  score: number; // 1-10
  visualHierarchyScore?: number; // 1-10 (100ms eye-tracking focus)
  typographyRestraintScore?: number; // 1-10 (weight balance, scale contrast)
  motionIntentionalityScore?: number; // 1-10 (physical motivation, rejection of unmotivated motion)
  negativeSpaceScore?: number; // 1-10 (breathing room vs visual clutter)
  brandSpecificityScore?: number; // 1-10 (distinct brand identity vs generic tech slop)
  notes: string;
  issues: CritiqueIssue[];
}

export interface CritiqueResult {
  overallScore: number; // 1-10
  passedThreshold: boolean;
  scenes: SceneCritique[];
  summary: string;
  revisionRequired: boolean;
  visualHierarchyAvg?: number;
  typographyRestraintAvg?: number;
  motionIntentionalityAvg?: number;
  negativeSpaceAvg?: number;
  brandSpecificityAvg?: number;
}

// ---------------------------------------------------------------------------
// Visual Keyframe Generation, Critique, and 11-Dimension Analysis Interfaces
// ---------------------------------------------------------------------------

export interface CandidateKeyframe {
  id: string;
  sceneId: string;
  prompt: string;
  imageUri: string; // File path, base64 data URI, or URL
  width: number;
  height: number;
  aspectRatio: "9:16" | "16:9" | "1:1";
  source: "gemini-imagen" | "local-synthesizer" | "custom-upload";
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface KeyframeCritiqueIssue {
  category:
    | "focal-point-ambiguity"
    | "scale-imbalance"
    | "negative-space-deficit"
    | "depth-flatness"
    | "typography-clutter"
    | "brand-mismatch"
    | "density-overload";
  severity: "critical" | "major" | "minor";
  description: string;
  suggestedFix: string;
}

export interface KeyframeCritiqueScore {
  candidateId: string;
  overallScore: number; // 1-10
  compositionScore: number;
  focalClarityScore: number;
  negativeSpaceScore: number;
  scaleHierarchyScore: number;
  brandFidelityScore: number;
  notes: string;
  issues: KeyframeCritiqueIssue[];
  passedGate: boolean; // score >= 9.0
}

export interface ApprovedKeyframe {
  sceneId: string;
  candidateKeyframe: CandidateKeyframe;
  critiqueScore: number;
  approvalNotes: string;
  reviewedAt: number;
}

/**
 * The 11 Mandatory Dimensions of Visual Keyframe Analysis
 * Blueprints the deterministic MotionIR reconstruction.
 */
export interface KeyframeAnalysis {
  sceneId: string;
  approvedKeyframeId: string;

  // 1. Composition Layout Archetype & Balance
  composition: {
    archetype:
      | "monolithic-centered"
      | "asymmetric-editorial"
      | "diagonal-tension"
      | "split-plane"
      | "golden-ratio"
      | "bento-structured"
      | "horizontal-pill"
      | "radial-bloom";
    balance: "symmetrical" | "asymmetrical" | "dynamic-diagonal";
    visualAnchorZone: "top" | "center" | "bottom" | "left-split" | "right-split";
  };

  // 2. Focal Point
  focalPoint: {
    x: number; // 0 to 100 percentage
    y: number; // 0 to 100 percentage
    visualWeight: number; // 0.0 to 1.0 (prominence of primary anchor)
    description: string;
  };

  // 3. Scale Relationships
  scaleRelationships: {
    heroElementScale: number; // normalized scale 0.5 to 2.0 (e.g. 1.2 = prominent hero)
    headlineToBodyRatio: number; // e.g. 2.8:1
    largestToSmallestRatio: number; // e.g. 5:1
    recommendedHeroWidthPercent: number; // 50 to 95%
  };

  // 4. Spatial Hierarchy
  spatialHierarchy: {
    layers: Array<{
      rank: number; // 1 = primary hero, 2 = secondary, 3 = ambient
      role: "hero" | "supporting" | "ambient" | "background";
      elementDescription: string;
      suggestedPrimitiveType: string;
      targetZIndex: number;
    }>;
  };

  // 5. Negative Space
  negativeSpace: {
    ratio: number; // 0.0 to 1.0 (e.g. 0.65 = 65% breathing space)
    breathingZones: Array<"top-third" | "bottom-third" | "left-margin" | "right-margin" | "center-void">;
    unclutteredScore: number; // 1 to 10
  };

  // 6. Depth Planes
  depthPlanes: {
    foreground?: { element: string; blur?: number; opacity?: number };
    heroMidground: { element: string; perspectiveTiltX: number; perspectiveTiltY: number; zDepth: number };
    background: { atmosphericHaze: number; lightBloom: boolean; colorGradient: string };
    vanishingPoint?: { x: number; y: number };
  };

  // 7. Cropping
  cropping: {
    hasBleedingEdges: boolean;
    bleedDirections: Array<"top" | "bottom" | "left" | "right">;
    framingBoundary: "contained" | "full-bleed" | "cinematic-letterbox" | "offscreen-projection";
  };

  // 8. Typography Placement
  typographyPlacement: {
    headlineBounds: { x: number; y: number; width: number; height?: number };
    alignment: "left" | "center" | "right";
    targetFontSize: number; // e.g. 48 to 72
    targetFontWeight: number; // e.g. 700 to 900
    letterSpacing: string; // e.g. "-0.03em"
    maxCharsPerLine?: number;
  };

  // 9. Color Distribution
  colorDistribution: {
    dominantBackgroundHex: string;
    surfaceHex: string;
    accentHighlights: string[];
    atmosphericGlow?: {
      color: string;
      center: { x: number; y: number };
      radius: number;
      intensity: number;
    };
    luminescenceContrast: "high-contrast" | "subtle-chiaroscuro" | "luminous-glow";
  };

  // 10. Camera / Framing
  cameraFraming: {
    shotType: "push-in" | "pull-back" | "orbit" | "vertical-rise" | "fly-through" | "macro" | "static";
    fieldOfView: number; // e.g. 45 to 75 deg
    cameraTiltX: number; // e.g. -15 to 15 deg
    cameraPanY: number;
    virtualDistance: "macro-close" | "medium-tight" | "wide-cinematic";
  };

  // 11. Visual Density
  visualDensity: {
    densityScore: number; // 1 to 10 (1 = ultra minimal, 10 = chaotic overload)
    clusterZone?: { x: number; y: number; radius: number };
    clutterFreeZones: Array<"top" | "bottom" | "left" | "right" | "perimeter">;
  };
}

/**
 * Temporal Choreography & MotionPlan types
 */
export interface TemporalCompositionGeometry {
  archetype: "monolithic-centered" | "asymmetric-editorial" | "compressed-horizon" | "chaotic-bleed" | string;
  containerBounds: {
    topPercent: number;
    heightPercent: number;
    widthPercent: number;
    leftPercent: number;
    borderRadius: number;
    borderOpacity?: number;
  };
  cropping?: {
    bleedMargin?: number;
    edgeTension?: number;
  };
}

export interface TemporalDensity {
  score: number; // 0.0 - 1.0
  breathingRoomRatio: number; // 0.0 - 1.0
  clutterFreeZones?: string[];
}

export interface TemporalScaleHierarchy {
  heroScale: number; // e.g. 1.15 down to 0.98
  secondaryScale: number; // e.g. 0.95 down to 0.86
  headlineToHeroRatio?: number;
}

export interface TemporalDepthDistribution {
  perspective: number; // px, e.g. 1800 to 1200
  tiltX: number; // deg
  tiltY: number; // deg
  zSpread: number; // px separation between depth planes
}

export interface TemporalCameraPosition {
  scale: number;
  translateY: number;
  tiltX?: number;
  fov?: number;
}

export interface TemporalTypographyState {
  fontSize: number; // px
  tracking: number; // em, e.g. -0.038 down to -0.052
  opacity: number; // 0.0 - 1.0
  lineHeight: number;
  blur?: number;
}

export interface TemporalLightingIntensity {
  beamIntensity: number; // 0.0 - 1.0
  beamWidth: number; // px
  ambientGlowOpacity: number; // 0.0 - 1.0
  bloomRadius: number; // px
}

export interface TemporalMotionEnergy {
  springStiffness: number;
  springDamping: number;
  microLevitationAmp: number; // px
  microLevitationFreq: number; // cycles / speed
  alertPulseRate: number; // multiplier, e.g. 1.0 to 2.8
}

export interface TemporalPeripheralActivity {
  backgroundBlur: number; // px
  vignetteDarkness: number; // 0.0 - 1.0
  edgeOverflow: number; // 0.0 - 1.0
}

export interface TemporalState {
  name: string;
  frameRange: [number, number]; // [startFrame, endFrame]
  description: string;
  visualDensity: number; // 0.0 to 1.0 (legacy convenience)
  activeElementIds: string[];
  focalPoint: { x: number; y: number }; // (legacy convenience)
  cameraState: { scale: number; tiltX?: number; tiltY?: number; translateY?: number }; // (legacy convenience)

  // The 10 Mandatory Temporal Composition Dimensions
  dominantFocalPoint?: { x: number; y: number; weight: number; targetDescription?: string };
  compositionGeometry?: TemporalCompositionGeometry;
  density?: TemporalDensity;
  scaleHierarchy?: TemporalScaleHierarchy;
  depthDistribution?: TemporalDepthDistribution;
  cameraPosition?: TemporalCameraPosition;
  typographyState?: TemporalTypographyState;
  lightingIntensity?: TemporalLightingIntensity;
  motionEnergy?: TemporalMotionEnergy;
  peripheralActivity?: TemporalPeripheralActivity;
}

export type CinematicBeatStage =
  | "anticipation"
  | "entrance"
  | "escalation"
  | "interruption"
  | "emphasis"
  | "climax"
  | "release"
  | "transition"
  | "interaction"
  | "snap";

export interface CinematicCameraCue {
  action: "hold" | "push-in" | "dive" | "recoil" | "snap-freeze" | "whip-prep" | "drift" | "settle" | "orbit" | string;
  scale: number;
  translateY: number;
  tiltX: number;
  tiltY?: number;
  isHolding: boolean; // true when camera deliberately holds steady
}

export interface CinematicObjectRole {
  elementId: string;
  role: "hero" | "interrupter" | "depth-anchor" | "foreground-occluder" | "peripheral-swarm" | "alarm-beacon";
  importance: "primary" | "secondary" | "atmospheric";
  trajectory: "from-left" | "from-right" | "from-depth" | "drop-down" | "foreground-slice" | "float-up" | "static-anchor" | string;
  entryFrame: number;
  exitFrame?: number;
  zPlane: "foreground-occluder" | "hero-plane" | "midground" | "deep-background" | string;
  scale: number;
  occludesTypography?: boolean;
}

export interface CinematicBeat {
  id: string;
  beatIndex: number;
  name: string; // e.g. "Beat 1 — Silence", "Beat 2 — Interruption", etc.
  stage: CinematicBeatStage;
  frameRange: [number, number]; // [startFrame, endFrame]
  dramaticIntent: string;
  shotDirection: string; // Human-readable screenplay direction line

  // Explicit Directional Decisions
  whatEnters: string[]; // element IDs entering in this beat
  whatExits?: string[]; // element IDs leaving or dissolving
  foregroundBackgroundCrossings: Array<{
    elementId: string;
    path: "foreground-cross" | "depth-plunge" | "headline-occlude" | "drift" | string;
    description: string;
  }>;
  dominantElementId: string;
  obscuredElementIds: string[];
  typographyInterruption: {
    isInterrupted: boolean;
    interrupterElementId?: string;
    action: "unobstructed" | "stressed" | "occluded-by-card" | "frozen" | string;
    description?: string;
  };
  cameraCue: CinematicCameraCue;
  lightingCue: {
    behavior: "whisper" | "flare" | "strobe-tension" | "overload-bloom" | "snap-freeze" | "release-prep" | string;
    intensity: number;
    beamWidth: number;
  };
  viewerAttention: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    landingMomentFrame: number;
    focalDescription: string;
  };
  isFreezeSnap?: boolean; // When true, physics and continuous motion snap-freeze
  compositionState?: TemporalState; // Synchronized 10-dimension composition state
}

export interface TemporalCompositionSnapshot {
  frame: number;
  effectiveFrame: number; // Clamped during snap-freeze
  progress: number;
  activeStateName: string;
  activeBeat?: CinematicBeat;
  isFreezeSnap?: boolean;
  cameraIsHolding?: boolean;
  typographyInterruption?: {
    isInterrupted: boolean;
    interrupterElementId?: string;
    action: string;
  };
  dominantFocalPoint: { x: number; y: number; weight: number; targetDescription?: string };
  compositionGeometry: TemporalCompositionGeometry;
  density: TemporalDensity;
  scaleHierarchy: TemporalScaleHierarchy;
  depthDistribution: TemporalDepthDistribution;
  cameraPosition: TemporalCameraPosition;
  typographyState: TemporalTypographyState;
  lightingIntensity: TemporalLightingIntensity;
  motionEnergy: TemporalMotionEnergy;
  peripheralActivity: TemporalPeripheralActivity;
  activeElementIds: string[];
}

export interface SpawningEvent {
  id: string;
  elementId: string;
  spawnFrame: number;
  durationFrames?: number;
  entryTrajectory: "from-left" | "from-right" | "from-depth" | "drop-down" | "float-up" | "pop-in" | "fade";
  easing: "spring" | "linear" | "ease-out" | "accelerate";
  initialOffset?: { x?: number; y?: number; z?: number; rotateX?: number; rotateY?: number; rotateZ?: number; scale?: number };
}

export interface TemporalCinematicQuestions {
  whatChanges: string;
  whyItChanges: string;
  whenItChanges: string;
  howAttentionShifts: string;
  visualClimax: string;
}

export interface MotionPlan {
  sceneId: string;
  visualBibleId?: string;
  narrativeIntent: string;
  durationFrames: number;
  cinematicQuestions: TemporalCinematicQuestions;

  // The Human-Readable Shot Direction Screenplay
  shotScript?: string;

  // Distinct visual beats
  beats?: CinematicBeat[];

  // Object roles and spatial casting
  objectCasting?: CinematicObjectRole[];
  
  startingState: TemporalState;
  intermediateStates: TemporalState[];
  climaxState: TemporalState & { climaxFrame: number; emotionalTension: string };
  
  densityEvolution: {
    progression: "sparse-to-crowded" | "crowded-to-cleansed" | "steady-focus" | "rhythmic-pulsing" | "escalating-impact";
    curve: Array<{ frame: number; density: number }>;
  };
  
  spawningSchedule: SpawningEvent[];
  cameraEvolution: {
    trajectory: "subtle-push-in" | "accelerating-push-in" | "steady-drift" | "pan-reveal" | "locked";
    scaleRange: [number, number];
    tiltRange?: [number, number];
  };
  typographyEvolution: {
    revealType: "staggered-word" | "simultaneous-punch" | "persistent-anchor";
    revealFrameRange: [number, number];
    holdUntilFrame: number;
  };
  visualEmphasisShifts: Array<{
    frame: number;
    target: string;
    focalPoint: { x: number; y: number };
    reason: string;
  }>;
  transitionPreparation: {
    startFrame: number;
    momentum: "accelerate-forward" | "freeze-anticipation" | "fade-out" | "whip-prep";
  };
}

/**
 * ===========================================================================
 * Persistent Visual Bible Interfaces
 * Single source of visual truth governing all scenes, keyframes, assets,
 * motion plans, and MotionIR specifications.
 * ===========================================================================
 */

export interface VisualBibleProductIdentity {
  name: string;
  category: string;
  formFactor:
    | "desktop-browser"
    | "mobile-device"
    | "hardware-console"
    | "bento-dashboard"
    | "fintech-card"
    | "abstract-metric";
  signatureElement: string;
  monogramOrLogo: {
    symbol: string;
    placement: "top-left" | "top-center" | "center-watermark";
    treatment: "glow-bloom" | "minimal-monochrome" | "embossed-metallic";
  };
  keyDifferentiatorVisual: string;
}

export interface VisualBibleVisualLanguage {
  theme: "dark-saas" | "editorial-light" | "cyber-terminal" | "industrial-monolith" | "consumer-vibrant";
  aestheticPhilosophy: string;
  colorTokens: {
    backgroundBase: string;
    surfaceElevated: string;
    surfaceOverlay: string;
    borderSubtle: string;
    primaryBrand: string;
    secondaryBrand: string;
    accentHighlight: string;
    textPrimary: string;
    textMuted: string;
  };
  negativeSpaceBaseline: number; // 0.35 - 0.75
  cornerRadii: {
    container: number; // px
    card: number; // px
    pill: number; // px
  };
}

export interface VisualBibleMaterials {
  surfaceType: "glassmorphism" | "matte-ceramic" | "anodized-aluminum" | "tactile-paper" | "glossy-acrylic";
  backdropBlur: number; // px
  borderSheen: "specular-metallic" | "subtle-hairline" | "neon-glow" | "none";
  roughness: number; // 0.0 to 1.0
  transmissionOpacity: number; // 0.0 to 1.0
  shadowTokens: {
    elevation: string;
    ambientGlow: string;
  };
}

export interface VisualBibleLightingLogic {
  keyLightVector: { angleDeg: number; elevationDeg: number };
  keyIntensity: number; // 0.0 - 1.0
  ambientFillOpacity: number; // 0.0 - 1.0
  atmosphericGlowOrb: {
    enabled: boolean;
    color: string;
    radiusPercent: number;
    blurPx: number;
  };
  shadowFalloff: "crisp-contact" | "diffuse-soft" | "cinematic-volumetric";
}

export interface VisualBibleTypographySystem {
  headlineFont: string;
  bodyFont: string;
  monoFont: string;
  headlineTracking: string;
  headlineLineHeight: number;
  capitalization: "none" | "uppercase" | "title-case";
  scaleRatios: {
    heroDisplay: number; // px
    sectionHeadline: number; // px
    bodySubtext: number; // px
    badgeLabel: number; // px
  };
  weightHierarchy: {
    hero: 700 | 800 | 900;
    subtext: 400 | 500 | 600;
    badge: 600 | 700;
  };
}

export interface VisualBibleCameraLanguage {
  baseFieldOfView: number;
  primaryShotPhilosophy: "controlled-push-in" | "subtle-drift" | "orbital-pivot" | "locked-monumental";
  tiltConstraints: {
    maxTiltX: number; // deg
    maxTiltY: number; // deg
  };
  virtualDistance: "macro-tight" | "medium-balanced" | "wide-architectural";
  cameraMotionCurve: "cinematic-smooth" | "snappy-tech" | "elastic-settle";
}

export interface VisualBibleRecurringSubject {
  id: string;
  name: string;
  role: "primary-product-hero" | "brand-monogram" | "interaction-pointer" | "verification-badge";
  primitiveType: "app-window" | "phone-mockup" | "cursor-interaction" | "feature-pills" | "metric-counter" | "logo-reveal";
  lockedProps: Record<string, any>;
  consistencyRules: string[];
}

export interface VisualBible {
  id: string;
  campaignId: string;
  brandName: string;
  createdAt: number;
  version: number;
  productIdentity: VisualBibleProductIdentity;
  visualLanguage: VisualBibleVisualLanguage;
  materials: VisualBibleMaterials;
  lightingLogic: VisualBibleLightingLogic;
  typographySystem: VisualBibleTypographySystem;
  cameraLanguage: VisualBibleCameraLanguage;
  recurringSubjects: VisualBibleRecurringSubject[];
  transformationExceptions: {
    allowedSceneIndices: number[];
    rules: string[];
  };
}

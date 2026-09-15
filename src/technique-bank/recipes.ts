import { TechniqueRecipe } from "./types";

export const BUILTIN_TECHNIQUES: TechniqueRecipe[] = [
  {
    id: "tech-conveyor-belt-3d",
    name: "3D Conveyor-Belt Grid Scroll",
    category: "scroll-reveal",
    description: "Tilted 3D perspective grid with continuous Y-axis conveyor-belt flow, subtle camera dolly glide, and warm specular rim lighting.",
    visualPurpose: "Hook friction or massive backlog showcase where items endlessly stream downward into view.",
    dramaticIntent: "tension-friction",
    whenToUse: [
      "scroll",
      "grid",
      "conveyor",
      "stream",
      "backlog",
      "friction",
      "overwhelm",
      "tasks",
      "cards flowing",
    ],
    targetPrimitive: "perspective-card-grid",
    motionCurve: "glide",
    parameters: {
      continuousScrollSpeed: 25.76,
      perspective: 1350,
      rotateXStart: 11,
      rotateXEnd: 5,
      rotateZ: -0.9,
      scaleStart: 1.0,
      scaleEnd: 1.06,
      initialY: -1100,
      gridWidth: 1540,
      cardWidth: 730,
      cardHeight: 600,
      cardGap: 44,
    },
    defaultProps: {
      scaleStart: 1.0,
      scaleEnd: 1.06,
      rotateXStart: 11,
      rotateXEnd: 5,
      translateYStart: -1100,
      translateYEnd: 832,
      continuousScrollSpeed: 25.76,
      useMotionCurves: true,
    },
    codeSnippet: `// 3D Conveyor-Belt Grid Scroll Technique (1:1 Broadcast Parity)
const scale = interpolateWithCurve(frame, 0, 75, 1.0, 1.06, MotionCurves.glide);
const rotateX = interpolateWithCurve(frame, 0, 75, 11, 5, MotionCurves.glide);
const initialY = -1100;
const conveyorProgress = frame * 25.76;
const exitDropY = interpolateWithCurve(frame, 74, 90, 0, 1500, MotionCurves.snappy);
const totalY = initialY + conveyorProgress + exitDropY;
<div style={{
  width: 1540,
  transform: \`translateY(\${totalY}px) scale(\${scale}) rotateX(\${rotateX}deg) rotateZ(-0.9deg)\`,
  transformOrigin: "center 50%",
  transformStyle: "preserve-3d",
  perspective: 1350,
  display: "flex",
  flexDirection: "column",
  gap: 44
}} />`,
    provenIn: "Astra/Hedge Commercial Recreation Benchmark V8 (Exact Parity)",
    qualityRating: 10.0,
    tags: ["3d", "scroll", "conveyor", "perspective", "cards", "glide", "broadcast-parity"],
  },
  {
    id: "tech-snappy-card-drop",
    name: "AE Snappy Drop-Down Exit",
    category: "scene-transition",
    description: "Explosive acceleration downward exit using After Effects snappy curve [0.16, 1.0, 0.3, 1.0], clearing the stage with broadcast weight.",
    visualPurpose: "Sudden impactful dismissal of friction cards to reveal the hero solution underneath.",
    dramaticIntent: "cathartic-relief",
    whenToUse: [
      "drop",
      "exit",
      "dismiss",
      "slide down",
      "clear stage",
      "fall away",
    ],
    targetPrimitive: "perspective-card-grid",
    motionCurve: "snappy",
    parameters: {
      exitDistance: 950,
      startFrameOffset: 65,
      durationFrames: 25,
      fadeStartOffset: 7,
    },
    defaultProps: {
      exitY: 950,
    },
    codeSnippet: `// Snappy Drop-Down Exit Technique
const exitY = interpolateWithCurve(frame, 65, 90, 0, 950, MotionCurves.snappy);
const exitOpacity = interpolate(frame, [72, 90], [1, 0], { extrapolateLeft: "clamp" });`,
    provenIn: "Astra/Hedge Commercial Recreation Benchmark",
    qualityRating: 9.6,
    tags: ["exit", "drop", "snappy", "transition", "physics"],
  },
  {
    id: "tech-kinetic-glow-punch",
    name: "Kinetic Glow-Punch Typography",
    category: "kinetic-type",
    description: "Word-by-word staggered reveal with explosive scale-in and intense radial glow burst on designated brand keywords.",
    visualPurpose: "High-impact hook headline or value proposition delivery that forces eye focus.",
    dramaticIntent: "precision-craft",
    whenToUse: [
      "kinetic text",
      "glow punch",
      "headline",
      "hook text",
      "staggered reveal",
      "punchy",
      "typography",
    ],
    targetPrimitive: "kinetic-text",
    motionCurve: "punch",
    parameters: {
      staggerFrames: 3,
      glowRadius: 28,
      punchScale: 1.15,
    },
    defaultProps: {
      animation: "glow-punch",
      fontSize: 56,
      fontWeight: 800,
    },
    codeSnippet: `// Kinetic Glow-Punch Technique
const wordSpring = spring({ frame: frame - i * 3, fps, config: { damping: 12, stiffness: 220 } });
const isHighlighted = highlightWords.includes(word);
<span style={{
  transform: \`scale(\${wordSpring})\`,
  textShadow: isHighlighted ? "0 0 35px rgba(0, 200, 255, 0.8)" : "none"
}}>{word}</span>`,
    provenIn: "AdCraft Studio Core Engine & Saas Product Ads",
    qualityRating: 9.4,
    tags: ["typography", "kinetic", "glow", "punch", "words"],
  },
  {
    id: "tech-bezier-cursor-interaction",
    name: "Smooth Bezier Pointer & Click Ripple",
    category: "cursor-interaction",
    description: "Natural non-linear cursor trajectory using cubic bezier easing, realistic 0.92x spring squeeze on click, and concentric expanding ripple ring.",
    visualPurpose: "Showing tactile software interaction, automating actions, or clicking the primary CTA.",
    dramaticIntent: "playful-momentum",
    whenToUse: [
      "cursor",
      "click",
      "pointer",
      "interaction",
      "mouse",
      "automate",
      "cta click",
      "ripple",
    ],
    targetPrimitive: "cursor-interaction",
    motionCurve: "glide",
    parameters: {
      clickAtFrame: 35,
      rippleDurationFrames: 20,
      squeezeScale: 0.92,
      maxRippleRadius: 48,
    },
    defaultProps: {
      cursorType: "macos-arrow",
      clickRipple: true,
      durationFrames: 50,
    },
    codeSnippet: `// Bezier Pointer & Click Squeeze
const cursorProgress = interpolateWithCurve(frame, 0, clickAtFrame, 0, 1, MotionCurves.glide);
const clickSqueeze = frame >= clickAtFrame && frame <= clickAtFrame + 8
  ? interpolate(frame, [clickAtFrame, clickAtFrame + 4, clickAtFrame + 8], [1, 0.92, 1])
  : 1;`,
    provenIn: "AdCraft Kylian Interactive SaaS Ad",
    qualityRating: 9.5,
    tags: ["cursor", "click", "ripple", "mouse", "interaction", "tactile"],
  },
  {
    id: "tech-dof-floating-cards",
    name: "Multi-Plane Depth-of-Field Floating Cards",
    category: "card-choreography",
    description: "3D floating cards distributed across varying Z-depth layers with differential parallax speeds and dynamic lens blur.",
    visualPurpose: "Atmospheric depth and cinematic immersion in solution discovery or proof stages.",
    dramaticIntent: "monumental-prestige",
    whenToUse: [
      "depth of field",
      "floating cards",
      "parallax",
      "3d cards",
      "spatial",
      "atmosphere",
      "dof",
    ],
    targetPrimitive: "depth-of-field-cards",
    motionCurve: "glide",
    parameters: {
      focalZ: 0,
      blurMax: 16,
      layerSpeedRatio: 1.6,
    },
    defaultProps: {
      cards: [
        { x: 15, y: 25, rotationY: 12, blur: 6, startZ: 20, speed: 4 },
        { x: 75, y: 55, rotationY: -14, blur: 10, startZ: -50, speed: 7 },
      ],
    },
    codeSnippet: `// Depth-of-Field Multi-Plane Calculation
const zPos = card.startZ + frame * card.speed;
const blurAmount = Math.abs(zPos - focalZ) * 0.12;
<div style={{ filter: \`blur(\${blurAmount}px)\`, transform: \`translateZ(\${zPos}px)\` }} />`,
    provenIn: "Astra/Hedge Commercial Phase 3 (Prove)",
    qualityRating: 9.3,
    tags: ["3d", "depth-of-field", "cards", "blur", "bokeh", "parallax"],
  },
  {
    id: "tech-action-progress-modal",
    name: "Tactile Action Progress & Success Confirmation",
    category: "progress-indicator",
    description: "High-satisfaction progress ring fill with spring-loaded checkmark pop and celebratory glowing button state.",
    visualPurpose: "Proving immediate tangible outcome or instant execution in the solution or proof scene.",
    dramaticIntent: "cathartic-relief",
    whenToUse: [
      "progress",
      "loading",
      "success",
      "checkmark",
      "confirmation",
      "complete",
      "modal",
      "tactile",
    ],
    targetPrimitive: "action-progress-modal",
    motionCurve: "snappy",
    parameters: {
      spinFrames: 45,
      successPopDelay: 48,
      ringThickness: 4,
    },
    defaultProps: {
      title: "Executing...",
      successTitle: "Complete & Verified",
      successButton: "Done",
      durationFrames: 90,
      color: "#00c864",
    },
    codeSnippet: `// Ring Progress & Success Pop
const ringProgress = interpolate(frame, [0, 45], [0, 100], { extrapolateRight: "clamp" });
const checkScale = frame > 45 ? spring({ frame: frame - 45, fps, config: { damping: 10, stiffness: 200 } }) : 0;`,
    provenIn: "Astra/Hedge Commercial Phase 4 (Action)",
    qualityRating: 9.4,
    tags: ["progress", "success", "modal", "checkmark", "satisfaction"],
  },
  {
    id: "tech-pbr-titanium-pivot",
    name: "WebGL 3D Titanium Phone Pivot",
    category: "3d-mockup",
    description: "Extruded 3D smartphone mesh in React Three Fiber with brushed titanium edges, live specular rim reflection, and smooth Y-axis pivot.",
    visualPurpose: "Premium hardware or mobile product showcase commanding high authority and trust.",
    dramaticIntent: "monumental-prestige",
    whenToUse: [
      "phone",
      "mobile app",
      "3d phone",
      "titanium",
      "hardware",
      "device showcase",
      "screen mockup",
    ],
    targetPrimitive: "phone-mockup",
    motionCurve: "glide",
    parameters: {
      rotateYStart: -18,
      rotateYEnd: 12,
      rotateX: 10,
      metalness: 0.85,
      roughness: 0.25,
    },
    defaultProps: {
      tilt: true,
      rotateY: -12,
      rotateX: 10,
      pedestal: true,
      theme: "dark",
    },
    codeSnippet: `// 3D Phone Mesh Pivot Rig
const rotY = interpolateWithCurve(frame, 0, 90, -18, 12, MotionCurves.glide);
<Phone3DMesh rotationY={rotY} metalness={0.85} roughness={0.25} />`,
    provenIn: "AdCraft WebGL 3D Architectural Overhaul",
    qualityRating: 9.7,
    tags: ["3d", "threejs", "webgl", "phone", "titanium", "device"],
  },
  {
    id: "tech-minimal-editorial-reveal",
    name: "Restrained Minimal Editorial Reveal",
    category: "kinetic-type",
    description: "Whisper-quiet opacity and micro-tracking expansion with extreme typographic scale contrast and vast negative space.",
    visualPurpose: "High-end luxury, editorial manifestos, or engineering-grade tools commanding respect through quiet confidence.",
    dramaticIntent: "monumental-prestige",
    whenToUse: [
      "minimal",
      "editorial",
      "luxury",
      "restraint",
      "manifesto",
      "linear",
      "aesop",
      "quiet confidence",
      "negative space",
    ],
    targetPrimitive: "kinetic-text",
    motionCurve: "glide",
    parameters: {
      letterSpacingStart: -0.04,
      letterSpacingEnd: 0.02,
      fadeDuration: 30,
    },
    defaultProps: {
      animation: "fade-up",
      fontSize: 72,
      fontWeight: 400,
    },
    codeSnippet: `// Minimal Editorial Reveal
const letterSpacing = interpolate(frame, [0, 30], [-0.04, 0.02], { extrapolateRight: "clamp" });
const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
<h1 style={{ letterSpacing: \`\${letterSpacing}em\`, opacity }}>{title}</h1>`,
    provenIn: "Linear / Aesop Editorial Benchmark",
    qualityRating: 9.8,
    tags: ["minimal", "editorial", "luxury", "typography", "restraint"],
  },
  {
    id: "tech-hardware-monolith-rise",
    name: "Tactile Hardware Monolith Rise",
    category: "3d-mockup",
    description: "Slow isometric elevation of industrial hardware hardware modules with stark cast shadows and high geometric precision.",
    visualPurpose: "Tactile engineering devices, audio hardware, or physical technology products.",
    dramaticIntent: "precision-craft",
    whenToUse: [
      "hardware",
      "monolith",
      "isometric",
      "tactile",
      "teenage engineering",
      "craft",
      "physical",
    ],
    targetPrimitive: "app-window",
    motionCurve: "snappy",
    parameters: {
      riseDistance: 120,
      pitch: 18,
      shadowBlur: 40,
    },
    defaultProps: {
      perspective: 1200,
      rotateX: 18,
      theme: "dark",
    },
    codeSnippet: `// Hardware Monolith Rise
const riseY = interpolateWithCurve(frame, 0, 45, 120, 0, MotionCurves.snappy);
<div style={{ transform: \`perspective(1200px) rotateX(18deg) translateY(\${riseY}px)\` }} />`,
    provenIn: "Teenage Engineering Benchmark",
    qualityRating: 9.6,
    tags: ["hardware", "tactile", "monolith", "isometric", "engineering"],
  },
];

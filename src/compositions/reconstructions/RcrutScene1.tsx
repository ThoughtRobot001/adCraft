import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticText } from "../../primitives/KineticText";
import { CandidateNoiseField } from "../../primitives/CandidateNoiseField";
import { Brand } from "../../schema";
import { TemporalChoreographer, interpolateTemporalComposition } from "../../stages/temporal-choreographer";

export const RCRUT_BRAND: Brand = {
  name: "RCRUT",
  tagline: "Intelligent Talent Discovery",
  font: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  serifFont: "Newsreader, Georgia, serif",
  theme: "dark-saas",
  colors: {
    primary: "#7C3AED",
    accent: "#A855F7",
    background: "#07080C",
    secondary: "#0D0F18",
    text: "#FFFFFF",
    muted: "#94A3B8",
  },
};

const choreographer = new TemporalChoreographer();
export const RCRUT_SCENE1_MOTION_PLAN = choreographer.createMotionPlan(
  {
    id: "rcrut-scene-1",
    sceneIndex: 0,
    act: "hook",
    name: "Hook / Noise Friction",
    intent: "The elements slowly multiply until the frame becomes visually crowded with noise and friction.",
    durationSeconds: 3.0,
    emotionalBeat: "Acute friction and visual overwhelm",
    headlineCopy: "Hiring shouldn't feel like searching through noise.",
    visualDescription: "Candidate profiles multiplying until frame becomes visually crowded",
    elementIntents: [],
    pacingNotes: "Sparse at first, gradual arrival, rapid accelerating cascade into climax",
  },
  {} as any,
  {} as any,
  {} as any,
  30
);

export const RCRUT_SCENE1_CARDS = [
  // 1. Initial sparse hero card (present at t=0)
  {
    id: "card-1",
    name: "James Monet",
    role: "Senior Backend Engineer",
    avatarInitials: "JM",
    avatarBg: "rgba(124, 58, 237, 0.35)",
    location: "San Francisco, CA",
    matchScore: "94%",
    tags: ["Go", "Postgres", "Distributed Systems"],
    position: { x: 32, y: 24, z: 50 },
    rotation: { x: 9, y: 0, z: 0 },
    scale: 1.02,
    spawnFrame: 0,
    entryTrajectory: "fade" as const,
  },
  // 2. Gradual addition: first alarm sounds at t=18f
  {
    id: "card-2",
    name: "Alexandre Chen",
    role: "Full Stack Engineer",
    avatarInitials: "AC",
    avatarBg: "rgba(239, 68, 68, 0.25)",
    location: "New York, NY",
    matchScore: "92%",
    tags: ["React", "TypeScript", "Node"],
    alertBadge: {
      text: "482 Unscreened",
      variant: "red" as const,
    },
    position: { x: 7, y: 10, z: 40 },
    rotation: { x: 10, y: -6, z: -1 },
    scale: 0.96,
    spawnFrame: 18,
    entryTrajectory: "from-left" as const,
  },
  // 3. Third arrival at t=30f
  {
    id: "card-3",
    name: "Raina Name",
    role: "VP of Engineering",
    avatarInitials: "RN",
    avatarBg: "rgba(16, 185, 129, 0.25)",
    location: "Seattle, WA",
    matchScore: "96%",
    tags: ["Org Leadership", "Scale", "Hiring"],
    position: { x: 60, y: 8, z: 20 },
    rotation: { x: 12, y: 6, z: 2 },
    scale: 0.95,
    spawnFrame: 30,
    entryTrajectory: "from-right" as const,
  },
  // 4. Backlog friction hits at t=42f
  {
    id: "card-4",
    name: "Roscoe Moreno",
    role: "Lead Systems Architect",
    avatarInitials: "RM",
    avatarBg: "rgba(249, 115, 22, 0.25)",
    location: "Austin, TX",
    matchScore: "91%",
    tags: ["Rust", "Kubernetes", "AWS"],
    alertBadge: {
      text: "Backlog",
      variant: "red" as const,
    },
    position: { x: 6, y: 44, z: 30 },
    rotation: { x: 12, y: -4, z: 1 },
    scale: 0.94,
    spawnFrame: 42,
    entryTrajectory: "from-left" as const,
  },
  // 5. Pending review bottleneck at t=52f
  {
    id: "card-5",
    name: "Jocelyn Nonda",
    role: "Product Design Lead",
    avatarInitials: "JN",
    avatarBg: "rgba(168, 85, 247, 0.3)",
    location: "Remote / Europe",
    matchScore: "88%",
    tags: ["Design Systems", "Figma", "Interaction"],
    alertBadge: {
      text: "Pending 3w",
      variant: "purple" as const,
    },
    position: { x: 62, y: 48, z: 35 },
    rotation: { x: 8, y: 5, z: -1 },
    scale: 0.96,
    spawnFrame: 52,
    entryTrajectory: "from-right" as const,
  },
  // 6. Accelerating cascade: SLA breach warning surges in Beat 4 (t=52f) to occlude headline
  {
    id: "card-6",
    name: "Jethan Smith",
    role: "Staff Infrastructure Engineer",
    avatarInitials: "JS",
    avatarBg: "rgba(239, 68, 68, 0.25)",
    location: "Denver, CO",
    matchScore: "89%",
    tags: ["Kubernetes", "AWS", "Terraform"],
    alertBadge: {
      text: "SLA Warning",
      variant: "red" as const,
    },
    position: { x: 14, y: 4, z: 65 },
    rotation: { x: 10, y: 2, z: 1 },
    scale: 1.02,
    spawnFrame: 52,
    entryTrajectory: "from-depth" as const,
    occludesTypography: true,
  },
  // 7. Review overdue drop from above at t=66f
  {
    id: "card-7",
    name: "Maria Santos",
    role: "Security Lead",
    avatarInitials: "MS",
    avatarBg: "rgba(244, 63, 94, 0.25)",
    location: "Chicago, IL",
    matchScore: "87%",
    tags: ["InfraSec", "Compliance", "SOC2"],
    alertBadge: {
      text: "Review Overdue",
      variant: "red" as const,
    },
    position: { x: 4, y: 74, z: 15 },
    rotation: { x: 14, y: -6, z: 1 },
    scale: 0.90,
    spawnFrame: 66,
    entryTrajectory: "drop-down" as const,
  },
  // 8. Lower stage float up at t=72f
  {
    id: "card-8",
    name: "David Kim",
    role: "ML Platform Engineer",
    avatarInitials: "DK",
    avatarBg: "rgba(99, 102, 241, 0.25)",
    location: "Boston, MA",
    matchScore: "95%",
    tags: ["PyTorch", "CUDA", "Ray"],
    position: { x: 48, y: 72, z: 5 },
    rotation: { x: 14, y: 4, z: -1 },
    scale: 0.90,
    spawnFrame: 72,
    entryTrajectory: "float-up" as const,
  },
  // 9. Climax depth saturation at t=76f
  {
    id: "card-9",
    name: "Elena Rostova",
    role: "Data Engineering Lead",
    avatarInitials: "ER",
    tags: ["Spark", "Flink", "Kafka"],
    position: { x: -6, y: 30, z: -40 },
    rotation: { x: 16, y: -8, z: 0 },
    blur: 2,
    opacity: 0.6,
    scale: 0.88,
    spawnFrame: 76,
    entryTrajectory: "from-depth" as const,
  },
  // 10. Climax right edge crowding at t=80f
  {
    id: "card-10",
    name: "Marcus Vance",
    role: "Frontend Platform Lead",
    avatarInitials: "MV",
    tags: ["Next.js", "Perf", "Web"],
    position: { x: 68, y: 30, z: -45 },
    rotation: { x: 14, y: 8, z: -2 },
    blur: 2,
    opacity: 0.55,
    scale: 0.86,
    spawnFrame: 80,
    entryTrajectory: "from-right" as const,
  },
  // 11. Climax deep background backlog at t=84f
  {
    id: "card-11",
    name: "Siddharth Patel",
    role: "Staff DevOps Specialist",
    avatarInitials: "SP",
    tags: ["Terraform", "CI/CD", "Security"],
    position: { x: 30, y: 82, z: -60 },
    rotation: { x: 18, y: 0, z: 0 },
    blur: 3,
    opacity: 0.45,
    scale: 0.84,
    spawnFrame: 84,
    entryTrajectory: "drop-down" as const,
  },
];

interface Props {
  isStatic?: boolean;
}

export const RcrutScene1: React.FC<Props> = ({ isStatic = false }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Evaluated Temporal Composition Snapshot across all 10 dimensions
  const activeFrame = isStatic ? 82 : frame;
  const snapshot = interpolateTemporalComposition(RCRUT_SCENE1_MOTION_PLAN, activeFrame);

  // 1. Master Camera Rig driven by cameraPosition
  const camScale = isStatic ? 1.0 : snapshot.cameraPosition.scale;
  const camTranslateY = isStatic ? 0 : snapshot.cameraPosition.translateY;
  const camTiltX = isStatic ? 0 : (snapshot.cameraPosition.tiltX ?? 0);

  // 2. Dynamic Typography State under cognitive stress
  const headlineTracking = isStatic ? "-0.038em" : `${snapshot.typographyState.tracking}em`;
  const headlineOpacity = isStatic ? 1.0 : snapshot.typographyState.opacity;
  const headlineFontSize = isStatic ? "76px" : `${snapshot.typographyState.fontSize}px`;
  const headlineLineHeight = isStatic ? 1.08 : snapshot.typographyState.lineHeight;
  const headlineBlur = isStatic ? "none" : (snapshot.typographyState.blur ? `blur(${snapshot.typographyState.blur}px)` : "none");

  // 3. Dynamic Peripheral Vignette Intensity
  const vignetteDarkness = isStatic ? 0.70 : snapshot.peripheralActivity.vignetteDarkness;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07080C",
        fontFamily: RCRUT_BRAND.font,
        overflow: "hidden",
        width: 1080,
        height: 1920,
      }}
    >
      {/* Global Vignette & Dark Atmospheric Depth */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 35%, rgba(0, 0, 0, ${vignetteDarkness}) 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Subtle Atmospheric Top Violet Glow */}
      <div
        style={{
          position: "absolute",
          top: "-150px",
          left: "50%",
          width: "900px",
          height: "500px",
          transform: "translateX(-50%)",
          background: `radial-gradient(ellipse at center, rgba(124, 58, 237, ${0.12 * (snapshot.lightingIntensity.beamIntensity / 0.85)}) 0%, transparent 70%)`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Master Camera Rig */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${camScale}) translateY(${camTranslateY}px) rotateX(${camTiltX}deg)`,
          transformOrigin: "50% 45%",
        }}
      >
        {/* Layer 1: Stark Editorial Headline in Upper Negative Space with Dynamic Typography State */}
        <div
          style={{
            position: "absolute",
            left: "86px",
            top: "115px",
            width: "910px",
            zIndex: 30,
            opacity: headlineOpacity,
            filter: headlineBlur,
            transition: "opacity 0.2s ease-out, filter 0.2s ease-out",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#FFFFFF",
              fontSize: headlineFontSize,
              fontWeight: 800,
              lineHeight: headlineLineHeight,
              letterSpacing: headlineTracking,
              fontFamily: RCRUT_BRAND.font,
            }}
          >
            {isStatic ? (
              <>
                Hiring shouldn't<br />
                feel like searching<br />
                through noise.
              </>
            ) : (
              ["Hiring", "shouldn't", "\n", "feel", "like", "searching", "\n", "through", "noise."].map((token, idx) => {
                if (token === "\n") return <br key={idx} />;
                const wordDelay = idx * 2.2;
                const wordFrame = Math.max(0, snapshot.effectiveFrame - wordDelay);
                const spr = spring({
                  frame: wordFrame,
                  fps,
                  config: { damping: 14, mass: 0.6, stiffness: 140 },
                });
                const opacity = interpolate(wordFrame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
                const translateY = interpolate(spr, [0, 1], [22, 0]);
                return (
                  <span
                    key={idx}
                    style={{
                      display: "inline-block",
                      marginRight: "0.26em",
                      opacity,
                      transform: `translateY(${translateY}px)`,
                    }}
                  >
                    {token}
                  </span>
                );
              })
            )}
          </h1>
        </div>

        {/* Layer 2: 3D Perspective Candidate Overload Field with Dynamic Composition Snapshot */}
        <CandidateNoiseField
          props={{
            cards: RCRUT_SCENE1_CARDS,
            volumetricBeam: {
              color: "#7C3AED",
              secondaryColor: "#6366F1",
              originX: 50,
              originY: 100,
              intensity: snapshot.lightingIntensity.beamIntensity,
            },
            containerStyle: {
              topPercent: snapshot.compositionGeometry.containerBounds.topPercent,
              heightPercent: snapshot.compositionGeometry.containerBounds.heightPercent,
              leftPercent: snapshot.compositionGeometry.containerBounds.leftPercent,
              widthPercent: snapshot.compositionGeometry.containerBounds.widthPercent,
              borderRadius: snapshot.compositionGeometry.containerBounds.borderRadius,
              borderColor: "rgba(255, 255, 255, 0.12)",
              backgroundColor: "#090B13",
            },
            watermarkText: "RCRUT",
            isStatic,
            delay: 0,
          }}
          brand={RCRUT_BRAND}
          compositionSnapshot={snapshot}
        />
      </div>
    </AbsoluteFill>
  );
};

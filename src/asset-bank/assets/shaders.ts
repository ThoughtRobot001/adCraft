import { AssetMetadata } from "../types";

export const SHADER_ASSETS: AssetMetadata[] = [
  {
    id: "shader-fluid-aurora",
    category: "shader",
    name: "Fluid Aurora Wave Simulation",
    description: "Real-time canvas shader calculating sinusoidal wave heights and chromatic blend paths.",
    tags: ["shader", "canvas", "aurora", "fluid", "color-wave"],
    brandFit: ["modern", "technical", "creative"],
    mediaType: "shader",
    properties: {
      preset: "aurora",
      speed: 1.0,
      opacity: 0.9,
    },
    usageNotes: "Synchronized with Remotion frame counter for smooth, jitter-free 60fps / 30fps renders.",
  },
  {
    id: "shader-domain-warp",
    category: "shader",
    name: "Domain Warp Flow Dynamics",
    description: "Multi-frequency mathematical domain-warping fluid field with high-contrast color ridges.",
    tags: ["shader", "domain-warp", "stripe", "linear", "flow"],
    brandFit: ["technical", "fintech", "developer-focused"],
    mediaType: "shader",
    properties: {
      preset: "warp",
      speed: 0.8,
      opacity: 0.85,
    },
    usageNotes: "Creates the coveted fluid texture seen in high-end Silicon Valley product launches.",
  },
  {
    id: "shader-mesh-blobs",
    category: "shader",
    name: "Gaussian Mesh Blobs",
    description: "Trigonometric orbiting Gaussian blur blobs with organic color fusion.",
    tags: ["shader", "mesh", "blobs", "soft", "saas"],
    brandFit: ["minimalist", "authoritative", "modern"],
    mediaType: "shader",
    properties: {
      preset: "mesh-blobs",
      speed: 1.1,
      opacity: 0.95,
    },
    usageNotes: "Provides a soft, approachable visual anchor without sharp distracting elements.",
  },
];

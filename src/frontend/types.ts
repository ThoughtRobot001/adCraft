export interface Scene {
  id: string;
  timeRange: string;
  durationSec: number;
  phase: string;
  shotType: string;
  headline: string;
  visualPrompt: string;
  scriptVoiceover: string;
  onScreenText: string;
  soundEffect: string;
  imageUrl?: string;
}

export interface ProjectMetrics {
  estimatedCtr: string;
  hookRetention: string;
  targetAudience: string;
  recommendedPlacements: string[];
}

export interface Project {
  id: string;
  title: string;
  type: string;
  duration: string;
  resolution: string;
  status: "Completed" | "In Progress" | "Draft";
  createdAt: string;
  updatedAt: string;
  thumbnail: string;
  prompt: string;
  objective: string;
  creativeDirection: string;
  hook: string;
  aspectRatio: string;
  metrics?: ProjectMetrics;
  scenes: Scene[];
}

export interface CampaignObjective {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface CreativeDirection {
  id: string;
  label: string;
  description: string;
  tag: string;
}

export interface AdTemplate {
  id: string;
  title: string;
  category: string;
  duration: string;
  aspectRatio: string;
  thumbnail: string;
  objective: string;
  style: string;
  description: string;
  samplePrompt: string;
}

export interface BrandKit {
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  tone: string[];
  logoUrl: string;
}

export interface AssetItem {
  id: string;
  name: string;
  type: "video" | "image" | "audio" | "logo";
  size: string;
  date: string;
  url: string;
  duration?: string;
}

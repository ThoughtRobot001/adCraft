import { Project, CampaignObjective, CreativeDirection, AdTemplate, BrandKit, AssetItem } from "../types";

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "rcrut-campaign",
    title: "RCRUT Campaign",
    type: "Video Ad",
    duration: "30s",
    resolution: "1080 × 1920",
    status: "Completed",
    createdAt: "Sep 15, 2026",
    updatedAt: "Sep 15, 2026",
    thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    prompt: "High-performance technical all-weather outdoor mountain gear for extreme explorers",
    objective: "Get more sales",
    creativeDirection: "modern, cinematic, minimal",
    hook: "Most people stop when the weather turns. That is where we begin.",
    aspectRatio: "9:16",
    metrics: {
      estimatedCtr: "4.8%",
      hookRetention: "82%",
      targetAudience: "Outdoor enthusiasts, endurance athletes, 24-45",
      recommendedPlacements: ["TikTok Ads", "Instagram Reels", "YouTube Shorts"],
    },
    scenes: [
      {
        id: "s1",
        timeRange: "0:00 - 0:04",
        durationSec: 4,
        phase: "The Hook",
        shotType: "Cinematic Extreme Wide",
        headline: "The Ridge Awakening",
        visualPrompt: "Low-angle tracking shot of a lone mountaineer standing over a misty abyssal mountain ridge at dawn.",
        scriptVoiceover: "The world ends where ordinary gear stops.",
        onScreenText: "UNCOMPROMISING CONDITIONS.",
        soundEffect: "Howling wind cuts to heart-thump bass drop",
        imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "s2",
        timeRange: "0:04 - 0:12",
        durationSec: 8,
        phase: "The Challenge",
        shotType: "Macro Fabric Detail",
        headline: "Engineered for Extremes",
        visualPrompt: "Super slow-motion rain droplets violently beading and bouncing off water-repellent ballistic weave.",
        scriptVoiceover: "Engineered with triple-layer hydrophobic membrane. Absolute wind and moisture barrier.",
        onScreenText: "100% HYDROPHOBIC TECH",
        soundEffect: "Sharp water droplet frequency and fabric snap",
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "s3",
        timeRange: "0:12 - 0:22",
        durationSec: 10,
        phase: "Dynamic Action",
        shotType: "Dynamic Handheld Orbit",
        headline: "Unrestricted Movement",
        visualPrompt: "Explorer leaping across rocky terrain, fabric flexing effortlessly with ergonomic cutouts.",
        scriptVoiceover: "Featherlight mobility. Zero friction. Total control over every vertical ascent.",
        onScreenText: "FEATHERLIGHT ERGONOMICS",
        soundEffect: "Gravel crunch, rhythmic breathing, building synth swell",
        imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "s4",
        timeRange: "0:22 - 0:30",
        durationSec: 8,
        phase: "Call to Action",
        shotType: "Hero Lockup with Glow",
        headline: "Claim The Peak",
        visualPrompt: "Mountaineer reaching the mountain peak silhouette, glowing AdCraft engineered logo overlay.",
        scriptVoiceover: "Explore beyond limits. Order your RCRUT Alpha Kit today with priority worldwide shipping.",
        onScreenText: "CLAIM YOUR APEX. SHOP NOW",
        soundEffect: "Deep resonant cinematic brass resolve",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
      }
    ]
  },
  {
    id: "novatech-launch",
    title: "NovaTech Launch",
    type: "Video Ad",
    duration: "24s",
    resolution: "1080 × 1920",
    status: "In Progress",
    createdAt: "Sep 14, 2026",
    updatedAt: "Sep 14, 2026",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    prompt: "Next-generation quantum cloud computing architecture for autonomous AI infrastructure",
    objective: "Lead generation",
    creativeDirection: "Futuristic, cyberpunk city lights, glass skyscrapers, sleek tech neon",
    hook: "The server room is dead. Meet the distributed intelligence mesh.",
    aspectRatio: "9:16",
    metrics: {
      estimatedCtr: "5.4%",
      hookRetention: "88%",
      targetAudience: "CTOs, engineers, founders, tech innovators 25-50",
      recommendedPlacements: ["LinkedIn Video", "X Video", "YouTube Tech"],
    },
    scenes: [
      {
        id: "nt1",
        timeRange: "0:00 - 0:06",
        durationSec: 6,
        phase: "The Hook",
        shotType: "Aerial Flyover",
        headline: "Silicon Horizon",
        visualPrompt: "Illuminated glass skyscrapers pulsing with digital light circuits across night metropolitan sky.",
        scriptVoiceover: "Legacy cloud is holding you back. Latency is costing millions.",
        onScreenText: "0.4MS GLOBAL LATENCY",
        soundEffect: "High-voltage digital surge and riser",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "nt2",
        timeRange: "0:06 - 0:14",
        durationSec: 8,
        phase: "The Solution",
        shotType: "Holographic Interface",
        headline: "Instant Distributed Mesh",
        visualPrompt: "Sleek dark interface showing automatic worldwide multi-region failover and real-time GPU orchestration.",
        scriptVoiceover: "NovaTech automates multi-cluster deployments in under three seconds.",
        onScreenText: "DEPLOY WORLDWIDE IN 3s",
        soundEffect: "Futuristic interface click and hum",
        imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "nt3",
        timeRange: "0:14 - 0:24",
        durationSec: 10,
        phase: "Call to Action",
        shotType: "Brand Reveal",
        headline: "Scale Without Ceilings",
        visualPrompt: "NovaTech iridescent glowing emblem floating above hyper-speed data streams.",
        scriptVoiceover: "Claim $5,000 in starter cloud credits. Build the future today.",
        onScreenText: "START FREE TRIAL. GET $5,000 CREDITS",
        soundEffect: "Harmonic tech chord and gentle sub-bass",
        imageUrl: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80"
      }
    ]
  },
  {
    id: "luma-skincare",
    title: "Luma Skincare",
    type: "Video Ad",
    duration: "20s",
    resolution: "1080 × 1920",
    status: "Completed",
    createdAt: "Sep 12, 2026",
    updatedAt: "Sep 12, 2026",
    thumbnail: "https://images.unsplash.com/photo-1608248597358-1e43c5b59ff5?auto=format&fit=crop&w=1200&q=80",
    prompt: "Clean, botanical-infused peptide glow serum for radiant, dewy morning hydration",
    objective: "Get more sales",
    creativeDirection: "Minimalist luxury, soft warm sunlight, organic stone pedestal, airy studio",
    hook: "Glass skin isn't genetic. It's clean hydration formulated right.",
    aspectRatio: "9:16",
    metrics: {
      estimatedCtr: "6.1%",
      hookRetention: "79%",
      targetAudience: "Clean beauty lovers, skincare routine enthusiasts 20-40",
      recommendedPlacements: ["Instagram Reels", "TikTok Beauty", "Pinterest Video"],
    },
    scenes: [
      {
        id: "ls1",
        timeRange: "0:00 - 0:05",
        durationSec: 5,
        phase: "The Hook",
        shotType: "Macro Sunlight Reveal",
        headline: "Pure Morning Radiance",
        visualPrompt: "Glass dropper dispensing a viscous golden drop of serum onto smooth organic white ceramic.",
        scriptVoiceover: "What if one drop could transform your morning skin barrier?",
        onScreenText: "100% BOTANICAL PEPTIDES",
        soundEffect: "Soft ambient morning chimes and water droplet",
        imageUrl: "https://images.unsplash.com/photo-1608248597358-1e43c5b59ff5?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "ls2",
        timeRange: "0:05 - 0:13",
        durationSec: 8,
        phase: "The Glow",
        shotType: "High Key Soft Portrait",
        headline: "Instant 72h Hydration",
        visualPrompt: "Model gently pressing serum into dewy glowing cheekbones with natural morning window light.",
        scriptVoiceover: "Bio-fermented hyaluronic complex binds moisture 5x deeper than ordinary serums.",
        onScreenText: "72-HOUR DEEP HYDRATION",
        soundEffect: "Warm acoustic warmth and gentle breath",
        imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "ls3",
        timeRange: "0:13 - 0:20",
        durationSec: 7,
        phase: "Call to Action",
        shotType: "Studio Product Hero",
        headline: "Your Daily Ritual",
        visualPrompt: "Luma Skincare bottle resting on sun-dappled travertine pedestal with soft green botanical leaf.",
        scriptVoiceover: "Experience the glow. Shop the introductory bundle with 20% off your first bottle.",
        onScreenText: "UNLOCK 20% OFF FIRST ORDER",
        soundEffect: "Delicate chime chime sparkle",
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80"
      }
    ]
  },
  {
    id: "volt-motors",
    title: "Volt Motors",
    type: "Video Ad",
    duration: "30s",
    resolution: "1080 × 1920",
    status: "Completed",
    createdAt: "Sep 10, 2026",
    updatedAt: "Sep 10, 2026",
    thumbnail: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
    prompt: "All-electric performance grand tourer with dual motor 680hp and autonomous highway cruising",
    objective: "Brand awareness",
    creativeDirection: "High-octane luxury, mountain cliff switchbacks, aerodynamic motion blur, dusk sun flare",
    hook: "0 to 60 in 2.6 seconds. In total, thrilling silence.",
    aspectRatio: "9:16",
    metrics: {
      estimatedCtr: "5.1%",
      hookRetention: "85%",
      targetAudience: "Automotive aficionados, EV buyers, luxury tech adopters 28-55",
      recommendedPlacements: ["YouTube Pre-Roll", "Meta Feeds", "Connected TV"],
    },
    scenes: [
      {
        id: "vm1",
        timeRange: "0:00 - 0:06",
        durationSec: 6,
        phase: "The Hook",
        shotType: "Low Tracking Road Cam",
        headline: "The Silence of Pure Power",
        visualPrompt: "Sleek aerodynamic EV carving through misty alpine curves at sunrise, headlights piercing the fog.",
        scriptVoiceover: "Power no longer needs to make noise to be felt.",
        onScreenText: "0 - 60 IN 2.6 SECONDS",
        soundEffect: "Futuristic high-frequency electric turbine spool-up",
        imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "vm2",
        timeRange: "0:06 - 0:18",
        durationSec: 12,
        phase: "Interior Luxury",
        shotType: "Cockpit Gimbal Glide",
        headline: "Intuitive Intelligence",
        visualPrompt: "Minimalist cockpit, panoramic augmented reality HUD guiding smoothly along mountain switchbacks.",
        scriptVoiceover: "Dual-motor all-wheel torque vectoring keeps you glued to every curve.",
        onScreenText: "DUAL MOTOR 680 HP",
        soundEffect: "Bespoke acoustic hum and tire grip resonance",
        imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
      },
      {
        id: "vm3",
        timeRange: "0:18 - 0:30",
        durationSec: 12,
        phase: "Call to Action",
        shotType: "Ridge Sunset Silhouette",
        headline: "Drive The Revolution",
        visualPrompt: "Volt Motors GT overlooking breathtaking sunset summit with taillight lightbar glowing.",
        scriptVoiceover: "Reserve your custom build today. Deliveries commence this winter.",
        onScreenText: "CONFIGURE YOUR VOLT GT. BOOK TEST DRIVE",
        soundEffect: "Deep cinematic brass crescendo",
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80"
      }
    ]
  }
];

export const CAMPAIGN_OBJECTIVES: CampaignObjective[] = [
  {
    id: "sales",
    label: "Get more sales",
    description: "Drive direct online conversions, checkout purchases, and immediate return on ad spend.",
    icon: "ShoppingBag"
  },
  {
    id: "awareness",
    label: "Brand awareness",
    description: "Maximize unique audience reach and establish recognizable visual authority.",
    icon: "Eye"
  },
  {
    id: "leads",
    label: "Lead generation",
    description: "Collect verified high-intent customer contacts, demo requests, and bookings.",
    icon: "Target"
  },
  {
    id: "traffic",
    label: "Drive website traffic",
    description: "Optimize for qualified high-intent click-throughs to your landing page or store.",
    icon: "MousePointerClick"
  },
  {
    id: "app-installs",
    label: "App installs & downloads",
    description: "Spark viral interest and drive rapid installs on iOS App Store and Google Play.",
    icon: "Smartphone"
  },
  {
    id: "engagement",
    label: "Boost engagement",
    description: "Ignite comments, shares, duets, and community buzz across social platforms.",
    icon: "MessageCircle"
  }
];

export const CREATIVE_DIRECTIONS: CreativeDirection[] = [
  {
    id: "cinematic",
    label: "modern, cinematic, minimal",
    tag: "Cinematic 4K",
    description: "Wide anamorphic lens, dramatic moody shadows, pristine color grading, and evocative atmosphere."
  },
  {
    id: "ugc",
    label: "viral UGC creator style, casual, authentic",
    tag: "Viral UGC",
    description: "Authentic iPhone camera feel, relatable selfie hooks, dynamic cuts, and organic social trust."
  },
  {
    id: "luxury",
    label: "minimalist luxury, soft lighting, editorial",
    tag: "Luxury Editorial",
    description: "Gentle natural daylight, travertine pedestals, refined negative space, quiet luxury aesthetics."
  },
  {
    id: "tech",
    label: "futuristic cyberpunk, neon circuits, high tech",
    tag: "High-Tech Neon",
    description: "Glow effects, dark futuristic UI HUDs, hyper-speed transitions, and sleek glass reflections."
  },
  {
    id: "bold-dr",
    label: "direct-response, bold subtitles, high urgency",
    tag: "Direct Response",
    description: "High-converting hook, large bold contrasting captions, problem-agitation-solution rhythm."
  },
  {
    id: "lifestyle",
    label: "sun-drenched lifestyle, energetic, feel-good",
    tag: "Energetic Lifestyle",
    description: "Warm golden-hour sunlight, smiling real-life moments, fluid gimbal motion, upbeat vibe."
  }
];

export const AD_TEMPLATES: AdTemplate[] = [
  {
    id: "tpl-ecommerce-hero",
    title: "E-Commerce Product Launch Hero",
    category: "Physical Products",
    duration: "30s",
    aspectRatio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    objective: "Get more sales",
    style: "modern, cinematic, minimal",
    description: "Designed for viral TikTok & Reels product drops. Combines high-retention hook with macro craftsmanship.",
    samplePrompt: "Minimalist titanium mechanical everyday carry watch with sapphire crystal glass"
  },
  {
    id: "tpl-saas-explainer",
    title: "SaaS & AI Tool Rapid Explainer",
    category: "Software & Tech",
    duration: "24s",
    aspectRatio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    objective: "Lead generation",
    style: "futuristic cyberpunk, neon circuits, high tech",
    description: "Pain-point agitating tech ad showing immediate workflow acceleration and 10x output speed.",
    samplePrompt: "AI automated customer support agent that resolves 80% of tickets in 10 seconds"
  },
  {
    id: "tpl-skincare-glow",
    title: "Clean Beauty & Wellness Ritual",
    category: "Beauty & Health",
    duration: "20s",
    aspectRatio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    objective: "Get more sales",
    style: "minimalist luxury, soft lighting, editorial",
    description: "Sensory close-ups, soothing textures, dewy skin payoff, and irresistible introductory bundle offer.",
    samplePrompt: "Organic hyaluronic cold-pressed glow serum with rosehip oil and ceramides"
  },
  {
    id: "tpl-automotive-power",
    title: "Performance Automotive & Gear",
    category: "Mobility & Outdoors",
    duration: "30s",
    aspectRatio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    objective: "Brand awareness",
    style: "modern, cinematic, minimal",
    description: "Adrenaline-fueled cinematic camera sweeps, engine torque sound design, and aspirational horizon finish.",
    samplePrompt: "Electric performance roadster with autonomous highway autopilot"
  },
  {
    id: "tpl-app-growth",
    title: "Mobile App Viral Hook",
    category: "Apps & Games",
    duration: "15s",
    aspectRatio: "9:16",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    objective: "App installs & downloads",
    style: "viral UGC creator style, casual, authentic",
    description: "Fast dopamine trigger: 'Everyone is using this secret app to organize their entire week in 2 minutes'.",
    samplePrompt: "Habit tracking mobile app with AI accountability voice companion"
  }
];

export const INITIAL_BRAND_KIT: BrandKit = {
  name: "AdCraft Studio",
  tagline: "High-Performance Creative Intelligence",
  primaryColor: "#00E575",
  secondaryColor: "#111827",
  accentColor: "#3B82F6",
  fontFamily: "Plus Jakarta Sans",
  tone: ["Cinematic", "High-Converting", "Modern", "Bold", "Authentic"],
  logoUrl: "/adcraft-logo.svg"
};

export const INITIAL_ASSETS: AssetItem[] = [
  {
    id: "ast-1",
    name: "Alpine_Summit_Mist_4k.mp4",
    type: "video",
    size: "48.2 MB",
    duration: "0:30",
    date: "Sep 15, 2026",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "ast-2",
    name: "Droplet_Macro_Texture.mp4",
    type: "video",
    size: "32.5 MB",
    duration: "0:12",
    date: "Sep 15, 2026",
    url: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "ast-3",
    name: "Cinematic_Bass_Drop_Stereo.wav",
    type: "audio",
    size: "4.1 MB",
    duration: "0:30",
    date: "Sep 14, 2026",
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "ast-4",
    name: "NovaTech_Neon_Skyline.png",
    type: "image",
    size: "8.4 MB",
    date: "Sep 14, 2026",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "ast-5",
    name: "Luma_Serum_Stone_Hero.jpg",
    type: "image",
    size: "6.7 MB",
    date: "Sep 12, 2026",
    url: "https://images.unsplash.com/photo-1608248597358-1e43c5b59ff5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "ast-6",
    name: "Volt_GT_Alpine_Curve.png",
    type: "image",
    size: "11.2 MB",
    date: "Sep 10, 2026",
    url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80"
  }
];

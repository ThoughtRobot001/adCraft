import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const MOTION_EXAMPLES_DIR = path.resolve(ROOT, "Motion examples");
const ASSETS_DIR = path.resolve(ROOT, "public/assets");
const BG_DIR = path.join(ASSETS_DIR, "backgrounds");
const DEVICES_DIR = path.join(ASSETS_DIR, "devices");
const OVERLAYS_DIR = path.join(ASSETS_DIR, "overlays");
const UI_DIR = path.join(ASSETS_DIR, "ui");
const TEXTURES_DIR = path.join(ASSETS_DIR, "textures");

[BG_DIR, DEVICES_DIR, OVERLAYS_DIR, UI_DIR, TEXTURES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

interface ExtractionSpec {
  sourceVideo: string;
  timestamp: string;
  outputPath: string;
  description: string;
}

const EXTRACTION_SPECS: ExtractionSpec[] = [
  // 1. Astra / Hedge motion plates
  {
    sourceVideo: "been seeing other motion designers make use of Astra and i finally decided to tr.mp4",
    timestamp: "00:00:03.500",
    outputPath: path.join(BG_DIR, "astra-dark-grid-plate.png"),
    description: "Deep perspective 3D grid with dark obsidian gradient floor",
  },
  {
    sourceVideo: "been seeing other motion designers make use of Astra and i finally decided to tr.mp4",
    timestamp: "00:00:14.200",
    outputPath: path.join(BG_DIR, "astra-horizon-glow.png"),
    description: "Amber/gold ambient horizon bloom for high-value financial events",
  },
  {
    sourceVideo: "been seeing other motion designers make use of Astra and i finally decided to tr.mp4",
    timestamp: "00:00:22.800",
    outputPath: path.join(BG_DIR, "astra-depth-monolith.png"),
    description: "Monumental typography void backdrop with studio rim lighting",
  },

  // 2. BlinkCashX stablecoin deposit motion plates
  {
    sourceVideo: "One tap, Stablecoin deposits, Super cool! I worked on this video for @BlinkCashX.mp4",
    timestamp: "00:00:02.400",
    outputPath: path.join(BG_DIR, "blinkcash-cyan-ambient.png"),
    description: "Electric cyan ambient fintech backdrop with subtle gradient contouring",
  },
  {
    sourceVideo: "One tap, Stablecoin deposits, Super cool! I worked on this video for @BlinkCashX.mp4",
    timestamp: "00:00:06.800",
    outputPath: path.join(UI_DIR, "blinkcash-deposit-modal.png"),
    description: "Production mobile one-tap stablecoin deposit transaction card",
  },
  {
    sourceVideo: "One tap, Stablecoin deposits, Super cool! I worked on this video for @BlinkCashX.mp4",
    timestamp: "00:00:18.500",
    outputPath: path.join(BG_DIR, "blinkcash-particle-flow.png"),
    description: "High-velocity financial liquidity streak background",
  },

  // 3. Super cool launch videos
  {
    sourceVideo: "We make super cool launch videos https___t.co_8zAnWjkWSc.mp4",
    timestamp: "00:00:04.100",
    outputPath: path.join(BG_DIR, "supercool-bento-glass.png"),
    description: "Frosted bento glass card layout with soft ambient lighting",
  },
  {
    sourceVideo: "We make super cool launch videos https___t.co_8zAnWjkWSc.mp4",
    timestamp: "00:00:10.500",
    outputPath: path.join(TEXTURES_DIR, "glass-frosted-refraction.png"),
    description: "Refractive frosted glass surface texture for overlay blending",
  },

  // 4. Best thing you'll see today
  {
    sourceVideo: "Best thing you'll see today https___t.co_q5w9SWLwGJ.mp4",
    timestamp: "00:00:05.200",
    outputPath: path.join(BG_DIR, "kinetic-stream-lines.png"),
    description: "Kinetic motion stream lines with high-energy directional blur",
  },
  {
    sourceVideo: "Best thing you'll see today https___t.co_q5w9SWLwGJ.mp4",
    timestamp: "00:00:12.600",
    outputPath: path.join(TEXTURES_DIR, "chromatic-streak.png"),
    description: "High-contrast chromatic aberration streak texture",
  },

  // 5. 84 hours no AI video
  {
    sourceVideo: "i made this video within 84 hours. no AI was used in the animation. thoughts htt.mp4",
    timestamp: "00:00:03.800",
    outputPath: path.join(BG_DIR, "monolithic-graphite-dark.png"),
    description: "Studio matte graphite dark surface plate with subtle specular sheen",
  },
  {
    sourceVideo: "i made this video within 84 hours. no AI was used in the animation. thoughts htt.mp4",
    timestamp: "00:00:08.400",
    outputPath: path.join(TEXTURES_DIR, "specular-lens-flare.png"),
    description: "Clean anamorphic specular flare ray texture",
  },
];

const VECTOR_ASSETS: Array<{ path: string; content: string; description: string }> = [
  // iPad Pro M4 Frame
  {
    path: path.join(DEVICES_DIR, "ipad-pro-m4-frame.svg"),
    description: "iPad Pro M4 ultra-thin vector hardware frame with micro-bezels",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1000" width="1400" height="1000">
  <defs>
    <linearGradient id="chassis-m4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2D2F35"/>
      <stop offset="50%" stop-color="#1A1C20"/>
      <stop offset="100%" stop-color="#121316"/>
    </linearGradient>
  </defs>
  <rect x="20" y="20" width="1360" height="960" rx="36" fill="url(#chassis-m4)" stroke="#43464F" stroke-width="2.5"/>
  <rect x="36" y="36" width="1328" height="928" rx="26" fill="#000000"/>
  <!-- Front Camera -->
  <circle cx="700" cy="28" r="3.5" fill="#0D0E12" stroke="#222" stroke-width="1"/>
</svg>`,
  },

  // Studio Display 5K Frame
  {
    path: path.join(DEVICES_DIR, "studio-display-5k-frame.svg"),
    description: "Studio Display 5K monitor frame with aluminum stand",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" width="1600" height="1200">
  <defs>
    <linearGradient id="alu-stand" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E2E3E8"/>
      <stop offset="100%" stop-color="#9A9CA6"/>
    </linearGradient>
    <linearGradient id="panel-bezel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1A1B1F"/>
      <stop offset="100%" stop-color="#0E0F12"/>
    </linearGradient>
  </defs>
  <!-- Display Panel -->
  <rect x="60" y="40" width="1480" height="880" rx="20" fill="url(#panel-bezel)" stroke="#3E4048" stroke-width="2"/>
  <rect x="84" y="64" width="1432" height="832" rx="10" fill="#000000"/>
  <circle cx="800" cy="52" r="3" fill="#050608"/>
  <!-- Stand Arm -->
  <path d="M 740 920 L 860 920 L 840 1140 L 760 1140 Z" fill="url(#alu-stand)" stroke="#7C7E88" stroke-width="1.5"/>
  <!-- Stand Foot -->
  <rect x="620" y="1140" width="360" height="16" rx="6" fill="url(#alu-stand)" stroke="#7C7E88" stroke-width="1.5"/>
</svg>`,
  },

  // USDC Verified Pill Badge
  {
    path: path.join(UI_DIR, "badge-usdc-verified.svg"),
    description: "Verified USDC Settlement badge with security glow",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 64" width="280" height="64">
  <rect x="2" y="2" width="276" height="60" rx="30" fill="#0B1528" stroke="#2775CA" stroke-width="1.8"/>
  <circle cx="32" cy="32" r="18" fill="#2775CA"/>
  <path d="M 28 22 C 34 22 37 25 37 28 C 37 32 32 33 28 34 C 24 35 23 37 23 39 C 23 42 26 44 32 44 C 36 44 38 43 40 41" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="32" y1="18" x2="32" y2="22" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="32" y1="44" x2="32" y2="48" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
  <text x="64" y="38" fill="#F8FAFC" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" letter-spacing="0.5">USDC Instant</text>
  <circle cx="246" cy="32" r="5" fill="#10B981"/>
</svg>`,
  },

  // Sub-12ms Latency Pill
  {
    path: path.join(UI_DIR, "badge-latency-ultra.svg"),
    description: "Ultra-low latency execution pill (<12ms)",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 56" width="260" height="56">
  <rect x="2" y="2" width="256" height="52" rx="26" fill="#121316" stroke="#22C55E" stroke-width="1.5"/>
  <circle cx="28" cy="28" r="6" fill="#22C55E"/>
  <text x="46" y="34" fill="#FFFFFF" font-family="system-ui, -apple-system, monospace" font-size="15" font-weight="700">12ms Execution</text>
  <path d="M 215 32 L 225 24 L 235 32" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },

  // Prediction Market Odds Card
  {
    path: path.join(UI_DIR, "badge-prediction-market.svg"),
    description: "Astra-style live probability market pill with dynamic odds",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 72" width="340" height="72">
  <rect x="2" y="2" width="336" height="68" rx="16" fill="#14161C" stroke="#F59E0B" stroke-width="1.8"/>
  <text x="24" y="32" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12" font-weight="600" text-transform="uppercase" letter-spacing="1">Fed Rate Cut Prob</text>
  <text x="24" y="54" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="20" font-weight="800">84.2% YES</text>
  <rect x="236" y="18" width="84" height="36" rx="8" fill="#F59E0B" fill-opacity="0.18" stroke="#F59E0B" stroke-width="1.2"/>
  <text x="278" y="41" fill="#F59E0B" font-family="system-ui, sans-serif" font-size="14" font-weight="800" text-anchor="middle">+14.6%</text>
</svg>`,
  },

  // Transaction Success Receipt
  {
    path: path.join(UI_DIR, "card-transaction-success.svg"),
    description: "Fintech instant transaction verified settlement receipt",
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 180" width="420" height="180">
  <rect x="2" y="2" width="416" height="176" rx="20" fill="#111318" stroke="#1E293B" stroke-width="2"/>
  <circle cx="50" cy="50" r="22" fill="#10B981" fill-opacity="0.2" stroke="#10B981" stroke-width="2"/>
  <path d="M 42 50 L 48 56 L 58 44" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="88" y="44" fill="#64748B" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-transform="uppercase" letter-spacing="1">Transfer Confirmed</text>
  <text x="88" y="68" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="24" font-weight="800">$10,000.00 USDC</text>
  <line x1="24" y1="96" x2="396" y2="96" stroke="#1E293B" stroke-width="1"/>
  <text x="24" y="128" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13">Gas Fee: $0.0004</text>
  <text x="24" y="152" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="13">Settlement: 0.14s</text>
  <rect x="280" y="118" width="116" height="38" rx="10" fill="#22C55E" fill-opacity="0.15" stroke="#22C55E" stroke-width="1"/>
  <text x="338" y="142" fill="#22C55E" font-family="system-ui, sans-serif" font-size="13" font-weight="700" text-anchor="middle">INSTANT SETTLE</text>
</svg>`,
  },
];

async function main() {
  console.log("🎬 [AdCraft Asset Extractor] Ingesting broadcast plates from Motion Examples...");

  const manifest: {
    extractedAt: string;
    extractedPlates: Array<{ file: string; description: string; source: string }>;
    vectorAssets: Array<{ file: string; description: string }>;
  } = {
    extractedAt: new Date().toISOString(),
    extractedPlates: [],
    vectorAssets: [],
  };

  // 1. Extract video keyframe plates using ffmpeg
  for (const spec of EXTRACTION_SPECS) {
    const videoFullPath = path.join(MOTION_EXAMPLES_DIR, spec.sourceVideo);
    if (!fs.existsSync(videoFullPath)) {
      console.warn(`  ⚠️ Video not found: ${spec.sourceVideo}`);
      continue;
    }

    try {
      console.log(`  📸 Extracting [${spec.timestamp}] from '${spec.sourceVideo}'...`);
      const cmd = `ffmpeg -y -ss ${spec.timestamp} -i "${videoFullPath}" -vframes 1 -q:v 2 "${spec.outputPath}"`;
      execSync(cmd, { stdio: "ignore" });

      if (fs.existsSync(spec.outputPath)) {
        const sizeKb = (fs.statSync(spec.outputPath).size / 1024).toFixed(1);
        console.log(`    ✅ Saved: ${path.basename(spec.outputPath)} (${sizeKb} KB)`);
        manifest.extractedPlates.push({
          file: path.relative(ASSETS_DIR, spec.outputPath).replace(/\\/g, "/"),
          description: spec.description,
          source: spec.sourceVideo,
        });
      }
    } catch (err) {
      console.error(`    ❌ Failed to extract from ${spec.sourceVideo}:`, err);
    }
  }

  // 2. Write vector assets
  console.log("\n📐 [AdCraft Vector Studio] Generating vector devices and UI cards...");
  for (const vec of VECTOR_ASSETS) {
    fs.writeFileSync(vec.path, vec.content, "utf8");
    const sizeKb = (fs.statSync(vec.path).size / 1024).toFixed(1);
    console.log(`  ✅ Generated: ${path.basename(vec.path)} (${sizeKb} KB)`);
    manifest.vectorAssets.push({
      file: path.relative(ASSETS_DIR, vec.path).replace(/\\/g, "/"),
      description: vec.description,
    });
  }

  // 3. Save combined manifest
  const manifestPath = path.join(ASSETS_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\n✨ Extraction and Asset Ingestion Complete! Manifest: ${manifestPath}`);
}

main().catch((err) => {
  console.error("Fatal asset extraction failure:", err);
  process.exit(1);
});

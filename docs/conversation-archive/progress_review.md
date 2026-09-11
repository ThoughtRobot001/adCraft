# AdCraft Progress Review — Phases 1–4

## TL;DR

**4,593 lines of TypeScript** across **41 source files**. A fully autonomous AI creative studio that takes a brand name + campaign goal and produces a rendered 15-second MP4 advertisement — no human design work required. Powered by **Gemini 3.6 Flash** with deterministic fallbacks. 4 production ads rendered successfully.

---

## What Exists Today

### The Product

```
Brand Brief (name, goal, tagline)
  → Brand Analysis → 3 Creative Concepts → Storyboard → Art Direction
  → MotionIR Compilation → Visual Quality Gate (7/10) → Auto-Revision
  → Remotion Render → 1080×1920 MP4 @ 30fps
```

**One command. Zero manual design.**

```powershell
npx tsx src/cli/generate.ts --name "Linear" --goal "free_trial" \
  --tagline "Issue Tracker for High-Performance Teams" \
  --features "Cycles,Real-time Sync,Keyboard Shortcuts" \
  --metric "10x" --label "ISSUE TRIAGE VELOCITY" \
  --color "#5E6AD2" --accent "#38BDF8"
```

---

## Phase-by-Phase Breakdown

### Phase 1: Foundation ✅

| What | Status |
|------|--------|
| MotionIR JSON schema (Zod-validated) | ✅ Complete |
| 7 core primitives (KineticText, AppWindow, LogoReveal, MetricCounter, FeaturePills, CTAButton, SceneTransition) | ✅ Complete |
| Remotion render pipeline (React → Chrome → MP4) | ✅ Complete |
| Example ad: Kylian AI SaaS | ✅ Rendered |

**Output**: [kylian-ad.mp4](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/out/kylian-ad.mp4) — 15s, 3.4 MB

---

### Phase 2: AI Agent Pipeline ✅

| What | Status |
|------|--------|
| Brand Ingestion Engine (website metadata scraping) | ✅ Complete |
| Creative Director Agent (Gemini / OpenAI / built-in) | ✅ Complete |
| End-to-end CLI pipeline | ✅ Complete |
| Dynamic ad generation from brand brief | ✅ Verified |

**Output**: Neon Serverless Postgres ad — generated dynamically with zero manual edits.

---

### Phase 3: AI Creative Studio Overhaul ✅

Following the Senior Director's guidance (*"AdCraft doesn't generate videos. AdCraft designs advertisements."*), the system was rebuilt from a template engine into a proper creative production studio.

| What | Status |
|------|--------|
| 7-stage creative pipeline | ✅ Complete |
| Brand Analyst (tone, audience, positioning) | ✅ Complete |
| Concept Strategist (3 ranked concepts) | ✅ Complete |
| Storyboard Architect (mandatory narrative beats) | ✅ Complete |
| Art Director (semantic intent → primitives) | ✅ Complete |
| MotionIR Compiler (deterministic JSON) | ✅ Complete |
| Visual Critic (7/10 quality gate) | ✅ Complete |
| Scene Reviser (surgical auto-corrections) | ✅ Complete |
| 4 new primitives (SplitScreen, ComparisonTable, TestimonialCard, ProgressBar) | ✅ Complete |

**Output**: Linear ad with deterministic pipeline — Quality Score: 9.5/10

---

### Phase 4: Gemini AI Activation & Quality Hardening ✅

| What | Status |
|------|--------|
| Gemini API key authentication fix | ✅ Fixed |
| Model upgrade to `gemini-3.6-flash` | ✅ Migrated |
| Semantic role matching (LLM intent → primitives) | ✅ Implemented |
| Visual safety guarantees (headline, CTA, dead-scene) | ✅ Implemented |
| Empty scene detection & recovery | ✅ Implemented |
| Test suite (6/6 tests passing) | ✅ Verified |

**Output**: Gemini-designed Linear ad — Concept: *"The 15-Hour Engineering Tax"* (Score: 9.4/10), Visual Critic: 9.1/10

---

## Production Artifacts

| Ad | Pipeline | File | Size |
|----|----------|------|------|
| Kylian AI | Phase 1 (manual JSON) | `kylian-ad.mp4` | 3.4 MB |
| Neon Postgres | Phase 2 (deterministic) | `neon-ad-*.mp4` | 3.4 MB |
| Linear (deterministic) | Phase 3 (studio) | `linear-studio-ad-*904723.mp4` | 3.3 MB |
| Linear (Gemini) | Phase 4 (AI studio) | `linear-studio-ad-*667005.mp4` | 3.2 MB |

Plus 16 keyframe PNGs, 6 MotionIR JSONs, and 6 storyboard JSONs in `out/`.

---

## Technical Architecture

```
adcraft/
├── src/                          (4,593 lines across 41 files)
│   ├── stages/                   (1,404 lines) — 7 creative stages + Gemini client
│   ├── primitives/               (1,759 lines) — 13 React motion components
│   ├── schema/                   (355 lines)   — Zod-validated MotionIR contract
│   ├── compositions/             (128 lines)   — Remotion render pipeline
│   ├── pipeline/                 (168 lines)   — Orchestrator
│   ├── cli/                      (113 lines)   — CLI interface
│   ├── ingestion/                (130 lines)   — Brand metadata scraper
│   ├── ai/                       (552 lines)   — Legacy creative director (Phase 2)
│   └── utils/                    (28 lines)    — Environment loader
├── scripts/                      (294 lines)   — Test suites
├── examples/                     (226 lines)   — Example MotionIR spec
└── out/                          (36 files)    — Rendered artifacts
```

### 11 Motion Primitives

| Primitive | Purpose | Animation Quality |
|-----------|---------|-------------------|
| KineticText | Headline typography | ⭐⭐⭐⭐ Word-by-word spring reveals, glow highlights |
| AppWindow | 3D product mockup | ⭐⭐⭐⭐⭐ Perspective tilt, floating oscillation, 4 mock types |
| MetricCounter | Stats/proof points | ⭐⭐⭐⭐⭐ Cubic ease-out counting, glassmorphic card |
| CTAButton | Call-to-action | ⭐⭐⭐⭐ Gradient pill, breathing micro-pulse |
| LogoReveal | Brand identity | ⭐⭐⭐⭐ Dual spring scales, radial glow expansion |
| FeaturePills | Capability badges | ⭐⭐⭐⭐ Staggered spring reveal, neon borders |
| SceneTransition | Scene wrapper | ⭐⭐⭐⭐ Floating ambient orbs, tech dot grid |
| SplitScreen | Before/after compare | ⭐⭐⭐⭐ Tension borders, spring slide-up |
| ComparisonTable | Feature matrix | ⭐⭐⭐⭐ Staggered row reveals |
| TestimonialCard | Social proof | ⭐⭐⭐⭐ Star ratings, glassmorphism |
| ProgressBar | Speed/completion | ⭐⭐⭐ Animated fill with glow edge |
| ImageElement | External images | ⭐⭐ Basic — **never used by ArtDirector** |
| SceneTransition | Ambient atmosphere | ⭐⭐⭐⭐ Floating orbs, grid texture |

---

## Honest Quality Assessment

### ✅ Where AdCraft Excels

1. **Cohesive dark SaaS aesthetic** — The dark canvas, floating glows, and dot grid match Linear/Vercel/Supabase visual language perfectly
2. **AppWindow is genuinely impressive** — 3D perspective tilt with floating oscillation rivals handcrafted After Effects work
3. **Spring physics everywhere** — No robotic linear interpolations; everything uses damped springs
4. **MetricCounter punch** — 124px cubic ease-out numbers with glow create strong conversion hooks
5. **Zero-to-video autonomy** — Gemini handles creative strategy and the entire pipeline runs without human intervention

### ⚠️ Gaps vs. Professional Agency Standards

1. **Scene transitions are "dip through black"** — Remotion `<Series>` places scenes back-to-back with no overlap. No true cross-fades, camera push-throughs, or shared element morphing
2. **No audio SFX** — Professional ads use synced whooshes, UI clicks, risers, and bass drops. AdCraft only supports a single looping background track
3. **2D absolute positioning is fragile** — Long headlines that wrap can crowd elements below. No flexbox auto-layout
4. **No mouse/cursor interactions** — Agency SaaS ads show simulated cursor clicking buttons or dragging cards. Our mockups are static with floating physics
5. **9:16 only** — Primitive sizing is hardcoded for vertical mobile. 16:9 and 1:1 would overflow
6. **Limited mockup variety** — 4 app-window types (code, kanban, chat, analytics) will feel repetitive across many brands

---

## Bugs Identified & Resolved

> [!TIP]
> ### 3 Identified Bugs Fixed & Verified ✅

### 1. KineticText Highlight Matching Bug ✅ (Fixed)
**File**: [`KineticText.tsx`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/KineticText.tsx) lines 83–86, 155–165
**Fix**: Both the rendered word and the candidate highlight words are normalized and cleaned of punctuation. Terms like `"15+"` or `"manually?"` now accurately trigger neon glow highlights.

### 2. ProgressBar CSS Transition in Frame Renderer ✅ (Fixed)
**File**: [`ProgressBar.tsx`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/ProgressBar.tsx) line 87
**Fix**: Removed `transition: "width 0.1s ease-out"`. Width interpolation is now purely governed by Remotion's frame spring physics for frame-accurate rendering.

### 3. Hardcoded Chrome Binary Path ✅ (Fixed)
**File**: [`remotion.config.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/remotion.config.ts)
**Fix**: Replaced static Windows path with dynamic resolution (`process.env.CHROME_PATH`, `PUPPETEER_EXECUTABLE_PATH`, and verified `fs.existsSync` fallback candidates on Windows). Ensures cross-platform compatibility across macOS, Linux, CI/Docker, and Windows.

---

## Dead Code & Cleanup Needed

| Item | Lines | Location |
|------|-------|----------|
| Legacy CreativeDirectorAgent | 440 | `src/ai/creative-director.ts` — replaced by Stage pipeline |
| Legacy prompts | 69 | `src/ai/prompts.ts` — never imported |
| ImageElement primitive | 91 | `src/primitives/ImageElement.tsx` — never instantiated |
| Unused dependency | — | `lucide-react` in package.json — never imported |

> [!NOTE]
> Total dead code: **~600 lines** that can be safely removed.

---

## What's Next — Potential Phase 5 Directions

| Direction | Impact | Complexity |
|-----------|--------|------------|
| **Fix the 3 bugs above** | High — production reliability | Low |
| **Dead code cleanup** | Medium — maintainability | Low |
| **Web UI / Dashboard** | High — makes it usable for non-developers | High |
| **Multi-format (16:9, 1:1)** | High — covers LinkedIn, YouTube, Instagram | Medium |
| **Audio SFX layer** | High — huge quality upgrade | Medium |
| **Scene cross-fades / morphing** | High — professional feel | High |
| **Cursor/interaction animations** | Medium — agency-level realism | Medium |
| **Brand asset import (logos, screenshots)** | High — real-world usage | Medium |
| **Batch A/B variant generation** | High — performance marketing use case | Medium |
| **Expanded mockup types** | Medium — prevents template fatigue | Low |

---

## Summary Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Architecture** | 9/10 | Clean 7-stage pipeline, Zod-validated, good separation |
| **AI Integration** | 8/10 | Gemini works with graceful fallbacks |
| **Visual Quality** | 7/10 | Strong dark SaaS aesthetic; transitions and audio are the gap |
| **Autonomy** | 9/10 | True zero-to-video with one command |
| **Production Readiness** | 7/10 | 3 critical bugs resolved; remaining: dead code, single aspect ratio, no web UI |
| **Creative Variety** | 6/10 | 11 primitives, 4 mock types — needs more to avoid repetition |

**Overall: Solid V0.** The core creative engine works. The pipeline architecture is sound. The main gaps are in production polish (transitions, audio, multi-format) and expanding the visual vocabulary to prevent template fatigue.

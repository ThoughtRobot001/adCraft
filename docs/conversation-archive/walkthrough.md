# AdCraft Phase 1 Walkthrough: Motion Engine & Primitives

We have completed the foundation of **AdCraft**: a procedural, code-based motion design engine that turns a JSON scene specification ([MotionIR](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/schema/composition.ts)) into production-ready 1080x1920 60/30fps MP4 motion advertisements.

---

## 1. What Was Built

### A. MotionIR Data Contract (`src/schema/`)
A typed, validated [Zod schema](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/schema/index.ts) that allows an AI creative director or marketer to define brand identity, scenes, timeline durations, and UI elements:
* **[brand.ts](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/schema/brand.ts)**: Palettes (`primary`, `secondary`, `accent`, `background`, `text`, `muted`), fonts, taglines, and logo.
* **[primitives.ts](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/schema/primitives.ts)**: Discriminated union of UI & animation building blocks (`kinetic-text`, `app-window`, `logo-reveal`, `metric-counter`, `feature-pills`, `cta-button`).
* **[scene.ts](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/schema/scene.ts)**: Timeline segments with enter/exit transitions (`fade`, `slide-left`, `slide-up`, `zoom-out`) and dynamic ambient mesh lighting.
* **[composition.ts](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/schema/composition.ts)**: Top-level composition schema with audio tracks, aspect ratio metadata, and scene sequences.
* **`resolveColor()` Utility**: Resolves dynamic semantic brand tokens like `"brand.primary"` or `"brand.accent"` into client hex colors on the fly, enabling instant re-branding.

### B. The 6 Core Motion Primitives (`src/primitives/`)
1. **[KineticText.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/KineticText.tsx)**: Staggered word-by-word spring reveals, smooth scales, fade-ups, and keyword auto-highlighting with neon glow bloom.
2. **[AppWindow.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/AppWindow.tsx)**: 3D perspective-tilted floating glass browser with traffic lights, URL bar, live floating badges (`⚡ 99.4% Auto-Reconciliation`), and vector dashboard mockups.
3. **[MetricCounter.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/MetricCounter.tsx)**: Easing count-up numbers (`10x`, `+340%`) with trend arrows and glowing glassmorphic cards.
4. **[FeaturePills.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/FeaturePills.tsx)**: Staggered pop-in badges for capabilities, problems, or trust signals.
5. **[CTAButton.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/CTAButton.tsx)**: High-converting pulsing action button with custom gradients and subtext.
6. **[SceneTransition.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/SceneTransition.tsx)**: Scene wrapper with animated floating ambient light orbs and subtle grid textures.

### C. Remotion Engine Pipeline (`src/compositions/`)
* **[SceneRenderer.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/compositions/SceneRenderer.tsx)**: Dynamically renders elements to their respective primitive components.
* **[AdComposition.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/compositions/AdComposition.tsx)**: Coordinates scenes using Remotion's `<Series>` and background `<Audio>`.
* **[Root.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/Root.tsx)**: Uses `calculateMetadata` so any input JSON dynamically configures dimensions, fps, and total duration.

---

## 2. Rendered Ad Showcase

We generated a full 15-second / 450-frame B2B SaaS launch ad for **Kylian AI** ([saas-product-ad.json](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/examples/saas-product-ad.json)).

The rendered frames across each scene:

````carousel
![Scene 1: Hook - Word-by-Word Kinetic Typography with Problem Badges](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\frame-hook.png)
<!-- slide -->
![Scene 2: Product Showcase - 3D Perspective Floating Browser with Live Badges](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\frame-product.png)
<!-- slide -->
![Scene 3: Social Proof & Metrics - Animated 10x Velocity Counter and Trust Badges](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\frame-metric.png)
<!-- slide -->
![Scene 4: Call to Action - Brand Monogram, Glow Bloom, and Pulsing Button](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\frame-cta.png)
````

### Render Outputs
* **Full Video**: [kylian-ad.mp4](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/out/kylian-ad.mp4) (3.4 MB, 1080x1920, 30fps, 15 seconds)
* Render time: **~40 seconds** on local CPU/Chrome rendering — no external cloud GPU costs.

---

## 3. Verification & Automated Tests

1. **Schema Validation & Color Resolver**:
   ```powershell
   npx tsx scripts/test-schema.ts
   ```
   * Result: Passed (100% Zod compliance, sample JSON parsed, dynamic brand color resolution verified).
2. **TypeScript Compilation**:
   ```powershell
   npm run typecheck
   ```
   * Result: `tsc --noEmit` passed with 0 errors.
3. **Full Video Render**:
   ```powershell
   npx remotion render src/index.ts AdComposition out/kylian-ad.mp4 --props=examples/saas-product-ad.json
   ```
   * Result: Generated valid MP4 video.

---

## 4. Phase 2: Creative AI Agent Pipeline & Brand Ingestion

We implemented the complete generative intelligence layer:

### A. Brand Ingestion (`src/ingestion/`)
* **`BrandIngestor`**: Scrapes OpenGraph metadata, title tags, descriptions, logos, and theme colors from public URLs, or normalizes structured manual brand inputs into strict `BrandSchema`.

### B. Creative Director Agent (`src/ai/`)
* **`CreativeDirectorAgent`**:
  * Formulates high-converting campaign concepts, hook angles, and complete `MotionIR` JSON.
  * Supports **Google Gemini API** (`GEMINI_API_KEY`) and **OpenAI API** (`OPENAI_API_KEY`).
  * Includes a built-in **Creative Synthesizer** that dynamically composes tailored ads based on product goals (`free_trial`, `book_demo`, `feature_launch`, `user_acquisition`) even without external API keys.
  * Includes **Critic / Auto-Repair** logic that validates every scene against `MotionIRSchema` to guarantee 100% render reliability.

### C. End-to-End CLI & Pipeline (`src/pipeline/` & `src/cli/`)
* Single command runs the entire pipeline from brand brief to rendered MP4:
  ```powershell
  npx tsx src/cli/generate.ts --name "Neon" --tagline "Serverless Postgres with Instant Branching" --goal "free_trial" --features "Branching like Git,Autoscaling compute,Instant Provisioning" --metric "50ms" --label "COLD START LATENCY" --color "#00E599" --accent "#6366F1"
  ```

### D. Dynamic Generation Showcase: Neon Serverless Postgres
The pipeline ingested Neon's profile and generated an ad dynamically with zero manual edits:

![Neon Dynamic Ad Generation](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\neon-preview.png)

* **Headline**: *"One intelligent platform for neon."*
* **Dynamic URL**: `app.neon.io`
* **Custom Badges**: *"⚡ Branching like Git"*, *"🔒 Autoscaling compute"*
* **Dynamic Palette**: Neon Green (`#00E599`) spline curve and ambient glow.
* **Render Output**: `out/neon-ad-1789072974012.mp4` (15 seconds, 1080x1920, 30fps).

---

---

## 5. Phase 3: The AI Creative Studio for Brands

Guided by our Senior Director's vision (*"AdCraft doesn't generate videos. AdCraft designs advertisements"*), we overhauled the system from a single-path template engine into a true **autonomous creative production studio**.

### The 10-Stage Creative Pipeline

```
Campaign Brief + Brand Input
  │
  ▼
[Stage 1: Brand Analyst] ───────► BrandProfile (Tone, Positioning, Audience Pains)
  │
  ▼
[Stage 2: Concept Strategist] ──► 3 Distinct Creative Concepts (Evaluated & Ranked)
  │
  ▼
[Stage 3: Storyboard Architect] ─► Storyboard (Mandatory Internal Narrative Beats & Pacing)
  │
  ▼
[Stage 4: Art Director] ────────► Visual Hierarchy, Typography Rules & Element Specs
  │
  ▼
[Stage 5: MotionIR Compiler] ───► Deterministic Compilation into Validated MotionIR
  │
  ▼
[Stage 6: Visual Critic] ───────► Evaluates Readability, Density & Pacing (Threshold: 7.0/10)
  │                                    │
  ├── Score < 7.0 (Revision Needed) ───┤
  │                                    ▼
  │                           [Stage 7: Scene Reviser] ──► Surgical Corrections
  │                                    │
  └────────── Re-evaluated ────────────┘
  │
  ▼
[Stage 8: Remotion Engine] ─────► 1080x1920 30FPS MP4 Video
```

---

### What Was Built & Verified in Phase 3

1. **Brand Analyst ([`src/stages/brand-analyst.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/brand-analyst.ts))**:
   - Analyzes brand voice (`authoritative`, `technical`, `urgent`, `minimalist`), competitive positioning, and customer pain points.

2. **Concept Strategist ([`src/stages/concept-strategist.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/concept-strategist.ts))**:
   - Generates **3 distinct creative angles** (e.g. *Pain-Agitate-Solve*, *Velocity-Speedrun*, *Social-Proof-First*), scores each strategically, and automatically selects the highest-performing angle.

3. **Storyboard Architect ([`src/stages/storyboard-architect.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/storyboard-architect.ts))**:
   - The **internal mandatory creative stage**. Blueprints scene-by-scene narrative beats, emotional arc, and element intents before touching code.

4. **Art Director & MotionIR Compiler ([`src/stages/art-director.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/art-director.ts), [`src/stages/motionir-compiler.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/motionir-compiler.ts))**:
   - Makes typography, contrast, and layout decisions, then compiles deterministic `MotionIR` JSON.

5. **Visual Critic & Scene Reviser ([`src/stages/visual-critic.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/visual-critic.ts), [`src/stages/scene-reviser.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/scene-reviser.ts))**:
   - Evaluates ad quality against our **7/10 minimum quality threshold**. Detects pacing issues, element crowding (>4 elements), small fonts (<56px on mobile), and overlapping Y coordinates.
   - When issues are flagged, the `SceneReviser` surgically fixes weak scenes and re-evaluates.

6. **Expanded Motion Design Language (4 New Primitives + Bug Fixes)**:
   - **`SplitScreen`**: Before/after dual comparison layout.
   - **`ComparisonTable`**: Feature matrix with checkmarks.
   - **`TestimonialCard`**: Social proof card with star rating and attribution.
   - **`ProgressBar`**: Animated progress bar for latency and velocity proof.
   - **Fixed**: `AppWindow` now renders `code`, `chat`, and `kanban` views; `LogoReveal` supports `bounce-in` and `fade-glow`; `KineticText` highlights words across all animation modes; `image` primitive is fully wired.

---

### Studio Production Showcase: Linear Issue Tracker

The full Studio pipeline was run for **Linear**:
```powershell
npx tsx src/cli/generate.ts --name "Linear" --tagline "The Issue Tracker Built for High-Performance Teams" --goal "free_trial" --features "Cycles & Roadmaps,Real-time Sync,Instant Keyboard Shortcuts" --metric "10x" --label "ISSUE TRIAGE VELOCITY" --color "#5E6AD2" --accent "#38BDF8" --verbose
```

![Linear Ad Preview](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\linear-frame-product.png)

* **Brand Voice**: Authoritative (Linear indigo `#5E6AD2` + sky blue `#38BDF8`).
* **Selected Concept**: *"The Broken Legacy Cycle"* (Score: 9.5/10).
* **Narrative Arc**: *Disrupt → Demonstrate → Prove → Convert*.
* **Quality Score**: **9.5/10** (PASSED Quality Gate).
* **Rendered MP4**: `out/linear-studio-ad-1789077904723.mp4` (15s, 1080x1920, 30fps).

---

## 6. Phase 4: Gemini AI Creative Studio Activation & Quality Hardening

We activated the live **Google Gemini API** (`gemini-3.6-flash`) using your provided API key and systematically resolved the authentication, intent translation, and quality gate bottlenecks:

### A. Gemini Authentication & Model Upgrade
* **Key Format Fix ([`gemini-client.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/gemini-client.ts))**: The key starts with `AQ.`, which was previously misidentified as an OAuth bearer token causing `401 UNAUTHENTICATED`. AI Studio keys require query parameter authentication (`?key=`), which was restored.
* **Model Migration**: Migrated from deprecated `gemini-2.5-flash` (`404 NOT_FOUND`) to the production model **`gemini-3.6-flash`**.

### B. Semantic Intent Mapping & Primitive Coverage ([`art-director.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/art-director.ts))
* Previously, the `ArtDirector` used rigid exact string checks (`=== "hook-headline"`, `=== "product-mockup"`). When Gemini generated creative semantic roles (e.g., `solution-headline`, `product-demo`, `terminal-agitation`), they failed to map.
* **Semantic Role Matching**: Implemented keyword-based semantic matching that maps all LLM intents across our **11 motion primitives**, including the Phase 3 primitives (`SplitScreen`, `ComparisonTable`, `TestimonialCard`, `ProgressBar`).
* **Visual Safety Guarantees**:
  1. *Headline Guarantee*: If a scene contains `headlineCopy`, a `kinetic-text` element is automatically positioned and styled.
  2. *Closing Scene Guarantee*: The final scene always receives the brand logo monogram and a pulsing CTA button.
  3. *Dead Scene Fallback*: Under no circumstances can an ad contain an empty dead scene.

### C. Quality Gate Hardening ([`visual-critic.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/visual-critic.ts), [`scene-reviser.ts`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/scene-reviser.ts))
* Added fatal **Empty Scene Detection** (`empty-scene` category, severity: `critical`, -8.0 score penalty) to prevent blank frames from ever passing the 7.0/10 quality gate.
* Added automated synthesis in `SceneReviser` to recover and populate any flagged scenes.

---

## 7. Final Showcase: Autonomous Gemini-Designed Ad for Linear

Here is the complete 4-scene, 15-second advertisement designed autonomously by Gemini (Concept: *"The 15-Hour Engineering Tax"*, Strategic Score: **9.4/10**):

````carousel
![Scene 1: Disruptive Hook — "You didn't hire senior engineers to spend 15 hours a week configuring issue trackers." with Friction Badges](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\linear-gemini-final-s1.png)
<!-- slide -->
![Scene 2: Velocity Discovery — Linear Issue Board UI with Floating Badges ("⚡ Cycles & Roadmaps", "🔒 Real-time Sync")](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\linear-gemini-final-s2.png)
<!-- slide -->
![Scene 3: Quantitative Proof — "Proven impact at high-growth scale." with Glowing 10x Velocity Counter & SOC2 Badges](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\linear-gemini-final-s3.png)
<!-- slide -->
![Scene 4: Decisive CTA — Brand Monogram, Tagline & Pulsing Glowing "Start Free Trial" Button](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\linear-gemini-final-s4.png)
````

### Ad Production Artifacts
* **Full Production MP4**: [linear-gemini-final-ad.mp4](file:///C:/Users/USER/.gemini/antigravity/brain/687b29c3-2fba-4d80-8211-11f4c28bca1c/linear-gemini-final-ad.mp4) (1080x1920, 30fps, 15s)
* **MotionIR Specification**: `out/linear-studio-ad-1789081667005.json`
* **Storyboard Blueprint**: `out/linear-studio-ad-1789081667005-storyboard.json`
* **Visual Critic Score**: **9.1 / 10** (Passed quality threshold)

---

## 8. How to Run & Verify

Run the automated test suite verifying all stages:
```powershell
cd C:\Users\USER\.gemini\antigravity\scratch\adcraft
npx tsx scripts/test-studio.ts
```

Generate a production ad for any brand via the Studio CLI:
```powershell
npx tsx src/cli/generate.ts --name "Linear" --tagline "The Issue Tracker Built for High-Performance Teams" --goal "free_trial" --features "Cycles & Roadmaps,Real-time Sync,Instant Keyboard Shortcuts" --metric "10x" --label "ISSUE TRIAGE VELOCITY" --color "#5E6AD2" --accent "#38BDF8" --verbose
```

---

## 9. Phase 5: Agency-Grade Motion Design & Benchmark Alignment

Benchmarked directly against the 7 reference videos provided by the user (Astra, BlinkCash, Kobolytics, and the $1000 VFX challenge), we closed the key capability gaps:

### A. 3D Phone & Device Mockup ([`PhoneMockup.tsx`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/PhoneMockup.tsx))
* **Pure React/CSS 3D device frame**: `perspective: 1400px`, `transform-style: preserve-3d`, realistic rotation tilt (`rotateX`, `rotateY`), and damped spring physics.
* **Hardware realism**: Metallic chassis rim, Dynamic Island pill with camera sensor glint, and dynamic diagonal specular glass glare that shifts realistically with viewing angle.
* **Orbiting Category Badges**: Floating category badges ("Instant deposits", "Zero gas fees") in 3D orbit around the device with subtle continuous sine-wave hovering (inspired by Kobolytics Video 6).
* **High-conversion UI mockups**: Supports fintech wallets (balances, daily yield compounding, deposit action buttons), gamified learning cards (XP progress bar, streak counters), and prompt containers.

### B. Interactive Cursor & Pointer Choreography ([`CursorInteraction.tsx`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/CursorInteraction.tsx))
* **Organic movement**: Cursor travels along a smooth cubic bezier arc from initial coordinates to the target element.
* **Click feedback**: Damped spring scale compression (`scale(0.82)`) timed precisely to the click frame.
* **Expanding Ripple Ring**: Concentric glowing pulse ring (`scale: 0.3 -> 2.6`, `opacity: 0.85 -> 0`) that triggers on button click.
* Auto-choreographed to click action buttons in both the product demo scene and the final closing CTA!

### C. Seamless Transitions via `@remotion/transitions` ([`AdComposition.tsx`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/compositions/AdComposition.tsx))
* Upgraded composition engine from standard `<Series>` to **`<TransitionSeries>`**.
* Adjacent scenes now overlap seamlessly during transitions with slide, wipe, fade, or flip presentations — **completely eliminating the dip-through-black gap**.
* Added dynamic overlap calculation in `computeTotalDurationFrames` so composition duration in `Root.tsx` matches the transition timeline to the exact frame.

### D. Deterministic Canvas VFX ([`ParticleTunnel.tsx`](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/ParticleTunnel.tsx))
* High-velocity hyperspace starfield / particle tunnel rendered on 2D HTML5 `<canvas>`.
* **Pure mathematical function of frame**: Uses Remotion's `random(seed)` with no mutable tick state, ensuring 100% reproducible parallel rendering across multi-core workers (matching Video 7 benchmark).

### E. Housekeeping & Dead Code Removal
* Pruned ~600 lines of obsolete Phase 2 code: deleted `src/ai/creative-director.ts` and `src/ai/prompts.ts`.
* Removed unused `lucide-react` dependency from `package.json`.

---

## 10. Showcase: Benchmark Alignment Ad for BlinkCash

To verify Phase 5 against the actual benchmark references, we produced a mobile fintech ad for **BlinkCash** (Concept: *"Everyday Passive Luxury"*, Hook: *"What if your morning espresso paid for itself before you even took a sip?"*):

````carousel
![Scene 1: Disruptive Hook — Kinetic typography with glowing backdrop and friction badges](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\blinkcash-scene1-hook.png)
<!-- slide -->
![Seamless Transition: Scene 1 slides out left while Scene 2 slides in right — ZERO black gap](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\blinkcash-transition-s1-s2.png)
<!-- slide -->
![Scene 2: 3D Phone Mockup — Dynamic Island, metallic rim, glass glare, fintech wallet with $27.38 balance, orbiting badges, and hand cursor click](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\blinkcash-scene2-phone.png)
<!-- slide -->
![Scene 3: Quantitative Anchor — 27x yield metric counter, glowing card, and enterprise trust badges](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\blinkcash-scene3-metric.png)
<!-- slide -->
![Scene 4: Decisive CTA — Brand monogram, pulsing "Start Free Trial" button, and mouse cursor clicking the action](C:\Users\USER\.gemini\antigravity\brain\687b29c3-2fba-4d80-8211-11f4c28bca1c\blinkcash-scene4-cta.png)
````

### Production Artifacts
* **Full Production MP4**: [blinkcash-benchmark-ad.mp4](file:///C:/Users/USER/.gemini/antigravity/brain/687b29c3-2fba-4d80-8211-11f4c28bca1c/blinkcash-benchmark-ad.mp4) (1080x1920, 30fps, 15s)
* **MotionIR Specification**: `out/blinkcash-studio-ad-1789124006308.json`
* **Storyboard Blueprint**: `out/blinkcash-studio-ad-1789124006308-storyboard.json`
* **Visual Critic Score**: **9.1 / 10** (Passed quality threshold)
* **Automated Studio Test Suite**: **8/8 Passed (100%)**



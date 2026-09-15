# AdCraft: AI Creative Studio for Motion Advertisements

> **North Star**: *"AdCraft doesn't generate videos. AdCraft designs advertisements."*

## 1. Project Context & Origin
* **Foundational Conversation**: [Main Strategy & Studio Build Session](conversation://687b29c3-2fba-4d80-8211-11f4c28bca1c)
* **Conversation History Archive**: See [`docs/conversation-archive/`](./docs/conversation-archive/) for full conversation transcripts, Phase 1–5 plans, progress reviews, and benchmark analyses.
* **Target Milestone**: YC Winter 2027 Application (Deadline: November 2, 2026).
* **Quality Threshold**: Visual Critic gate is set to **9.0 / 10** (used as a rigorous iterative refinement tool; true quality is judged by human design taste). No ad renders to production unless it passes.

---

## 2. Architecture & Pipeline Flow
Never treat AdCraft as a simple template engine or a one-shot video prompt generator. Primitives are **vocabulary**, not preset templates. Every ad undergoes a mandatory 7-stage creative studio process:

```
[Campaign Brief / URL]
        │
        ▼
1. BrandAnalyst            ──► Ingests colors, font, tone, differentiators, audience
        │
        ▼
2. ConceptStrategist       ──► Evaluates 3+ dynamic narrative archetypes (Transformation, Metaphor, Manifesto, etc.)
        │
        ▼
3. StoryboardArchitect     ──► Narrative beats, emotional arc, pacing, copy, and structural intent
        │
        ▼
4. VisualKeyframeGenerator ──► AI Art-Direction Engine: Synthesizes candidate static visual keyframes
        │
        ▼
5. KeyframeCritic          ──► Senior Art Director Gate (>= 9.0/10): Selects Approved Keyframe
        │
        ▼
6. KeyframeAnalyzer        ──► Deconstructs approved frame across 11 mandatory spatial dimensions
        │
        ▼
7. MotionIRReconstructor   ──► Reconstructs 11 dimensions into deterministic Remotion/Three.js primitives
        │
        ▼
8. VisualCritic / Reviser  ──► Evaluates motion hierarchy & timing against 9.0 gate (SceneReviser corrects flaws)
        │
        ▼
[Remotion Engine]          ──► TransitionSeries renders 1080x1920 30fps broadcast-grade MP4
```

### The 11 Mandatory Keyframe Analysis Dimensions
The image model is used as an art-direction engine, not a video generator. Every approved keyframe is analyzed across 11 spatial dimensions to blueprint the deterministic MotionIR reconstruction:
1. **`composition`**: Layout archetype (`monolithic-centered`, `asymmetric-editorial`, `diagonal-tension`, etc.) and balance.
2. **`focalPoint`**: Normalized coordinates `{ x, y }` and visual mass weight (0-1).
3. **`scaleRelationships`**: Hero scale ratios, headline-to-body proportion, micro-label scale.
4. **`spatialHierarchy`**: Ordered depth layers (Hero, Supporting, Ambient) and target z-indices.
5. **`negativeSpace`**: Breathing room ratio (0.30–0.80) and uncluttered quadrant zones.
6. **`depthPlanes`**: Foreground drift, 3D perspective hero midground (`rotateX`, `rotateY`, `zDepth`), background haze.
7. **`cropping`**: Canvas bleed boundaries and offscreen projections.
8. **`typographyPlacement`**: Exact bounding box `{ x, y, width }`, alignment, target font size, weight, and letter spacing.
9. **`colorDistribution`**: Dominant background base, atmospheric lighting glow orb, accent highlight distribution.
10. **`cameraFraming`**: Shot type (`push-in`, `orbit`, `pull-back`), FoV, tilt angle, virtual distance.
11. **`visualDensity`**: Clutter index score and clutter-free breathing zones.

---

## 3. The 14 Motion Primitives
Located in `src/primitives/` and coordinated in `src/compositions/`:

1. **`kinetic-text`**: Word-by-word staggered reveals, glow punches, highlight keyword matching.
2. **`phone-mockup`**: Pure React/CSS 3D device (`perspective: 1400px`) with Dynamic Island, metallic rim, glass glare reflection, and orbiting category badges.
3. **`cursor-interaction`**: Smooth bezier trajectory pointer with spring click compression and expanding ripple rings.
4. **`app-window`**: 3D perspective browser window with traffic lights, URL bar, code/kanban/chat mockups, and floating badges.
5. **`metric-counter`**: Spring count-up numbers with trend arrows, percentage/multiplier suffixes, and glassmorphic cards.
6. **`feature-pills`**: Staggered pop-in badges for capabilities, friction tags, or compliance badges.
7. **`cta-button`**: Glowing high-converting action button with automated cursor click choreography.
8. **`logo-reveal`**: Centered brand monogram with radial glow bloom and tagline.
9. **`split-screen`**: Side-by-side comparative cards (Legacy vs Modern).
10. **`comparison-table`**: Feature matrix with checks and crosses.
11. **`testimonial-card`**: Social proof quotes with 5-star badges.
12. **`progress-bar`**: Spring-animated velocity / latency gauges.
13. **`particle-tunnel`**: Deterministic 2D canvas hyperspace starfield / streaks for high-energy tech transitions.
14. **`image`**: Local and remote asset compositing wrapped in Remotion's `<Img>` lifecycle.

---

## 4. Transitions & Audio
* **Transition Engine**: Powered by `@remotion/transitions` (`<TransitionSeries>`).
* **Zero Black Dips**: Scenes overlap smoothly via `slide`, `fade`, `wipe`, `flip`, or `clock-wipe`.
* **Duration Overlap**: Total composition frames are calculated via `computeTotalDurationFrames(scenes)` so timing is frame-accurate.
* **Audio Layer**: Ambient background music bed + frame-synced sound effects (whoosh, click, impact).

---

## 5. AdCraft Creative Memory (Intent-Driven Creative Knowledge & Outcome Learning)
Located in `src/creative-memory/`:
* **Purpose**: Unifies assets, shaders, components, 3D models, backgrounds, motion techniques, compositions, and motion references into an intent-driven knowledge graph.
* **The 10 Required Indexing Dimensions**:
  1. `whatItCommunicates`: Semantic narrative role and visual metaphor.
  2. `creativeProblemSolved`: Concrete design challenge resolved.
  3. `emotionalEffect`: Tension, visual overload, relief, delight, awe, urgency, precision, prestige.
  4. `compatibleStyles`: Dark-SaaS, editorial-light, cyber-terminal, industrial-craft, fintech-flow, minimalist.
  5. `compatibleCompositions`: Synergistic spatial blueprints.
  6. `usefulCombinations`: Inter-item synergy graph IDs.
  7. `parameters`: Physics springs, easing, angles, camera, and timing thresholds.
  8. `knownFailureModes`: Explicit anti-patterns audited by the Visual Critic.
  9. `previewOrExample`: Code snippet, reference frame, or extracted broadcast asset.
  10. `qualityScore`: Dynamic rating adjusted by human approval/rejection feedback.
* **Intent-Driven Retrieval**: Creative Director queries by artistic intent (e.g. *"Create tension and visual overload"* vs. *"Create premium technical precision"*), returning complete synchronized **Creative Vocabulary Packages**.
* **Closed-Loop Outcome Reinforcement**:
  - `pipeline.approveAd(adId, notes)` reinforces affinity weights.
  - `pipeline.rejectAd(adId, failureNotes)` penalizes failing combinations and auto-learns new `knownFailureModes`.
  - Stored in persistent ledger `src/creative-memory/data/memory-store.json`.
* **Broadcast Assets & References**: Extracted from reference motion designs in `Motion examples` and `your job`, saved to `public/assets/` (backgrounds, textures, UI badges, vector frames, and SFX WAVs).

---

## 6. Commands & Testing
* **Typecheck**: `npm run typecheck`
* **Creative Memory Verification**: `npx tsx scripts/test-creative-memory.ts` (40 comprehensive unit tests)
* **Technique Bank Verification**: `npx tsx scripts/test-technique-bank.ts`
* **Studio Automated Tests**: `npx tsx scripts/test-studio.ts` (19 suites covering all stages)
* **Extract Broadcast Assets**: `npx tsx scripts/extract-motion-assets.ts`
* **Synthesize Audio SFX**: `npx tsx scripts/generate-sfx.ts`
* **Generate Ad via CLI**:
  ```powershell
  npx tsx src/cli/generate.ts --name "<Brand>" --tagline "<Tagline>" --goal "free_trial" --features "<F1>,<F2>,<F3>" --metric "<Metric>" --label "<Label>" --color "#Hex" --accent "#Hex" --verbose
  ```


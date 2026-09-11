# AdCraft: AI Creative Studio for Motion Advertisements

> **North Star**: *"AdCraft doesn't generate videos. AdCraft designs advertisements."*

## 1. Project Context & Origin
* **Foundational Conversation**: [Main Strategy & Studio Build Session](conversation://687b29c3-2fba-4d80-8211-11f4c28bca1c)
* **Conversation History Archive**: See [`docs/conversation-archive/`](./docs/conversation-archive/) for full conversation transcripts, Phase 1–5 plans, progress reviews, and benchmark analyses.
* **Target Milestone**: YC Winter 2027 Application (Deadline: November 2, 2026).
* **Quality Threshold**: Visual Critic gate is set to **7.0 / 10**. No ad renders to production unless it passes.

---

## 2. Architecture & Pipeline Flow
Never treat AdCraft as a simple template engine or a one-shot video prompt generator. Every ad undergoes a mandatory 7-stage creative studio process:

```
[Campaign Brief / URL]
        │
        ▼
1. BrandAnalyst        ──► Ingests colors, font, tone, differentiators, audience
        │
        ▼
2. ConceptStrategist   ──► Evaluates 3+ distinct narrative angles, selects highest scoring
        │
        ▼
3. StoryboardArchitect ──► Designs mandatory 4-scene narrative arc (Hook → Discover → Prove → Close)
        │
        ▼
4. ArtDirector         ──► Maps semantic roles to 14 primitives, coordinates layout & cursor choreography
        │
        ▼
5. MotionIRCompiler    ──► Validates and compiles MotionIR JSON specification
        │
        ▼
6. VisualCritic        ──► Evaluates pacing, density, contrast, typography against 7.0/10 gate
        │
        ├─► [If < 7.0] ──► 7. SceneReviser (surgically corrects flagged flaws)
        │
        ▼
[Remotion Engine]      ──► TransitionSeries renders 1080x1920 30fps broadcast-grade MP4
```

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

## 5. Commands & Testing
* **Typecheck**: `npm run typecheck`
* **Studio Automated Tests**: `npx tsx scripts/test-studio.ts` (8 suites covering all stages)
* **Generate Ad via CLI**:
  ```powershell
  npx tsx src/cli/generate.ts --name "<Brand>" --tagline "<Tagline>" --goal "free_trial" --features "<F1>,<F2>,<F3>" --metric "<Metric>" --label "<Label>" --color "#Hex" --accent "#Hex" --verbose
  ```

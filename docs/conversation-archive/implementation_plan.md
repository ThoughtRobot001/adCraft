# Implementation Plan: Agency-Grade Motion Design & Benchmark Alignment (Phase 5)

Elevate AdCraft from programmatic motion prototype to agency-grade motion design quality, closing the critical gaps identified in the 7 benchmark reference videos (Astra, BlinkCash, Kobolytics, and the $1000 VFX challenge).

---

## User Review Required

> [!IMPORTANT]
> ### Key Architectural Decisions & Packages
> 1. **Transition Engine Migration**: We will upgrade `AdComposition.tsx` from Remotion's standard `<Series>` (which cuts or fades through black) to `<TransitionSeries>` from `@remotion/transitions`. This introduces seamless cross-fades, slides, and wipes between scenes without black gaps.
> 2. **Dependency Addition**: `@remotion/transitions` (`^4.0.523` matching our Remotion core).
> 3. **Deterministic Canvas VFX**: For high-energy tech transitions (Video 7 hyperspace warp), we will implement a pure-mathematical HTML5 `<canvas>` particle tunnel that renders deterministically across Remotion frames without state mutation.
> 4. **Dead Code Purge**: We will prune ~600 lines of obsolete Phase 2 legacy code (`src/ai/creative-director.ts`, `src/ai/prompts.ts`, and unused `lucide-react`) to keep the codebase lean and maintainable.

---

## Open Questions

> [!NOTE]
> 1. **Default Aspect Ratio vs Multi-Ratio**: The benchmarks feature both 9:16 vertical (TikTok/Reels/Shorts) and 16:9 widescreen (desktop launch videos). Should we maintain 9:16 as the primary default while making the new 3D Phone and Cursor primitives responsive to canvas dimensions?
> 2. **Audio SFX Assets**: For whoosh, click, and impact sound effects, would you prefer us to bundle a tiny set of royalty-free standard audio files in `public/audio/`, or support them via external URLs in the MotionIR schema?

---

## Proposed Changes

### 1. Schema Expansion (`src/schema/`)

#### [MODIFY] [primitives.ts](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/schema/primitives.ts)
- Add **`PhoneMockupSchema`**:
  - `title`, `appCategory`, `theme`: "dark" | "light"
  - `screenType`: "screenshot" | "banking" | "language" | "custom"
  - `screenshotUrl`: optional string
  - `badges`: floating reaction/category bubbles (e.g. "Rent", "Savings", "Tuition")
  - `tilt`: rotation angles (`rotateX`, `rotateY`, `scale`)
  - `pedestal`: boolean (pedestal cylinder display as seen in Kobolytics)
- Add **`CursorInteractionSchema`**:
  - `path`: "linear" | "curved" | "to-element"
  - `from`: `{ x: number, y: number }`
  - `to`: `{ x: number, y: number }`
  - `clickAtFrame`: number
  - `clickRipple`: boolean
  - `cursorType`: "pointer" | "arrow" | "hand"
- Add **`ParticleTunnelSchema`**:
  - `speed`, `density`, `color`, `streakLength`, `fadeFrames`
- Extend `ElementSchema` union to include these 3 new primitives.

#### [MODIFY] [scene.ts](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/schema/scene.ts)
- Update `SceneTransitionSchema` to support:
  - `presentation`: "fade" | "slide" | "wipe" | "zoom-blur" | "none"
  - `direction`: "from-left" | "from-right" | "from-top" | "from-bottom"
  - `durationFrames`: number (default 15)

#### [MODIFY] [composition.ts](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/schema/composition.ts)
- Add `sfx` array to `AudioTrackSchema`:
  - `id`, `src`, `atFrame`, `volume`, `trimBefore`

---

### 2. New Motion Primitives (`src/primitives/`)

#### [NEW] [PhoneMockup.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/PhoneMockup.tsx)
- Pure React/CSS 3D device frame with `perspective: 1400px`, `transform-style: preserve-3d`.
- Metallic bezel, Dynamic Island pill with camera glint, high-resolution glass glare overlay.
- Floating category pill bubbles in orbit around the device (as seen in Kobolytics Video 6).
- Supports live high-conversion mockups (fintech wallet, gamified learning, AI prompt card) as well as external screenshots via Remotion `<Img>`.

#### [NEW] [CursorInteraction.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/CursorInteraction.tsx)
- Realistic macOS / mobile hand pointer with natural bezier curve travel.
- Damped spring scale compression on click (`scale(0.85)`).
- Expanding translucent pulse ripple (`scale: 0.3 -> 2.5`, `opacity: 0.8 -> 0`).

#### [NEW] [ParticleTunnel.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/primitives/ParticleTunnel.tsx)
- Deterministic 2D canvas hyperspace particle streaks radiating outward from center.
- Pure frame-function mathematics using Remotion's `random(seed)` for rock-solid parallel worker rendering.

---

### 3. Composition & Transition Engine (`src/compositions/`)

#### [MODIFY] [AdComposition.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/compositions/AdComposition.tsx)
- Replace static `<Series>` with `<TransitionSeries>`.
- Dynamically inject `<TransitionSeries.Transition>` between scenes based on `scene.transition`.
- Mix multi-layer audio: ambient background music + frame-synced sound effect triggers.

#### [MODIFY] [SceneRenderer.tsx](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/compositions/SceneRenderer.tsx)
- Wire rendering for `phone-mockup`, `cursor-interaction`, and `particle-tunnel`.

---

### 4. Creative Stages Integration (`src/stages/`)

#### [MODIFY] [art-director.ts](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/art-director.ts)
- **Mobile vs Web Awareness**: Automatically choose between `PhoneMockup` and `AppWindow` based on brand category and device context.
- **Cursor Choreography**: When a button or card is featured, automatically synthesize a natural cursor movement that clicks the primary action.
- **VFX Triggers**: Allow high-tempo or high-tech concepts to use particle tunnel transitions.
- **Light Theme Support**: Support clean white/cream backgrounds (`#F8FAFC`, `#FFFFFF`) with dark high-contrast typography, matching Astra and Blink benchmarks.

#### [MODIFY] [visual-critic.ts](file:///C:/Users/USER/.gemini/antigravity/scratch/adcraft/src/stages/visual-critic.ts)
- Add checks for cursor coordinate boundaries (ensuring cursor clicks land inside target bounding box).
- Add light-mode contrast checks.

---

### 5. Housekeeping & Dead Code Removal

#### [DELETE] `src/ai/creative-director.ts` (440 lines)
#### [DELETE] `src/ai/prompts.ts` (69 lines)
#### [MODIFY] `package.json` (Remove unused `lucide-react`)

---

## Verification Plan

### Automated Tests
1. **Dependency Installation**:
   ```powershell
   npm install @remotion/transitions@^4.0.523
   ```
2. **TypeScript Compilation**:
   ```powershell
   npm run typecheck
   ```
3. **Unit & Schema Verification**:
   ```powershell
   npx tsx scripts/test-studio.ts
   ```
   Add test cases verifying `PhoneMockupSchema`, `CursorInteractionSchema`, and `ParticleTunnelSchema`.

### Visual & Render Verification
1. **Benchmark Ad Generation**:
   Generate a fintech/mobile ad for BlinkCash using the new 3D Phone Mockup + Cursor Click + Seamless Cross-fade:
   ```powershell
   npx tsx src/cli/generate.ts --name "BlinkCash" --tagline "Instant Stablecoin Savings & One-Tap Yield" --goal "free_trial" --features "Instant deposits,Zero gas fees,5.4% APY" --metric "$27.38" --label "DAILY YIELD EARNED" --color "#00E599" --accent "#38BDF8" --verbose
   ```
2. **Keyframe Extraction & Visual Quality Review**:
   Extract frames from rendered video to verify:
   - 3D Phone tilt, glare, and Dynamic Island.
   - Cursor pointer path and ripple effect.
   - Absence of black dips during scene transitions.

import { MotionIR } from "../schema";
import { CritiqueIssue, CritiqueResult, SceneCritique, VisualBible } from "./types";
import { COMPARISON_ELEMENT_TYPES, hasEqualWeightStack } from "./directing";
import { creativeMemory } from "../creative-memory";

export class VisualCritic {
  // Gate set to 9.0 / 10 as an iterative design refinement tool (not treated as truth)
  private qualityThreshold = 9.0;

  critique(motionIR: MotionIR, bible?: VisualBible): CritiqueResult {
    console.log("🧐 [Stage 6/7 - Visual Critic] Senior Art Director reviewing hierarchy, typography restraint, negative space & intent...");

    const activeBible = (motionIR as any).visualBible || bible;

    const sceneCritiques: SceneCritique[] = [];
    let totalScore = 0;
    let totalHierarchy = 0;
    let totalTypography = 0;
    let totalMotion = 0;
    let totalNegativeSpace = 0;
    let totalBrandSpecificity = 0;

    const isLight =
      motionIR.brand.theme === "editorial-light" ||
      motionIR.brand.colors.background === "#F8F7F3" ||
      motionIR.brand.colors.background === "#FFFFFF" ||
      motionIR.brand.colors.background === "#F8FAFC";

    for (let idx = 0; idx < motionIR.scenes.length; idx++) {
      const scene = motionIR.scenes[idx];
      const prevScene = idx > 0 ? motionIR.scenes[idx - 1] : undefined;
      const isFirst = idx === 0;
      const isLast = idx === motionIR.scenes.length - 1;
      const issues: CritiqueIssue[] = [];

      // Sub-scores (each calibrated 1.0 to 10.0)
      let visualHierarchy = 9.5;
      let typographyRestraint = 9.5;
      let motionIntentionality = 9.5;
      let negativeSpace = 9.5;
      let brandSpecificity = 9.5;

      // 0. Empty Scene Detection (Fatal)
      if (scene.elements.length === 0) {
        visualHierarchy -= 6.0;
        negativeSpace -= 5.0;
        issues.push({
          sceneId: scene.id,
          category: "empty-scene",
          severity: "critical",
          description: `Scene contains 0 elements, resulting in a blank dead frame.`,
          suggestedFix: "Populate scene with hero copy and visual anchor primitive.",
        });
      }

      // 1. Hero Law & 100ms Eye-Tracking Focus
      const heroes = scene.elements.filter((el) => el.importance === "hero");
      if (heroes.length !== 1) {
        visualHierarchy -= 2.5;
        issues.push({
          sceneId: scene.id,
          category: "hero-focus",
          severity: "critical",
          description: `Hero Law violation: found ${heroes.length} hero elements (must be exactly 1 for clear 100ms eye-tracking focus).`,
          suggestedFix: "Designate a singular hero primitive; subordinate secondary elements.",
        });
      }

      // 2. Spatial Overlap / Proximity Collision Check
      const spatialElements = scene.elements.filter(
        (el) => el.type !== "cursor-interaction" && el.type !== "particle-tunnel" && el.importance !== "ambient"
      );

      for (let i = 0; i < spatialElements.length; i++) {
        for (let j = i + 1; j < spatialElements.length; j++) {
          const elA = spatialElements[i];
          const elB = spatialElements[j];
          const posA = (elA.props as any).position;
          const posB = (elB.props as any).position;

          if (posA && posB && typeof posA.y === "number" && typeof posB.y === "number") {
            const yDist = Math.abs(posA.y - posB.y);
            const xDist = Math.abs((posA.x ?? 50) - (posB.x ?? 50));

            // If vertical distance is less than 16% and elements horizontally overlap
            if (yDist < 16 && xDist < 35) {
              visualHierarchy -= 4.0;
              issues.push({
                sceneId: scene.id,
                category: "spatial-collision",
                severity: "critical",
                description: `Fatal visual collision: '${elA.type}' at Y:${posA.y}% and '${elB.type}' at Y:${posB.y}% overlap within ${yDist.toFixed(1)}% vertical distance.`,
                suggestedFix: "Enforce vertical anchor separation: headline (Y:22%), hero (Y:52%), supporting badges (Y:80%).",
              });
            }
          }
        }
      }

      // 2b. Canvas Margin Overflow & Text Clipping Check
      for (const el of scene.elements) {
        if (el.type === "kinetic-text") {
          const posX = (el.props as any).position?.x ?? 50;
          const maxWidth = (el.props as any).maxWidth ?? 80;
          const align = (el.props as any).align ?? "center";

          let overflow = false;
          let edgeDesc = "";
          if (align === "left" && posX + maxWidth > 94) {
            overflow = true;
            edgeDesc = `Left-aligned text at X:${posX}% with maxWidth:${maxWidth}% reaches ${posX + maxWidth}% (>94% safe right margin).`;
          } else if (align === "center") {
            const leftEdge = posX - maxWidth / 2;
            const rightEdge = posX + maxWidth / 2;
            if (leftEdge < 5 || rightEdge > 95) {
              overflow = true;
              edgeDesc = `Center-aligned text spans [${leftEdge.toFixed(1)}%, ${rightEdge.toFixed(1)}%], overflowing safe canvas boundaries [5%, 95%].`;
            }
          }

          if (overflow) {
            visualHierarchy -= 3.5;
            typographyRestraint -= 2.0;
            issues.push({
              sceneId: scene.id,
              category: "margin-overflow",
              severity: "critical",
              description: `Text clipping defect: ${edgeDesc}`,
              suggestedFix: "Clamp maxWidth so text stays within 5% - 94% canvas boundaries.",
            });
          }
        }
      }

      // 2c. Brand Domain & Visual Incoherence Check
      const brandContext = `${motionIR.brand.name} ${motionIR.brand.theme || ""}`.toLowerCase();
      const isBotanicalOrLuxury = brandContext.includes("aesop") || motionIR.brand.theme === "editorial-light";
      if (isBotanicalOrLuxury) {
        for (const el of scene.elements) {
          if (el.type === "app-window") {
            const mockType = (el.props as any).mockType;
            if (mockType === "code") {
              brandSpecificity -= 4.0;
              issues.push({
                sceneId: scene.id,
                category: "brand-domain-mismatch",
                severity: "critical",
                description: `Software code mockup assigned to botanical luxury brand '${motionIR.brand.name}'.`,
                suggestedFix: "Use custom formulation ledger or minimalist typography card instead.",
              });
            }
          }
        }
      }

      // 3. Typographic Restraint & Scale Contrast
      const textElements = scene.elements.filter((el) => el.type === "kinetic-text");
      if (textElements.length > 0) {
        const fontSizes = textElements.map((el) => (el.props as any).fontSize || 48);
        const fontWeights = textElements.map((el) => (el.props as any).fontWeight || 800);

        // Check for competing medium sizes
        if (fontSizes.length >= 2) {
          const sortedSizes = [...fontSizes].sort((a, b) => b - a);
          const diff = sortedSizes[0] - sortedSizes[1];
          if (diff < 14) {
            typographyRestraint -= 1.5;
            issues.push({
              sceneId: scene.id,
              category: "typography-restraint",
              severity: "major",
              description: `Competing typography sizes detected (${sortedSizes[0]}px vs ${sortedSizes[1]}px). Lacks dramatic scale contrast.`,
              suggestedFix: "Amplify scale contrast: elevate headline to 66px+ and reduce secondary copy to 42px or below.",
            });
          }
        }

        // Editorial / Minimalist brand check: forbid heavy shouty weights or neon highlights
        if (isLight || motionIR.brand.theme === "editorial-light") {
          const hasHeavyWeight = fontWeights.some((w) => w > 600);
          if (hasHeavyWeight) {
            typographyRestraint -= 1.2;
            issues.push({
              sceneId: scene.id,
              category: "typography-restraint",
              severity: "major",
              description: `Heavy font weight (>600) used on editorial light aesthetic. Destroys typographic elegance.`,
              suggestedFix: "Reduce font weight to 400 or 500 for restrained editorial authority.",
            });
          }

          const hasNeonHighlights = textElements.some((el) => {
            const hw = (el.props as any).highlightWords;
            return Array.isArray(hw) && hw.length > 0;
          });
          if (hasNeonHighlights) {
            typographyRestraint -= 1.0;
            issues.push({
              sceneId: scene.id,
              category: "typography-restraint",
              severity: "minor",
              description: `Shouty keyword highlighting used on editorial brand, introducing visual noise.`,
              suggestedFix: "Remove highlightWords to preserve pristine typography flow.",
            });
          }
        }
      }

      // 4. Negative Space & Clutter Evaluation
      const nonAmbient = scene.elements.filter(
        (el) => el.type !== "cursor-interaction" && el.type !== "particle-tunnel" && el.importance !== "ambient"
      );

      if (nonAmbient.length > 3) {
        negativeSpace -= 2.0;
        issues.push({
          sceneId: scene.id,
          category: "negative-space-crowding",
          severity: "major",
          description: `Scene contains ${nonAmbient.length} non-ambient elements, crowding the canvas and suffocating negative space.`,
          suggestedFix: "Prune secondary pill badges or secondary cards; let the hero breathe.",
        });
      }

      // Equal-weight stack detection
      const isComparison = scene.elements.some((el) => COMPARISON_ELEMENT_TYPES.has(el.type));
      if (hasEqualWeightStack(scene.elements, isComparison)) {
        negativeSpace -= 1.8;
        issues.push({
          sceneId: scene.id,
          category: "crowding",
          severity: "major",
          description: `Equal-weight card stack detected without comparative layout intent, creating visual chaos.`,
          suggestedFix: "Maintain a singular primary card container or sequentialize.",
        });
      }

      // 5. Motion Intentionality & Physical Motivation
      // Check for unmotivated 2D transitions
      const transType = scene.transition?.type || "none";
      const transPres = scene.transition?.presentation || "none";
      if (
        ["slide-left", "slide-right", "slide-up", "wipe", "zoom-out"].includes(transType) ||
        ["slide", "wipe", "flip", "clock-wipe"].includes(transPres)
      ) {
        motionIntentionality -= 1.5;
        issues.push({
          sceneId: scene.id,
          category: "motion-intentionality",
          severity: "major",
          description: `Scene uses unmotivated 2D slide/wipe transition instead of intentional camera depth or seamless cut.`,
          suggestedFix: "Use 3D camera travel or seamless cut to motivate spatial progression.",
        });
      }

      // Check camera shot
      if (!scene.camera?.shot || (!isLast && scene.camera.shot === "drift")) {
        motionIntentionality -= 2.0;
        issues.push({
          sceneId: scene.id,
          category: "camera",
          severity: "critical",
          description: `Scene has no directed camera shot or relies on unmotivated static drift.`,
          suggestedFix: "Assign directed camera shot: push-in, fly-through, orbit, or vertical-rise.",
        });
      }

      // 6. Template Repetition Check (Consecutive Scene Monotony)
      if (prevScene) {
        const prevHero = prevScene.elements.find((el) => el.importance === "hero");
        const currentHero = scene.elements.find((el) => el.importance === "hero");
        if (prevHero && currentHero && prevHero.type === currentHero.type && prevHero.type !== "kinetic-text") {
          visualHierarchy -= 1.2;
          issues.push({
            sceneId: scene.id,
            category: "template-repetition",
            severity: "major",
            description: `Consecutive scenes both use identical hero primitive '${currentHero.type}', creating template monotony.`,
            suggestedFix: "Vary the hero visual vocabulary across scenes (e.g. app-window -> metric-counter or bento-grid).",
          });
        }
      }

      // 7. Brand Specificity & Asset Atmosphere
      const grain = scene.atmosphere?.grain ?? 0;
      const haze = scene.atmosphere?.haze ?? 0;
      if (grain === 0 && haze === 0) {
        brandSpecificity -= 1.5;
        issues.push({
          sceneId: scene.id,
          category: "atmosphere",
          severity: "major",
          description: `Scene has zero grain and zero haze, producing a sterile digital slide look.`,
          suggestedFix: "Add subtle film grain (0.10 - 0.14) and atmospheric haze.",
        });
      }

      if (isLight && scene.backgroundAssetId?.includes("obsidian")) {
        brandSpecificity -= 3.0;
        issues.push({
          sceneId: scene.id,
          category: "asset-kit",
          severity: "critical",
          description: `Dark obsidian asset kit assigned to an editorial light brand profile.`,
          suggestedFix: "Switch to kit-editorial-light with bg-editorial-sand-grain.",
        });
      }

      // 8. Pacing Verification
      const durationSeconds = scene.durationFrames / (motionIR.meta.fps || 30);
      if (durationSeconds < 2.0) {
        motionIntentionality -= 1.5;
        issues.push({
          sceneId: scene.id,
          category: "pacing",
          severity: "major",
          description: `Scene duration (${durationSeconds.toFixed(1)}s) is too fast for viewer comprehension.`,
          suggestedFix: "Increase duration to at least 2.5s.",
        });
      } else if (durationSeconds > 7.0) {
        motionIntentionality -= 1.0;
        issues.push({
          sceneId: scene.id,
          category: "pacing",
          severity: "minor",
          description: `Scene duration (${durationSeconds.toFixed(1)}s) risks losing narrative momentum.`,
          suggestedFix: "Trim scene to 3.5s - 5.5s.",
        });
      }

      // 9. Creative Memory Known Failure Modes Audit
      const usedItemIds = (scene as any).usedMemoryItemIds || [];
      for (const itemId of usedItemIds) {
        const memItem = creativeMemory.getItem(itemId);
        if (!memItem) continue;

        for (const failureMode of memItem.knownFailureModes) {
          const fmLower = failureMode.toLowerCase();

          // Rule A: Headline collision with 3D conveyors / grids (headline posY > 30%)
          if (fmLower.includes("headline posy > 30%") || fmLower.includes("overlaps centered headline")) {
            const headline = scene.elements.find((el) => el.type === "kinetic-text");
            const headlineY = (headline?.props as any)?.position?.y ?? 25;
            if (headlineY > 30) {
              visualHierarchy -= 2.0;
              issues.push({
                sceneId: scene.id,
                category: "creative-memory-violation",
                severity: "critical",
                description: `Creative Memory violation [${memItem.name}]: Headline positioned at Y:${headlineY}% conflicts with failure mode: "${failureMode}".`,
                suggestedFix: "Move headline anchor to Y:22-26% to give 3D elements breathing room.",
              });
            }
          }

          // Rule B: Phone centering occluding background typography
          if (fmLower.includes("if phone is placed directly at center (x:50%)") || fmLower.includes("occluded and illegible")) {
            const phone = scene.elements.find((el) => el.type === "phone-mockup");
            const hasText = scene.elements.some((el) => el.type === "kinetic-text");
            const phoneX = (phone?.props as any)?.position?.x ?? 50;
            if (phone && hasText && Math.abs(phoneX - 50) < 5) {
              visualHierarchy -= 2.5;
              issues.push({
                sceneId: scene.id,
                category: "creative-memory-violation",
                severity: "critical",
                description: `Creative Memory violation [${memItem.name}]: Phone centered at X:${phoneX}% occludes background copy: "${failureMode}".`,
                suggestedFix: "Offset phone to X:40% and text to X:72% for multi-plane depth lockup.",
              });
            }
          }

          // Rule C: Style clash - editorial brands with dark obsidian / neon / high-stress
          if (fmLower.includes("editorial light") && isLight) {
            if (memItem.type === "background" && (memItem.id.includes("dark") || memItem.id.includes("obsidian"))) {
              brandSpecificity -= 3.0;
              issues.push({
                sceneId: scene.id,
                category: "creative-memory-violation",
                severity: "critical",
                description: `Creative Memory violation [${memItem.name}]: Clashing asset assigned to light editorial aesthetic: "${failureMode}".`,
                suggestedFix: "Select light editorial asset kit.",
              });
            }
          }

          // Rule D: Bento tile overload in 9:16 vertical orientation
          if (fmLower.includes("more than 4 primary bento tiles") && motionIR.meta.aspectRatio === "9:16") {
            const bento = scene.elements.find((el) => el.type === "bento-grid");
            const tilesCount = ((bento?.props as any)?.tiles || []).length;
            if (tilesCount > 4) {
              negativeSpace -= 2.0;
              issues.push({
                sceneId: scene.id,
                category: "creative-memory-violation",
                severity: "major",
                description: `Creative Memory violation [${memItem.name}]: ${tilesCount} bento tiles exceeds vertical 9:16 threshold: "${failureMode}".`,
                suggestedFix: "Limit bento grid to maximum 4 primary tiles in vertical 9:16 layout.",
              });
            }
          }

          // Rule E: Resolution chime or payoff sound in problem/stress scene
          if (fmLower.includes("reserve exclusively for resolution/payoff") && isFirst) {
            motionIntentionality -= 1.5;
            issues.push({
              sceneId: scene.id,
              category: "creative-memory-violation",
              severity: "major",
              description: `Creative Memory violation [${memItem.name}]: Resolution sound cue triggered in opening problem scene: "${failureMode}".`,
              suggestedFix: "Defer resolution chime to payoff/resolution scene.",
            });
          }
        }
      }

      // 10. Campaign Visual Bible Coherence & Transformation Gate
      if (activeBible) {
        const isTransform = !!(scene.transformationCall?.isExplicitTransformation);
        const allowedDepartures = scene.transformationCall?.allowedDepartures || [];

        // 10a. Typography Coherence
        const kineticTexts = scene.elements.filter((el) => el.type === "kinetic-text");
        for (const kt of kineticTexts) {
          const font = (kt.props as any).fontFamily || (kt.props as any).font;
          if (font) {
            const bibleFont = activeBible.typographySystem.headlineFont.split(",")[0].trim().toLowerCase();
            const elFont = font.split(",")[0].trim().toLowerCase();
            const fontMatches = elFont.includes(bibleFont) || bibleFont.includes(elFont);

            if (!fontMatches) {
              if (isTransform && allowedDepartures.includes("typography")) {
                // Authorized departure: permitted by storyboard transformationCall
              } else {
                typographyRestraint -= 2.5;
                brandSpecificity -= 2.0;
                issues.push({
                  sceneId: scene.id,
                  category: "visual-bible-inconsistency",
                  severity: "critical",
                  description: `Typography violation: Scene uses font '${font}' departing from Campaign Visual Bible headlineFont '${activeBible.typographySystem.headlineFont}' without explicit transformation authorization.`,
                  suggestedFix: `Inherit Visual Bible headlineFont '${activeBible.typographySystem.headlineFont}' or declare an explicit transformationCall with 'typography' departure.`,
                });
              }
            }
          }
        }

        // 10b. Palette / Background Coherence
        if (scene.background?.color && activeBible.visualLanguage?.colorTokens?.backgroundBase) {
          const scBg = scene.background.color.toLowerCase();
          const bbBg = activeBible.visualLanguage.colorTokens.backgroundBase.toLowerCase();
          const isDarkBible = bbBg.startsWith("#0") || bbBg.startsWith("#1");
          const isLightScene = scBg.startsWith("#f") || scBg === "#ffffff" || scBg === "white";
          const isLightBible = bbBg.startsWith("#f") || bbBg === "#ffffff";
          const isDarkScene = scBg.startsWith("#0") || scBg.startsWith("#1") || scBg === "#08080b";

          const hasPaletteClash = (isDarkBible && isLightScene) || (isLightBible && isDarkScene);

          if (hasPaletteClash) {
            if (isTransform && allowedDepartures.includes("palette")) {
              // Authorized departure: permitted
            } else {
              brandSpecificity -= 3.0;
              issues.push({
                sceneId: scene.id,
                category: "visual-bible-inconsistency",
                severity: "critical",
                description: `Color Palette clash: Scene background (${scene.background.color}) radically departs from Visual Bible backgroundBase (${activeBible.visualLanguage.colorTokens.backgroundBase}) without explicit transformation authorization.`,
                suggestedFix: `Harmonize background with Visual Bible colorTokens (${activeBible.visualLanguage.colorTokens.backgroundBase}) or declare an explicit transformationCall with 'palette' departure.`,
              });
            }
          }
        }

        // 10c. Camera Language Constraints
        if (scene.camera) {
          const cameraMaxTilt = activeBible.cameraLanguage.tiltConstraints.maxTiltX;
          for (const el of scene.elements) {
            const rotX = Math.abs((el.props as any).rotateX ?? 0);
            if (rotX > cameraMaxTilt + 8) {
              if (isTransform && allowedDepartures.includes("camera")) {
                // Authorized departure
              } else {
                visualHierarchy -= 1.5;
                issues.push({
                  sceneId: scene.id,
                  category: "visual-bible-inconsistency",
                  severity: "major",
                  description: `Camera/Perspective constraint exceeded: Element '${el.id}' rotateX (${rotX}°) exceeds Visual Bible maxTiltX (${cameraMaxTilt}°) without explicit transformation authorization.`,
                  suggestedFix: `Clamp 3D perspective tilt to Visual Bible constraints (max ${cameraMaxTilt}°).`,
                });
              }
            }
          }
        }
      }

      // Clamp sub-scores
      const clampScore = (s: number) => Math.max(1.0, Math.min(10.0, parseFloat(s.toFixed(1))));
      visualHierarchy = clampScore(visualHierarchy);
      typographyRestraint = clampScore(typographyRestraint);
      motionIntentionality = clampScore(motionIntentionality);
      negativeSpace = clampScore(negativeSpace);
      brandSpecificity = clampScore(brandSpecificity);

      totalHierarchy += visualHierarchy;
      totalTypography += typographyRestraint;
      totalMotion += motionIntentionality;
      totalNegativeSpace += negativeSpace;
      totalBrandSpecificity += brandSpecificity;

      // Composite scene score (weighted art director synthesis)
      const sceneScore = clampScore(
        visualHierarchy * 0.25 +
        typographyRestraint * 0.20 +
        motionIntentionality * 0.20 +
        negativeSpace * 0.20 +
        brandSpecificity * 0.15
      );

      totalScore += sceneScore;

      sceneCritiques.push({
        sceneId: scene.id,
        score: sceneScore,
        visualHierarchyScore: visualHierarchy,
        typographyRestraintScore: typographyRestraint,
        motionIntentionalityScore: motionIntentionality,
        negativeSpaceScore: negativeSpace,
        brandSpecificityScore: brandSpecificity,
        notes:
          issues.length === 0
            ? "Flawless senior art direction: immaculate hierarchy, typographic restraint, and breathing room."
            : `${issues.length} design flaw(s) flagged for revision.`,
        issues,
      });
    }

    const sceneCount = motionIR.scenes.length || 1;
    let overallScore = parseFloat((totalScore / sceneCount).toFixed(1));
    const visualHierarchyAvg = parseFloat((totalHierarchy / sceneCount).toFixed(1));
    const typographyRestraintAvg = parseFloat((totalTypography / sceneCount).toFixed(1));
    const motionIntentionalityAvg = parseFloat((totalMotion / sceneCount).toFixed(1));
    const negativeSpaceAvg = parseFloat((totalNegativeSpace / sceneCount).toFixed(1));
    const brandSpecificityAvg = parseFloat((totalBrandSpecificity / sceneCount).toFixed(1));

    const allIssues = sceneCritiques.flatMap((s) => s.issues);
    const criticalIssues = allIssues.filter((i) => i.severity === "critical");

    // ABSOLUTE VETO GATE: Critical flaws (collisions, clipping, domain mismatches) cap overall score
    if (criticalIssues.length > 0) {
      overallScore = Math.min(overallScore, 6.5);
    }

    const passedThreshold = overallScore >= this.qualityThreshold && criticalIssues.length === 0;

    console.log(
      `📊 [Visual Critic] Overall: ${overallScore}/10 (Gate: ${this.qualityThreshold}/10) -> ${
        passedThreshold ? "PASSED ✅" : "REVISION REQUIRED ⚠️"
      }`
    );
    console.log(
      `   [Hierarchy: ${visualHierarchyAvg}/10 | Typography: ${typographyRestraintAvg}/10 | Motion: ${motionIntentionalityAvg}/10 | Space: ${negativeSpaceAvg}/10 | Brand: ${brandSpecificityAvg}/10]`
    );

    if (!passedThreshold) {
      console.log(`   Flagged ${allIssues.length} issues needing surgical revision.`);
    }

    return {
      overallScore,
      passedThreshold,
      scenes: sceneCritiques,
      visualHierarchyAvg,
      typographyRestraintAvg,
      motionIntentionalityAvg,
      negativeSpaceAvg,
      brandSpecificityAvg,
      summary: passedThreshold
        ? "Ad meets Senior Art Director quality standard across hierarchy, typography restraint, negative space, and camera motion."
        : `Ad scored ${overallScore}/10 (below 9.0 gate) and requires surgical design revision.`,
      revisionRequired: !passedThreshold,
    };
  }
}

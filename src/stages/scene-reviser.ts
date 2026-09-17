import { MotionIR, MotionIRSchema } from "../schema";
import { CritiqueResult } from "./types";
import { applyHeroLaw, cameraForScene, cinematicTransition, defaultAtmosphere } from "./directing";
import { getAsset } from "../asset-bank";
import { getTechnique } from "../technique-bank";

export class SceneReviser {
  revise(motionIR: MotionIR, critique: CritiqueResult): MotionIR {
    console.log("🛠️ [Stage 7/7 - Scene Reviser] Surgically correcting flagged scenes to meet quality bar...");

    const isLight =
      motionIR.brand.theme === "editorial-light" ||
      motionIR.brand.colors?.background === "#F8F7F3" ||
      motionIR.brand.colors?.background === "#FFFFFF" ||
      motionIR.brand.colors?.background === "#F8FAFC";

    const totalScenes = motionIR.scenes.length;

    const revisedScenes = motionIR.scenes.map((scene, sceneIdx) => {
      const sceneCritique = critique.scenes.find((s) => s.sceneId === scene.id);
      if (!sceneCritique || sceneCritique.issues.length === 0) {
        return scene;
      }

      const updated = JSON.parse(JSON.stringify(scene));

      for (const issue of sceneCritique.issues) {
        // 1. Empty Scene Detection
        if (issue.category === "empty-scene") {
          const synthesized = [
            {
              id: `${scene.id}-revised-headline`,
              type: "kinetic-text" as const,
              importance: "hero" as const,
              props: {
                text: "Engineered for Velocity",
                fontSize: 60,
                fontWeight: 800,
                color: "brand.text",
                position: { x: 50, y: 22 },
                align: "center" as const,
                animation: "cinematic-scale" as const,
                delay: 0,
              },
            },
            {
              id: `${scene.id}-revised-app`,
              type: "app-window" as const,
              importance: "supporting" as const,
              props: {
                title: "Command Engine",
                mockType: "kanban" as const,
                width: 88,
                position: { x: 50, y: 58 },
                tilt: true,
                shadow: true,
                delay: 8,
              },
            },
          ];
          const directed = applyHeroLaw(synthesized as any);
          updated.elements = directed.elements;
          updated.heroElementId = directed.heroElementId;
        }

        // 2. Hero Law Violation (Hero count ≠ 1)
        else if (issue.category === "hero-focus") {
          const directed = applyHeroLaw(updated.elements, updated.heroElementId);
          updated.elements = directed.elements;
          updated.heroElementId = directed.heroElementId;
        }

        // 3. Camera Law: Missing camera or static drift on transition beat
        else if (issue.category === "camera") {
          updated.camera = cameraForScene(
            { id: scene.id, act: (scene.id.split("-")[1] as any) || "solution" } as any,
            sceneIdx,
            totalScenes
          );
        }

        // 2b. Spatial Collision Remediation
        else if (issue.category === "spatial-collision") {
          // Re-anchor elements along vertical composite axis to guarantee separation
          const headline = updated.elements.find((el: any) => el.type === "kinetic-text");
          const hero = updated.elements.find((el: any) => el.type === "metric-counter" || el.type === "app-window" || el.type === "phone-mockup" || el.type === "bento-grid");
          const badges = updated.elements.find((el: any) => el.type === "feature-pills");

          if (headline && headline.props?.position) {
            headline.props.position = { x: 50, y: 22 };
            headline.props.align = "center";
            headline.props.maxWidth = 82;
          }
          if (hero && hero.props?.position) {
            hero.props.position = { x: 50, y: 52 };
          }
          if (badges && badges.props?.position) {
            badges.props.position = { x: 50, y: 80 };
          }
        }

        // 2c. Margin Overflow Remediation
        else if (issue.category === "margin-overflow") {
          for (const el of updated.elements) {
            if (el.type === "kinetic-text" && el.props) {
              const posX = el.props.position?.x ?? 50;
              const align = el.props.align ?? "center";
              if (align === "left") {
                el.props.maxWidth = Math.min(el.props.maxWidth || 70, 90 - posX);
              } else if (align === "center") {
                const available = Math.min(posX, 100 - posX);
                el.props.maxWidth = Math.min(el.props.maxWidth || 76, Math.floor((available - 6) * 2));
              }
            }
          }
        }

        // 2d. Brand Domain Mismatch Remediation
        else if (issue.category === "brand-domain-mismatch") {
          for (const el of updated.elements) {
            if (el.type === "app-window" && el.props) {
              el.props.mockType = "custom";
              el.props.title = `${motionIR.brand.name} Formulation Ledger`;
              el.props.customStats = [
                { label: "Active Botanicals", val: "100%", change: "Cold-Pressed", color: "brand.accent" },
                { label: "Aromatherapeutics", val: "Pure", change: "Cedar & Rind", color: "brand.primary" },
                { label: "Synthetic Additives", val: "0%", change: "Zero Fillers", color: "#F59E0B" },
              ];
              el.props.chartTitle = "Botanical Extraction Potency Profile";
            }
          }
        }

        // 2e. CTA Collision Remediation
        else if (issue.category === "cta-collision") {
          const cursor = updated.elements.find((el: any) => el.type === "cursor-interaction");
          if (cursor && cursor.props) {
            cursor.props.agentTag = undefined;
            if (cursor.props.to) {
              cursor.props.to.y = 74;
            }
          }
        }

        // 4. Equal-Weight Stack / Crowding / Negative Space Crowding
        else if (issue.category === "crowding" || issue.category === "negative-space-crowding") {
          // Prune secondary clutter to restore negative space breathing room
          const hero = updated.elements.find((el: any) => el.importance === "hero") || updated.elements[0];
          const textCopy = updated.elements.find((el: any) => el.type === "kinetic-text");
          const ambient = updated.elements.filter((el: any) => el.type === "cursor-interaction" || el.type === "particle-tunnel");

          const pruned: any[] = [];
          if (hero) pruned.push(hero);
          if (textCopy && textCopy !== hero) pruned.push(textCopy);
          pruned.push(...ambient);

          const directed = applyHeroLaw(pruned, hero?.id);
          updated.elements = directed.elements;
          updated.heroElementId = directed.heroElementId;
        }

        // 4b. Typography Restraint Remediation
        else if (issue.category === "typography-restraint") {
          const texts = updated.elements.filter((el: any) => el.type === "kinetic-text");
          if (texts.length >= 2) {
            texts.sort((a: any, b: any) => (b.props.fontSize || 48) - (a.props.fontSize || 48));
            texts[0].props.fontSize = 72; // Monumental headline
            for (let t = 1; t < texts.length; t++) {
              texts[t].props.fontSize = 38; // Restrained supporting label
            }
          }
          if (isLight || motionIR.brand.theme === "editorial-light") {
            for (const el of texts) {
              el.props.fontWeight = 400;
              el.props.highlightWords = [];
            }
          }
        }

        // 4c. Motion Intentionality Remediation
        else if (issue.category === "motion-intentionality") {
          updated.transition = cinematicTransition();
          updated.camera = cameraForScene(
            { id: scene.id, act: (scene.id.split("-")[1] as any) || "solution" } as any,
            sceneIdx,
            totalScenes
          );
        }

        // 4d. Template Repetition Remediation
        else if (issue.category === "template-repetition") {
          if (updated.layoutStrategy === "hero-centered") {
            updated.layoutStrategy = "split-depth";
          }
          // Shift camera angle to create distinct cinematic perspective
          updated.camera = { shot: "orbit", intensity: "subtle", ease: "cinematic" };
        }

        // 5. Physical Atmosphere Deficit
        else if (issue.category === "atmosphere") {
          updated.atmosphere = defaultAtmosphere(isLight);
        }

        // 6. Kinetic Energy: Generic fade-up upgrade
        else if (issue.category === "kinetic-energy") {
          for (let i = 0; i < updated.elements.length; i++) {
            const el = updated.elements[i];
            if (el.type === "kinetic-text") {
              if (sceneIdx === 0) {
                el.props.animation = "cinematic-scale";
              } else {
                el.props.animation = "glow-punch";
              }
            }
          }
        }

        // 7. Explainer-Slide Trap: 2D wipes/slides
        else if (issue.category === "explainer-slide") {
          updated.transition = cinematicTransition();
        }

        // 8. Layout Strategy (stacked-cards on non-CTA)
        else if (issue.category === "visual-hierarchy" && issue.description.includes("layoutStrategy")) {
          updated.layoutStrategy = "hero-centered";
        }

        // 8b. Asset Kit Style Mismatch Repair
        else if (issue.category === "asset-kit" || issue.category === "brand-specificity") {
          updated.backgroundAssetId = isLight ? "bg-editorial-sand-grain" : "bg-cinematic-midnight-mesh";
          updated.visualKitId = isLight ? "kit-editorial-light" : "kit-cinematic-dark";
          const bgAsset = getAsset(updated.backgroundAssetId);
          if (bgAsset) {
            updated.background = {
              type: (bgAsset.properties.type as any) || "gradient",
              color: bgAsset.properties.color,
              gradientTo: bgAsset.properties.gradientTo,
              angle: bgAsset.properties.angle || 135,
              glowOrb: bgAsset.properties.glowOrb ?? !isLight,
            };
          }
        }

        // 9. Readability / Font Size
        else if (issue.category === "readability") {
          for (const el of updated.elements) {
            if (el.type === "kinetic-text" && (el.props.fontSize || 0) < 56) {
              el.props.fontSize = 62;
            }
          }
        }

        // 10. Visual Hierarchy: Overlap
        else if (issue.category === "visual-hierarchy") {
          let currentY = 20;
          for (const el of updated.elements) {
            if (el.props && el.props.position) {
              el.props.position.y = currentY;
              currentY += 28;
            }
          }
        }

        // 11. Pacing
        else if (issue.category === "pacing") {
          if (updated.durationFrames < 75) {
            updated.durationFrames = 90;
          } else if (updated.durationFrames > 195) {
            updated.durationFrames = 150;
          }
        }
      }

      // Ensure hero law and atmosphere always hold after revision
      if (!updated.heroElementId || !updated.elements.some((el: any) => el.importance === "hero")) {
        const directed = applyHeroLaw(updated.elements, updated.heroElementId);
        updated.elements = directed.elements;
        updated.heroElementId = directed.heroElementId;
      }
      if (!updated.camera || !updated.camera.shot) {
        updated.camera = cameraForScene({ id: scene.id } as any, sceneIdx, totalScenes);
      }
      if (!updated.atmosphere || (updated.atmosphere.grain === 0 && updated.atmosphere.haze === 0)) {
        updated.atmosphere = defaultAtmosphere(isLight);
      }
      if (updated.transition?.type && ["slide-left", "slide-right", "slide-up", "wipe"].includes(updated.transition.type)) {
        updated.transition = cinematicTransition();
      }

      return updated;
    });

    const revisedIR: MotionIR = {
      ...motionIR,
      scenes: revisedScenes,
    };

    return MotionIRSchema.parse(revisedIR);
  }
}

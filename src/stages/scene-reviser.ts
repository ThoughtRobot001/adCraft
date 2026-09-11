import { MotionIR, MotionIRSchema } from "../schema";
import { CritiqueResult } from "./types";

export class SceneReviser {
  revise(motionIR: MotionIR, critique: CritiqueResult): MotionIR {
    console.log("🛠️ [Stage 7/7 - Scene Reviser] Surgically correcting flagged scenes to meet quality bar...");

    const revisedScenes = motionIR.scenes.map((scene) => {
      const sceneCritique = critique.scenes.find((s) => s.sceneId === scene.id);
      if (!sceneCritique || sceneCritique.issues.length === 0) {
        return scene;
      }

      const updated = JSON.parse(JSON.stringify(scene));

      for (const issue of sceneCritique.issues) {
        if (issue.category === "empty-scene") {
          // Surgically synthesize hero headline and app window
          updated.elements = [
            {
              id: `${scene.id}-revised-headline`,
              type: "kinetic-text",
              props: {
                text: "Engineered for Velocity",
                fontSize: 60,
                fontWeight: 800,
                color: "brand.text",
                position: { x: 50, y: 22 },
                align: "center",
                animation: "fade-up",
                delay: 0,
              },
            },
            {
              id: `${scene.id}-revised-app`,
              type: "app-window",
              props: {
                title: "Command Engine",
                mockType: "kanban",
                width: 90,
                position: { x: 50, y: 58 },
                tilt: true,
                shadow: true,
                delay: 8,
              },
            },
          ];
        } else if (issue.category === "pacing") {
          // Adjust duration to 90-120 frames
          if (updated.durationFrames < 75) {
            updated.durationFrames = 90;
          } else if (updated.durationFrames > 180) {
            updated.durationFrames = 135;
          }
        } else if (issue.category === "readability") {
          // Boost font size of headlines
          for (const el of updated.elements) {
            if (el.type === "kinetic-text" && (el.props.fontSize || 0) < 56) {
              el.props.fontSize = 62;
            }
          }
        } else if (issue.category === "visual-hierarchy") {
          // Space out elements vertically
          let currentY = 20;
          for (const el of updated.elements) {
            if (el.props && el.props.position) {
              el.props.position.y = currentY;
              currentY += 28;
            }
          }
        } else if (issue.category === "crowding") {
          // Trim non-essential elements if > 4
          if (updated.elements.length > 4) {
            updated.elements = updated.elements.slice(0, 3);
          }
        }
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

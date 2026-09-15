import type { IncomingMessage, ServerResponse } from "http";
import { studioGenerationService } from "./generation-service";
import { creativeMemory } from "../../creative-memory";

async function parseJsonBody(req: IncomingMessage): Promise<any> {
  if ((req as any).body) return (req as any).body;
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: any) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data || data.trim() === "") return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function sendError(res: ServerResponse, statusCode: number, message: string) {
  sendJson(res, statusCode, { error: message, success: false });
}

export function createApiMiddleware() {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || "";
    const method = req.method || "GET";

    if (!url.startsWith("/api/")) {
      return next();
    }

    try {
      // 1. GET /api/status - System Capability & Health
      if (url === "/api/status" && method === "GET") {
        const capability = studioGenerationService.getCapabilityStatus();
        return sendJson(res, 200, {
          capability,
          healthy: true,
          timestamp: new Date().toISOString(),
        });
      }

      // 2. POST /api/pipeline/quick-create - Autonomous Pipeline Execution
      if (url === "/api/pipeline/quick-create" && method === "POST") {
        const body = await parseJsonBody(req);
        const { brief, brand, creativeDirection } = body;
        if (!brief) {
          return sendError(res, 400, "Missing required 'brief' in request body");
        }

        const brandInput = brand || {
          name: brief.productName || "Brand",
          tagline: "",
          colors: { primary: "#0B0D11", accent: "#8B5CF6", secondary: "#1E293B" },
        };

        const resultState = await studioGenerationService.runAutonomousPipeline(
          brandInput,
          brief,
          creativeDirection
        );
        return sendJson(res, 200, { success: true, state: resultState });
      }

      // 3. POST /api/pipeline/revise - Natural Language Targeted Revision
      if (url === "/api/pipeline/revise" && method === "POST") {
        const body = await parseJsonBody(req);
        const { state, instruction } = body;
        if (!state || !instruction) {
          return sendError(res, 400, "Missing 'state' or 'instruction' in request body");
        }

        const revisedState = await studioGenerationService.applyNaturalLanguageRevision(
          state,
          instruction
        );
        return sendJson(res, 200, { success: true, state: revisedState });
      }

      // 4. POST /api/pipeline/stage/:stageId - Step-by-Step Creative Studio Execution
      if (url.startsWith("/api/pipeline/stage/") && method === "POST") {
        const stageId = url.replace("/api/pipeline/stage/", "").split("?")[0];
        const body = await parseJsonBody(req);
        const { payload } = body;

        switch (stageId) {
          case "brief": {
            const { brand, brief } = payload || {};
            const brandProfile = await studioGenerationService.analyzeBrand(brand, brief);
            return sendJson(res, 200, { success: true, brandProfile });
          }
          case "concepts": {
            const { brandProfile, brief } = payload || {};
            const concepts = await studioGenerationService.developConcepts(brandProfile, brief);
            return sendJson(res, 200, { success: true, concepts });
          }
          case "storyboard": {
            const { concept, brandProfile, brief } = payload || {};
            const storyboard = await studioGenerationService.designStoryboard(
              concept,
              brandProfile,
              brief
            );
            return sendJson(res, 200, { success: true, storyboard });
          }
          case "visual-bible": {
            const { brandProfile, brief, concepts } = payload || {};
            const visualBible = await studioGenerationService.synthesizeVisualBible(
              brandProfile,
              brief,
              concepts
            );
            return sendJson(res, 200, { success: true, visualBible });
          }
          case "quality": {
            const { motionIR, visualBible } = payload || {};
            const critique = studioGenerationService.evaluateQuality(motionIR, visualBible);
            return sendJson(res, 200, { success: true, critique });
          }
          case "revise-scene": {
            const { motionIR, critique } = payload || {};
            const revised = studioGenerationService.applySurgicalRevision(
              motionIR,
              critique
            );
            return sendJson(res, 200, { success: true, motionIR: revised });
          }
          default:
            return sendError(res, 404, `Unknown pipeline stage '${stageId}'`);
        }
      }

      // 5. POST /api/export - Production Export & Render Trigger
      if (url === "/api/export" && method === "POST") {
        const body = await parseJsonBody(req);
        const { state } = body;
        if (!state || !state.motionIR || !state.storyboard || !state.critique || !state.approvedKeyframes) {
          return sendError(res, 400, "Missing required state fields for export");
        }

        const selectedConcept = state.concepts?.find((c: any) => c.id === state.selectedConceptId);
        const exportPackage = studioGenerationService.buildExportPackage(
          state.jobId,
          state.brandProfile?.identity.name || state.brief.productName,
          selectedConcept?.angleTitle || "Custom Angle",
          state.motionIR,
          state.storyboard,
          state.approvedKeyframes,
          state.critique,
          state.critique.qualityDimensions,
          {
            conceptApprovedAt: state.auditTrail?.find((a: any) => a.action.includes("selected direction"))?.timestamp,
            storyboardApprovedAt: state.auditTrail?.find((a: any) => a.action.includes("Storyboard approved"))?.timestamp,
            keyframesApprovedAt: new Date().toISOString(),
            finalApprovedAt: new Date().toISOString(),
          }
        );

        return sendJson(res, 200, { success: true, exportPackage });
      }

      // 6. POST /api/memory/verdict - Outcome Learning
      if (url === "/api/memory/verdict" && method === "POST") {
        const body = await parseJsonBody(req);
        const {
          adId,
          brand,
          conceptAngle,
          intent,
          style,
          itemsUsed,
          score,
          passed,
          feedback,
          issues,
          verdict,
        } = body;

        creativeMemory.recordOutcome({
          id: adId || `outcome-${Date.now()}`,
          brand: brand || "Unknown",
          conceptAngle: conceptAngle || "Generic",
          intent: intent || "feature-escalation",
          style: (style as any) || "dark-saas",
          itemsUsed: itemsUsed || [],
          critiqueOverallScore: score || 9.0,
          critiquePassed: passed ?? true,
          critiqueIssues: issues || [],
          userVerdict: verdict || "approved",
          userFeedbackNotes: feedback || "",
          timestamp: new Date().toISOString(),
        });

        return sendJson(res, 200, { success: true, message: "Outcome recorded in Creative Memory" });
      }

      // Unhandled API Route
      return sendError(res, 404, `API route not found: ${method} ${url}`);
    } catch (err: any) {
      console.error("[AdCraft API Error]", err);
      return sendError(res, 500, err?.message || "Internal server error");
    }
  };
}

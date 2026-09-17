import { GoogleGenAI } from "@google/genai";
import { loadEnv } from "../utils/env";

loadEnv();

export class GeminiClient {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  hasKey(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async generateStructuredJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const candidateModels = [
      "gemini-3.5-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-3.6-flash",
      "gemini-2.5-flash",
    ];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction: `${systemPrompt}\n\nYou must reply ONLY with valid RFC8259 JSON. Do not include markdown code block markers or explanations.`,
            responseMimeType: "application/json",
            temperature: 0.6,
          },
        });

        const text = response.text;
        if (!text) {
          throw new Error(`Gemini (${model}) returned empty candidate text`);
        }

        // Clean possible markdown code fences
        const cleaned = text
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        return JSON.parse(cleaned) as T;
      } catch (err: any) {
        lastError = err;
        // If it's a rate limit (429) or not found (404), try next model in candidate list
        const msg = String(err.message || err);
        if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("404")) {
          continue;
        }
        // For other fatal errors, also attempt fallback
        continue;
      }
    }

    throw new Error(`Gemini API error: ${lastError?.message || lastError || "All models failed"}`);
  }
}

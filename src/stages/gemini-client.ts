import { loadEnv } from "../utils/env";

loadEnv();

export class GeminiClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
  }

  hasKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  async generateStructuredJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    if (!this.hasKey()) {
      throw new Error("No GEMINI_API_KEY configured.");
    }

    const isBearer = this.apiKey.startsWith("ya29.");
    const url = isBearer
      ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent"
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${this.apiKey}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (isBearer) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const payload = {
      system_instruction: {
        parts: [{ text: `${systemPrompt}\n\nYou must reply ONLY with valid RFC8259 JSON.` }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        responseMimeType: "application/json",
      },
    };

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`Gemini API error ${resp.status}: ${err}`);
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini returned empty candidate text");
    }

    try {
      return JSON.parse(text) as T;
    } catch (parseErr: any) {
      // Clean possible backticks
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned) as T;
    }
  }
}

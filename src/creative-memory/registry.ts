import fs from "fs";
import path from "path";
import { ALL_PRESEEDED_MEMORY_ITEMS } from "./recipes";
import {
  CompatibleStyle,
  CreativeIntentQuery,
  CreativeMemoryItem,
  CreativeMemoryItemSchema,
  CreativeVocabularyPackage,
  EmotionalEffect,
  MemoryItemType,
  SessionOutcome,
} from "./types";

const MEMORY_STORE_DIR =
  typeof path !== "undefined" && typeof path.join === "function" && typeof __dirname !== "undefined"
    ? path.join(__dirname, "data")
    : "";
const MEMORY_STORE_FILE =
  MEMORY_STORE_DIR && typeof path !== "undefined" && typeof path.join === "function"
    ? path.join(MEMORY_STORE_DIR, "memory-store.json")
    : "";

interface PersistedMemoryState {
  items: CreativeMemoryItem[];
  outcomes: SessionOutcome[];
  affinityWeights: Record<string, number>; // key: "itemA:itemB" or "intent:itemId", value: weight
}

export class CreativeMemory {
  private static instance: CreativeMemory;
  private items: Map<string, CreativeMemoryItem> = new Map();
  private outcomes: SessionOutcome[] = [];
  private affinityWeights: Map<string, number> = new Map();

  private constructor() {
    this.initializeStore();
  }

  public static getInstance(): CreativeMemory {
    if (!CreativeMemory.instance) {
      CreativeMemory.instance = new CreativeMemory();
    }
    return CreativeMemory.instance;
  }

  private initializeStore() {
    // 1. Load preseeded items
    for (const item of ALL_PRESEEDED_MEMORY_ITEMS) {
      this.items.set(item.id, { ...item });
    }

    // 2. Load persisted user overrides, dynamic items, and outcome history
    try {
      if (
        MEMORY_STORE_FILE &&
        typeof fs !== "undefined" &&
        fs.existsSync &&
        fs.existsSync(MEMORY_STORE_FILE)
      ) {
        const raw = fs.readFileSync(MEMORY_STORE_FILE, "utf-8");
        const state: PersistedMemoryState = JSON.parse(raw);

        if (Array.isArray(state.items)) {
          for (const rawItem of state.items) {
            const parsed = CreativeMemoryItemSchema.safeParse(rawItem);
            if (parsed.success) {
              this.items.set(parsed.data.id, parsed.data);
            }
          }
        }

        if (Array.isArray(state.outcomes)) {
          this.outcomes = state.outcomes;
        }

        if (state.affinityWeights && typeof state.affinityWeights === "object") {
          for (const [key, val] of Object.entries(state.affinityWeights)) {
            this.affinityWeights.set(key, val);
          }
        }
      }
    } catch {
      // Graceful fallback to preseeded memory if file read fails
    }
  }

  private persistState() {
    try {
      if (
        !MEMORY_STORE_DIR ||
        typeof fs === "undefined" ||
        !fs.writeFileSync ||
        !fs.existsSync
      ) {
        return;
      }
      if (!fs.existsSync(MEMORY_STORE_DIR)) {
        fs.mkdirSync(MEMORY_STORE_DIR, { recursive: true });
      }

      const affinityObj: Record<string, number> = {};
      for (const [k, v] of this.affinityWeights.entries()) {
        affinityObj[k] = v;
      }

      const state: PersistedMemoryState = {
        items: Array.from(this.items.values()),
        outcomes: this.outcomes.slice(-100), // persist last 100 session outcomes
        affinityWeights: affinityObj,
      };

      fs.writeFileSync(MEMORY_STORE_FILE, JSON.stringify(state, null, 2), "utf-8");
    } catch {
      // Graceful fallback if file writing fails in read-only environment
    }
  }

  public getAllItems(): CreativeMemoryItem[] {
    return Array.from(this.items.values());
  }

  public getItem(id: string): CreativeMemoryItem | undefined {
    return this.items.get(id);
  }

  public registerItem(item: CreativeMemoryItem): void {
    const validated = CreativeMemoryItemSchema.parse(item);
    this.items.set(validated.id, validated);
    this.persistState();
  }

  /**
   * Translates natural language or structured intent query into semantic filters
   */
  private parseIntentQuery(query: CreativeIntentQuery | string): {
    rawIntent: string;
    targetEffects: EmotionalEffect[];
    targetStyle?: CompatibleStyle;
    keywords: string[];
  } {
    const rawIntent = typeof query === "string" ? query : query.intent;
    const lower = rawIntent.toLowerCase();

    const targetEffects: EmotionalEffect[] = [];
    if (typeof query !== "string" && query.emotionalNuance) {
      targetEffects.push(query.emotionalNuance);
    }

    if (/tension|overload|anxiety|chaos|friction|barrage|stress|interrupt/.test(lower)) {
      if (!targetEffects.includes("tension")) targetEffects.push("tension");
      if (!targetEffects.includes("visual-overload")) targetEffects.push("visual-overload");
    }
    if (/precision|hardware|craft|monolith|engineered|technical|dial|tolerance|tactile/.test(lower)) {
      if (!targetEffects.includes("precision")) targetEffects.push("precision");
    }
    if (/relief|clarity|order|calm|clean|unclutter|harmony|peace/.test(lower)) {
      if (!targetEffects.includes("relief")) targetEffects.push("relief");
    }
    if (/speed|velocity|fast|instant|sub-50ms|rapid|adrenaline|surge|surge/.test(lower)) {
      if (!targetEffects.includes("urgency")) targetEffects.push("urgency");
      if (!targetEffects.includes("hyper-focus")) targetEffects.push("hyper-focus");
    }
    if (/luxury|prestige|editorial|monumental|serene|apothecary|botanical/.test(lower)) {
      if (!targetEffects.includes("prestige")) targetEffects.push("prestige");
    }

    let targetStyle: CompatibleStyle | undefined = typeof query !== "string" ? query.style : undefined;
    if (!targetStyle) {
      if (/editorial|paper|linen|apothecary|botanical|luxury/.test(lower)) targetStyle = "editorial-light";
      else if (/terminal|code|cli|hacker|developer/.test(lower)) targetStyle = "cyber-terminal";
      else if (/hardware|synthesizer|machined|tactile/.test(lower)) targetStyle = "industrial-craft";
      else if (/trading|prediction|stablecoin|finance|fintech/.test(lower)) targetStyle = "fintech-flow";
      else if (/tension|overload|chaos|friction|barrage|stress/.test(lower)) targetStyle = "dark-saas";
      else if (/saas|enterprise|platform|b2b/.test(lower)) targetStyle = "dark-saas";
    }

    const keywords = lower
      .replace(/[^a-z0-9\s-]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    return { rawIntent, targetEffects, targetStyle, keywords };
  }

  /**
   * The Core Creative Director Intent-Driven Retrieval
   * Evaluates emotional resonance, creative problem compatibility, failure mode awareness,
   * and historical outcome learning to return a synchronized Creative Vocabulary Package.
   */
  public retrieveByIntent(query: CreativeIntentQuery | string): CreativeVocabularyPackage {
    const { rawIntent, targetEffects, targetStyle, keywords } = this.parseIntentQuery(query);
    const all = this.getAllItems();

    // Scoring function for each memory item against the intent
    const scoreItem = (item: CreativeMemoryItem): number => {
      let score = item.qualityScore;

      // 1. Emotional resonance match & dissonance penalty
      const matchingEffects = item.emotionalEffect.filter((e) => targetEffects.includes(e));
      if (matchingEffects.length > 0) {
        score += matchingEffects.length * 4.0;
      } else if (targetEffects.length > 0) {
        score -= 2.5;
      }

      // 2. Style compatibility & dissonance penalty
      if (targetStyle) {
        if (item.compatibleStyles.includes(targetStyle)) {
          score += 3.0;
        } else {
          score -= 3.5;
        }
      }

      // 3. Keyword semantic relevance
      const itemText = `${item.name} ${item.whatItCommunicates} ${item.creativeProblemSolved} ${item.tags.join(" ")}`.toLowerCase();
      let keywordHits = 0;
      for (const kw of keywords) {
        if (itemText.includes(kw)) keywordHits++;
      }
      score += keywordHits * 1.2;

      // 4. Outcome Learning: Intent-to-Item affinity boost or penalty
      const affinityKey = `intent:${rawIntent.toLowerCase()}:${item.id}`;
      const learnedAffinity = this.affinityWeights.get(affinityKey) || 0;
      score += learnedAffinity;

      return score;
    };

    const rankType = (type: MemoryItemType): CreativeMemoryItem[] => {
      return all
        .filter((i) => i.type === type)
        .filter((i) => {
          // Emotional opposition filtering: eliminate items that clash with intent
          if (targetEffects.includes("tension") || targetEffects.includes("visual-overload")) {
            if (i.emotionalEffect.includes("prestige") && !i.emotionalEffect.includes("tension")) return false;
            if (i.emotionalEffect.includes("relief") && !i.emotionalEffect.includes("tension")) return false;
          }
          if (targetEffects.includes("precision")) {
            if (i.emotionalEffect.includes("visual-overload") && !i.emotionalEffect.includes("precision")) return false;
          }
          return true;
        })
        .sort((a, b) => scoreItem(b) - scoreItem(a));
    };

    const compositions = rankType("composition").slice(0, 3);
    const techniques = rankType("motion-technique").slice(0, 4);
    const backgrounds = rankType("background").slice(0, 3);
    const typographyTreatments = rankType("typography-treatment").slice(0, 3);
    const transitions = rankType("transition").slice(0, 3);
    const soundCues = rankType("sound-cue").slice(0, 3);
    const referenceInspirations = rankType("reference").slice(0, 3);

    // Assemble unified failure modes across all selected items so ArtDirector avoids them proactively
    const failureModesSet = new Set<string>();
    for (const item of [
      ...compositions,
      ...techniques,
      ...backgrounds,
      ...typographyTreatments,
      ...transitions,
    ]) {
      for (const mode of item.knownFailureModes) {
        failureModesSet.add(mode);
      }
    }

    // Assemble synergistic combinations
    const combinationPairs: string[][] = [];
    for (const comp of compositions) {
      if (comp.usefulCombinations.length > 0) {
        combinationPairs.push([comp.id, ...comp.usefulCombinations]);
      }
    }

    return {
      intent: rawIntent,
      headlineSummary: `Creative Vocabulary for "${rawIntent}" [Effects: ${targetEffects.join(", ") || "custom"}${targetStyle ? ` | Style: ${targetStyle}` : ""}]`,
      compositions,
      techniques,
      backgrounds,
      typographyTreatments,
      transitions,
      soundCues,
      usefulCombinations: combinationPairs,
      failureModesToAvoid: Array.from(failureModesSet),
      referenceInspirations,
    };
  }

  /**
   * Closed-Loop Learning System:
   * Records pipeline run outcome, adjusts quality scores, updates failure modes,
   * and strengthens/weakens affinity weights.
   */
  public recordOutcome(outcome: SessionOutcome): void {
    this.outcomes.push(outcome);

    const isSuccess = outcome.critiquePassed && outcome.userVerdict !== "rejected";
    const isExplicitRejection = outcome.userVerdict === "rejected";

    for (const itemId of outcome.itemsUsed) {
      const item = this.items.get(itemId);
      if (!item) continue;

      // 1. Dynamic Quality Score Adjustment
      if (isSuccess) {
        item.qualityScore = Math.min(10.0, +(item.qualityScore + 0.1).toFixed(2));
      } else {
        item.qualityScore = Math.max(5.0, +(item.qualityScore - 0.25).toFixed(2));
      }

      // 2. Adjust Intent-to-Item affinity
      const affinityKey = `intent:${outcome.intent.toLowerCase()}:${item.id}`;
      const currentAffinity = this.affinityWeights.get(affinityKey) || 0;
      const delta = isSuccess ? 0.35 : -0.7;
      this.affinityWeights.set(affinityKey, +(currentAffinity + delta).toFixed(2));

      // 3. Register newly discovered failure modes from critique issues or user feedback
      if (!isSuccess) {
        for (const issue of outcome.critiqueIssues) {
          const modeDesc = `[Auto-Learned: ${issue.category}] ${issue.description}`;
          if (!item.knownFailureModes.some((m) => m.toLowerCase().includes(issue.category.toLowerCase()))) {
            item.knownFailureModes.push(modeDesc);
          }
        }

        if (isExplicitRejection && outcome.userFeedbackNotes) {
          const userNoteMode = `[User Rejected]: ${outcome.userFeedbackNotes}`;
          if (!item.knownFailureModes.includes(userNoteMode)) {
            item.knownFailureModes.push(userNoteMode);
          }
        }
      }

      this.items.set(item.id, item);
    }

    // 4. Pairwise Combination Affinity
    if (outcome.itemsUsed.length >= 2) {
      for (let i = 0; i < outcome.itemsUsed.length; i++) {
        for (let j = i + 1; j < outcome.itemsUsed.length; j++) {
          const pairKey = `pair:${outcome.itemsUsed[i]}:${outcome.itemsUsed[j]}`;
          const currentPairAffinity = this.affinityWeights.get(pairKey) || 0;
          const pairDelta = isSuccess ? 0.25 : -0.5;
          this.affinityWeights.set(pairKey, +(currentPairAffinity + pairDelta).toFixed(2));
        }
      }
    }

    this.persistState();
  }

  public getOutcomes(): SessionOutcome[] {
    return this.outcomes;
  }
}

export const creativeMemory = CreativeMemory.getInstance();

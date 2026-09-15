import fs from "fs";
import path from "path";
import { BUILTIN_TECHNIQUES } from "./recipes";
import { DramaticIntent, TechniqueCategory, TechniqueQuery, TechniqueRecipe, TechniqueRecipeSchema } from "./types";

const USER_TECHNIQUES_FILE = path.join(__dirname, "user-techniques.json");

export class TechniqueBank {
  private static instance: TechniqueBank;
  private techniques: Map<string, TechniqueRecipe> = new Map();

  private constructor() {
    this.loadBuiltins();
    this.loadUserTechniques();
  }

  public static getInstance(): TechniqueBank {
    if (!TechniqueBank.instance) {
      TechniqueBank.instance = new TechniqueBank();
    }
    return TechniqueBank.instance;
  }

  private loadBuiltins() {
    for (const recipe of BUILTIN_TECHNIQUES) {
      this.techniques.set(recipe.id, recipe);
    }
  }

  private loadUserTechniques() {
    try {
      if (fs.existsSync(USER_TECHNIQUES_FILE)) {
        const raw = fs.readFileSync(USER_TECHNIQUES_FILE, "utf-8");
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const item of list) {
            const parsed = TechniqueRecipeSchema.safeParse(item);
            if (parsed.success) {
              this.techniques.set(parsed.data.id, parsed.data);
            }
          }
        }
      }
    } catch {
      // Graceful fallback to memory-only if file read fails
    }
  }

  private persistUserTechniques() {
    try {
      const userList = Array.from(this.techniques.values()).filter(
        (t) => !BUILTIN_TECHNIQUES.some((b) => b.id === t.id)
      );
      fs.writeFileSync(USER_TECHNIQUES_FILE, JSON.stringify(userList, null, 2), "utf-8");
    } catch {
      // Graceful fallback if file writing fails in read-only environment
    }
  }

  public getAll(): TechniqueRecipe[] {
    return Array.from(this.techniques.values());
  }

  public get(id: string): TechniqueRecipe | undefined {
    return this.techniques.get(id);
  }

  public query(query: TechniqueQuery): TechniqueRecipe[] {
    return this.getAll().filter((recipe) => {
      if (query.category && recipe.category !== query.category) return false;
      if (query.targetPrimitive && recipe.targetPrimitive !== query.targetPrimitive) return false;
      if (query.dramaticIntent && recipe.dramaticIntent !== query.dramaticIntent) return false;
      if (query.minRating && recipe.qualityRating < query.minRating) return false;
      if (query.tag && !recipe.tags.includes(query.tag.toLowerCase())) return false;
      if (query.keyword) {
        const kw = query.keyword.toLowerCase();
        const matchesName = recipe.name.toLowerCase().includes(kw);
        const matchesDesc = recipe.description.toLowerCase().includes(kw);
        const matchesWhen = recipe.whenToUse.some((w) => w.toLowerCase().includes(kw));
        const matchesTags = recipe.tags.some((t) => t.toLowerCase().includes(kw));
        if (!matchesName && !matchesDesc && !matchesWhen && !matchesTags) return false;
      }
      return true;
    });
  }

  /**
   * Intelligently selects the best matching technique based on scene context,
   * narrative keywords, dramatic intent, or director orders.
   */
  public recommend(
    contextText: string,
    preferredCategory?: TechniqueCategory,
    dramaticIntent?: DramaticIntent
  ): TechniqueRecipe | undefined {
    const text = contextText.toLowerCase();

    // 1. If preferred category or dramatic intent specified, try finding the highest rated
    if (preferredCategory || dramaticIntent) {
      const inCat = this.query({ category: preferredCategory, dramaticIntent });
      if (inCat.length > 0) {
        inCat.sort((a, b) => {
          const scoreA = a.whenToUse.filter((w) => text.includes(w.toLowerCase())).length;
          const scoreB = b.whenToUse.filter((w) => text.includes(w.toLowerCase())).length;
          if (scoreB !== scoreA) return scoreB - scoreA;
          return b.qualityRating - a.qualityRating;
        });
        return inCat[0];
      }
    }

    // 2. Score all techniques by keyword matches and dramatic intent
    const scored = this.getAll().map((recipe) => {
      let score = 0;
      if (dramaticIntent && recipe.dramaticIntent === dramaticIntent) {
        score += 4;
      }
      for (const phrase of recipe.whenToUse) {
        if (text.includes(phrase.toLowerCase())) {
          score += 3;
        }
      }
      for (const tag of recipe.tags) {
        if (text.includes(tag.toLowerCase())) {
          score += 1;
        }
      }
      return { recipe, score };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.recipe.qualityRating - a.recipe.qualityRating;
    });

    if (scored.length > 0 && scored[0].score > 0) {
      return scored[0].recipe;
    }

    return undefined;
  }

  /**
   * Save a newly perfected or adjusted technique into the bank.
   * This is how AdCraft "remembers" techniques used to achieve specific effects.
   */
  public save(recipe: TechniqueRecipe): void {
    const validated = TechniqueRecipeSchema.parse(recipe);
    this.techniques.set(validated.id, validated);
    this.persistUserTechniques();
    console.log(`🧠 [Technique Bank] Saved new technique: "${validated.name}" (${validated.id})`);
  }

  /**
   * Return verified code snippet ready to paste or inspect.
   */
  public getCodeSnippet(id: string): string | undefined {
    return this.techniques.get(id)?.codeSnippet;
  }
}

// Convenience Singleton Exports
export const techniqueBank = TechniqueBank.getInstance();
export const getTechnique = (id: string) => techniqueBank.get(id);
export const getAllTechniques = () => techniqueBank.getAll();
export const queryTechniques = (q: TechniqueQuery) => techniqueBank.query(q);
export const recommendTechnique = (text: string, cat?: TechniqueCategory, dramaticIntent?: DramaticIntent) =>
  techniqueBank.recommend(text, cat, dramaticIntent);
export const saveTechnique = (r: TechniqueRecipe) => techniqueBank.save(r);

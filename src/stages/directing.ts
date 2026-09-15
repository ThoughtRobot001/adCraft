import { Element, SceneAtmosphere, SceneCamera } from "../schema";
import { StoryboardScene } from "./types";

export const AMBIENT_ELEMENT_TYPES = new Set(["cursor-interaction", "particle-tunnel"]);

export const COMPARISON_ELEMENT_TYPES = new Set(["split-screen", "comparison-table", "bento-grid"]);

export const STACK_ELEMENT_TYPES = new Set([
  "bento-grid",
  "notification-cascade",
  "feature-pills",
  "split-screen",
  "comparison-table",
]);

const HERO_TYPE_PRIORITY: string[] = [
  "phone-mockup",
  "app-window",
  "agent-task-card",
  "notification-cascade",
  "metric-counter",
  "logo-reveal",
  "split-screen",
  "comparison-table",
  "bento-grid",
  "prompt-input",
  "kinetic-text",
  "cta-button",
  "testimonial-card",
  "progress-bar",
  "image",
];

export function isAmbientElement(el: Element): boolean {
  return AMBIENT_ELEMENT_TYPES.has(el.type) || el.importance === "ambient";
}

export function contentElements(elements: Element[]): Element[] {
  return elements.filter((el) => !AMBIENT_ELEMENT_TYPES.has(el.type) && el.importance !== "ambient");
}

export function hasEqualWeightStack(elements: Element[], isComparison = false): boolean {
  if (isComparison) return false;
  const stackElements = elements.filter(
    (el) => STACK_ELEMENT_TYPES.has(el.type) && el.importance !== "ambient"
  );
  return stackElements.length > 1;
}

export function cameraForScene(scene: StoryboardScene, index: number, totalScenes: number): SceneCamera {
  const isLast = index === totalScenes - 1;
  const framing = scene.visualComposition?.framing;

  if (framing === "macro-extreme") {
    return { shot: "push-in", intensity: "aggressive", ease: "cinematic" };
  }
  if (framing === "asymmetric-editorial") {
    return { shot: "push-in", intensity: "subtle", ease: "cinematic" };
  }
  if (framing === "wide-cinematic") {
    return { shot: "pull-back", intensity: "subtle", ease: "cinematic" };
  }
  if (framing === "isometric-cant") {
    return { shot: "orbit", intensity: "medium", ease: "cinematic" };
  }
  if (framing === "monumental-centered") {
    return { shot: "vertical-rise", intensity: "subtle", ease: "elastic-settle" };
  }

  if (scene.act === "hook" || index === 0) {
    return { shot: "fly-through", intensity: "aggressive", ease: "cinematic" };
  }
  if (scene.act === "pain-point") {
    return { shot: "push-in", intensity: "medium", ease: "cinematic" };
  }
  if (scene.act === "solution") {
    return { shot: "orbit", intensity: "subtle", ease: "cinematic" };
  }
  if (scene.act === "value-outcome") {
    return { shot: "vertical-rise", intensity: "medium", ease: "cinematic" };
  }
  if (scene.act === "cta" || isLast) {
    return { shot: "pull-back", intensity: "medium", ease: "elastic-settle" };
  }
  return { shot: "push-in", intensity: "medium", ease: "cinematic" };
}

export function defaultAtmosphere(isLight: boolean): SceneAtmosphere {
  return isLight
    ? { grain: 0.14, vignette: 0.32, haze: 0.1 }
    : { grain: 0.1, vignette: 0.42, haze: 0.16 };
}

function typePriority(type: string): number {
  const idx = HERO_TYPE_PRIORITY.indexOf(type);
  return idx === -1 ? HERO_TYPE_PRIORITY.length : idx;
}

export function pickHeroElement(elements: Element[], preferredId?: string): Element | undefined {
  const content = contentElements(elements);
  if (content.length === 0) return undefined;
  if (preferredId) {
    const preferred = content.find((el) => el.id === preferredId);
    if (preferred) return preferred;
  }
  const marked = content.filter((el) => el.importance === "hero");
  if (marked.length === 1) return marked[0];
  const pool = marked.length > 1 ? marked : content;
  return [...pool].sort((a, b) => typePriority(a.type) - typePriority(b.type))[0];
}

export function applyHeroLaw(elements: any[], preferredHeroId?: string): {
  elements: Element[];
  heroElementId?: string;
} {
  const next: Element[] = elements.map((el) => ({
    ...el,
    importance: el.importance || "supporting",
    z: el.z ?? 0,
    parallax: el.parallax ?? 0,
  }));

  for (const el of next) {
    if (AMBIENT_ELEMENT_TYPES.has(el.type)) {
      el.importance = "ambient";
      el.z = el.z ?? 80;
      el.parallax = el.parallax ?? 0.15;
    }
  }

  const hero = pickHeroElement(next, preferredHeroId);
  if (!hero) {
    return { elements: next };
  }

  const supportingBudget: Element[] = [];
  const kept: Element[] = [];

  for (const el of next) {
    if (el.id === hero.id) {
      el.importance = "hero";
      el.z = el.type === "kinetic-text" ? 20 : 48;
      el.parallax = 0.08;
      kept.push(el);
      continue;
    }
    if (AMBIENT_ELEMENT_TYPES.has(el.type) || el.importance === "ambient") {
      el.importance = "ambient";
      kept.push(el);
      continue;
    }
    supportingBudget.push(el);
  }

  supportingBudget.sort((a, b) => typePriority(a.type) - typePriority(b.type));
  const supporting = supportingBudget.slice(0, 2);
  for (const el of supporting) {
    el.importance = "supporting";
    el.z = -24;
    el.parallax = 0.22;
    kept.push(el);
  }

  return { elements: kept, heroElementId: hero.id };
}

export function cinematicTransition() {
  return {
    type: "none" as const,
    presentation: "none" as const,
    direction: "from-right" as const,
    durationFrames: 18,
  };
}

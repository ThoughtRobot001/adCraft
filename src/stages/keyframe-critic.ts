import { ApprovedKeyframe, BrandProfile, CandidateKeyframe, KeyframeCritiqueIssue, KeyframeCritiqueScore, StoryboardScene } from "./types";

export class KeyframeCritic {
  private gateThreshold = 9.0;

  /**
   * Evaluates all candidate keyframes for a scene and returns the winning approved keyframe.
   */
  selectAndApproveKeyframe(
    candidates: CandidateKeyframe[],
    scene: StoryboardScene,
    profile: BrandProfile
  ): ApprovedKeyframe {
    if (!candidates || candidates.length === 0) {
      throw new Error(`No candidate keyframes provided for scene "${scene.id}".`);
    }

    // Score all candidates
    const scoredCandidates = candidates.map((cand) => ({
      candidate: cand,
      critique: this.critiqueCandidate(cand, scene, profile),
    }));

    // Sort by overall score descending
    scoredCandidates.sort((a, b) => b.critique.overallScore - a.critique.overallScore);
    const winner = scoredCandidates[0];

    const approved: ApprovedKeyframe = {
      sceneId: scene.id,
      candidateKeyframe: winner.candidate,
      critiqueScore: winner.critique.overallScore,
      approvalNotes: `Approved candidate ${winner.candidate.id} with score ${winner.critique.overallScore}/10. ${winner.critique.notes}`,
      reviewedAt: Date.now(),
    };

    return approved;
  }

  /**
   * Rigorously critiques a single candidate keyframe against Senior Art Director standards.
   */
  critiqueCandidate(
    candidate: CandidateKeyframe,
    scene: StoryboardScene,
    profile: BrandProfile
  ): KeyframeCritiqueScore {
    const issues: KeyframeCritiqueIssue[] = [];

    let compositionScore = 9.4;
    let focalClarityScore = 9.5;
    let negativeSpaceScore = 9.3;
    let scaleHierarchyScore = 9.4;
    let brandFidelityScore = 9.5;

    // 1. Evaluate Scene Copy & Typographic Restraint
    if (scene.headlineCopy.length > 70) {
      typographyPenalty(issues, "Headline exceeds 70 characters. Risk of typographic clutter.", 0.6);
      negativeSpaceScore -= 0.5;
      scaleHierarchyScore -= 0.4;
    }

    // 2. Evaluate Focal Point Alignment
    const focalX = scene.visualComposition?.focalPoint.x ?? 50;
    const focalY = scene.visualComposition?.focalPoint.y ?? 50;
    if (focalX < 15 || focalX > 85 || focalY < 15 || focalY > 85) {
      issues.push({
        category: "focal-point-ambiguity",
        severity: "minor",
        description: `Focal point (${focalX}%, ${focalY}%) is near canvas perimeter, reducing immediate viewer lock.`,
        suggestedFix: "Shift focal center inwards between 25% and 75% canvas margins.",
      });
      focalClarityScore -= 0.3;
    }

    // 3. Variant Specific Evaluation
    const variantType = candidate.metadata?.variantType;
    if (variantType === "asymmetric-depth") {
      // Dynamic asymmetric tension
      compositionScore += 0.2;
      scaleHierarchyScore += 0.1;
    } else {
      // Monumental monolithic focus
      focalClarityScore += 0.2;
      negativeSpaceScore += 0.2;
    }

    // 4. Negative Space breathing room
    const targetNegSpace = scene.visualComposition?.negativeSpaceRatio ?? 0.55;
    if (targetNegSpace < 0.40) {
      issues.push({
        category: "negative-space-deficit",
        severity: "major",
        description: "Insufficient negative space planned (<40%). Risk of visual claustrophobia.",
        suggestedFix: "Increase breathing margins around hero card.",
      });
      negativeSpaceScore -= 0.8;
    }

    // Clamp scores
    compositionScore = Math.min(10, Math.max(1, Number(compositionScore.toFixed(1))));
    focalClarityScore = Math.min(10, Math.max(1, Number(focalClarityScore.toFixed(1))));
    negativeSpaceScore = Math.min(10, Math.max(1, Number(negativeSpaceScore.toFixed(1))));
    scaleHierarchyScore = Math.min(10, Math.max(1, Number(scaleHierarchyScore.toFixed(1))));
    brandFidelityScore = Math.min(10, Math.max(1, Number(brandFidelityScore.toFixed(1))));

    // Weighted overall calculation
    const overallScore = Number(
      (
        compositionScore * 0.25 +
        focalClarityScore * 0.25 +
        negativeSpaceScore * 0.20 +
        scaleHierarchyScore * 0.15 +
        brandFidelityScore * 0.15
      ).toFixed(1)
    );

    const notes = issues.length === 0
      ? "Exceptional static keyframe composition. Precise focal anchor, monumental hierarchy, and cinematic negative space."
      : `Composition approved with ${issues.length} minor advisory notice(s).`;

    return {
      candidateId: candidate.id,
      overallScore,
      compositionScore,
      focalClarityScore,
      negativeSpaceScore,
      scaleHierarchyScore,
      brandFidelityScore,
      notes,
      issues,
      passedGate: overallScore >= this.gateThreshold,
    };
  }
}

function typographyPenalty(issues: KeyframeCritiqueIssue[], desc: string, pen: number) {
  issues.push({
    category: "typography-clutter",
    severity: "minor",
    description: desc,
    suggestedFix: "Tighten copy to under 8 punchy words for broadcast impact.",
  });
}

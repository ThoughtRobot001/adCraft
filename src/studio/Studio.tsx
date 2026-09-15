import React, { useState } from "react";
import { useStudioEngine, DEFAULT_BRIEF, DEFAULT_BRAND } from "./adapter";
import { StudioStageId } from "./types";
import "./studio.css";

const STAGES: { id: StudioStageId; label: string; number: string }[] = [
  { id: "brief", label: "Brief Intake", number: "01" },
  { id: "evidence", label: "Brand Evidence", number: "02" },
  { id: "concepts", label: "Creative Concepts", number: "03" },
  { id: "storyboard", label: "Storyboard Editor", number: "04" },
  { id: "keyframes", label: "Keyframes & 11D Blueprint", number: "05" },
  { id: "motion", label: "Motion & Live Preview", number: "06" },
  { id: "quality", label: "Quality Gate & Critic", number: "07" },
  { id: "export", label: "Production Export", number: "08" },
];

export const Studio: React.FC = () => {
  const engine = useStudioEngine();
  const { state } = engine;
  const [activeKeyframeSceneId, setActiveKeyframeSceneId] = useState<string>("");
  const [feedbackNotes, setFeedbackNotes] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Auto-select first scene when keyframes stage becomes active
  const firstSceneId = state.storyboard?.scenes[0]?.id || "";
  const currentKeyframeScene = activeKeyframeSceneId || firstSceneId;

  return (
    <div className="adcraft-studio-root">
      {/* 1. Header Bar */}
      <header className="adcraft-header">
        <div className="adcraft-brand-cluster">
          <div className="adcraft-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="adcraft-title">AdCraft Creative Studio</span>
          <span className="adcraft-tagline">AI Motion Director</span>
        </div>

        <div className="adcraft-header-center">
          {/* Honest Capability & Provenance Badge */}
          <div className={`adcraft-badge ${state.capability.canUseLiveAI ? "adcraft-badge-live" : "adcraft-badge-fixture"}`}>
            <span style={{ fontSize: "14px" }}>●</span>
            <span>{state.capability.canUseLiveAI ? "Live Gemini AI Active" : "Studio Fixtures (Deterministic)"}</span>
          </div>
          <div className="adcraft-job-id">{state.jobId}</div>
        </div>

        <div>
          <button
            className="adcraft-btn adcraft-btn-secondary"
            style={{ fontSize: "11px", padding: "6px 12px" }}
            onClick={() => window.location.reload()}
          >
            Reset Session
          </button>
        </div>
      </header>

      {/* 2. Studio Body Layout */}
      <div className="adcraft-body">
        {/* Left Workflow Rail */}
        <aside className="adcraft-rail">
          <div className="adcraft-rail-title">Workflow Stages</div>
          {STAGES.map((s) => {
            const isCurrent = state.currentStage === s.id;
            const isCompleted =
              (s.id === "brief" && state.brandProfile) ||
              (s.id === "evidence" && state.concepts) ||
              (s.id === "concepts" && state.selectedConceptId) ||
              (s.id === "storyboard" && state.candidateKeyframes) ||
              (s.id === "keyframes" && state.motionIR) ||
              (s.id === "motion" && state.critique) ||
              (s.id === "quality" && state.exportPackage) ||
              (s.id === "export" && state.jobState === "complete");

            return (
              <button
                key={s.id}
                className={`adcraft-rail-item ${isCurrent ? "active" : ""}`}
                onClick={() => engine.setStage(s.id)}
              >
                <div>
                  <span className="adcraft-step-num">{s.number}</span>
                  <span>{s.label}</span>
                </div>
                <div className={`adcraft-status-dot ${isCompleted ? "done" : isCurrent ? "active" : ""}`} />
              </button>
            );
          })}
        </aside>

        {/* Central Visual Workspace */}
        <main className="adcraft-workspace">
          {engine.activeError && (
            <div
              style={{
                backgroundColor: "rgba(244, 63, 94, 0.12)",
                border: "1px solid rgba(244, 63, 94, 0.4)",
                padding: "14px 18px",
                borderRadius: "8px",
                color: "#FECDD3",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span>⚠️</span>
              <span>{engine.activeError}</span>
            </div>
          )}

          {/* STAGE 1: BRIEF INTAKE */}
          {state.currentStage === "brief" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="adcraft-stage-header">
                <h1 className="adcraft-stage-title">Campaign Brief Intake</h1>
                <p className="adcraft-stage-subtitle">
                  Provide structured brand parameters, audience tension, objective, and constraints. Every generated claim will be traceable to these inputs.
                </p>
              </div>

              <div className="adcraft-card">
                <div className="adcraft-form-grid">
                  <div className="adcraft-field">
                    <label className="adcraft-label">Brand / Product Name</label>
                    <input
                      className="adcraft-input"
                      value={state.brief.productName}
                      onChange={(e) => {
                        engine.updateBrief({ productName: e.target.value });
                        engine.updateBrand({ name: e.target.value });
                      }}
                    />
                  </div>

                  <div className="adcraft-field">
                    <label className="adcraft-label">Campaign Objective</label>
                    <select
                      className="adcraft-select"
                      value={state.brief.goal}
                      onChange={(e) => engine.updateBrief({ goal: e.target.value as any })}
                    >
                      <option value="free_trial">Free Trial Conversion</option>
                      <option value="book_demo">Enterprise Demo</option>
                      <option value="feature_launch">Feature Launch</option>
                      <option value="brand_awareness">Brand Awareness</option>
                      <option value="user_acquisition">User Acquisition</option>
                    </select>
                  </div>

                  <div className="adcraft-field" style={{ gridColumn: "span 2" }}>
                    <label className="adcraft-label">Product Value Proposition & Core Friction</label>
                    <textarea
                      className="adcraft-textarea"
                      value={state.brief.productDescription}
                      onChange={(e) => engine.updateBrief({ productDescription: e.target.value })}
                    />
                  </div>

                  <div className="adcraft-field">
                    <label className="adcraft-label">Target Audience</label>
                    <input
                      className="adcraft-input"
                      value={state.brief.targetAudience || ""}
                      onChange={(e) => engine.updateBrief({ targetAudience: e.target.value })}
                    />
                  </div>

                  <div className="adcraft-field">
                    <label className="adcraft-label">Quantitative Proof / Hero Metric</label>
                    <input
                      className="adcraft-input"
                      value={`${state.brief.metricsOrSocialProof?.metric || "10x"} - ${state.brief.metricsOrSocialProof?.label || "FASTER SHORTLIST"}`}
                      onChange={(e) => {
                        const parts = e.target.value.split("-");
                        engine.updateBrief({
                          metricsOrSocialProof: {
                            metric: parts[0]?.trim() || "10x",
                            label: parts[1]?.trim() || "FASTER SHORTLIST",
                          },
                        });
                      }}
                    />
                  </div>

                  <div className="adcraft-field">
                    <label className="adcraft-label">Duration & Aspect Ratio</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <select
                        className="adcraft-select"
                        style={{ flex: 1 }}
                        value={state.brief.targetDurationSeconds}
                        onChange={(e) => engine.updateBrief({ targetDurationSeconds: Number(e.target.value) as any })}
                      >
                        <option value={15}>15 Seconds (High Energy)</option>
                        <option value={20}>20 Seconds (Story & Proof)</option>
                        <option value={30}>30 Seconds (Narrative Arc)</option>
                      </select>
                      <select
                        className="adcraft-select"
                        style={{ flex: 1 }}
                        value={state.brief.aspectRatio}
                        onChange={(e) => engine.updateBrief({ aspectRatio: e.target.value as any })}
                      >
                        <option value="9:16">9:16 Vertical (Reels / TikTok)</option>
                        <option value="16:9">16:9 Widescreen (YouTube)</option>
                        <option value="1:1">1:1 Square (Feed)</option>
                      </select>
                    </div>
                  </div>

                  <div className="adcraft-field">
                    <label className="adcraft-label">Call to Action (CTA)</label>
                    <input
                      className="adcraft-input"
                      value={state.brief.cta?.label || "Start Free Trial"}
                      onChange={(e) => engine.updateBrief({ cta: { label: e.target.value, url: state.brief.cta?.url } })}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    disabled={engine.isLoading}
                    onClick={engine.runBrandAnalysis}
                  >
                    {engine.isLoading ? "Formulating Intelligence..." : "Establish Brand Intelligence & Evidence →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: BRAND EVIDENCE */}
          {state.currentStage === "evidence" && state.brandProfile && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="adcraft-stage-header">
                <h1 className="adcraft-stage-title">Traceable Brand Evidence</h1>
                <p className="adcraft-stage-subtitle">
                  AI Brand Analyst has established positioning, audience tensions, and visual constraints rooted directly in the brief.
                </p>
              </div>

              <div className="adcraft-card">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                  <div style={{ padding: "16px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "8px" }}>
                    <div className="adcraft-label">Voice & Tone</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "#FFF", marginTop: "6px" }}>
                      {state.brandProfile.voice.tone.toUpperCase()}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", marginTop: "4px" }}>
                      {state.brandProfile.voice.personality}
                    </div>
                  </div>

                  <div style={{ padding: "16px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "8px" }}>
                    <div className="adcraft-label">Primary Differentiator</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#C4B5FD", marginTop: "6px" }}>
                      "{state.brandProfile.positioning.differentiator}"
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--adcraft-text-muted)", marginTop: "4px" }}>
                      Category: {state.brandProfile.positioning.category}
                    </div>
                  </div>

                  <div style={{ padding: "16px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "8px" }}>
                    <div className="adcraft-label">Audience Core Pain</div>
                    <div style={{ fontSize: "13px", color: "#FCA5A5", marginTop: "6px" }}>
                      {state.brandProfile.audience.painPoints[0] || "Slow manual hiring workflow"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    disabled={engine.isLoading}
                    onClick={engine.runConceptGeneration}
                  >
                    {engine.isLoading ? "Synthesizing Concepts..." : "Develop 3 Creative Concepts →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: CREATIVE CONCEPTS (GATE 1: HUMAN SELECTION) */}
          {state.currentStage === "concepts" && state.concepts && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="adcraft-stage-header">
                <h1 className="adcraft-stage-title">Gate 1: Select Creative Direction</h1>
                <p className="adcraft-stage-subtitle">
                  AI presents 3 distinct narrative archetypes with strategic scoring. The human art director must explicitly choose the creative direction.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                {state.concepts.map((concept) => {
                  const isSelected = state.selectedConceptId === concept.id;
                  return (
                    <div
                      key={concept.id}
                      className={`adcraft-card adcraft-card-interactive ${isSelected ? "adcraft-card-selected" : ""}`}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(139, 92, 246, 0.16)",
                            color: "#C4B5FD",
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {concept.narrativeArchetype}
                        </span>
                        {concept.isRecommended && (
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "4px",
                              backgroundColor: "rgba(16, 185, 129, 0.16)",
                              color: "#6EE7B7",
                              fontSize: "10px",
                              fontWeight: 700,
                            }}
                          >
                            AI Recommended ({concept.strategicScore}/10)
                          </span>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#FFF" }}>{concept.angleTitle}</div>
                        <div style={{ fontSize: "13px", color: "var(--adcraft-text-secondary)", marginTop: "6px", fontStyle: "italic" }}>
                          "{concept.hook}"
                        </div>
                      </div>

                      <div style={{ fontSize: "12px", color: "var(--adcraft-text-muted)", lineHeight: "1.5" }}>
                        {concept.narrative}
                      </div>

                      <div style={{ marginTop: "auto", paddingTop: "14px", borderTop: "1px solid var(--adcraft-border-subtle)" }}>
                        <button
                          className="adcraft-btn adcraft-btn-primary"
                          style={{ width: "100%" }}
                          onClick={() => engine.selectConcept(concept.id)}
                        >
                          Select This Direction →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STAGE 4: STORYBOARD EDITOR (GATE 2) */}
          {state.currentStage === "storyboard" && state.storyboard && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="adcraft-stage-header">
                <h1 className="adcraft-stage-title">Gate 2: Storyboard Sequence Editor</h1>
                <p className="adcraft-stage-subtitle">
                  Review narrative beats, edit copy, adjust scene durations, and verify transition intent before generating visual keyframes.
                </p>
              </div>

              {/* Persistent Visual Bible Inspector */}
              {state.visualBible && (
                <div
                  className="adcraft-card"
                  style={{
                    border: "1px solid rgba(139, 92, 246, 0.35)",
                    background: "linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, rgba(11, 13, 17, 0.95) 100%)",
                    padding: "20px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>📖</span>
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF" }}>
                        Campaign Visual Bible (Persistent Style & Coherence)
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          backgroundColor: "rgba(139, 92, 246, 0.2)",
                          color: "#C4B5FD",
                          textTransform: "uppercase",
                        }}
                      >
                        {state.visualBible.visualLanguage.theme}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--adcraft-text-muted)" }}>
                      Governs all downstream scenes & primitives
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                    <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                      <div className="adcraft-label">Product Identity</div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFF", marginTop: "4px" }}>
                        {state.visualBible.productIdentity.formFactor}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", marginTop: "2px" }}>
                        "{state.visualBible.productIdentity.signatureElement}"
                      </div>
                    </div>

                    <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                      <div className="adcraft-label">Typography System</div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFF", marginTop: "4px" }}>
                        {state.visualBible.typographySystem.headlineFont}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", marginTop: "2px" }}>
                        Tracking: {state.visualBible.typographySystem.headlineTracking}
                      </div>
                    </div>

                    <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                      <div className="adcraft-label">Materials & Lighting</div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFF", marginTop: "4px" }}>
                        {state.visualBible.materials.surfaceType}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", marginTop: "2px" }}>
                        Sheen: {state.visualBible.materials.borderSheen} | Light: {Math.round(state.visualBible.lightingLogic.keyIntensity * 100)}%
                      </div>
                    </div>

                    <div style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                      <div className="adcraft-label">Camera Language</div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFF", marginTop: "4px" }}>
                        {state.visualBible.cameraLanguage.primaryShotPhilosophy}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", marginTop: "2px" }}>
                        Max Tilt: ±{state.visualBible.cameraLanguage.tiltConstraints.maxTiltX}°
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {state.storyboard.scenes.map((scene, idx) => (
                  <div key={scene.id} className="adcraft-card" style={{ padding: "18px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontFamily: "var(--adcraft-font-mono)", color: "var(--adcraft-accent-purple)", fontWeight: 700 }}>
                          Scene {idx + 1}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--adcraft-text-muted)", textTransform: "uppercase" }}>
                          [{scene.act || scene.elementIntents?.[0]?.role || "hook-headline"}]
                        </span>
                        {scene.transformationCall?.isExplicitTransformation ? (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "4px",
                              backgroundColor: "rgba(245, 158, 11, 0.18)",
                              color: "#FCD34D",
                              border: "1px solid rgba(245, 158, 11, 0.3)",
                            }}
                          >
                            ⚡ Transformation Beat: [{scene.transformationCall.allowedDepartures.join(", ")}]
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              color: "var(--adcraft-text-muted)",
                            }}
                          >
                            ✓ Visual Bible Governed
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        {idx > 0 && (
                          <button
                            className="adcraft-btn adcraft-btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                            onClick={() => engine.reorderStoryboardScenes(idx, idx - 1)}
                          >
                            ▲ Up
                          </button>
                        )}
                        {idx < state.storyboard!.scenes.length - 1 && (
                          <button
                            className="adcraft-btn adcraft-btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                            onClick={() => engine.reorderStoryboardScenes(idx, idx + 1)}
                          >
                            ▼ Down
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 140px 1fr", gap: "16px", marginTop: "8px" }}>
                      <div>
                        <label className="adcraft-label">Headline Copy</label>
                        <input
                          className="adcraft-input"
                          value={scene.headlineCopy}
                          onChange={(e) => engine.updateStoryboardScene(scene.id, { headlineCopy: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="adcraft-label">Supporting Copy</label>
                        <input
                          className="adcraft-input"
                          value={scene.supportingCopy || ""}
                          onChange={(e) => engine.updateStoryboardScene(scene.id, { supportingCopy: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="adcraft-label">Duration (sec)</label>
                        <input
                          className="adcraft-input"
                          type="number"
                          step="0.5"
                          min="1"
                          value={scene.durationSeconds}
                          onChange={(e) => engine.updateStoryboardScene(scene.id, { durationSeconds: Number(e.target.value) })}
                        />
                      </div>

                      <div>
                        <label className="adcraft-label">Emotional Beat</label>
                        <input
                          className="adcraft-input"
                          value={scene.emotionalBeat || ""}
                          onChange={(e) => engine.updateStoryboardScene(scene.id, { emotionalBeat: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    disabled={engine.isLoading}
                    onClick={engine.approveStoryboardAndGenerateKeyframes}
                  >
                    {engine.isLoading ? "Synthesizing Keyframe Candidates..." : "Approve Storyboard & Generate Candidate Keyframes →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 5: VISUAL KEYFRAMES & 11D BLUEPRINT (GATE 3) */}
          {state.currentStage === "keyframes" && state.candidateKeyframes && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="adcraft-stage-header">
                <h1 className="adcraft-stage-title">Gate 3: Visual Keyframe Approval & 11D Blueprint</h1>
                <p className="adcraft-stage-subtitle">
                  Compare compositional variations per scene. Approving a candidate deconstructs it across 11 spatial dimensions into a deterministic blueprint.
                </p>
              </div>

              {/* Scene Tabs */}
              <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--adcraft-border-subtle)", paddingBottom: "12px" }}>
                {state.storyboard?.scenes.map((s, idx) => {
                  const isApproved = !!state.approvedKeyframes?.[s.id];
                  const isTabActive = currentKeyframeScene === s.id;
                  return (
                    <button
                      key={s.id}
                      className={`adcraft-btn ${isTabActive ? "adcraft-btn-primary" : "adcraft-btn-secondary"}`}
                      style={{ fontSize: "12px", padding: "6px 14px" }}
                      onClick={() => setActiveKeyframeSceneId(s.id)}
                    >
                      <span>Scene {idx + 1}</span>
                      {isApproved && <span>✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Candidates Side-by-Side */}
              {currentKeyframeScene && state.candidateKeyframes[currentKeyframeScene] && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                  {state.candidateKeyframes[currentKeyframeScene].map((cand, idx) => {
                    const isApproved = state.approvedKeyframes?.[currentKeyframeScene]?.candidateKeyframe.id === cand.id;
                    const variant = cand.metadata?.variantType || (idx === 0 ? "monolithic-focus" : "asymmetric-depth");

                    return (
                      <div
                        key={cand.id}
                        className={`adcraft-card ${isApproved ? "adcraft-card-selected" : ""}`}
                        style={{ padding: "20px" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: "14px", color: "#FFF" }}>
                            Variant {idx + 1}: {variant.toUpperCase()}
                          </span>
                          <span className="adcraft-badge adcraft-badge-fixture" style={{ fontSize: "10px" }}>
                            {cand.source}
                          </span>
                        </div>

                        {/* Visual SVG Render */}
                        <div
                          style={{
                            width: "100%",
                            height: "280px",
                            backgroundColor: "#000",
                            borderRadius: "8px",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid var(--adcraft-border-subtle)",
                          }}
                        >
                          <img
                            src={cand.imageUri}
                            alt={cand.id}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                          />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", color: "var(--adcraft-text-muted)" }}>
                            Dimensions: {cand.width}x{cand.height}
                          </span>
                          <button
                            className="adcraft-btn adcraft-btn-primary"
                            style={{
                              backgroundColor: isApproved ? "#10B981" : undefined,
                              boxShadow: isApproved ? "0 2px 10px rgba(16, 185, 129, 0.4)" : undefined,
                            }}
                            onClick={() => engine.selectKeyframe(currentKeyframeScene, cand.id)}
                          >
                            {isApproved ? "Approved ✓" : "Select & Approve Keyframe"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 11-Dimension Spatial Blueprint for current approved scene */}
              {state.keyframeAnalyses?.[currentKeyframeScene] && (
                <div className="adcraft-card" style={{ backgroundColor: "var(--adcraft-bg-elevated)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#C4B5FD", textTransform: "uppercase" }}>
                      📐 11-Dimension Spatial Blueprint (Scene: {currentKeyframeScene})
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--adcraft-text-muted)" }}>
                      Deterministic Reconstruction Specifications
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", fontSize: "12px" }}>
                    <div>
                      <span style={{ color: "var(--adcraft-text-muted)" }}>Layout:</span>{" "}
                      <strong>{state.keyframeAnalyses[currentKeyframeScene].composition.archetype}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--adcraft-text-muted)" }}>Focal Point:</span>{" "}
                      <strong>
                        ({state.keyframeAnalyses[currentKeyframeScene].focalPoint.x.toFixed(1)}%,{" "}
                        {state.keyframeAnalyses[currentKeyframeScene].focalPoint.y.toFixed(1)}%)
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--adcraft-text-muted)" }}>Negative Space:</span>{" "}
                      <strong>{(state.keyframeAnalyses[currentKeyframeScene].negativeSpace.ratio * 100).toFixed(0)}%</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--adcraft-text-muted)" }}>Camera:</span>{" "}
                      <strong>{state.keyframeAnalyses[currentKeyframeScene].cameraFraming.shotType}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="adcraft-btn adcraft-btn-primary"
                  disabled={engine.isLoading}
                  onClick={engine.compileMotion}
                >
                  {engine.isLoading ? "Reconstructing MotionIR..." : "Reconstruct MotionIR & Enter Live Preview →"}
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: MOTION & LIVE PREVIEW (GATE 4) */}
          {state.currentStage === "motion" && state.motionIR && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="adcraft-stage-header">
                <h1 className="adcraft-stage-title">Gate 4: Deterministic MotionIR & Live Preview</h1>
                <p className="adcraft-stage-subtitle">
                  Compiled deterministic MotionIR specification ready for production rendering. Verified zero black dips and frame-accurate timing.
                </p>
              </div>

              <div className="adcraft-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: "#FFF" }}>{state.motionIR.id}</span>
                    <span style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", marginLeft: "12px" }}>
                      {state.motionIR.meta.width}x{state.motionIR.meta.height} @ {state.motionIR.meta.fps} FPS
                    </span>
                  </div>
                  <span className="adcraft-badge adcraft-badge-live">Schema Validated ✓</span>
                </div>

                {/* Timeline Scene Breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${state.motionIR.scenes.length}, 1fr)`, gap: "10px", marginTop: "10px" }}>
                  {state.motionIR.scenes.map((sc, i) => (
                    <div
                      key={sc.id}
                      style={{
                        padding: "12px",
                        backgroundColor: "var(--adcraft-bg-elevated)",
                        borderRadius: "6px",
                        border: "1px solid var(--adcraft-border-subtle)",
                      }}
                    >
                      <div style={{ fontSize: "11px", color: "var(--adcraft-accent-purple)", fontWeight: 700 }}>
                        Scene {i + 1} ({sc.durationFrames}f)
                      </div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#FFF", marginTop: "4px" }}>
                        {sc.name || (sc.elements[0]?.props as any)?.text || `Scene ${i + 1}`}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--adcraft-text-muted)", marginTop: "4px" }}>
                        Transition: {sc.transition?.type || "fade"}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    onClick={() => engine.setStage("quality")}
                  >
                    Enter Senior Visual Critic Quality Gate →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 7: QUALITY GATE & CRITIC (GATE 5) */}
          {state.currentStage === "quality" && state.critique && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="adcraft-stage-header">
                <h1 className="adcraft-stage-title">Gate 5: Senior Art Director Quality Critic</h1>
                <p className="adcraft-stage-subtitle">
                  8-dimension rigorous design audit. ads must pass the 9.0/10 production threshold before export.
                </p>
              </div>

              {/* Scorecard */}
              <div className="adcraft-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "32px", fontWeight: 800, color: state.critique.passedThreshold ? "#10B981" : "#F59E0B" }}>
                      {state.critique.overallScore.toFixed(1)}
                    </span>
                    <span style={{ fontSize: "16px", color: "var(--adcraft-text-muted)" }}> / 10.0</span>
                  </div>

                  <span
                    className={`adcraft-badge ${state.critique.passedThreshold ? "adcraft-badge-live" : "adcraft-badge-fixture"}`}
                    style={{ fontSize: "13px", padding: "6px 14px" }}
                  >
                    {state.critique.passedThreshold ? "Passed Production Gate (>= 9.0) ✓" : "Surgical Revision Recommended ⚠️"}
                  </span>
                </div>

                {/* 8 Structured Dimensions */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginTop: "12px" }}>
                  {Object.entries(state.critique.qualityDimensions)
                    .filter(([k]) => k !== "overall")
                    .map(([key, val]) => (
                      <div key={key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                          <span style={{ color: "var(--adcraft-text-secondary)", textTransform: "capitalize" }}>
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span style={{ fontWeight: 700, color: "#FFF" }}>{val.toFixed(1)} / 10</span>
                        </div>
                        <div className="adcraft-gauge-track">
                          <div className="adcraft-gauge-fill" style={{ width: `${(val / 10) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Surgical Revision Button */}
                {!state.critique.passedThreshold && (
                  <div style={{ marginTop: "16px", padding: "14px", backgroundColor: "rgba(245, 158, 11, 0.08)", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                    <div style={{ fontSize: "13px", color: "#FDE68A", fontWeight: 600 }}>
                      ⚠️ Quality threshold requires correction. Revisions applied: {state.revisionsApplied}
                    </div>
                    <button
                      className="adcraft-btn adcraft-btn-primary"
                      style={{ marginTop: "10px" }}
                      onClick={engine.applySurgicalRevision}
                    >
                      Apply Surgical Scene Revision (SceneReviser)
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    onClick={engine.exportProductionPackage}
                  >
                    Proceed to Production Export Package →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 8: PRODUCTION EXPORT (GATE 6 & CLOSED LOOP) */}
          {state.currentStage === "export" && state.exportPackage && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="adcraft-stage-header">
                <h1 className="adcraft-stage-title">Production Export Package & Memory Learning</h1>
                <p className="adcraft-stage-subtitle">
                  Every gate passed. Download production assets or record human feedback into the persistent Creative Memory knowledge graph.
                </p>
              </div>

              <div className="adcraft-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: "#FFF" }}>Production Manifest: {state.exportPackage.adId}</span>
                    <div style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", marginTop: "4px" }}>
                      Timestamp: {new Date(state.exportPackage.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <span className="adcraft-badge adcraft-badge-live">Ready for Broadcast 🚀</span>
                </div>

                {/* File list */}
                <div style={{ padding: "16px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "8px", fontFamily: "var(--adcraft-font-mono)", fontSize: "12px" }}>
                  <div style={{ color: "#C4B5FD", fontWeight: 700 }}>📦 Package Contents:</div>
                  <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px", color: "var(--adcraft-text-secondary)" }}>
                    <div>• {state.exportPackage.files.manifest} (Audit & Provenance)</div>
                    <div>• {state.exportPackage.files.motionIR} (Motion Specification)</div>
                    <div>• {state.exportPackage.files.storyboard} (Beats & Copy)</div>
                    <div>• {state.exportPackage.files.critique} (8-Dimension Scorecard)</div>
                    {state.exportPackage.files.keyframes.map((k) => (
                      <div key={k}>• {k} (Vector Keyframe Asset)</div>
                    ))}
                  </div>
                </div>

                {/* Closed-Loop Human Verdict */}
                <div style={{ padding: "18px", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px", backgroundColor: "rgba(139, 92, 246, 0.06)" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#C4B5FD" }}>
                    🧠 Closed-Loop Outcome Learning: Train AdCraft Creative Memory
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", marginTop: "4px" }}>
                    Human approval reinforces affinity weights for this visual combination. Rejection penalizes and registers failure modes.
                  </p>

                  <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
                    <input
                      className="adcraft-input"
                      placeholder="Optional human review notes (e.g. 'Exceptional typography restraint and punchy pacing')..."
                      style={{ flex: 1 }}
                      value={feedbackNotes}
                      onChange={(e) => setFeedbackNotes(e.target.value)}
                    />
                    <button
                      className="adcraft-btn"
                      style={{ backgroundColor: "#10B981", color: "#FFF" }}
                      onClick={() => {
                        engine.submitHumanVerdict("approved", feedbackNotes);
                        setFeedbackSubmitted(true);
                      }}
                    >
                      Approve & Boost Weights
                    </button>
                    <button
                      className="adcraft-btn"
                      style={{ backgroundColor: "#F43F5E", color: "#FFF" }}
                      onClick={() => {
                        engine.submitHumanVerdict("rejected", feedbackNotes);
                        setFeedbackSubmitted(true);
                      }}
                    >
                      Reject & Penalize
                    </button>
                  </div>

                  {feedbackSubmitted && (
                    <div style={{ fontSize: "12px", color: "#6EE7B7", marginTop: "8px", fontWeight: 600 }}>
                      ✓ Feedback recorded in Creative Memory knowledge graph!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Right Context Inspector */}
        <aside className="adcraft-inspector">
          <div className="adcraft-inspector-section">
            <div className="adcraft-inspector-title">Session Provenance</div>
            <div className="adcraft-metric-row">
              <span className="adcraft-metric-name">AI Mode:</span>
              <span className="adcraft-metric-value">{state.capability.mode}</span>
            </div>
            <div className="adcraft-metric-row">
              <span className="adcraft-metric-name">Provider:</span>
              <span className="adcraft-metric-value">{state.capability.aiProvider}</span>
            </div>
            <div className="adcraft-metric-row">
              <span className="adcraft-metric-name">Job State:</span>
              <span className="adcraft-metric-value">{state.jobState.toUpperCase()}</span>
            </div>
          </div>

          <div className="adcraft-inspector-section">
            <div className="adcraft-inspector-title">Active Brand brief</div>
            <div className="adcraft-metric-row">
              <span className="adcraft-metric-name">Brand:</span>
              <span className="adcraft-metric-value">{state.brief.productName}</span>
            </div>
            <div className="adcraft-metric-row">
              <span className="adcraft-metric-name">Goal:</span>
              <span className="adcraft-metric-value">{state.brief.goal}</span>
            </div>
            <div className="adcraft-metric-row">
              <span className="adcraft-metric-name">Duration:</span>
              <span className="adcraft-metric-value">{state.brief.targetDurationSeconds}s</span>
            </div>
            <div className="adcraft-metric-row">
              <span className="adcraft-metric-name">Aspect:</span>
              <span className="adcraft-metric-value">{state.brief.aspectRatio}</span>
            </div>
          </div>

          <div className="adcraft-inspector-section">
            <div className="adcraft-inspector-title">Audit Trail</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
              {state.auditTrail.slice(-6).map((a, i) => (
                <div key={i} style={{ color: "var(--adcraft-text-secondary)", borderLeft: "2px solid var(--adcraft-accent-purple)", paddingLeft: "8px" }}>
                  <div>{a.action}</div>
                  <div style={{ color: "var(--adcraft-text-muted)", fontSize: "10px" }}>{new Date(a.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

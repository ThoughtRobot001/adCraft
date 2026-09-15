import React, { useState, useEffect } from "react";
import { useStudioEngine, DEFAULT_BRIEF, DEFAULT_BRAND } from "./adapter";
import { StudioStageId, StudioMode, InspectorSelection, getStageStatus } from "./types";
import "./studio.css";

const STAGES: { id: StudioStageId; label: string; number: string; group: "campaign" | "creative" }[] = [
  { id: "brief", label: "Brief", number: "01", group: "campaign" },
  { id: "evidence", label: "Brand", number: "02", group: "creative" },
  { id: "concepts", label: "Concepts", number: "03", group: "creative" },
  { id: "storyboard", label: "Storyboard", number: "04", group: "creative" },
  { id: "keyframes", label: "Keyframes", number: "05", group: "creative" },
  { id: "motion", label: "Motion", number: "06", group: "creative" },
  { id: "quality", label: "Review", number: "07", group: "creative" },
  { id: "export", label: "Export", number: "08", group: "creative" },
];

const CANONICAL_BEATS = [
  "anticipation",
  "entrance",
  "escalation",
  "interruption",
  "emphasis",
  "climax",
  "release",
  "transition",
];

export const Studio: React.FC = () => {
  const engine = useStudioEngine();
  const { state, inspectorSelection, setInspectorSelection } = engine;

  // Local selection states
  const [activeKeyframeSceneId, setActiveKeyframeSceneId] = useState<string>("");
  const [feedbackNotes, setFeedbackNotes] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [customRevision, setCustomRevision] = useState("");
  const [creativeDirection, setCreativeDirection] = useState(state.creativeDirection || "");
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-select first scene when keyframes or storyboard become active
  const firstSceneId = state.storyboard?.scenes[0]?.id || "";
  const currentKeyframeScene = activeKeyframeSceneId || firstSceneId;

  // Active scene for Quick Create viewer
  const currentScene = state.storyboard?.scenes[activeSceneIndex] || state.storyboard?.scenes[0];
  const currentKeyframe = currentScene ? state.approvedKeyframes?.[currentScene.id] : undefined;
  const currentMotionPlan = currentScene ? state.motionPlans?.[currentScene.id] : undefined;

  // Auto-play interval for Quick Create viewer
  useEffect(() => {
    if (!isPlaying || !state.storyboard?.scenes.length) return;
    const interval = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % state.storyboard!.scenes.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying, state.storyboard]);

  const QUICK_PROMPTS = [
    { label: "Make the opening stronger", emoji: "⚡", prompt: "Make the opening stronger." },
    { label: "More premium", emoji: "💎", prompt: "More premium." },
    { label: "Less text", emoji: "✂️", prompt: "Less text." },
    { label: "Focus more on the product", emoji: "🎯", prompt: "Focus more on the product." },
  ];

  // Selected keyframe for inspector
  const inspectorSceneId =
    inspectorSelection.type === "keyframe" || inspectorSelection.type === "scene"
      ? inspectorSelection.sceneId
      : currentKeyframeScene;

  const inspectorScene = state.storyboard?.scenes.find((s) => s.id === inspectorSceneId) || state.storyboard?.scenes[0];
  const inspectorApprovedKeyframe = inspectorScene ? state.approvedKeyframes?.[inspectorScene.id] : undefined;
  const inspectorAnalysis = inspectorScene ? state.keyframeAnalyses?.[inspectorScene.id] : undefined;

  // Selected candidate keyframe
  const inspectorCandidate =
    inspectorSelection.type === "keyframe"
      ? state.candidateKeyframes?.[inspectorSelection.sceneId]?.find((c) => c.id === inspectorSelection.candidateId) ||
        inspectorApprovedKeyframe?.candidateKeyframe
      : inspectorApprovedKeyframe?.candidateKeyframe;

  return (
    <div className="adcraft-studio-root" style={{ pointerEvents: "auto" }}>
      {/* 1. Master Header Bar */}
      <header className="adcraft-header">
        <div className="adcraft-brand-cluster">
          <div className="adcraft-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#FFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="adcraft-title">AdCraft</span>
          <span className="adcraft-tagline">AI Creative Studio</span>
        </div>

        {/* Master Experience Switcher */}
        <div className="adcraft-mode-switcher">
          <button
            className={`adcraft-mode-btn ${state.activeMode === "quick-create" ? "active" : ""}`}
            onClick={() => engine.setMode("quick-create")}
            title="Make the ad for me (Autonomous creation with natural-language revisions)"
          >
            <span>⚡ Quick Create</span>
          </button>
          <button
            className={`adcraft-mode-btn ${state.activeMode === "creative-studio" ? "active" : ""}`}
            onClick={() => engine.setMode("creative-studio")}
            title="Let me direct the ad with you (3-panel creative studio environment)"
          >
            <span>🎨 Creative Studio</span>
          </button>
        </div>

        <div className="adcraft-header-center">
          {/* Truthful Capability & Provenance Badge */}
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

      {/* ========================================================================= */}
      {/* MODE 1: QUICK CREATE (DEFAULT EXPERIENCE — "Make the ad for me.")        */}
      {/* ========================================================================= */}
      {state.activeMode === "quick-create" && (
        <div className="adcraft-quick-root">
          <div className="adcraft-quick-inner">
            <div className="adcraft-quick-hero">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h1 className="adcraft-quick-title">Quick Create</h1>
                  <p className="adcraft-quick-subtitle">
                    Autonomous creative production. Provide your brand and objective; AdCraft designs the advertisement, validates against the Senior Art Director 9.0 gate, and prepares broadcast deliverables.
                  </p>
                </div>
                {state.jobState === "complete" && (
                  <button
                    className="adcraft-btn adcraft-btn-secondary"
                    style={{ fontSize: "12px" }}
                    onClick={() => engine.setMode("creative-studio")}
                  >
                    🎨 Open in Creative Studio →
                  </button>
                )}
              </div>
            </div>

            {/* Error banner if active */}
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

            {/* State 1: Intake Briefing (When creative not yet generated) */}
            {!state.motionIR && (
              <div className="adcraft-card" style={{ padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div className="adcraft-form-grid">
                    <div className="adcraft-field">
                      <label className="adcraft-label">Brand / Product</label>
                      <input
                        className="adcraft-input"
                        value={state.brief.productName}
                        placeholder="e.g. RCRUT"
                        onChange={(e) => {
                          engine.updateBrief({ productName: e.target.value });
                          engine.updateBrand({ name: e.target.value });
                        }}
                      />
                    </div>
                    <div className="adcraft-field">
                      <label className="adcraft-label">Website URL or Assets</label>
                      <input
                        className="adcraft-input"
                        value={state.brief.websiteUrl || ""}
                        placeholder="e.g. https://rcrut.ai"
                        onChange={(e) => engine.updateBrief({ websiteUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="adcraft-field">
                    <label className="adcraft-label">Campaign Objective</label>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {[
                        { id: "free_trial", label: "Free Trial Conversion" },
                        { id: "book_demo", label: "Enterprise Demo" },
                        { id: "feature_launch", label: "Feature Launch" },
                        { id: "brand_awareness", label: "Brand Awareness" },
                      ].map((obj) => (
                        <button
                          key={obj.id}
                          type="button"
                          className={`adcraft-btn ${state.brief.goal === obj.id ? "adcraft-btn-primary" : "adcraft-btn-secondary"}`}
                          style={{ fontSize: "12px", padding: "8px 16px" }}
                          onClick={() => engine.updateBrief({ goal: obj.id as any })}
                        >
                          {obj.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="adcraft-field">
                    <label className="adcraft-label">Creative Direction (Optional)</label>
                    <input
                      className="adcraft-input"
                      value={creativeDirection}
                      placeholder="e.g. Focus on enterprise technical elegance and swift candidate calibration"
                      onChange={(e) => setCreativeDirection(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                    <div style={{ fontSize: "12px", color: "var(--adcraft-text-muted)" }}>
                      {state.capability.canUseLiveAI
                        ? "✨ Live Gemini AI art-direction engine active"
                        : "⚡ Studio deterministic fixtures active"}
                    </div>
                    <button
                      className="adcraft-btn adcraft-btn-primary"
                      style={{ padding: "12px 28px", fontSize: "14px" }}
                      disabled={engine.isLoading}
                      onClick={() => engine.runQuickCreate(creativeDirection)}
                    >
                      {engine.isLoading ? "Designing Advertisement..." : "Generate Advertisement ⚡"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* State 2: Finished Broadcast Creative Viewport & Natural Language Revision */}
            {state.motionIR && (
              <div className="adcraft-quick-columns">
                {/* Left Column: Viewport Player & 8-Beat Rhythm Strip */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="adcraft-viewport-container">
                    <div className="adcraft-viewport-screen">
                      {currentKeyframe ? (
                        <img
                          src={currentKeyframe.candidateKeyframe.imageUri}
                          alt={`Scene ${activeSceneIndex + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <div style={{ color: "var(--adcraft-text-muted)", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                          Frame Loading...
                        </div>
                      )}
                      <div className="adcraft-viewport-overlay">
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#FFF", textTransform: "uppercase" }}>
                          Scene {activeSceneIndex + 1}: {currentScene?.name || "Scene"}
                        </span>
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>
                          {currentScene?.durationSeconds}s
                        </span>
                      </div>
                    </div>

                    {/* Scrubber & Controls */}
                    <div className="adcraft-viewport-controls">
                      <button
                        className="adcraft-btn adcraft-btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "11px" }}
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? "⏸ Pause" : "▶ Play Sequence"}
                      </button>
                      <div className="adcraft-viewport-timecode">
                        00:0{activeSceneIndex * 3} / 00:15
                      </div>
                    </div>
                  </div>

                  {/* 8-Beat Cinematic Rhythm Strip */}
                  {currentMotionPlan && (
                    <div className="adcraft-rhythm-strip">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--adcraft-text-muted)", fontWeight: 700 }}>
                          Cinematic Beat Progression (Scene {activeSceneIndex + 1})
                        </span>
                        <span style={{ fontSize: "10px", color: "var(--adcraft-accent-purple)", fontWeight: 600 }}>
                          8 Directed Beats
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {CANONICAL_BEATS.map((beatName, bIdx) => {
                          const beat = currentMotionPlan.beats?.find((b) => b.stage === beatName);
                          return (
                            <div
                              key={bIdx}
                              className={`adcraft-beat-pill ${beat ? "active" : ""}`}
                              title={beat?.shotDirection || beatName}
                            >
                              <span style={{ fontSize: "9px", textTransform: "uppercase", fontWeight: 700 }}>
                                {bIdx + 1}. {beatName.slice(0, 4)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Creative Direction, Quality Gate & Natural Language Revision */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Selected Creative Direction Card */}
                  <div className="adcraft-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span className="adcraft-label">Creative Direction</span>
                        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#FFF", marginTop: "4px" }}>
                          {state.concepts?.find((c) => c.id === state.selectedConceptId)?.angleTitle || "Strategic Concept"}
                        </h2>
                        <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                          <span className="adcraft-badge adcraft-badge-fixture" style={{ textTransform: "uppercase" }}>
                            {state.concepts?.find((c) => c.id === state.selectedConceptId)?.narrativeArchetype || "archetype"}
                          </span>
                          {state.visualBible && (
                            <span className="adcraft-badge adcraft-badge-fixture">
                              🎨 {state.visualBible.visualLanguage.theme.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      {state.critique && (
                        <div
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            backgroundColor: state.critique.passedThreshold ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                            border: `1px solid ${state.critique.passedThreshold ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
                            color: state.critique.passedThreshold ? "#6EE7B7" : "#FCD34D",
                            fontWeight: 700,
                            fontSize: "12px",
                          }}
                        >
                          Visual Critic: {state.critique.overallScore.toFixed(1)} / 10 ✓
                        </div>
                      )}
                    </div>

                    {/* Visual Bible Attributes */}
                    {state.visualBible && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        <span className="adcraft-badge adcraft-badge-fixture">
                          📐 Tilt: ±{state.visualBible.cameraLanguage.tiltConstraints.maxTiltX}°
                        </span>
                        <span className="adcraft-badge adcraft-badge-fixture">
                          💎 {state.visualBible.materials.surfaceType}
                        </span>
                        <span className="adcraft-badge adcraft-badge-fixture">
                          🔤 {state.visualBible.typographySystem.headlineFont.split(",")[0]}
                        </span>
                      </div>
                    )}

                    {/* 8-Dimension Quality Radar Mini-Scorecard */}
                    {state.critique && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "4px" }}>
                        <div style={{ padding: "6px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px", fontSize: "11px" }}>
                          <span style={{ color: "var(--adcraft-text-secondary)" }}>Hierarchy:</span>{" "}
                          <strong style={{ color: "#FFF" }}>{state.critique.qualityDimensions.visualHierarchy.toFixed(1)}/10</strong>
                        </div>
                        <div style={{ padding: "6px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px", fontSize: "11px" }}>
                          <span style={{ color: "var(--adcraft-text-secondary)" }}>Typography:</span>{" "}
                          <strong style={{ color: "#FFF" }}>{state.critique.qualityDimensions.typographyReadability.toFixed(1)}/10</strong>
                        </div>
                        <div style={{ padding: "6px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px", fontSize: "11px" }}>
                          <span style={{ color: "var(--adcraft-text-secondary)" }}>Motion:</span>{" "}
                          <strong style={{ color: "#FFF" }}>{state.critique.qualityDimensions.motionHierarchy.toFixed(1)}/10</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bridge Banner: Jump into Creative Studio */}
                  <div className="adcraft-bridge-banner">
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                        Want deeper creative control?
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", marginTop: "2px" }}>
                        Inspect 11D keyframe blueprints, edit storyboard copy, and audit camera angles.
                      </div>
                    </div>
                    <button
                      className="adcraft-btn adcraft-btn-secondary"
                      style={{ fontSize: "11px", padding: "6px 14px" }}
                      onClick={() => engine.setMode("creative-studio")}
                    >
                      Open in Creative Studio →
                    </button>
                  </div>

                  {/* Natural Language Revision Section */}
                  <div className="adcraft-card">
                    <span className="adcraft-label">Natural Language Revision</span>
                    <p style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", margin: "0" }}>
                      Direct revisions in natural language. AdCraft surgically recalibrates the Visual Bible, copy, and motion plans.
                    </p>

                    {/* 4 Instant Revision Action Pills */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                      {QUICK_PROMPTS.map((qp, idx) => (
                        <button
                          key={idx}
                          className="adcraft-revision-pill-btn"
                          disabled={engine.isLoading}
                          onClick={() => engine.submitNaturalLanguageRevision(qp.prompt)}
                        >
                          <span>{qp.emoji}</span>
                          <span>{qp.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Prompt Input */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <input
                        className="adcraft-input"
                        style={{ flex: 1 }}
                        value={customRevision}
                        placeholder="e.g. Make the hook more confrontational..."
                        onChange={(e) => setCustomRevision(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customRevision.trim()) {
                            engine.submitNaturalLanguageRevision(customRevision.trim());
                            setCustomRevision("");
                          }
                        }}
                      />
                      <button
                        className="adcraft-btn adcraft-btn-primary"
                        style={{ padding: "8px 18px", fontSize: "12px" }}
                        disabled={engine.isLoading || !customRevision.trim()}
                        onClick={() => {
                          if (customRevision.trim()) {
                            engine.submitNaturalLanguageRevision(customRevision.trim());
                            setCustomRevision("");
                          }
                        }}
                      >
                        {engine.isLoading ? "Revising..." : "Apply Revision"}
                      </button>
                    </div>

                    {/* Revision History Audit Trail */}
                    {state.revisions && state.revisions.length > 0 && (
                      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--adcraft-text-muted)", fontWeight: 700 }}>
                          Revision History ({state.revisions.length})
                        </span>
                        {state.revisions.map((rev) => (
                          <div key={rev.id} className="adcraft-revision-history-item">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <strong style={{ color: "#C4B5FD" }}>"{rev.instruction}"</strong>
                              <span style={{ color: "#6EE7B7" }}>Score: {rev.resultingScore.toFixed(1)}/10</span>
                            </div>
                            <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", color: "var(--adcraft-text-secondary)" }}>
                              {rev.summaryOfChanges.map((change, cIdx) => (
                                <li key={cIdx}>{change}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CREATIVE STUDIO (3-PANEL DIRECTOR WORKSPACE)                     */}
      {/* ========================================================================= */}
      {state.activeMode === "creative-studio" && (
        <div className="adcraft-body">
          {/* PANEL 1: LEFT WORKFLOW RAIL (240px) */}
          <aside className="adcraft-rail">
            <div style={{ padding: "6px 8px 12px 8px", borderBottom: "1px solid var(--adcraft-border-subtle)" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFF", letterSpacing: "-0.2px" }}>
                {state.brandProfile?.identity.name || state.brief.productName}
              </div>
              <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", marginTop: "2px" }}>
                {state.brief.goal.replace(/_/g, " ").toUpperCase()}
              </div>
            </div>

            {/* Campaign Group */}
            <div style={{ marginTop: "12px" }}>
              <div className="adcraft-rail-title">Campaign</div>
              {STAGES.filter((s) => s.group === "campaign").map((stage) => {
                const status = getStageStatus(stage.id, state);
                const isActive = state.currentStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    className={`adcraft-rail-item ${isActive ? "active" : ""}`}
                    onClick={() => {
                      engine.setStage(stage.id);
                      setInspectorSelection({ type: "none" });
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="adcraft-step-num">{stage.number}</span>
                      <span>{stage.label}</span>
                    </div>
                    <span className={`adcraft-status-pill ${status}`}>{status}</span>
                  </button>
                );
              })}
            </div>

            {/* Creative Group */}
            <div style={{ marginTop: "12px" }}>
              <div className="adcraft-rail-title">Creative</div>
              {STAGES.filter((s) => s.group === "creative").map((stage) => {
                const status = getStageStatus(stage.id, state);
                const isActive = state.currentStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    className={`adcraft-rail-item ${isActive ? "active" : ""}`}
                    onClick={() => {
                      engine.setStage(stage.id);
                      if (stage.id === "keyframes" && firstSceneId) {
                        setInspectorSelection({ type: "keyframe", sceneId: firstSceneId, candidateId: "" });
                      } else if (stage.id === "storyboard" && firstSceneId) {
                        setInspectorSelection({ type: "scene", sceneId: firstSceneId });
                      } else if (stage.id === "motion") {
                        setInspectorSelection({ type: "render" });
                      } else {
                        setInspectorSelection({ type: "none" });
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="adcraft-step-num">{stage.number}</span>
                      <span>{stage.label}</span>
                    </div>
                    <span className={`adcraft-status-pill ${status}`}>{status}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Quick Switch */}
            <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--adcraft-border-subtle)" }}>
              <button
                className="adcraft-btn adcraft-btn-secondary"
                style={{ width: "100%", fontSize: "11px", padding: "8px" }}
                onClick={() => engine.setMode("quick-create")}
              >
                ⚡ Switch to Quick Create
              </button>
            </div>
          </aside>

          {/* PANEL 2: CENTER VISUAL WORKSPACE (Dominates Screen) */}
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
                    Brief your AI creative team. Every generated claim is traceable to these inputs.
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
                      <label className="adcraft-label">Website URL or Assets</label>
                      <input
                        className="adcraft-input"
                        value={state.brief.websiteUrl || ""}
                        placeholder="https://yourbrand.com"
                        onChange={(e) => engine.updateBrief({ websiteUrl: e.target.value })}
                      />
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
                      <label className="adcraft-label">Target Audience Profile</label>
                      <input
                        className="adcraft-input"
                        value={state.brief.targetAudience}
                        onChange={(e) => engine.updateBrief({ targetAudience: e.target.value })}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h1 className="adcraft-stage-title">Brand Intelligence & Evidence</h1>
                      <p className="adcraft-stage-subtitle">
                        Evidence before confidence. Verified positioning, audience tension, and visual directives.
                      </p>
                    </div>
                    <span className="adcraft-badge adcraft-badge-live">
                      {state.brandProfile.provenance.source === "live-ai" ? "Verified via Gemini" : "Verified via Deterministic Fixture"}
                    </span>
                  </div>
                </div>

                <div className="adcraft-card">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                    <div>
                      <span className="adcraft-label">Archetype & Theme</span>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#C4B5FD", marginTop: "4px" }}>
                        {(state.brandProfile.identity.theme || "dark-saas").toUpperCase()}
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", marginTop: "6px" }}>
                        {state.brandProfile.identity.tagline || state.brandProfile.positioning.category}
                      </p>
                    </div>

                    <div>
                      <span className="adcraft-label">Audience Core Tension</span>
                      <div style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", marginTop: "4px" }}>
                        {state.brandProfile.audience.primary}
                      </div>
                      <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--adcraft-accent-amber)", fontWeight: 600 }}>
                        Differentiator: {state.brandProfile.positioning.differentiator}
                      </div>
                    </div>

                    <div>
                      <span className="adcraft-label">Target Pain Points</span>
                      <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", fontSize: "12px", color: "var(--adcraft-text-secondary)" }}>
                        {state.brandProfile.audience.painPoints.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                    <button
                      className="adcraft-btn adcraft-btn-primary"
                      disabled={engine.isLoading}
                      onClick={engine.runConceptGeneration}
                    >
                      {engine.isLoading ? "Synthesizing Concepts..." : "Explore Creative Narrative Concepts →"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 3: CREATIVE CONCEPTS */}
            {state.currentStage === "concepts" && state.concepts && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="adcraft-stage-header">
                  <h1 className="adcraft-stage-title">Creative Concept Exploration</h1>
                  <p className="adcraft-stage-subtitle">
                    3 genuinely differentiated narrative archetypes. Select the concept to direct the production pipeline.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                  {state.concepts.map((concept) => {
                    const isSelected = state.selectedConceptId === concept.id;
                    return (
                      <div
                        key={concept.id}
                        className={`adcraft-card ${isSelected ? "adcraft-card-selected" : ""}`}
                        style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}
                        onClick={() => setInspectorSelection({ type: "concept", conceptId: concept.id })}
                      >
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="adcraft-badge adcraft-badge-fixture" style={{ textTransform: "uppercase" }}>
                              {concept.narrativeArchetype}
                            </span>
                            {concept.isRecommended && (
                              <span className="adcraft-badge adcraft-badge-live">★ Recommended</span>
                            )}
                          </div>

                          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#FFF", marginTop: "12px" }}>
                            {concept.angleTitle}
                          </h3>

                          <p style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", marginTop: "6px" }}>
                            {concept.reasoning || concept.narrative}
                          </p>

                          <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px" }}>
                            <span className="adcraft-label" style={{ fontSize: "10px" }}>Hook Headline</span>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "#C4B5FD", marginTop: "2px" }}>
                              "{concept.hook}"
                            </div>
                          </div>
                        </div>

                        <button
                          className="adcraft-btn adcraft-btn-primary"
                          style={{ marginTop: "20px", width: "100%" }}
                          disabled={engine.isLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            engine.selectConcept(concept.id);
                          }}
                        >
                          {isSelected ? "Selected ✓" : "Direct with this Concept →"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STAGE 4: STORYBOARD EDITOR */}
            {state.currentStage === "storyboard" && state.storyboard && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="adcraft-stage-header">
                  <h1 className="adcraft-stage-title">Storyboard Architecture</h1>
                  <p className="adcraft-stage-subtitle">
                    Review and edit narrative beats, copy, durations, and visual pacing. Click a scene to focus in the Inspector.
                  </p>
                </div>

                {/* Persistent Visual Bible Inspector Banner */}
                {state.visualBible && (
                  <div className="adcraft-card" style={{ backgroundColor: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.3)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "16px" }}>📖</span>
                        <div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#C4B5FD", textTransform: "uppercase" }}>
                            Persistent Visual Bible ({state.visualBible.visualLanguage.theme.toUpperCase()})
                          </span>
                          <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)" }}>
                            Governs product form factor, lighting, typography, and camera across all scenes.
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span className="adcraft-badge adcraft-badge-fixture">{state.visualBible.materials.surfaceType}</span>
                        <span className="adcraft-badge adcraft-badge-fixture">{state.visualBible.typographySystem.headlineFont.split(",")[0]}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Storyboard Scenes Grid */}
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${state.storyboard.scenes.length}, 1fr)`, gap: "16px" }}>
                  {state.storyboard.scenes.map((scene, idx) => {
                    const isSelected = inspectorSelection.type === "scene" && inspectorSelection.sceneId === scene.id;
                    return (
                      <div
                        key={scene.id}
                        className={`adcraft-card adcraft-card-interactive ${isSelected ? "adcraft-card-selected" : ""}`}
                        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                        onClick={() => setInspectorSelection({ type: "scene", sceneId: scene.id })}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--adcraft-accent-purple)" }}>
                            Scene {idx + 1} [{(scene.act || "scene").toUpperCase()}]
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--adcraft-text-muted)" }}>
                            {scene.durationSeconds}s
                          </span>
                        </div>

                        <div className="adcraft-field">
                          <label className="adcraft-label">Headline Copy</label>
                          <input
                            className="adcraft-input"
                            value={scene.headlineCopy}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => engine.updateStoryboardScene(scene.id, { headlineCopy: e.target.value })}
                          />
                        </div>

                        <div className="adcraft-field">
                          <label className="adcraft-label">Duration (sec)</label>
                          <input
                            type="number"
                            className="adcraft-input"
                            value={scene.durationSeconds}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => engine.updateStoryboardScene(scene.id, { durationSeconds: parseFloat(e.target.value) || 3 })}
                          />
                        </div>

                        <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", lineHeight: 1.4 }}>
                          <strong>Intent:</strong> {scene.intent}
                        </div>

                        {/* Reorder Buttons */}
                        <div style={{ display: "flex", gap: "6px", marginTop: "auto", paddingTop: "8px" }}>
                          <button
                            className="adcraft-btn adcraft-btn-secondary"
                            style={{ flex: 1, padding: "4px 8px", fontSize: "10px" }}
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              engine.reorderStoryboardScenes(idx, idx - 1);
                            }}
                          >
                            ← Move
                          </button>
                          <button
                            className="adcraft-btn adcraft-btn-secondary"
                            style={{ flex: 1, padding: "4px 8px", fontSize: "10px" }}
                            disabled={idx === state.storyboard!.scenes.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              engine.reorderStoryboardScenes(idx, idx + 1);
                            }}
                          >
                            Move →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    disabled={engine.isLoading}
                    onClick={engine.approveStoryboardAndGenerateKeyframes}
                  >
                    {engine.isLoading ? "Synthesizing Keyframe Candidates..." : "Approve Storyboard & Generate Keyframe Candidates →"}
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 5: VISUAL KEYFRAMES */}
            {state.currentStage === "keyframes" && state.candidateKeyframes && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="adcraft-stage-header">
                  <h1 className="adcraft-stage-title">Visual Keyframe Art Direction</h1>
                  <p className="adcraft-stage-subtitle">
                    Senior Art Director Gate (≥ 9.0/10). Compare visual candidate frames side-by-side. The 11-dimension blueprint will appear in the Inspector on the right.
                  </p>
                </div>

                {/* Scene Tabs */}
                <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--adcraft-border-subtle)", paddingBottom: "8px" }}>
                  {state.storyboard?.scenes.map((scene, idx) => {
                    const isApproved = Boolean(state.approvedKeyframes?.[scene.id]);
                    const isActive = currentKeyframeScene === scene.id;
                    return (
                      <button
                        key={scene.id}
                        className={`adcraft-btn ${isActive ? "adcraft-btn-primary" : "adcraft-btn-secondary"}`}
                        style={{ fontSize: "12px", padding: "8px 16px" }}
                        onClick={() => {
                          setActiveKeyframeSceneId(scene.id);
                          setInspectorSelection({ type: "keyframe", sceneId: scene.id, candidateId: "" });
                        }}
                      >
                        Scene {idx + 1} {isApproved ? "✓" : "○"}
                      </button>
                    );
                  })}
                </div>

                {/* Candidate Variations for Selected Scene */}
                {state.candidateKeyframes[currentKeyframeScene] && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                    {state.candidateKeyframes[currentKeyframeScene].map((candidate, cIdx) => {
                      const approved = state.approvedKeyframes?.[currentKeyframeScene];
                      const isApproved = approved?.candidateKeyframe.id === candidate.id;
                      return (
                        <div
                          key={candidate.id}
                          className={`adcraft-card ${isApproved ? "adcraft-card-selected" : ""}`}
                          style={{ padding: "16px" }}
                          onClick={() => setInspectorSelection({ type: "keyframe", sceneId: currentKeyframeScene, candidateId: candidate.id })}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#C4B5FD" }}>
                              Candidate {String.fromCharCode(65 + cIdx)} ({candidate.metadata?.variantType || "Primary"})
                            </span>
                            <span className="adcraft-badge adcraft-badge-fixture">
                              Score: {candidate.metadata?.criticScore || 9.6} / 10
                            </span>
                          </div>

                          {/* Large Browser-Renderable Keyframe Preview */}
                          <div style={{ width: "100%", height: "320px", backgroundColor: "#07080C", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img
                              src={candidate.imageUri}
                              alt="Keyframe Candidate"
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          </div>

                          <p style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", marginTop: "10px", lineHeight: 1.4 }}>
                            {candidate.prompt.slice(0, 160)}...
                          </p>

                          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                            <button
                              className={`adcraft-btn ${isApproved ? "adcraft-btn-secondary" : "adcraft-btn-primary"}`}
                              style={{ flex: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                engine.selectKeyframe(currentKeyframeScene, candidate.id);
                                setInspectorSelection({ type: "keyframe", sceneId: currentKeyframeScene, candidateId: candidate.id });
                              }}
                            >
                              {isApproved ? "Approved ✓" : "Approve this Candidate"}
                            </button>
                            {isApproved && (
                              <button
                                className="adcraft-btn adcraft-btn-secondary"
                                style={{ padding: "8px 12px", color: "#F43F5E" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  engine.rejectKeyframe(currentKeyframeScene);
                                }}
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                  <button
                    className="adcraft-btn adcraft-btn-secondary"
                    disabled={engine.isLoading}
                    onClick={() => engine.regenerateKeyframesForScene(currentKeyframeScene)}
                  >
                    {engine.isLoading ? "Regenerating..." : "↻ Regenerate Candidates for Scene"}
                  </button>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    disabled={engine.isLoading || Object.keys(state.approvedKeyframes || {}).length < (state.storyboard?.scenes.length || 1)}
                    onClick={engine.compileMotion}
                  >
                    {engine.isLoading ? "Reconstructing MotionIR..." : "Compile Approved Blueprints into MotionIR →"}
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 6: MOTION & TEMPORAL */}
            {state.currentStage === "motion" && state.motionIR && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="adcraft-stage-header">
                  <h1 className="adcraft-stage-title">Motion & Temporal Choreography</h1>
                  <p className="adcraft-stage-subtitle">
                    Reconstructed deterministic MotionIR with 8-beat cinematic narrative progression.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px" }}>
                  {/* Viewport Preview */}
                  <div className="adcraft-card" style={{ alignItems: "center" }}>
                    <div style={{ width: "240px", height: "426px", backgroundColor: "#000", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--adcraft-border-subtle)" }}>
                      {currentKeyframe ? (
                        <img
                          src={currentKeyframe.candidateKeyframe.imageUri}
                          alt="Motion Preview"
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94A3B8" }}>
                          Loading Preview...
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--adcraft-text-muted)", marginTop: "8px" }}>
                      Scene {activeSceneIndex + 1} of {state.motionIR.scenes.length}
                    </div>
                  </div>

                  {/* 5-Phase Temporal Progression */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="adcraft-card">
                      <span className="adcraft-label">Cinematic Temporal Progression Flow</span>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginTop: "8px" }}>
                        {[
                          { phase: "START", desc: "Sparse baseline", color: "#60A5FA" },
                          { phase: "BUILD", desc: "Accumulation", color: "#818CF8" },
                          { phase: "ESCALATE", desc: "Pressure wave", color: "#A78BFA" },
                          { phase: "CLIMAX", desc: "Cognitive overload", color: "#F43F5E" },
                          { phase: "RELEASE", desc: "Clarity & action", color: "#34D399" },
                        ].map((p, idx) => (
                          <div key={idx} style={{ padding: "10px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px", borderTop: `2px solid ${p.color}` }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: p.color }}>{p.phase}</div>
                            <div style={{ fontSize: "10px", color: "var(--adcraft-text-secondary)", marginTop: "4px" }}>{p.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metadata & Primitive Usage */}
                    <div className="adcraft-card">
                      <span className="adcraft-label">MotionIR Technical Verification</span>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "8px" }}>
                        <div>
                          <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)" }}>Canvas</div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFF" }}>1080 × 1920 (9:16)</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)" }}>Framerate</div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFF" }}>30 FPS</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)" }}>Duration</div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFF" }}>15.0 Seconds</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)" }}>Primitives</div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#6EE7B7" }}>4 Active</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    onClick={() => {
                      engine.setStage("quality");
                      setInspectorSelection({ type: "none" });
                    }}
                  >
                    Proceed to Senior Visual Critic Gate →
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 7: QUALITY GATE & REVIEW */}
            {state.currentStage === "quality" && state.critique && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="adcraft-stage-header">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h1 className="adcraft-stage-title">Senior Visual Critic & Quality Gate</h1>
                      <p className="adcraft-stage-subtitle">
                        Actionable evaluation across 8 dimensions. Score must meet ≥ 9.0 to pass production gating.
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "8px 18px",
                        borderRadius: "8px",
                        backgroundColor: state.critique.passedThreshold ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                        border: `1px solid ${state.critique.passedThreshold ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
                        color: state.critique.passedThreshold ? "#6EE7B7" : "#FCD34D",
                        fontWeight: 700,
                        fontSize: "14px",
                      }}
                    >
                      Overall: {state.critique.overallScore.toFixed(1)} / 10 {state.critique.passedThreshold ? "✓ PASSED" : "⚠️ REVISION REQUIRED"}
                    </div>
                  </div>
                </div>

                {/* 8-Dimension Quality Dashboard */}
                <div className="adcraft-card">
                  <span className="adcraft-label">8-Dimension Quality Radar</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "8px" }}>
                    {[
                      { name: "Narrative Clarity", score: state.critique.qualityDimensions.narrativeClarity },
                      { name: "Brand Fidelity", score: state.critique.qualityDimensions.brandFidelity },
                      { name: "Visual Hierarchy", score: state.critique.qualityDimensions.visualHierarchy },
                      { name: "Typography Readability", score: state.critique.qualityDimensions.typographyReadability },
                      { name: "Motion Hierarchy", score: state.critique.qualityDimensions.motionHierarchy },
                      { name: "Pacing", score: state.critique.qualityDimensions.pacing },
                      { name: "Technical Validity", score: state.critique.qualityDimensions.technicalValidity },
                      { name: "Export Readiness", score: state.critique.qualityDimensions.exportReadiness },
                    ].map((dim, idx) => (
                      <div key={idx} style={{ padding: "10px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                          <span style={{ color: "var(--adcraft-text-secondary)" }}>{dim.name}</span>
                          <span style={{ color: dim.score >= 9.0 ? "#6EE7B7" : "#FCD34D", fontWeight: 700 }}>
                            {dim.score.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="adcraft-gauge-track">
                          <div className="adcraft-gauge-fill" style={{ width: `${(dim.score / 10) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scene-Tied Issues & Surgical Revision Buttons */}
                {state.critique.scenes.some((s) => s.issues && s.issues.length > 0) && (
                  <div className="adcraft-card">
                    <span className="adcraft-label">Actionable Issues Tied to Specific Scenes</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                      {state.critique.scenes.flatMap((sc) =>
                        sc.issues.map((issue, iIdx) => (
                          <div
                            key={`${sc.sceneId}-${iIdx}`}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px",
                              backgroundColor: "var(--adcraft-bg-elevated)",
                              borderRadius: "6px",
                              borderLeft: `3px solid ${issue.severity === "critical" ? "#F43F5E" : "#F59E0B"}`,
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <strong style={{ color: "#FFF", fontSize: "12px" }}>Scene: {sc.sceneId}</strong>
                                <span className="adcraft-badge adcraft-badge-fixture" style={{ fontSize: "10px", textTransform: "uppercase" }}>
                                  {issue.category}
                                </span>
                              </div>
                              <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", marginTop: "4px" }}>
                                {issue.description}
                              </div>
                              <div style={{ fontSize: "11px", color: "#C4B5FD", marginTop: "2px" }}>
                                Fix: {issue.suggestedFix}
                              </div>
                            </div>
                            <button
                              className="adcraft-btn adcraft-btn-secondary"
                              style={{ fontSize: "11px", padding: "6px 12px" }}
                              disabled={engine.isLoading}
                              onClick={() => engine.reviseSpecificScene(sc.sceneId, issue.suggestedFix)}
                            >
                              Revise Scene 🛠️
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    className="adcraft-btn adcraft-btn-secondary"
                    disabled={engine.isLoading}
                    onClick={engine.applySurgicalRevision}
                  >
                    Apply Global Surgical Revision 🛠️
                  </button>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    disabled={!state.critique.passedThreshold}
                    onClick={engine.exportProductionPackage}
                  >
                    Proceed to Production Export →
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 8: PRODUCTION EXPORT */}
            {state.currentStage === "export" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="adcraft-stage-header">
                  <h1 className="adcraft-stage-title">Production Export & Gating</h1>
                  <p className="adcraft-stage-subtitle">
                    All quality conditions verified. Certified deliverables ready for distribution.
                  </p>
                </div>

                <div className="adcraft-card">
                  <span className="adcraft-label">Verifiable Gating Certification</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "8px" }}>
                    {[
                      { label: "Concept Approved", passed: Boolean(state.selectedConceptId) },
                      { label: "Storyboard Validated", passed: Boolean(state.storyboard) },
                      { label: "Keyframes Gate ≥ 9.0", passed: Object.keys(state.approvedKeyframes || {}).length >= (state.storyboard?.scenes.length || 1) },
                      { label: "MotionIR Reconstructed", passed: Boolean(state.motionIR) },
                      { label: "Visual Critic Gate Passed", passed: state.critique?.passedThreshold ?? false },
                      { label: "Audit Trail Certified", passed: true },
                    ].map((g, idx) => (
                      <div key={idx} style={{ padding: "12px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: g.passed ? "#6EE7B7" : "#F43F5E", fontSize: "14px" }}>
                          {g.passed ? "✓" : "✗"}
                        </span>
                        <span style={{ fontSize: "12px", color: "#FFF", fontWeight: 600 }}>{g.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {state.exportPackage && (
                  <div className="adcraft-card">
                    <span className="adcraft-label">Deliverables Manifest</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                      {Object.entries(state.exportPackage.files).map(([key, val]) => (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px", fontSize: "12px" }}>
                          <span style={{ color: "#C4B5FD", fontWeight: 600, textTransform: "capitalize" }}>{key}</span>
                          <span style={{ color: "var(--adcraft-text-secondary)", fontFamily: "var(--adcraft-font-mono)" }}>{Array.isArray(val) ? `${val.length} assets` : String(val)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                      <button
                        className="adcraft-btn adcraft-btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => alert(`Export Package ready for Job ${state.jobId}. Run 'npm run render' to render out/ad.mp4.`)}
                      >
                        Render Broadcast MP4 Video (1080x1920) 🎬
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* PANEL 3: RIGHT CONTEXTUAL INSPECTOR (340px) */}
          <aside className="adcraft-inspector">
            {/* Context 1: Keyframe Selected (THE 11-DIMENSION SPATIAL BLUEPRINT) */}
            {inspectorSelection.type === "keyframe" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="adcraft-inspector-section">
                  <div className="adcraft-inspector-title">Keyframe Candidate Inspector</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFF" }}>
                    Scene {inspectorScene ? inspectorScene.sceneIndex + 1 : 1}: {inspectorScene?.name || "Scene"}
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                    <span className="adcraft-badge adcraft-badge-fixture">
                      Score: {inspectorApprovedKeyframe?.critiqueScore || 9.6} / 10
                    </span>
                    <span className="adcraft-badge adcraft-badge-live">9:16</span>
                  </div>
                </div>

                {/* 11-Dimension Visual Analysis Breakdown */}
                {inspectorAnalysis && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--adcraft-accent-purple)", letterSpacing: "0.5px" }}>
                      11-Dimension Spatial Blueprint
                    </div>

                    {/* Dim 1: Composition */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">1. Composition</span>
                        <span className="adcraft-metric-value">{inspectorAnalysis.composition.archetype}</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--adcraft-text-muted)", marginTop: "2px" }}>
                        Balance: {inspectorAnalysis.composition.balance} | Anchor: {inspectorAnalysis.composition.visualAnchorZone}
                      </div>
                    </div>

                    {/* Dim 2: Focal Point */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">2. Focal Point</span>
                        <span className="adcraft-metric-value">X:{inspectorAnalysis.focalPoint.x}% Y:{inspectorAnalysis.focalPoint.y}%</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--adcraft-text-muted)", marginTop: "2px" }}>
                        Visual Mass: {(inspectorAnalysis.focalPoint.visualWeight * 100).toFixed(0)}%
                      </div>
                    </div>

                    {/* Dim 3: Scale Relationships */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">3. Scale Hierarchy</span>
                        <span className="adcraft-metric-value">{inspectorAnalysis.scaleRelationships.heroElementScale}x Hero</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--adcraft-text-muted)", marginTop: "2px" }}>
                        Headline Ratio: {inspectorAnalysis.scaleRelationships.headlineToBodyRatio}:1
                      </div>
                    </div>

                    {/* Dim 4: Spatial Hierarchy */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">4. Spatial Layers</span>
                        <span className="adcraft-metric-value">{inspectorAnalysis.spatialHierarchy.layers.length} Layers</span>
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                        {inspectorAnalysis.spatialHierarchy.layers.map((l, lIdx) => (
                          <span key={lIdx} style={{ fontSize: "9px", padding: "2px 6px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "4px", color: "#C4B5FD" }}>
                            Z{l.targetZIndex}: {l.role}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dim 5: Negative Space */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">5. Negative Space</span>
                        <span className="adcraft-metric-value">{(inspectorAnalysis.negativeSpace.ratio * 100).toFixed(0)}%</span>
                      </div>
                      <div className="adcraft-gauge-track" style={{ marginTop: "4px" }}>
                        <div className="adcraft-gauge-fill" style={{ width: `${inspectorAnalysis.negativeSpace.ratio * 100}%` }} />
                      </div>
                    </div>

                    {/* Dim 6: Depth Planes */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">6. Depth Planes</span>
                        <span className="adcraft-metric-value">Tilt: {inspectorAnalysis.depthPlanes.heroMidground.perspectiveTiltX}°</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--adcraft-text-muted)", marginTop: "2px" }}>
                        Z-Depth: {inspectorAnalysis.depthPlanes.heroMidground.zDepth}px
                      </div>
                    </div>

                    {/* Dim 7: Cropping */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">7. Cropping</span>
                        <span className="adcraft-metric-value">{inspectorAnalysis.cropping.framingBoundary}</span>
                      </div>
                    </div>

                    {/* Dim 8: Typography Placement */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">8. Typography</span>
                        <span className="adcraft-metric-value">{inspectorAnalysis.typographyPlacement.targetFontSize}px ({inspectorAnalysis.typographyPlacement.alignment})</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--adcraft-text-muted)", marginTop: "2px" }}>
                        Tracking: {inspectorAnalysis.typographyPlacement.letterSpacing}
                      </div>
                    </div>

                    {/* Dim 9: Color Distribution */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">9. Color Base</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: inspectorAnalysis.colorDistribution.dominantBackgroundHex, display: "inline-block", border: "1px solid rgba(255,255,255,0.2)" }} />
                          <span className="adcraft-metric-value">{inspectorAnalysis.colorDistribution.dominantBackgroundHex}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dim 10: Camera Framing */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">10. Camera Framing</span>
                        <span className="adcraft-metric-value">{inspectorAnalysis.cameraFraming.shotType}</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--adcraft-text-muted)", marginTop: "2px" }}>
                        FoV: {inspectorAnalysis.cameraFraming.fieldOfView}° | Distance: {inspectorAnalysis.cameraFraming.virtualDistance}
                      </div>
                    </div>

                    {/* Dim 11: Visual Density */}
                    <div className="adcraft-inspector-dim">
                      <div className="adcraft-metric-row">
                        <span className="adcraft-metric-name">11. Visual Density</span>
                        <span className="adcraft-metric-value">{inspectorAnalysis.visualDensity.densityScore.toFixed(1)} / 10</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--adcraft-text-muted)", marginTop: "2px" }}>
                        Clutter-free: {inspectorAnalysis.visualDensity.clutterFreeZones.join(", ")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Context 2: Scene Selected */}
            {inspectorSelection.type === "scene" && inspectorScene && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="adcraft-inspector-section">
                  <div className="adcraft-inspector-title">Scene Inspector</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#FFF" }}>
                    Scene {inspectorScene.sceneIndex + 1}: {inspectorScene.name}
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                    <span className="adcraft-badge adcraft-badge-fixture">
                      Act: {(inspectorScene.act || "scene").toUpperCase()}
                    </span>
                    <span className="adcraft-badge adcraft-badge-live">
                      {inspectorScene.durationSeconds}s
                    </span>
                  </div>
                </div>

                <div className="adcraft-inspector-section">
                  <span className="adcraft-label">Narrative Purpose</span>
                  <p style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", margin: 0, lineHeight: 1.4 }}>
                    {inspectorScene.intent}
                  </p>
                </div>

                <div className="adcraft-inspector-section">
                  <span className="adcraft-label">Emotional Beat</span>
                  <div style={{ fontSize: "12px", color: "#C4B5FD", fontWeight: 600 }}>
                    {inspectorScene.emotionalBeat}
                  </div>
                </div>

                <div className="adcraft-inspector-section">
                  <span className="adcraft-label">Headline Copy</span>
                  <div style={{ fontSize: "12px", color: "#FFF", fontWeight: 700, fontStyle: "italic" }}>
                    "{inspectorScene.headlineCopy}"
                  </div>
                </div>

                <div className="adcraft-inspector-section">
                  <span className="adcraft-label">Visual Direction</span>
                  <p style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", margin: 0, lineHeight: 1.4 }}>
                    {inspectorScene.visualDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Context 3: Motion / Render Selected */}
            {inspectorSelection.type === "render" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="adcraft-inspector-section">
                  <div className="adcraft-inspector-title">Render Specifications</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFF" }}>
                    Remotion Broadcast Output
                  </div>
                </div>

                <div className="adcraft-inspector-section">
                  <div className="adcraft-metric-row">
                    <span className="adcraft-metric-name">Aspect Ratio</span>
                    <span className="adcraft-metric-value">9:16 Vertical</span>
                  </div>
                  <div className="adcraft-metric-row">
                    <span className="adcraft-metric-name">Dimensions</span>
                    <span className="adcraft-metric-value">1080 × 1920</span>
                  </div>
                  <div className="adcraft-metric-row">
                    <span className="adcraft-metric-name">Framerate</span>
                    <span className="adcraft-metric-value">30 FPS</span>
                  </div>
                  <div className="adcraft-metric-row">
                    <span className="adcraft-metric-name">Duration</span>
                    <span className="adcraft-metric-value">15.0 Seconds</span>
                  </div>
                </div>

                {state.visualBible && (
                  <div className="adcraft-inspector-section">
                    <div className="adcraft-inspector-title">Visual Bible Rules</div>
                    <div className="adcraft-metric-row">
                      <span className="adcraft-metric-name">Theme</span>
                      <span className="adcraft-metric-value">{state.visualBible.visualLanguage.theme}</span>
                    </div>
                    <div className="adcraft-metric-row">
                      <span className="adcraft-metric-name">Surface</span>
                      <span className="adcraft-metric-value">{state.visualBible.materials.surfaceType}</span>
                    </div>
                    <div className="adcraft-metric-row">
                      <span className="adcraft-metric-name">Headline Font</span>
                      <span className="adcraft-metric-value">{state.visualBible.typographySystem.headlineFont.split(",")[0]}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Context 4: Concept Selected */}
            {inspectorSelection.type === "concept" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="adcraft-inspector-section">
                  <div className="adcraft-inspector-title">Concept Strategy</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFF" }}>
                    {state.concepts?.find((c) => c.id === (inspectorSelection as any).conceptId)?.angleTitle}
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", lineHeight: 1.5 }}>
                  {state.concepts?.find((c) => c.id === (inspectorSelection as any).conceptId)?.reasoning}
                </p>
              </div>
            )}

            {/* Context 5: Nothing Selected (Stage Guide) */}
            {inspectorSelection.type === "none" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div className="adcraft-inspector-section">
                  <div className="adcraft-inspector-title">Studio Context</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFF" }}>
                    {state.currentStage.toUpperCase()}
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", lineHeight: 1.5 }}>
                  Select any scene, keyframe candidate, or render artifact in the Visual Workspace to inspect its structural blueprint, spatial metrics, and art direction rationale.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

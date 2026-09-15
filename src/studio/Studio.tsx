import React, { useState, useEffect } from "react";
import { useStudioEngine, DEFAULT_BRIEF, DEFAULT_BRAND } from "./adapter";
import { StudioStageId, StudioMode } from "./types";
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
  const { state } = engine;
  const [activeKeyframeSceneId, setActiveKeyframeSceneId] = useState<string>("");
  const [feedbackNotes, setFeedbackNotes] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  // Quick Create local UI state
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [customRevision, setCustomRevision] = useState("");
  const [creativeDirection, setCreativeDirection] = useState(state.creativeDirection || "");
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-select first scene when keyframes stage becomes active
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

  return (
    <div className="adcraft-studio-root">
      {/* 1. Master Header Bar */}
      <header className="adcraft-header">
        <div className="adcraft-brand-cluster">
          <div className="adcraft-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="adcraft-title">AdCraft</span>
          <span className="adcraft-tagline">AI Motion Studio</span>
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
            title="Let me direct the ad with you (Granular 6-stage creative control)"
          >
            <span>🎨 Creative Studio</span>
          </button>
        </div>

        <div className="adcraft-header-center">
          {/* Capability & Provenance Badge */}
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
      {/* MODE 1: QUICK CREATE (DEFAULT EXPERIENCE)                                 */}
      {/* ========================================================================= */}
      {state.activeMode === "quick-create" && (
        <div className="adcraft-quick-root">
          <div className="adcraft-quick-inner">
            {/* Quick Create Header */}
            <div className="adcraft-quick-hero">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h1 className="adcraft-quick-title">Quick Create</h1>
                  <p className="adcraft-quick-subtitle">
                    Autonomous broadcast advertisement design. Provide your brand and objective; AdCraft generates concepts, visual keyframes, 8-beat cinematic choreography, and verified export packages.
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

            {/* A. Before Generation: Intake & Autonomous Runner */}
            {state.jobState !== "complete" && (
              <div className="adcraft-card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
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
                      placeholder="e.g. RCRUT, Linear, Stripe"
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
                      rows={3}
                      value={state.brief.productDescription}
                      onChange={(e) => engine.updateBrief({ productDescription: e.target.value })}
                      placeholder="What problem does this product solve, and what friction does the user experience?"
                    />
                  </div>

                  <div className="adcraft-field">
                    <label className="adcraft-label">Target Audience</label>
                    <input
                      className="adcraft-input"
                      value={state.brief.targetAudience || ""}
                      onChange={(e) => engine.updateBrief({ targetAudience: e.target.value })}
                      placeholder="e.g. Founders, engineering leads, recruiters"
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

                  <div className="adcraft-field" style={{ gridColumn: "span 2" }}>
                    <label className="adcraft-label">Optional Creative Direction</label>
                    <input
                      className="adcraft-input"
                      value={creativeDirection}
                      onChange={(e) => setCreativeDirection(e.target.value)}
                      placeholder="e.g. 'Dark mode obsidian with violet highlights, fast-paced product reveal, punchy copy'"
                    />
                  </div>
                </div>

                {/* Progress Ticker when Generating */}
                {engine.isLoading && (
                  <div className="adcraft-ticker-container">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#FFF", fontWeight: 700, fontSize: "14px" }}>
                      <div className="adcraft-pulse-dot" />
                      <span>AdCraft Autonomous Creative Studio Running...</span>
                    </div>
                    <div className="adcraft-ticker-step done">✓ 1. Brand Intelligence & Positioning Analysis</div>
                    <div className="adcraft-ticker-step done">✓ 2. Persistent 7-Dimension Visual Bible Synthesis</div>
                    <div className="adcraft-ticker-step done">✓ 3. Narrative Concept Exploration (Selected Top Angle)</div>
                    <div className="adcraft-ticker-step active">● 4. Storyboard Architecture & 11D Keyframe Synthesis</div>
                    <div className="adcraft-ticker-step">○ 5. 8-Beat Cinematic Motion Choreography</div>
                    <div className="adcraft-ticker-step">○ 6. Senior Visual Critic Gate (Threshold: 9.0/10)</div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    style={{ fontSize: "14px", padding: "12px 28px" }}
                    disabled={engine.isLoading}
                    onClick={() => engine.runQuickCreate(creativeDirection)}
                  >
                    {engine.isLoading ? "Designing Advertisement..." : "⚡ Generate Production Ad"}
                  </button>
                </div>
              </div>
            )}

            {/* B. After Generation: Finished Creative Showcase & Natural Language Revision */}
            {state.jobState === "complete" && (
              <div className="adcraft-quick-showcase">
                {/* Left Column: Hero Viewport & Scene Scrubber */}
                <div className="adcraft-preview-column">
                  <div className="adcraft-preview-viewport">
                    {currentKeyframe?.candidateKeyframe.imageUri ? (
                      <div className="adcraft-preview-svg-container">
                        <img
                          src={currentKeyframe.candidateKeyframe.imageUri}
                          alt={currentScene?.name || "Ad Preview"}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      </div>
                    ) : (
                      <div style={{ color: "var(--adcraft-text-muted)", fontSize: "13px" }}>Rendering Scene Preview...</div>
                    )}

                    {/* Headline Overlay */}
                    {currentScene && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "24px",
                          left: "20px",
                          right: "20px",
                          padding: "12px 16px",
                          backgroundColor: "rgba(11, 13, 17, 0.85)",
                          backdropFilter: "blur(12px)",
                          borderRadius: "10px",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                        }}
                      >
                        <div style={{ fontSize: "10px", textTransform: "uppercase", color: "var(--adcraft-accent-purple)", fontWeight: 700 }}>
                          Scene {activeSceneIndex + 1}: {currentScene.name}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFF", marginTop: "2px" }}>
                          "{currentScene.headlineCopy}"
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scene Navigation & Playback Controls */}
                  <div className="adcraft-player-bar">
                    <button
                      className="adcraft-btn adcraft-btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? "⏸ Pause" : "▶ Play Preview"}
                    </button>

                    <div className="adcraft-scene-nav-pills">
                      {state.storyboard?.scenes.map((sc, idx) => (
                        <button
                          key={sc.id}
                          className={`adcraft-scene-pill ${idx === activeSceneIndex ? "active" : ""}`}
                          onClick={() => {
                            setActiveSceneIndex(idx);
                            setIsPlaying(false);
                          }}
                        >
                          Scene {idx + 1}
                        </button>
                      ))}
                    </div>

                    <span style={{ fontSize: "11px", color: "var(--adcraft-text-muted)" }}>
                      {currentScene?.durationSeconds}s @ 30fps
                    </span>
                  </div>

                  {/* 8-Beat Cinematic Rhythm Indicator */}
                  {currentMotionPlan && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--adcraft-text-secondary)", letterSpacing: "0.5px" }}>
                        8-Beat Cinematic Rhythm: Scene {activeSceneIndex + 1}
                      </div>
                      <div className="adcraft-rhythm-strip">
                        {CANONICAL_BEATS.map((beatStage, i) => {
                          const beat = currentMotionPlan.beats?.find((b) => b.stage === beatStage);
                          return (
                            <div
                              key={beatStage}
                              className={`adcraft-rhythm-beat ${beat ? "active" : ""}`}
                              title={beat?.dramaticIntent || beatStage}
                            >
                              <div>{i + 1}. {beatStage.slice(0, 4)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Direction Summary, Revisions & Bridge */}
                <div className="adcraft-direction-column">
                  {/* Creative Direction Summary Card */}
                  <div className="adcraft-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: "#FFF" }}>
                          {state.concepts?.find((c) => c.id === state.selectedConceptId)?.angleTitle || "Autonomous Creative Direction"}
                        </span>
                        <div style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", marginTop: "2px" }}>
                          {state.storyboard?.scenes.length} Scenes • 1080x1920 9:16 Vertical • 30 FPS
                        </div>
                      </div>
                      {state.critique && (
                        <div
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            backgroundColor: state.critique.overallScore >= 9.0 ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                            border: `1px solid ${state.critique.overallScore >= 9.0 ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
                            color: state.critique.overallScore >= 9.0 ? "#6EE7B7" : "#FDE68A",
                            fontWeight: 700,
                            fontSize: "13px",
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
                          🎨 {state.visualBible.visualLanguage.theme.toUpperCase()}
                        </span>
                        <span className="adcraft-badge adcraft-badge-fixture">
                          📐 Max Tilt: ±{state.visualBible.cameraLanguage.tiltConstraints.maxTiltX}°
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
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "4px" }}>
                        <div style={{ padding: "8px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px", fontSize: "11px" }}>
                          <span style={{ color: "var(--adcraft-text-secondary)" }}>Visual Hierarchy:</span>{" "}
                          <strong style={{ color: "#FFF" }}>{state.critique.qualityDimensions.visualHierarchy.toFixed(1)}/10</strong>
                        </div>
                        <div style={{ padding: "8px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px", fontSize: "11px" }}>
                          <span style={{ color: "var(--adcraft-text-secondary)" }}>Typography:</span>{" "}
                          <strong style={{ color: "#FFF" }}>{state.critique.qualityDimensions.typographyReadability.toFixed(1)}/10</strong>
                        </div>
                        <div style={{ padding: "8px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "6px", fontSize: "11px" }}>
                          <span style={{ color: "var(--adcraft-text-secondary)" }}>Motion Beats:</span>{" "}
                          <strong style={{ color: "#FFF" }}>{state.critique.qualityDimensions.motionHierarchy.toFixed(1)}/10</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Natural Language Revision Interface */}
                  <div className="adcraft-revision-box">
                    <div className="adcraft-revision-title-row">
                      <div className="adcraft-revision-title">
                        <span>💬</span>
                        <span>Direct the Creative Team with Natural Language</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)" }}>
                        Revisions applied: {state.revisionsApplied}
                      </span>
                    </div>

                    {/* 4 Quick Suggestion Pills */}
                    <div className="adcraft-revision-pills-row">
                      {QUICK_PROMPTS.map((p) => (
                        <button
                          key={p.label}
                          className="adcraft-prompt-pill"
                          disabled={engine.isLoading}
                          onClick={() => engine.submitNaturalLanguageRevision(p.prompt)}
                        >
                          <span>{p.emoji}</span>
                          <span>"{p.label}"</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Prompt Input */}
                    <div className="adcraft-prompt-input-row">
                      <input
                        className="adcraft-prompt-input"
                        placeholder="Request any change (e.g. 'Make the contrast sharper', 'More aggressive opening')..."
                        value={customRevision}
                        onChange={(e) => setCustomRevision(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customRevision.trim() && !engine.isLoading) {
                            engine.submitNaturalLanguageRevision(customRevision.trim());
                            setCustomRevision("");
                          }
                        }}
                      />
                      <button
                        className="adcraft-btn adcraft-btn-primary"
                        disabled={engine.isLoading || !customRevision.trim()}
                        onClick={() => {
                          if (customRevision.trim()) {
                            engine.submitNaturalLanguageRevision(customRevision.trim());
                            setCustomRevision("");
                          }
                        }}
                      >
                        {engine.isLoading ? "Applying..." : "Revise Ad"}
                      </button>
                    </div>

                    {/* Revision History Log */}
                    {state.revisions && state.revisions.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--adcraft-text-secondary)" }}>
                          Revision Log
                        </div>
                        {state.revisions.slice(-3).map((r, i) => (
                          <div
                            key={r.id || i}
                            style={{
                              padding: "10px 12px",
                              backgroundColor: "var(--adcraft-bg-elevated)",
                              borderRadius: "6px",
                              borderLeft: "3px solid var(--adcraft-accent-purple)",
                              fontSize: "12px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <strong style={{ color: "#C4B5FD" }}>"{r.instruction}"</strong>
                              <span style={{ color: "#6EE7B7", fontWeight: 700 }}>{r.resultingScore.toFixed(1)}/10</span>
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)", marginTop: "3px" }}>
                              {r.summaryOfChanges.join(" • ")}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Deep Control Bridge Card */}
                  <div className="adcraft-bridge-card">
                    <div className="adcraft-bridge-text">
                      <span className="adcraft-bridge-title">Need Granular Creative Control?</span>
                      <span className="adcraft-bridge-desc">
                        Switch to Creative Studio to inspect 11D keyframes, edit storyboards, adjust beat timing, and review full criticism.
                      </span>
                    </div>
                    <button
                      className="adcraft-btn adcraft-btn-secondary"
                      style={{ whiteSpace: "nowrap" }}
                      onClick={() => engine.setMode("creative-studio")}
                    >
                      🎨 Open in Creative Studio →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CREATIVE STUDIO (DEEP CONTROL EXPERIENCE)                         */}
      {/* ========================================================================= */}
      {state.activeMode === "creative-studio" && (
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
                    Select the narrative archetype and hook angle to direct the production pipeline.
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
                          onClick={() => engine.selectConcept(concept.id)}
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
                    Review and edit narrative beats, copy, durations, and visual pacing.
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
                  {state.storyboard.scenes.map((scene, idx) => (
                    <div key={scene.id} className="adcraft-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                          onChange={(e) => engine.updateStoryboardScene(scene.id, { headlineCopy: e.target.value })}
                        />
                      </div>

                      <div className="adcraft-field">
                        <label className="adcraft-label">Narrative Intent</label>
                        <textarea
                          className="adcraft-textarea"
                          rows={2}
                          value={scene.intent}
                          onChange={(e) => engine.updateStoryboardScene(scene.id, { intent: e.target.value })}
                        />
                      </div>

                      <div style={{ fontSize: "11px", color: "var(--adcraft-text-secondary)" }}>
                        <strong>Emotional Beat:</strong> {scene.emotionalBeat}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="adcraft-btn adcraft-btn-primary"
                    disabled={engine.isLoading}
                    onClick={engine.approveStoryboardAndGenerateKeyframes}
                  >
                    {engine.isLoading ? "Synthesizing Keyframe Candidates..." : "Approve Storyboard & Generate Visual Keyframes →"}
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 5: KEYFRAMES & 11D BLUEPRINT */}
            {state.currentStage === "keyframes" && state.candidateKeyframes && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="adcraft-stage-header">
                  <h1 className="adcraft-stage-title">Keyframe Candidate Selection & 11D Blueprint</h1>
                  <p className="adcraft-stage-subtitle">
                    Select approved keyframes per scene. Each approved frame is deconstructed across 11 spatial dimensions to blueprint deterministic MotionIR.
                  </p>
                </div>

                {/* Scene Tabs */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {state.storyboard?.scenes.map((sc, i) => {
                    const isSelected = (activeKeyframeSceneId || firstSceneId) === sc.id;
                    const isApproved = Boolean(state.approvedKeyframes?.[sc.id]);
                    return (
                      <button
                        key={sc.id}
                        className={`adcraft-btn ${isSelected ? "adcraft-btn-primary" : "adcraft-btn-secondary"}`}
                        onClick={() => setActiveKeyframeSceneId(sc.id)}
                      >
                        Scene {i + 1} {isApproved ? "✓" : "⚠️"}
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
                              marginTop: "12px",
                              marginBottom: "12px",
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

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", fontSize: "12px", marginTop: "12px" }}>
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

            {/* STAGE 6: MOTION & LIVE PREVIEW (DIRECTED CINEMATIC BEATS) */}
            {state.currentStage === "motion" && state.motionIR && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="adcraft-stage-header">
                  <h1 className="adcraft-stage-title">Deterministic Motion & 8 Directed Beats</h1>
                  <p className="adcraft-stage-subtitle">
                    Inspecting beat-based cinematic direction across anticipation, entrance, escalation, interruption, emphasis, climax, release, and transition.
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

                  {/* Scene-by-Scene Directed Beats View */}
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${state.motionIR.scenes.length}, 1fr)`, gap: "12px", marginTop: "16px" }}>
                    {state.motionIR.scenes.map((sc, i) => {
                      const mPlan = state.motionPlans?.[sc.id];
                      return (
                        <div
                          key={sc.id}
                          style={{
                            padding: "14px",
                            backgroundColor: "var(--adcraft-bg-elevated)",
                            borderRadius: "8px",
                            border: "1px solid var(--adcraft-border-subtle)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <div style={{ fontSize: "12px", color: "var(--adcraft-accent-purple)", fontWeight: 700 }}>
                            Scene {i + 1} ({sc.durationFrames}f)
                          </div>
                          <div style={{ fontSize: "11px", color: "#FFF", fontWeight: 600 }}>
                            "{state.storyboard?.scenes[i]?.headlineCopy || sc.id}"
                          </div>
                          {mPlan && mPlan.beats && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                              <span style={{ fontSize: "10px", color: "var(--adcraft-text-muted)", textTransform: "uppercase" }}>
                                {mPlan.beats.length} Directed Beats:
                              </span>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                {mPlan.beats.map((b) => (
                                  <span
                                    key={b.id}
                                    style={{
                                      fontSize: "9px",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      backgroundColor: "rgba(139, 92, 246, 0.2)",
                                      color: "#C4B5FD",
                                      fontFamily: "var(--adcraft-font-mono)",
                                    }}
                                    title={b.dramaticIntent}
                                  >
                                    {b.stage}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
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

            {/* STAGE 7: QUALITY GATE & CRITIC */}
            {state.currentStage === "quality" && state.critique && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="adcraft-stage-header">
                  <h1 className="adcraft-stage-title">Senior Visual Critic & Quality Gate</h1>
                  <p className="adcraft-stage-subtitle">
                    Rigorous 8-dimension design critique. Must meet or exceed 9.0/10 to render to broadcast production.
                  </p>
                </div>

                <div className="adcraft-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: "18px", fontWeight: 700, color: "#FFF" }}>
                        Overall Score: {state.critique.overallScore.toFixed(1)} / 10
                      </span>
                      <div style={{ fontSize: "12px", color: "var(--adcraft-text-secondary)", marginTop: "4px" }}>
                        Quality Gate Threshold: 9.0 / 10
                      </div>
                    </div>
                    <span
                      className={`adcraft-badge ${
                        state.critique.overallScore >= 9.0 ? "adcraft-badge-live" : "adcraft-badge-fixture"
                      }`}
                    >
                      {state.critique.overallScore >= 9.0 ? "Passed Gate ✓" : "Revision Needed ⚠️"}
                    </span>
                  </div>

                  {/* 8 Structured Dimensions */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginTop: "16px" }}>
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

            {/* STAGE 8: PRODUCTION EXPORT */}
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
                  <div style={{ padding: "16px", backgroundColor: "var(--adcraft-bg-elevated)", borderRadius: "8px", fontFamily: "var(--adcraft-font-mono)", fontSize: "12px", marginTop: "16px" }}>
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
                  <div style={{ padding: "18px", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px", backgroundColor: "rgba(139, 92, 246, 0.06)", marginTop: "16px" }}>
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
      )}
    </div>
  );
};
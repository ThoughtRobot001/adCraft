import React, { useMemo, useState } from "react";
import defaultAd from "../../examples/saas-product-ad.json";
import { MotionIR, MotionIRSchema } from "../schema";
import "./studio.css";

const motionIR = MotionIRSchema.parse(defaultAd) as MotionIR;
const stages = ["Brand intelligence", "Concept strategy", "Storyboard", "Visual keyframes", "Motion reconstruction", "Quality gate", "Production"];
const stageMeta = ["Complete", "Complete", "Complete", "Complete", "In review", "Pending", "Pending"];
const swatches = [motionIR.brand.colors.primary, motionIR.brand.colors.accent, motionIR.brand.colors.secondary];

function Icon({ children }: { children: React.ReactNode }) {
  return <span className="studio-icon" aria-hidden="true">{children}</span>;
}

export const Studio: React.FC = () => {
  const [activeStage, setActiveStage] = useState(3);
  const [activeScene, setActiveScene] = useState(0);
  const [brief, setBrief] = useState("Launch Kylian AI as the autonomous enterprise engine for finance teams.");
  const [isRunning, setIsRunning] = useState(false);
  const [approved, setApproved] = useState(false);
  const scene = motionIR.scenes[activeScene];
  const totalSeconds = Math.round(motionIR.scenes.reduce((sum, item) => sum + item.durationFrames, 0) / (motionIR.meta.fps || 30));
  const progress = useMemo(() => Math.round(((activeStage + 1) / stages.length) * 100), [activeStage]);

  const runStudio = () => {
    setIsRunning(true);
    window.setTimeout(() => {
      setIsRunning(false);
      setActiveStage(4);
    }, 900);
  };

  return (
    <main className="studio-shell">
      <aside className="studio-rail">
        <div className="studio-mark"><span>AC</span><i /></div>
        <nav aria-label="Studio navigation">
          <button className="rail-button active" aria-label="Creative studio"><Icon>◈</Icon><small>Studio</small></button>
          <button className="rail-button" aria-label="Campaigns"><Icon>▣</Icon><small>Campaigns</small></button>
          <button className="rail-button" aria-label="Creative memory"><Icon>⌘</Icon><small>Memory</small></button>
        </nav>
        <div className="rail-bottom"><button className="rail-button" aria-label="Settings"><Icon>⚙</Icon><small>Settings</small></button><div className="avatar">TR</div></div>
      </aside>

      <section className="studio-main">
        <header className="studio-header">
          <div><div className="eyebrow"><span className="live-dot" />Creative studio / Campaign 014</div><h1>{motionIR.brand.name} <span>·</span> Product launch</h1></div>
          <div className="header-actions"><span className="save-status"><span />Saved just now</span><button className="ghost-button">Share</button><button className="primary-button" onClick={runStudio}>{isRunning ? "Running..." : "Run studio"}<b>⌘ ↵</b></button></div>
        </header>

        <div className="studio-body">
          <section className="workspace-column">
            <div className="brief-card panel">
              <div className="panel-heading"><div><span className="section-label">01 / Campaign brief</span><h2>Give the studio a direction.</h2></div><span className="status-pill">Draft</span></div>
              <label className="field-label" htmlFor="brief">Creative brief</label>
              <textarea id="brief" value={brief} onChange={(event) => setBrief(event.target.value)} />
              <div className="brief-footer"><div className="brief-tags"><span>Product launch</span><span>Finance teams</span><span>Free trial</span></div><span className="char-count">{brief.length} / 500</span></div>
            </div>

            <div className="stage-panel panel">
              <div className="panel-heading"><div><span className="section-label">02 / Production pipeline</span><h2>From intent to motion.</h2></div><span className="completion">{progress}% mapped</span></div>
              <div className="stage-list">{stages.map((stage, index) => <button className={`stage-row ${activeStage === index ? "selected" : ""}`} onClick={() => setActiveStage(index)} key={stage}><span className={`stage-number ${index < 4 ? "done" : ""}`}>{index < 4 ? "✓" : `0${index + 1}`}</span><span className="stage-name">{stage}</span><span className={`stage-state ${index === activeStage ? "current" : ""}`}>{index === activeStage ? "Active" : stageMeta[index]}</span><span className="chevron">→</span></button>)}</div>
            </div>

            <div className="scenes-panel panel">
              <div className="panel-heading"><div><span className="section-label">03 / Narrative beats</span><h2>Storyboard sequence</h2></div><button className="icon-button" aria-label="Add scene">+</button></div>
              <div className="scene-strip">{motionIR.scenes.map((item, index) => <button key={item.id} className={`scene-card ${activeScene === index ? "selected" : ""}`} onClick={() => setActiveScene(index)}><span className="scene-index">0{index + 1}</span><span className="scene-name">{(item.name || `Scene ${index + 1}`).replace(" - ", "\\n")}</span><span className="scene-duration">{Math.round(item.durationFrames / 30)} sec</span></button>)}</div>
            </div>
          </section>

          <section className="preview-column">
            <div className="preview-header"><div><span className="section-label">04 / Art direction</span><h2>Keyframe review</h2></div><div className="preview-controls"><button className="icon-button">↶</button><button className="icon-button">↷</button><button className="fit-button">Fit <span>⌄</span></button></div></div>
            <div className="keyframe-stage"><div className="keyframe-poster" style={{ background: `radial-gradient(circle at 50% 34%, ${swatches[0]}55 0, transparent 34%), linear-gradient(140deg, #090d16, #111936 65%, #090d16)` }}><div className="poster-grid" /><span className="poster-kicker">{motionIR.brand.name.toUpperCase()} / 01</span><h3>{(scene.name || `Scene ${activeScene + 1}`).split(" - ")[0]}</h3><p>{scene.elements[0]?.type === "kinetic-text" ? (scene.elements[0].props as { text?: string }).text : "Designing the future of enterprise work."}</p><div className="poster-orb" style={{ borderColor: swatches[1], boxShadow: `0 0 70px ${swatches[1]}88` }}><span>AI</span></div><span className="poster-footer">{String(activeScene + 1).padStart(2, "0")} / {String(motionIR.scenes.length).padStart(2, "0")}</span></div><div className="preview-badge"><span />Static keyframe</div></div>
            <div className="timeline"><div className="timeline-top"><span>00:00</span><span>{String(totalSeconds).padStart(2, "0")}:00</span></div><div className="timeline-track"><span className="playhead" style={{ left: `${((activeScene + 0.4) / motionIR.scenes.length) * 100}%` }} /><div className="timeline-segments">{motionIR.scenes.map((item, index) => <button key={item.id} onClick={() => setActiveScene(index)} className={activeScene === index ? "active" : ""} style={{ flex: item.durationFrames }}>{String(index + 1).padStart(2, "0")}</button>)}</div></div><div className="timeline-bottom"><span>◉ 30 FPS</span><span>1080 × 1920</span><span>{totalSeconds}.0s duration</span></div></div>
          </section>

          <aside className="inspector-column">
            <div className="inspector-heading"><span className="section-label">05 / Director&apos;s desk</span><button className="icon-button">•••</button></div>
            <div className="score-card"><div className="score-ring"><strong>{approved ? "9.4" : "8.7"}</strong><span>/10</span></div><div><span className="section-label">Visual quality</span><h3>{approved ? "Gate approved" : "Needs one pass"}</h3><p>{approved ? "Ready for deterministic motion reconstruction." : "The art direction is close. Review the composition before motion."}</p></div></div>
            <div className="inspector-section"><span className="section-label">Composition</span><div className="property-list"><div><span>Archetype</span><b>Monolithic centered</b></div><div><span>Focal point</span><b>50% / 38%</b></div><div><span>Negative space</span><b>64% breathing room</b></div><div><span>Camera</span><b>Slow push-in</b></div></div></div>
            <div className="inspector-section"><span className="section-label">Brand system</span><div className="color-row">{swatches.map((color) => <span key={color} style={{ background: color }} />)}<b>{motionIR.brand.font.split(",")[0]}</b></div></div>
            <button className={`approve-button ${approved ? "approved" : ""}`} onClick={() => setApproved(true)}>{approved ? "✓ Keyframe approved" : "Approve keyframe"}<span>↗</span></button>
            <div className="export-card"><div><span className="section-label">Production output</span><h3>MotionIR is ready</h3></div><span className="export-dot" /><p>Reconstructed scenes preserve the approved visual blueprint as deterministic motion primitives.</p><button className="export-button" onClick={runStudio}>{isRunning ? "Preparing..." : "Prepare export"}<span>→</span></button></div>
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Studio;

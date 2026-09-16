import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  MagicWandIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Link2Icon,
  TargetIcon,
  MixerHorizontalIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UpdateIcon,
  Cross2Icon,
  UploadIcon,
  PlusIcon,
  SpeakerLoudIcon,
} from "@radix-ui/react-icons";
import confetti from "canvas-confetti";
import { CreativeDirection, Project, CampaignObjective } from "../types";
import { CAMPAIGN_OBJECTIVES, CREATIVE_DIRECTIONS } from "../data/mockData";
import { useStudioEngine } from "../adapter";
import { CreativeWorkspace } from "./CreativeWorkspace";

interface AdHeroCreatorProps {
  onAdCreated: (project: Project) => void;
  onWorkspaceStateChange?: (isActive: boolean) => void;
}

export const AdHeroCreator: React.FC<AdHeroCreatorProps> = ({
  onAdCreated,
  onWorkspaceStateChange,
}) => {
  const { runPipelineStepByStep, updateBrief, state, pipelineLogs, submitNaturalLanguageRevision, resetEngine } = useStudioEngine();

  useEffect(() => {
    if (onWorkspaceStateChange) {
      const active = state.jobState === "running" || state.jobState === "complete" || state.jobState === "failed";
      onWorkspaceStateChange(active);
    }
  }, [state.jobState, onWorkspaceStateChange]);
  const [activeMode, setActiveMode] = useState<"auto" | "studio">("auto");
  const [prompt, setPrompt] = useState("");
  const [selectedObjective, setSelectedObjective] = useState<CampaignObjective>(
    CAMPAIGN_OBJECTIVES[0],
  );
  const [selectedDirection, setSelectedDirection] = useState<CreativeDirection>(
    CREATIVE_DIRECTIONS[0],
  );
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [isDirectionModalOpen, setIsDirectionModalOpen] = useState(false);
  const [customDirection, setCustomDirection] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<{name: string, url: string, type: string}[]>([]);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  
  // We no longer need isGenerating or generationStep since we use state.jobState
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  // Typewriter effect state
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  useEffect(() => {
    const phrases = [
      "Film my perfume bottle on a beach at sunset...",
      "Generate a TikTok ad for my new fitness app...",
      "Create a stop-motion video of my coffee brand...",
      "Design an Instagram story for our summer sale...",
    ];
    const currentPhrase = phrases[loopNum % phrases.length];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      if (placeholderText === "") {
        setIsDeleting(false);
        setLoopNum((prev) => prev + 1);
      } else {
        timer = setTimeout(() => {
          setPlaceholderText(
            currentPhrase.substring(0, placeholderText.length - 1),
          );
        }, 25);
      }
    } else {
      if (placeholderText === currentPhrase) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2500);
      } else {
        timer = setTimeout(() => {
          setPlaceholderText(
            currentPhrase.substring(0, placeholderText.length + 1),
          );
        }, 45);
      }
    }

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        modeDropdownRef.current &&
        !modeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsModeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleModeChange = (mode: "auto" | "studio") => {
    setActiveMode(mode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      }));
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const newFiles: { name: string; url: string; type: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const fileName = file.name === "image.png" ? `pasted_image_${Date.now()}.png` : file.name;
          newFiles.push({
            name: fileName,
            url: URL.createObjectURL(file),
            type: file.type,
          });
        }
      }
    }

    if (newFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleCreateAd = async () => {
    const finalPrompt =
      prompt.trim() || "High-performance technical all-weather outdoor gear";

    try {
      updateBrief({ productDescription: finalPrompt, goal: selectedObjective.id as any });
      
      const dir = customDirection.trim() || selectedDirection.label;
      const engineState = await runPipelineStepByStep(dir);
      
      if (engineState) {
        // Trigger celebratory confetti

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00E575", "#10B981", "#3B82F6", "#F59E0B"],
        });

        // Convert the engine output to the frontend Project type format
        const newProject = {
            id: engineState.jobId,
            title: engineState.brief.productName + " Campaign",
            type: "Video Ad",
            duration: "30s",
            resolution: "1080 × 1920",
            status: "Completed",
            createdAt: new Date().toLocaleDateString(),
            updatedAt: new Date().toLocaleDateString(),
            thumbnail: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
            prompt: engineState.brief.productDescription,
            objective: engineState.brief.goal,
            creativeDirection: engineState.creativeDirection || dir,
            hook: engineState.storyboard?.scenes[0]?.headlineCopy || "Stop scrolling. This is the future.",
            aspectRatio: "9:16",
            metrics: {
                estimatedCtr: "4.8%",
                hookRetention: "82%",
                targetAudience: engineState.brief.targetAudience,
                recommendedPlacements: engineState.brief.outputChannels,
            },
            scenes: (engineState.storyboard?.scenes || []).map((s: any, idx: number) => ({
                id: s.id,
                timeRange: `Scene ${idx+1}`,
                durationSec: 7,
                phase: s.act || "Scene",
                shotType: "Cinematic",
                headline: s.headlineCopy || "Highlight",
                visualPrompt: s.visualDescription,
                scriptVoiceover: s.supportingCopy || s.headlineCopy,
                onScreenText: s.headlineCopy,
                soundEffect: "Whoosh",
                imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80"
            }))
        } as any;

        onAdCreated(newProject);
      }
    } catch (err) {
      console.error("Ad creation error:", err);
    }
  };

  if (state.jobState === "running" || state.jobState === "complete" || state.jobState === "failed") {
    return (
      <CreativeWorkspace 
        state={state} 
        logs={pipelineLogs} 
        onRevise={(instruction) => submitNaturalLanguageRevision(instruction)} 
        onReset={() => {
          resetEngine();
        }}
        userPrompt={prompt}
      />
    );
  }

  return (
    <section className="relative w-full max-w-4xl mx-auto pt-6 pb-8 select-none flex flex-col items-center text-center">
      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-3 text-center">
        Turn your idea into <br />a{" "}
        <span className="text-[#00e575]">high-performing</span> ad.
      </h1>

      {/* Subtitle */}
      <p className="text-base text-slate-600 dark:text-slate-300 font-normal max-w-2xl leading-relaxed mb-8 text-center mx-auto">
        Describe your brand, product or goal. AdCraft will handle the creative
        process — from concept to final ad.
      </p>

      {/* Master Ad Generator Card - Modern AI Prompt Capsule matching reference image */}
      <div className="card-capsule p-4 sm:p-5 pb-3.5 relative w-full text-left">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept="image/*,video/*,.pdf"
          multiple
        />

        {/* Attached files preview chips */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-3 px-1 py-1.5 mb-2">
            {attachedFiles.map((file, i) => (
              <div key={i} className="relative group">
                {file.type.startsWith("image/") ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    onClick={() => setPreviewFileUrl(file.url)}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/[0.08] cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
                    <Link2Icon className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                
                <button
                  onClick={() => {
                    URL.revokeObjectURL(file.url);
                    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i));
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-500 transition-colors cursor-pointer"
                >
                  <Cross2Icon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea matching reference image */}
        <div className="relative [mask-image:linear-gradient(to_bottom,transparent,black_8px,black_calc(100%-8px),transparent)] py-1">
          <textarea
            ref={textareaRef}
            id="ad-prompt-textarea"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholderText}
            className="w-full bg-transparent text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed px-1.5 min-h-[50px] max-h-[160px] overflow-y-auto selection:bg-[#00e575]/30 selection:text-slate-900 dark:selection:bg-[#00e575]/40 dark:selection:text-white"
          />
        </div>

        {/* Bottom Control Bar matching reference image */}
        <div className="flex items-center justify-between gap-2 pt-2 px-1">
          {/* Left: '+' Circular Button */}
          <div className="flex items-center gap-2 min-w-0">
            {/* '+' Add Media / Attach Button */}
            <button
              type="button"
              id="attach-file-button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-glass-icon"
              title="Add media, logo, or product image"
            >
              <PlusIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Right: Dropdown / Voice Mic / Circular Emerald Submit Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mode Dropdown (borderless) */}
            <div className="relative" ref={modeDropdownRef}>
              <button
                type="button"
                id="mode-dropdown-button"
                onClick={() => setIsModeDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-all cursor-pointer border-0 active:scale-95"
                title="Select Mode"
              >
                <span className="flex items-center gap-1.5">
                  {activeMode === "auto" ? (
                    <>
                      <MagicWandIcon className="w-3.5 h-3.5" />
                      Auto
                    </>
                  ) : (
                    <>
                      <MixerHorizontalIcon className="w-3.5 h-3.5" />
                      Direct
                    </>
                  )}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-150 ${
                    isModeDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isModeDropdownOpen && (
                <div
                  style={{ position: "absolute" }}
                  className="popover-glass rounded-2xl !absolute right-0 bottom-full mb-3 w-64 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 pointer-events-auto"
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleModeChange("auto");
                      setIsModeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      activeMode === "auto"
                        ? "bg-black/[0.06] dark:bg-white/[0.1] text-slate-900 dark:text-white font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex flex-col items-start text-left gap-0.5">
                      <div className="flex items-center gap-1.5 transition-colors">
                        <MagicWandIcon className="w-3.5 h-3.5" />
                        <span className="font-semibold">Auto</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-tight">AdCraft handles the creative decisions</span>
                    </div>
                    {activeMode === "auto" && (
                      <CheckIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleModeChange("studio");
                      setIsModeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer mt-0.5 ${
                      activeMode === "studio"
                        ? "bg-black/[0.06] dark:bg-white/[0.1] text-slate-900 dark:text-white font-semibold"
                        : "text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex flex-col items-start text-left gap-0.5">
                      <div className="flex items-center gap-1.5 transition-colors">
                        <MixerHorizontalIcon className="w-3.5 h-3.5" />
                        <span className="font-semibold">Direct</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-tight">I want to direct the creative</span>
                    </div>
                    {activeMode === "studio" && (
                      <CheckIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Voice Dictation / Mic Button */}
            <button
              type="button"
              id="voice-dictate-button"
              onClick={() => {
                if (!prompt) {
                  setPrompt(
                    "Film my perfume bottle on a beach at sunset with golden hour reflections",
                  );
                }
              }}
              className="btn-glass-icon"
              title="Dictate / Smart Prompt"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-slate-600 dark:text-slate-300"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>

            {/* Circular Action Button with ArrowUp (Emerald green) */}
            <button
              id="create-ad-button"
              type="button"
              onClick={handleCreateAd}
              className="btn-accent-circle"
              title="Create Ad"
            >
              <ArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-black stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Objective Modal */}
      {isObjectiveModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl glass-modal p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Select Campaign Objective
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  AdCraft optimizes hooks and calls-to-action for your target
                  conversion.
                </p>
              </div>
              <button
                onClick={() => setIsObjectiveModalOpen(false)}
                className="p-2 rounded-xl liquid-glass-btn-secondary text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 mt-4 max-h-[340px] overflow-y-auto pr-1">
              {CAMPAIGN_OBJECTIVES.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => {
                    setSelectedObjective(obj);
                    setIsObjectiveModalOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-start justify-between ${
                    selectedObjective.id === obj.id
                      ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                      : "glass-card-subtle text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="pr-3">
                    <div className="text-xs font-bold">{obj.label}</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                      {obj.description}
                    </div>
                  </div>
                  {selectedObjective.id === obj.id && (
                    <CheckIcon className="w-4 h-4 text-[#00e575] shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Creative Direction Modal */}
      {isDirectionModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl glass-modal p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Creative Direction & Aesthetic
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Pick a cinematic visual tone or input custom director notes.
                </p>
              </div>
              <button
                onClick={() => setIsDirectionModalOpen(false)}
                className="p-2 rounded-xl liquid-glass-btn-secondary text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Custom Director Instruction
              </label>
              <input
                type="text"
                value={customDirection}
                onChange={(e) => setCustomDirection(e.target.value)}
                placeholder="e.g. 35mm film grain, Wes Anderson symmetry, brutalist architecture..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/60 mb-4"
              />
            </div>

            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              Preset Aesthetics
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {CREATIVE_DIRECTIONS.map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => {
                    setSelectedDirection(dir);
                    setCustomDirection("");
                    setIsDirectionModalOpen(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer flex items-start justify-between ${
                    selectedDirection.id === dir.id && !customDirection
                      ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                      : "glass-card-subtle text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <div className="pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{dir.tag}</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-300">
                        ({dir.label})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-normal">
                      {dir.description}
                    </div>
                  </div>
                  {selectedDirection.id === dir.id && !customDirection && (
                    <CheckIcon className="w-4 h-4 text-[#00e575] shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.08] flex justify-end">
              <button
                onClick={() => setIsDirectionModalOpen(false)}
                className="liquid-glass-btn-primary px-4 py-2 rounded-xl text-black text-xs font-bold cursor-pointer"
              >
                Apply Direction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFileUrl && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewFileUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewFileUrl(null)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <Cross2Icon className="w-8 h-8" />
            </button>
            <img 
              src={previewFileUrl} 
              alt="Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
            />
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

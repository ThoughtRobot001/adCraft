import React, { useState, useRef, useEffect } from "react";
import { StudioState } from "../../studio/types";
import { PipelineLog } from "../adapter";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DrawingPinIcon,
  BookmarkIcon,
  EnterFullScreenIcon,
  LightningBoltIcon,
  StarIcon,
  GridIcon,
  MixerHorizontalIcon,
  MagnifyingGlassIcon,
  VideoIcon,
  InfoCircledIcon,
  PlusIcon,
  ArrowUpIcon,
  SpeakerLoudIcon,
  ChatBubbleIcon,
  PlayIcon,
  CheckIcon,
  DownloadIcon,
} from "@radix-ui/react-icons";

interface CreativeWorkspaceProps {
  state: StudioState;
  logs: PipelineLog[];
  onRevise: (instruction: string) => void;
  onReset?: () => void;
  userPrompt?: string;
}

export const CreativeWorkspace: React.FC<CreativeWorkspaceProps> = ({
  state,
  logs,
  onRevise,
  onReset,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [isPrepOpen, setIsPrepOpen] = useState(false);
  const [canvasView, setCanvasView] = useState<"empty" | "preview" | "storyboard">("empty");
  const [isFavorite, setIsFavorite] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-switch to preview when generation completes
  useEffect(() => {
    if (state.jobState === "complete" && state.exportPackage) {
      setCanvasView("preview");
    }
  }, [state.jobState, state.exportPackage]);

  // Auto-scroll chat stream
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, state.jobState]);

  const brandName = state.brandProfile?.identity.name || state.brief?.productName || "Morrow Coffee";
  const adTitle = `${brandName} vertical ad`;
  const campaignName = `${brandName} Morning Ritual`;

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onRevise(inputValue.trim());
    setInputValue("");
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full gap-3.5 bg-transparent text-slate-800 dark:text-zinc-200 select-none animate-in fade-in duration-300">
      
      {/* ======================================================== */}
      {/* LEFT PANEL: Chat & Pipeline Assistant                    */}
      {/* ======================================================== */}
      <div className="w-full md:w-[420px] xl:w-[440px] flex-shrink-0 flex flex-col h-full bg-black/[0.06] hover:bg-black/[0.08] dark:bg-white/[0.035] dark:hover:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm transition-colors duration-200 relative">
        
        {/* Panel Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.04] bg-transparent z-10">
          <button 
            type="button"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white hover:opacity-80 transition-opacity group"
          >
            <span className="truncate max-w-[280px]">{campaignName}</span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Start new creative session"
            className="w-7 h-7 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <ChatBubbleIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Conversation Stream */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth scrollbar-thin"
        >
          {/* User Request Bubble (top-right aligned) */}
          <div className="flex justify-end pt-1">
            <div className="bg-black/[0.06] hover:bg-black/[0.08] dark:bg-white/[0.035] dark:hover:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06] text-slate-800 dark:text-zinc-200 text-xs md:text-sm rounded-2xl p-3.5 max-w-[88%] shadow-sm leading-relaxed space-y-1 transition-colors duration-200">
              <p className="font-medium text-slate-900 dark:text-zinc-200">
                Q: How should we make this 15-second vertical ad?
              </p>
              <p className="text-slate-500 dark:text-zinc-400">
                A: Generate now with AdCraft 2.5 (recommended, up to 1080p)
              </p>
            </div>
          </div>

          {/* Assistant Initial Response (plain unboxed text) */}
          <div className="text-xs md:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed pl-1 pt-1">
            <p>
              Great — I&apos;ll take the in-chat route and keep the supplied {brandName} mark intact as the brand anchor. I&apos;m checking the live video options now, then I&apos;ll prepare one vertical 15-second ad for your confirmation.
            </p>
          </div>

          {/* Collapsible Step 1 */}
          <div className="pl-1">
            <button
              type="button"
              onClick={() => setIsBriefOpen(!isBriefOpen)}
              className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors font-medium group"
            >
              <span>Reading settings for the reference-led ad</span>
              <ChevronRightIcon 
                className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-transform duration-200 ${isBriefOpen ? "rotate-90" : ""}`} 
              />
            </button>
            {isBriefOpen && (
              <div className="mt-2 ml-2 p-2.5 rounded-lg bg-black/[0.06] hover:bg-black/[0.08] dark:bg-white/[0.035] dark:hover:bg-white/[0.05] border border-black/[0.06] dark:border-white/5 text-[11px] font-mono text-slate-600 dark:text-zinc-400 space-y-1 animate-in fade-in duration-200 transition-colors">
                <p>• Visual archetype: Monolithic centered</p>
                <p>• Narrative angle: Transformation universal</p>
                <p>• Pacing: High dynamic velocity (30fps)</p>
              </div>
            )}
          </div>

          {/* Assistant Confirmation Instruction */}
          <div className="text-xs md:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed pl-1">
            <p>
              Please review the confirmation card below and actively confirm it when ready; generation will not start until you do.
            </p>
          </div>

          {/* Collapsible Step 2 */}
          <div className="pl-1">
            <button
              type="button"
              onClick={() => setIsPrepOpen(!isPrepOpen)}
              className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors font-medium group"
            >
              <span>Preparing the {brandName} ad</span>
              <ChevronRightIcon 
                className={`w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-transform duration-200 ${isPrepOpen ? "rotate-90" : ""}`} 
              />
            </button>
            {isPrepOpen && (
              <div className="mt-2 ml-2 p-2.5 rounded-lg bg-black/[0.06] hover:bg-black/[0.08] dark:bg-white/[0.035] dark:hover:bg-white/[0.05] border border-black/[0.06] dark:border-white/5 text-[11px] font-mono text-slate-600 dark:text-zinc-400 space-y-1 animate-in fade-in duration-200 transition-colors">
                <p>• Storyboard: {state.storyboard ? `${state.storyboard.scenes.length} scenes mapped` : "Mapping narrative beats..."}</p>
                <p>• 11 Spatial Dimensions: {state.keyframeAnalyses ? "Verified" : "Calibrating"}</p>
                <p>• MotionIR Compiler: {state.motionIR ? "Compiled" : "Awaiting scene reconstruction"}</p>
              </div>
            )}
          </div>

          {/* Embedded Generation Confirmation Card */}
          <div className="bg-black/[0.06] hover:bg-black/[0.08] dark:bg-white/[0.035] dark:hover:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3.5 space-y-3 max-w-[94%] shadow-sm transition-colors duration-200">
            {/* Title row */}
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#ec4899] to-[#f43f5e] flex items-center justify-center text-white shadow-sm">
                <VideoIcon className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs md:text-sm font-semibold text-[#ec4899] dark:text-[#f472b6] truncate flex-1">
                {adTitle}
              </h4>
              {state.jobState === "running" && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 dark:text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                  Live
                </div>
              )}
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-mono overflow-x-auto py-0.5">
              <span className="flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                <LightningBoltIcon className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                AdCraft 2.5
              </span>
              <span className="text-slate-300 dark:text-zinc-600">|</span>
              <span>9:16</span>
              <span className="text-slate-300 dark:text-zinc-600">|</span>
              <span>1080p</span>
              <span className="text-slate-300 dark:text-zinc-600">|</span>
              <span>15s</span>
              <span className="text-slate-300 dark:text-zinc-600">|</span>
              <InfoCircledIcon className="w-3 h-3 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer" />
            </div>

            {/* Live Progress Bar or Finished Stamp */}
            {state.jobState === "running" && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                  <span>{state.currentStage ? `Stage: ${state.currentStage}` : "Generating..."}</span>
                  <span className="text-emerald-500 dark:text-emerald-400">Active</span>
                </div>
                <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 via-emerald-400 to-[#00e575] animate-pulse w-4/5 rounded-full" />
                </div>
              </div>
            )}

            {state.jobState === "complete" && (
              <div className="pt-1 flex items-center justify-between border-t border-black/[0.06] dark:border-white/5 text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckIcon className="w-3.5 h-3.5" />
                  Confirmed & Ready
                </span>
                <span className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">Score: 9.2/10</span>
              </div>
            )}
          </div>

          {/* Any real-time system logs */}
          {logs.filter(l => l.sender === "System" && l.text.includes("✓")).slice(-2).map((log) => (
            <div key={log.id} className="text-[11px] font-mono text-slate-500 dark:text-zinc-500 pl-1">
              {log.text}
            </div>
          ))}
        </div>

        {/* Bottom Pinned Composer */}
        <div className="p-3 mx-3.5 mb-3.5 rounded-2xl bg-[#ffffff] dark:bg-[#060708] border border-black/[0.08] dark:border-white/[0.08] shadow-sm flex flex-col gap-2 relative transition-colors duration-200">
          <textarea
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && inputValue.trim()) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="What do you want to create?"
            className="w-full bg-transparent text-slate-900 dark:text-white text-xs md:text-sm placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            {/* Left plus button */}
            <button 
              type="button"
              title="Attach assets"
              className="w-8 h-8 rounded-full bg-black/[0.06] hover:bg-black/[0.1] dark:bg-white/[0.08] dark:hover:bg-white/[0.15] text-slate-700 dark:text-zinc-300 flex items-center justify-center transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
            </button>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-full bg-black/[0.06] hover:bg-black/[0.1] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.06] text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors font-medium"
              >
                <span>Ask first</span>
                <ChevronDownIcon className="w-3 h-3 text-slate-400 dark:text-zinc-400" />
              </button>

              <button
                type="button"
                title="Voice input"
                className="w-8 h-8 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/5 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 flex items-center justify-center transition-colors"
              >
                <SpeakerLoudIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSend}
                title="Send instruction"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/20 dark:hover:bg-white/30 dark:text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <ArrowUpIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: Creative Output Canvas & Gallery            */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col h-full bg-black/[0.06] hover:bg-black/[0.08] dark:bg-white/[0.035] dark:hover:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm transition-colors duration-200 relative">
        
        {/* Top Header Bar */}
        <div className="h-12 px-5 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.04] bg-transparent z-10">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setCanvasView(canvasView === "empty" ? "preview" : "empty")}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-black font-semibold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <GridIcon className="w-3.5 h-3.5" />
              <span>Unsorted</span>
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>

            <button 
              type="button"
              title="Pin asset" 
              className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/5 transition-colors"
            >
              <DrawingPinIcon className="w-4 h-4" />
            </button>

            <button 
              type="button"
              title="Save to folder" 
              className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/5 transition-colors"
            >
              <BookmarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Right Toolbar Icons */}
          <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <button 
              type="button"
              title="Full screen view" 
              className="w-8 h-8 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <EnterFullScreenIcon className="w-4 h-4" />
            </button>

            <button 
              type="button"
              title="Magic presets" 
              className="h-8 px-2 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors text-xs"
            >
              <LightningBoltIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <ChevronDownIcon className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
            </button>

            <button 
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              title="Favorite" 
              className={`w-8 h-8 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/5 flex items-center justify-center transition-colors ${isFavorite ? "text-amber-500 dark:text-amber-400" : "hover:text-slate-900 dark:hover:text-white"}`}
            >
              <StarIcon className="w-4 h-4" />
            </button>

            <button 
              type="button"
              onClick={() => setCanvasView(canvasView === "storyboard" ? "preview" : "storyboard")}
              title="Toggle Storyboard / Scene Grid" 
              className={`w-8 h-8 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/5 flex items-center justify-center transition-colors ${canvasView === "storyboard" ? "text-slate-900 dark:text-white bg-black/[0.08] dark:bg-white/10" : "hover:text-slate-900 dark:hover:text-white"}`}
            >
              <GridIcon className="w-4 h-4" />
            </button>

            <button 
              type="button"
              title="Filter outputs" 
              className="w-8 h-8 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <MixerHorizontalIcon className="w-4 h-4" />
            </button>

            <button 
              type="button"
              title="Search canvas" 
              className="w-8 h-8 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History / Retention Banner */}
        <div className="mx-5 mt-3 mb-2 bg-black/[0.06] hover:bg-black/[0.08] dark:bg-white/[0.035] dark:hover:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300">
            <InfoCircledIcon className="w-4 h-4 text-slate-500 dark:text-zinc-400 flex-shrink-0" />
            <span>
              Your creations will be stored for <strong className="font-semibold text-slate-900 dark:text-white">7 days</strong>. Upgrade now to unlock unlimited history
            </span>
          </div>
          <button 
            type="button"
            onClick={() => {
              if (state.jobState === "complete") {
                setCanvasView("preview");
              }
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-black font-semibold text-xs px-3.5 py-1 rounded-full transition-colors shadow-sm"
          >
            {state.jobState === "complete" ? "View Ad" : "Unlock"}
          </button>
        </div>

        {/* Main Canvas Body */}
        <div className="flex-1 overflow-y-auto relative flex flex-col items-center justify-center p-6">
          
          {/* VIEW A: Empty State (Identical to screenshot) */}
          {canvasView === "empty" && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 select-none my-auto animate-in fade-in duration-300">
              
              {/* Glossy Metallic Stacked Cards Graphic with Diamond Sparkle */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-3">
                {/* 4-Point Diamond Sparkle Star (top-left) */}
                <div className="absolute -top-1 left-3 text-slate-800 dark:text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
                  </svg>
                </div>

                {/* Back card (rotated left -8deg) */}
                <div 
                  className="absolute w-24 h-28 rounded-2xl p-[1.5px] bg-gradient-to-tr from-slate-400 via-slate-300 to-slate-200 dark:from-zinc-600 dark:via-zinc-400 dark:to-zinc-200 shadow-md"
                  style={{ transform: "rotate(-10deg) translate(-6px, 2px)" }}
                >
                  <div className="w-full h-full bg-slate-100 dark:bg-[#121316] rounded-[14px]" />
                </div>

                {/* Front card (rotated right +8deg) */}
                <div 
                  className="absolute w-24 h-28 rounded-2xl p-[1.5px] bg-gradient-to-tr from-slate-400 via-slate-200 to-white dark:from-zinc-500 dark:via-zinc-200 dark:to-white shadow-xl"
                  style={{ transform: "rotate(8deg) translate(6px, -2px)" }}
                >
                  <div className="w-full h-full bg-white dark:bg-[#18191e] rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Metallic specular glare */}
                    <div className="absolute -top-6 -left-6 w-16 h-16 bg-slate-200/50 dark:bg-white/20 blur-md rounded-full pointer-events-none" />
                    
                    {/* Minimalist landscape art icon */}
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-600 dark:text-zinc-300 drop-shadow-sm">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Headings */}
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Empty, for now
              </h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1.5">
                Your first creation changes that.
              </p>

              {/* Quick toggle if ad is ready */}
              {state.jobState === "complete" && (
                <button
                  type="button"
                  onClick={() => setCanvasView("preview")}
                  className="mt-6 px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
                >
                  <PlayIcon className="w-3.5 h-3.5" />
                  Show Finished Advertisement
                </button>
              )}
            </div>
          )}

          {/* VIEW B: Final Broadcast Video Player (9:16 vertical card) */}
          {canvasView === "preview" && (
            <div className="flex flex-col items-center justify-center h-full w-full p-4 animate-in zoom-in-95 duration-300">
              <div className="relative aspect-[9/16] h-[520px] max-h-[82vh] rounded-3xl bg-black border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between p-6 group">
                
                {/* Overlay vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none z-10" />

                {/* Top status chips */}
                <div className="relative z-20 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    1080x1920 • 30fps
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-400">
                    15.0s
                  </span>
                </div>

                {/* Center play icon */}
                <div className="relative z-20 flex flex-col items-center justify-center my-auto">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:bg-white/20 transition-all cursor-pointer">
                    <PlayIcon className="w-7 h-7 text-white translate-x-0.5" />
                  </div>
                </div>

                {/* Bottom title and download actions */}
                <div className="relative z-20 space-y-3">
                  <div>
                    <h4 className="text-lg font-bold text-white leading-tight">
                      {brandName}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1 font-mono">
                      {state.selectedConceptId || "concept-transformation-universal"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      type="button"
                      className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors shadow-lg"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      Download 1080p MP4
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCanvasView("storyboard")}
                      className="px-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-medium text-xs hover:bg-white/20 transition-colors"
                    >
                      Scenes
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* VIEW C: Storyboard & Scenes Grid */}
          {canvasView === "storyboard" && state.storyboard && (
            <div className="w-full h-full overflow-y-auto p-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Narrative Scenes ({state.storyboard.scenes.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setCanvasView("preview")}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  ← Back to Ad Preview
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pb-8">
                {state.storyboard.scenes.map((scene, idx) => (
                  <div 
                    key={scene.id} 
                    className="bg-black/[0.06] hover:bg-black/[0.08] dark:bg-white/[0.035] dark:hover:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] rounded-xl p-3 flex flex-col space-y-2 shadow-sm transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase">
                      <span>Scene {idx + 1}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">Approved</span>
                    </div>

                    <div className="aspect-[9/16] bg-black/60 rounded-lg border border-white/5 flex flex-col justify-end p-2 relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-400 font-mono text-center p-2">
                        {scene.intent || "Motion Primitive"}
                      </div>
                      <p className="text-[10px] text-white font-semibold line-clamp-2 relative z-10">
                        {scene.headlineCopy}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {scene.intent}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

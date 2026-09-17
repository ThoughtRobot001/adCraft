import React, { useState, useEffect, useRef } from "react";
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  VideoIcon,
  LayersIcon,
  LockClosedIcon,
  LightningBoltIcon,
  MagicWandIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
  EnterFullScreenIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { Project } from "../types";

interface RightPanelProps {
  currentProject: Project;
  onViewProject: (project: Project) => void;
  onCreateNewAd: () => void;
  onBrowseAssets: () => void;
  onViewBrandKit: () => void;
  onBrowseTemplates: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  currentProject,
  onViewProject,
  onCreateNewAd,
  onBrowseAssets,
  onViewBrandKit,
  onBrowseTemplates,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const totalDurationSec = parseInt(currentProject.duration) || 30;
  const currentSceneIndex = Math.min(
    Math.floor(
      (currentTimeSec / totalDurationSec) * (currentProject.scenes.length || 4),
    ),
    (currentProject.scenes.length || 4) - 1,
  );
  const activeScene =
    currentProject.scenes[currentSceneIndex] || currentProject.scenes[0];

  // Animated playback loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= totalDurationSec) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
      }, 500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDurationSec]);

  // Reset when project changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTimeSec(0);
  }, [currentProject.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const activeImage =
    isPlaying && activeScene?.imageUrl
      ? activeScene.imageUrl
      : currentProject.thumbnail;

  return (
    <aside className="w-80 shrink-0 border-l border-slate-200 dark:border-white/[0.08] bg-slate-200/40 dark:bg-white/[0.015] backdrop-blur-2xl p-4 h-full overflow-y-auto select-none space-y-6">
      {/* Active Project Card */}
      <div className="rounded-2xl glass-card p-3.5 shadow-xl">
        {/* Video Player Box */}
        <div
          id="project-video-player-preview"
          onClick={handlePlayToggle}
          className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-950 group cursor-pointer border border-slate-200 dark:border-white/10 shadow-lg"
        >
          <img
            src={activeImage}
            alt={currentProject.title}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isPlaying ? "scale-105" : "group-hover:scale-102"
            }`}
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

          {/* Center Circular Play Button - Apple Glass Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayToggle}
              className={`w-12 h-12 rounded-full apple-glass-circle-btn text-slate-900 dark:text-white flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isPlaying
                  ? "opacity-0 group-hover:opacity-100 hover:scale-110"
                  : "opacity-95 hover:scale-110"
              }`}
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5 fill-white" />
              ) : (
                <PlayIcon className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>
          </div>

          {/* Real-Time Scene Subtitles Overlay when playing */}
          {isPlaying && activeScene && (
            <div className="absolute bottom-6 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-black/85 border border-slate-200 dark:border-white/10 text-center shadow-lg">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {activeScene.phase}
              </p>
              <p className="text-[11px] text-slate-900 dark:text-white font-medium line-clamp-1">
                "{activeScene.scriptVoiceover}"
              </p>
            </div>
          )}

          {/* Scrubber Bar at bottom */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-200 dark:bg-white/20">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(currentTimeSec / totalDurationSec) * 100}%` }}
            />
          </div>

          {/* Timestamp Badge (0:30) */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-white/90 dark:bg-black/85 text-[10px] font-mono font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/15 shadow-sm">
            {isPlaying
              ? `${formatTime(currentTimeSec)} / ${formatTime(totalDurationSec)}`
              : `0:${totalDurationSec}`}
          </div>
        </div>

        {/* Project Header & Meta */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate mb-0.5">
            {currentProject.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
            {currentProject.type} · {currentProject.resolution} ·{" "}
            {currentProject.duration}
          </p>
        </div>

        {/* Metadata Table Rows */}
        <div className="space-y-2 py-2.5 border-y border-slate-200 dark:border-white/[0.08] text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">Status</span>
            <span className="flex items-center gap-1.5 font-semibold text-[#00e575]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e575]" />
              <span>{currentProject.status}</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">Created</span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">
              {currentProject.createdAt}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-300">Updated</span>
            <span className="text-slate-700 dark:text-slate-200 font-medium">
              {currentProject.updatedAt}
            </span>
          </div>
        </div>

        {/* View Project Button */}
        <div className="mt-3.5">
          <button
            id="btn-view-project-detail"
            onClick={() => onViewProject(currentProject)}
            className="liquid-glass-btn-secondary w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View project</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Section: Quick Actions */}
      <div>
        <div className="mb-2.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          Quick Actions
        </div>

        <div className="space-y-2">
          {/* Action 1 */}
          <button
            id="quick-action-create-ad"
            onClick={onCreateNewAd}
            className="liquid-glass-btn-secondary w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <VideoIcon className="w-4 h-4" />
            </div>
            <span>Create new ad</span>
          </button>

          {/* Action 2 */}
          <button
            id="quick-action-browse-assets"
            onClick={onBrowseAssets}
            className="liquid-glass-btn-secondary w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <LayersIcon className="w-4 h-4" />
            </div>
            <span>Browse assets</span>
          </button>

          {/* Action 3 */}
          <button
            id="quick-action-brand-kit"
            onClick={onViewBrandKit}
            className="liquid-glass-btn-secondary w-full flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <LockClosedIcon className="w-4 h-4" />
            </div>
            <span>View brand kit</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

import React from "react";
import {
  ArrowRightIcon,
  PlayIcon,
  ClockIcon,
  MagicWandIcon,
} from "@radix-ui/react-icons";
import { Project } from "../types";
import { Skeleton } from "./Skeleton";

interface RecentProjectsProps {
  isLoading?: boolean;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (project: Project) => void;
  onViewAllClick: () => void;
}

export const RecentProjects: React.FC<RecentProjectsProps> = ({
  isLoading,
  projects,
  activeProjectId,
  onSelectProject,
  onViewAllClick,
}) => {
  return (
    <section className="w-full select-none pt-4 pb-12">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          Recent Projects
        </h2>

        <button
          id="btn-view-all-projects"
          onClick={onViewAllClick}
          className="btn-glass-pill !border-none group"
        >
          <span>View all</span>
          <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 4-Column Grid matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="group rounded-2xl glass-card p-3 relative overflow-hidden flex flex-col justify-between"
              >
                <Skeleton className="w-full aspect-video mb-3 rounded-xl" />
                <div>
                  <Skeleton className="h-4 w-3/4 mb-2 rounded" />
                  <Skeleton className="h-3 w-1/2 mb-4 rounded" />
                  <div className="pt-2.5 border-t border-slate-200 dark:border-white/[0.08]">
                    <Skeleton className="h-3 w-1/3 rounded" />
                  </div>
                </div>
              </div>
            ))
          : projects.slice(0, 4).map((project) => {
              const isActive = project.id === activeProjectId;
          const isCompleted = project.status === "Completed";

          return (
            <div
              key={project.id}
              id={`recent-project-card-${project.id}`}
              onClick={() => onSelectProject(project)}
              className={`group rounded-2xl glass-card p-3 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? "border-emerald-500/60 bg-emerald-950/20"
                  : "hover:scale-[1.02]"
              }`}
            >
              {/* Image Container with 16:9 ratio */}
              <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-inner">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Status Dot Pill inside bottom-left of image */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-black/85 border border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCompleted
                        ? "bg-[#00e575]"
                        : "bg-amber-400 animate-pulse"
                    }`}
                  />
                  <span>{project.status}</span>
                </div>

                {/* Hover Play button indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 dark:bg-black/50">
                  <div className="w-11 h-11 rounded-full bg-[#00e575] text-black flex items-center justify-center border border-slate-300 dark:border-white/30">
                    <PlayIcon className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Card Meta & Specs */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white truncate mb-1">
                  {project.title}
                </h3>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate mb-3">
                  {project.type} · {project.duration} · {project.resolution}
                </p>

                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-600 dark:text-slate-300">
                  <span>{project.createdAt}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

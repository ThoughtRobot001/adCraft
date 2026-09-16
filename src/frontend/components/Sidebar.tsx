import React, { useState } from "react";
import {
  HomeIcon,
  ArchiveIcon,
  LayersIcon,
  GearIcon,
  ChevronRightIcon,
  LightningBoltIcon,
  ArrowRightIcon,
  ViewVerticalIcon,
} from "@radix-ui/react-icons";
import { AdCraftLogo } from "./AdCraftLogo";
import { Project } from "../types";

export type NavTab = "home" | "campaigns" | "assets" | "quick-create" | "settings";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentProject: Project;
  onSelectCurrentProject: () => void;
  onOpenSettings: () => void;
  onBrowseTemplates?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentProject,
  onSelectCurrentProject,
  onOpenSettings,
  onBrowseTemplates,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  return (
    <aside
      className={`shrink-0 border-r border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#121314] flex flex-col justify-between h-screen sticky top-0 select-none z-30 transition-[width] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden ${
        isCollapsed ? "w-[68px]" : "w-64"
      }`}
    >
      {/* Top Section with aligned Logo Header & Collapse Button */}
      <div className="flex flex-col min-h-0 flex-1 w-full">
        {/* Brand Logo Header + Collapse Button */}
        <div className="h-16 flex items-center justify-between px-3.5 shrink-0 border-b border-slate-200 dark:border-white/[0.04]">
          <div
            onClick={() => onTabChange("home")}
            className={`flex items-center cursor-pointer group transition-[width,opacity,transform] duration-300 overflow-hidden whitespace-nowrap ${
              isCollapsed
                ? "w-0 opacity-0 -translate-x-4 pointer-events-none"
                : "w-[140px] opacity-100 translate-x-0"
            }`}
            role="button"
            tabIndex={0}
            title="AdCraft AI"
          >
            <AdCraftLogo size="md" />
          </div>
          <button
            id="sidebar-collapse-btn"
            onClick={handleToggle}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer active:scale-95 group shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ViewVerticalIcon className="w-4 h-4 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 flex flex-col p-3.5 space-y-5">
          {/* Main Home Button */}
          <div className="w-full">
            <button
              id="nav-home"
              onClick={() => onTabChange("home")}
              className={`w-full h-10 flex items-center rounded-lg transition-all duration-300 cursor-pointer overflow-hidden ${
                activeTab === "home"
                  ? "font-semibold text-slate-900 dark:text-white nav-tab-active"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              }`}
              title="Home"
            >
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 transition-colors"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap transition-[width,opacity,transform] duration-300 overflow-hidden ${
                  isCollapsed
                    ? "w-0 opacity-0 -translate-x-2"
                    : "w-[120px] opacity-100 translate-x-0 text-left"
                }`}
              >
                Home
              </span>
            </button>
          </div>

          {/* Section: MY WORK */}
          <div className="w-full flex flex-col">
            <div className="relative h-5 w-full flex items-center justify-center mb-1">
              <span
                className={`absolute left-0 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider transition-all duration-300 ${
                  isCollapsed
                    ? "opacity-0 -translate-x-4 pointer-events-none"
                    : "opacity-100 translate-x-0"
                }`}
              >
                My Work
              </span>
              <div
                className={`h-px bg-white/[0.08] transition-all duration-300 ${
                  isCollapsed ? "w-6 opacity-100" : "w-0 opacity-0"
                }`}
              />
            </div>

            <div className="w-full space-y-1">
              {/* Campaigns Button */}
              <button
                id="nav-campaigns"
                onClick={() => onTabChange("campaigns")}
                className={`w-full h-10 flex items-center rounded-lg transition-colors cursor-pointer overflow-hidden ${
                  activeTab === "campaigns"
                    ? "font-semibold text-slate-900 dark:text-white nav-tab-active"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                }`}
                title="Campaigns"
              >
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <ArchiveIcon className="w-4 h-4" />
                </div>
                <span
                  className={`text-sm whitespace-nowrap transition-[width,opacity,transform] duration-300 overflow-hidden ${
                    isCollapsed
                      ? "w-0 opacity-0 -translate-x-2"
                      : "w-[120px] opacity-100 translate-x-0 text-left"
                  }`}
                >
                  Campaigns
                </span>
              </button>

              {/* Assets Button */}
              <button
                id="nav-assets"
                onClick={() => onTabChange("assets")}
                className={`w-full h-10 flex items-center rounded-lg transition-colors cursor-pointer overflow-hidden ${
                  activeTab === "assets"
                    ? "font-semibold text-slate-900 dark:text-white nav-tab-active"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                }`}
                title="Assets"
              >
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <LayersIcon className="w-4 h-4" />
                </div>
                <span
                  className={`text-sm whitespace-nowrap transition-[width,opacity,transform] duration-300 overflow-hidden ${
                    isCollapsed
                      ? "w-0 opacity-0 -translate-x-2"
                      : "w-[120px] opacity-100 translate-x-0 text-left"
                  }`}
                >
                  Assets
                </span>
              </button>
            </div>
          </div>

          {/* Section: CURRENT PROJECT */}
          <div className="w-full flex flex-col">
            <div className="relative h-5 w-full flex items-center justify-center mb-1">
              <span
                className={`absolute left-0 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider transition-all duration-300 ${
                  isCollapsed
                    ? "opacity-0 -translate-x-4 pointer-events-none"
                    : "opacity-100 translate-x-0"
                }`}
              >
                Current Project
              </span>
              <div
                className={`h-px bg-white/[0.08] transition-all duration-300 ${
                  isCollapsed ? "w-6 opacity-100" : "w-0 opacity-0"
                }`}
              />
            </div>

            <button
              id="sidebar-current-project-card"
              onClick={onSelectCurrentProject}
              className={`w-full flex items-center rounded-xl glass-card-subtle transition-all duration-300 cursor-pointer overflow-hidden group hover:border-[#00e575]/50 hover:shadow-[0_0_15px_rgba(0,229,117,0.15)] ${
                isCollapsed
                  ? "h-10 p-0 justify-center"
                  : "h-14 p-2 justify-between"
              }`}
              title={
                isCollapsed
                  ? `Current Project: ${currentProject.title}`
                  : undefined
              }
            >
              <div className="flex items-center h-full">
                <div className="shrink-0 relative shadow-md w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                  <img
                    src={currentProject.thumbnail}
                    alt={currentProject.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div
                  className={`flex flex-col text-left transition-[width,opacity,transform] duration-300 overflow-hidden whitespace-nowrap ${
                    isCollapsed
                      ? "w-0 opacity-0 ml-0 -translate-x-2"
                      : "w-[120px] opacity-100 ml-3 translate-x-0"
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-slate-900 dark:group-hover:text-white">
                    {currentProject.title}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    AI · {currentProject.type}
                  </p>
                </div>
              </div>
              <ChevronRightIcon
                className={`shrink-0 text-slate-600 dark:text-slate-300 transition-[width,opacity,transform] duration-300 ${
                  isCollapsed
                    ? "w-0 opacity-0 ml-0"
                    : "w-4 h-4 opacity-100 ml-1 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Need Inspiration Card / Mini Icon when Collapsed */}
          <div className="mt-auto w-full flex justify-center pb-1">
            <div
              className={`relative overflow-hidden transition-[height,border-radius,background-color] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] w-full ${
                isCollapsed
                  ? "h-10 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer active:scale-95 border border-emerald-500/20"
                  : "h-[190px] rounded-xl bg-black/[0.06] dark:bg-white/[0.035] border border-transparent hover:bg-black/[0.08] dark:hover:bg-white/[0.05] transition-all"
              }`}
              onClick={isCollapsed ? onBrowseTemplates : undefined}
              title={
                isCollapsed ? "Need inspiration? Browse templates" : undefined
              }
            >
              {/* Collapsed Icon */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  isCollapsed
                    ? "opacity-100 scale-100 delay-100"
                    : "opacity-0 scale-75 pointer-events-none"
                }`}
              >
                <LightningBoltIcon className="w-4 h-4 text-[#00e575]" />
              </div>

              {/* Expanded Content */}
              <div
                className={`absolute inset-0 w-full px-4 flex flex-col justify-center items-start text-left transition-all duration-300 ${
                  isCollapsed
                    ? "opacity-0 pointer-events-none translate-y-4"
                    : "opacity-100 translate-y-0 delay-100"
                }`}
              >
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1 whitespace-nowrap">
                  Need inspiration?
                </h4>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3 whitespace-nowrap overflow-hidden text-ellipsis">
                  Explore creative templates
                  <br />
                  and popular styles.
                </p>

                <button
                  id="sidebar-btn-browse-templates"
                  onClick={onBrowseTemplates}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] hover:bg-white dark:hover:bg-white/[0.08] hover:shadow-sm hover:ring-1 hover:ring-slate-200/50 dark:hover:shadow-none dark:hover:ring-0 border border-transparent dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-all cursor-pointer group active:scale-95 w-fit"
                >
                  <span>Browse templates</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="mt-4 ml-2 flex -space-x-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-white/20 shadow-sm rotate-[-12deg] overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=100&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-white/20 shadow-md rotate-[2deg] z-10 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=100&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-white/20 shadow-lg rotate-[15deg] z-20 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1523821741446-edb9b4415985?q=80&w=100&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Settings */}
      <div className="shrink-0 border-t border-slate-200 dark:border-white/[0.04] p-3.5">
        <button
          id="nav-settings"
          onClick={() => onTabChange("settings")}
          className={`w-full h-10 flex items-center rounded-lg transition-all duration-300 cursor-pointer overflow-hidden ${
            activeTab === "settings"
              ? "font-semibold text-slate-900 dark:text-white nav-tab-active"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] group"
          }`}
          title="Settings"
        >
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <GearIcon className={`w-4 h-4 transition-colors ${activeTab === "settings" ? "text-slate-900 dark:text-white" : "group-hover:text-slate-900 dark:group-hover:text-white"}`} />
          </div>
          <span
            className={`text-sm whitespace-nowrap transition-[width,opacity,transform] duration-300 overflow-hidden ${
              isCollapsed
                ? "w-0 opacity-0 -translate-x-2"
                : "w-[120px] opacity-100 translate-x-0 text-left"
            } ${
              activeTab === "settings" ? "font-semibold text-slate-900 dark:text-white" : "font-medium group-hover:text-slate-900 dark:group-hover:text-white"
            }`}
          >
            Settings
          </span>
        </button>
      </div>
    </aside>
  );
};

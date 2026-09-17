import React, { useState, useRef, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from "@radix-ui/react-icons";
import { Project } from "../types";
import { NavTab } from "./Sidebar";

interface HeaderProps {
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  currentProject?: Project;
  projects?: Project[];
  onSelectProject?: (project: Project) => void;
  onNewCampaignClick?: () => void;
  onOpenSettings: () => void;
  isScrolled?: boolean;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  isScrolled = false,
  theme = "dark",
  toggleTheme,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`h-16 w-full px-6 flex items-center justify-between select-none z-30 sticky top-0 transition-all duration-300 relative border-b-0 ${
        isScrolled
          ? "liquid-glass-header"
          : "bg-transparent border-none shadow-none"
      }`}
    >
      {/* Specular Liquid Glass Top Sheen (only when scrolled) */}
      {isScrolled && (
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}

      {/* Left Area (Clean Spacer) */}
      <div className="flex items-center gap-3" />

      {/* Right: Theme Toggle, Notifications, Profile & Dropdown */}
      <div className="flex items-center gap-2.5">
        {/* Sun/Theme Toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme || onOpenSettings}
          className="btn-glass-icon !border-none group"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <SunIcon className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          ) : (
            <MoonIcon className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          )}
        </button>

        {/* Profile & Dropdown Button */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="user-profile-button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="h-9 pl-1.5 pr-3 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.12] hover:shadow-sm hover:ring-1 hover:ring-slate-200/50 dark:hover:shadow-none dark:hover:ring-0 border-0 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 cursor-pointer transition-all active:scale-95 group"
            title="User Profile & Settings"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/25 shrink-0 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Justin Chidex"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#00e575] rounded-full ring-1 ring-[#0C0D0D]" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Justin
            </span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
          </button>

          {isUserMenuOpen && (
            <div className="popover-glass rounded-2xl top-full right-0 mt-2 w-64 p-3 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center gap-3 px-2 py-2 border-b border-slate-200 dark:border-white/[0.08]">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Justin Chidex"
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-white/20 shadow-md shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    Justin Chidex
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    CHIDEXJUSTIN@gmail.com
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-[#00e575] font-semibold">
                    <span>Pro Creative Plan</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="header-open-settings-btn"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Preferences & AI Settings</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

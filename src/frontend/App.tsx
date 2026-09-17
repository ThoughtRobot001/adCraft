import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar, NavTab } from "./components/Sidebar";
import { AdHeroCreator } from "./components/AdHeroCreator";
import { RecentProjects } from "./components/RecentProjects";

import { BrandKitModal } from "./components/BrandKitModal";

import { LiquidGlassFilter } from "./components/LiquidGlassFilter";
import { INITIAL_PROJECTS } from "./data/mockData";
import { Project, AdTemplate } from "./types";

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProject, setCurrentProject] = useState<Project>(
    INITIAL_PROJECTS[0],
  );
  const [activeNavTab, setActiveNavTab] = useState<NavTab>("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWorkspaceActive, setIsWorkspaceActive] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [isBrandKitModalOpen, setIsBrandKitModalOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Dynamic liquid glass cursor tracking (updates --mouse-x, --mouse-y for specular glint & buoyant interaction)
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement)?.closest(
        ".glass-card, .glass-card-subtle, .liquid-glass-btn-primary, .liquid-glass-btn-secondary, .liquid-glass-pill",
      ) as HTMLElement | null;
      if (target) {
        const rect = target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        target.style.setProperty("--mouse-x", `${x.toFixed(1)}%`);
        target.style.setProperty("--mouse-y", `${y.toFixed(1)}%`);
      }
    };
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  // Fetch initial projects from backend if available
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
          setCurrentProject(data.projects[0]);
        }
      })
      .catch((err) => {
        console.warn("Using local mock projects:", err);
      });
  }, []);

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
  };

  const handleAdCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setCurrentProject(newProject);
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (currentProject.id === updated.id) {
      setCurrentProject(updated);
    }
  };

  const handleSelectTemplate = (template: AdTemplate) => {
    // Switch to studio or prompt with template context
    setActiveNavTab("home");
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#0C0D0D] text-slate-900 dark:text-slate-100 flex font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Embedded SVG displacement & noise refraction filters */}
      <LiquidGlassFilter />

      {/* Neutral Monochrome Canvas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Soft neutral white luminous depth vignette */}
        <div className="absolute -top-[15%] left-[30%] w-[800px] h-[800px] rounded-full bg-slate-200/50 dark:bg-white/[0.025] blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[20%] w-[700px] h-[700px] rounded-full bg-slate-200/40 dark:bg-white/[0.015] blur-[150px]" />

        {/* Very faint neutral micro-dot grid for depth */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Left Sidebar (stretches to top of screen) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        activeTab={activeNavTab}
        onTabChange={(tab) => setActiveNavTab(tab)}
        currentProject={currentProject}
        onSelectCurrentProject={() => {}}
        onOpenSettings={() => {}}
        onBrowseTemplates={() => {}}
      />

      {/* Main Right Area: Top Header + Center Workspace */}
      <div className="flex-1 min-w-0 h-screen overflow-hidden relative z-10 bg-slate-50 dark:bg-[#0C0D0D]">
        {/* Subtle Inner Dashboard Top Ambient Light */}
        <div className="absolute top-0 inset-x-0 h-[600px] pointer-events-none select-none z-0 overflow-hidden">
          {/* Broad soft neutral spread */}
          <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-slate-200/40 dark:bg-white/[0.015] blur-[120px] rounded-[100%]" />
          {/* Focused subtle emerald core tint */}
          <div className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#00e575]/[0.015] blur-[130px] rounded-[100%]" />
        </div>

        {/* Main scroll viewport where content scrolls behind sticky liquid glass header */}
        <main
          id="main-scroll-viewport"
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 8)}
          className={`h-full w-full relative z-10 ${isWorkspaceActive ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          {/* Sticky Liquid Glass Header */}
          <Header
            isScrolled={isScrolled}
            onOpenSettings={() => {}}
            theme={theme}
            toggleTheme={toggleTheme}
          />

          {/* Main Work Area Content */}
          <div className={isWorkspaceActive ? "px-6 pb-6 pt-2 h-[calc(100%-64px)] flex flex-col overflow-hidden" : "px-6 pb-16 pt-6 h-[calc(100%-80px)] flex flex-col"}>
            {activeNavTab === "home" && (
              <div className={`mx-auto flex-1 w-full flex flex-col ${isWorkspaceActive ? "max-w-none h-full" : "max-w-5xl space-y-6"}`}>
                <AdHeroCreator 
                  onAdCreated={handleAdCreated} 
                  onWorkspaceStateChange={setIsWorkspaceActive}
                />

                {!isWorkspaceActive && (
                  <RecentProjects
                    projects={projects}
                    activeProjectId={currentProject.id}
                    onSelectProject={handleSelectProject}
                    onViewAllClick={() => setActiveNavTab("campaigns")}
                  />
                )}
              </div>
            )}

            {activeNavTab === "quick-create" && (
              <div className="max-w-4xl mx-auto py-8">
                <AdHeroCreator onAdCreated={handleAdCreated} />
              </div>
            )}

            {activeNavTab === "campaigns" && (
              <div className="max-w-5xl mx-auto py-12 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Campaigns</h2>
                <p className="text-slate-500 dark:text-slate-400">Your campaigns dashboard will appear here.</p>
              </div>
            )}
            {activeNavTab === "assets" && (
              <div className="max-w-5xl mx-auto py-12 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Assets Library</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage all your creative assets in one place.</p>
              </div>
            )}
            {activeNavTab === "settings" && (
              <div className="max-w-5xl mx-auto py-12 flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Settings</h2>
                <p className="text-slate-500 dark:text-slate-400">Configure your workspace preferences.</p>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Interactive Modals */}

      <BrandKitModal
        isOpen={isBrandKitModalOpen}
        onClose={() => setIsBrandKitModalOpen(false)}
      />
    </div>
  );
}

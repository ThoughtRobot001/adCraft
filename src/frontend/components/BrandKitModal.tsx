import React, { useState } from "react";
import {
  Cross2Icon,
  LockClosedIcon,
  MixIcon,
  TextIcon,
  ChatBubbleIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { BrandKit } from "../types";
import { INITIAL_BRAND_KIT } from "../data/mockData";

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandKitModal: React.FC<BrandKitModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [brandKit, setBrandKit] = useState<BrandKit>(INITIAL_BRAND_KIT);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-xl rounded-2xl glass-modal shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-white/[0.03] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#00e575]">
              <LockClosedIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Brand Kit & Identity
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Ensure all generated AI ads align with your brand guidelines.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="liquid-glass-btn-secondary w-8 h-8 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <Cross2Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Brand Name & Tagline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={brandKit.name}
                onChange={(e) =>
                  setBrandKit({ ...brandKit, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/30 dark:bg-black/30 border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={brandKit.tagline}
                onChange={(e) =>
                  setBrandKit({ ...brandKit, tagline: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/30 dark:bg-black/30 border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <MixIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Color System</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl glass-card-subtle flex items-center gap-3">
                <input
                  type="color"
                  value={brandKit.primaryColor}
                  onChange={(e) =>
                    setBrandKit({ ...brandKit, primaryColor: e.target.value })
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase">
                    Primary
                  </div>
                  <div className="text-xs text-slate-900 dark:text-white font-mono">
                    {brandKit.primaryColor}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl glass-card-subtle flex items-center gap-3">
                <input
                  type="color"
                  value={brandKit.secondaryColor}
                  onChange={(e) =>
                    setBrandKit({ ...brandKit, secondaryColor: e.target.value })
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase">
                    Dark Surface
                  </div>
                  <div className="text-xs text-slate-900 dark:text-white font-mono">
                    {brandKit.secondaryColor}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl glass-card-subtle flex items-center gap-3">
                <input
                  type="color"
                  value={brandKit.accentColor}
                  onChange={(e) =>
                    setBrandKit({ ...brandKit, accentColor: e.target.value })
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase">
                    Accent
                  </div>
                  <div className="text-xs text-slate-900 dark:text-white font-mono">
                    {brandKit.accentColor}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <TextIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Primary Font Family</span>
            </label>
            <select
              value={brandKit.fontFamily}
              onChange={(e) =>
                setBrandKit({ ...brandKit, fontFamily: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/30 dark:bg-black/30 border border-slate-200 dark:border-white/[0.08] text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option className="bg-[#121316]" value="Plus Jakarta Sans">
                Plus Jakarta Sans (Modern Clean Bold)
              </option>
              <option className="bg-[#121316]" value="Outfit">
                Outfit (Geometric Tech)
              </option>
              <option className="bg-[#121316]" value="Cabinet Grotesk">
                Cabinet Grotesk (Brutal High Contrast)
              </option>
              <option className="bg-[#121316]" value="Cinzel">
                Cinzel (Editorial Luxury)
              </option>
            </select>
          </div>

          {/* Tone of Voice */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <ChatBubbleIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Brand Tone of Voice</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "Cinematic",
                "High-Converting",
                "Modern",
                "Bold",
                "Authentic",
                "Elevated",
                "Punchy",
              ].map((tone) => (
                <span
                  key={tone}
                  className="px-3 py-1 rounded-full liquid-glass-btn-secondary text-slate-700 dark:text-slate-200 text-xs font-medium"
                >
                  {tone}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#121318] flex items-center justify-between">
          <span className="text-xs text-slate-600 dark:text-slate-300">
            Auto-injected into AI creative prompts
          </span>
          <button
            onClick={handleSave}
            className="liquid-glass-btn-primary px-4 py-2 rounded-xl text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {saved ? <CheckIcon className="w-3.5 h-3.5" /> : null}
            <span>{saved ? "Saved Brand Kit" : "Save Brand Kit"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

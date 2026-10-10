import React from "react";
import { Sparkles, Briefcase, Award, PlayCircle, History, BookOpen, Layers } from "lucide-react";
import { PRESET_SCENARIOS, PresetScenario } from "../data/presets";

interface NavbarProps {
  activeTab: "questions" | "training" | "plan" | "simulation" | "history";
  setActiveTab: (tab: "questions" | "training" | "plan" | "simulation" | "history") => void;
  onSelectPreset: (preset: PresetScenario) => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectPreset,
  savedCount,
}) => {
  const [presetOpen, setPresetOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Kariyer & Mülakat Koçu
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Mülakatçı Unvanına Özel Sorular • Eğitim Analizi • Canlı Simülasyon
              </p>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="relative">
            <button
              onClick={() => setPresetOpen(!presetOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Hazır örnek senaryolar ile hızlıca deneyin"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Örnek Senaryo Yükle</span>
              <span className="md:hidden">Örnekler</span>
              <span className="text-[10px] bg-indigo-900 text-indigo-300 px-1.5 py-0.5 rounded">
                4 Hazır
              </span>
            </button>

            {presetOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[11px] font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider border-b border-slate-700/60">
                  Hızlı Başlangıç Senaryosu Seçin
                </div>
                <div className="divide-y divide-slate-750 max-h-72 overflow-y-auto mt-1">
                  {PRESET_SCENARIOS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPreset(p);
                        setPresetOpen(false);
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-700/80 rounded-lg transition flex flex-col gap-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition">
                          {p.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">
                          {p.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate">
                        Mülakatçı: <span className="text-slate-300">{p.interviewerTitle}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/80 pt-2">
          <button
            onClick={() => setActiveTab("questions")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "questions"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>1. Mülakatçı Unvanına Özel Sorular</span>
          </button>

          <button
            onClick={() => setActiveTab("training")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "training"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Eğitim Analizi & Sonraki Adım</span>
          </button>

          <button
            onClick={() => setActiveTab("plan")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "plan"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Özel Simülasyon Planı</span>
          </button>

          <button
            onClick={() => setActiveTab("simulation")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "simulation"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold"
                : "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60"
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>4. Canlı Mülakat Odası (Interactive)</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Kayıtlı Raporlar</span>
            {savedCount > 0 && (
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.2 rounded-full text-slate-200">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

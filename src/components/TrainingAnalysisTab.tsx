import React, { useState } from "react";
import {
  BookOpen,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ExternalLink,
  Code2,
  ArrowRight,
  TrendingUp,
  BookmarkPlus,
  Check,
  FileText
} from "lucide-react";
import { TrainingAnalysisResult } from "../types/coach";

interface Props {
  trainingsContent: string;
  setTrainingsContent: (val: string) => void;
  targetRole: string;
  setTargetRole: (val: string) => void;
  currentLevel: string;
  setCurrentLevel: (val: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  onAnalyzeTrainings: () => Promise<void>;
  loading: boolean;
  result: TrainingAnalysisResult | null;
  onProceedToSimulationPlan: () => void;
  onSaveSession: () => void;
}

const SAMPLE_TRAININGS = `- Udemy: Modern React & Redux Toolkit (40 saat) - State management, custom hooks, context API
- Frontend Masters: Advanced TypeScript & Design Patterns (20 saat) - Generics, utility types, AST
- Coursera: Web Performance Optimization & Browser Rendering Engines
- Meta Frontend Developer Professional Certificate (Git, Accessibility, Responsive UI)
- Katılınan Atölye: Docker Temelleri & CI/CD Pipeline entegrasyonu (10 saat)`;

export const TrainingAnalysisTab: React.FC<Props> = ({
  trainingsContent,
  setTrainingsContent,
  targetRole,
  setTargetRole,
  currentLevel,
  setCurrentLevel,
  industry,
  setIndustry,
  onAnalyzeTrainings,
  loading,
  result,
  onProceedToSimulationPlan,
  onSaveSession,
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveSession();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Müfredat Tabanlı Yetkinlik Açığı Analizi (Skill Gap Advisor)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Katıldığınız Eğitimlerden Sonraki Kariyer Adımınızı Tasarlayın
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Bugüne kadar aldığınız kursların, sertifikaların veya atölyelerin içeriklerini girin. Yapay zeka koçunuz mevcut teknik ve yönetsel kaslarınızı haritalandırsın, hedef rolünüz için piyasada eksik kalan kör noktaları bulsun ve bir sonraki adımda almanız gereken nokta atışı eğitim ve sertifika yol haritasını önersin.
          </p>
        </div>
      </div>

      {/* Input Form Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Eğitim Geçmişiniz ve Hedefiniz
          </h2>
          <button
            type="button"
            onClick={() => setTrainingsContent(SAMPLE_TRAININGS)}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            Örnek Eğitim İçeriği Doldur
          </button>
        </div>

        <div className="space-y-5">
          {/* Trainings Content Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Katıldığınız Eğitimlerin İçerikleri, Kurslar, Sertifikalar & Öğrendikleriniz *
              </label>
              <span className="text-[11px] text-slate-500">
                {trainingsContent.length} karakter
              </span>
            </div>
            <textarea
              rows={5}
              value={trainingsContent}
              onChange={(e) => setTrainingsContent(e.target.value)}
              placeholder="Örn: 
- Udemy: İleri Seviye Modern React, Hooks, Redux Toolkit & Performance Optimization
- Frontend Masters: TypeScript Deep Dive & Design Patterns (Generics, AST)
- Meta Frontend Developer Professional Certificate
- AWS Cloud Practitioner Essentials
- Pratik Deneyim: REST API entegrasyonu, Tailwind CSS ile component library..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition leading-relaxed font-mono text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Target Role */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Hedef Pozisyon / Kariyer Hedefi *
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Örn: Senior Frontend Engineer, Tech Lead..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Current Level */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mevcut Seviyeniz
              </label>
              <input
                type="text"
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                placeholder="Örn: Mid-Level (3 yıl deneyim)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Industry */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Hedef Sektör / Odak Alanı
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Örn: FinTech, E-Ticaret, SaaS, Yapay Zeka..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Geçmiş eğitimleriniz incelenip hedef unvanınız için somut gelişim haritası oluşturulacak.
          </p>

          <button
            onClick={onAnalyzeTrainings}
            disabled={loading || !trainingsContent.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Eğitim İçerikleri Analiz Ediliyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Eğitimleri Analiz Et & Sonraki Adımı Belirle</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Top Bar with actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Analiz Tamamlandı:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                {result.recommendedTrainings.length} Öncelikli Eğitim Tavsiyesi
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Kaydedildi!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Raporu Kaydet</span>
                  </>
                )}
              </button>

              <button
                onClick={onProceedToSimulationPlan}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
              >
                <span>3. Adıma Geç: Simülasyon Planı Oluştur</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Coach Summary Callout */}
          {result.coachSummary && (
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">
                    Kariyer Koçundan Stratejik Değerlendirme
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {result.coachSummary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Grid: Strengths vs Skill Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Mevcut Güçlü Kaslarınız
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mevcut eğitimlerinizden kanıtlanan somut yetkinlikler
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {result.currentStrengths.map((str, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200"
                  >
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skill Gaps */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Kritik Yetkinlik Açıkları (Skill Gaps)
                  </h3>
                  <p className="text-xs text-slate-400">
                    {targetRole} seviyesine çıkmak için kapatılması gereken kör noktalar
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {result.skillGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {gap.skill}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          gap.importance.includes("Kritik")
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {gap.importance}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {gap.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Next Step Trainings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  Bir Sonraki Adım İçin Almanız Gereken Öncelikli Eğitimler
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mevcut eğitim profilinizin üzerine tam oturan ve mülakatlarda sizi öne geçirecek müfredatlar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {result.recommendedTrainings.map((train, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 shadow-lg space-y-4 transition"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          train.priority.includes("1") || train.priority.includes("Acil")
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        }`}
                      >
                        {train.priority}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {train.category}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <span>Kariyer Çıktısı:</span>
                      <span className="text-slate-300 font-normal">{train.expectedOutcome}</span>
                    </div>
                  </div>

                  {/* Title and Why */}
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-white">
                      {train.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      💡 <strong className="text-indigo-300">Neden Bu Eğitim:</strong> {train.whyThisTraining}
                    </p>
                  </div>

                  {/* Syllabus Modules */}
                  {train.suggestedCurriculum && train.suggestedCurriculum.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Önerilen Müfredat Başlıkları:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {train.suggestedCurriculum.map((mod, mIdx) => (
                          <div
                            key={mIdx}
                            className="text-xs bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 text-slate-300 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <span>{mod}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Providers & Project Idea */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Providers */}
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                      <span className="font-semibold text-indigo-300 block mb-1">
                        Tavsiye Edilen Kaynak / Sertifika:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {train.recommendedProvidersOrCerts.map((prov, pIdx) => (
                          <span
                            key={pIdx}
                            className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-700"
                          >
                            {prov}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Portfolio Project Idea */}
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1 mb-1">
                        <Code2 className="w-3.5 h-3.5" />
                        Mülakatta Gösterebileceğiniz Proje Fikri:
                      </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {train.portfolioProjectIdea}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 30 - 60 - 90 Days Roadmap */}
          {result.roadmap && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                  30 - 60 - 90 Günlük Upskilling (Gelişim) Yol Haritası
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 30 Days */}
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      İlk 30 Gün
                    </span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
                      Acil Temel
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.roadmap.thirtyDays.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold shrink-0">1.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 60 Days */}
                <div className="bg-slate-950 p-4 rounded-xl border border-sky-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                      30 - 60 Gün
                    </span>
                    <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">
                      Pratik & Proje
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.roadmap.sixtyDays.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold shrink-0">2.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 90 Days */}
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      60 - 90 Gün
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                      Ustalık & Mülakat
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.roadmap.ninetyDays.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">3.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

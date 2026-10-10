import React, { useState } from "react";
import {
  Award,
  Clock,
  CheckCircle2,
  ListOrdered,
  FileCheck,
  AlertCircle,
  Play,
  BookmarkPlus,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { SimulationPlanResult, SimulationQuestion } from "../types/coach";

interface Props {
  interviewerTitle: string;
  setInterviewerTitle: (val: string) => void;
  targetRole: string;
  setTargetRole: (val: string) => void;
  trainingsSummary: string;
  setTrainingsSummary: (val: string) => void;
  targetDate: string;
  setTargetDate: (val: string) => void;
  customFocus: string;
  setCustomFocus: (val: string) => void;
  onGeneratePlan: () => Promise<void>;
  loading: boolean;
  result: SimulationPlanResult | null;
  onLaunchLiveSimulation: (questions: { question: string; category?: string }[]) => void;
  onSaveSession: () => void;
}

export const SimulationPlanTab: React.FC<Props> = ({
  interviewerTitle,
  setInterviewerTitle,
  targetRole,
  setTargetRole,
  trainingsSummary,
  setTrainingsSummary,
  targetDate,
  setTargetDate,
  customFocus,
  setCustomFocus,
  onGeneratePlan,
  loading,
  result,
  onLaunchLiveSimulation,
  onSaveSession,
}) => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveSession();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLaunchMock = () => {
    if (!result) return;
    const questionsToSimulate = result.simulationQuestions.map((sq) => ({
      question: sq.question,
      category: sq.stage,
    }));
    onLaunchLiveSimulation(questionsToSimulate);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Kişiselleştirilmiş Mülakat Simülasyon Planı</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Gerçek Mülakat Öncesi 360 Derece Hazırlık Protokolü
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            "{interviewerTitle || "Mülakatçınız"}" ile gireceğiniz görüşmeyi dakikası dakikasına bir simülasyon planına dönüştürün. Giriş ısınmasından derin teknik sorulara, senaryo çözümlerinden kapanış ters sorularına kadar tüm aşamaları ve kontrol listesini önceden provalayın.
          </p>
        </div>
      </div>

      {/* Input Form Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Simülasyon Parametreleri
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Interviewer Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Mülakatçının Unvanı *
            </label>
            <input
              type="text"
              value={interviewerTitle}
              onChange={(e) => setInterviewerTitle(e.target.value)}
              placeholder="Örn: Senior Tech Lead, İK Direktörü, CTO..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Target Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Hedef Rol *
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Örn: Senior Frontend Developer, Ürün Yöneticisi..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Hedef Mülakat Zamanı
            </label>
            <input
              type="text"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              placeholder="Örn: Bu Cuma saat 14:00, Gelecek hafta..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Custom Focus */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Özel Odaklanmak İstediğiniz Alan
            </label>
            <input
              type="text"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              placeholder="Örn: Sistem Mimarisi & Ölçeklenebilirlik, Stres ve Çatışma Soruları..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Training / Background Summary */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Eğitim ve Deneyim Özeti (Simülasyona Entegre Edilecek)
            </label>
            <input
              type="text"
              value={trainingsSummary}
              onChange={(e) => setTrainingsSummary(e.target.value)}
              placeholder="Örn: Modern React, AWS Temelleri, TypeScript ve 4 yıllık e-ticaret proje deneyimi..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            {interviewerTitle && targetRole
              ? `"${interviewerTitle}" için özel simülasyon takvimi ve aşamaları oluşturulacak.`
              : "Lütfen mülakatçı unvanı ve hedef rolü girin."}
          </p>

          <button
            onClick={onGeneratePlan}
            disabled={loading || !interviewerTitle.trim() || !targetRole.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Simülasyon Planı Oluşturuluyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Özel Simülasyon Planı Oluştur</span>
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
              <span className="text-xs font-semibold text-slate-400 uppercase">Simülasyon Planı:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {result.totalDurationMinutes || 60} Dakika • {result.stages?.length || 4} Aşama
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
                    <span>Planı Kaydet</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLaunchMock}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Bu Planla Canlı Simülasyonu Başlat</span>
              </button>
            </div>
          </div>

          {/* Overview Banner */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {result.simulationTitle}
              </h3>
              <span className="text-xs font-bold text-indigo-300 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
                {interviewerTitle} Rol Modeli
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {result.overview}
            </p>
          </div>

          {/* Stages / Rounds */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-indigo-400" />
              Simülasyon Aşamaları ve Zaman Yönetimi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.stages?.map((stage, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg space-y-3 transition"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                        {stage.stageNumber || idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {stage.name}
                      </h4>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {stage.duration}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-0.5 text-[10px]">
                        Mülakatçının Gizli Amacı:
                      </span>
                      <p className="text-slate-300">{stage.interviewerIntent}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-emerald-400 uppercase tracking-wider block mb-0.5 text-[10px]">
                        Adayın Vermesi Gereken İntiba:
                      </span>
                      <p className="text-slate-300">{stage.candidateGoal}</p>
                    </div>

                    {stage.tips && stage.tips.length > 0 && (
                      <div className="pt-1">
                        <span className="font-semibold text-amber-300 uppercase tracking-wider block mb-1 text-[10px]">
                          Taktik İpuçları:
                        </span>
                        <ul className="space-y-1 text-slate-300">
                          {stage.tips.map((t, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-1.5">
                              <span className="text-indigo-400">›</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Question Pack */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-400" />
                  Simülasyonun Temel Provadaki Soruları
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bu simülasyonda test edeceğiniz en kritik sorular ve anahtar yanıt kriterleri
                </p>
              </div>

              <button
                onClick={handleLaunchMock}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 shadow"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Canlı Odada Başlat</span>
              </button>
            </div>

            <div className="space-y-3">
              {result.simulationQuestions?.map((sq, idx) => (
                <div
                  key={sq.id || idx}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900/50">
                        {sq.stage || `Aşama ${idx + 1}`}
                      </span>
                      <span className="text-xs text-slate-400">
                        Ölçülen: <strong className="text-slate-200">{sq.targetSkill}</strong>
                      </span>
                    </div>
                    {sq.idealResponseTime && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        İdeal Süre: {sq.idealResponseTime}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-white">
                    "{sq.question}"
                  </p>

                  {sq.keyPointsToHit && sq.keyPointsToHit.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                        Cevabınızda Mutlaka Geçmesi Gerekenler:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {sq.keyPointsToHit.map((point, pIdx) => (
                          <span
                            key={pIdx}
                            className="text-xs bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800"
                          >
                            ✓ {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Three Checklists: Pre, During, Post */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pre */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mülakat Öncesi Hazırlık
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.preInterviewChecklist?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-indigo-400 font-bold shrink-0">□</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* During */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mülakat Anı Altın Kuralları
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.duringInterviewRules?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-amber-400 font-bold shrink-0">!</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Post */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mülakat Sonrası Takip
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.postInterviewFollowUp?.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

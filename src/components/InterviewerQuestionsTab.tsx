import React, { useState } from "react";
import {
  Sparkles,
  HelpCircle,
  Brain,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowRight,
  BookmarkPlus
} from "lucide-react";
import { InterviewerAnalysisResult, GeneratedQuestion } from "../types/coach";

interface Props {
  interviewerTitle: string;
  setInterviewerTitle: (val: string) => void;
  targetRole: string;
  setTargetRole: (val: string) => void;
  targetCompany: string;
  setTargetCompany: (val: string) => void;
  candidateSeniority: string;
  setCandidateSeniority: (val: string) => void;
  extraNotes: string;
  setExtraNotes: (val: string) => void;
  onGenerateQuestions: () => Promise<void>;
  loading: boolean;
  result: InterviewerAnalysisResult | null;
  onStartSimulationWithQuestions: (questions: GeneratedQuestion[]) => void;
  onSaveSession: () => void;
}

const COMMON_TITLES = [
  "Senior Tech Lead",
  "Engineering Manager",
  "Head of People & HR Director",
  "Chief Technology Officer (CTO)",
  "VP of Product / Head of Product",
  "Head of Data & AI",
  "Managing Director / Founder",
  "Talent Acquisition Lead"
];

export const InterviewerQuestionsTab: React.FC<Props> = ({
  interviewerTitle,
  setInterviewerTitle,
  targetRole,
  setTargetRole,
  targetCompany,
  setTargetCompany,
  candidateSeniority,
  setCandidateSeniority,
  extraNotes,
  setExtraNotes,
  onGenerateQuestions,
  loading,
  result,
  onStartSimulationWithQuestions,
  onSaveSession,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = () => {
    onSaveSession();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const filteredQuestions = result?.questions.filter((q) => {
    if (selectedCategory === "all") return true;
    return q.category.toLowerCase().includes(selectedCategory.toLowerCase());
  }) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Brain className="w-3.5 h-3.5" />
            <span>Mülakatçı Unvan Analizi & Rol Odaklı Soru Motoru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mülakatçının Unvanına Göre Zihnini Okuyun
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Farklı unvandaki mülakatçılar bambaşka merceklerden bakar. Bir CTO mimari vizyonu ve riskleri test ederken, bir İK Direktörü şirket kültürü ve aidiyet motivasyonunu, bir Tech Lead ise kod kalitesi ve pragmatik çözüm becerisini tartar. Mülakatçınızın unvanını verin; size sorabileceği soruları, gizli kriterlerini ve ideal cevap stratejilerini anında üretelim.
          </p>
        </div>
      </div>

      {/* Input Form Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Mülakat ve Katılımcı Bilgileri
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Interviewer Title */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Mülakata Katılacak Kişinin Unvanı (Interviewer Title) *
            </label>
            <input
              type="text"
              value={interviewerTitle}
              onChange={(e) => setInterviewerTitle(e.target.value)}
              placeholder="Örn: Senior Tech Lead, Chief Technology Officer (CTO), İK Direktörü, Head of Product..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 self-center mr-1">Önerilenler:</span>
              {COMMON_TITLES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setInterviewerTitle(t)}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 transition"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Target Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Başvurduğunuz / Hedef Pozisyon (Target Role) *
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Örn: Senior Frontend Developer, Product Manager, Cloud Architect..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Target Company */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Şirket / Sektör Türü (Opsiyonel)
            </label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="Örn: FinTech Scaleup, Global B2B SaaS, E-Ticaret, Bankacılık..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Seniority */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Aday Deneyim Seviyeniz
            </label>
            <select
              value={candidateSeniority}
              onChange={(e) => setCandidateSeniority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="Junior (0-2 Yıl)">Junior (0-2 Yıl)</option>
              <option value="Mid-Level (2-5 Yıl)">Mid-Level (2-5 Yıl)</option>
              <option value="Senior (5-8 Yıl)">Senior (5-8 Yıl)</option>
              <option value="Lead / Staff (8+ Yıl)">Lead / Staff (8+ Yıl)</option>
              <option value="Executive / Müdür (Yönetici)">Executive / Müdür (Yönetici)</option>
            </select>
          </div>

          {/* Extra Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Ek Bilgiler / İpuçları (Opsiyonel)
            </label>
            <input
              type="text"
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              placeholder="Örn: Mülakat 45 dakika olacak, kod incelemesi veya vaka çalışması bekleniyor..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            {interviewerTitle ? (
              <span className="text-indigo-300 font-medium">"{interviewerTitle}"</span>
            ) : (
              "Lütfen mülakatçı unvanı girin"
            )}{" "}
            için derin psikolojik ve teknik soru haritası çıkarılacak.
          </p>

          <button
            onClick={onGenerateQuestions}
            disabled={loading || !interviewerTitle.trim() || !targetRole.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Mülakatçı Analiz Ediliyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Mülakatçı Sorularını ve Taktiklerini Üret</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Üretilen Soru:</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                {result.questions.length} Soru & Strateji
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
                    <span>Oturumu Kaydet</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onStartSimulationWithQuestions(result.questions)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Bu Sorularla Canlı Simülasyon Başlat</span>
              </button>
            </div>
          </div>

          {/* Interviewer Psychology Card */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Mülakatçının Zihin Haritası ({interviewerTitle})
                  </h3>
                  <p className="text-xs text-indigo-300 mt-0.5">
                    Bu unvanın adayda aradığı kritik sinyaller ve değerlendirme psikolojisi
                  </p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {result.interviewerPsychology}
                </p>

                {/* Evaluation Dimensions */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Mülakatçının Puanladığı Temel Boyutlar:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.evaluationDimensions.map((dim, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 rounded-lg bg-indigo-950/80 text-indigo-200 border border-indigo-700/50 font-medium"
                      >
                        ✓ {dim}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 mr-1">Filtrele:</span>
            {["all", "teknik", "davranışsal", "senaryo", "liderlik", "kültürel"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {cat === "all" ? "Tüm Sorular" : cat}
              </button>
            ))}
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-4">
            {filteredQuestions.map((q, index) => {
              const isExpanded = expandedQuestionId === q.id || (!expandedQuestionId && index === 0);

              return (
                <div
                  key={q.id || index}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden transition shadow-lg"
                >
                  {/* Question Header Bar */}
                  <div
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none hover:bg-slate-850/50"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          Soru #{index + 1}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                          {q.category}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            q.difficulty.includes("Zor")
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white leading-snug">
                        "{q.question}"
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(q.id, q.question);
                        }}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        title="Soruyu Kopyala"
                      >
                        {copiedId === q.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-2 border-t border-slate-800/80 space-y-5 bg-slate-950/40">
                      {/* Why They Ask */}
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5">
                          <HelpCircle className="w-4 h-4" />
                          <span>Bu Unvan Bu Soruyu Neden Sorar? (Gizli Amaç)</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {q.whyTheyAsk}
                        </p>
                      </div>

                      {/* Ideal Strategy & STAR */}
                      <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-900/40">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                          <Lightbulb className="w-4 h-4" />
                          <span>İdeal Cevap Stratejisi & STAR Formülü</span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {q.idealStrategy}
                        </p>
                      </div>

                      {/* Pitfalls to Avoid */}
                      {q.pitfallsToAvoid && q.pitfallsToAvoid.length > 0 && (
                        <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/30">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Kaçınılması Gereken Tehlikeli Hatalar (Red Flags)</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-rose-200/90 list-disc list-inside">
                            {q.pitfallsToAvoid.map((pitfall, pIdx) => (
                              <li key={pIdx}>{pitfall}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sample High-Impact Answer */}
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Örnek Güçlü Cevap Taslağı</span>
                          </div>
                          <button
                            onClick={() => handleCopy(`ans-${q.id}`, q.sampleAnswer)}
                            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                          >
                            {copiedId === `ans-${q.id}` ? (
                              <span className="text-emerald-400">Kopyalandı</span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Cevabı Kopyala</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed whitespace-pre-line bg-slate-950 p-3 rounded-lg border border-slate-800">
                          "{q.sampleAnswer}"
                        </p>
                      </div>

                      {/* Probing Follow-Up Trap */}
                      {q.probingFollowUp && (
                        <div className="bg-sky-950/20 p-3.5 rounded-xl border border-sky-800/30 flex items-start gap-3">
                          <div className="text-xs font-semibold text-sky-400 shrink-0 uppercase tracking-wider">
                            Muhtemel Takip Sorusu:
                          </div>
                          <p className="text-xs text-sky-200 italic">
                            "{q.probingFollowUp}"
                          </p>
                        </div>
                      )}

                      {/* Practice this specific question */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => onStartSimulationWithQuestions([q])}
                          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Bu Soruyu Canlı Mülakatta Pratik Yap</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reverse Questions Section */}
          {result.reverseQuestionsToAsk && result.reverseQuestionsToAsk.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                  Mülakatın Sonunda {interviewerTitle} Unvanına Sorman Gereken Stratejik Ters Sorular
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                "Bize sormak istediğiniz bir soru var mı?" dendiğinde bu soruları sormanız mülakatçıyı derinden etkiler:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.reverseQuestionsToAsk.map((rq, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/40">
                        Ters Soru #{idx + 1}
                      </span>
                      <p className="text-sm font-semibold text-white mt-2.5 mb-2 leading-snug">
                        "{rq.question}"
                      </p>
                    </div>
                    <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 mt-2">
                      💡 <strong className="text-slate-300">Neden Etkileyici:</strong> {rq.whyItImpresses}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import {
  PlayCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  Copy,
  Check,
  Brain,
  ShieldCheck,
  Star
} from "lucide-react";
import { MockTurnEvaluation, MockTurnRecord, FinalMockReport } from "../types/coach";

interface QuestionItem {
  question: string;
  category?: string;
}

interface Props {
  interviewerTitle: string;
  targetRole: string;
  questions: QuestionItem[];
  onFinishSession?: (report: FinalMockReport) => void;
}

const DEFAULT_QUESTIONS: QuestionItem[] = [
  {
    question: "Bize kendinizden, kariyer yolculuğunuzdan ve son dönemde çözdüğünüz en zorlu teknik/iş probleminden bahseder misiniz?",
    category: "Giriş & Buz Kırma",
  },
  {
    question: "Diyelim ki ekiple birlikte teslim tarihi çok yakın olan bir projede beklenmedik bir mimari veya performans tıkanıklığı keşfettiniz. Bu krizi nasıl yönetirsiniz?",
    category: "Kriz & Senaryo Çözümü",
  },
  {
    question: "Bir ekip arkadaşınız veya yöneticinizle teknik ya da ürün kararı konusunda fikir ayrılığına düştüğünüz somut bir olayı ve bunu nasıl çözdüğünüzü anlatır mısınız?",
    category: "Davranışsal & STAR (Çatışma Yönetimi)",
  },
  {
    question: "Önümüzdeki 1-2 yıl içinde kendinizi bu pozisyonda ve sektörde nerede görüyorsunuz, ekibimize katacağınız en ayırt edici değer ne olacak?",
    category: "Vizyon & Katma Değer",
  },
];

export const LiveSimulationTab: React.FC<Props> = ({
  interviewerTitle = "Senior Tech Lead",
  targetRole = "Senior Yazılım Mühendisi",
  questions = DEFAULT_QUESTIONS,
  onFinishSession,
}) => {
  const activeQuestions = questions.length > 0 ? questions : DEFAULT_QUESTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [candidateInput, setCandidateInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentTurnEval, setCurrentTurnEval] = useState<MockTurnEvaluation | null>(null);
  const [history, setHistory] = useState<MockTurnRecord[]>([]);
  const [finalReport, setFinalReport] = useState<FinalMockReport | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Audio / Speech settings
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);

  const currentQ = activeQuestions[currentIndex];

  // TTS: speak current question
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Speak question when index changes or simulation starts
  useEffect(() => {
    if (currentQ && !finalReport) {
      speakText(currentQ.question);
    }
  }, [currentIndex, currentQ, finalReport]);

  // Speech Recognition (STT) setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "tr-TR";

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateInput((prev) => (prev ? prev + " " + transcript : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Tarayıcınız sesle yazmayı (Speech Recognition) desteklemiyor. Lütfen cevabınızı metin kutusuna yazınız.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Mic start error", err);
      }
    }
  };

  // Submit Answer for Real-time Evaluation
  const handleSubmitAnswer = async () => {
    if (!candidateInput.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/coach/mock-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewerTitle,
          targetRole,
          question: currentQ.question,
          candidateAnswer: candidateInput,
          questionIndex: currentIndex,
          totalQuestions: activeQuestions.length,
          history: history.map((h) => ({
            question: h.question,
            answer: h.candidateAnswer,
            score: h.evaluation.scoreOutOf10,
          })),
        }),
      });

      if (!res.ok) throw new Error("Cevap değerlendirilemedi.");
      const data: MockTurnEvaluation = await res.json();

      setCurrentTurnEval(data);

      const record: MockTurnRecord = {
        question: currentQ.question,
        candidateAnswer: candidateInput,
        evaluation: data,
        timestamp: new Date().toLocaleTimeString(),
      };
      setHistory((prev) => [...prev, record]);

      // Read interviewer reaction aloud
      if (data.interviewerReaction) {
        speakText(data.interviewerReaction);
      }
    } catch (err: any) {
      alert(err.message || "Simülasyon turu sırasında bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  // Advance to Next Question or Final Evaluation
  const handleNextQuestion = async () => {
    setCurrentTurnEval(null);
    setCandidateInput("");

    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // All questions done! Request Final Scorecard
      await handleGenerateFinalReport();
    }
  };

  // Retry this question
  const handleRetryQuestion = () => {
    setCurrentTurnEval(null);
    setCandidateInput("");
  };

  // Final Comprehensive Scorecard
  const handleGenerateFinalReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch("/api/coach/mock-final-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewerTitle,
          targetRole,
          turns: history,
        }),
      });

      if (!res.ok) throw new Error("Final raporu oluşturulamadı.");
      const report: FinalMockReport = await res.json();
      setFinalReport(report);
      if (onFinishSession) {
        onFinishSession(report);
      }
    } catch (err: any) {
      alert(err.message || "Final değerlendirmesi yapılırken bir hata oluştu.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCandidateInput("");
    setCurrentTurnEval(null);
    setHistory([]);
    setFinalReport(null);
  };

  const handleCopyReport = () => {
    if (!finalReport) return;
    const text = `=== MÜLAKAT PERFORMANS RAPORU ===
Mülakatçı: ${interviewerTitle}
Hedef Rol: ${targetRole}
Genel Skor: ${finalReport.overallScore}/100 (Not: ${finalReport.letterGrade})
Karar: ${finalReport.hiringDecision}

Yetkinlik Puanları:
- Alan / Teknik Hakimiyet: ${finalReport.radarScores.domainExpertise}/10
- İfade Netliği ve Özgüven: ${finalReport.radarScores.communicationClarity}/10
- STAR Yapılandırması: ${finalReport.radarScores.starStructure}/10
- İş Etkisi (Business Impact): ${finalReport.radarScores.businessImpact}/10
- Mülakatçı Uyumu: ${finalReport.radarScores.interviewerAlignment}/10

En Büyük Zaferler:
${finalReport.topWins.map((w) => `• ${w}`).join("\n")}

Kritik Gelişim Alanları:
${finalReport.criticalGapsToFix.map((g) => `• ${g}`).join("\n")}

Altın Tavsiye: ${finalReport.finalGoldenAdvice}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Canlı Rol Yapma & Gerçek Zamanlı Koçluk Odası</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            "{interviewerTitle}" ile Canlı Mülakat Simülasyonu
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Yapay zeka karşınızdaki gerçek mülakatçının rolüne bürünür. Soruyu sesli veya yazılı dinleyin, mikrofonla veya klavyenizle yanıtlayın. Her cevabınızın ardından STAR modeliyle anlık puanınızı, mülakatçının tepkisini ve cevabınızı mükemmelleştirecek koçluk tüyonuzu görün.
          </p>
        </div>
      </div>

      {/* Main Simulation Chamber */}
      {!finalReport ? (
        <div className="space-y-6">
          {/* Progress & Status Header */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                #{currentIndex + 1}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Soru {currentIndex + 1} / {activeQuestions.length}
                </span>
                <span className="text-xs font-medium text-emerald-400">
                  {currentQ?.category || "Genel Değerlendirme"}
                </span>
              </div>
            </div>

            {/* Audio Toggle & Restart */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                  ttsEnabled
                    ? "bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-750"
                    : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400"
                }`}
                title={ttsEnabled ? "Sesli Okuma Açık" : "Sesli Okuma Kapalı"}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{ttsEnabled ? "Ses Açık" : "Sessiz"}</span>
              </button>

              <button
                onClick={handleRestart}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition flex items-center gap-1"
                title="Simülasyonu Baştan Başlat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Baştan Başla</span>
              </button>
            </div>
          </div>

          {/* Interviewer Speech Card */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20">
                <Brain className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {interviewerTitle}
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                        Mülakatçı
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Hedef Pozisyon: {targetRole}</p>
                  </div>

                  <button
                    onClick={() => speakText(currentQ.question)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Soruyu Sesli Dinle"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-base sm:text-lg leading-relaxed shadow-inner">
                  "{currentQ.question}"
                </div>
              </div>
            </div>
          </div>

          {/* Candidate Answer Box (if turn not yet evaluated) */}
          {!currentTurnEval ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>Cevabınız (STAR Modeliyle Yanıtlayın)</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Durum • Görev • Aldığınız Eylem • Ölçülebilir Sonuç)
                  </span>
                </label>

                {/* Mic Button */}
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  }`}
                  title="Mikrofon ile Türkçe konuşarak yazdırın"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Dinleniyor... (Durdur)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Sesle Yanıtla (Mikrofon)</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={5}
                value={candidateInput}
                onChange={(e) => setCandidateInput(e.target.value)}
                placeholder="Örn: 'Önceki şirketimde benzer bir krizle karşılaştık (Durum). Sistemde veri kaybını engellememiz gerekiyordu (Görev). Hemen ekiple mini bir savaş odası kurdum ve geçici read-only cache katmanı geliştirdim (Eylem). Sonuç olarak downtime'ı 15 dakikada çözdük ve sistem %99.9 erişilebilirlikle çalıştı (Sonuç)...'"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  {candidateInput.length > 50
                    ? `✓ ${candidateInput.length} karakter yazıldı.`
                    : "İpucu: Somut metrikler ve 'Ben' odaklı aksiyonlar puanınızı yükseltir."}
                </span>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !candidateInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mülakatçı Değerlendiriyor...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Cevabımı Gönder & Koçluk Al</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Realtime Turn Evaluation & Feedback Card */
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Header with score */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold text-lg shadow-lg ${
                      currentTurnEval.scoreOutOf10 >= 8
                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40"
                        : currentTurnEval.scoreOutOf10 >= 6
                        ? "bg-amber-600/20 text-amber-400 border border-amber-500/40"
                        : "bg-rose-600/20 text-rose-400 border border-rose-500/40"
                    }`}
                  >
                    <span>{currentTurnEval.scoreOutOf10}</span>
                    <span className="text-[10px] text-slate-400 font-normal">/ 10</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Anlık Koçluk Değerlendirmesi
                    </h4>
                    <p className="text-xs text-slate-400">
                      {currentTurnEval.scoreOutOf10 >= 8
                        ? "🌟 Mükemmel ve İkna Edici STAR Yanıtı!"
                        : currentTurnEval.scoreOutOf10 >= 6
                        ? "👍 İyi Bir Başlangıç, Parlatılabilir."
                        : "⚠️ Geliştirilmesi Gereken Temel Eksikler Var."}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetryQuestion}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Bu Soruyu Tekrar Yanıtla</span>
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    disabled={generatingReport}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition"
                  >
                    {currentIndex + 1 < activeQuestions.length ? (
                      <>
                        <span>Sıradaki Soruya Geç (#{currentIndex + 2})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <Award className="w-3.5 h-3.5" />
                        <span>Simülasyonu Bitir & Karnemi Çıkar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Interviewer Verbal Reaction in Persona */}
              <div className="bg-slate-950 p-4 rounded-xl border border-indigo-900/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Brain className="w-4 h-4" />
                    Mülakatçının Doğal Tepkisi ({interviewerTitle}):
                  </span>
                  <button
                    onClick={() => speakText(currentTurnEval.interviewerReaction)}
                    className="text-slate-400 hover:text-white"
                    title="Sesli Dinle"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  "{currentTurnEval.interviewerReaction}"
                </p>
              </div>

              {/* STAR Framework Analysis */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  STAR Çerçevesi İncelemesi:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="font-bold text-indigo-400 block mb-0.5">S (Situation / Durum):</span>
                    <span className="text-slate-300">{currentTurnEval.starAnalysis?.situation}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="font-bold text-sky-400 block mb-0.5">T (Task / Görev):</span>
                    <span className="text-slate-300">{currentTurnEval.starAnalysis?.task}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400 block mb-0.5">A (Action / Eylem):</span>
                    <span className="text-slate-300">{currentTurnEval.starAnalysis?.action}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                    <span className="font-bold text-amber-400 block mb-0.5">R (Result / Sonuç):</span>
                    <span className="text-slate-300">{currentTurnEval.starAnalysis?.result}</span>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Güçlü Yanlarınız</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-200/90 list-disc list-inside">
                    {currentTurnEval.strengths?.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-900/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Eksik / Geliştirilebilir Kısımlar</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-rose-200/90 list-disc list-inside">
                    {currentTurnEval.improvements?.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Answer Polish */}
              {currentTurnEval.modelAnswerPolish && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Bu Cevabı 10/10 Yapacak Parlatma Önerisi:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{currentTurnEval.modelAnswerPolish}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Final Scorecard (Mülakat Karnesi) */
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Award className="w-3.5 h-3.5" />
                <span>Mülakat Tamamlandı • Performans Raporu</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Simülasyon Karnesi & İşe Alım Kararı
              </h2>
              <p className="text-xs text-slate-400">
                Mülakatçı: <span className="text-slate-200">{interviewerTitle}</span> • Pozisyon:{" "}
                <span className="text-slate-200">{targetRole}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyReport}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Rapor Kopyalandı!" : "Raporu Kopyala"}</span>
              </button>

              <button
                onClick={handleRestart}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Yeni Simülasyon Başlat</span>
              </button>
            </div>
          </div>

          {/* Scores Overview Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Overall Score */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-inner">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-2xl flex items-center justify-center">
                {finalReport.overallScore}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Genel Başarı Skoru
                </span>
                <span className="text-lg font-bold text-white">
                  100 Üzerinden {finalReport.overallScore}
                </span>
                <span className="text-xs text-slate-500 block">
                  Harf Notu: <strong className="text-emerald-400">{finalReport.letterGrade}</strong>
                </span>
              </div>
            </div>

            {/* Hiring Decision */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center gap-4 shadow-inner md:col-span-2">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Mülakatçı Kararı (Hiring Decision)
                </span>
                <span className="text-xl font-extrabold text-indigo-300">
                  {finalReport.hiringDecision}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  Gerçek mülakatta bu performansla komiteden geçme ve teklif alma olasılığı yüksektir.
                </p>
              </div>
            </div>
          </div>

          {/* 5-Dimension Radar Competencies */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              5 Temel Yetkinlik Boyut Puanları (10 Üzerinden)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Alan / Teknik Hakimiyet</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {finalReport.radarScores.domainExpertise} / 10
                </span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">İfade Netliği & Özgüven</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {finalReport.radarScores.communicationClarity} / 10
                </span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">STAR Yapılandırması</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {finalReport.radarScores.starStructure} / 10
                </span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">İş Etkisi (ROI / Metrik)</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {finalReport.radarScores.businessImpact} / 10
                </span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block">Mülakatçı Unvanına Uyum</span>
                <span className="text-xl font-bold text-white mt-1 block">
                  {finalReport.radarScores.interviewerAlignment} / 10
                </span>
              </div>
            </div>
          </div>

          {/* Top Wins & Critical Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wins */}
            <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-900/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  En Büyük Zaferleriniz (Harika Yaptıklarınız)
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-emerald-200">
                {finalReport.topWins.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-emerald-950">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Gaps */}
            <div className="bg-rose-950/20 p-5 rounded-2xl border border-rose-900/40 space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  Gerçek Mülakata Kadar Düzeltilecek Açıklar
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-rose-200">
                {finalReport.criticalGapsToFix.map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-rose-950">
                    <span className="text-rose-400 font-bold shrink-0">!</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Golden Advice */}
          {finalReport.finalGoldenAdvice && (
            <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/40 flex items-start gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                  Mülakat Sabahı İçin Altın Koçluk Tavsiyesi
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  "{finalReport.finalGoldenAdvice}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

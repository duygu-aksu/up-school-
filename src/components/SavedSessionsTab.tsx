import React from "react";
import { History, Trash2, ExternalLink, Calendar, Briefcase, Award, Sparkles, BookOpen } from "lucide-react";
import { SavedSession } from "../types/coach";

interface Props {
  savedSessions: SavedSession[];
  onLoadSession: (session: SavedSession) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
}

export const SavedSessionsTab: React.FC<Props> = ({
  savedSessions,
  onLoadSession,
  onDeleteSession,
  onClearAll,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Kayıtlı Hazırlık ve Simülasyon Oturumları
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Daha önce ürettiğiniz soru paketleri, eğitim analizleri ve mülakat karneleri yerel tarayıcınızda saklanır.
          </p>
        </div>

        {savedSessions.length > 0 && (
          <button
            onClick={onClearAll}
            className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Tüm Geçmişi Temizle</span>
          </button>
        )}
      </div>

      {/* List */}
      {savedSessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Henüz Kayıtlı Oturum Yok</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Mülakatçı soruları ürettiğinizde veya eğitim analizi yaptığınızda "Oturumu Kaydet" butonuna basarak buraya ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedSessions.map((session) => (
            <div
              key={session.id}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-5 shadow-lg space-y-3 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {session.date}
                  </span>
                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="Bu Kaydı Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  {session.interviewerTitle}
                </h4>
                <p className="text-xs text-slate-300">
                  Hedef Pozisyon: <span className="font-semibold text-slate-100">{session.targetRole}</span>
                </p>

                {/* Badges of what was saved in this session */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {session.questionsResult && (
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {session.questionsResult.questions.length} Soru
                    </span>
                  )}
                  {session.trainingResult && (
                    <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Eğitim Analizi
                    </span>
                  )}
                  {session.simulationPlan && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Simülasyon Planı
                    </span>
                  )}
                  {session.finalMockReport && (
                    <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                      Karne: {session.finalMockReport.overallScore}/100 ({session.finalMockReport.letterGrade})
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => onLoadSession(session)}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Bu Oturumu Yükle & İncele</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

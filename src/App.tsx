/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { InterviewerQuestionsTab } from "./components/InterviewerQuestionsTab";
import { TrainingAnalysisTab } from "./components/TrainingAnalysisTab";
import { SimulationPlanTab } from "./components/SimulationPlanTab";
import { LiveSimulationTab } from "./components/LiveSimulationTab";
import { SavedSessionsTab } from "./components/SavedSessionsTab";
import { PresetScenario, PRESET_SCENARIOS } from "./data/presets";
import {
  InterviewerAnalysisResult,
  TrainingAnalysisResult,
  SimulationPlanResult,
  FinalMockReport,
  SavedSession,
  GeneratedQuestion
} from "./types/coach";

const LOCAL_STORAGE_KEY = "coach_saved_sessions_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState<"questions" | "training" | "plan" | "simulation" | "history">("questions");

  // Core Form State
  const [interviewerTitle, setInterviewerTitle] = useState("Senior Tech Lead");
  const [targetRole, setTargetRole] = useState("Senior Frontend Engineer (React / TypeScript)");
  const [targetCompany, setTargetCompany] = useState("FinTech Scale-Up");
  const [candidateSeniority, setCandidateSeniority] = useState("Mid-Level (2-5 Yıl)");
  const [extraNotes, setExtraNotes] = useState("");

  const [trainingsContent, setTrainingsContent] = useState(
    `- Udemy: İleri Seviye Modern React, Hooks, Redux Toolkit & Performance Optimization (40 saat)
- Frontend Masters: TypeScript Deep Dive & Design Patterns (25 saat)
- Coursera: Web Performance, Core Web Vitals & Browser Rendering Pipeline
- Meta Frontend Developer Professional Certificate (Git & CI/CD temelleri)
- Kişisel Projeler: E-ticaret sepet mikroservis entegrasyonu, Real-time Dashboard (WebSockets)`
  );
  const [currentLevel, setCurrentLevel] = useState("Mid-Level (3.5 yıl deneyim)");
  const [industry, setIndustry] = useState("Finansal Teknolojiler & B2B SaaS");

  const [targetDate, setTargetDate] = useState("Önümüzdeki hafta");
  const [customFocus, setCustomFocus] = useState("Sistem Mimarisi & Canlı Problem Çözme");

  // Results State
  const [questionsResult, setQuestionsResult] = useState<InterviewerAnalysisResult | null>(null);
  const [trainingResult, setTrainingResult] = useState<TrainingAnalysisResult | null>(null);
  const [simulationPlanResult, setSimulationPlanResult] = useState<SimulationPlanResult | null>(null);
  const [liveQuestions, setLiveQuestions] = useState<{ question: string; category?: string }[]>([]);

  // Loading States
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingTraining, setLoadingTraining] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Saved Sessions
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  // Load saved sessions on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSavedSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved sessions", e);
    }
  }, []);

  // Save to LocalStorage helper
  const handleSaveSession = (overrideReport?: FinalMockReport) => {
    const newSession: SavedSession = {
      id: "session-" + Date.now(),
      date: new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      interviewerTitle,
      targetRole,
      questionsResult: questionsResult || undefined,
      trainingResult: trainingResult || undefined,
      simulationPlan: simulationPlanResult || undefined,
      finalMockReport: overrideReport || undefined,
    };

    const updated = [newSession, ...savedSessions];
    setSavedSessions(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save session to localStorage", e);
    }
  };

  const handleDeleteSession = (id: string) => {
    const updated = savedSessions.filter((s) => s.id !== id);
    setSavedSessions(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleClearAllSessions = () => {
    if (confirm("Tüm kayıtlı geçmişi silmek istediğinizden emin misiniz?")) {
      setSavedSessions([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleLoadSession = (session: SavedSession) => {
    setInterviewerTitle(session.interviewerTitle);
    setTargetRole(session.targetRole);
    if (session.questionsResult) setQuestionsResult(session.questionsResult);
    if (session.trainingResult) setTrainingResult(session.trainingResult);
    if (session.simulationPlan) setSimulationPlanResult(session.simulationPlan);
    setActiveTab("questions");
  };

  // Preset Scenario Loaded
  const handleSelectPreset = (preset: PresetScenario) => {
    setInterviewerTitle(preset.interviewerTitle);
    setTargetRole(preset.targetRole);
    setTargetCompany(preset.targetCompany);
    setCandidateSeniority(preset.candidateSeniority);
    setTrainingsContent(preset.trainingsContent);
  };

  // 1. Generate Interviewer Questions
  const handleGenerateQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/coach/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewerTitle,
          targetRole,
          targetCompany,
          candidateSeniority,
          extraNotes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Soru üretimi başarısız oldu.");
      }

      const data: InterviewerAnalysisResult = await res.json();
      setQuestionsResult(data);
    } catch (err: any) {
      alert(err.message || "Bir hata oluştu.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // 2. Analyze Attended Trainings
  const handleAnalyzeTrainings = async () => {
    setLoadingTraining(true);
    try {
      const res = await fetch("/api/coach/analyze-trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainingsContent,
          targetRole,
          currentLevel,
          industry,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Eğitim analizi başarısız oldu.");
      }

      const data: TrainingAnalysisResult = await res.json();
      setTrainingResult(data);
    } catch (err: any) {
      alert(err.message || "Eğitim analizi sırasında bir hata oluştu.");
    } finally {
      setLoadingTraining(false);
    }
  };

  // 3. Generate Simulation Plan
  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch("/api/coach/simulation-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewerTitle,
          targetRole,
          trainingsSummary: trainingsContent.substring(0, 300),
          targetDate,
          customFocus,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Simülasyon planı oluşturulamadı.");
      }

      const data: SimulationPlanResult = await res.json();
      setSimulationPlanResult(data);
    } catch (err: any) {
      alert(err.message || "Plan oluşturulurken bir hata oluştu.");
    } finally {
      setLoadingPlan(false);
    }
  };

  // Start live mock simulation with question set
  const handleStartSimulationWithQuestions = (questions: { question: string; category?: string }[]) => {
    setLiveQuestions(questions);
    setActiveTab("simulation");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectPreset={handleSelectPreset}
        savedCount={savedSessions.length}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "questions" && (
          <InterviewerQuestionsTab
            interviewerTitle={interviewerTitle}
            setInterviewerTitle={setInterviewerTitle}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            targetCompany={targetCompany}
            setTargetCompany={setTargetCompany}
            candidateSeniority={candidateSeniority}
            setCandidateSeniority={setCandidateSeniority}
            extraNotes={extraNotes}
            setExtraNotes={setExtraNotes}
            onGenerateQuestions={handleGenerateQuestions}
            loading={loadingQuestions}
            result={questionsResult}
            onStartSimulationWithQuestions={handleStartSimulationWithQuestions}
            onSaveSession={() => handleSaveSession()}
          />
        )}

        {activeTab === "training" && (
          <TrainingAnalysisTab
            trainingsContent={trainingsContent}
            setTrainingsContent={setTrainingsContent}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            currentLevel={currentLevel}
            setCurrentLevel={setCurrentLevel}
            industry={industry}
            setIndustry={setIndustry}
            onAnalyzeTrainings={handleAnalyzeTrainings}
            loading={loadingTraining}
            result={trainingResult}
            onProceedToSimulationPlan={() => setActiveTab("plan")}
            onSaveSession={() => handleSaveSession()}
          />
        )}

        {activeTab === "plan" && (
          <SimulationPlanTab
            interviewerTitle={interviewerTitle}
            setInterviewerTitle={setInterviewerTitle}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            trainingsSummary={trainingsContent}
            setTrainingsSummary={setTrainingsContent}
            targetDate={targetDate}
            setTargetDate={setTargetDate}
            customFocus={customFocus}
            setCustomFocus={setCustomFocus}
            onGeneratePlan={handleGeneratePlan}
            loading={loadingPlan}
            result={simulationPlanResult}
            onLaunchLiveSimulation={handleStartSimulationWithQuestions}
            onSaveSession={() => handleSaveSession()}
          />
        )}

        {activeTab === "simulation" && (
          <LiveSimulationTab
            interviewerTitle={interviewerTitle}
            targetRole={targetRole}
            questions={
              liveQuestions.length > 0
                ? liveQuestions
                : questionsResult?.questions.map((q) => ({ question: q.question, category: q.category })) || []
            }
            onFinishSession={(report) => handleSaveSession(report)}
          />
        )}

        {activeTab === "history" && (
          <SavedSessionsTab
            savedSessions={savedSessions}
            onLoadSession={handleLoadSession}
            onDeleteSession={handleDeleteSession}
            onClearAll={handleClearAllSessions}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Kariyer & Mülakat Koçu AI • Mülakatçı Psikolojisi, Eğitim Analizi & Canlı Simülasyon Motoru
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Model: Gemini 3.8 Flash</span>
            <span>•</span>
            <span>STAR Değerlendirme Modeli</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

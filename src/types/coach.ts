export interface GeneratedQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  whyTheyAsk: string;
  idealStrategy: string;
  pitfallsToAvoid: string[];
  sampleAnswer: string;
  probingFollowUp: string;
}

export interface ReverseQuestion {
  question: string;
  whyItImpresses: string;
}

export interface InterviewerAnalysisResult {
  interviewerPsychology: string;
  evaluationDimensions: string[];
  questions: GeneratedQuestion[];
  reverseQuestionsToAsk: ReverseQuestion[];
}

export interface SkillGap {
  skill: string;
  importance: "Kritik" | "Yüksek" | "Orta" | string;
  description: string;
}

export interface RecommendedTraining {
  title: string;
  priority: string;
  category: string;
  whyThisTraining: string;
  suggestedCurriculum: string[];
  recommendedProvidersOrCerts: string[];
  portfolioProjectIdea: string;
  expectedOutcome: string;
}

export interface TrainingAnalysisResult {
  currentStrengths: string[];
  skillGaps: SkillGap[];
  recommendedTrainings: RecommendedTraining[];
  roadmap: {
    thirtyDays: string[];
    sixtyDays: string[];
    ninetyDays: string[];
  };
  coachSummary: string;
}

export interface SimulationStage {
  stageNumber: number;
  name: string;
  duration: string;
  interviewerIntent: string;
  candidateGoal: string;
  tips: string[];
}

export interface SimulationQuestion {
  id: string;
  stage: string;
  question: string;
  targetSkill: string;
  idealResponseTime: string;
  keyPointsToHit: string[];
}

export interface SimulationPlanResult {
  simulationTitle: string;
  overview: string;
  totalDurationMinutes: number;
  stages: SimulationStage[];
  simulationQuestions: SimulationQuestion[];
  preInterviewChecklist: string[];
  duringInterviewRules: string[];
  postInterviewFollowUp: string[];
}

export interface MockTurnEvaluation {
  interviewerReaction: string;
  scoreOutOf10: number;
  starAnalysis: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  strengths: string[];
  improvements: string[];
  modelAnswerPolish: string;
  isInterviewComplete: boolean;
}

export interface MockTurnRecord {
  question: string;
  candidateAnswer: string;
  evaluation: MockTurnEvaluation;
  timestamp: string;
}

export interface FinalMockReport {
  overallScore: number;
  letterGrade: string;
  hiringDecision: string;
  radarScores: {
    domainExpertise: number;
    communicationClarity: number;
    starStructure: number;
    businessImpact: number;
    interviewerAlignment: number;
  };
  topWins: string[];
  criticalGapsToFix: string[];
  finalGoldenAdvice: string;
}

export interface SavedSession {
  id: string;
  date: string;
  interviewerTitle: string;
  targetRole: string;
  questionsResult?: InterviewerAnalysisResult;
  trainingResult?: TrainingAnalysisResult;
  simulationPlan?: SimulationPlanResult;
  finalMockReport?: FinalMockReport;
}

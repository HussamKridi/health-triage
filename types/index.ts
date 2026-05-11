export type GenderOption = "female" | "male" | "other" | "prefer_not_to_say";

export type UserProfile = {
  uid: string;
  email: string | null;
  age: number | null;
  gender: GenderOption | null;
  weight: number | null;
  height: number | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type PatientProfile = Pick<
  UserProfile,
  "age" | "gender" | "weight" | "height"
>;

export type TriageSessionStatus = "questioning" | "completed";
export type TriageRiskLabel = "Low" | "Moderate" | "High";
export type TriageFinalSource = "gemini" | "fallback" | "baseline";

export type TriageSessionVitals = {
  spo2: number;
  temperature: number;
  heartRate: number;
};

export type TriageSafetyQuestionId =
  | "chest-pain"
  | "breathing-difficulty"
  | "faint-confused-dizzy"
  | "severe-pain-bleeding-injury"
  | "sudden-worsening";

export type TriageSafetyAnswerValue = "yes" | "no";

export type TriageSafetyAnswer = {
  questionId: TriageSafetyQuestionId;
  questionText: string;
  answerValue: TriageSafetyAnswerValue;
  answerLabel: "Yes" | "No";
};

export type TriageSafetyResponses = {
  answers: TriageSafetyAnswer[];
  notes: string;
};

export type LiveVitals = {
  spo2: number | null;
  temperature: number | null;
  heartRate: number | null;
};

export type VitalBand = "stable" | "elevated" | "critical";

export type TriageSignalSummary = {
  bmi: number | null;
  lowSpo2: boolean;
  fever: boolean;
  tachycardia: boolean;
  senior: boolean;
  underweight: boolean;
  obesity: boolean;
  chestPain: boolean;
  breathingDifficulty: boolean;
  safetyYesCount: number;
  spo2Band: VitalBand;
  temperatureBand: VitalBand;
  heartRateBand: VitalBand;
};

export type LocalAssessment = {
  riskLabel: Extract<TriageRiskLabel, "Low" | "High">;
  highRiskProbability: number;
  usedSafetyOverride: boolean;
  isCrucial: boolean;
  summary: string;
  signals: TriageSignalSummary;
};

export type TriageQuestionInputType = "boolean" | "single-select" | "text";

export type TriageFlowStep =
  | "profile"
  | "session"
  | "questions"
  | "result"
  | "aftercare";

export type TriageQuestionOption = {
  label: string;
  value: string;
};

export type TriageQuestion = {
  id: string;
  type: string;
  inputType: TriageQuestionInputType;
  options?: TriageQuestionOption[];
  questionText: string;
};

export type TriageConversationTurn = {
  id: string;
  role: "assistant" | "user";
  kind: "question" | "answer";
  questionId?: string;
  inputType?: TriageQuestionInputType;
  text: string;
  answerValue?: string;
  createdAt?: Date | null;
};

export type FinalTriageResult = {
  riskLabel: TriageRiskLabel;
  isCrucial: boolean;
  reasoning: string;
  advice: string;
  recommendedNextAction: string;
  disagreement: boolean;
  finalSource: TriageFinalSource;
};

export type TriageSession = {
  id: string;
  userId: string;
  status: TriageSessionStatus;
  vitals: TriageSessionVitals;
  localAssessment: LocalAssessment;
  safetyResponses: TriageSafetyResponses | null;
  currentQuestion: TriageQuestion | null;
  finalResult: FinalTriageResult | null;
  conversationHistory: TriageConversationTurn[];
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type TriageDecision =
  | {
      kind: "question";
      question: TriageQuestion;
    }
  | {
      kind: "final";
      finalResult: FinalTriageResult;
    };

export type GeminiTriageRequest = {
  profile: PatientProfile;
  vitals: TriageSessionVitals;
  localAssessment: LocalAssessment;
  safetyResponses: TriageSafetyResponses | null;
  conversationHistory: TriageConversationTurn[];
};

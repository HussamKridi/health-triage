"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import {
  deleteAuthenticatedUser,
  getFirebaseAuthErrorMessage,
} from "@/lib/auth";
import { buildLocalAssessment } from "@/lib/triage/engine";
import {
  createTriageSession,
  deleteUserClinicalData,
  getFirestoreErrorMessage,
  getRecentSessions,
  getUserProfile,
  isProfileComplete,
  updateTriageSession,
  upsertUserProfile,
} from "@/lib/triage/firestore";
import type {
  FinalTriageResult,
  GeminiTriageRequest,
  PatientProfile,
  TriageConversationTurn,
  TriageDecision,
  TriageSession,
  TriageSessionVitals,
  UserProfile,
} from "@/types";

type DashboardContextValue = {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  loading: boolean;
  profile: UserProfile | null;
  patientProfile: PatientProfile | null;
  profileReady: boolean;
  sessions: TriageSession[];
  selectedSessionId: string | null;
  activeSession: TriageSession | null;
  isLoadingData: boolean;
  isSavingProfile: boolean;
  isDeletingAccount: boolean;
  isSubmittingTriage: boolean;
  isSubmittingAnswer: boolean;
  dashboardError: string;
  setDashboardError: (message: string) => void;
  selectSession: (sessionId: string) => void;
  saveProfile: (profile: PatientProfile) => Promise<string>;
  runTriage: (vitals: TriageSessionVitals) => Promise<TriageSession | null>;
  submitAnswer: (answerValue: string, answerLabel: string) => Promise<TriageSession | null>;
  deleteAccount: () => Promise<void>;
  reloadDashboard: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

function makeTurn(
  role: TriageConversationTurn["role"],
  kind: TriageConversationTurn["kind"],
  text: string,
  overrides?: Partial<TriageConversationTurn>
): TriageConversationTurn {
  return {
    id: crypto.randomUUID(),
    role,
    kind,
    text,
    createdAt: new Date(),
    ...overrides,
  };
}

async function getTriageDecision(payload: GeminiTriageRequest) {
  const response = await fetch("/api/triage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to orchestrate triage decision.");
  }

  const data = (await response.json()) as { decision: TriageDecision };
  return data.decision;
}

function applyDisagreement(
  finalResult: FinalTriageResult,
  baselineRiskLabel: "Low" | "High"
): FinalTriageResult {
  return {
    ...finalResult,
    disagreement: finalResult.riskLabel !== baselineRiskLabel,
  };
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSubmittingTriage, setIsSubmittingTriage] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  const reloadDashboard = useCallback(async () => {
    if (!user?.uid) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    setDashboardError("");

    try {
      const [profileDocument, recentSessions] = await Promise.all([
        getUserProfile(user.uid),
        getRecentSessions(user.uid),
      ]);

      setProfile(
        profileDocument ?? {
          uid: user.uid,
          email: user.email ?? null,
          age: null,
          gender: null,
          weight: null,
          height: null,
        }
      );
      setSessions(recentSessions);
      setSelectedSessionId(
        recentSessions.find((session) => session.status === "questioning")?.id ??
          recentSessions[0]?.id ??
          null
      );
    } catch (error) {
      setDashboardError(getFirestoreErrorMessage(error));
    } finally {
      setIsLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user?.uid) {
      setIsLoadingData(false);
      return;
    }

    void reloadDashboard();
  }, [loading, reloadDashboard, user]);

  const patientProfile = useMemo<PatientProfile | null>(() => {
    if (!profile) {
      return null;
    }

    return {
      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,
    };
  }, [profile]);

  const profileReady = useMemo(() => isProfileComplete(patientProfile), [patientProfile]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [selectedSessionId, sessions]
  );

  const saveProfile = useCallback(
    async (nextProfile: PatientProfile) => {
      if (!user?.uid) {
        throw new Error("You must be signed in before saving the profile.");
      }

      setIsSavingProfile(true);

      try {
        await upsertUserProfile(user.uid, user.email ?? null, nextProfile);
        setDashboardError("");
        setProfile((current) =>
          current
            ? {
                ...current,
                email: user.email ?? null,
                ...nextProfile,
              }
            : {
                uid: user.uid,
                email: user.email ?? null,
                ...nextProfile,
              }
        );
        return "Profile saved successfully.";
      } catch (error) {
        throw new Error(getFirestoreErrorMessage(error));
      } finally {
        setIsSavingProfile(false);
      }
    },
    [user]
  );

  const runTriage = useCallback(
    async (vitals: TriageSessionVitals) => {
      if (!user || !patientProfile) {
        return null;
      }

      setIsSubmittingTriage(true);
      setDashboardError("");

      try {
        const localAssessment = buildLocalAssessment(patientProfile, vitals);
        const decision = await getTriageDecision({
          profile: patientProfile,
          vitals,
          localAssessment,
          conversationHistory: [],
        });

        const conversationHistory =
          decision.kind === "question"
            ? [
                makeTurn("assistant", "question", decision.question.questionText, {
                  questionId: decision.question.id,
                  inputType: decision.question.inputType,
                }),
              ]
            : [];

        const finalResult =
          decision.kind === "final"
            ? applyDisagreement(decision.finalResult, localAssessment.riskLabel)
            : null;

        const createdSession = await createTriageSession(
          user.uid,
          vitals,
          localAssessment,
          conversationHistory,
          decision.kind === "question" ? "questioning" : "completed",
          decision.kind === "question" ? decision.question : null,
          finalResult
        );

        setSessions((current) => [createdSession, ...current].slice(0, 10));
        setSelectedSessionId(createdSession.id);
        return createdSession;
      } catch {
        setDashboardError("We couldn't start this triage session. Please try again.");
        return null;
      } finally {
        setIsSubmittingTriage(false);
      }
    },
    [patientProfile, user]
  );

  const submitAnswer = useCallback(
    async (answerValue: string, answerLabel: string) => {
      if (!user || !patientProfile || !activeSession?.currentQuestion) {
        return null;
      }

      setIsSubmittingAnswer(true);
      setDashboardError("");

      try {
        const answerTurn = makeTurn("user", "answer", answerLabel, {
          questionId: activeSession.currentQuestion.id,
          inputType: activeSession.currentQuestion.inputType,
          answerValue,
        });

        const nextConversationHistory = [...activeSession.conversationHistory, answerTurn];

        const decision = await getTriageDecision({
          profile: patientProfile,
          vitals: activeSession.vitals,
          localAssessment: activeSession.localAssessment,
          conversationHistory: nextConversationHistory,
        });

        const nextSession =
          decision.kind === "question"
            ? {
                ...activeSession,
                status: "questioning" as const,
                currentQuestion: decision.question,
                finalResult: null,
                conversationHistory: [
                  ...nextConversationHistory,
                  makeTurn("assistant", "question", decision.question.questionText, {
                    questionId: decision.question.id,
                    inputType: decision.question.inputType,
                  }),
                ],
                updatedAt: new Date(),
              }
            : {
                ...activeSession,
                status: "completed" as const,
                currentQuestion: null,
                finalResult: applyDisagreement(
                  decision.finalResult,
                  activeSession.localAssessment.riskLabel
                ),
                conversationHistory: nextConversationHistory,
                updatedAt: new Date(),
              };

        await updateTriageSession(user.uid, activeSession.id, {
          status: nextSession.status,
          currentQuestion: nextSession.currentQuestion,
          finalResult: nextSession.finalResult,
          conversationHistory: nextSession.conversationHistory,
        });

        setSessions((current) =>
          current.map((session) =>
            session.id === nextSession.id ? nextSession : session
          )
        );
        setSelectedSessionId(nextSession.id);
        return nextSession;
      } catch {
        setDashboardError(
          "We couldn't continue the follow-up flow. Please try again."
        );
        return null;
      } finally {
        setIsSubmittingAnswer(false);
      }
    },
    [activeSession, patientProfile, user]
  );

  const deleteAccount = useCallback(async () => {
    if (!user?.uid) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this account and its saved triage data? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingAccount(true);
    setDashboardError("");

    try {
      await deleteUserClinicalData(user.uid);
      await deleteAuthenticatedUser(user);
      router.replace("/login");
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string" &&
        error.code.startsWith("auth/")
          ? getFirebaseAuthErrorMessage(error)
          : getFirestoreErrorMessage(error);

      setDashboardError(message);
    } finally {
      setIsDeletingAccount(false);
    }
  }, [router, user]);

  const value = useMemo(() => {
    if (!user) {
      return undefined;
    }

    return {
      user,
      loading,
      profile,
      patientProfile,
      profileReady,
      sessions,
      selectedSessionId,
      activeSession,
      isLoadingData,
      isSavingProfile,
      isDeletingAccount,
      isSubmittingTriage,
      isSubmittingAnswer,
      dashboardError,
      setDashboardError,
      selectSession: setSelectedSessionId,
      saveProfile,
      runTriage,
      submitAnswer,
      deleteAccount,
      reloadDashboard,
    } satisfies DashboardContextValue;
  }, [
    activeSession,
    dashboardError,
    deleteAccount,
    isDeletingAccount,
    isLoadingData,
    isSavingProfile,
    isSubmittingAnswer,
    isSubmittingTriage,
    loading,
    patientProfile,
    profile,
    profileReady,
    reloadDashboard,
    runTriage,
    saveProfile,
    selectedSessionId,
    sessions,
    submitAnswer,
    user,
  ]);

  if (loading || !isAuthenticated || !user || !value) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(to_bottom,rgba(248,250,252,1),rgba(255,255,255,1))] px-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardProvider.");
  }

  return context;
}

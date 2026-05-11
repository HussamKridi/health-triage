import {
  AlertTriangle,
  ClipboardCheck,
  HeartPulse,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Thermometer,
  Wind,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TriageConversationTurn, TriageSession, TriageSessionVitals } from "@/types";

type HighRiskReason = {
  title: string;
  detail: string;
  patientMeaning: string;
  severity: "critical" | "elevated" | "stable";
  source: "vitals" | "answers" | "assessment";
  icon: ReactNode;
};

function resultStyle(riskLevel: string | null) {
  if (riskLevel === "High") {
    return {
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      icon: <AlertTriangle className="size-5 text-red-600" />,
    };
  }

  if (riskLevel === "Moderate") {
    return {
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Siren className="size-5 text-amber-600" />,
    };
  }

  return {
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <ShieldCheck className="size-5 text-emerald-600" />,
  };
}

function severityStyle(severity: HighRiskReason["severity"]) {
  if (severity === "critical") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (severity === "elevated") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function formatVital(value: number, digits = 0) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(digits);
}

function getConcerningAnswerReasons(
  conversationHistory: TriageConversationTurn[]
): HighRiskReason[] {
  return conversationHistory
    .filter((turn) => turn.kind === "answer")
    .flatMap<HighRiskReason>((turn) => {
      const answerValue = turn.answerValue?.toLowerCase();
      const questionId = turn.questionId;

      if (!answerValue || !questionId) {
        return [];
      }

      if (
        questionId === "chest-pain" ||
        questionId === "breathing-danger" ||
        questionId === "respiratory_danger"
      ) {
        if (questionId === "chest-pain" && answerValue === "yes") {
          return [
            {
              title: "Chest pain or pressure reported",
              detail:
                "The safety questions reported current chest pain or chest pressure.",
              patientMeaning:
                "Chest pain or pressure can be a warning sign involving the heart, lungs, or circulation and should be treated cautiously.",
              severity: "critical",
              source: "answers",
              icon: <HeartPulse className="size-5" />,
            },
          ];
        }

        if (answerValue === "significant") {
          return [
            {
              title: "Severe breathing or chest symptoms reported",
              detail:
                "The follow-up answer reported significant shortness of breath, chest pain, or trouble speaking in full sentences.",
              patientMeaning:
                "These symptoms can be warning signs that breathing, oxygen delivery, or circulation needs urgent evaluation.",
              severity: "critical",
              source: "answers",
              icon: <Wind className="size-5" />,
            },
          ];
        }

        if (answerValue === "mild") {
          return [
            {
              title: "Breathing symptoms reported",
              detail:
                "The follow-up answer reported mild shortness of breath or chest symptoms.",
              patientMeaning:
                "Breathing symptoms become more important when they appear together with abnormal vital signs.",
              severity: "elevated",
              source: "answers",
              icon: <Wind className="size-5" />,
            },
          ];
        }
      }

      if (questionId === "breathing-difficulty" && answerValue === "yes") {
        return [
          {
            title: "Breathing difficulty reported",
            detail:
              "The safety questions reported difficulty breathing or shortness of breath.",
            patientMeaning:
              "Breathing difficulty can become urgent, especially when paired with low oxygen levels, chest symptoms, or worsening illness.",
            severity: "critical",
            source: "answers",
            icon: <Wind className="size-5" />,
          },
        ];
      }

      if (questionId === "faint-confused-dizzy" && answerValue === "yes") {
        return [
          {
            title: "Fainting, confusion, or severe dizziness reported",
            detail:
              "The safety questions reported fainting, confusion, or severe dizziness recently.",
            patientMeaning:
              "These symptoms can suggest a circulation, hydration, oxygen, or neurological problem that needs prompt attention.",
            severity: "critical",
            source: "answers",
            icon: <AlertTriangle className="size-5" />,
          },
        ];
      }

      if (
        questionId === "severe-pain-bleeding-injury" &&
        answerValue === "yes"
      ) {
        return [
          {
            title: "Severe pain, heavy bleeding, or serious injury reported",
            detail:
              "The safety questions reported severe pain, heavy bleeding, or a serious injury.",
            patientMeaning:
              "These symptoms can require urgent in-person assessment even when vital signs look stable.",
            severity: "critical",
            source: "answers",
            icon: <Siren className="size-5" />,
          },
        ];
      }

      if (questionId === "sudden-worsening" && answerValue === "yes") {
        return [
          {
            title: "Symptoms suddenly worsened today",
            detail:
              "The safety questions reported that symptoms suddenly became much worse today.",
            patientMeaning:
              "A sudden change can mean the condition is evolving and should be assessed more cautiously.",
            severity: "elevated",
            source: "answers",
            icon: <Siren className="size-5" />,
          },
        ];
      }

      if (questionId === "infection-duration") {
        if (answerValue === "worsening" || answerValue === "duration") {
          return [
            {
              title: "Fever or infection symptoms are not settling",
              detail:
                answerValue === "worsening"
                  ? "The follow-up answer reported infection-like symptoms that are getting worse."
                  : "The follow-up answer reported fever, chills, or infection-like symptoms for more than 24 hours.",
              patientMeaning:
                "Persistent or worsening infection symptoms can need medical review, especially with fever or abnormal heart rate.",
              severity: "elevated",
              source: "answers",
              icon: <Thermometer className="size-5" />,
            },
          ];
        }
      }

      if (questionId === "circulation-neuro") {
        if (answerValue === "yes") {
          return [
            {
              title: "Faintness, confusion, or severe weakness reported",
              detail:
                "The follow-up answer reported feeling faint, confused, severely weak, or unusually dehydrated.",
              patientMeaning:
                "These can be warning signs that circulation, hydration, or neurological status needs urgent attention.",
              severity: "critical",
              source: "answers",
              icon: <AlertTriangle className="size-5" />,
            },
          ];
        }

        if (answerValue === "mild") {
          return [
            {
              title: "Mild weakness or dehydration symptoms reported",
              detail:
                "The follow-up answer reported mild faintness, weakness, confusion, or dehydration symptoms.",
              patientMeaning:
                "These symptoms can raise concern when they happen with abnormal vital signs.",
              severity: "elevated",
              source: "answers",
              icon: <AlertTriangle className="size-5" />,
            },
          ];
        }
      }

      if (questionId === "chronic-disease" && answerValue === "yes") {
        return [
          {
            title: "Serious long-term condition reported",
            detail:
              "The follow-up answer reported chronic heart disease, lung disease, or another serious long-term condition.",
            patientMeaning:
              "Long-term heart or lung conditions can make abnormal oxygen, temperature, or heart-rate readings more concerning.",
            severity: "elevated",
            source: "answers",
            icon: <HeartPulse className="size-5" />,
          },
        ];
      }

      if (questionId === "worsening-general" && answerValue === "worsening") {
        return [
          {
            title: "Symptoms are getting worse quickly",
            detail:
              "The follow-up answer reported that symptoms are getting worse quickly.",
            patientMeaning:
              "Fast worsening can indicate that the situation is changing and should be assessed promptly.",
            severity: "elevated",
            source: "answers",
            icon: <Siren className="size-5" />,
          },
        ];
      }

      if (
        (questionId === "diagnosis-duration" ||
          questionId === "diagnosis_duration") &&
        answerValue === "more-than-1-week"
      ) {
        return [
          {
            title: "Symptoms have lasted more than one week",
            detail:
              "The follow-up answer reported that this diagnosis or symptom pattern has lasted more than one week.",
            patientMeaning:
              "Symptoms lasting this long may need a clinician to check for complications or a missed cause.",
            severity: "elevated",
            source: "answers",
            icon: <ClipboardCheck className="size-5" />,
          },
        ];
      }

      return [];
    });
}

function getHighRiskReasons(session: TriageSession): HighRiskReason[] {
  const vitals: TriageSessionVitals = session.vitals;
  const reasons: HighRiskReason[] = [];

  if (vitals.spo2 <= 92) {
    reasons.push({
      title: "Critical oxygen level",
      detail: `SpO2 is ${formatVital(vitals.spo2)}%, which is below the critical safety threshold of 92%.`,
      patientMeaning:
        "Low oxygen saturation may indicate breathing or oxygen delivery problems.",
      severity: "critical",
      source: "vitals",
      icon: <Wind className="size-5" />,
    });
  }

  if (vitals.temperature >= 39) {
    reasons.push({
      title: "High fever",
      detail: `Temperature is ${formatVital(vitals.temperature, 1)} C, which is at or above the critical fever threshold of 39.0 C.`,
      patientMeaning:
        "A high fever can be a sign of a serious infection or inflammation and may require urgent evaluation.",
      severity: "critical",
      source: "vitals",
      icon: <Thermometer className="size-5" />,
    });
  }

  if (vitals.heartRate >= 130) {
    reasons.push({
      title: "Very high heart rate",
      detail: `Heart rate is ${formatVital(vitals.heartRate)} bpm, which is at or above the critical threshold of 130 bpm.`,
      patientMeaning:
        "A very high heart rate can be a critical sign that the body is under stress.",
      severity: "critical",
      source: "vitals",
      icon: <HeartPulse className="size-5" />,
    });
  }

  if (vitals.heartRate <= 45) {
    reasons.push({
      title: "Very low heart rate",
      detail: `Heart rate is ${formatVital(vitals.heartRate)} bpm, which is at or below the critical threshold of 45 bpm.`,
      patientMeaning:
        "A very low heart rate can be a critical sign, especially if symptoms such as faintness, weakness, or confusion are present.",
      severity: "critical",
      source: "vitals",
      icon: <HeartPulse className="size-5" />,
    });
  }

  reasons.push(...getConcerningAnswerReasons(session.conversationHistory));

  if ((session.localAssessment.signals.safetyYesCount ?? 0) >= 3) {
    reasons.push({
      title: "Multiple safety symptoms reported",
      detail: `${session.localAssessment.signals.safetyYesCount} of 5 required safety questions were answered Yes.`,
      patientMeaning:
        "Several warning symptoms together make the session more concerning, even if a single symptom might be less specific.",
      severity: "critical",
      source: "answers",
      icon: <ShieldAlert className="size-5" />,
    });
  }

  if (
    reasons.length === 0 &&
    (session.finalResult?.riskLabel === "High" ||
      session.localAssessment.riskLabel === "High")
  ) {
    reasons.push({
      title: "Combined triage findings",
      detail:
        session.finalResult?.reasoning ??
        session.localAssessment.summary,
      patientMeaning:
        "The system classified this session as high risk based on the combined vital signs, profile context, and follow-up answers.",
      severity: session.localAssessment.isCrucial ? "critical" : "elevated",
      source: "assessment",
      icon: <ShieldAlert className="size-5" />,
    });
  }

  return reasons;
}

export function ResultCard({
  session,
}: {
  session: TriageSession | null;
}) {
  const finalResult = session?.finalResult ?? null;
  const localAssessment = session?.localAssessment ?? null;
  const tone = resultStyle(finalResult?.riskLabel ?? localAssessment?.riskLabel ?? null);
  const isHighRisk =
    finalResult?.riskLabel === "High" || localAssessment?.riskLabel === "High";
  const highRiskReasons = session && isHighRisk ? getHighRiskReasons(session) : [];

  return (
    <Card id="triage-result" className="border-slate-200/80 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Results</CardTitle>
        <CardDescription className="mt-2 text-base">
          This panel keeps the explanation layer structured: local baseline
          assessment, safety override state, follow-up outcome, and final clinical
          recommendation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {session ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full px-4 py-1.5" variant="secondary">
                Session {session.status}
              </Badge>
              {localAssessment ? (
                <Badge className="rounded-full px-4 py-1.5" variant="secondary">
                  Baseline {localAssessment.riskLabel}
                </Badge>
              ) : null}
              {finalResult ? (
                <Badge className={`rounded-full px-4 py-1.5 ${tone.badgeClass}`}>
                  Final {finalResult.riskLabel}
                </Badge>
              ) : null}
            </div>

            {localAssessment ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Local probability
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-950">
                    {(localAssessment.highRiskProbability * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Safety override
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-950">
                    {localAssessment.usedSafetyOverride ? "Triggered" : "No"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Crucial case
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-950">
                    {localAssessment.isCrucial ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center gap-3">
                {tone.icon}
                <div className="text-lg font-semibold text-slate-950">
                  {finalResult
                    ? `${finalResult.riskLabel} risk triage outcome`
                    : "Questioning in progress"}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {finalResult?.reasoning ?? localAssessment?.summary}
              </p>
            </div>

            {isHighRisk ? (
              <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                      <ShieldAlert className="size-5 text-red-600" />
                      Why this is high risk
                    </div>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      These are the specific findings that pushed this session into
                      high-risk handling.
                    </p>
                  </div>
                  {localAssessment?.usedSafetyOverride ? (
                    <Badge className="border-red-200 bg-red-50 text-red-700">
                      Safety override
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-3">
                  {highRiskReasons.map((reason, index) => (
                    <div
                      key={`${reason.title}-${index}`}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex gap-3">
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${severityStyle(
                              reason.severity
                            )}`}
                          >
                            {reason.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-950">
                              {reason.title}
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-700">
                              {reason.detail}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {reason.patientMeaning}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`shrink-0 capitalize ${severityStyle(
                            reason.severity
                          )}`}
                        >
                          {reason.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {localAssessment?.usedSafetyOverride ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                    <span className="font-medium text-slate-950">
                      Safety override:
                    </span>{" "}
                    Safety override means the system does not wait for more
                    questions when a critical vital sign is detected.
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ClipboardCheck className="size-4 text-sky-700" />
                Structured explanation
              </div>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <span className="font-medium text-slate-900">Signals:</span>{" "}
                  SpO2 {localAssessment?.signals.spo2Band}, temperature{" "}
                  {localAssessment?.signals.temperatureBand}, heart rate{" "}
                  {localAssessment?.signals.heartRateBand}, safety yes answers{" "}
                  {localAssessment?.signals.safetyYesCount ?? 0}/5.
                </div>
                {finalResult ? (
                  <>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                      <span className="font-medium text-slate-900">Advice:</span>{" "}
                      {finalResult.advice}
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                      <span className="font-medium text-slate-900">Recommended next action:</span>{" "}
                      {finalResult.recommendedNextAction}
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                      <span className="font-medium text-slate-900">Final source:</span>{" "}
                      {finalResult.finalSource}
                      {finalResult.disagreement ? " with baseline disagreement" : ""}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl bg-slate-50 px-3 py-3">
                    The session is still in one-question-at-a-time follow-up mode.
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm leading-7 text-slate-600">
            Start a triage session to populate the baseline assessment, follow-up
            state, and final result.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

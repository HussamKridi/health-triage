import { AlertTriangle, ClipboardCheck, Siren, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TriageSession } from "@/types";

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

export function ResultCard({
  session,
}: {
  session: TriageSession | null;
}) {
  const finalResult = session?.finalResult ?? null;
  const localAssessment = session?.localAssessment ?? null;
  const tone = resultStyle(finalResult?.riskLabel ?? localAssessment?.riskLabel ?? null);

  return (
    <Card id="triage-result" className="border-slate-200/80 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Triage Result</CardTitle>
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
                  {localAssessment?.signals.heartRateBand}.
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


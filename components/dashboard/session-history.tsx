import { CalendarClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TriageSession } from "@/types";

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return "Recently saved";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function SessionHistory({
  sessions,
  activeSessionId,
  onSelectSession,
}: {
  sessions: TriageSession[];
  activeSessionId?: string | null;
  onSelectSession?: (sessionId: string) => void;
}) {
  return (
    <Card id="session-history" className="border-slate-200/80 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">History</CardTitle>
        <CardDescription className="mt-2 text-base">
          Each triage session stores only live vitals and the resulting assessment.
          Persistent profile data stays separate in the user record.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm leading-7 text-slate-600">
            No sessions saved yet. Start the first triage session to build the
            patient&apos;s session history.
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full px-3 py-1" variant="secondary">
                      {(session.finalResult?.riskLabel ?? session.localAssessment.riskLabel)} Risk
                    </Badge>
                    <Badge className="rounded-full px-3 py-1">{session.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {session.finalResult?.reasoning ?? session.localAssessment.summary}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CalendarClock className="size-3.5" />
                  {formatDate(session.createdAt)}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white px-3 py-3 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">SpO2:</span> {session.vitals.spo2}%
                </div>
                <div className="rounded-xl bg-white px-3 py-3 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Temperature:</span>{" "}
                  {session.vitals.temperature} C
                </div>
                <div className="rounded-xl bg-white px-3 py-3 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Heart Rate:</span>{" "}
                  {session.vitals.heartRate} bpm
                </div>
              </div>
              {onSelectSession ? (
                <Button
                  type="button"
                  variant={activeSessionId === session.id ? "secondary" : "outline"}
                  className="mt-4 rounded-full px-5"
                  onClick={() => onSelectSession(session.id)}
                >
                  {activeSessionId === session.id ? "Viewing Session" : "Review Session"}
                </Button>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

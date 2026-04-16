"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ResultCard } from "@/components/dashboard/result-card";
import { SessionHistory } from "@/components/dashboard/session-history";
import { useDashboardData } from "@/components/dashboard/dashboard-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const { sessions, selectedSessionId, selectSession, activeSession } = useDashboardData();

  return (
    <>
      <section className="space-y-4">
        <Badge className="rounded-full px-4 py-1.5">Page 6</Badge>
        <h1 className="text-3xl font-semibold text-slate-950">Session History</h1>
        <p className="max-w-3xl text-base text-slate-600">
          Review previous sessions by date, vitals snapshot, current status, and final
          classification. Selecting a session updates the detailed review card below.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SessionHistory
          sessions={sessions}
          activeSessionId={selectedSessionId}
          onSelectSession={selectSession}
        />
        <ResultCard session={activeSession} />
      </div>

      <div className="flex justify-start">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/emergency">
            <ArrowLeft className="size-4" />
            Back to Emergency Assistance
          </Link>
        </Button>
      </div>
    </>
  );
}

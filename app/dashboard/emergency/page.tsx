"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { EmergencyAssistance } from "@/components/dashboard/emergency-assistance";
import { useDashboardData } from "@/components/dashboard/dashboard-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmergencyPage() {
  const { activeSession } = useDashboardData();

  return (
    <>
      <section className="space-y-4">
        <Badge className="rounded-full px-4 py-1.5">Page 5</Badge>
        <h1 className="text-3xl font-semibold text-slate-950">Emergency Help</h1>
        <p className="max-w-3xl text-base text-slate-600">
          High-risk sessions surface focused emergency actions. Lower-risk sessions
          show a calm status message instead of noisy controls.
        </p>
      </section>

      {activeSession?.finalResult?.riskLabel === "High" ? (
        <EmergencyAssistance session={activeSession} />
      ) : (
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">No emergency escalation required</CardTitle>
            <CardDescription className="text-base">
              Emergency tools appear only when the selected final result is high risk.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Review the result page or browse session history for previous high-risk
            sessions if needed.
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/result">
            <ArrowLeft className="size-4" />
            Back to Result
          </Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/history">
            Continue to History
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap } from "lucide-react";

import { TriageForm } from "@/components/dashboard/triage-form";
import { useDashboardData } from "@/components/dashboard/dashboard-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuickCheckupPage() {
  const router = useRouter();
  const { profileReady, runTriage, isSubmittingTriage } = useDashboardData();

  async function handleQuickCheck(vitals: Parameters<typeof runTriage>[0]) {
    const session = await runTriage(vitals);

    if (!session) {
      return;
    }

    router.push(
      session.status === "questioning"
        ? "/dashboard/questions"
        : "/dashboard/result"
    );
  }

  return (
    <>
      <section className="space-y-4">
        <Badge className="rounded-full px-4 py-1.5">Quick Check</Badge>
        <h1 className="text-3xl font-semibold text-slate-950">Fast triage entry</h1>
        <p className="max-w-3xl text-base text-slate-600">
          This page prioritizes speed. Enter live vitals and move straight into the
          shortest possible triage path.
        </p>
      </section>

      <Card className="border-slate-200/80 bg-white/95 shadow-sm">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Zap className="size-4" />
          </div>
          <CardTitle className="pt-3 text-xl">Quick Check</CardTitle>
          <CardDescription className="text-base">
            Use this fast-access page when you want to begin triage immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TriageForm
            disabled={!profileReady}
            disabledMessage="Complete your profile once, then use Quick Check any time for fast session entry."
            onSubmit={handleQuickCheck}
            isSubmitting={isSubmittingTriage}
            submitLabel="Run Quick Check"
            footer={
              <div className="flex justify-start">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/dashboard/session">
                    <ArrowLeft className="size-4" />
                    Return to Full Session Page
                  </Link>
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>
    </>
  );
}

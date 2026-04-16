"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { TriageForm } from "@/components/dashboard/triage-form";
import { useDashboardData } from "@/components/dashboard/dashboard-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SessionPage() {
  const router = useRouter();
  const { profileReady, runTriage, isSubmittingTriage, activeSession } =
    useDashboardData();

  async function handleStartTriage(vitals: Parameters<typeof runTriage>[0]) {
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
        <Badge className="rounded-full px-4 py-1.5">Page 2</Badge>
        <h1 className="text-3xl font-semibold text-slate-950">Check-Up</h1>
        <p className="max-w-3xl text-base text-slate-600">
          Enter live session measurements only: SpO2, temperature, and heart rate.
          These values belong to the current session and can later come from device
          integrations.
        </p>
      </section>

      <TriageForm
        disabled={!profileReady}
        disabledMessage="Complete the patient profile first, then return here to begin a session."
        onSubmit={handleStartTriage}
        isSubmitting={isSubmittingTriage}
        submitLabel="Begin Triage"
        footer={
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/profile">
                <ArrowLeft className="size-4" />
                Back to Profile
              </Link>
            </Button>
            {activeSession?.status === "questioning" ? (
              <Button asChild className="rounded-full">
                <Link href="/dashboard/questions">
                  Continue to Questions
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />
    </>
  );
}

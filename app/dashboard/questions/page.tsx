"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { useDashboardData } from "@/components/dashboard/dashboard-provider";
import { FollowUpPanel } from "@/components/triage/follow-up-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestionsPage() {
  const router = useRouter();
  const { activeSession, submitAnswer, isSubmittingAnswer } = useDashboardData();

  async function handleSubmitAnswer(answerValue: string, answerLabel: string) {
    const session = await submitAnswer(answerValue, answerLabel);

    if (!session) {
      return;
    }

    router.push(
      session.status === "completed"
        ? "/dashboard/result"
        : "/dashboard/questions"
    );
  }

  return (
    <>
      <section className="space-y-4">
        <Badge className="rounded-full px-4 py-1.5">Page 3</Badge>
        <h1 className="text-3xl font-semibold text-slate-950">
          Follow-up Question Flow
        </h1>
        <p className="max-w-3xl text-base text-slate-600">
          One question appears at a time. Yes/no and directed answers are rendered as
          choices instead of unnecessary free text.
        </p>
      </section>

      {activeSession ? null : (
        <Card className="border-slate-200/80 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">No active follow-up session</CardTitle>
            <CardDescription className="text-base">
              Start a new triage session first to generate follow-up questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/session">Go to Current Triage Session</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <FollowUpPanel
        session={activeSession}
        onSubmitAnswer={handleSubmitAnswer}
        isSubmitting={isSubmittingAnswer}
        footer={
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/session">
                <ArrowLeft className="size-4" />
                Back to Session
              </Link>
            </Button>
            {activeSession?.status === "completed" ? (
              <Button asChild className="rounded-full">
                <Link href="/dashboard/result">
                  Continue to Triage Result
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

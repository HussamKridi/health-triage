"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { ResultCard } from "@/components/dashboard/result-card";
import { useDashboardData } from "@/components/dashboard/dashboard-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ResultPage() {
  const { activeSession } = useDashboardData();

  return (
    <>
      <section className="space-y-4">
        <Badge className="rounded-full px-4 py-1.5">Page 4</Badge>
        <h1 className="text-3xl font-semibold text-slate-950">Results</h1>
        <p className="max-w-3xl text-base text-slate-600">
          Review the final risk label, reasoning, advice, recommended next action,
          and baseline safety interpretation on a dedicated result page.
        </p>
      </section>

      <ResultCard session={activeSession} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button asChild variant="outline" className="rounded-full">
          <Link
            href={
              activeSession?.status === "questioning"
                ? "/dashboard/questions"
                : "/dashboard/session"
            }
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/emergency">
            Continue to Emergency Help
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </>
  );
}

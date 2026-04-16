"use client";

import Link from "next/link";
import { ArrowRight, TriangleAlert } from "lucide-react";

import { ProfileCard } from "@/components/dashboard/profile-card";
import { useDashboardData } from "@/components/dashboard/dashboard-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const {
    patientProfile,
    profileReady,
    saveProfile,
    isSavingProfile,
    isLoadingData,
    isDeletingAccount,
    deleteAccount,
    dashboardError,
  } = useDashboardData();

  return (
    <>
      <section className="space-y-4">
        <Badge className="rounded-full px-4 py-1.5">Page 1</Badge>
        <h1 className="text-3xl font-semibold text-slate-950">
          Patient Profile Summary
        </h1>
        <p className="max-w-3xl text-base text-slate-600">
          Persistent profile data lives in the user record and is reused across all
          triage sessions. It should not be re-entered every time.
        </p>
      </section>

      {dashboardError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dashboardError}
        </div>
      ) : null}

      {!profileReady ? (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <TriangleAlert className="size-4" />
          Complete age, gender, weight, and height before starting a new triage
          session.
        </div>
      ) : null}

      <ProfileCard
        profile={patientProfile}
        onSave={saveProfile}
        isSaving={isSavingProfile}
        isLoading={isLoadingData}
        footer={
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-600">
              Edit Profile is the only place where persistent patient context is
              changed.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => void deleteAccount()}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? "Deleting account..." : "Delete Account"}
              </Button>
              <Button asChild className="rounded-full" disabled={!profileReady}>
                <Link href="/dashboard/session">
                  Continue to Current Triage Session
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        }
      />
    </>
  );
}

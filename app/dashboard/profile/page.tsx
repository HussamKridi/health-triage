"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, ArrowRight, TriangleAlert } from "lucide-react";

import { ProfileCard } from "@/components/dashboard/profile-card";
import { useDashboardData } from "@/components/dashboard/dashboard-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const searchParams = useSearchParams();
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const startEditing = searchParams.get("edit") === "1";

  return (
    <>
      <section className="space-y-4">
        <Badge className="rounded-full px-4 py-1.5">Page 1</Badge>
        <h1 className="text-3xl font-semibold text-slate-950">Your Profile</h1>
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
        key={startEditing ? "profile-edit" : "profile-view"}
        profile={patientProfile}
        onSave={saveProfile}
        isSaving={isSavingProfile}
        isLoading={isLoadingData}
        startEditing={startEditing}
        footer={
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-600">
              Edit Profile is the only place where persistent patient context is
              changed.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full" disabled={!profileReady}>
                <Link href="/dashboard/session">
                  Continue to Check-Up
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        }
      />

      <Card className="border-red-200/80 bg-white/95 shadow-sm">
        <CardHeader>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="size-5" />
          </div>
          <CardTitle className="pt-3 text-xl">Account</CardTitle>
          <CardDescription className="text-base">
            If you no longer need this account, you can remove it here. This action
            is permanent and should be confirmed carefully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDeleteConfirm ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Deleting your account will remove your saved profile and session data.
                Are you sure you want to continue?
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-full"
                  onClick={() => void deleteAccount()}
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? "Deleting account..." : "Yes, delete account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletingAccount}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}

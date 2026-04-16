"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PatientProfile } from "@/types";

const genderOptions = [
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
] as const;

function profileValue(value: number | string | null | undefined, suffix?: string) {
  if (value === null || value === undefined || value === "") {
    return "Not set";
  }

  return suffix && typeof value === "number" ? `${value} ${suffix}` : String(value);
}

function isValidPositiveNumber(value: number | null) {
  return value !== null && Number.isFinite(value) && value > 0;
}

export function ProfileCard({
  profile,
  onSave,
  isSaving,
  isLoading,
  startEditing = false,
  footer,
}: {
  profile: PatientProfile | null;
  onSave: (profile: PatientProfile) => Promise<string>;
  isSaving: boolean;
  isLoading: boolean;
  startEditing?: boolean;
  footer?: React.ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(startEditing);
  const [form, setForm] = useState<PatientProfile>({
    age: profile?.age ?? null,
    gender: profile?.gender ?? null,
    weight: profile?.weight ?? null,
    height: profile?.height ?? null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      form.age === null ||
      form.gender === null ||
      form.weight === null ||
      form.height === null
    ) {
      setError("Please complete all persistent profile fields.");
      return;
    }

    if (
      !isValidPositiveNumber(form.age) ||
      !isValidPositiveNumber(form.weight) ||
      !isValidPositiveNumber(form.height)
    ) {
      setError("Age, weight, and height must be valid positive numbers.");
      return;
    }

    try {
      const message = await onSave(form);
      setSuccess(message);
      setIsEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save the patient profile."
      );
    }
  }

  return (
    <Card id="profile" className="border-slate-200/80 bg-white/95 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription className="mt-2 text-base">
            Persistent patient data is stored once per authenticated user and reused
            across future triage sessions.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={isLoading}
          onClick={() => {
            setError("");
            setSuccess("");
            setForm({
              age: profile?.age ?? null,
              gender: profile?.gender ?? null,
              weight: profile?.weight ?? null,
              height: profile?.height ?? null,
            });
            setIsEditing((current) => !current);
          }}
        >
          <PencilLine className="size-4" />
          {isEditing ? "Close Editor" : "Edit Profile"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            Loading your saved patient profile...
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Age</div>
            <div className="mt-3 text-xl font-semibold text-slate-950">
              {profileValue(profile?.age, "years")}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Gender</div>
            <div className="mt-3 text-xl font-semibold text-slate-950">
              {profileValue(profile?.gender)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Weight</div>
            <div className="mt-3 text-xl font-semibold text-slate-950">
              {profileValue(profile?.weight, "kg")}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Height</div>
            <div className="mt-3 text-xl font-semibold text-slate-950">
              {profileValue(profile?.height, "cm")}
            </div>
          </div>
        </div>

        {!isLoading && (!profile || Object.values(profile).some((value) => value === null)) ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Complete your profile before starting triage. Age, gender, weight, and
            height are stored as persistent patient context and should not be re-entered
            for every session.
          </div>
        ) : !isLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="size-4" />
            Profile data is ready for future triage evaluation logic.
          </div>
        ) : null}

        {success ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile-age">Age</Label>
                <Input
                  id="profile-age"
                  type="number"
                  min="0"
                  className="h-11"
                  value={form.age ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      age:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-gender">Gender</Label>
                <select
                  id="profile-gender"
                  className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none focus-visible:border-sky-300 focus-visible:ring-4 focus-visible:ring-sky-100"
                  value={form.gender ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      gender:
                        event.target.value === ""
                          ? null
                          : (event.target.value as PatientProfile["gender"]),
                    }))
                  }
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-weight">Weight (kg)</Label>
                <Input
                  id="profile-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  className="h-11"
                  value={form.weight ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      weight:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-height">Height (cm)</Label>
                <Input
                  id="profile-height"
                  type="number"
                  min="0"
                  step="0.1"
                  className="h-11"
                  value={form.height ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      height:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    }))
                  }
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                className="h-11 rounded-full px-6"
                disabled={isSaving || isLoading}
              >
                {isSaving ? "Saving profile..." : "Save Profile"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-full px-6"
                onClick={() => setIsEditing(false)}
                disabled={isSaving || isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {footer ? <div className="border-t border-slate-200 pt-5">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}

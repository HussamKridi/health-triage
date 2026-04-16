"use client";

import { useState, type FormEvent } from "react";
import { Cpu, HeartPulse, Thermometer, Wind } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TriageSessionVitals } from "@/types";

type TriageDraft = {
  spo2: string;
  temperature: string;
  heartRate: string;
};

const initialVitals: TriageDraft = {
  spo2: "",
  temperature: "",
  heartRate: "",
};

function parseRequiredNumber(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function TriageForm({
  disabled,
  disabledMessage,
  onSubmit,
  isSubmitting,
  submitLabel = "Begin Triage",
  footer,
}: {
  disabled: boolean;
  disabledMessage?: string;
  onSubmit: (vitals: TriageSessionVitals) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
  footer?: React.ReactNode;
}) {
  const [draft, setDraft] = useState<TriageDraft>(initialVitals);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedVitals = {
      spo2: parseRequiredNumber(draft.spo2),
      temperature: parseRequiredNumber(draft.temperature),
      heartRate: parseRequiredNumber(draft.heartRate),
    };

    if (
      parsedVitals.spo2 === null ||
      parsedVitals.temperature === null ||
      parsedVitals.heartRate === null
    ) {
      setError("Please enter all live session measurements before continuing.");
      return;
    }

    await onSubmit(parsedVitals as TriageSessionVitals);
  }

  function updateDraft(field: keyof TriageDraft, value: string) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <Card className="border-slate-200/80 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Check-Up</CardTitle>
        <CardDescription className="mt-2 text-base">
          Live measurements belong to this session only. They can be entered manually
          today and connected to Arduino or device input in future versions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {disabled ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {disabledMessage ??
              "Complete the persistent patient profile first. Profile data is required context for future triage logic."}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="spo2">SpO2 (%)</Label>
              <div className="relative">
                <Wind className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="spo2"
                  type="number"
                  min="0"
                  max="100"
                  className="h-11 pl-11"
                  disabled={disabled || isSubmitting}
                  value={draft.spo2}
                  onChange={(event) => updateDraft("spo2", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (C)</Label>
              <div className="relative">
                <Thermometer className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="temperature"
                  type="number"
                  min="30"
                  max="45"
                  step="0.1"
                  className="h-11 pl-11"
                  disabled={disabled || isSubmitting}
                  value={draft.temperature}
                  onChange={(event) => updateDraft("temperature", event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
              <div className="relative">
                <HeartPulse className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="heart-rate"
                  type="number"
                  min="20"
                  max="220"
                  className="h-11 pl-11"
                  disabled={disabled || isSubmitting}
                  value={draft.heartRate}
                  onChange={(event) => updateDraft("heartRate", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            <div className="flex items-center gap-2 font-medium">
              <Cpu className="size-4" />
              Device integration ready
            </div>
            <p className="mt-1 leading-6">
              Live measurements can be entered manually now and later connected from
              Arduino or other sensor devices without changing the session model.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            className="h-11 rounded-full px-6"
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? "Running triage..." : submitLabel}
          </Button>
        </form>

        {footer ? <div className="border-t border-slate-200 pt-5">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}

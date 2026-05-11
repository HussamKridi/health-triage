"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { ClipboardCheck, SendHorizonal } from "lucide-react";

import { SAFETY_TRIAGE_QUESTIONS } from "@/lib/triage/safety-questions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type {
  TriageSafetyAnswerValue,
  TriageSafetyQuestionId,
  TriageSafetyResponses,
  TriageSession,
} from "@/types";

type DraftAnswers = Partial<Record<TriageSafetyQuestionId, TriageSafetyAnswerValue>>;

export function SafetyQuestionsPanel({
  session,
  onSubmit,
  isSubmitting,
  footer,
}: {
  session: TriageSession | null;
  onSubmit: (responses: TriageSafetyResponses) => Promise<void>;
  isSubmitting: boolean;
  footer?: React.ReactNode;
}) {
  const initialAnswers = useMemo<DraftAnswers>(() => {
    const savedAnswers = session?.safetyResponses?.answers ?? [];

    return Object.fromEntries(
      savedAnswers.map((answer) => [answer.questionId, answer.answerValue])
    );
  }, [session]);

  const [answers, setAnswers] = useState<DraftAnswers>(initialAnswers);
  const [notes, setNotes] = useState(session?.safetyResponses?.notes ?? "");
  const [error, setError] = useState("");

  const answeredCount = SAFETY_TRIAGE_QUESTIONS.filter(
    (question) => answers[question.id]
  ).length;
  const allAnswered = answeredCount === SAFETY_TRIAGE_QUESTIONS.length;

  function updateAnswer(
    questionId: TriageSafetyQuestionId,
    value: TriageSafetyAnswerValue
  ) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
    setError("");
  }

  function updateNotes(event: ChangeEvent<HTMLTextAreaElement>) {
    setNotes(event.target.value);
  }

  async function handleSubmit() {
    if (!allAnswered) {
      setError("Please answer all 5 safety questions before continuing.");
      return;
    }

    await onSubmit({
      answers: SAFETY_TRIAGE_QUESTIONS.map((question) => {
        const answerValue = answers[question.id] ?? "no";

        return {
          questionId: question.id,
          questionText: question.text,
          answerValue,
          answerLabel: answerValue === "yes" ? "Yes" : "No",
        };
      }),
      notes: notes.trim(),
    });
  }

  return (
    <Card className="border-slate-200/80 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Safety Questions</CardTitle>
        <CardDescription className="mt-2 text-base">
          Answer these required Yes/No questions for every check-up before the
          final triage result is calculated.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!session || session.status === "completed" ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm leading-7 text-slate-600">
            No safety questions are pending. Start a check-up or review the
            completed result.
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-800">
                <ClipboardCheck className="size-4" />
                Required triage screen
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {answeredCount} of {SAFETY_TRIAGE_QUESTIONS.length} answered
              </p>
            </div>

            <div className="space-y-4">
              {SAFETY_TRIAGE_QUESTIONS.map((question, index) => (
                <fieldset
                  key={question.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-4"
                >
                  <legend className="px-1 text-sm font-semibold text-slate-950">
                    {index + 1}. {question.text}
                  </legend>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {(["yes", "no"] as const).map((value) => {
                      const inputId = `${question.id}-${value}`;
                      const selected = answers[question.id] === value;

                      return (
                        <Label
                          key={value}
                          htmlFor={inputId}
                          className={`flex min-w-28 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                            selected
                              ? "border-sky-300 bg-sky-50 text-sky-800"
                              : "border-slate-200 bg-white text-slate-700 hover:border-sky-200"
                          }`}
                        >
                          <input
                            id={inputId}
                            type="radio"
                            name={question.id}
                            value={value}
                            checked={selected}
                            disabled={isSubmitting}
                            onChange={() => updateAnswer(question.id, value)}
                            className="size-4 accent-sky-700"
                          />
                          {value === "yes" ? "Yes" : "No"}
                        </Label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional-symptoms-notes">
                Additional symptoms or notes (optional)
              </Label>
              <textarea
                id="additional-symptoms-notes"
                value={notes}
                onChange={updateNotes}
                disabled={isSubmitting}
                rows={4}
                className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <Button
              type="button"
              className="h-11 rounded-full px-6"
              disabled={isSubmitting || !allAnswered}
              onClick={handleSubmit}
            >
              <SendHorizonal className="size-4" />
              {isSubmitting ? "Calculating result..." : "Continue to Result"}
            </Button>
          </>
        )}

        {footer ? <div className="border-t border-slate-200 pt-5">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}

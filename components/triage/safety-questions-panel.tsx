"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { SAFETY_TRIAGE_QUESTIONS } from "@/lib/triage/safety-questions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  TriageSafetyAnswer,
  TriageSafetyQuestionId,
  TriageSafetyResponses,
  TriageSession,
} from "@/types";

type DraftAnswers = Partial<Record<TriageSafetyQuestionId, TriageSafetyAnswer>>;

function getSavedDraft(session: TriageSession | null): DraftAnswers {
  const savedAnswers = session?.safetyResponses?.answers ?? [];

  return Object.fromEntries(
    savedAnswers.map((answer) => [answer.questionId, answer])
  );
}

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
  const initialAnswers = useMemo(() => getSavedDraft(session), [session]);
  const [answers, setAnswers] = useState<DraftAnswers>(initialAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState("");

  const currentQuestion = SAFETY_TRIAGE_QUESTIONS[currentIndex];
  const selectedAnswer = answers[currentQuestion.id];
  const progress = Math.round(((currentIndex + 1) / SAFETY_TRIAGE_QUESTIONS.length) * 100);
  const isLastQuestion = currentIndex === SAFETY_TRIAGE_QUESTIONS.length - 1;

  function selectAnswer(option: (typeof currentQuestion.options)[number]) {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        selectedLabel: option.label,
        severity: option.severity,
        severityScore: option.severityScore,
        answerValue: option.severity,
        answerLabel: option.label,
      },
    }));
    setError("");
  }

  function goBack() {
    setError("");
    setCurrentIndex((current) => Math.max(current - 1, 0));
  }

  async function goNext() {
    if (!selectedAnswer) {
      setError("Please select an option before continuing.");
      return;
    }

    if (!isLastQuestion) {
      setError("");
      setCurrentIndex((current) => current + 1);
      return;
    }

    const completedAnswers = SAFETY_TRIAGE_QUESTIONS.map(
      (question) => answers[question.id]
    );

    if (completedAnswers.some((answer) => !answer)) {
      setError("Please answer all 5 questions before continuing.");
      return;
    }

    await onSubmit({
      answers: completedAnswers as TriageSafetyAnswer[],
      notes: "",
    });
  }

  if (!session || session.status === "completed") {
    return (
      <Card className="mx-auto w-full max-w-3xl border-slate-200/80 bg-white/95 shadow-sm">
        <CardContent className="p-6">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm leading-7 text-slate-600">
            No safety questions are pending. Start a check-up or review the
            completed result.
          </div>
          {footer ? <div className="mt-5 border-t border-slate-200 pt-5">{footer}</div> : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.38)]">
      <div className="border-b border-slate-100 bg-white px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-600">
          <span>
            Question {currentIndex + 1} of {SAFETY_TRIAGE_QUESTIONS.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white px-6 py-7 sm:px-8 sm:py-8">
        <div className="flex items-start gap-3">
          <span className="text-lg font-semibold text-blue-600">
            {currentIndex + 1}.
          </span>
          <div>
            <h2 className="text-xl font-semibold leading-8 text-slate-950">
              {currentQuestion.text}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Choose the option that best describes your condition.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-4">
          {currentQuestion.options.map((option) => {
            const selected = selectedAnswer?.selectedLabel === option.label;

            return (
              <button
                key={option.label}
                type="button"
                disabled={isSubmitting}
                onClick={() => selectAnswer(option)}
                className={`flex min-h-14 w-full items-center gap-4 rounded-xl border px-4 py-4 text-left text-sm font-semibold transition ${
                  selected
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-[0_12px_30px_-24px_rgba(16,185,129,0.75)]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40"
                }`}
              >
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    selected
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selected ? <Check className="size-3.5" /> : null}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-white px-6 py-5 sm:px-8">
        <Button
          type="button"
          variant="outline"
          className="h-11 rounded-xl border-slate-200 px-5 text-slate-600"
          disabled={currentIndex === 0 || isSubmitting}
          onClick={goBack}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button
          type="button"
          className="h-11 rounded-xl bg-blue-600 px-6 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
          disabled={isSubmitting || !selectedAnswer}
          onClick={goNext}
        >
          {isSubmitting
            ? "Calculating..."
            : isLastQuestion
              ? "Continue to Result"
              : "Next"}
          <ArrowRight className="size-4" />
        </Button>
      </div>

      {footer ? <div className="border-t border-slate-100 px-6 py-5 sm:px-8">{footer}</div> : null}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, MessageSquareMore, SendHorizonal } from "lucide-react";

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
import type { TriageQuestionOption, TriageSession } from "@/types";

function getQuestionOptions(session: TriageSession | null): TriageQuestionOption[] {
  const question = session?.currentQuestion;

  if (!question) {
    return [];
  }

  if (question.inputType === "boolean" && (!question.options || question.options.length === 0)) {
    return [
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ];
  }

  return question.options ?? [];
}

export function FollowUpPanel({
  session,
  onSubmitAnswer,
  isSubmitting,
  footer,
}: {
  session: TriageSession | null;
  onSubmitAnswer: (answer: string, answerLabel: string) => Promise<void>;
  isSubmitting: boolean;
  footer?: React.ReactNode;
}) {
  const [draftAnswer, setDraftAnswer] = useState("");
  const currentQuestion = session?.currentQuestion ?? null;
  const options = useMemo(() => getQuestionOptions(session), [session]);

  async function submitSelectedAnswer(answerValue: string) {
    if (!currentQuestion) {
      return;
    }

    const selectedOptionLabel =
      options.find((option) => option.value === answerValue)?.label ?? answerValue;

    await onSubmitAnswer(answerValue, selectedOptionLabel);
    setDraftAnswer("");
  }

  async function handleTextSubmit() {
    if (!currentQuestion || draftAnswer.trim() === "") {
      return;
    }

    await onSubmitAnswer(draftAnswer.trim(), draftAnswer.trim());
    setDraftAnswer("");
  }

  return (
    <Card className="border-slate-200/80 bg-white/95 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Questions</CardTitle>
        <CardDescription className="mt-2 text-base">
          One question appears at a time. Simple answers use guided choices so the
          triage flow stays fast, clear, and medically structured.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!session || session.status === "completed" || !currentQuestion ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm leading-7 text-slate-600">
            No pending follow-up question. Start a triage session or review a
            completed result.
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-sky-800">
                <MessageSquareMore className="size-4" />
                Current question
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {currentQuestion.questionText}
              </p>
            </div>

            {currentQuestion.inputType === "text" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="follow-up-answer">Your answer</Label>
                  <Input
                    id="follow-up-answer"
                    className="h-11"
                    value={draftAnswer}
                    onChange={(event) => setDraftAnswer(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="button"
                  className="h-11 rounded-full px-6"
                  disabled={isSubmitting || draftAnswer.trim() === ""}
                  onClick={handleTextSubmit}
                >
                  <SendHorizonal className="size-4" />
                  {isSubmitting ? "Saving answer..." : "Submit Answer"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-900">
                  {currentQuestion.inputType === "boolean"
                    ? "Choose Yes or No"
                    : "Select one answer"}
                </div>
                <div className="grid gap-3">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => submitSelectedAnswer(option.value)}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-sm text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>{option.label}</span>
                      <CheckCircle2 className="size-4 text-sky-700" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-900">Conversation timeline</div>
              <div className="space-y-3">
                {session.conversationHistory.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600">
                    No follow-up history yet.
                  </div>
                ) : (
                  session.conversationHistory.map((turn) => (
                    <div
                      key={turn.id}
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                        turn.role === "assistant"
                          ? "border border-sky-100 bg-sky-50 text-slate-700"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <div className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        {turn.role === "assistant" ? "Question" : "Answer"}
                      </div>
                      {turn.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {footer ? <div className="border-t border-slate-200 pt-5">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}

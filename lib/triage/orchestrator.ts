import "server-only";

import type {
  FinalTriageResult,
  GeminiTriageRequest,
  TriageDecision,
  TriageQuestion,
} from "@/types";
import { requestGeminiTriageDecision } from "@/lib/gemini";
import {
  buildDiagnosisDurationQuestion,
  buildFallbackDecision,
  shouldAskDiagnosisDuration,
} from "@/lib/triage/fallback";

function askedQuestionTexts(payload: GeminiTriageRequest) {
  return new Set(
    payload.conversationHistory
      .filter((item) => item.kind === "question")
      .map((item) => item.text.trim().toLowerCase())
  );
}

function validateDecision(
  payload: GeminiTriageRequest,
  decision: TriageDecision | null
): TriageDecision | null {
  if (!decision) {
    return null;
  }

  if (decision.kind === "question") {
    const question = decision.question as TriageQuestion | undefined;

    if (!question?.questionText || !question.type || !question.inputType) {
      return null;
    }

    const priorQuestions = askedQuestionTexts(payload);
    if (priorQuestions.has(question.questionText.trim().toLowerCase())) {
      return null;
    }

    return {
      kind: "question",
      question: {
        ...question,
        id: question.id || question.type,
        options:
          question.inputType === "boolean" && (!question.options || question.options.length === 0)
            ? [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ]
            : question.options,
      },
    };
  }

  const finalResult = decision.finalResult as FinalTriageResult | undefined;
  if (
    !finalResult?.riskLabel ||
    !finalResult.reasoning ||
    !finalResult.advice ||
    !finalResult.recommendedNextAction
  ) {
    return null;
  }

  if (shouldAskDiagnosisDuration(payload.conversationHistory)) {
    return {
      kind: "question",
      question: buildDiagnosisDurationQuestion(),
    };
  }

  return {
    kind: "final",
    finalResult: {
      ...finalResult,
      finalSource: "gemini",
    },
  };
}

export async function orchestrateTriageDecision(
  payload: GeminiTriageRequest
): Promise<TriageDecision> {
  if (payload.localAssessment.usedSafetyOverride) {
    return {
      kind: "final",
      finalResult: {
        riskLabel: "High",
        isCrucial: true,
        reasoning:
          "A hard safety override was triggered by the live vitals, so the session is finalized immediately as high risk.",
        advice:
          "Seek urgent emergency evaluation now and do not wait for more follow-up questioning.",
        recommendedNextAction: "Call emergency services or proceed to emergency care immediately.",
        disagreement: false,
        finalSource: "baseline",
      },
    };
  }

  const firstAttempt = validateDecision(
    payload,
    await requestGeminiTriageDecision(payload)
  );

  if (firstAttempt) {
    return firstAttempt;
  }

  const secondAttempt = validateDecision(
    payload,
    await requestGeminiTriageDecision(payload)
  );

  if (secondAttempt) {
    return secondAttempt;
  }

  return buildFallbackDecision(payload);
}

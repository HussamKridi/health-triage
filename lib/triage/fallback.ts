import type {
  FinalTriageResult,
  GeminiTriageRequest,
  TriageDecision,
  TriageQuestion,
} from "@/types";

function askedQuestionTypes(history: GeminiTriageRequest["conversationHistory"]) {
  return new Set(history.filter((item) => item.kind === "question").map((item) => item.questionId));
}

function buildQuestion(question: TriageQuestion): TriageDecision {
  return {
    kind: "question",
    question,
  };
}

export function buildDiagnosisDurationQuestion(): TriageQuestion {
  return {
    id: "diagnosis-duration",
    type: "diagnosis_duration",
    inputType: "single-select",
    questionText: "How long have you been suffering from this diagnosis?",
    options: [
      { label: "1 - 3 days", value: "1-3-days" },
      { label: "3 - 7 days", value: "3-7-days" },
      { label: "1 week", value: "1-week" },
      { label: "More than 1 week", value: "more-than-1-week" },
    ],
  };
}

export function shouldAskDiagnosisDuration(
  history: GeminiTriageRequest["conversationHistory"]
) {
  const hasAskedDuration = history.some(
    (item) =>
      item.kind === "question" &&
      (item.questionId === "diagnosis-duration" ||
        item.questionId === "diagnosis_duration")
  );

  if (hasAskedDuration) {
    return false;
  }

  return history.some((item) => {
    if (item.kind !== "answer" || !item.questionId) {
      return false;
    }

    const answer = item.answerValue?.toLowerCase();
    if (!answer) {
      return false;
    }

    if (item.questionId === "chronic-disease" && answer === "yes") {
      return true;
    }

    if (item.questionId === "infection-duration") {
      return answer === "worsening" || answer === "duration";
    }

    if (item.questionId === "respiratory_danger") {
      return answer === "significant" || answer === "mild";
    }

    return false;
  });
}

export function getFallbackQuestion(payload: GeminiTriageRequest) {
  const asked = askedQuestionTypes(payload.conversationHistory);

  if (shouldAskDiagnosisDuration(payload.conversationHistory)) {
    return buildDiagnosisDurationQuestion();
  }

  const candidates: TriageQuestion[] = [
    {
      id: "breathing-danger",
      type: "respiratory_danger",
      inputType: "single-select",
      questionText: "Are you having shortness of breath, chest pain, or trouble speaking in full sentences right now?",
      options: [
        { label: "No", value: "no" },
        { label: "Mild shortness of breath", value: "mild" },
        { label: "Yes, significant breathing or chest symptoms", value: "significant" },
      ],
    },
    {
      id: "infection-duration",
      type: "infection_duration",
      inputType: "single-select",
      questionText: "Have you had fever, chills, or infection-like symptoms for more than 24 hours, or are they getting worse?",
      options: [
        { label: "No", value: "no" },
        { label: "Yes, symptoms are worsening", value: "worsening" },
        { label: "Yes, present for more than 24 hours", value: "duration" },
      ],
    },
    {
      id: "circulation-neuro",
      type: "circulation_neuro",
      inputType: "single-select",
      questionText: "Have you felt faint, confused, severely weak, or unusually dehydrated today?",
      options: [
        { label: "No", value: "no" },
        { label: "Mildly", value: "mild" },
        { label: "Yes, clearly", value: "yes" },
      ],
    },
    {
      id: "chronic-disease",
      type: "chronic_disease",
      inputType: "boolean",
      questionText: "Do you have chronic heart disease, lung disease, or another serious long-term condition?",
      options: [
        { label: "No", value: "no" },
        { label: "Yes", value: "yes" },
      ],
    },
    {
      id: "worsening-general",
      type: "worsening_general",
      inputType: "single-select",
      questionText: "Overall, are the symptoms stable, improving, or getting worse quickly?",
      options: [
        { label: "Stable", value: "stable" },
        { label: "Improving", value: "improving" },
        { label: "Getting worse quickly", value: "worsening" },
      ],
    },
  ];

  const orderedCandidates =
    payload.vitals.spo2 <= 94
      ? [candidates[0], candidates[4], candidates[3], candidates[1], candidates[2]]
      : payload.vitals.temperature >= 37.8
        ? [candidates[1], candidates[4], candidates[3], candidates[2], candidates[0]]
        : payload.vitals.heartRate >= 100 || payload.vitals.heartRate <= 55
          ? [candidates[2], candidates[4], candidates[3], candidates[0], candidates[1]]
          : (payload.profile.age ?? 0) >= 65
            ? [candidates[3], candidates[4], candidates[0], candidates[2], candidates[1]]
            : [candidates[4], candidates[0], candidates[1], candidates[2], candidates[3]];

  return (
    orderedCandidates.find(
      (candidate) => !asked.has(candidate.type) && !asked.has(candidate.id)
    ) ?? candidates[4]
  );
}

export function buildFallbackFinalResult(
  payload: GeminiTriageRequest
): FinalTriageResult {
  const highRisk = payload.localAssessment.riskLabel === "High";
  const moderateRisk = payload.localAssessment.riskLabel === "Moderate";

  return {
    riskLabel: payload.localAssessment.riskLabel,
    isCrucial: payload.localAssessment.isCrucial,
    reasoning: highRisk
      ? payload.localAssessment.summary
      : moderateRisk
        ? payload.localAssessment.summary
        : "Gemini follow-up was unavailable, so the session was finalized using the local baseline assessment, fixed safety answers, and conservative fallback rules.",
    advice: highRisk
      ? "Seek urgent in-person evaluation immediately and do not delay emergency support if symptoms escalate."
      : moderateRisk
        ? "Monitor symptoms closely and arrange medical review if symptoms continue, worsen, or new severe symptoms appear."
        : "Monitor symptoms closely, rest, hydrate, and seek medical review if symptoms worsen or new severe symptoms appear.",
    recommendedNextAction: highRisk
      ? "Emergency evaluation recommended now."
      : moderateRisk
        ? "Medical review or close follow-up recommended."
        : "Routine follow-up and symptom monitoring.",
    disagreement: false,
    finalSource: highRisk ? "baseline" : "fallback",
  };
}

export function buildFallbackDecision(payload: GeminiTriageRequest): TriageDecision {
  if (shouldAskDiagnosisDuration(payload.conversationHistory)) {
    return buildQuestion(buildDiagnosisDurationQuestion());
  }

  if (
    payload.localAssessment.usedSafetyOverride ||
    payload.conversationHistory.filter((item) => item.kind === "answer").length >= 2
  ) {
    return {
      kind: "final",
      finalResult: buildFallbackFinalResult(payload),
    };
  }

  return buildQuestion(getFallbackQuestion(payload));
}

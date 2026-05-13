import "server-only";

import { getOptionalGeminiApiKey } from "@/lib/env.server";
import type { GeminiTriageRequest, TriageDecision } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function buildPrompt(payload: GeminiTriageRequest) {
  return [
    "You are a controlled health triage follow-up layer.",
    "Return JSON only.",
    "You must do exactly one of two things: ask ONE follow-up question, or return a final triage result.",
    "Never ask more than one question at a time.",
    "Do not repeat a previous question.",
    "If safetyResponses is present, the fixed safety question section is complete. Do not ask another question; return a final triage result only.",
    "Use safetyResponses severityScore values: any score 3 is high risk; two or more score 2 answers are high risk. Dangerous vitals should remain high risk even when all safety answers are none.",
    "If the case seems clearly dangerous, return a final result quickly.",
    "",
    "Context:",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

export async function requestGeminiTriageDecision(
  payload: GeminiTriageRequest
): Promise<TriageDecision | null> {
  const apiKey = getOptionalGeminiApiKey();

  if (!apiKey) {
    return null;
  }

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(payload) }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "OBJECT",
          properties: {
            kind: {
              type: "STRING",
              enum: ["question", "final"],
            },
            question: {
              type: "OBJECT",
              nullable: true,
              properties: {
                id: { type: "STRING" },
                type: { type: "STRING" },
                inputType: {
                  type: "STRING",
                  enum: ["boolean", "single-select", "text"],
                },
                questionText: { type: "STRING" },
                options: {
                  type: "ARRAY",
                  nullable: true,
                  items: {
                    type: "OBJECT",
                    properties: {
                      label: { type: "STRING" },
                      value: { type: "STRING" },
                    },
                    required: ["label", "value"],
                  },
                },
              },
              required: ["id", "type", "inputType", "questionText"],
            },
            finalResult: {
              type: "OBJECT",
              nullable: true,
              properties: {
                riskLabel: {
                  type: "STRING",
                  enum: ["Low", "Moderate", "High"],
                },
                isCrucial: { type: "BOOLEAN" },
                reasoning: { type: "STRING" },
                advice: { type: "STRING" },
                recommendedNextAction: { type: "STRING" },
                disagreement: { type: "BOOLEAN" },
                finalSource: {
                  type: "STRING",
                  enum: ["gemini", "fallback", "baseline"],
                },
              },
              required: [
                "riskLabel",
                "isCrucial",
                "reasoning",
                "advice",
                "recommendedNextAction",
                "disagreement",
                "finalSource",
              ],
            },
          },
          required: ["kind"],
        },
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as TriageDecision;
  } catch {
    return null;
  }
}

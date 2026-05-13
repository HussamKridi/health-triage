import type {
  TriageSafetyQuestionId,
  TriageSafetySeverity,
  TriageSafetySeverityScore,
} from "@/types";

export type SafetyQuestionOption = {
  label: string;
  severity: TriageSafetySeverity;
  severityScore: TriageSafetySeverityScore;
};

export type SafetyQuestionDefinition = {
  id: TriageSafetyQuestionId;
  text: string;
  options: SafetyQuestionOption[];
};

export const SAFETY_TRIAGE_QUESTIONS: SafetyQuestionDefinition[] = [
  {
    id: "chest-pain",
    text: "Are you experiencing chest pain or chest pressure?",
    options: [
      { label: "No, not at all", severity: "none", severityScore: 0 },
      { label: "Mild chest discomfort", severity: "mild", severityScore: 1 },
      { label: "Moderate chest pain", severity: "moderate", severityScore: 2 },
      { label: "Severe chest pain", severity: "severe", severityScore: 3 },
    ],
  },
  {
    id: "breathing-difficulty",
    text: "Are you having difficulty breathing or shortness of breath?",
    options: [
      { label: "No, not at all", severity: "none", severityScore: 0 },
      { label: "Mild difficulty", severity: "mild", severityScore: 1 },
      { label: "Moderate difficulty", severity: "moderate", severityScore: 2 },
      { label: "Severe difficulty", severity: "severe", severityScore: 3 },
    ],
  },
  {
    id: "faint-confused-dizzy",
    text: "Have you fainted, become confused, or felt severely dizzy recently?",
    options: [
      { label: "No, not at all", severity: "none", severityScore: 0 },
      { label: "Mild dizziness", severity: "mild", severityScore: 1 },
      {
        label: "Moderate dizziness/confusion",
        severity: "moderate",
        severityScore: 2,
      },
      {
        label: "Severe fainting or confusion",
        severity: "severe",
        severityScore: 3,
      },
    ],
  },
  {
    id: "severe-pain-bleeding-injury",
    text: "Do you currently have severe pain, heavy bleeding, or a serious injury?",
    options: [
      { label: "No, not at all", severity: "none", severityScore: 0 },
      {
        label: "Mild pain or minor injury",
        severity: "mild",
        severityScore: 1,
      },
      {
        label: "Moderate pain or bleeding",
        severity: "moderate",
        severityScore: 2,
      },
      {
        label: "Severe pain, heavy bleeding, or serious injury",
        severity: "severe",
        severityScore: 3,
      },
    ],
  },
  {
    id: "sudden-worsening",
    text: "Have your symptoms suddenly become much worse today?",
    options: [
      { label: "No, not at all", severity: "none", severityScore: 0 },
      { label: "Slightly worse", severity: "mild", severityScore: 1 },
      { label: "Moderately worse", severity: "moderate", severityScore: 2 },
      { label: "Much worse suddenly", severity: "severe", severityScore: 3 },
    ],
  },
];

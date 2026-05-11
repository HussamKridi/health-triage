import type { TriageSafetyQuestionId } from "@/types";

export type SafetyQuestionDefinition = {
  id: TriageSafetyQuestionId;
  text: string;
};

export const SAFETY_TRIAGE_QUESTIONS: SafetyQuestionDefinition[] = [
  {
    id: "chest-pain",
    text: "Are you experiencing chest pain or chest pressure?",
  },
  {
    id: "breathing-difficulty",
    text: "Are you having difficulty breathing or shortness of breath?",
  },
  {
    id: "faint-confused-dizzy",
    text: "Have you fainted, become confused, or felt severely dizzy recently?",
  },
  {
    id: "severe-pain-bleeding-injury",
    text: "Do you currently have severe pain, heavy bleeding, or a serious injury?",
  },
  {
    id: "sudden-worsening",
    text: "Have your symptoms suddenly become much worse today?",
  },
];

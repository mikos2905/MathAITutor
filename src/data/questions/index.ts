import type { Paper, Question, Topic } from "@/lib/ib/types";
import { CORE_QUESTIONS } from "./core";
import { ALGEBRA_QUESTIONS } from "./algebra";
import { FUNCTIONS_QUESTIONS } from "./functions";
import { TRIGONOMETRY_QUESTIONS } from "./trigonometry";
import { CALCULUS_QUESTIONS } from "./calculus";
import { STATISTICS_QUESTIONS } from "./statistics";
import { PAPER3_QUESTIONS } from "./paper3";

/**
 * The question bank, split by topic so each file stays readable.
 *
 * Adding a question is the main way this app grows. The rubric is the part
 * that matters — write it in real markscheme language, type every point
 * M/A/R/AG, and list equivalent forms under `accept`. A vague rubric produces
 * vague marking, and vague marking is worse than none.
 */
export const QUESTIONS: Question[] = [
  ...CORE_QUESTIONS,
  ...ALGEBRA_QUESTIONS,
  ...FUNCTIONS_QUESTIONS,
  ...TRIGONOMETRY_QUESTIONS,
  ...CALCULUS_QUESTIONS,
  ...STATISTICS_QUESTIONS,
  ...PAPER3_QUESTIONS,
];

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function questionsByTopic(topic: Topic): Question[] {
  return QUESTIONS.filter((q) => q.topic === topic);
}

export function questionsByPaper(paper: Paper): Question[] {
  return QUESTIONS.filter((q) => q.paper === paper);
}

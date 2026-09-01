import type { HintRung } from "./types";

/**
 * The rungs of the hint ladder, gentlest first.
 *
 * The labels are shown to the student before they commit to a rung, so they
 * can stop at the level of help they actually need rather than always taking
 * the maximum. `costsUnderstanding` marks the rungs that hand over the method
 * — those are the ones worth hesitating over, and the ones the grader is told
 * about when marking.
 */
export interface RungMeta {
  rung: HintRung;
  label: string;
  /** Shown on the button before the hint is revealed. */
  promise: string;
  costsUnderstanding: boolean;
}

export const RUNGS: RungMeta[] = [
  {
    rung: 1,
    label: "Orient",
    promise: "Points you at what the question is actually asking. Gives nothing away.",
    costsUnderstanding: false,
  },
  {
    rung: 2,
    label: "Nudge",
    promise: "Names the topic or technique and asks you a question. Still your work.",
    costsUnderstanding: false,
  },
  {
    rung: 3,
    label: "Strategy",
    promise: "Describes the route without executing it. You still do the maths.",
    costsUnderstanding: false,
  },
  {
    rung: 4,
    label: "Next step",
    promise: "Does one step for you, then stops. You finish it.",
    costsUnderstanding: true,
  },
  {
    rung: 5,
    label: "Full solution",
    promise: "The complete worked answer. You will not have earned these marks.",
    costsUnderstanding: true,
  },
];

export function rungMeta(rung: HintRung): RungMeta {
  return RUNGS[rung - 1];
}

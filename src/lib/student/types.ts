import type { HintUsage, TechniqueFlag, TechniqueFlagKind, Topic } from "@/lib/ib/types";

/**
 * The student model: what the tutor remembers about you between sessions.
 *
 * This is the difference between a tool and a tutor. A tool marks the thing
 * in front of it. A tutor notices you have made the same mistake three weeks
 * running and tells you that instead.
 */

/** One error, with every time it has shown up. */
export interface MisconceptionRecord {
  /** Stable slug produced by the grader, e.g. "chain-rule-omits-inner-derivative". */
  id: string;
  /** Most recent phrasing of the misconception. */
  statement: string;
  topic: Topic;
  occurrences: {
    at: string; // ISO timestamp
    questionId: string;
    evidence: string;
  }[];
}

/** A graded attempt, reduced to what is worth remembering. */
export interface AttemptRecord {
  id: string;
  at: string;
  questionId: string;
  marksAwarded: number;
  marksAvailable: number;
  secondsTaken: number;
  suggestedMinutes: number;
  topic: Topic;
  hintUsage: HintUsage[];
  techniqueFlags: TechniqueFlag[];
  misconceptionIds: string[];
  /**
   * Marks lost broken down by mark type. Losing M marks means you cannot find
   * the method; losing A marks means you can but you are careless; losing R
   * marks means you never write the justification. Three different problems,
   * three different fixes — and most students never learn which is theirs.
   */
  marksLostByType: Record<string, number>;
}

export interface StudentModel {
  attempts: AttemptRecord[];
  misconceptions: Record<string, MisconceptionRecord>;
}

export const EMPTY_MODEL: StudentModel = { attempts: [], misconceptions: {} };

// ---------------------------------------------------------------------------
// Derived analysis
// ---------------------------------------------------------------------------

export interface RecurringMisconception {
  record: MisconceptionRecord;
  count: number;
  daysSinceLast: number;
}

export interface TopicStanding {
  topic: Topic;
  attempts: number;
  marksAwarded: number;
  marksAvailable: number;
  /** Days since last attempted, or null if never. */
  daysSinceLast: number | null;
}

export interface Diagnosis {
  totalAttempts: number;
  marksAwarded: number;
  marksAvailable: number;
  /** Which mark type costs you most, and how much. Your real weakness. */
  worstMarkType: { type: string; marksLost: number } | null;
  marksLostByType: Record<string, number>;
  recurringFlags: { kind: TechniqueFlagKind; count: number; marksCost: number }[];
  recurring: RecurringMisconception[];
  topics: TopicStanding[];
  /** Topics not touched in over 14 days, oldest first. */
  stale: TopicStanding[];
}

import type { RecallGrade, TechniqueFlagKind, Topic } from "@/lib/ib/types";
import { TOPIC_NAMES } from "@/lib/ib/syllabus";
import type {
  Diagnosis,
  RecurringMisconception,
  StudentModel,
  TopicStanding,
} from "./types";

const DAY_MS = 1000 * 60 * 60 * 24;
const STALE_DAYS = 14;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
}

/**
 * Turns raw history into the thing a tutor would actually say.
 *
 * The important output is `worstMarkType`. "You are losing 60% of your dropped
 * marks to R marks" is a diagnosis with an obvious fix — start writing the
 * justification sentence. "You're weak at calculus" is not.
 */
export function analyse(model: StudentModel): Diagnosis {
  const marksLostByType: Record<string, number> = {};
  for (const attempt of model.attempts) {
    for (const [type, lost] of Object.entries(attempt.marksLostByType)) {
      marksLostByType[type] = (marksLostByType[type] ?? 0) + lost;
    }
  }

  const worst = Object.entries(marksLostByType).sort((a, b) => b[1] - a[1])[0];

  // Technique problems, counted across every attempt.
  const flagTally = new Map<TechniqueFlagKind, { count: number; marksCost: number }>();
  for (const attempt of model.attempts) {
    for (const flag of attempt.techniqueFlags) {
      const entry = flagTally.get(flag.kind) ?? { count: 0, marksCost: 0 };
      entry.count += 1;
      entry.marksCost += flag.marksCost;
      flagTally.set(flag.kind, entry);
    }
  }

  // A misconception seen once is a slip. Seen twice or more, it is a habit.
  const recurring: RecurringMisconception[] = Object.values(model.misconceptions)
    .filter((record) => record.occurrences.length >= 2)
    .map((record) => ({
      record,
      count: record.occurrences.length,
      daysSinceLast: daysSince(record.occurrences[record.occurrences.length - 1].at),
    }))
    .sort((a, b) => b.count - a.count);

  // Standing per topic, including topics never attempted.
  const topics: TopicStanding[] = (Object.keys(TOPIC_NAMES) as Topic[]).map((topic) => {
    const attempts = model.attempts.filter((a) => a.topic === topic);
    const last = attempts[attempts.length - 1];
    return {
      topic,
      attempts: attempts.length,
      marksAwarded: attempts.reduce((s, a) => s + a.marksAwarded, 0),
      marksAvailable: attempts.reduce((s, a) => s + a.marksAvailable, 0),
      daysSinceLast: last ? daysSince(last.at) : null,
    };
  });

  const byGrade: Record<RecallGrade, number> = { solid: 0, partial: 0, absent: 0 };
  for (const check of model.recallChecks ?? []) byGrade[check.grade] += 1;

  return {
    totalAttempts: model.attempts.length,
    marksAwarded: model.attempts.reduce((s, a) => s + a.marksAwarded, 0),
    marksAvailable: model.attempts.reduce((s, a) => s + a.marksAvailable, 0),
    worstMarkType: worst ? { type: worst[0], marksLost: worst[1] } : null,
    marksLostByType,
    recurringFlags: [...flagTally.entries()]
      .map(([kind, v]) => ({ kind, ...v }))
      .sort((a, b) => b.count - a.count),
    recurring,
    topics,
    stale: topics
      .filter((t) => t.daysSinceLast === null || t.daysSinceLast >= STALE_DAYS)
      .sort((a, b) => (b.daysSinceLast ?? 9999) - (a.daysSinceLast ?? 9999)),
    recall: { total: (model.recallChecks ?? []).length, byGrade },
  };
}

/** Plain-English label for a mark type, for the UI and the prompt. */
export const MARK_TYPE_NAMES: Record<string, string> = {
  M: "method",
  A: "accuracy",
  R: "reasoning",
  AG: "answer given",
};

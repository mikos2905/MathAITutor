import { TOPIC_NAMES } from "@/lib/ib/syllabus";
import { analyse, MARK_TYPE_NAMES } from "./analyse";
import type { StudentModel } from "./types";

/**
 * Summarises the student's history for the grading prompt.
 *
 * This is what makes the feedback sound like someone who knows you: the
 * grader can say "this is the fourth time" instead of treating every attempt
 * as the first one it has ever seen.
 *
 * It varies per request, so it must sit AFTER the cached system prompt and
 * question block or it would invalidate the cache on every single grade.
 */
export function buildHistoryBlock(model: StudentModel): string {
  const d = analyse(model);

  if (d.totalAttempts === 0) {
    return `# This student's history\n\nThis is their first marked attempt. You have no history to draw on — do not speculate about their habits, and do not claim anything is a repeated problem.`;
  }

  const lines: string[] = [
    `# This student's history`,
    ``,
    `${d.totalAttempts} previous attempt(s), ${d.marksAwarded}/${d.marksAvailable} marks overall.`,
  ];

  if (d.worstMarkType) {
    const total = Object.values(d.marksLostByType).reduce((s, n) => s + n, 0);
    const share = total ? Math.round((d.worstMarkType.marksLost / total) * 100) : 0;
    lines.push(
      ``,
      `Marks lost by type: ` +
        Object.entries(d.marksLostByType)
          .sort((a, b) => b[1] - a[1])
          .map(([type, lost]) => `${type} (${MARK_TYPE_NAMES[type] ?? type}) ${lost}`)
          .join(", ") +
        `.`,
      `Their largest single leak is ${d.worstMarkType.type} marks — ${share}% of everything they drop.`,
    );
  }

  if (d.recurring.length > 0) {
    lines.push(
      ``,
      `Misconceptions that have recurred (reuse these exact ids if you see the same error again):`,
      ...d.recurring
        .slice(0, 8)
        .map(
          (r) =>
            `- [${r.record.id}] ${r.record.statement} — seen ${r.count} times, last ${r.daysSinceLast} day(s) ago (${TOPIC_NAMES[r.record.topic]}).`,
        ),
    );
  }

  if (d.recurringFlags.length > 0) {
    lines.push(
      ``,
      `Recurring exam-technique problems: ` +
        d.recurringFlags
          .slice(0, 5)
          .map((f) => `${f.kind} (${f.count}×, ${f.marksCost} marks)`)
          .join(", ") +
        `.`,
    );
  }

  lines.push(
    ``,
    `How to use this:`,
    `- If an error in this attempt matches a recorded misconception, reuse its exact id and say plainly that it is a repeat and how many times it has now happened. Repetition is the most useful thing you can tell them.`,
    `- If they have avoided a habitual mistake this time, say so — that is real evidence of progress and is worth one sentence.`,
    `- Weigh "the one thing to fix" against this history, not just this attempt. A recurring leak usually matters more than a one-off slip, even a larger one.`,
    `- Do not invent history. Only refer to what is listed above.`,
  );

  return lines.join("\n");
}

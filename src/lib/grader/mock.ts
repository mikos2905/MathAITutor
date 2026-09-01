import type { Question, Attempt, Verdict } from "@/lib/ib/types";

/**
 * A deterministic fake grader.
 *
 * Exists so the entire app — upload, timer, breakdown UI, student model —
 * can be built and used without an API key or a cent of spend. It returns
 * a realistically-shaped verdict: some marks earned, some lost, a technique
 * flag and a misconception, so the UI is exercised properly.
 */
export async function gradeMock(question: Question, attempt: Attempt): Promise<Verdict> {
  await new Promise((r) => setTimeout(r, 900)); // fake latency so loading states are real

  const parts = question.parts.map((part, partIndex) => {
    const awards = part.rubric.map((mp, i) => {
      // Award everything in the first part, and drop the last mark elsewhere,
      // so the UI shows both a full-marks and a partial-marks case.
      const awarded = partIndex === 0 || i < part.rubric.length - 1;
      return {
        markPointId: mp.id,
        awarded,
        evidence: awarded
          ? `(mock) line ${i + 1} of your working`
          : "(mock) nothing in your working addresses this",
        reason: awarded
          ? `(mock) Awarded: ${mp.description}`
          : `(mock) Not awarded. The markscheme wants: ${mp.description}`,
      };
    });

    return {
      partLabel: part.label,
      awards,
      marksAwarded: awards.filter((a) => a.awarded).length,
      marksAvailable: part.marks,
    };
  });

  const totalAwarded = parts.reduce((s, p) => s + p.marksAwarded, 0);

  // Use the real timer value so the timing flag exercises the UI properly.
  const overtime = attempt.secondsTaken > question.suggestedMinutes * 60;
  const heavyHints = attempt.hintUsage.filter((u) => u.highestRung >= 4);

  return {
    transcription:
      "(mock grader — no API call was made)\nSet ANTHROPIC_API_KEY and GRADER=live to mark for real.",
    parts,
    totalAwarded,
    totalAvailable: question.totalMarks,
    techniqueFlags: [
      {
        kind: "missing-justification" as const,
        message:
          "(mock) You reached the right value but never stated why it is a maximum. The R mark needs a sentence.",
        marksCost: 1,
      },
      ...(heavyHints.length
        ? [
            {
              kind: "hint-reliance" as const,
              message: `(mock) You took a rung 4 or 5 hint on part${heavyHints.length > 1 ? "s" : ""} ${heavyHints.map((u) => `(${u.partLabel})`).join(", ")}. Those marks would not have come in an exam.`,
              marksCost: 0,
            },
          ]
        : []),
      ...(overtime
        ? [
            {
              kind: "timing" as const,
              message: `(mock) You took ${Math.round(attempt.secondsTaken / 60)} minutes on a ${question.totalMarks}-mark question. The exam allows about ${question.suggestedMinutes}.`,
              marksCost: 0,
            },
          ]
        : []),
    ],
    misconceptions: [
      {
        id: "mock-misconception",
        statement: "(mock) Treats a stationary point as automatically a maximum.",
        topic: question.topic,
        evidence: "(mock) evidence from your working",
      },
    ],
    oneThingToFix:
      "(mock) When a question says 'justify', write one sentence of reasoning — there is an explicit R mark for it.",
  };
}

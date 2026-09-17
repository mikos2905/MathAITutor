import type { MarkAward, PartVerdict, Question, Verdict } from "@/lib/ib/types";

/**
 * What reconciliation changed, so drift can be logged and, over time,
 * fed back into the prompt.
 */
export interface ReconcileReport {
  /** Awards naming a mark point that does not exist in the rubric. */
  droppedAwards: string[];
  /** Rubric points the grader never mentioned, now recorded as not awarded. */
  addedAwards: string[];
  /** Parts the grader never mentioned at all. */
  missingParts: string[];
  /** Whether any total the model reported disagreed with the rubric. */
  totalsCorrected: boolean;
}

/**
 * Rebuilds a verdict's bookkeeping from the rubric.
 *
 * The model is trusted for judgement — whether a mark was earned and why —
 * and for nothing else. Which mark points exist, what each is worth, and
 * therefore every subtotal and the total, come from the question data. A
 * hallucinated mark id or a miscounted total would otherwise flow straight
 * into the student model and quietly skew every diagnosis built on it.
 *
 * Parts and awards come back in rubric order regardless of the order the
 * model produced them, so the UI and the stored history are stable.
 */
export function reconcileVerdict(
  question: Question,
  raw: Verdict,
): { verdict: Verdict; report: ReconcileReport } {
  const report: ReconcileReport = {
    droppedAwards: [],
    addedAwards: [],
    missingParts: [],
    totalsCorrected: false,
  };

  const parts: PartVerdict[] = question.parts.map((part) => {
    const reported = raw.parts.find((p) => p.partLabel === part.label);
    if (!reported) report.missingParts.push(part.label);

    const validIds = new Set(part.rubric.map((mp) => mp.id));
    for (const award of reported?.awards ?? []) {
      if (!validIds.has(award.markPointId)) {
        report.droppedAwards.push(`(${part.label}) ${award.markPointId}`);
      }
    }

    const awards: MarkAward[] = part.rubric.map((mp) => {
      const found = reported?.awards.find((a) => a.markPointId === mp.id);
      if (found) return { ...found, markPointId: mp.id };
      report.addedAwards.push(`(${part.label}) ${mp.id}`);
      return {
        markPointId: mp.id,
        awarded: false,
        evidence: "",
        reason: reported
          ? "The grader did not report on this mark point, so it has not been awarded. If your working addresses it, re-submit."
          : "The grader did not report on this part at all. If your working covers it, check the photo includes it and re-submit.",
      };
    });

    const marksAwarded = part.rubric
      .filter((mp) => awards.find((a) => a.markPointId === mp.id)?.awarded)
      .reduce((s, mp) => s + mp.marks, 0);

    if (
      reported &&
      (reported.marksAwarded !== marksAwarded || reported.marksAvailable !== part.marks)
    ) {
      report.totalsCorrected = true;
    }

    return { partLabel: part.label, awards, marksAwarded, marksAvailable: part.marks };
  });

  // Parts the model invented (labels not in the question) are simply not
  // carried forward; there is nothing in the rubric to score them against.
  const totalAwarded = parts.reduce((s, p) => s + p.marksAwarded, 0);
  const totalAvailable = question.totalMarks;
  if (raw.totalAwarded !== totalAwarded || raw.totalAvailable !== totalAvailable) {
    report.totalsCorrected = true;
  }

  return {
    verdict: { ...raw, parts, totalAwarded, totalAvailable },
    report,
  };
}

/** True when reconciliation had to change anything at all. */
export function reconcileChangedSomething(report: ReconcileReport): boolean {
  return (
    report.droppedAwards.length > 0 ||
    report.addedAwards.length > 0 ||
    report.missingParts.length > 0 ||
    report.totalsCorrected
  );
}

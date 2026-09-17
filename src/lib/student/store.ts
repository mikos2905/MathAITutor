import fs from "node:fs/promises";
import path from "node:path";
import type { Verdict, Question, Attempt, RecallGrade, Topic } from "@/lib/ib/types";
import { EMPTY_MODEL, type AttemptRecord, type StudentModel } from "./types";

/**
 * Persistence for the student model.
 *
 * A JSON file rather than a database, deliberately. There is exactly one
 * student, writes happen once per graded attempt, and the whole history will
 * be a few hundred kilobytes after a year of daily practice. SQLite would add
 * a native dependency and a query layer to buy concurrency safety that a
 * single user on one machine does not need.
 *
 * Everything goes through this module, so swapping the backing store later is
 * a change to this file alone. When this becomes multi-user, that is the
 * moment to move — not before.
 */

const STORE_PATH = path.join(process.cwd(), "data", "student.json");

export async function loadModel(): Promise<StudentModel> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<StudentModel>;
    return {
      attempts: parsed.attempts ?? [],
      misconceptions: parsed.misconceptions ?? {},
      recallChecks: parsed.recallChecks ?? [],
      lessons: parsed.lessons ?? [],
    };
  } catch (error) {
    // A missing file is the normal first-run case, not an error.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return EMPTY_MODEL;
    // A corrupt file is worth surfacing rather than silently starting over —
    // losing a term's practice history to a stray character would be bad.
    throw new Error(
      `Could not read the student model at ${STORE_PATH}: ${(error as Error).message}`,
    );
  }
}

async function saveModel(model: StudentModel): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  // Write to a temp file and rename, so an interrupted write cannot leave a
  // half-written file behind.
  const tmp = `${STORE_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(model, null, 2), "utf8");
  await fs.rename(tmp, STORE_PATH);
}

/** Marks lost on this attempt, grouped by mark type (M / A / R / AG). */
function marksLostByType(question: Question, verdict: Verdict): Record<string, number> {
  const lost: Record<string, number> = {};

  for (const partVerdict of verdict.parts) {
    const part = question.parts.find((p) => p.label === partVerdict.partLabel);
    if (!part) continue;

    for (const award of partVerdict.awards) {
      if (award.awarded) continue;
      const markPoint = part.rubric.find((mp) => mp.id === award.markPointId);
      if (!markPoint) continue;
      lost[markPoint.type] = (lost[markPoint.type] ?? 0) + markPoint.marks;
    }
  }
  return lost;
}

/**
 * Folds a graded attempt into the model.
 *
 * Misconceptions are keyed by the grader's slug, so the same error recurring
 * on a different question three weeks later lands on the same record and
 * becomes visible as a pattern rather than a one-off.
 */
export async function recordAttempt(
  question: Question,
  attempt: Attempt,
  verdict: Verdict,
): Promise<void> {
  const model = await loadModel();
  const at = new Date().toISOString();

  const record: AttemptRecord = {
    id: `${question.id}-${Date.now()}`,
    at,
    questionId: question.id,
    marksAwarded: verdict.totalAwarded,
    marksAvailable: verdict.totalAvailable,
    secondsTaken: attempt.secondsTaken,
    suggestedMinutes: question.suggestedMinutes,
    topic: question.topic,
    hintUsage: attempt.hintUsage,
    techniqueFlags: verdict.techniqueFlags,
    misconceptionIds: verdict.misconceptions.map((m) => m.id),
    marksLostByType: marksLostByType(question, verdict),
    verdict,
  };

  model.attempts.push(record);

  for (const misconception of verdict.misconceptions) {
    const existing = model.misconceptions[misconception.id];
    if (existing) {
      existing.statement = misconception.statement; // keep the latest phrasing
      existing.occurrences.push({
        at,
        questionId: question.id,
        evidence: misconception.evidence,
      });
    } else {
      model.misconceptions[misconception.id] = {
        id: misconception.id,
        statement: misconception.statement,
        topic: misconception.topic,
        occurrences: [{ at, questionId: question.id, evidence: misconception.evidence }],
      };
    }
  }

  await saveModel(model);
}

/** Records the outcome of an explain-it-back check. */
export async function recordRecall(questionId: string, grade: RecallGrade): Promise<void> {
  const model = await loadModel();
  model.recallChecks.push({ at: new Date().toISOString(), questionId, grade });
  await saveModel(model);
}

/** Records that a concept was explained, so unpractised reading can be noticed. */
export async function recordLesson(concept: string, topic: Topic): Promise<void> {
  const model = await loadModel();
  model.lessons.push({ at: new Date().toISOString(), concept, topic });
  await saveModel(model);
}

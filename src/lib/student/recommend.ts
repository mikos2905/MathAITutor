import type { Question, Topic } from "@/lib/ib/types";
import { TOPIC_NAMES } from "@/lib/ib/syllabus";
import { analyse } from "./analyse";
import type { StudentModel } from "./types";

/**
 * Turns the diagnosis into a next action.
 *
 * "You are weak at reasoning marks" is information. "Do this question next,
 * because you have made this exact mistake three times and never gone back to
 * it" is advice. Revision by picking random questions is how most students
 * spend their time and it is close to the least efficient thing available.
 */

export type RecommendationKind =
  | "retry" // scored badly and never went back
  | "misconception" // a specific error that keeps recurring
  | "stale" // a topic going cold
  | "unseen" // never attempted at all
  | "hint-reliant" // "passed" only because it was handed over
  | "unpractised"; // had it explained, never did a question on it

export interface Recommendation {
  question: Question;
  kind: RecommendationKind;
  reason: string;
}

const DAY_MS = 1000 * 60 * 60 * 24;
const RETRY_AFTER_DAYS = 3;
const POOR_SCORE = 0.6;

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
}

export function recommend(
  model: StudentModel,
  questions: Question[],
  limit = 3,
): Recommendation[] {
  const d = analyse(model);
  const out: Recommendation[] = [];
  const used = new Set<string>();

  const push = (question: Question | undefined, kind: RecommendationKind, reason: string) => {
    if (!question || used.has(question.id) || out.length >= limit) return;
    used.add(question.id);
    out.push({ question, kind, reason });
  };

  const attemptsFor = (id: string) => model.attempts.filter((a) => a.questionId === id);
  const lastAttempt = (id: string) => attemptsFor(id).at(-1);

  // 1. Questions "passed" only because a rung 4 or 5 hint handed over the
  //    method. These are the marks a student is most likely to think they
  //    have and most likely not to have.
  for (const attempt of [...model.attempts].reverse()) {
    if (out.length >= limit) break;
    const heavy = attempt.hintUsage.some((u) => u.highestRung >= 4);
    if (!heavy || daysSince(attempt.at) < RETRY_AFTER_DAYS) continue;
    push(
      questions.find((q) => q.id === attempt.questionId),
      "hint-reliant",
      `You got through this with a full hint ${daysSince(attempt.at)} days ago. Those marks are not yours yet — do it unaided.`,
    );
  }

  // 2. Concepts explained but never practised. Reading is not learning, and
  //    the gap between them is the one this app exists to close.
  for (const lesson of [...(model.lessons ?? [])].reverse()) {
    if (out.length >= limit) break;
    const concept = lesson.concept.toLowerCase();
    const onConcept = questions.filter((q) =>
      q.concepts.some((c) => c.toLowerCase() === concept),
    );
    if (onConcept.length === 0) continue;
    const practisedSince = model.attempts.some(
      (a) => a.at > lesson.at && onConcept.some((q) => q.id === a.questionId),
    );
    if (practisedSince) continue;
    push(
      onConcept.find((q) => attemptsFor(q.id).length === 0) ?? onConcept[0],
      "unpractised",
      `You had ${lesson.concept} explained ${daysSince(lesson.at) === 0 ? "today" : `${daysSince(lesson.at)} day(s) ago`} and have not done a question on it since.`,
    );
  }

  // 3. Topics carrying a misconception that keeps coming back.
  for (const recurring of d.recurring) {
    if (out.length >= limit) break;
    const topic = recurring.record.topic;
    const candidate =
      questions.find((q) => q.topic === topic && attemptsFor(q.id).length === 0) ??
      questions.find((q) => q.topic === topic && !used.has(q.id));
    push(
      candidate,
      "misconception",
      `You have made the same mistake ${recurring.count} times in ${TOPIC_NAMES[topic]}: ${recurring.record.statement}`,
    );
  }

  // 3. Questions scored poorly and not revisited. Spaced repetition, roughly.
  const poor = model.attempts
    .filter((a) => a.marksAvailable > 0 && a.marksAwarded / a.marksAvailable < POOR_SCORE)
    .filter((a) => {
      const last = lastAttempt(a.questionId);
      return last ? daysSince(last.at) >= RETRY_AFTER_DAYS : false;
    })
    .sort((a, b) => a.marksAwarded / a.marksAvailable - b.marksAwarded / b.marksAvailable);

  for (const attempt of poor) {
    if (out.length >= limit) break;
    push(
      questions.find((q) => q.id === attempt.questionId),
      "retry",
      `You scored ${attempt.marksAwarded}/${attempt.marksAvailable} on this and have not been back since.`,
    );
  }

  // 4. Topics never touched.
  const neverTouched = d.topics.filter((t) => t.attempts === 0);
  for (const topic of neverTouched) {
    if (out.length >= limit) break;
    push(
      questions.find((q) => q.topic === topic.topic && !used.has(q.id)),
      "unseen",
      `You have never attempted a ${TOPIC_NAMES[topic.topic]} question here.`,
    );
  }

  // 5. Topics going cold.
  const stale = d.stale.filter((t) => t.attempts > 0);
  for (const topic of stale) {
    if (out.length >= limit) break;
    push(
      questions.find((q) => q.topic === topic.topic && !used.has(q.id)),
      "stale",
      `You have not touched ${TOPIC_NAMES[topic.topic]} for ${topic.daysSinceLast} days.`,
    );
  }

  // 6. Fall back to anything unattempted, so the list is never empty.
  for (const question of questions) {
    if (out.length >= limit) break;
    if (attemptsFor(question.id).length > 0) continue;
    push(question, "unseen", `You have not tried this one yet.`);
  }

  return out;
}

/** Topics with no question in the bank — useful when adding content. */
export function uncoveredTopics(questions: Question[]): Topic[] {
  const covered = new Set(questions.map((q) => q.topic));
  return (Object.keys(TOPIC_NAMES) as Topic[]).filter((t) => !covered.has(t));
}

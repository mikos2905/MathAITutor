import type { Lesson, Question } from "@/lib/ib/types";
import type { StudentModel } from "@/lib/student/types";
import { explainMock } from "./mock";

export async function explain(request: string, model: StudentModel): Promise<Lesson> {
  if (process.env.GRADER === "live") {
    const { explainLive } = await import("./live");
    return explainLive(request, model);
  }
  return explainMock(request);
}

/**
 * Questions to practise after a lesson: exact concept matches first, then
 * anything in the topic. Unattempted before attempted, so the student is
 * handed something new rather than something they have already scored on.
 */
export function questionsForLesson(
  lesson: Lesson,
  questions: Question[],
  model: StudentModel,
  limit = 3,
): Question[] {
  const concept = lesson.concept.toLowerCase();
  const attempted = new Set(model.attempts.map((a) => a.questionId));
  const byConcept = questions.filter((q) =>
    q.concepts.some((c) => c.toLowerCase() === concept),
  );
  const byTopic = questions.filter((q) => q.topic === lesson.topic && !byConcept.includes(q));
  const order = (list: Question[]) => [
    ...list.filter((q) => !attempted.has(q.id)),
    ...list.filter((q) => attempted.has(q.id)),
  ];
  return [...order(byConcept), ...order(byTopic)].slice(0, limit);
}

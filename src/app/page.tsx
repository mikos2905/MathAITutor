import Link from "next/link";
import { QUESTIONS } from "@/data/questions";
import { PAPER_RULES, TOPIC_NAMES } from "@/lib/ib/syllabus";
import { graderMode } from "@/lib/grader";
import { loadModel } from "@/lib/student/store";
import { recommend, type RecommendationKind } from "@/lib/student/recommend";

// Recommendations depend on stored history, so this cannot be prerendered.
export const dynamic = "force-dynamic";

const KIND_LABELS: Record<RecommendationKind, string> = {
  retry: "Retry",
  misconception: "Recurring mistake",
  stale: "Going cold",
  unseen: "Not tried",
  "hint-reliant": "Not earned yet",
  unpractised: "Read, not practised",
};

export default async function Home() {
  const mode = graderMode();
  const model = await loadModel();
  const recommendations = recommend(model, QUESTIONS, 3);
  const attempted = new Set(model.attempts.map((a) => a.questionId));

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">IB Maths AA HL</h1>
        <nav className="flex gap-4 text-sm text-neutral-500">
          <Link href="/learn" className="hover:underline">
            Learn
          </Link>
          <Link href="/history" className="hover:underline">
            History
          </Link>
          <Link href="/profile" className="hover:underline">
            Profile →
          </Link>
        </nav>
      </div>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Work a question on paper, photograph it, and get marked the way an examiner would — mark
        by mark, with the method and reasoning marks separated out.
      </p>

      {mode === "mock" && (
        <p className="mt-5 rounded border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <strong>Mock grader.</strong> Feedback is fake and no API call is made. Set{" "}
          <code className="font-mono text-xs">GRADER=live</code> and{" "}
          <code className="font-mono text-xs">ANTHROPIC_API_KEY</code> in{" "}
          <code className="font-mono text-xs">.env.local</code> to mark for real.
        </p>
      )}

      {/* Revision by picking questions at random is close to the least
          efficient thing available. This is the alternative. */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Start here
        </h2>
        <ul className="mt-3 space-y-2">
          {recommendations.map((rec) => (
            <li key={rec.question.id}>
              <Link
                href={`/practice/${rec.question.id}`}
                className="block rounded border border-neutral-300 p-4 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{rec.question.title}</span>
                  <span className="shrink-0 rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium dark:bg-neutral-800">
                    {KIND_LABELS[rec.kind]}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {rec.reason}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          All questions
        </h2>
        <ul className="mt-1 divide-y divide-neutral-200 dark:divide-neutral-800">
          {QUESTIONS.map((q) => (
            <li key={q.id}>
              <Link href={`/practice/${q.id}`} className="block py-4 hover:opacity-70">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{q.title}</span>
                  {attempted.has(q.id) && (
                    <span className="shrink-0 text-xs text-neutral-500">attempted</span>
                  )}
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  {PAPER_RULES[q.paper].name} · {TOPIC_NAMES[q.topic]} · {q.totalMarks} marks · ~
                  {q.suggestedMinutes} min
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

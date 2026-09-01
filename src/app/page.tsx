import Link from "next/link";
import { QUESTIONS } from "@/data/questions";
import { PAPER_RULES, TOPIC_NAMES } from "@/lib/ib/syllabus";
import { graderMode } from "@/lib/grader";

export default function Home() {
  const mode = graderMode();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">IB Maths AA HL</h1>
        <Link href="/profile" className="text-sm text-neutral-500 hover:underline">
          Your profile →
        </Link>
      </div>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Work a question on paper, photograph it, and get marked the way an examiner would —
        mark by mark, with the method and reasoning marks separated out.
      </p>

      {mode === "mock" && (
        <p className="mt-5 rounded border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <strong>Mock grader.</strong> Feedback is fake and no API call is made. Set{" "}
          <code className="font-mono text-xs">GRADER=live</code> and{" "}
          <code className="font-mono text-xs">ANTHROPIC_API_KEY</code> in{" "}
          <code className="font-mono text-xs">.env.local</code> to mark for real.
        </p>
      )}

      <ul className="mt-8 divide-y divide-neutral-200 dark:divide-neutral-800">
        {QUESTIONS.map((q) => (
          <li key={q.id}>
            <Link href={`/practice/${q.id}`} className="block py-4 hover:opacity-70">
              <div className="font-medium">{q.title}</div>
              <div className="mt-1 text-sm text-neutral-500">
                {PAPER_RULES[q.paper].name} · {TOPIC_NAMES[q.topic]} · {q.totalMarks} marks · ~
                {q.suggestedMinutes} min
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

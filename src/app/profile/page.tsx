import Link from "next/link";
import { loadModel } from "@/lib/student/store";
import { analyse, MARK_TYPE_NAMES } from "@/lib/student/analyse";
import { TOPIC_NAMES } from "@/lib/ib/syllabus";

// Reads the store on every request, so it always reflects the latest attempt.
export const dynamic = "force-dynamic";

const FLAG_LABELS: Record<string, string> = {
  rounding: "Rounding / accuracy",
  "command-term": "Command term misread",
  "calculator-misuse": "Calculator use",
  "missing-justification": "Missing justification",
  "unshown-working": "Working not shown",
  notation: "Notation",
  timing: "Timing",
  "hint-reliance": "Hint reliance",
};

export default async function ProfilePage() {
  const model = await loadModel();
  const d = analyse(model);

  if (d.totalAttempts === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/" className="text-sm text-neutral-500 hover:underline">
          ← All questions
        </Link>
        <h1 className="mt-6 text-2xl font-semibold">Your profile</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Nothing here yet. Mark a few attempts and this page will start telling you where your
          marks are actually going — which is usually not where you think.
        </p>
      </main>
    );
  }

  const totalLost = Object.values(d.marksLostByType).reduce((s, n) => s + n, 0);

  return (
    <main className="mx-auto max-w-2xl space-y-10 px-6 py-12">
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <Link href="/" className="text-sm text-neutral-500 hover:underline">
            ← All questions
          </Link>
          <Link href="/history" className="text-sm text-neutral-500 hover:underline">
            History →
          </Link>
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Your profile</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {d.totalAttempts} attempt{d.totalAttempts === 1 ? "" : "s"} · {d.marksAwarded}/
          {d.marksAvailable} marks
        </p>
      </div>

      {/* The headline diagnosis. */}
      {d.worstMarkType && totalLost > 0 && (
        <section className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-950/30">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Where your marks actually go
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed">
            <strong>{Math.round((d.worstMarkType.marksLost / totalLost) * 100)}%</strong> of the
            marks you drop are{" "}
            <strong>
              {d.worstMarkType.type} marks ({MARK_TYPE_NAMES[d.worstMarkType.type]})
            </strong>
            {d.worstMarkType.type === "R" &&
              " — you are doing the maths and not writing the justification."}
            {d.worstMarkType.type === "A" &&
              " — you are finding the method and then being careless with the value."}
            {d.worstMarkType.type === "M" &&
              " — the gap is in finding an approach, not in executing it."}
          </p>
        </section>
      )}

      {/* Mark-type breakdown. */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Marks lost by type
        </h2>
        <ul className="space-y-2">
          {Object.entries(d.marksLostByType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, lost]) => (
              <li key={type} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0">
                  <span className="font-mono">{type}</span>{" "}
                  <span className="text-neutral-500">{MARK_TYPE_NAMES[type]}</span>
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded bg-neutral-200 dark:bg-neutral-800">
                  <span
                    className="block h-full bg-neutral-800 dark:bg-neutral-300"
                    style={{ width: `${totalLost ? (lost / totalLost) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right tabular-nums text-neutral-500">
                  {lost}
                </span>
              </li>
            ))}
        </ul>
      </section>

      {/* Habits, not slips. */}
      {d.recurring.length > 0 && (
        <section>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Recurring misconceptions
          </h2>
          <p className="mb-3 text-sm text-neutral-500">
            Seen more than once. A mistake made twice is a habit, not a slip.
          </p>
          <ul className="space-y-2">
            {d.recurring.map((r) => (
              <li
                key={r.record.id}
                className="rounded border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="leading-relaxed">{r.record.statement}</span>
                  <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                    {r.count}×
                  </span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {TOPIC_NAMES[r.record.topic]} · last seen{" "}
                  {r.daysSinceLast === 0 ? "today" : `${r.daysSinceLast} day(s) ago`}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Exam technique across every attempt. */}
      {d.recurringFlags.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Exam technique
          </h2>
          <ul className="space-y-2">
            {d.recurringFlags.map((f) => (
              <li key={f.kind} className="flex items-baseline justify-between gap-3 text-sm">
                <span>{FLAG_LABELS[f.kind] ?? f.kind}</span>
                <span className="text-neutral-500">
                  {f.count}× · {f.marksCost} mark{f.marksCost === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Retention: could you actually restate the method afterwards? */}
      {d.recall.total > 0 && (
        <section>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Recall
          </h2>
          <p className="mb-3 text-sm text-neutral-500">
            How often you could restate the method in your own words afterwards.
          </p>
          <ul className="space-y-1 text-sm">
            <li className="flex items-baseline justify-between">
              <span>Could redo it unaided</span>
              <span className="text-neutral-500">{d.recall.byGrade.solid}</span>
            </li>
            <li className="flex items-baseline justify-between">
              <span>Would have got stuck</span>
              <span className="text-neutral-500">{d.recall.byGrade.partial}</span>
            </li>
            <li className="flex items-baseline justify-between">
              <span>Had not landed</span>
              <span className="text-neutral-500">{d.recall.byGrade.absent}</span>
            </li>
          </ul>
        </section>
      )}

      {/* Coverage and staleness. */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Topics
        </h2>
        <ul className="space-y-2">
          {d.topics.map((t) => (
            <li key={t.topic} className="flex items-baseline justify-between gap-3 text-sm">
              <span className={t.attempts === 0 ? "text-neutral-400" : ""}>
                {TOPIC_NAMES[t.topic]}
              </span>
              <span className="shrink-0 text-neutral-500">
                {t.attempts === 0 ? (
                  "never attempted"
                ) : (
                  <>
                    {t.marksAwarded}/{t.marksAvailable} ·{" "}
                    {t.daysSinceLast === 0 ? "today" : `${t.daysSinceLast}d ago`}
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
        {d.stale.length > 0 && (
          <p className="mt-3 text-sm text-neutral-500">
            Not touched in a fortnight or more:{" "}
            {d.stale.map((t) => TOPIC_NAMES[t.topic]).join(", ")}.
          </p>
        )}
      </section>
    </main>
  );
}

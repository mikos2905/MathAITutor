import Link from "next/link";
import { loadModel } from "@/lib/student/store";
import { getQuestion } from "@/data/questions";
import { HistoryEntry } from "@/components/HistoryEntry";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const model = await loadModel();
  // Newest first: the thing you just did is the thing you want to look at.
  const attempts = [...model.attempts].reverse();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← All questions
      </Link>
      <h1 className="mt-6 text-2xl font-semibold">History</h1>

      {attempts.length === 0 ? (
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          No attempts yet. Once you have marked a few, this is where you come back to re-read the
          feedback on the ones you got wrong.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-neutral-500">
            {attempts.length} attempt{attempts.length === 1 ? "" : "s"}, newest first.
          </p>
          <ul className="mt-6 divide-y divide-neutral-200 dark:divide-neutral-800">
            {attempts.map((record) => (
              <HistoryEntry
                key={record.id}
                record={record}
                title={getQuestion(record.questionId)?.title ?? record.questionId}
              />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

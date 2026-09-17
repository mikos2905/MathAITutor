import Link from "next/link";
import { LearnPanel } from "@/components/LearnPanel";

export default function LearnPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← All questions
      </Link>
      <h1 className="mt-6 text-2xl font-semibold">Learn</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Pick a concept or ask in your own words. The explanation is written for you — it knows
        which mistakes you keep making — and ends by handing you a question to do.
      </p>
      <div className="mt-8">
        <LearnPanel />
      </div>
    </main>
  );
}

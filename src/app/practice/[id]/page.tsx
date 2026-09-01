import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestion, QUESTIONS } from "@/data/questions";
import { AttemptFlow } from "@/components/AttemptFlow";

export function generateStaticParams() {
  return QUESTIONS.map((q) => ({ id: q.id }));
}

export default async function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = getQuestion(id);
  if (!question) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← All questions
      </Link>
      <div className="mt-6">
        <AttemptFlow question={question} />
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lesson, Paper, Topic } from "@/lib/ib/types";
import { CONCEPTS, PAPER_RULES, TOPIC_NAMES } from "@/lib/ib/syllabus";
import { MathText } from "./MathText";

interface Practise {
  id: string;
  title: string;
  paper: Paper;
  totalMarks: number;
  exactMatch: boolean;
}

/**
 * Learn mode: ask for a concept, get an explanation written for you, then get
 * handed a question on it.
 *
 * The hand-off is the point. An explanation you only read is the "I understood
 * it when I watched" trap in a different costume, so the page ends with a
 * question rather than a summary.
 */
export function LearnPanel() {
  const [request, setRequest] = useState("");
  const [stage, setStage] = useState<"idle" | "loading" | "done">("idle");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [practise, setPractise] = useState<Practise[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setRequest(trimmed);
    setStage("loading");
    setError(null);
    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Explanation failed.");
      setLesson(data.lesson);
      setPractise(data.practise);
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Explanation failed.");
      setStage("idle");
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(request);
        }}
        className="space-y-3"
      >
        <label htmlFor="learn-request" className="block text-sm font-medium">
          What do you want explained?
        </label>
        <div className="flex gap-2">
          <input
            id="learn-request"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            disabled={stage === "loading"}
            placeholder="e.g. why does 'hence' matter, or: the chain rule"
            className="min-w-0 flex-1 rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm disabled:opacity-50 dark:border-neutral-700"
          />
          <button
            type="submit"
            disabled={stage === "loading" || request.trim().length === 0}
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          >
            {stage === "loading" ? "Thinking…" : "Explain"}
          </button>
        </div>
      </form>

      {/* Concept chips, grouped by topic, so the student does not have to
          know what the concept is called to ask for it. */}
      {stage !== "done" && (
        <div className="space-y-4">
          {(Object.entries(CONCEPTS) as [Topic, string[]][]).map(([topic, list]) => (
            <div key={topic}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {TOPIC_NAMES[topic]}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {list.map((concept) => (
                  <li key={concept}>
                    <button
                      type="button"
                      onClick={() => ask(concept)}
                      disabled={stage === "loading"}
                      className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      {concept}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {stage === "done" && lesson && (
        <article className="space-y-6">
          <header>
            <div className="text-xs uppercase tracking-wide text-neutral-500">
              {TOPIC_NAMES[lesson.topic]} · {lesson.concept}
            </div>
            <h1 className="mt-1 text-xl font-semibold">{lesson.title}</h1>
          </header>

          <div className="space-y-4 leading-relaxed">
            {lesson.paragraphs.map((p, i) => (
              <p key={i}>
                <MathText text={p} />
              </p>
            ))}
          </div>

          <section className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 dark:bg-amber-950/30">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              The trap
            </h3>
            <p className="mt-1 text-[15px] leading-relaxed">
              <MathText text={lesson.trap} />
            </p>
          </section>

          <section className="rounded border border-neutral-200 p-4 text-sm dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Formula booklet
            </h3>
            <p className="mt-1 leading-relaxed">
              <MathText text={lesson.booklet} />
            </p>
          </section>

          <section className="rounded border border-neutral-200 p-4 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Check yourself before you practise
            </h3>
            <p className="mt-1 leading-relaxed">
              <MathText text={lesson.checkYourself} />
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              Answer it in your head. There is no answer button on purpose.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Now practise it
            </h3>
            {practise.length === 0 ? (
              <p className="mt-2 text-sm text-neutral-500">
                The bank has no question on this yet. That is a gap in the content, not in you.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {practise.map((q) => (
                  <li key={q.id}>
                    <Link
                      href={`/practice/${q.id}`}
                      className="block rounded border border-neutral-300 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium">{q.title}</span>
                        <span className="shrink-0 text-xs text-neutral-500">
                          {PAPER_RULES[q.paper].name} · {q.totalMarks} marks
                        </span>
                      </div>
                      {!q.exactMatch && (
                        <div className="mt-1 text-xs text-neutral-500">
                          Same topic, related concept.
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <button
            onClick={() => {
              setStage("idle");
              setLesson(null);
              setRequest("");
            }}
            className="text-sm text-neutral-500 hover:underline"
          >
            Explain something else
          </button>
        </article>
      )}
    </div>
  );
}

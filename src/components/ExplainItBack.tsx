"use client";

import { useState } from "react";
import type { Question, RecallGrade, RecallVerdict } from "@/lib/ib/types";

const GRADE_COPY: Record<RecallGrade, { label: string; blurb: string; className: string }> = {
  solid: {
    label: "You could redo this unaided",
    blurb: "Every essential step is there. This one has actually landed.",
    className: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  },
  partial: {
    label: "You would get stuck",
    blurb: "You have the shape of it, but there is a step you could not currently reproduce.",
    className: "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
  },
  absent: {
    label: "This has not landed yet",
    blurb:
      "What you wrote does not identify a method. That is worth knowing now rather than in an exam.",
    className: "border-red-500 bg-red-50 dark:bg-red-950/30",
  },
};

/**
 * The recall check.
 *
 * Reading feedback and feeling like you understood it is not the same as being
 * able to reproduce the method, and the gap between the two is exactly where
 * students lose marks they thought they had. Writing the method out from
 * memory is the cheapest available test of which side of that gap you are on.
 *
 * `onWritingChange` lets the parent hide the marking while the box is open —
 * an explanation copied off the screen above measures nothing.
 */
export function ExplainItBack({
  question,
  onWritingChange,
}: {
  question: Question;
  onWritingChange: (writing: boolean) => void;
}) {
  const [stage, setStage] = useState<"idle" | "writing" | "checking" | "done">("idle");
  const [text, setText] = useState("");
  const [verdict, setVerdict] = useState<RecallVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);

  function start() {
    setStage("writing");
    onWritingChange(true);
  }

  async function submit() {
    setStage("checking");
    setError(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, explanation: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Recall check failed.");
      setVerdict(data.verdict);
      setStage("done");
      onWritingChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recall check failed.");
      setStage("writing");
    }
  }

  if (stage === "idle") {
    return (
      <section className="rounded-lg border border-neutral-300 p-5 dark:border-neutral-700">
        <h3 className="font-medium">Explain it back</h3>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Reading feedback and understanding it are not the same thing. State the method in your
          own words and find out which one just happened.
        </p>
        <button
          onClick={start}
          className="mt-4 rounded border border-neutral-400 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
        >
          Start recall check
        </button>
      </section>
    );
  }

  if (stage === "writing" || stage === "checking") {
    return (
      <section className="rounded-lg border border-neutral-300 p-5 dark:border-neutral-700">
        <h3 className="font-medium">Explain it back</h3>
        <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          How would you solve this? Describe the <strong>method</strong>, not the answer. Rough
          wording is fine — nobody is marking your prose.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          The marking above is hidden on purpose. Copying it back measures nothing.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={stage === "checking"}
          rows={7}
          autoFocus
          placeholder="First I would…"
          className="mt-3 w-full rounded border border-neutral-300 bg-transparent p-3 text-sm leading-relaxed disabled:opacity-50 dark:border-neutral-700"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={submit}
            disabled={stage === "checking" || text.trim().length === 0}
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
          >
            {stage === "checking" ? "Checking…" : "Check my explanation"}
          </button>
          <span className="text-xs text-neutral-500">
            {text.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        {error && (
          <p className="mt-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}
      </section>
    );
  }

  if (!verdict) return null;
  const copy = GRADE_COPY[verdict.grade];

  return (
    <section className="space-y-4">
      <div className={`rounded-lg border-l-4 p-5 ${copy.className}`}>
        <h3 className="font-medium">{copy.label}</h3>
        <p className="mt-1 text-sm leading-relaxed">{copy.blurb}</p>
        <p className="mt-3 text-[15px] leading-relaxed">{verdict.comment}</p>
      </div>

      {verdict.captured.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            You got
          </h4>
          <ul className="space-y-1 text-sm">
            {verdict.captured.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {verdict.missing.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            You missed, in order
          </h4>
          <ol className="space-y-1 text-sm">
            {verdict.missing.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-neutral-400">{i + 1}.</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer text-neutral-500">What you wrote</summary>
        <p className="mt-2 whitespace-pre-wrap rounded bg-neutral-100 p-3 leading-relaxed dark:bg-neutral-900">
          {text}
        </p>
      </details>
    </section>
  );
}

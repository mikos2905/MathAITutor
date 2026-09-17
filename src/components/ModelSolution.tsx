"use client";

import type { Question } from "@/lib/ib/types";
import { MathText } from "./MathText";

/**
 * The official answer and worked solution for each part, after marking.
 *
 * Without this, a student who scores 2/8 has no way to see what right looks
 * like short of re-attempting and climbing five hint rungs. The worked
 * solution is the ladder's final rung — it is already written as a complete
 * answer, so it is reused rather than duplicated in the data.
 *
 * Collapsed by default and placed below the recall check on purpose: reading
 * the full solution and then "recalling" it measures nothing.
 */
export function ModelSolution({ question }: { question: Question }) {
  return (
    <section className="rounded-lg border border-neutral-300 p-5 dark:border-neutral-700">
      <h3 className="font-medium">Model solution</h3>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Compare it against your working line by line. The point is to find where yours diverged,
        not to read a correct answer and feel reassured.
      </p>
      <div className="mt-4 space-y-3">
        {question.parts.map((part) => {
          const worked = part.hints.at(-1);
          return (
            <details
              key={part.label}
              className="rounded border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <summary className="cursor-pointer">
                <span className="font-medium">Part ({part.label})</span>
                <span className="ml-2 text-neutral-500">
                  answer: <MathText text={part.answer} />
                </span>
              </summary>
              {worked && (
                <div className="mt-3 border-t border-neutral-200 pt-3 leading-relaxed dark:border-neutral-800">
                  <MathText text={worked.text} />
                </div>
              )}
            </details>
          );
        })}
      </div>
    </section>
  );
}

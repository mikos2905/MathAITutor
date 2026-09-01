"use client";

import type { Verdict, TechniqueFlagKind } from "@/lib/ib/types";
import { MathText } from "./MathText";

const FLAG_LABELS: Record<TechniqueFlagKind, string> = {
  rounding: "Rounding / accuracy",
  "command-term": "Command term",
  "calculator-misuse": "Calculator use",
  "missing-justification": "Missing justification",
  "unshown-working": "Working not shown",
  notation: "Notation",
  timing: "Timing",
  "hint-reliance": "Hint reliance",
};

const MARK_TYPE_HELP: Record<string, string> = {
  M: "Method mark — awarded for a correct approach even if the arithmetic goes wrong",
  A: "Accuracy mark — awarded for a correct value or expression",
  R: "Reasoning mark — awarded for a justification stated in words",
  AG: "Answer given — the result is printed, so all the credit is in the derivation",
};

export function MarkBreakdown({ verdict }: { verdict: Verdict }) {
  const pct = verdict.totalAvailable
    ? Math.round((verdict.totalAwarded / verdict.totalAvailable) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Score */}
      <div className="rounded-lg border border-neutral-300 p-5 dark:border-neutral-700">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-semibold tabular-nums">
            {verdict.totalAwarded}/{verdict.totalAvailable}
          </span>
          <span className="text-neutral-500">{pct}%</span>
        </div>
      </div>

      {/* The single most important element on the page */}
      <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-950/30">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
          Fix this next
        </h3>
        <p className="text-[15px] leading-relaxed">
          <MathText text={verdict.oneThingToFix} />
        </p>
      </div>

      {/* Mark-by-mark */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Mark by mark
        </h3>
        <div className="space-y-5">
          {verdict.parts.map((part) => (
            <div key={part.partLabel}>
              <div className="mb-2 flex items-baseline justify-between">
                <h4 className="font-medium">Part ({part.partLabel})</h4>
                <span className="text-sm tabular-nums text-neutral-500">
                  {part.marksAwarded}/{part.marksAvailable}
                </span>
              </div>
              <ul className="space-y-2">
                {part.awards.map((award) => {
                  const type = award.markPointId.replace(/\d+$/, "");
                  return (
                    <li
                      key={award.markPointId}
                      className="flex gap-3 rounded border border-neutral-200 p-3 text-sm dark:border-neutral-800"
                    >
                      <span
                        className={
                          "mt-0.5 shrink-0 font-mono text-xs " +
                          (award.awarded
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400")
                        }
                        title={MARK_TYPE_HELP[type] ?? ""}
                      >
                        {award.awarded ? "✓" : "✗"} {award.markPointId}
                      </span>
                      <span className="space-y-1">
                        <span className="block leading-relaxed">
                          <MathText text={award.reason} />
                        </span>
                        {award.evidence && (
                          <span className="block text-xs italic text-neutral-500">
                            Your working: {award.evidence}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Marks lost to technique rather than maths */}
      {verdict.techniqueFlags.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Exam technique
          </h3>
          <ul className="space-y-2">
            {verdict.techniqueFlags.map((flag, i) => (
              <li
                key={i}
                className="rounded border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs font-medium dark:bg-neutral-800">
                    {FLAG_LABELS[flag.kind]}
                  </span>
                  {flag.marksCost > 0 && (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      −{flag.marksCost} mark{flag.marksCost === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <MathText text={flag.message} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Feeds the student model in a later stage */}
      {verdict.misconceptions.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Misconceptions identified
          </h3>
          <ul className="space-y-2">
            {verdict.misconceptions.map((m) => (
              <li
                key={m.id}
                className="rounded border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <MathText text={m.statement} />
                <div className="mt-1 font-mono text-xs text-neutral-500">{m.id}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* So you can catch the grader misreading your handwriting */}
      <details className="rounded border border-neutral-200 p-3 text-sm dark:border-neutral-800">
        <summary className="cursor-pointer text-neutral-500">
          What the grader read from your photo
        </summary>
        <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed">
          {verdict.transcription}
        </pre>
      </details>
    </div>
  );
}

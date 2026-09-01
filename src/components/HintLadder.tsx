"use client";

import { useState } from "react";
import type { HintRung, QuestionPart } from "@/lib/ib/types";
import { RUNGS, rungMeta } from "@/lib/ib/hints";
import { MathText } from "./MathText";

/**
 * The gated hint ladder for a single part.
 *
 * The gating is the feature. A model asked politely not to give the answer
 * will give the answer the moment you push back; a state machine that will
 * not render rung 4 until rung 3 has been read cannot be talked around. The
 * confirmation on the final rung is deliberate friction — the click that
 * hands over the solution should not be reflexive.
 */
export function HintLadder({
  part,
  onRungRevealed,
}: {
  part: QuestionPart;
  onRungRevealed: (partLabel: string, rung: HintRung) => void;
}) {
  const [revealed, setRevealed] = useState(0);
  const [confirmingFinal, setConfirmingFinal] = useState(false);

  if (part.hints.length === 0) return null;

  const nextRung = (revealed + 1) as HintRung;
  const hasNext = nextRung <= part.hints.length;
  const next = hasNext ? rungMeta(nextRung) : null;

  function reveal(rung: HintRung) {
    setRevealed(rung);
    setConfirmingFinal(false);
    onRungRevealed(part.label, rung);
  }

  return (
    <div className="mt-3 rounded border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          Stuck on ({part.label})?
        </span>
        <span className="text-xs text-neutral-500">
          {revealed} of {part.hints.length} hints used
        </span>
      </div>

      {/* Revealed rungs stay visible so you can re-read the gentler ones. */}
      {revealed > 0 && (
        <ol className="mt-3 space-y-3">
          {part.hints.slice(0, revealed).map((hint) => {
            const meta = rungMeta(hint.rung);
            return (
              <li
                key={hint.rung}
                className={
                  "rounded p-3 text-sm leading-relaxed " +
                  (meta.costsUnderstanding
                    ? "bg-amber-50 dark:bg-amber-950/30"
                    : "bg-neutral-100 dark:bg-neutral-900")
                }
              >
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {hint.rung}. {meta.label}
                </div>
                <MathText text={hint.text} />
              </li>
            );
          })}
        </ol>
      )}

      {/* The next rung, with its cost stated before you commit to it. */}
      {hasNext && next && !confirmingFinal && (
        <button
          onClick={() => (next.costsUnderstanding ? setConfirmingFinal(true) : reveal(nextRung))}
          className="mt-3 w-full rounded border border-neutral-300 p-3 text-left text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          <span className="font-medium">
            {revealed === 0 ? "Get a hint" : "Next hint"} — {next.label}
          </span>
          <span className="mt-0.5 block text-xs text-neutral-500">{next.promise}</span>
        </button>
      )}

      {/* Deliberate friction before anything that does the maths for you. */}
      {confirmingFinal && next && (
        <div className="mt-3 rounded border border-amber-400 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm leading-relaxed">
            {next.rung === 5
              ? "This gives you the complete worked solution. You will not have earned these marks, and your feedback will say so."
              : "This does a step of the maths for you. Have you genuinely tried it first?"}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => reveal(nextRung)}
              className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
            >
              Show it
            </button>
            <button
              onClick={() => setConfirmingFinal(false)}
              className="rounded border border-neutral-400 px-3 py-1.5 text-sm dark:border-neutral-600"
            >
              Keep trying
            </button>
          </div>
        </div>
      )}

      {!hasNext && (
        <p className="mt-3 text-xs text-neutral-500">
          You have used every hint on this part. Attempt it again unaided later — that is the
          only way these marks become yours.
        </p>
      )}

      {revealed === 0 && (
        <p className="mt-2 text-xs text-neutral-500">
          {RUNGS.length} rungs, gentlest first. Take only as many as you need.
        </p>
      )}
    </div>
  );
}

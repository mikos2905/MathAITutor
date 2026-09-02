"use client";

import { useState } from "react";
import Link from "next/link";
import type { AttemptRecord } from "@/lib/student/types";
import { MarkBreakdown } from "./MarkBreakdown";

/**
 * One past attempt, expandable to the full marking.
 *
 * Re-reading the feedback on a question you got wrong a fortnight ago is one
 * of the more useful things a student can do, and it is impossible if the app
 * only remembers the score.
 */
export function HistoryEntry({ record, title }: { record: AttemptRecord; title: string }) {
  const [open, setOpen] = useState(false);
  const pct = record.marksAvailable
    ? Math.round((record.marksAwarded / record.marksAvailable) * 100)
    : 0;
  const minutes = (record.secondsTaken / 60).toFixed(1);
  const overtime = record.secondsTaken > record.suggestedMinutes * 60;
  const heavyHints = record.hintUsage.filter((u) => u.highestRung >= 4);

  return (
    <li className="py-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <Link href={`/practice/${record.questionId}`} className="font-medium hover:underline">
            {title}
          </Link>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span>{new Date(record.at).toLocaleDateString()}</span>
            <span className={overtime ? "text-red-600 dark:text-red-400" : ""}>
              {minutes} min{overtime && ` (allowance ~${record.suggestedMinutes})`}
            </span>
            {heavyHints.length > 0 && (
              <span className="text-amber-700 dark:text-amber-400">
                full hint on {heavyHints.map((u) => `(${u.partLabel})`).join(", ")}
              </span>
            )}
          </div>
        </div>
        <span className="shrink-0 text-right">
          <span className="text-lg font-semibold tabular-nums">
            {record.marksAwarded}/{record.marksAvailable}
          </span>
          <span className="ml-2 text-sm text-neutral-500">{pct}%</span>
        </span>
      </div>

      {record.verdict ? (
        <>
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-2 text-sm text-neutral-500 hover:underline"
          >
            {open ? "Hide the marking" : "Re-read the marking"}
          </button>
          {open && (
            <div className="mt-4 border-l-2 border-neutral-200 pl-4 dark:border-neutral-800">
              <MarkBreakdown verdict={record.verdict} />
            </div>
          )}
        </>
      ) : (
        <p className="mt-2 text-xs text-neutral-400">
          Marked before full feedback was stored, so only the score survives.
        </p>
      )}
    </li>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HintRung, HintUsage, Question, Verdict } from "@/lib/ib/types";
import { PAPER_RULES } from "@/lib/ib/syllabus";
import { lookupCommandTerm } from "@/lib/ib/commandTerms";
import { prepareImage, type PreparedImage } from "@/lib/image";
import { MathText } from "./MathText";
import { MarkBreakdown } from "./MarkBreakdown";
import { HintLadder } from "./HintLadder";
import { ExplainItBack } from "./ExplainItBack";
import { ModelSolution } from "./ModelSolution";

type Stage = "ready" | "attempting" | "submitting" | "marked";

const MAX_PAGES = 8;

export function AttemptFlow({ question }: { question: Question }) {
  const [stage, setStage] = useState<Stage>("ready");
  // Wall-clock start, not a tick count. setInterval drifts and is throttled
  // in background tabs — which is exactly what happens on a phone when the
  // camera opens — so elapsed time is always derived from Date.now().
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [pages, setPages] = useState<PreparedImage[]>([]);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Highest rung reached per part. Recorded rather than merely counted, so the
  // grader can say which specific marks were earned with help.
  const [hintUsage, setHintUsage] = useState<Record<string, HintRung>>({});
  // Hides the marking and the model solution while the recall check is open,
  // so the explanation is written from memory rather than copied off the screen.
  const [recallOpen, setRecallOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const rules = PAPER_RULES[question.paper];
  const budgetSeconds = question.suggestedMinutes * 60;

  const elapsed = useCallback(
    () => (startedAt === null ? 0 : Math.floor((Date.now() - startedAt) / 1000)),
    [startedAt],
  );

  // The clock only runs while attempting, so upload and marking time are not
  // counted. It also re-syncs when the tab becomes visible again, so coming
  // back from the camera shows the right figure immediately.
  useEffect(() => {
    if (stage !== "attempting" || startedAt === null) return;
    const tick = () => setSeconds(elapsed());
    tick();
    const id = setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [stage, startedAt, elapsed]);

  const onFiles = useCallback(async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    setError(null);
    try {
      const prepared = await Promise.all(Array.from(list).map(prepareImage));
      setPages((prev) => [...prev, ...prepared].slice(0, MAX_PAGES));
    } catch {
      setError("Could not read one of those images. Try a JPEG or PNG.");
    }
  }, []);

  const removePage = (index: number) =>
    setPages((prev) => prev.filter((_, i) => i !== index));

  const recordHint = useCallback((partLabel: string, rung: HintRung) => {
    setHintUsage((prev) =>
      rung > (prev[partLabel] ?? 0) ? { ...prev, [partLabel]: rung } : prev,
    );
  }, []);

  function usageForSubmit(): HintUsage[] {
    return Object.entries(hintUsage).map(([partLabel, highestRung]) => ({
      partLabel,
      highestRung,
    }));
  }

  async function submit() {
    if (pages.length === 0) return;
    const secondsTaken = elapsed();
    setStage("submitting");
    setError(null);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          images: pages.map((p) => ({ base64: p.base64, mediaType: p.mediaType })),
          secondsTaken,
          hintUsage: usageForSubmit(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Grading failed.");
      setSeconds(secondsTaken);
      setVerdict(data.verdict);
      setStage("marked");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Grading failed.");
      setStage("attempting");
    }
  }

  function reset() {
    setStage("ready");
    setStartedAt(null);
    setSeconds(0);
    setPages([]);
    setVerdict(null);
    setHintUsage({});
    setRecallOpen(false);
  }

  const over = seconds > budgetSeconds;
  const totalTokens = pages.reduce((s, p) => s + p.estimatedTokens, 0);

  return (
    <div className="space-y-8">
      {/* Question */}
      <article className="space-y-5">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
          <span className="rounded bg-neutral-200 px-2 py-0.5 font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
            {rules.name}
          </span>
          <span>{rules.calculatorAllowed ? "GDC allowed" : "No calculator"}</span>
          <span>·</span>
          <span>
            {question.totalMarks} marks · ~{question.suggestedMinutes} min
          </span>
        </header>

        <h1 className="text-xl font-semibold">{question.title}</h1>

        {question.stem && (
          <p className="leading-relaxed">
            <MathText text={question.stem} />
          </p>
        )}

        <ol className="space-y-4">
          {question.parts.map((part) => {
            const ct = lookupCommandTerm(part.commandTerm);
            return (
              <li key={part.label} className="flex gap-3">
                <span className="shrink-0 font-medium">({part.label})</span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="leading-relaxed">
                    <MathText text={part.prompt} />
                    <span className="ml-2 text-sm text-neutral-500">[{part.marks}]</span>
                  </p>
                  {stage === "attempting" && (
                    <HintLadder part={part} onRungRevealed={recordHint} />
                  )}
                  {ct && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-neutral-500">
                        What &ldquo;{ct.term}&rdquo; requires
                      </summary>
                      <p className="mt-1 leading-relaxed text-neutral-600 dark:text-neutral-400">
                        {ct.definition} <strong>{ct.examImplication}</strong>
                      </p>
                    </details>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </article>

      <hr className="border-neutral-200 dark:border-neutral-800" />

      {/* Attempt controls */}
      {stage === "ready" && (
        <div className="space-y-3">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Work this on paper, under exam conditions. The timer starts when you do.
            {!rules.calculatorAllowed && " No calculator on this paper."}
          </p>
          <button
            onClick={() => {
              setStartedAt(Date.now());
              setStage("attempting");
            }}
            className="rounded bg-neutral-900 px-5 py-2.5 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Start attempt
          </button>
        </div>
      )}

      {(stage === "attempting" || stage === "submitting") && (
        <div className="space-y-5">
          <div className="flex items-baseline gap-3">
            <span
              className={
                "text-3xl font-semibold tabular-nums " + (over ? "text-red-600 dark:text-red-400" : "")
              }
            >
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </span>
            <span className="text-sm text-neutral-500">
              of ~{question.suggestedMinutes}:00 {over && "· over the exam allowance"}
            </span>
          </div>

          <div className="space-y-3">
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = ""; // allow re-selecting the same file
              }}
            />
            <button
              onClick={() => fileInput.current?.click()}
              disabled={pages.length >= MAX_PAGES}
              className="rounded border border-neutral-400 px-5 py-2.5 font-medium hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-600 dark:hover:bg-neutral-800"
            >
              {pages.length === 0 ? "Photograph your working" : "Add another page"}
            </button>

            {pages.length > 0 && (
              <div className="space-y-2">
                <ul className="flex flex-wrap gap-3">
                  {pages.map((page, i) => (
                    <li key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={page.dataUrl}
                        alt={`Page ${i + 1} of your working`}
                        className="h-40 rounded border border-neutral-300 object-cover dark:border-neutral-700"
                      />
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                        Page {i + 1}
                      </span>
                      <button
                        onClick={() => removePage(i)}
                        aria-label={`Remove page ${i + 1}`}
                        className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white hover:bg-black/80"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-neutral-500">
                  {pages.length} page{pages.length === 1 ? "" : "s"} · ~
                  {totalTokens.toLocaleString()} image tokens
                  {pages.length >= MAX_PAGES && " · page limit reached"}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={submit}
            disabled={pages.length === 0 || stage === "submitting"}
            className="rounded bg-neutral-900 px-5 py-2.5 font-medium text-white disabled:opacity-40 hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {stage === "submitting" ? "Marking…" : "Submit for marking"}
          </button>
        </div>
      )}

      {error && (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {stage === "marked" && verdict && (
        <>
          {!recallOpen && <MarkBreakdown verdict={verdict} />}

          <ExplainItBack question={question} onWritingChange={setRecallOpen} />

          {!recallOpen && (
            <>
              <ModelSolution question={question} />
              <button
                onClick={reset}
                className="rounded border border-neutral-400 px-5 py-2.5 font-medium hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
              >
                Attempt again
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

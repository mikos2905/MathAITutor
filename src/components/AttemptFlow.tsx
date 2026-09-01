"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Question, Verdict } from "@/lib/ib/types";
import { PAPER_RULES } from "@/lib/ib/syllabus";
import { lookupCommandTerm } from "@/lib/ib/commandTerms";
import { prepareImage, type PreparedImage } from "@/lib/image";
import { MathText } from "./MathText";
import { MarkBreakdown } from "./MarkBreakdown";

type Stage = "ready" | "attempting" | "submitting" | "marked";

export function AttemptFlow({ question }: { question: Question }) {
  const [stage, setStage] = useState<Stage>("ready");
  const [seconds, setSeconds] = useState(0);
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const rules = PAPER_RULES[question.paper];
  const budgetSeconds = question.suggestedMinutes * 60;

  // The timer runs only while attempting, so upload and marking time
  // are not counted against the student.
  useEffect(() => {
    if (stage !== "attempting") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [stage]);

  const onFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    try {
      setImage(await prepareImage(file));
    } catch {
      setError("Could not read that image. Try a JPEG or PNG.");
    }
  }, []);

  async function submit() {
    if (!image) return;
    setStage("submitting");
    setError(null);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          imageBase64: image.base64,
          imageMediaType: image.mediaType,
          secondsTaken: seconds,
          hintsUsed: 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Grading failed.");
      setVerdict(data.verdict);
      setStage("marked");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Grading failed.");
      setStage("attempting");
    }
  }

  const over = seconds > budgetSeconds;

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
                <div className="space-y-1">
                  <p className="leading-relaxed">
                    <MathText text={part.prompt} />
                    <span className="ml-2 text-sm text-neutral-500">[{part.marks}]</span>
                  </p>
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
            onClick={() => setStage("attempting")}
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
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <button
              onClick={() => fileInput.current?.click()}
              className="rounded border border-neutral-400 px-5 py-2.5 font-medium hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
            >
              {image ? "Retake photo" : "Photograph your working"}
            </button>

            {image && (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.dataUrl}
                  alt="Your working"
                  className="max-h-96 rounded border border-neutral-300 dark:border-neutral-700"
                />
                <p className="text-xs text-neutral-500">
                  Resized to {image.width}×{image.height} · ~{image.estimatedTokens.toLocaleString()}{" "}
                  image tokens
                </p>
              </div>
            )}
          </div>

          <button
            onClick={submit}
            disabled={!image || stage === "submitting"}
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
          <MarkBreakdown verdict={verdict} />
          <button
            onClick={() => {
              setStage("ready");
              setSeconds(0);
              setImage(null);
              setVerdict(null);
            }}
            className="rounded border border-neutral-400 px-5 py-2.5 font-medium hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
          >
            Attempt again
          </button>
        </>
      )}
    </div>
  );
}

import type { Question, Attempt, Verdict } from "@/lib/ib/types";
import { gradeMock } from "./mock";

/**
 * Grading entry point.
 *
 * Defaults to the mock grader so the app runs, and costs nothing, with no
 * API key present. Set GRADER=live (and ANTHROPIC_API_KEY) to mark for real.
 * The live module is imported lazily so a missing key never breaks the build.
 */
export async function grade(question: Question, attempt: Attempt): Promise<Verdict> {
  if (process.env.GRADER === "live") {
    const { gradeLive } = await import("./live");
    return gradeLive(question, attempt);
  }
  return gradeMock(question, attempt);
}

export function graderMode(): "live" | "mock" {
  return process.env.GRADER === "live" ? "live" : "mock";
}

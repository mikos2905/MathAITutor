import type { Question, RecallVerdict } from "@/lib/ib/types";

/** Deterministic stand-in so the flow works with no API key and no spend. */
export async function checkRecallMock(
  question: Question,
  explanation: string,
): Promise<RecallVerdict> {
  await new Promise((r) => setTimeout(r, 700));

  const words = explanation.trim().split(/\s+/).filter(Boolean).length;
  const grade = words === 0 ? "absent" : words < 25 ? "partial" : "solid";

  return {
    grade,
    captured:
      words === 0
        ? []
        : [`(mock) You described roughly ${words} words' worth of method for "${question.title}".`],
    missing:
      grade === "solid"
        ? []
        : ["(mock) The step where the method actually works — a real check would name it."],
    comment:
      "(mock) This is a fake recall check that only counts your words. Set GRADER=live for a real one.",
  };
}

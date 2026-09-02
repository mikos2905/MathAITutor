import type { Question, RecallVerdict } from "@/lib/ib/types";
import { checkRecallMock } from "./mock";

export async function checkRecall(
  question: Question,
  explanation: string,
): Promise<RecallVerdict> {
  if (process.env.GRADER === "live") {
    const { checkRecallLive } = await import("./live");
    return checkRecallLive(question, explanation);
  }
  return checkRecallMock(question, explanation);
}

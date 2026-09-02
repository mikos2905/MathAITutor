import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Question, RecallVerdict } from "@/lib/ib/types";
import { RECALL_SYSTEM_PROMPT, buildRecallRequest } from "./prompt";
import { RecallVerdictSchema } from "./schema";

const client = new Anthropic();

/**
 * Judging an explanation is a much lighter task than marking handwriting
 * against a markscheme — no image, and a short answer. Effort defaults lower
 * than the grader's accordingly.
 */
const EFFORT = (process.env.RECALL_EFFORT ?? "medium") as "low" | "medium" | "high";

export async function checkRecallLive(
  question: Question,
  explanation: string,
): Promise<RecallVerdict> {
  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: [
      { type: "text", text: RECALL_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: buildRecallRequest(question, explanation) }],
    output_config: { format: zodOutputFormat(RecallVerdictSchema), effort: EFFORT },
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The model declined to assess this explanation.");
  }
  if (!response.parsed_output) {
    throw new Error("The recall check returned a response that did not match the expected shape.");
  }
  return response.parsed_output as RecallVerdict;
}

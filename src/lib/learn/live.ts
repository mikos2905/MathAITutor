import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Lesson } from "@/lib/ib/types";
import type { StudentModel } from "@/lib/student/types";
import { buildHistoryBlock } from "@/lib/student/promptBlock";
import { LEARN_SYSTEM_PROMPT, buildLearnRequest } from "./prompt";
import { LessonSchema } from "./schema";

const client = new Anthropic();

/** Explaining is lighter than marking handwriting; medium effort by default. */
const EFFORT = (process.env.LEARN_EFFORT ?? "medium") as "low" | "medium" | "high";

export async function explainLive(request: string, model: StudentModel): Promise<Lesson> {
  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: LEARN_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      { role: "user", content: buildLearnRequest(request, buildHistoryBlock(model)) },
    ],
    output_config: { format: zodOutputFormat(LessonSchema), effort: EFFORT },
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The model declined to explain this. Try rephrasing the request.");
  }
  if (!response.parsed_output) {
    throw new Error("The explanation came back in an unexpected shape.");
  }
  return response.parsed_output as Lesson;
}

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { Question, Attempt, Verdict } from "@/lib/ib/types";
import {
  EXAMINER_SYSTEM_PROMPT,
  buildQuestionBlock,
  buildAttemptBlock,
} from "@/lib/ib/markingPrompt";
import { VerdictSchema } from "./schema";

/**
 * Effort controls how much the model reasons before answering, and reasoning
 * tokens bill as output — so this is the main cost lever in the whole app.
 * "high" is the default and gives the most reliable marking; "medium" roughly
 * halves the cost per grade with some loss of care on multi-step working.
 */
const EFFORT = (process.env.GRADER_EFFORT ?? "high") as
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

export async function gradeLive(question: Question, attempt: Attempt): Promise<Verdict> {
  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    thinking: { type: "adaptive" },

    // The system prompt never varies, so it caches across every request.
    system: [
      {
        type: "text",
        text: EXAMINER_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],

    messages: [
      {
        role: "user",
        content: [
          // Stable for a given question, so it caches across repeat attempts
          // at the same question. Must precede the image to stay in the prefix.
          {
            type: "text",
            text: buildQuestionBlock(question),
            cache_control: { type: "ephemeral" },
          },
          // Volatile from here down.
          {
            type: "image",
            source: {
              type: "base64",
              media_type: attempt.imageMediaType,
              data: attempt.imageBase64,
            },
          },
          { type: "text", text: buildAttemptBlock(question, attempt) },
        ],
      },
    ],

    output_config: {
      format: zodOutputFormat(VerdictSchema),
      effort: EFFORT,
    },
  });

  // Safety classifiers can decline a request with HTTP 200 and no content.
  // Vanishingly unlikely for maths marking, but reading .content without
  // checking would throw a confusing error if it ever happened.
  if (response.stop_reason === "refusal") {
    throw new Error(
      `The model declined to mark this attempt (${response.stop_details?.category ?? "unknown"}). ` +
        `If the photo contains anything other than maths working, retake it.`,
    );
  }

  if (!response.parsed_output) {
    throw new Error("The grader returned a response that did not match the expected shape.");
  }

  const verdict = response.parsed_output as Verdict;

  if (process.env.GRADER_LOG_USAGE === "1") {
    const u = response.usage;
    console.log(
      `[grader] in=${u.input_tokens} cached=${u.cache_read_input_tokens ?? 0} ` +
        `cache_write=${u.cache_creation_input_tokens ?? 0} out=${u.output_tokens}`,
    );
  }

  return verdict;
}

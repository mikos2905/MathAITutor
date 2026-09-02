import { z } from "zod";

export const RecallVerdictSchema = z.object({
  grade: z
    .enum(["solid", "partial", "absent"])
    .describe(
      "solid = could redo it unaided; partial = has the shape but would get stuck; absent = restated the answer or identified no method.",
    ),
  captured: z
    .array(z.string())
    .describe("Steps they genuinely articulated. Quote or closely paraphrase their own words."),
  missing: z
    .array(z.string())
    .describe(
      "Steps they left out, ordered by where each falls in the method so it reads as a sequence.",
    ),
  comment: z
    .string()
    .describe("Two or three sentences to the student. Direct, specific, no opening praise."),
});

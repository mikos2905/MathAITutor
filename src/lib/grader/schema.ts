import { z } from "zod";

/**
 * The shape we force the model to return.
 *
 * Using structured outputs rather than parsing prose is what lets the UI
 * render a real mark breakdown, and what lets verdicts accumulate into the
 * student model. `.describe()` calls are not decoration — they are sent to
 * the model as part of the schema and materially improve what comes back.
 */

export const MarkAwardSchema = z.object({
  markPointId: z
    .string()
    .describe("The rubric mark point id, e.g. 'M1'. Must match one supplied."),
  awarded: z.boolean(),
  evidence: z
    .string()
    .describe(
      "Direct quote of the line of the student's working that decided this, or '' if the working is absent.",
    ),
  reason: z
    .string()
    .describe("Why it was or was not awarded, addressed to the student in the second person."),
});

export const PartVerdictSchema = z.object({
  partLabel: z.string(),
  awards: z.array(MarkAwardSchema),
  marksAwarded: z.number(),
  marksAvailable: z.number(),
});

export const TechniqueFlagSchema = z.object({
  kind: z.enum([
    "rounding",
    "command-term",
    "calculator-misuse",
    "missing-justification",
    "unshown-working",
    "notation",
    "timing",
  ]),
  message: z
    .string()
    .describe("Specific and concrete. Name the line and the rule broken, not a generic tip."),
  marksCost: z.number().describe("Marks this cost on this attempt. 0 if it cost none here."),
});

export const MisconceptionSchema = z.object({
  id: z
    .string()
    .describe(
      "Stable kebab-case slug for this specific error, e.g. 'chain-rule-omits-inner-derivative'. Reuse the same slug whenever the same error recurs so it can be counted across sessions.",
    ),
  statement: z
    .string()
    .describe("One sentence naming the misconception precisely. Not a topic, a belief."),
  topic: z.enum([
    "1-number-algebra",
    "2-functions",
    "3-geometry-trigonometry",
    "4-statistics-probability",
    "5-calculus",
  ]),
  evidence: z.string().describe("The working that shows it."),
});

export const VerdictSchema = z.object({
  transcription: z
    .string()
    .describe(
      "Line-by-line reading of the handwritten working, preserving the student's own notation. Flag anything ambiguous.",
    ),
  parts: z.array(PartVerdictSchema),
  totalAwarded: z.number(),
  totalAvailable: z.number(),
  techniqueFlags: z.array(TechniqueFlagSchema),
  misconceptions: z.array(MisconceptionSchema),
  oneThingToFix: z
    .string()
    .describe("Exactly one actionable thing. Never a list. Two sentences at most."),
});

export type VerdictOutput = z.infer<typeof VerdictSchema>;

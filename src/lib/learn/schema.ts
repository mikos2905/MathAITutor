import { z } from "zod";

export const LessonSchema = z.object({
  concept: z
    .string()
    .describe("The concept from the provided list that this request maps to, exactly as listed."),
  topic: z.enum([
    "1-number-algebra",
    "2-functions",
    "3-geometry-trigonometry",
    "4-statistics-probability",
    "5-calculus",
  ]),
  title: z.string().describe("A short title for the explanation, five words or fewer."),
  paragraphs: z
    .array(z.string())
    .min(3)
    .max(6)
    .describe("Short paragraphs in reading order, inline LaTeX between $...$."),
  trap: z
    .string()
    .describe(
      "The one mistake to watch for. This student's own recorded misconception where there is one; otherwise the most common error.",
    ),
  booklet: z
    .string()
    .describe(
      "Whether the key result is in the formula booklet and what that means: don't memorise it and look here, or it is not there and must be known cold.",
    ),
  checkYourself: z
    .string()
    .describe("One question to answer in your head before practising. Do not include the answer."),
});

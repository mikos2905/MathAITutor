import type { Question } from "@/lib/ib/types";

export const STATISTICS_QUESTIONS: Question[] = [
  {
    id: "aahl-stat-002",
    paper: "P1",
    topic: "4-statistics-probability",
    title: "Conditional probability and testing independence",
    source: "original",
    totalMarks: 6,
    suggestedMinutes: 7,
    stem: String.raw`$A$ and $B$ are events such that $P(A) = 0.4$, $P(B) = 0.5$ and $P(A \cup B) = 0.7$.`,
    parts: [
      {
        label: "a",
        prompt: String.raw`Find $P(A \cap B)$.`,
        commandTerm: "find",
        marks: 2,
        answer: "0.2",
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Uses the addition rule P(A ∪ B) = P(A) + P(B) - P(A ∩ B), substituting the given values.",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "0.2.",
            accept: ["1/5"],
            dependentOn: "M1",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`You are given three of the four quantities that appear in one standard formula, and asked for the fourth. That formula is in your formula booklet — find it before doing anything else.`,
          },
          {
            rung: 2,
            text: String.raw`The addition rule is $P(A \cup B) = P(A) + P(B) - P(A \cap B)$. Substitute what you know and rearrange for the intersection.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`$0.7 = 0.4 + 0.5 - P(A \cap B)$. Solve for $P(A \cap B)$ — it is a single line of algebra from here.`,
            unblocks: ["M1"],
          },
          {
            rung: 4,
            text: String.raw`$P(A \cap B) = 0.4 + 0.5 - 0.7$.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$P(A \cap B) = 0.2$. Keep it — parts (b) and (c) both need it.`,
            unblocks: ["A1"],
          },
        ],
      },
      {
        label: "b",
        prompt: String.raw`Find $P(A \mid B)$.`,
        commandTerm: "find",
        marks: 2,
        dependsOnPart: "a",
        answer: "0.4",
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Uses P(A|B) = P(A ∩ B)/P(B) with their value from part (a). Follow through on an incorrect part (a).",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "0.4.",
            accept: ["2/5", "Follow through from an incorrect part (a)"],
            dependentOn: "M1",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`The vertical bar means "given that". You are restricting attention to the outcomes where $B$ has happened, and asking what fraction of those also involve $A$.`,
          },
          {
            rung: 2,
            text: String.raw`The conditional probability formula is $P(A \mid B) = \dfrac{P(A \cap B)}{P(B)}$. You have both of those already.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Take your answer to part (a) as the numerator and the given $P(B)$ as the denominator. Be careful which way round they go: $P(A \mid B)$ divides by $P(B)$, not by $P(A)$.`,
            unblocks: ["M1"],
          },
          {
            rung: 4,
            text: String.raw`$P(A \mid B) = \dfrac{0.2}{0.5}$.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$P(A \mid B) = \dfrac{0.2}{0.5} = 0.4$. Worth noticing: this equals $P(A)$, which is a strong hint about part (c).`,
            unblocks: ["A1"],
          },
        ],
      },
      {
        label: "c",
        prompt: String.raw`Determine whether $A$ and $B$ are independent, justifying your answer.`,
        commandTerm: "determine",
        marks: 2,
        dependsOnPart: "a",
        answer: String.raw`Independent, since $P(A)P(B) = 0.4 \times 0.5 = 0.2 = P(A \cap B)$`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Applies a valid test for independence: computes P(A)P(B) and compares with P(A ∩ B), or compares P(A|B) with P(A).",
          },
          {
            id: "R1",
            type: "R",
            marks: 1,
            description:
              "States the conclusion with its reason, e.g. 'P(A)P(B) = 0.2 = P(A ∩ B), so A and B are independent'. A bare 'yes' or an unexplained calculation does not earn this mark — the question says 'justifying'.",
            dependentOn: "M1",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`"Justifying your answer" is an instruction, and there is an explicit R mark attached to it. Whatever you compute, you must finish with a sentence. A correct calculation and no conclusion scores half.`,
          },
          {
            rung: 2,
            text: String.raw`Two events are independent exactly when $P(A \cap B) = P(A) \times P(B)$. You know all three of those numbers, so this is a comparison, not a derivation.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Work out $P(A) \times P(B)$ and set it beside your $P(A \cap B)$ from part (a). Then write a sentence that names the test, gives both values, and states the verdict.`,
            unblocks: ["M1"],
          },
          {
            rung: 4,
            text: String.raw`$P(A) \times P(B) = 0.4 \times 0.5 = 0.2$, and $P(A \cap B) = 0.2$. They are equal — now write the conclusion out properly.`,
            unblocks: ["M1"],
          },
          {
            rung: 5,
            text: String.raw`Since $P(A)P(B) = 0.4 \times 0.5 = 0.2$ and $P(A \cap B) = 0.2$, the two are equal, so $A$ and $B$ are independent. That whole sentence is the R mark; stopping after "$0.2 = 0.2$" would lose it.`,
            unblocks: ["R1"],
          },
        ],
      },
    ],
  },
];

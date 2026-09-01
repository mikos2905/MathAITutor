import type { Question } from "@/lib/ib/types";

/**
 * Seed questions, written in IB style rather than copied from past papers.
 *
 * The rubrics matter more than the questions. They are deliberately shaped
 * like real markschemes — individually awardable points, typed M/A/R/AG,
 * with "accept" lists — because that structure is what the grader marks
 * against and what makes the feedback resemble an examiner's.
 *
 * `String.raw` is used wherever LaTeX appears so backslashes survive.
 */
export const QUESTIONS: Question[] = [
  {
    id: "aahl-calc-001",
    paper: "P1",
    topic: "5-calculus",
    title: "Product rule, stationary points and justification",
    source: "original",
    totalMarks: 8,
    suggestedMinutes: 9,
    stem: String.raw`Let $f(x) = x e^{-2x}$, for $x \in \mathbb{R}$.`,
    parts: [
      {
        label: "a",
        prompt: String.raw`Show that $f'(x) = (1 - 2x)e^{-2x}$.`,
        commandTerm: "show that",
        marks: 3,
        answer: String.raw`$f'(x) = (1-2x)e^{-2x}$ (given)`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Recognises a product and attempts the product rule, with evidence of u·v' + v·u' for u = x and v = e^{-2x}.",
            accept: ["Any clear attempt at the product rule, even with one term wrong"],
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description:
              "Both terms correct: x·(-2e^{-2x}) + e^{-2x}. The inner derivative -2 must be present.",
            accept: ["-2xe^{-2x} + e^{-2x}", "e^{-2x} - 2xe^{-2x}"],
            dependentOn: "M1",
          },
          {
            id: "A2",
            type: "AG",
            marks: 1,
            description:
              "Factorises e^{-2x} to reach exactly the printed result (1-2x)e^{-2x}. The final line must show the factorisation, not merely restate the given answer.",
            dependentOn: "A1",
          },
        ],
      },
      {
        label: "b",
        prompt: String.raw`Hence find the coordinates of the stationary point on the graph of $f$, and justify that it is a maximum.`,
        commandTerm: "hence",
        marks: 5,
        dependsOnPart: "a",
        answer: String.raw`$\left(\tfrac{1}{2}, \tfrac{1}{2e}\right)$; maximum since $f''\left(\tfrac{1}{2}\right) < 0$`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Sets their f'(x) = 0 using the result from part (a). Starting again from f(x) rather than using part (a) does not earn this mark.",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "x = 1/2.",
            accept: ["0.5"],
            dependentOn: "M1",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description: "y-coordinate 1/(2e).",
            accept: [
              "(1/2)e^{-1}",
              "0.184 (3 s.f.)",
              "Exact form preferred on P1 but accept the 3 s.f. decimal",
            ],
            dependentOn: "A1",
          },
          {
            id: "M2",
            type: "M",
            marks: 1,
            description:
              "Applies a valid test: evaluates f''(1/2), or tests the sign of f' either side of x = 1/2.",
          },
          {
            id: "R1",
            type: "R",
            marks: 1,
            description:
              "States the conclusion in words with its reason, e.g. 'f''(1/2) = -4e^{-1} < 0 therefore it is a maximum'. A correct test with no concluding sentence does not earn this mark.",
            dependentOn: "M2",
          },
        ],
      },
    ],
  },

  {
    id: "aahl-alg-001",
    paper: "P1",
    topic: "1-number-algebra",
    title: "Proof by mathematical induction",
    source: "original",
    totalMarks: 7,
    suggestedMinutes: 8,
    parts: [
      {
        label: "a",
        prompt: String.raw`Prove by mathematical induction that $\displaystyle\sum_{r=1}^{n} r \cdot 2^{r} = (n-1)2^{\,n+1} + 2$ for all $n \in \mathbb{Z}^{+}$.`,
        commandTerm: "prove",
        marks: 7,
        answer: String.raw`Full induction: base case $n=1$, inductive step, concluding statement.`,
        rubric: [
          {
            id: "A1",
            type: "A",
            marks: 1,
            description:
              "Base case verified for n = 1: shows LHS = 2 and RHS = (0)(4) + 2 = 2. Both sides must be evaluated — asserting 'true for n=1' earns nothing.",
          },
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "States the inductive assumption explicitly for n = k, i.e. assumes the sum to k equals (k-1)2^{k+1} + 2.",
          },
          {
            id: "M2",
            type: "M",
            marks: 1,
            description:
              "Considers the sum to k+1 by adding the (k+1)th term to the assumed result: (k-1)2^{k+1} + 2 + (k+1)2^{k+1}.",
            dependentOn: "M1",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description:
              "Correct algebraic simplification, e.g. 2^{k+1}(k-1+k+1) + 2 = 2k·2^{k+1} + 2.",
            dependentOn: "M2",
          },
          {
            id: "A3",
            type: "A",
            marks: 1,
            description:
              "Reaches k·2^{k+2} + 2 and identifies it as the required form ((k+1)-1)2^{(k+1)+1} + 2.",
            dependentOn: "A2",
          },
          {
            id: "R1",
            type: "R",
            marks: 1,
            description: "States that the result therefore holds for n = k+1.",
          },
          {
            id: "R2",
            type: "R",
            marks: 1,
            description:
              "Complete concluding statement: true for n = 1, and truth for n = k implies truth for n = k+1, therefore true for all n in Z+ by induction. A partial conclusion does not earn this.",
            dependentOn: "R1",
          },
        ],
      },
    ],
  },

  {
    id: "aahl-stat-001",
    paper: "P2",
    topic: "4-statistics-probability",
    title: "Normal distribution and a linked binomial",
    source: "original",
    totalMarks: 7,
    suggestedMinutes: 8,
    stem: String.raw`The masses, in grams, of apples from an orchard are normally distributed with mean $120$ and standard deviation $8$.`,
    parts: [
      {
        label: "a",
        prompt: String.raw`Find the probability that a randomly chosen apple has a mass greater than $130$ g.`,
        commandTerm: "find",
        marks: 2,
        answer: "0.106 (3 s.f.)",
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Evidence of a correct normal probability set-up, e.g. P(X > 130) with X ~ N(120, 8²), or a correct GDC normalcdf entry.",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "0.106 to three significant figures.",
            accept: ["0.10564...", "0.1056"],
            dependentOn: "M1",
          },
        ],
      },
      {
        label: "b",
        prompt: String.raw`Find the mass exceeded by $15\%$ of the apples.`,
        commandTerm: "find",
        marks: 2,
        answer: "128 g (3 s.f.)",
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Recognises this as an inverse normal problem and uses the correct tail, i.e. an area of 0.85 to the left (or 0.15 to the right).",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "128 g to three significant figures.",
            accept: ["128.29...", "128.3"],
            dependentOn: "M1",
          },
        ],
      },
      {
        label: "c",
        prompt: String.raw`A box contains $12$ apples chosen at random. Find the probability that exactly $3$ of them have a mass greater than $130$ g.`,
        commandTerm: "find",
        marks: 3,
        dependsOnPart: "a",
        answer: "0.0847 (3 s.f.)",
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Recognises a binomial distribution with n = 12 and p equal to their answer to part (a). Follow through on an incorrect part (a).",
          },
          {
            id: "M2",
            type: "M",
            marks: 1,
            description:
              "Correct binomial expression or GDC entry for exactly 3 successes, e.g. C(12,3)p³(1-p)⁹.",
            dependentOn: "M1",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "0.0847 to three significant figures.",
            accept: ["0.08469...", "Follow through from an incorrect part (a) value of p"],
            dependentOn: "M2",
          },
        ],
      },
    ],
  },
];

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

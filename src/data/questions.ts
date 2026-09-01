import type { Question } from "@/lib/ib/types";

/**
 * Seed questions, written in IB style rather than copied from past papers.
 *
 * Two things carry the weight here:
 *
 * 1. The rubric. Individually awardable points, typed M/A/R/AG, with "accept"
 *    lists — the structure the grader marks against.
 * 2. The hint ladder. Each rung gives the smallest push that might unblock the
 *    student. Rungs 1-3 never execute any maths; rung 4 does exactly one step;
 *    rung 5 is the full solution and is gated behind a confirmation.
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
        hints: [
          {
            rung: 1,
            text: String.raw`This is a "show that", so the answer is already printed — you earn nothing for writing it down. Every mark is in the derivation, and your final line has to arrive at exactly $(1-2x)e^{-2x}$. Start by looking at the structure of $f(x)$: what kind of expression is it?`,
          },
          {
            rung: 2,
            text: String.raw`$f(x) = x \cdot e^{-2x}$ is a product of two functions of $x$. Which differentiation rule handles that, and what are your $u$ and $v$?`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Take $u = x$ and $v = e^{-2x}$, and use $f' = uv' + vu'$. The term students most often get wrong is $v'$: differentiating $e^{-2x}$ needs the chain rule, so it is not simply $e^{-2x}$. Work out $u'$ and $v'$ separately before you combine them.`,
            unblocks: ["M1"],
          },
          {
            rung: 4,
            text: String.raw`$u' = 1$ and $v' = -2e^{-2x}$. So $f'(x) = x(-2e^{-2x}) + e^{-2x}(1)$. Now factor $e^{-2x}$ out of both terms and tidy the bracket.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$f'(x) = -2xe^{-2x} + e^{-2x} = e^{-2x}(-2x + 1) = (1-2x)e^{-2x}$, as required. Note that the factorisation line is not optional — on a "show that" it is where the final mark lives.`,
            unblocks: ["A2"],
          },
        ],
      },
      {
        label: "b",
        prompt: String.raw`Hence find the coordinates of the stationary point on the graph of $f$, and justify that it is a maximum.`,
        commandTerm: "hence",
        marks: 5,
        dependsOnPart: "a",
        answer: String.raw`$\left(\tfrac{1}{2}, \tfrac{1}{2e}\right)$; maximum since $f''\left(\tfrac{1}{2}\right) = -2e^{-1} < 0$`,
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
              "States the conclusion in words with its reason, e.g. 'f''(1/2) = -2e^{-1} < 0 therefore it is a maximum'. A correct test with no concluding sentence does not earn this mark.",
            dependentOn: "M2",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`"Hence" is an instruction, not a linking word: you are required to use part (a). If you find yourself differentiating from scratch, stop. Also read the second half carefully — "justify" is a separate demand from "find", and it carries its own mark.`,
          },
          {
            rung: 2,
            text: String.raw`A stationary point is where $f'(x) = 0$. Set your expression from part (a) equal to zero. Before you solve it, ask yourself: can $e^{-2x}$ ever be zero?`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Solve $(1-2x)e^{-2x} = 0$. Since $e^{-2x} > 0$ for every real $x$, only the bracket can vanish. Once you have $x$, substitute it back into $f(x)$ — not $f'(x)$ — for the $y$-coordinate. Then for the justification you need both a test (second derivative, or the sign of $f'$ either side) and a sentence stating the conclusion.`,
            unblocks: ["M1", "A1"],
          },
          {
            rung: 4,
            text: String.raw`$1 - 2x = 0$ gives $x = \tfrac{1}{2}$, and $f(\tfrac{1}{2}) = \tfrac{1}{2}e^{-1}$. For the justification, differentiate $f'(x) = (1-2x)e^{-2x}$ again to get $f''(x)$, then evaluate it at $x = \tfrac{1}{2}$ and say what its sign tells you.`,
            unblocks: ["A1", "A2"],
          },
          {
            rung: 5,
            text: String.raw`$f'(x) = 0 \Rightarrow x = \tfrac{1}{2}$, and $f(\tfrac{1}{2}) = \tfrac{1}{2e}$, so the stationary point is $\left(\tfrac{1}{2}, \tfrac{1}{2e}\right)$. Differentiating again, $f''(x) = -2e^{-2x} - 2(1-2x)e^{-2x} = (4x-4)e^{-2x}$, so $f''(\tfrac{1}{2}) = -2e^{-1} < 0$. Since the second derivative is negative at the stationary point, it is a maximum. That final sentence is the R mark — without it you score 4 out of 5.`,
            unblocks: ["M2", "R1"],
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
        hints: [
          {
            rung: 1,
            text: String.raw`Induction is marked on its structure as much as its algebra — two of the seven marks here are R marks for what you write in words. Before doing any algebra, write down the four headings you are going to fill in: base case, inductive assumption, inductive step, conclusion.`,
          },
          {
            rung: 2,
            text: String.raw`Start with the base case. Substitute $n = 1$ into the left-hand side and the right-hand side separately and show the two values agree. Writing "true for $n=1$" without evaluating both sides earns nothing.`,
            unblocks: ["A1"],
          },
          {
            rung: 3,
            text: String.raw`For the inductive step: assume the statement holds for $n = k$, so $\sum_{r=1}^{k} r2^{r} = (k-1)2^{k+1} + 2$. To get to $n = k+1$, add the next term of the sum — which is $(k+1)2^{k+1}$ — to that assumed total. Your goal is to massage the result into the same shape with $k+1$ in place of $k$, so work out what that target expression looks like before you start.`,
            unblocks: ["M1", "M2"],
          },
          {
            rung: 4,
            text: String.raw`You have $(k-1)2^{k+1} + 2 + (k+1)2^{k+1}$. Factor $2^{k+1}$ out of the first and third terms: the bracket becomes $(k-1) + (k+1)$. Simplify that bracket, then rewrite the product as a single power of 2 and compare it with the target $((k+1)-1)2^{(k+1)+1} + 2$.`,
            unblocks: ["A2"],
          },
          {
            rung: 5,
            text: String.raw`Base case: $n=1$ gives LHS $= 1 \cdot 2 = 2$ and RHS $= (0)2^{2} + 2 = 2$, so it holds. Assume true for $n=k$. Then $\sum_{r=1}^{k+1} r2^{r} = (k-1)2^{k+1} + 2 + (k+1)2^{k+1} = 2^{k+1}\big[(k-1)+(k+1)\big] + 2 = 2^{k+1}(2k) + 2 = k \cdot 2^{k+2} + 2$, which is exactly $((k+1)-1)2^{(k+1)+1} + 2$. So it holds for $n = k+1$. Since it is true for $n=1$, and truth for $n=k$ implies truth for $n=k+1$, it is true for all $n \in \mathbb{Z}^{+}$ by induction. That last sentence is a mark on its own — write it out in full every time.`,
            unblocks: ["A3", "R1", "R2"],
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
        hints: [
          {
            rung: 1,
            text: String.raw`This is Paper 2, so your GDC is allowed and is the intended tool — do not reach for a $z$-table or long hand algebra. Write down the distribution and its parameters first.`,
          },
          {
            rung: 2,
            text: String.raw`$X \sim N(120, 8^{2})$, and you want $P(X > 130)$. Your GDC's normal CDF needs four things: a lower bound, an upper bound, the mean and the standard deviation. Which is which here?`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Lower bound $130$, upper bound something enormous to represent infinity (most calculators want $1\text{E}99$), mean $120$, standard deviation $8$. Write the set-up down on paper as well as keying it in — the M mark is for evidence of the method, and an unsupported number cannot earn it.`,
            unblocks: ["M1"],
          },
          {
            rung: 4,
            text: String.raw`Evaluate $\text{normalcdf}(130,\ 1\text{E}99,\ 120,\ 8)$. Keep the full display value; you will need it again in part (c), and rounding now will shift the third significant figure there.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$P(X > 130) = 0.10564\ldots = 0.106$ to 3 s.f. Store the unrounded value in a calculator variable for part (c).`,
            unblocks: ["A1"],
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
        hints: [
          {
            rung: 1,
            text: String.raw`Notice what has swapped round compared with part (a): there you knew the mass and wanted a probability, here you know the probability and want the mass. That is a different calculator function.`,
          },
          {
            rung: 2,
            text: String.raw`You need the inverse normal. The trap is the tail: most calculators expect the area to the left of the value. If $15\%$ of apples exceed this mass, what proportion is below it?`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`The area to the left is $1 - 0.15 = 0.85$. So you want the inverse normal of $0.85$ with mean $120$ and standard deviation $8$. Show that $0.85$ in your working — it is the evidence the M mark is looking for.`,
            unblocks: ["M1"],
          },
          {
            rung: 4,
            text: String.raw`Evaluate $\text{invNorm}(0.85,\ 120,\ 8)$, then round to 3 s.f. and remember the units.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$\text{invNorm}(0.85, 120, 8) = 128.29\ldots$, so the mass is $128$ g to 3 s.f. Writing $128.29$ or omitting the units would cost you the accuracy mark.`,
            unblocks: ["A1"],
          },
        ],
      },
      {
        label: "c",
        prompt: String.raw`A box contains $12$ apples chosen at random. Find the probability that exactly $3$ of them have a mass greater than $130$ g.`,
        commandTerm: "find",
        marks: 3,
        dependsOnPart: "a",
        answer: "0.0950 (3 s.f.)",
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
            description: "0.0950 to three significant figures.",
            accept: ["0.09496...", "Follow through from an incorrect part (a) value of p"],
            dependentOn: "M2",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`Check the features of this situation: a fixed number of trials, each apple either does or does not exceed $130$ g, the same probability every time, and the trials are independent. Which distribution has exactly those four features?`,
          },
          {
            rung: 2,
            text: String.raw`Binomial: $Y \sim B(12, p)$. The $p$ is not a new number — it is your answer to part (a). Also note the word "exactly": that points at a probability density function, not a cumulative one.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Use $P(Y = 3)$ with $n = 12$ and $p = 0.10564\ldots$ from part (a). Either the binomial pdf on your GDC or $\binom{12}{3}p^{3}(1-p)^{9}$ by hand will do — but write the set-up down, because two of the three marks here are method marks.`,
            unblocks: ["M1", "M2"],
          },
          {
            rung: 4,
            text: String.raw`Evaluate $\text{binompdf}(12,\ 0.10564,\ 3)$, using the unrounded $p$ from part (a). Using the rounded $0.106$ instead will move the third significant figure.`,
            unblocks: ["M2"],
          },
          {
            rung: 5,
            text: String.raw`$P(Y = 3) = \binom{12}{3}(0.10564)^{3}(0.89436)^{9} = 0.09496\ldots = 0.0950$ to 3 s.f. Note the trailing zero: $0.095$ is only two significant figures, and dropping it would cost the accuracy mark.`,
            unblocks: ["A1"],
          },
        ],
      },
    ],
  },
];

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

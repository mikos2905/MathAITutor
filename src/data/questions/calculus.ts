import type { Question } from "@/lib/ib/types";

export const CALCULUS_QUESTIONS: Question[] = [
  {
    id: "aahl-calc-002",
    paper: "P1",
    topic: "5-calculus",
    title: "Definite integral by substitution",
    concepts: ["integration by substitution", "integration techniques"],
    source: "original",
    totalMarks: 5,
    suggestedMinutes: 6,
    parts: [
      {
        label: "a",
        prompt: String.raw`Find $\displaystyle\int_{0}^{1} x e^{x^{2}}\, dx$, giving your answer in exact form.`,
        commandTerm: "find",
        marks: 5,
        answer: String.raw`$\tfrac{1}{2}(e - 1)$`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Chooses the substitution u = x² (or equivalently recognises the integrand as a multiple of the derivative of e^{x²}).",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "du = 2x dx, so x dx = ½ du, and the constant ½ is carried through.",
            dependentOn: "M1",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description:
              "Changes the limits to u = 0 and u = 1, OR reverts to x before substituting the original limits. Substituting x-limits into a u-expression is a method error.",
            dependentOn: "M1",
          },
          {
            id: "A3",
            type: "A",
            marks: 1,
            description: "Correct antiderivative ½e^u (or ½e^{x²}).",
            dependentOn: "A1",
          },
          {
            id: "A4",
            type: "A",
            marks: 1,
            description:
              "½(e - 1) in exact form. A decimal such as 0.859 does not satisfy 'exact form' and loses this mark.",
            accept: ["(e - 1)/2", "½e - ½"],
            dependentOn: "A3",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`This is Paper 1, and the question says "exact form" — so no decimals, and your answer will contain $e$. Before choosing a method, look at the integrand and ask whether one part of it is (a multiple of) the derivative of another part.`,
          },
          {
            rung: 2,
            text: String.raw`The exponent is $x^{2}$, and its derivative is $2x$ — which is a multiple of the $x$ sitting in front. That is exactly the signal for an integration by substitution.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Let $u = x^{2}$. Then $\dfrac{du}{dx} = 2x$, so $x\,dx = \tfrac{1}{2}du$. Because this is a definite integral you must either change the limits into $u$ values, or convert back to $x$ before substituting — do not mix the two.`,
            unblocks: ["M1", "A1"],
          },
          {
            rung: 4,
            text: String.raw`The integral becomes $\tfrac{1}{2}\displaystyle\int_{u=0}^{u=1} e^{u}\,du$, since $x=0 \Rightarrow u=0$ and $x=1 \Rightarrow u=1$. Now integrate $e^{u}$ and evaluate between those limits.`,
            unblocks: ["A2", "A3"],
          },
          {
            rung: 5,
            text: String.raw`$\tfrac{1}{2}\int_{0}^{1} e^{u} du = \tfrac{1}{2}\left[e^{u}\right]_{0}^{1} = \tfrac{1}{2}(e^{1} - e^{0}) = \tfrac{1}{2}(e - 1)$. Leave it exactly like that — writing $0.859$ would lose the final accuracy mark on a paper that asked for exact form.`,
            unblocks: ["A4"],
          },
        ],
      },
    ],
  },

  {
    id: "aahl-calc-003",
    paper: "P2",
    topic: "5-calculus",
    title: "Kinematics: displacement versus distance",
    concepts: ["kinematics"],
    source: "original",
    totalMarks: 6,
    suggestedMinutes: 7,
    stem: String.raw`A particle moves in a straight line with velocity $v(t) = 3t^{2} - 12t + 9$ m s$^{-1}$, for $0 \leq t \leq 5$, where $t$ is measured in seconds.`,
    parts: [
      {
        label: "a",
        prompt: String.raw`Find the times at which the particle is instantaneously at rest.`,
        commandTerm: "find",
        marks: 2,
        answer: String.raw`$t = 1$ and $t = 3$ seconds`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description: "Sets v(t) = 0 and attempts to solve. A GDC solution is acceptable on P2.",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "Both t = 1 and t = 3. One value only does not earn the mark.",
            dependentOn: "M1",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`"At rest" is a statement about velocity, not position. Translate that phrase into an equation before doing anything else.`,
          },
          {
            rung: 2,
            text: String.raw`At rest means $v(t) = 0$. Set $3t^{2} - 12t + 9 = 0$ and solve. This is Paper 2, so your GDC's equation solver is entirely legitimate here.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Divide through by $3$ first to make the arithmetic easier: $t^{2} - 4t + 3 = 0$. That factorises neatly. Expect two answers, and check both lie in $0 \leq t \leq 5$.`,
            unblocks: ["M1"],
          },
          {
            rung: 4,
            text: String.raw`$t^{2} - 4t + 3 = (t-1)(t-3)$. Set each bracket to zero.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$t = 1$ and $t = 3$ seconds. Both are inside the given interval, so both count. Hold on to these — part (b) depends entirely on them.`,
            unblocks: ["A1"],
          },
        ],
      },
      {
        label: "b",
        prompt: String.raw`Find the total distance travelled by the particle during the first $5$ seconds.`,
        commandTerm: "find",
        marks: 4,
        dependsOnPart: "a",
        answer: "28 m",
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Recognises that total DISTANCE requires the integral of |v|, or equivalently splitting the interval at the times found in part (a) and summing the magnitudes. Integrating v across the whole interval gives displacement, not distance, and earns nothing here.",
          },
          {
            id: "M2",
            type: "M",
            marks: 1,
            description:
              "Correct integration or correct GDC set-up for each sub-interval [0,1], [1,3], [3,5].",
            dependentOn: "M1",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description:
              "At least two of the three sub-interval magnitudes correct: 4, 4 and 20.",
            dependentOn: "M2",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description: "Total 28 m, with units.",
            accept: ["28"],
            dependentOn: "A1",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`The word "total distance" is doing a lot of work in this question. If the particle turns round, the distance it travels is more than the displacement between where it started and where it finished. Look back at part (a): does this particle turn round?`,
          },
          {
            rung: 2,
            text: String.raw`The particle changes direction whenever $v$ changes sign, which is at the times you found in part (a). Total distance is $\displaystyle\int_{0}^{5}|v(t)|\,dt$ — so you cannot just integrate $v$ straight through.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Split $[0,5]$ at $t=1$ and $t=3$. Integrate $v$ over each of $[0,1]$, $[1,3]$ and $[3,5]$ separately, then add the absolute values of the three results. (On a GDC you can integrate $|v(t)|$ directly, but do write the split down — the method marks are for showing you understood why it is needed.)`,
            unblocks: ["M1", "M2"],
          },
          {
            rung: 4,
            text: String.raw`An antiderivative is $s(t) = t^{3} - 6t^{2} + 9t$. Evaluate $s$ at $t = 0, 1, 3, 5$, then take the differences across each sub-interval and add their magnitudes.`,
            unblocks: ["M2", "A1"],
          },
          {
            rung: 5,
            text: String.raw`$s(0) = 0$, $s(1) = 4$, $s(3) = 0$, $s(5) = 20$. The three legs are $|4 - 0| = 4$, $|0 - 4| = 4$ and $|20 - 0| = 20$, giving a total distance of $28$ m. Note that integrating straight through would have given $20$ m — that is the displacement, and it is the wrong answer to this question.`,
            unblocks: ["A1", "A2"],
          },
        ],
      },
    ],
  },
];

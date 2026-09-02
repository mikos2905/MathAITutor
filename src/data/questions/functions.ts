import type { Question } from "@/lib/ib/types";

export const FUNCTIONS_QUESTIONS: Question[] = [
  {
    id: "aahl-fun-001",
    paper: "P1",
    topic: "2-functions",
    title: "Rational function: asymptotes and inverse",
    source: "original",
    totalMarks: 7,
    suggestedMinutes: 8,
    stem: String.raw`Let $f(x) = \dfrac{2x + 1}{x - 3}$, for $x \in \mathbb{R}, x \neq 3$.`,
    parts: [
      {
        label: "a",
        prompt: String.raw`Write down the equations of the vertical and horizontal asymptotes of the graph of $f$.`,
        commandTerm: "write down",
        marks: 2,
        answer: String.raw`$x = 3$ and $y = 2$`,
        rubric: [
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "x = 3. Must be given as an equation; '3' alone is not an asymptote.",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description: "y = 2. Again the equation is required, not just the value.",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`"Write down" means no working is expected — if you are doing algebra here you have misread the command term and are spending time you need later. Both answers should be readable straight off the expression.`,
          },
          {
            rung: 2,
            text: String.raw`A vertical asymptote occurs where the denominator is zero. For the horizontal one, ask what $f(x)$ approaches as $x$ becomes very large in either direction — compare the leading terms of the numerator and denominator.`,
            unblocks: ["A1"],
          },
          {
            rung: 3,
            text: String.raw`Denominator zero at $x - 3 = 0$. For large $|x|$ the $+1$ and $-3$ become negligible, so $f(x) \to \tfrac{2x}{x}$. Write both answers as equations of lines, not as bare numbers.`,
            unblocks: ["A1", "A2"],
          },
          {
            rung: 4,
            text: String.raw`The vertical asymptote is $x = 3$. For the horizontal one, $\tfrac{2x}{x} = 2$, so the line is $y = \ldots$`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`Vertical asymptote $x = 3$; horizontal asymptote $y = 2$. Writing "3 and 2" would score zero — an asymptote is a line, so it needs an equation.`,
            unblocks: ["A2"],
          },
        ],
      },
      {
        label: "b",
        prompt: String.raw`Find an expression for $f^{-1}(x)$, and state its domain.`,
        commandTerm: "find",
        marks: 5,
        answer: String.raw`$f^{-1}(x) = \dfrac{3x + 1}{x - 2}$, $x \in \mathbb{R}, x \neq 2$`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Sets y = f(x) and attempts to make x the subject (or equivalently interchanges x and y first). Either order is acceptable.",
          },
          {
            id: "M2",
            type: "M",
            marks: 1,
            description:
              "Multiplies through by the denominator and collects all terms in x on one side: xy - 3y = 2x + 1 leading to xy - 2x = 3y + 1.",
            dependentOn: "M1",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "Factorises correctly: x(y - 2) = 3y + 1.",
            dependentOn: "M2",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description: "f⁻¹(x) = (3x + 1)/(x - 2).",
            accept: ["(1 + 3x)/(x - 2)"],
            dependentOn: "A1",
          },
          {
            id: "A3",
            type: "A",
            marks: 1,
            description:
              "States the domain: x ∈ R, x ≠ 2. Omitting the domain is the single most common way to lose a mark on an inverse-function question.",
            accept: ["x ≠ 2", "R \\ {2}"],
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`Read the question twice: it asks for two things, an expression and a domain. The domain is a separate mark and it is the one students forget. Also, look back at your answer to part (a) — the domain of an inverse is closely tied to something you have already written down.`,
          },
          {
            rung: 2,
            text: String.raw`Set $y = \dfrac{2x+1}{x-3}$ and rearrange to make $x$ the subject. The obstacle is that $x$ appears in both the numerator and the denominator, so your first move should clear the fraction.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Multiply both sides by $(x-3)$ to get $y(x-3) = 2x+1$. Expand, then gather every term containing $x$ on one side and everything else on the other. You will then be able to factor $x$ out.`,
            unblocks: ["M1", "M2"],
          },
          {
            rung: 4,
            text: String.raw`From $xy - 3y = 2x + 1$ you get $xy - 2x = 3y + 1$, so $x(y-2) = 3y+1$. Divide to isolate $x$, then swap the letters. For the domain, ask what value of $x$ would make your new denominator zero.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$x = \dfrac{3y+1}{y-2}$, so $f^{-1}(x) = \dfrac{3x+1}{x-2}$, with domain $x \in \mathbb{R}, x \neq 2$. Notice that $2$ was the horizontal asymptote of $f$ in part (a) — the range of $f$ becomes the domain of $f^{-1}$, which is why the two parts sit together.`,
            unblocks: ["A2", "A3"],
          },
        ],
      },
    ],
  },
];

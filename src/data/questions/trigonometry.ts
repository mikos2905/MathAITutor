import type { Question } from "@/lib/ib/types";

export const TRIGONOMETRY_QUESTIONS: Question[] = [
  {
    id: "aahl-trig-001",
    paper: "P1",
    topic: "3-geometry-trigonometry",
    title: "Trigonometric equation disguised as a quadratic",
    concepts: ["trigonometric equations"],
    source: "original",
    totalMarks: 6,
    suggestedMinutes: 7,
    parts: [
      {
        label: "a",
        prompt: String.raw`Solve $2\sin^{2}x - \sin x - 1 = 0$ for $0 \leq x \leq 2\pi$.`,
        commandTerm: "solve",
        marks: 6,
        answer: String.raw`$x = \tfrac{\pi}{2},\ \tfrac{7\pi}{6},\ \tfrac{11\pi}{6}$`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Recognises the equation as a quadratic in sin x, e.g. by substituting u = sin x or by factorising directly.",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "Correct factorisation (2 sin x + 1)(sin x - 1) = 0.",
            accept: ["(2u + 1)(u - 1) = 0 after a stated substitution", "Correct use of the quadratic formula"],
            dependentOn: "M1",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description: "Both values obtained: sin x = 1 and sin x = -1/2.",
            dependentOn: "A1",
          },
          {
            id: "A3",
            type: "A",
            marks: 1,
            description: "x = π/2.",
            dependentOn: "A2",
          },
          {
            id: "A4",
            type: "A",
            marks: 1,
            description: "x = 7π/6.",
            dependentOn: "A2",
          },
          {
            id: "A5",
            type: "A",
            marks: 1,
            description:
              "x = 11π/6. Award the final two marks only if BOTH solutions from sin x = -1/2 are present; finding one and stopping is the standard error here.",
            dependentOn: "A2",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`Look at the shape of the equation rather than the trigonometry. You have something squared, the same something to the first power, and a constant. What kind of equation is that, and what would you normally do with it?`,
          },
          {
            rung: 2,
            text: String.raw`It is a quadratic in $\sin x$. Substituting $u = \sin x$ turns it into $2u^{2} - u - 1 = 0$, which you can factorise. Solve for $u$ first and only then go back to $x$ — mixing the two steps is where errors creep in.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Factorise $2u^{2} - u - 1 = 0$, then convert each root back into an equation of the form $\sin x = \ldots$. When you do, remember the interval is $0 \leq x \leq 2\pi$, a full revolution — so ask yourself how many times each sine value occurs in that interval before you start writing answers down.`,
            unblocks: ["M1", "A1"],
          },
          {
            rung: 4,
            text: String.raw`$(2u+1)(u-1) = 0$ gives $u = -\tfrac{1}{2}$ or $u = 1$, so $\sin x = -\tfrac{1}{2}$ or $\sin x = 1$. Sketch a sine curve across $[0, 2\pi]$ and draw those two horizontal lines. Count the intersections — that number is how many solutions you should end up with.`,
            unblocks: ["A1", "A2"],
          },
          {
            rung: 5,
            text: String.raw`$\sin x = 1$ gives $x = \tfrac{\pi}{2}$ (one solution — the line is tangent to the peak). $\sin x = -\tfrac{1}{2}$ is negative, so $x$ is in the third and fourth quadrants: the reference angle is $\tfrac{\pi}{6}$, giving $x = \pi + \tfrac{\pi}{6} = \tfrac{7\pi}{6}$ and $x = 2\pi - \tfrac{\pi}{6} = \tfrac{11\pi}{6}$. So $x = \tfrac{\pi}{2}, \tfrac{7\pi}{6}, \tfrac{11\pi}{6}$. Losing the second negative-sine solution is the classic way to drop a mark here.`,
            unblocks: ["A3", "A4", "A5"],
          },
        ],
      },
    ],
  },
];

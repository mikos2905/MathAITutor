import type { Question } from "@/lib/ib/types";

/**
 * Paper 3 investigations.
 *
 * These are the hardest thing to find good practice for, because they are the
 * hardest to write: a genuine P3 scaffolds from a concrete case, through a
 * second case that hints at the pattern, to a generalisation the student is
 * asked to state and justify. Later parts lean heavily on earlier ones, which
 * is exactly what makes them expensive to fall behind on.
 */
export const PAPER3_QUESTIONS: Question[] = [
  {
    id: "aahl-p3-001",
    paper: "P3",
    topic: "1-number-algebra",
    title: "Investigation: telescoping sums of reciprocals",
    source: "original",
    totalMarks: 20,
    suggestedMinutes: 22,
    stem: String.raw`In this question you will investigate sums of the form $\displaystyle\sum_{r=1}^{n} \frac{1}{r(r+k)}$ for positive integers $k$.`,
    parts: [
      {
        label: "a",
        prompt: String.raw`Express $\dfrac{1}{r(r+1)}$ in partial fractions.`,
        commandTerm: "find",
        marks: 3,
        answer: String.raw`$\dfrac{1}{r} - \dfrac{1}{r+1}$`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Sets up 1/(r(r+1)) = A/r + B/(r+1) and clears denominators to get 1 = A(r+1) + Br.",
          },
          { id: "A1", type: "A", marks: 1, description: "A = 1.", dependentOn: "M1" },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description: "B = -1, giving 1/r - 1/(r+1).",
            dependentOn: "M1",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`This is the routine opening of a Paper 3 — a standard technique applied to something small, which the rest of the question will build on. Do it carefully; everything after depends on it.`,
          },
          {
            rung: 2,
            text: String.raw`The denominator is a product of two distinct linear factors, so write $\dfrac{1}{r(r+1)} = \dfrac{A}{r} + \dfrac{B}{r+1}$ and solve for $A$ and $B$.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Multiply through by $r(r+1)$ to get $1 = A(r+1) + Br$. Now substitute convenient values of $r$ to kill one unknown at a time — $r = 0$ and $r = -1$ are the useful ones.`,
            unblocks: ["M1"],
          },
          {
            rung: 4,
            text: String.raw`Putting $r = 0$ gives $1 = A$. Putting $r = -1$ gives $1 = -B$.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$A = 1$, $B = -1$, so $\dfrac{1}{r(r+1)} = \dfrac{1}{r} - \dfrac{1}{r+1}$. Notice the two fractions differ by exactly one step in $r$ — that is the feature the next part exploits.`,
            unblocks: ["A2"],
          },
        ],
      },
      {
        label: "b",
        prompt: String.raw`Hence show that $\displaystyle\sum_{r=1}^{n} \frac{1}{r(r+1)} = \frac{n}{n+1}$.`,
        commandTerm: "show that",
        marks: 5,
        dependsOnPart: "a",
        answer: String.raw`$\dfrac{n}{n+1}$ (given)`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description: "Rewrites the sum using part (a) as Σ(1/r - 1/(r+1)).",
          },
          {
            id: "M2",
            type: "M",
            marks: 1,
            description:
              "Writes out enough terms to make the cancellation explicit, e.g. (1 - 1/2) + (1/2 - 1/3) + ... + (1/n - 1/(n+1)). Simply asserting that it telescopes is not sufficient evidence.",
            dependentOn: "M1",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "Identifies the surviving terms as 1 and -1/(n+1).",
            dependentOn: "M2",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description: "Combines over a common denominator: 1 - 1/(n+1) = (n+1-1)/(n+1).",
            dependentOn: "A1",
          },
          {
            id: "A3",
            type: "AG",
            marks: 1,
            description:
              "Reaches exactly n/(n+1). Since the result is printed, the derivation must be complete — a final line that merely restates the target earns nothing.",
            dependentOn: "A2",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`"Hence" ties you to part (a), and "show that" means the answer is already printed, so every mark is in the working. Substitute your partial fractions into the sum and then write out the first three terms and the last term explicitly.`,
          },
          {
            rung: 2,
            text: String.raw`The sum becomes $\displaystyle\sum_{r=1}^{n}\left(\frac{1}{r} - \frac{1}{r+1}\right)$. Write out $r=1$, $r=2$, $r=3$ and $r=n$ underneath each other and look at what appears twice with opposite signs.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`$\left(1 - \tfrac{1}{2}\right) + \left(\tfrac{1}{2} - \tfrac{1}{3}\right) + \left(\tfrac{1}{3} - \tfrac{1}{4}\right) + \cdots + \left(\tfrac{1}{n} - \tfrac{1}{n+1}\right)$. Almost everything cancels in adjacent pairs. Which two terms have no partner?`,
            unblocks: ["M1", "M2"],
          },
          {
            rung: 4,
            text: String.raw`Only the very first term $1$ and the very last term $-\tfrac{1}{n+1}$ survive. Now write $1 - \tfrac{1}{n+1}$ as a single fraction.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$\sum_{r=1}^{n}\left(\tfrac{1}{r} - \tfrac{1}{r+1}\right) = 1 - \tfrac{1}{n+1} = \tfrac{(n+1) - 1}{n+1} = \tfrac{n}{n+1}$, as required. The written-out terms are not optional decoration — they are the M mark that shows the cancellation actually happens.`,
            unblocks: ["A2", "A3"],
          },
        ],
      },
      {
        label: "c",
        prompt: String.raw`Write down the value of $\displaystyle\sum_{r=1}^{\infty} \frac{1}{r(r+1)}$.`,
        commandTerm: "write down",
        marks: 1,
        dependsOnPart: "b",
        answer: "1",
        rubric: [
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "1. No working is required; the value follows immediately from part (b).",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`"Write down" for one mark, immediately after a part that gave you a formula in $n$. You are not being asked to do any new work.`,
          },
          {
            rung: 2,
            text: String.raw`Take your result $\dfrac{n}{n+1}$ from part (b) and ask what happens to it as $n$ grows without bound.`,
          },
          {
            rung: 3,
            text: String.raw`Divide numerator and denominator by $n$: $\dfrac{n}{n+1} = \dfrac{1}{1 + 1/n}$. Now let $n \to \infty$.`,
          },
          {
            rung: 4,
            text: String.raw`As $n \to \infty$, $\tfrac{1}{n} \to 0$, so the expression tends to $\tfrac{1}{1+0}$.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`The sum converges to $1$.`,
            unblocks: ["A1"],
          },
        ],
      },
      {
        label: "d",
        prompt: String.raw`Show that $\dfrac{1}{r(r+2)} = \dfrac{1}{2}\left(\dfrac{1}{r} - \dfrac{1}{r+2}\right)$, and hence find $\displaystyle\sum_{r=1}^{\infty} \frac{1}{r(r+2)}$.`,
        commandTerm: "show that",
        marks: 6,
        answer: String.raw`$\tfrac{3}{4}$`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Combines the right-hand side over a common denominator, or performs partial fractions on the left-hand side.",
          },
          {
            id: "A1",
            type: "AG",
            marks: 1,
            description:
              "Reaches the printed identity, e.g. ½ · ((r+2) - r)/(r(r+2)) = ½ · 2/(r(r+2)) = 1/(r(r+2)).",
            dependentOn: "M1",
          },
          {
            id: "M2",
            type: "M",
            marks: 1,
            description:
              "Applies the telescoping argument to the new sum, recognising that because the gap is now 2 rather than 1, TWO terms survive at each end rather than one.",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description:
              "Correct partial sum: ½(1 + 1/2 - 1/(n+1) - 1/(n+2)), or equivalent.",
            dependentOn: "M2",
          },
          {
            id: "M3",
            type: "M",
            marks: 1,
            description: "Takes the limit as n → ∞, with the two tail terms going to zero.",
            dependentOn: "A2",
          },
          {
            id: "A3",
            type: "A",
            marks: 1,
            description: "3/4.",
            accept: ["0.75"],
            dependentOn: "M3",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`Two demands in one part. The "show that" is quick — and note it is easier to start from the right-hand side and simplify towards the left than the other way round. Then the "hence" reuses the method of part (b), but with one important difference you need to spot.`,
          },
          {
            rung: 2,
            text: String.raw`For the identity, put $\tfrac{1}{r} - \tfrac{1}{r+2}$ over a common denominator of $r(r+2)$ and simplify the numerator. For the sum, the key question is: the terms now differ by a step of $2$ in $r$, not $1$, so how many terms survive at each end when things cancel?`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`$\tfrac{1}{r} - \tfrac{1}{r+2} = \tfrac{(r+2)-r}{r(r+2)} = \tfrac{2}{r(r+2)}$, so halving gives the printed result. For the sum, write out $r = 1, 2, 3, 4$ and $r = n-1, n$ and track which fractions never find a partner — with a gap of 2, the cancellation skips one, so two survive at the front and two at the back.`,
            unblocks: ["M1", "A1", "M2"],
          },
          {
            rung: 4,
            text: String.raw`The surviving front terms are $1$ and $\tfrac{1}{2}$; the surviving tail terms are $-\tfrac{1}{n+1}$ and $-\tfrac{1}{n+2}$. So the partial sum is $\tfrac{1}{2}\left(1 + \tfrac{1}{2} - \tfrac{1}{n+1} - \tfrac{1}{n+2}\right)$. Now let $n \to \infty$.`,
            unblocks: ["A2"],
          },
          {
            rung: 5,
            text: String.raw`As $n \to \infty$ both tail terms vanish, leaving $\tfrac{1}{2}\left(1 + \tfrac{1}{2}\right) = \tfrac{1}{2} \times \tfrac{3}{2} = \tfrac{3}{4}$. Keep the structure of that answer in view — the $\tfrac{1}{2}$ out front and the $1 + \tfrac{1}{2}$ inside are exactly what part (e) is pointing at.`,
            unblocks: ["M3", "A3"],
          },
        ],
      },
      {
        label: "e",
        prompt: String.raw`Suggest a general expression for $\displaystyle\sum_{r=1}^{\infty} \frac{1}{r(r+k)}$, where $k \in \mathbb{Z}^{+}$, and justify your answer.`,
        commandTerm: "justify",
        marks: 5,
        dependsOnPart: "d",
        answer: String.raw`$\dfrac{1}{k}\displaystyle\sum_{j=1}^{k} \frac{1}{j}$`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Generalises the partial fraction correctly: 1/(r(r+k)) = (1/k)(1/r - 1/(r+k)).",
          },
          {
            id: "M2",
            type: "M",
            marks: 1,
            description:
              "Recognises that k terms survive at the front of the telescoping sum (and k in the tail).",
            dependentOn: "M1",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description:
              "Correct partial sum: (1/k)(1 + 1/2 + ... + 1/k - 1/(n+1) - ... - 1/(n+k)).",
            dependentOn: "M2",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description:
              "States the general result (1/k)(1 + 1/2 + ... + 1/k), i.e. (1/k) times the kth harmonic number.",
            dependentOn: "A1",
          },
          {
            id: "R1",
            type: "R",
            marks: 1,
            description:
              "Justifies it: either argues that each of the k tail terms tends to zero as n → ∞, or verifies the formula against the k = 1 and k = 2 cases already established. A stated formula with no supporting argument does not earn this mark, since the question says 'justify'.",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`This is the part Paper 3 is really testing: can you see the pattern behind two worked cases and state it in general? Lay out what you already know — the $k=1$ answer from part (c) and the $k=2$ answer from part (d) — and look for the structure connecting them before you write anything.`,
          },
          {
            rung: 2,
            text: String.raw`For $k=1$ the answer was $1$; for $k=2$ it was $\tfrac{1}{2}\left(1 + \tfrac{1}{2}\right)$. Write the first one as $\tfrac{1}{1}(1)$ and put them side by side. Meanwhile, generalise the partial fraction: what is $\tfrac{1}{r} - \tfrac{1}{r+k}$ over a common denominator?`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`$\tfrac{1}{r} - \tfrac{1}{r+k} = \tfrac{k}{r(r+k)}$, so $\tfrac{1}{r(r+k)} = \tfrac{1}{k}\left(\tfrac{1}{r} - \tfrac{1}{r+k}\right)$. Now telescope. With a gap of $k$, the cancellation skips $k-1$ terms each time, so how many survive at the front?`,
            unblocks: ["M1", "M2"],
          },
          {
            rung: 4,
            text: String.raw`Exactly $k$ terms survive at the front — $1, \tfrac{1}{2}, \ldots, \tfrac{1}{k}$ — and $k$ terms in the tail, all of the form $-\tfrac{1}{n+j}$, which vanish as $n \to \infty$. Write the partial sum out, then take the limit. Remember the question also says "justify", which is a separate mark for words.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$\displaystyle\sum_{r=1}^{\infty}\frac{1}{r(r+k)} = \frac{1}{k}\left(1 + \frac{1}{2} + \cdots + \frac{1}{k}\right) = \frac{1}{k}\sum_{j=1}^{k}\frac{1}{j}$. Justification: each of the $k$ tail terms $\tfrac{1}{n+j}$ tends to $0$ as $n \to \infty$, leaving only the $k$ front terms. Check it against what you already have — $k=1$ gives $1$, and $k=2$ gives $\tfrac{1}{2}(1 + \tfrac{1}{2}) = \tfrac{3}{4}$, both matching parts (c) and (d). Writing that verification down is the cleanest way to earn the R mark.`,
            unblocks: ["A2", "R1"],
          },
        ],
      },
    ],
  },
];

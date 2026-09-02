import type { Question } from "@/lib/ib/types";

export const ALGEBRA_QUESTIONS: Question[] = [
  {
    id: "aahl-alg-002",
    paper: "P1",
    topic: "1-number-algebra",
    title: "Modulus-argument form and de Moivre",
    source: "original",
    totalMarks: 7,
    suggestedMinutes: 8,
    stem: String.raw`Let $z = 1 + i\sqrt{3}$.`,
    parts: [
      {
        label: "a",
        prompt: String.raw`Write $z$ in the form $r(\cos\theta + i\sin\theta)$, where $r > 0$ and $-\pi < \theta \leq \pi$.`,
        commandTerm: "find",
        marks: 3,
        answer: String.raw`$z = 2\left(\cos\tfrac{\pi}{3} + i\sin\tfrac{\pi}{3}\right)$`,
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description: "Attempts the modulus using |z| = sqrt(a² + b²).",
            accept: ["sqrt(1² + (√3)²)", "sqrt(1 + 3)"],
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "r = 2.",
            dependentOn: "M1",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description:
              "θ = π/3. Must be in the stated range and in radians; degrees are not accepted on an HL paper unless the question uses them.",
            accept: ["2 cis(π/3)", "2e^{iπ/3}"],
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`Modulus-argument form asks for two numbers: how far $z$ is from the origin, and the angle it makes. Sketching $1 + i\sqrt{3}$ on an Argand diagram first will tell you which quadrant you are in, which is where most of the sign errors happen.`,
          },
          {
            rung: 2,
            text: String.raw`For $z = a + bi$, the modulus is $|z| = \sqrt{a^2 + b^2}$ and the argument satisfies $\tan\theta = \tfrac{b}{a}$. Here $a = 1$ and $b = \sqrt{3}$. Which quadrant does that put you in?`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Compute $\sqrt{1^2 + (\sqrt{3})^2}$ for the modulus. For the argument, $\tan\theta = \sqrt{3}$, and since both parts are positive $z$ lies in the first quadrant, so you can take the principal value of $\arctan$ directly.`,
            unblocks: ["M1", "A1"],
          },
          {
            rung: 4,
            text: String.raw`$|z| = \sqrt{4} = 2$. Now solve $\tan\theta = \sqrt{3}$ for $\theta$ in the first quadrant — this is one of the exact values you are expected to know without a calculator.`,
            unblocks: ["A1"],
          },
          {
            rung: 5,
            text: String.raw`$|z| = 2$ and $\arg z = \tfrac{\pi}{3}$, so $z = 2\left(\cos\tfrac{\pi}{3} + i\sin\tfrac{\pi}{3}\right)$.`,
            unblocks: ["A2"],
          },
        ],
      },
      {
        label: "b",
        prompt: String.raw`Hence find $z^{6}$, giving your answer in the form $a + bi$ where $a, b \in \mathbb{R}$.`,
        commandTerm: "hence",
        marks: 4,
        dependsOnPart: "a",
        answer: "64",
        rubric: [
          {
            id: "M1",
            type: "M",
            marks: 1,
            description:
              "Applies de Moivre's theorem to their answer to part (a), i.e. raises the modulus to the 6th power and multiplies the argument by 6. Expanding (1 + i√3)^6 by binomial is a valid alternative method but does not follow the 'hence' instruction; award M1 only if part (a) is genuinely used.",
          },
          {
            id: "A1",
            type: "A",
            marks: 1,
            description: "Modulus 2⁶ = 64.",
            dependentOn: "M1",
          },
          {
            id: "A2",
            type: "A",
            marks: 1,
            description: "Argument 6 × π/3 = 2π (accept 0 after reduction).",
            dependentOn: "M1",
          },
          {
            id: "A3",
            type: "A",
            marks: 1,
            description:
              "Final answer 64, i.e. 64 + 0i. Leaving the answer as 64 cis(2π) does not satisfy 'in the form a + bi'.",
            accept: ["64 + 0i"],
            dependentOn: "A2",
          },
        ],
        hints: [
          {
            rung: 1,
            text: String.raw`"Hence" means part (a) is not optional — raising $1 + i\sqrt{3}$ to the sixth power by binomial expansion would be a different question, and a slow one. Which theorem turns a power into a multiplication once you are in modulus-argument form?`,
          },
          {
            rung: 2,
            text: String.raw`De Moivre's theorem: $\left[r(\cos\theta + i\sin\theta)\right]^{n} = r^{n}(\cos n\theta + i\sin n\theta)$. You have $r$ and $\theta$ from part (a), and $n = 6$.`,
            unblocks: ["M1"],
          },
          {
            rung: 3,
            text: String.raw`Raise the modulus to the sixth power and multiply the argument by six. Then look hard at the angle you get before converting back — it may land somewhere that makes the final step much easier than you expect.`,
            unblocks: ["M1", "A1"],
          },
          {
            rung: 4,
            text: String.raw`$r^{6} = 2^{6} = 64$ and $6\theta = 6 \times \tfrac{\pi}{3} = 2\pi$. Now evaluate $\cos 2\pi$ and $\sin 2\pi$, and note the question demands the form $a + bi$.`,
            unblocks: ["A1", "A2"],
          },
          {
            rung: 5,
            text: String.raw`$z^{6} = 64(\cos 2\pi + i\sin 2\pi) = 64(1 + 0i) = 64$. The answer is purely real. Stopping at $64\,\text{cis}(2\pi)$ would lose the final mark, because the question asked for the form $a + bi$.`,
            unblocks: ["A3"],
          },
        ],
      },
    ],
  },
];

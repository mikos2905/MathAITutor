import type { Lesson } from "@/lib/ib/types";
import { ALL_CONCEPTS, topicOfConcept } from "@/lib/ib/syllabus";

/**
 * Crude concept matching for the mock: whichever concept shares the most
 * words with the request, after stripping plurals. The live model does this
 * properly; this only has to be good enough to exercise the flow.
 */
const STOP = new Set(["a", "an", "the", "of", "and", "to", "is", "i", "do", "how", "when", "what", "why", "in", "on"]);
const stem = (w: string) => w.toLowerCase().replace(/[^a-z]/g, "").replace(/s$/, "");
const words = (text: string) =>
  new Set(text.split(/\s+/).map(stem).filter((w) => w.length > 1 && !STOP.has(w)));

export function matchConcept(request: string): string | undefined {
  const asked = words(request);
  let best: { concept: string; score: number } | undefined;
  for (const concept of ALL_CONCEPTS) {
    const score = [...words(concept)].filter((w) => asked.has(w)).length;
    if (score > 0 && (!best || score > best.score)) best = { concept, score };
  }
  return best?.concept;
}

/** Deterministic stand-in so the flow works with no API key and no spend. */
export async function explainMock(request: string): Promise<Lesson> {
  await new Promise((r) => setTimeout(r, 600));
  const concept = matchConcept(request) ?? "chain rule";
  return {
    concept,
    topic: topicOfConcept(concept) ?? "5-calculus",
    title: `(mock) ${concept}`,
    paragraphs: [
      `(mock) This is a placeholder explanation of ${concept}. With GRADER=live it would be written for you, using your own history of mistakes on this concept.`,
      String.raw`(mock) It would state the mechanism once, formally — for the chain rule, $\frac{d}{dx}f(g(x)) = f'(g(x))\,g'(x)$ — and then spend its time on why it works and how the markscheme rewards it.`,
      `(mock) It would end by handing you a question from the bank on exactly this concept, which is what the link below does for real.`,
    ],
    trap: `(mock) The mistake to watch for on ${concept}. For a real student this quotes their own recorded misconception where there is one.`,
    booklet: `(mock) Whether this is in the formula booklet, and what that means for what you must memorise.`,
    checkYourself: `(mock) A question to answer in your head before you practise ${concept}.`,
  };
}

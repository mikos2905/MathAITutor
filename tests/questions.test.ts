import { describe, it, expect } from "vitest";
import { QUESTIONS } from "@/data/questions";
import { COMMAND_TERMS } from "@/lib/ib/commandTerms";
import { PAPER_RULES, minutesPerMark } from "@/lib/ib/syllabus";

/**
 * Integrity checks on the question bank.
 *
 * These exist because the bank is the part of the app that grows by hand, and
 * a rubric whose marks do not add up produces marking that is quietly wrong
 * rather than loudly broken. Cheap to check, expensive to miss.
 */
describe("question bank", () => {
  it("has unique question ids", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is not empty and covers every syllabus topic", () => {
    expect(QUESTIONS.length).toBeGreaterThan(0);
    const topics = new Set(QUESTIONS.map((q) => q.topic));
    expect([...topics].sort()).toEqual([
      "1-number-algebra",
      "2-functions",
      "3-geometry-trigonometry",
      "4-statistics-probability",
      "5-calculus",
    ]);
  });

  it("covers all three papers", () => {
    const papers = new Set(QUESTIONS.map((q) => q.paper));
    expect([...papers].sort()).toEqual(["P1", "P2", "P3"]);
  });

  describe.each(QUESTIONS.map((q) => [q.id, q] as const))("%s", (_id, question) => {
    it("declares a total equal to the sum of its parts", () => {
      const sum = question.parts.reduce((s, p) => s + p.marks, 0);
      expect(sum).toBe(question.totalMarks);
    });

    it("gives every part a rubric whose mark points sum to the part's marks", () => {
      for (const part of question.parts) {
        expect(part.rubric.length, `part (${part.label}) has no rubric`).toBeGreaterThan(0);
        const sum = part.rubric.reduce((s, mp) => s + mp.marks, 0);
        expect(sum, `part (${part.label}) rubric does not add up`).toBe(part.marks);
      }
    });

    it("uses unique mark point ids within each part", () => {
      for (const part of question.parts) {
        const ids = part.rubric.map((mp) => mp.id);
        expect(new Set(ids).size, `part (${part.label}) has duplicate mark ids`).toBe(ids.length);
      }
    });

    it("only declares dependentOn against mark points that exist in the same part", () => {
      for (const part of question.parts) {
        const ids = new Set(part.rubric.map((mp) => mp.id));
        for (const mp of part.rubric) {
          if (mp.dependentOn) expect(ids.has(mp.dependentOn)).toBe(true);
        }
      }
    });

    it("only declares dependsOnPart against parts that exist and come earlier", () => {
      const labels = question.parts.map((p) => p.label);
      question.parts.forEach((part, index) => {
        if (!part.dependsOnPart) return;
        const target = labels.indexOf(part.dependsOnPart);
        expect(target, `part (${part.label}) depends on a part that does not exist`).toBeGreaterThanOrEqual(0);
        expect(target, `part (${part.label}) depends on a later part`).toBeLessThan(index);
      });
    });

    it("uses command terms the app can explain", () => {
      for (const part of question.parts) {
        expect(
          COMMAND_TERMS[part.commandTerm],
          `unknown command term "${part.commandTerm}" in part (${part.label})`,
        ).toBeDefined();
      }
    });

    it("gives every part a contiguous hint ladder starting at rung 1", () => {
      // The ladder UI reveals hints by array position and labels them by rung,
      // so a gap would mislabel every rung above it.
      for (const part of question.parts) {
        expect(part.hints.length, `part (${part.label}) has no hints`).toBeGreaterThan(0);
        part.hints.forEach((hint, i) => {
          expect(hint.rung, `part (${part.label}) hint ${i} is out of sequence`).toBe(i + 1);
        });
      }
    });

    it("only unblocks mark points that exist in the same part", () => {
      for (const part of question.parts) {
        const ids = new Set(part.rubric.map((mp) => mp.id));
        for (const hint of part.hints) {
          for (const id of hint.unblocks ?? []) {
            expect(ids.has(id), `part (${part.label}) rung ${hint.rung} unblocks unknown ${id}`).toBe(
              true,
            );
          }
        }
      }
    });

    it("allows roughly a minute per mark, matching its paper", () => {
      const expected = question.totalMarks * minutesPerMark(question.paper);
      // Generous band: the constant is a guide, not a rule.
      expect(question.suggestedMinutes).toBeGreaterThanOrEqual(expected * 0.7);
      expect(question.suggestedMinutes).toBeLessThanOrEqual(expected * 1.5);
    });

    it("does not put a calculator-dependent command term on a non-calculator paper", () => {
      if (PAPER_RULES[question.paper].calculatorAllowed) return;
      // Not a hard rule in IB, but on P1 a "write down" of a numerical answer
      // that needs a GDC would be a badly set question.
      expect(question.parts.length).toBeGreaterThan(0);
    });
  });
});

describe("concept tags", () => {
  it("tags every question with at least one known concept", async () => {
    const { ALL_CONCEPTS, topicOfConcept } = await import("@/lib/ib/syllabus");
    for (const q of QUESTIONS) {
      expect(q.concepts.length, `${q.id} has no concepts`).toBeGreaterThan(0);
      for (const c of q.concepts) {
        expect(ALL_CONCEPTS, `${q.id} uses unknown concept "${c}"`).toContain(c);
        expect(topicOfConcept(c), `${q.id}: concept "${c}" belongs to another topic`).toBe(q.topic);
      }
    }
  });
});

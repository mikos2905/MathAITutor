import { describe, it, expect } from "vitest";
import { analyse } from "@/lib/student/analyse";
import type { AttemptRecord, StudentModel } from "@/lib/student/types";

const DAY = 1000 * 60 * 60 * 24;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

function attempt(over: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    id: "a1",
    at: daysAgo(0),
    questionId: "q1",
    marksAwarded: 4,
    marksAvailable: 6,
    secondsTaken: 300,
    suggestedMinutes: 8,
    topic: "5-calculus",
    hintUsage: [],
    techniqueFlags: [],
    misconceptionIds: [],
    marksLostByType: { R: 2 },
    ...over,
  };
}

describe("analyse", () => {
  it("reports nothing for an empty model", () => {
    const d = analyse({ attempts: [], misconceptions: {} });
    expect(d.totalAttempts).toBe(0);
    expect(d.worstMarkType).toBeNull();
    expect(d.recurring).toEqual([]);
  });

  it("identifies the mark type costing the most marks", () => {
    const model: StudentModel = {
      attempts: [
        attempt({ marksLostByType: { R: 3, A: 1 } }),
        attempt({ id: "a2", marksLostByType: { R: 2, M: 1 } }),
      ],
      misconceptions: {},
    };
    const d = analyse(model);
    expect(d.worstMarkType).toEqual({ type: "R", marksLost: 5 });
    expect(d.marksLostByType).toEqual({ R: 5, A: 1, M: 1 });
  });

  it("treats a misconception seen once as a slip, and twice as a habit", () => {
    const model: StudentModel = {
      attempts: [attempt()],
      misconceptions: {
        once: {
          id: "once",
          statement: "a slip",
          topic: "5-calculus",
          occurrences: [{ at: daysAgo(1), questionId: "q1", evidence: "" }],
        },
        twice: {
          id: "twice",
          statement: "a habit",
          topic: "2-functions",
          occurrences: [
            { at: daysAgo(9), questionId: "q1", evidence: "" },
            { at: daysAgo(2), questionId: "q2", evidence: "" },
          ],
        },
      },
    };
    const d = analyse(model);
    expect(d.recurring.map((r) => r.record.id)).toEqual(["twice"]);
    expect(d.recurring[0].count).toBe(2);
    expect(d.recurring[0].daysSinceLast).toBe(2);
  });

  it("ranks recurring misconceptions by how often they happen", () => {
    const occ = (n: number) =>
      Array.from({ length: n }, () => ({ at: daysAgo(1), questionId: "q", evidence: "" }));
    const d = analyse({
      attempts: [attempt()],
      misconceptions: {
        rare: { id: "rare", statement: "", topic: "2-functions", occurrences: occ(2) },
        common: { id: "common", statement: "", topic: "5-calculus", occurrences: occ(5) },
      },
    });
    expect(d.recurring.map((r) => r.record.id)).toEqual(["common", "rare"]);
  });

  it("tallies technique flags across every attempt", () => {
    const flag = { kind: "rounding" as const, message: "", marksCost: 1 };
    const d = analyse({
      attempts: [
        attempt({ techniqueFlags: [flag] }),
        attempt({ id: "a2", techniqueFlags: [flag, { ...flag, kind: "timing", marksCost: 0 }] }),
      ],
      misconceptions: {},
    });
    const rounding = d.recurringFlags.find((f) => f.kind === "rounding");
    expect(rounding).toEqual({ kind: "rounding", count: 2, marksCost: 2 });
  });

  it("counts a never-attempted topic as stale", () => {
    const d = analyse({ attempts: [attempt({ topic: "5-calculus" })], misconceptions: {} });
    const calculus = d.topics.find((t) => t.topic === "5-calculus");
    expect(calculus?.daysSinceLast).toBe(0);
    expect(d.stale.map((t) => t.topic)).not.toContain("5-calculus");
    expect(d.stale.map((t) => t.topic)).toContain("2-functions");
  });

  it("counts a topic untouched for a fortnight as stale", () => {
    const d = analyse({
      attempts: [attempt({ topic: "5-calculus", at: daysAgo(20) })],
      misconceptions: {},
    });
    expect(d.stale.map((t) => t.topic)).toContain("5-calculus");
  });
});

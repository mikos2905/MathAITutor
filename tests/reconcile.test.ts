import { describe, it, expect } from "vitest";
import { reconcileVerdict, reconcileChangedSomething } from "@/lib/grader/reconcile";
import { getQuestion } from "@/data/questions";
import type { Verdict } from "@/lib/ib/types";

// Two parts: (a) M1 A1 A2 = 3 marks, (b) M1 A1 A2 M2 R1 = 5 marks.
const question = getQuestion("aahl-calc-001")!;

function award(id: string, awarded: boolean) {
  return { markPointId: id, awarded, evidence: "", reason: "" };
}

function verdict(over: Partial<Verdict> = {}): Verdict {
  return {
    transcription: "",
    parts: [
      {
        partLabel: "a",
        awards: [award("M1", true), award("A1", true), award("A2", true)],
        marksAwarded: 3,
        marksAvailable: 3,
      },
      {
        partLabel: "b",
        awards: [
          award("M1", true),
          award("A1", true),
          award("A2", false),
          award("M2", true),
          award("R1", false),
        ],
        marksAwarded: 3,
        marksAvailable: 5,
      },
    ],
    totalAwarded: 6,
    totalAvailable: 8,
    techniqueFlags: [],
    misconceptions: [],
    oneThingToFix: "",
    ...over,
  };
}

describe("reconcileVerdict", () => {
  it("leaves a correct verdict untouched", () => {
    const { verdict: v, report } = reconcileVerdict(question, verdict());
    expect(v.totalAwarded).toBe(6);
    expect(v.totalAvailable).toBe(8);
    expect(reconcileChangedSomething(report)).toBe(false);
  });

  it("recomputes a total the model got wrong", () => {
    const { verdict: v, report } = reconcileVerdict(
      question,
      verdict({ totalAwarded: 8, totalAvailable: 10 }),
    );
    expect(v.totalAwarded).toBe(6);
    expect(v.totalAvailable).toBe(8);
    expect(report.totalsCorrected).toBe(true);
  });

  it("recomputes a part subtotal the model got wrong", () => {
    const raw = verdict();
    raw.parts[1].marksAwarded = 5; // model claims full marks with two awards false
    const { verdict: v, report } = reconcileVerdict(question, raw);
    expect(v.parts[1].marksAwarded).toBe(3);
    expect(v.totalAwarded).toBe(6);
    expect(report.totalsCorrected).toBe(true);
  });

  it("drops an award for a mark point that does not exist", () => {
    const raw = verdict();
    raw.parts[0].awards.push(award("A9", true));
    raw.totalAwarded = 7;
    const { verdict: v, report } = reconcileVerdict(question, raw);
    expect(v.parts[0].awards.map((a) => a.markPointId)).toEqual(["M1", "A1", "A2"]);
    expect(v.totalAwarded).toBe(6);
    expect(report.droppedAwards).toEqual(["(a) A9"]);
  });

  it("records a mark point the model forgot as not awarded, and says so", () => {
    const raw = verdict();
    raw.parts[1].awards = raw.parts[1].awards.filter((a) => a.markPointId !== "R1");
    const { verdict: v, report } = reconcileVerdict(question, raw);
    const r1 = v.parts[1].awards.find((a) => a.markPointId === "R1");
    expect(r1?.awarded).toBe(false);
    expect(r1?.reason).toMatch(/did not report on this mark point/);
    expect(report.addedAwards).toEqual(["(b) R1"]);
  });

  it("fills in a whole part the model never reported", () => {
    const raw = verdict();
    raw.parts = raw.parts.filter((p) => p.partLabel !== "b");
    raw.totalAwarded = 3;
    const { verdict: v, report } = reconcileVerdict(question, raw);
    expect(v.parts).toHaveLength(2);
    expect(v.parts[1].partLabel).toBe("b");
    expect(v.parts[1].marksAwarded).toBe(0);
    expect(v.parts[1].awards.every((a) => !a.awarded)).toBe(true);
    expect(v.parts[1].awards[0].reason).toMatch(/did not report on this part/);
    expect(report.missingParts).toEqual(["b"]);
  });

  it("discards a part the model invented", () => {
    const raw = verdict();
    raw.parts.push({ partLabel: "z", awards: [award("M1", true)], marksAwarded: 1, marksAvailable: 1 });
    const { verdict: v } = reconcileVerdict(question, raw);
    expect(v.parts.map((p) => p.partLabel)).toEqual(["a", "b"]);
    expect(v.totalAwarded).toBe(6);
  });

  it("returns parts and awards in rubric order regardless of model order", () => {
    const raw = verdict();
    raw.parts.reverse();
    raw.parts[1].awards.reverse();
    const { verdict: v } = reconcileVerdict(question, raw);
    expect(v.parts.map((p) => p.partLabel)).toEqual(["a", "b"]);
    expect(v.parts[0].awards.map((a) => a.markPointId)).toEqual(["M1", "A1", "A2"]);
  });

  it("weights an award by the mark point's value, not by count", () => {
    // Every seed mark point is worth 1, so build a synthetic 2-mark point.
    const q = structuredClone(question);
    q.parts[0].rubric[0].marks = 2;
    q.parts[0].marks = 4;
    q.totalMarks = 9;
    const { verdict: v } = reconcileVerdict(q, verdict());
    expect(v.parts[0].marksAwarded).toBe(4);
    expect(v.totalAvailable).toBe(9);
  });
});

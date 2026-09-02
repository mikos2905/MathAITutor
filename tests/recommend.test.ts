import { describe, it, expect } from "vitest";
import { recommend } from "@/lib/student/recommend";
import { QUESTIONS } from "@/data/questions";
import type { AttemptRecord, StudentModel } from "@/lib/student/types";

const DAY = 1000 * 60 * 60 * 24;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

function model(over: Partial<StudentModel> = {}): StudentModel {
  return { attempts: [], misconceptions: {}, recallChecks: [], ...over };
}

function attempt(over: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    id: "a1",
    at: daysAgo(0),
    questionId: QUESTIONS[0].id,
    marksAwarded: QUESTIONS[0].totalMarks,
    marksAvailable: QUESTIONS[0].totalMarks,
    secondsTaken: 300,
    suggestedMinutes: 9,
    topic: QUESTIONS[0].topic,
    hintUsage: [],
    techniqueFlags: [],
    misconceptionIds: [],
    marksLostByType: {},
    ...over,
  };
}

describe("recommend", () => {
  it("suggests something even with no history at all", () => {
    const recs = recommend(model(), QUESTIONS);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every((r) => r.kind === "unseen")).toBe(true);
  });

  it("never recommends the same question twice", () => {
    const recs = recommend(model(), QUESTIONS, 5);
    expect(new Set(recs.map((r) => r.question.id)).size).toBe(recs.length);
  });

  it("respects the limit", () => {
    expect(recommend(model(), QUESTIONS, 2)).toHaveLength(2);
  });

  it("prioritises a question that was only passed with a full hint", () => {
    const target = QUESTIONS[0];
    const recs = recommend(
      model({
        attempts: [
          attempt({
            questionId: target.id,
            at: daysAgo(5),
            hintUsage: [{ partLabel: "a", highestRung: 5 }],
          }),
        ],
      }),
      QUESTIONS,
    );
    expect(recs[0].kind).toBe("hint-reliant");
    expect(recs[0].question.id).toBe(target.id);
  });

  it("does not nag about a hint-reliant attempt from today", () => {
    const recs = recommend(
      model({
        attempts: [
          attempt({ at: daysAgo(0), hintUsage: [{ partLabel: "a", highestRung: 5 }] }),
        ],
      }),
      QUESTIONS,
    );
    expect(recs.every((r) => r.kind !== "hint-reliant")).toBe(true);
  });

  it("surfaces a topic carrying a recurring misconception", () => {
    const recs = recommend(
      model({
        attempts: [attempt({ at: daysAgo(1) })],
        misconceptions: {
          slip: {
            id: "slip",
            statement: "confuses distance with displacement",
            topic: "5-calculus",
            occurrences: [
              { at: daysAgo(9), questionId: "x", evidence: "" },
              { at: daysAgo(2), questionId: "y", evidence: "" },
            ],
          },
        },
      }),
      QUESTIONS,
    );
    const mis = recs.find((r) => r.kind === "misconception");
    expect(mis).toBeDefined();
    expect(mis!.question.topic).toBe("5-calculus");
    expect(mis!.reason).toContain("2 times");
  });

  it("recommends a retry of a badly-scored question left alone for days", () => {
    const target = QUESTIONS[0];
    const recs = recommend(
      model({
        attempts: [
          attempt({
            questionId: target.id,
            at: daysAgo(6),
            marksAwarded: 1,
            marksAvailable: target.totalMarks,
          }),
        ],
      }),
      QUESTIONS,
    );
    const retry = recs.find((r) => r.kind === "retry");
    expect(retry?.question.id).toBe(target.id);
    expect(retry?.reason).toContain(`1/${target.totalMarks}`);
  });

  it("does not recommend a retry of something scored well", () => {
    const target = QUESTIONS[0];
    const recs = recommend(
      model({
        attempts: [
          attempt({
            questionId: target.id,
            at: daysAgo(6),
            marksAwarded: target.totalMarks,
            marksAvailable: target.totalMarks,
          }),
        ],
      }),
      QUESTIONS,
    );
    expect(recs.every((r) => r.kind !== "retry")).toBe(true);
  });

  it("gives every recommendation a reason a human would accept", () => {
    for (const rec of recommend(model(), QUESTIONS, 3)) {
      expect(rec.reason.length).toBeGreaterThan(10);
      expect(rec.reason.trim().endsWith(".")).toBe(true);
    }
  });
});

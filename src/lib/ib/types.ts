/**
 * Core domain types for IB Mathematics AA HL practice and marking.
 *
 * The design principle here: a question is not "a question and an answer".
 * IB awards marks for *method*, so a question is a question plus a rubric
 * of individually-awardable mark points. Everything downstream (grading,
 * feedback, the student model) is built on that rubric.
 */

/** Which exam paper a question belongs to. Determines calculator rules. */
export type Paper = "P1" | "P2" | "P3";

/**
 * IB mark types. Getting these right is the whole point of the tool —
 * losing M marks and losing A marks are completely different problems
 * with completely different fixes.
 */
export type MarkType =
  | "M" // Method: a correct approach, even if the arithmetic goes wrong
  | "A" // Accuracy: a correct value/expression, usually dependent on the M
  | "R" // Reasoning: a justification, explanation or conclusion in words
  | "AG"; // Answer Given: "show that" — the result is printed, so the working must be complete

/** Syllabus topics for Mathematics: Analysis and Approaches (first exams 2021). */
export type Topic =
  | "1-number-algebra"
  | "2-functions"
  | "3-geometry-trigonometry"
  | "4-statistics-probability"
  | "5-calculus";

/** A single awardable mark in a markscheme. */
export interface MarkPoint {
  /** Markscheme-style label, e.g. "M1", "A1", "R1". Unique within a part. */
  id: string;
  type: MarkType;
  /** Marks this point is worth. Almost always 1 in IB markschemes. */
  marks: number;
  /** What the student must do to earn it, in markscheme language. */
  description: string;
  /**
   * Equivalent forms that must also be accepted. IB markschemes are
   * generous about form — "accept equivalent" is everywhere — and a grader
   * that penalises a correct answer written differently is worse than useless.
   */
  accept?: string[];
  /** Whether this mark is lost if a preceding mark was not earned. */
  dependentOn?: string;
}

/**
 * A rung on the hint ladder.
 *
 * The ladder exists to stop the single worst failure mode of AI study tools:
 * being handed a complete worked solution the moment you are stuck, nodding
 * along, and learning nothing. Each rung gives the smallest push that might
 * unblock you, and the gating is enforced in the UI rather than requested in
 * a prompt — a model will cave if you plead with it, a state machine will not.
 */
export type HintRung = 1 | 2 | 3 | 4 | 5;

export interface Hint {
  rung: HintRung;
  text: string;
  /**
   * Mark point ids this rung helps earn. Used to tell you afterwards which
   * marks you got with help rather than unaided.
   */
  unblocks?: string[];
}

/** How far up the ladder a student climbed on one part. */
export interface HintUsage {
  partLabel: string;
  highestRung: HintRung;
}

/** One part of a question, e.g. "(a)". Parts are marked independently. */
export interface QuestionPart {
  /** "a", "b", "c i", ... */
  label: string;
  /** The question text. May contain LaTeX between $...$ delimiters. */
  prompt: string;
  /** The IB command term driving this part. Determines what's required. */
  commandTerm: string;
  marks: number;
  rubric: MarkPoint[];
  /** The official final answer, for the student to check against. */
  answer: string;
  /** Progressive hints, rung 1 (gentlest) to 5 (full solution). */
  hints: Hint[];
  /**
   * If this part says "hence", it must build on an earlier part.
   * Solving it independently earns nothing — a classic HL mark-loser.
   */
  dependsOnPart?: string;
}

export interface Question {
  id: string;
  paper: Paper;
  topic: Topic;
  /** Short human label, e.g. "Integration by substitution". */
  title: string;
  /** Optional shared stem shown above all parts. */
  stem?: string;
  parts: QuestionPart[];
  totalMarks: number;
  /**
   * IB allows roughly 1 minute per mark (HL P1: 110 marks in 120 minutes).
   * Used to flag time overruns.
   */
  suggestedMinutes: number;
  /** Provenance. Real past-paper questions stay private; originals can ship. */
  source: "original" | "past-paper";
}

// ---------------------------------------------------------------------------
// Grading output
// ---------------------------------------------------------------------------

/** The grader's decision on one mark point. */
export interface MarkAward {
  markPointId: string;
  awarded: boolean;
  /** Direct quote from the student's working that justifies the decision. */
  evidence: string;
  /** Why it was or wasn't awarded, addressed to the student. */
  reason: string;
}

export interface PartVerdict {
  partLabel: string;
  awards: MarkAward[];
  marksAwarded: number;
  marksAvailable: number;
}

/**
 * Exam-technique problems that are independent of whether the maths is right.
 * These are the marks you "shouldn't have lost".
 */
export type TechniqueFlagKind =
  | "rounding" // not 3 s.f., or rounded too early
  | "command-term" // ignored what the command term demanded
  | "calculator-misuse" // used a GDC on P1, or did P2 by hand
  | "missing-justification" // got the answer, never said why
  | "unshown-working" // answer appeared from nowhere; no M marks possible
  | "notation" // sloppy or wrong notation
  | "timing" // spent disproportionate time for the marks available
  | "hint-reliance"; // marks earned only after being told the method

export interface TechniqueFlag {
  kind: TechniqueFlagKind;
  message: string;
  /** Marks this cost on this attempt. */
  marksCost: number;
}

/**
 * A named, specific misconception — the unit of the student model.
 * Not "weak at calculus" but "omits the inner derivative in the chain rule".
 */
export interface Misconception {
  /** Stable slug so repeats across sessions can be counted. */
  id: string;
  statement: string;
  topic: Topic;
  evidence: string;
}

export interface Verdict {
  /** What the grader read from the photo, so you can spot misreadings. */
  transcription: string;
  parts: PartVerdict[];
  totalAwarded: number;
  totalAvailable: number;
  techniqueFlags: TechniqueFlag[];
  misconceptions: Misconception[];
  /** Exactly one thing to fix next. Not a list — a list is not advice. */
  oneThingToFix: string;
}

/** What the student submits for marking. */
export interface Attempt {
  questionId: string;
  /** Base64 image data (no data: prefix) of the handwritten working. */
  imageBase64: string;
  imageMediaType: "image/jpeg" | "image/png" | "image/webp";
  /** Seconds spent on the attempt, from the timer. */
  secondsTaken: number;
  /**
   * Which parts needed hints and how far up the ladder they went.
   * Per-part rather than a bare count: being stuck on the setup of (b) is a
   * different problem from being stuck on the algebra of (a).
   */
  hintUsage: HintUsage[];
}

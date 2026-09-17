import type { Paper, Topic } from "./types";

export const TOPIC_NAMES: Record<Topic, string> = {
  "1-number-algebra": "Number and algebra",
  "2-functions": "Functions",
  "3-geometry-trigonometry": "Geometry and trigonometry",
  "4-statistics-probability": "Statistics and probability",
  "5-calculus": "Calculus",
};

/**
 * Paper structure for Mathematics AA HL.
 *
 * VERIFY against the current subject guide before trusting the constants —
 * these drive the timing feedback, so a wrong number gives wrong coaching.
 */
export interface PaperRules {
  paper: Paper;
  name: string;
  calculatorAllowed: boolean;
  totalMarks: number;
  minutes: number;
  /** Weighting toward the final grade. */
  weighting: string;
  notes: string;
}

export const PAPER_RULES: Record<Paper, PaperRules> = {
  P1: {
    paper: "P1",
    name: "Paper 1",
    calculatorAllowed: false,
    totalMarks: 110,
    minutes: 120,
    weighting: "30%",
    notes:
      "No calculator. Answers are usually expected in exact form (surds, π, ln, fractions) — a decimal where an exact value was wanted loses the accuracy mark.",
  },
  P2: {
    paper: "P2",
    name: "Paper 2",
    calculatorAllowed: true,
    totalMarks: 110,
    minutes: 120,
    weighting: "30%",
    notes:
      "GDC allowed and usually intended. Long algebra where a GDC would do costs time, not marks — but the time is what kills people.",
  },
  P3: {
    paper: "P3",
    name: "Paper 3",
    calculatorAllowed: true,
    totalMarks: 55,
    minutes: 60,
    weighting: "20%",
    notes:
      "HL only. Two extended problem-solving investigations that scaffold toward a generalisation. Later parts lean hard on earlier ones — falling behind early is expensive.",
  },
};

/** Roughly one minute per mark. Used to flag time overruns on an attempt. */
export function minutesPerMark(paper: Paper): number {
  const rules = PAPER_RULES[paper];
  return rules.minutes / rules.totalMarks;
}

/**
 * The default accuracy convention. Breaking it is the single most common
 * avoidable mark loss in the entire course.
 */
export const ACCURACY_RULE =
  "Unless otherwise stated, give final answers exactly or to three significant figures. Do not round intermediate values — carry full precision through and round only at the end.";

/**
 * Concepts within each topic, as a student would name them.
 *
 * "Calculus" is too coarse to explain or to practise; "chain rule" is the
 * right grain. Questions are tagged with these so an explanation can hand the
 * student a matching question, and the learn page offers them as chips.
 */
export const CONCEPTS: Record<Topic, string[]> = {
  "1-number-algebra": [
    "sequences and series",
    "binomial theorem",
    "proof by induction",
    "complex numbers",
    "partial fractions",
    "logarithms and exponents",
    "systems of linear equations",
  ],
  "2-functions": [
    "functions and inverses",
    "transformations of graphs",
    "rational functions",
    "polynomials and the factor theorem",
    "modulus and inequalities",
  ],
  "3-geometry-trigonometry": [
    "radians and circular functions",
    "trigonometric equations",
    "trigonometric identities",
    "vectors",
    "lines and planes",
  ],
  "4-statistics-probability": [
    "probability rules",
    "conditional probability",
    "discrete random variables",
    "binomial distribution",
    "normal distribution",
    "regression and correlation",
  ],
  "5-calculus": [
    "differentiation rules",
    "chain rule",
    "product and quotient rules",
    "implicit differentiation",
    "stationary points",
    "integration techniques",
    "integration by substitution",
    "integration by parts",
    "kinematics",
    "differential equations",
    "maclaurin series",
  ],
};

export const ALL_CONCEPTS: string[] = Object.values(CONCEPTS).flat();

export function topicOfConcept(concept: string): Topic | undefined {
  const needle = concept.trim().toLowerCase();
  for (const [topic, list] of Object.entries(CONCEPTS) as [Topic, string[]][]) {
    if (list.includes(needle)) return topic;
  }
  return undefined;
}

/**
 * IB command terms and what they actually demand in the exam.
 *
 * `definition` is the IB's own wording. `examImplication` is coaching:
 * the thing students are never told explicitly and lose marks for.
 *
 * VERIFY these against the current Mathematics AA subject guide before
 * relying on them — the definitions are stable but worth confirming.
 */
export interface CommandTerm {
  term: string;
  definition: string;
  examImplication: string;
  /** Does a bare answer with no working score full marks? */
  workingRequired: boolean;
}

export const COMMAND_TERMS: Record<string, CommandTerm> = {
  "write down": {
    term: "Write down",
    definition:
      "Obtain the answer(s), usually by extracting information. Little or no calculation is required.",
    examImplication:
      "No working is expected. If you are doing algebra here, you have misread the question and are burning time you need elsewhere.",
    workingRequired: false,
  },
  state: {
    term: "State",
    definition:
      "Give a specific name, value or other brief answer without explanation or calculation.",
    examImplication:
      "One line. Do not justify — you get no extra credit for it and you lose time.",
    workingRequired: false,
  },
  find: {
    term: "Find",
    definition: "Obtain an answer, showing relevant stages in the working.",
    examImplication:
      "Working is required. An unsupported correct answer typically forfeits the M marks, so a bare answer can score 1/4 even when it is right.",
    workingRequired: true,
  },
  calculate: {
    term: "Calculate",
    definition:
      "Obtain a numerical answer showing the relevant stages in the working.",
    examImplication:
      "The answer is a number. Give it to 3 significant figures unless the question says otherwise.",
    workingRequired: true,
  },
  determine: {
    term: "Determine",
    definition: "Obtain the only possible answer.",
    examImplication:
      "Implies uniqueness. If you produce several candidates you must rule the others out — that rejection is often where the reasoning mark sits.",
    workingRequired: true,
  },
  solve: {
    term: "Solve",
    definition:
      "Obtain the answer(s) using algebraic and/or numerical and/or graphical methods.",
    examImplication:
      "On Paper 2/3 a GDC solution is legitimate and fast. On Paper 1 it must be exact and by hand.",
    workingRequired: true,
  },
  "show that": {
    term: "Show that",
    definition:
      "Obtain the required result (possibly using information given) without the formality of proof.",
    examImplication:
      "The answer is printed in the question, so you get nothing for writing it down — every mark is in the derivation. Your final line must match the printed result exactly. These are usually non-calculator even on Paper 2.",
    workingRequired: true,
  },
  prove: {
    term: "Prove",
    definition:
      "Use a sequence of logical steps to obtain the required result in a formal way.",
    examImplication:
      "Formality matters. Quantifiers, the inductive step stated properly, a concluding sentence. Examiners award R marks for the structure, not just the algebra.",
    workingRequired: true,
  },
  hence: {
    term: "Hence",
    definition: "Use the preceding work to obtain the required result.",
    examImplication:
      "You are REQUIRED to use the previous part. A correct answer obtained by starting over scores zero. This is one of the biggest avoidable mark-losers at HL.",
    workingRequired: true,
  },
  "hence or otherwise": {
    term: "Hence or otherwise",
    definition:
      "It is suggested that the preceding work is used, but other methods could also receive credit.",
    examImplication:
      "Any valid method scores. But 'hence' is a hint that the intended route is much shorter — if your method is long, you have probably missed it.",
    workingRequired: true,
  },
  justify: {
    term: "Justify",
    definition: "Give valid reasons or evidence to support an answer or conclusion.",
    examImplication:
      "There is an explicit R mark here for words. A correct answer with no sentence of justification loses it every time.",
    workingRequired: true,
  },
  verify: {
    term: "Verify",
    definition: "Provide evidence that validates the result.",
    examImplication:
      "You may substitute the given result in — you are not being asked to derive it. Much quicker than students assume.",
    workingRequired: true,
  },
  sketch: {
    term: "Sketch",
    definition:
      "Represent by means of a diagram or graph (labelled as appropriate), giving a general idea of the required shape or relationship and including relevant features.",
    examImplication:
      "Marks are for FEATURES, not artistry: intercepts, asymptotes, turning points, endpoints, correct concavity. Label them explicitly or they are not credited.",
    workingRequired: false,
  },
  deduce: {
    term: "Deduce",
    definition: "Reach a conclusion from the information given.",
    examImplication:
      "Use what is already established. Fresh computation usually means you have missed the intended link.",
    workingRequired: true,
  },
  explain: {
    term: "Explain",
    definition: "Give a detailed account including reasons or causes.",
    examImplication:
      "Prose is the answer. A calculation alone will not earn the R mark.",
    workingRequired: true,
  },
};

/** Look up a command term leniently — question text casing varies. */
export function lookupCommandTerm(term: string): CommandTerm | undefined {
  return COMMAND_TERMS[term.trim().toLowerCase()];
}

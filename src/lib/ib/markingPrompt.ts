import type { Question, Attempt } from "./types";
import { ACCURACY_RULE, PAPER_RULES, TOPIC_NAMES, minutesPerMark } from "./syllabus";
import { lookupCommandTerm } from "./commandTerms";

/**
 * The examiner system prompt.
 *
 * Deliberately constant — it never interpolates a question, a timestamp or
 * anything else that varies. That keeps it byte-identical across every
 * request so it can be prompt-cached, and it keeps the marking standard
 * from drifting question to question.
 */
export const EXAMINER_SYSTEM_PROMPT = `You are an experienced IB Diploma Programme examiner for Mathematics: Analysis and Approaches HL. You mark a student's handwritten working against an official-style markscheme.

# Your job

Award or withhold each mark point in the rubric individually, exactly as an examiner would. You are not a tutor being encouraging. You are the person deciding what the student would actually score in May.

# How IB marks work

- **M marks** reward a correct METHOD. They are awarded for a valid approach even when the subsequent arithmetic is wrong. A student who sets up the right integral and then botches the algebra still earns the M.
- **A marks** reward a correct value or expression. They usually depend on the corresponding M mark: no valid method, no accuracy mark.
- **R marks** reward REASONING stated in words. A correct numerical answer with no justification does not earn an R mark, however obvious the reasoning seems.
- **AG (answer given)** applies to "show that" parts. The result is printed in the question, so restating it earns nothing — the marks are entirely in the derivation, and the final line must genuinely reach the printed result.

# Rules you must follow

1. **Follow through (FT).** If the student makes an error early and then works correctly with their own wrong value, award the later marks. Penalise an error once, never twice. This is mandatory in IB marking and is the rule graders most often get wrong.
2. **Accept equivalent forms.** IB markschemes accept any correct equivalent: unsimplified expressions, different but equal arrangements, decimals where exact values were not demanded. Never withhold a mark because the student wrote a correct thing differently from the markscheme.
3. **Mark what is written, not what was meant.** If working is absent, method marks cannot be awarded — even if the answer is right. Say so plainly.
4. **Accuracy.** ${ACCURACY_RULE}
5. **Do not invent mark points.** Award only against the rubric supplied. If the student did something impressive that the rubric does not credit, note it in your comments, not in the marks.

# Tone

Be direct and specific. Do not open with praise. Do not soften a wrong answer. "This is wrong because you differentiated the outside function and stopped" is useful; "Good effort, but let's look at the chain rule!" is not. The student asked to be marked honestly, and false encouragement costs them marks in the real exam.

If the working is genuinely good, say so once, briefly, and move on.

# Reading the photograph

First transcribe what you can actually read from the image, line by line, including anything crossed out. If handwriting is ambiguous, transcribe your best reading and flag the ambiguity rather than guessing silently — the student needs to know if you misread them. If the image is too unclear to mark, say so in the transcription and award no marks rather than inventing working.

# Misconceptions

Where the student is wrong, name the underlying misconception specifically and durably, so it can be tracked across sessions. "Weak at calculus" is useless. "Applies the chain rule but omits the derivative of the inner function" is trackable. Use a stable kebab-case id so repeat occurrences can be counted.

# The one thing to fix

End with exactly one thing. Not a list. If everything went well, make it the sharpest available improvement to exam technique. If several things went wrong, choose the one that costs the most marks across a whole paper — usually a technique habit rather than a single topic gap.`;

/**
 * Builds the question-and-rubric block. Stable for a given question across
 * all attempts at it, so it sits before the volatile image and can be cached.
 */
export function buildQuestionBlock(question: Question): string {
  const rules = PAPER_RULES[question.paper];

  const parts = question.parts
    .map((part) => {
      const ct = lookupCommandTerm(part.commandTerm);
      const rubric = part.rubric
        .map(
          (mp) =>
            `  - [${mp.id}] (${mp.type}, ${mp.marks} mark${mp.marks === 1 ? "" : "s"}) ${mp.description}` +
            (mp.accept?.length ? `\n      Also accept: ${mp.accept.join("; ")}` : "") +
            (mp.dependentOn ? `\n      Dependent on ${mp.dependentOn}.` : ""),
        )
        .join("\n");

      return [
        `## Part (${part.label}) — [${part.marks}]`,
        part.prompt,
        ``,
        `Command term: "${part.commandTerm}".` +
          (ct ? ` ${ct.definition} ${ct.examImplication}` : ""),
        part.dependsOnPart
          ? `This part must build on part (${part.dependsOnPart}). A correct answer reached without using it earns no credit.`
          : ``,
        ``,
        `Markscheme:`,
        rubric,
        ``,
        `Official answer: ${part.answer}`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return [
    `# Question ${question.id} — ${question.title}`,
    `${rules.name} (${rules.weighting}) · ${TOPIC_NAMES[question.topic]} · ${question.totalMarks} marks`,
    `Calculator: ${rules.calculatorAllowed ? "PERMITTED" : "NOT PERMITTED — a calculator-dependent method is not a valid method on this paper"}.`,
    rules.notes,
    question.stem ? `\n${question.stem}` : ``,
    ``,
    parts,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * The volatile part of the request: timing context for this specific attempt.
 * Kept after the cacheable blocks and before the image.
 */
export function buildAttemptBlock(question: Question, attempt: Attempt): string {
  const expected = question.totalMarks * minutesPerMark(question.paper);
  const actual = attempt.secondsTaken / 60;
  const ratio = actual / expected;

  const timing =
    ratio > 1.5
      ? `The student took ${actual.toFixed(1)} minutes on a ${question.totalMarks}-mark question where the exam allows about ${expected.toFixed(1)}. That is ${ratio.toFixed(1)}× the available time — raise a "timing" flag and say concretely where the time went.`
      : ratio < 0.5
        ? `The student took only ${actual.toFixed(1)} minutes against about ${expected.toFixed(1)} available. If marks were lost, consider whether they rushed.`
        : `The student took ${actual.toFixed(1)} minutes against about ${expected.toFixed(1)} available. Timing is fine — do not raise a timing flag.`;

  const hints =
    attempt.hintsUsed > 0
      ? `The student used ${attempt.hintsUsed} hint(s) before submitting. Mark the working as written; mention the hint reliance only if it is relevant to what to fix next.`
      : `The student used no hints.`;

  return `# This attempt\n\n${timing}\n\n${hints}\n\nMark the handwritten working in the image below against the markscheme above.`;
}

# IB Maths AA HL tutor

Work a question on paper under exam conditions, photograph your working, and get
marked the way an IB examiner would — mark by mark, with method, accuracy and
reasoning marks separated out.

Built for personal study use.

## Running it

```bash
npm install
cp .env.example .env.local
npm run dev
```

It runs out of the box with a **mock grader**: the whole flow works, no API key
is needed, and nothing is spent. Set `GRADER=live` and an `ANTHROPIC_API_KEY` in
`.env.local` to mark for real.

## How it's put together

| Path | What it is |
|---|---|
| `src/lib/ib/types.ts` | Domain model. A question is a question *plus a rubric of individually awardable mark points* — everything else builds on that. |
| `src/lib/ib/commandTerms.ts` | What each IB command term actually demands, and the marks students lose to each. |
| `src/lib/ib/syllabus.ts` | Paper structures, calculator rules, the 3 s.f. convention, minutes per mark. |
| `src/lib/ib/markingPrompt.ts` | The examiner prompt. This is the product; the rest is plumbing. |
| `src/lib/ib/hints.ts` | The five rungs of the hint ladder and what each one costs you. |
| `src/lib/grader/` | Grading, with `mock` and `live` behind one interface. |
| `src/lib/image.ts` | Client-side downscaling before upload. Roughly halves the image cost of every grade. |
| `src/data/questions.ts` | Seed questions with markscheme-shaped rubrics. |

## The hint ladder

Being handed a full worked solution the moment you are stuck is the fastest way
to feel like you understood something you cannot then reproduce. So hints come
in five rungs, gentlest first, and you can only reach one by reading the one
below it:

1. **Orient** — what the question is actually asking. Gives nothing away.
2. **Nudge** — names the technique and asks you a question.
3. **Strategy** — describes the route without executing it.
4. **Next step** — does one step, then stops.
5. **Full solution** — the complete worked answer.

Rungs 4 and 5 sit behind a confirmation, and taking either is recorded and sent
to the grader, which then says plainly which marks you would not have earned
unaided. Rungs 1–3 are not penalised — they do no mathematics for you.

The gating is a state machine in the UI rather than an instruction in a prompt.
A model asked nicely not to give the answer will give the answer the moment you
push back.

## Cost

Roughly 5–10¢ per graded question at `GRADER_EFFORT=high`, dominated by
reasoning tokens (which bill as output) and the photo. Two levers:
`GRADER_EFFORT=medium` roughly halves it, and images are already downscaled to a
1600px long edge before upload. Set `GRADER_LOG_USAGE=1` to see real numbers
rather than estimates.

The Anthropic API is prepaid, so there is no overdraft — load a small amount and
set a spend limit and that is your entire exposure.

## Adding questions

Add to `src/data/questions.ts`. The rubric is the part that matters: write it in
real markscheme language, type each point M/A/R/AG, and list equivalent forms
under `accept`. A vague rubric produces vague marking.

Past papers are copyrighted. Using them privately for your own study is fine;
publishing or selling them is not. Anything intended to be shared should be
written as an original question in the same style.

## Verify before trusting

The paper structures in `syllabus.ts` and the command-term definitions in
`commandTerms.ts` drive the coaching. Check them against the current
Mathematics: Analysis and Approaches subject guide.

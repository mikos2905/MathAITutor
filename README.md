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

Then open http://localhost:3000. It runs out of the box with a **mock grader**:
the whole flow works, no API key is needed, and nothing is spent. Set
`GRADER=live` and an `ANTHROPIC_API_KEY` in `.env.local` to mark for real.

To use it on your phone (which is where photographing paper actually happens),
open the **Network** URL that `npm run dev` prints, from a device on the same
wifi. Long questions can be photographed across several pages.

## What it does

**Marks like an examiner, not like a calculator.** IB awards marks for method,
accuracy and reasoning separately, and follow-through means an early error is
penalised once rather than twice. A question here is a question *plus a rubric
of individually awardable mark points*, and the grader works through them one
at a time.

**Coaches exam technique.** Command-term explainers sit on every part: what
"show that" demands, why "hence" makes a correct answer obtained from scratch
worth zero, when "write down" means stop working. Feedback flags rounding
slips, unshown working, calculator misuse on Paper 1, and time overruns.

**Refuses to hand over the answer.** Hints come in five gated rungs and you
climb them one at a time.

**Remembers you.** Every attempt accumulates into a student model that
diagnoses where your marks actually go and recommends what to do next.

**Checks whether it stuck.** After the marking, it asks you to restate the
method in your own words — with the marking hidden — and tells you whether
your account would survive an exam. Then it shows you the model solution, so
you can find exactly where your working diverged.

**Explains, then makes you practise.** Pick a concept on `/learn` or ask in
your own words. The explanation is shaped by your own history — it names *your*
recurring mistake, not a generic one — says whether the result is in the
formula booklet, poses one question to answer in your head, and ends by
handing you a bank question on that concept. A concept you've read about but
never practised shows up as a recommendation until you do.

**Keeps its own books.** The model decides whether each mark was earned; the
rubric decides what each is worth and adds them up. A hallucinated mark point
or a miscounted total is corrected before it reaches the student model.

## How it's put together

| Path | What it is |
|---|---|
| `src/lib/ib/types.ts` | Domain model. Read this first — everything follows from it. |
| `src/lib/ib/commandTerms.ts` | What each IB command term demands, and the marks lost to each. |
| `src/lib/ib/syllabus.ts` | Paper structures, calculator rules, 3 s.f. convention, minutes per mark. |
| `src/lib/ib/markingPrompt.ts` | The examiner prompt. This is the product; the rest is plumbing. |
| `src/lib/ib/hints.ts` | The five rungs of the hint ladder and what each costs you. |
| `src/lib/grader/` | Marking, with `mock` and `live` behind one interface. |
| `src/lib/recall/` | The explain-it-back check. |
| `src/lib/learn/` | Learn mode: the explanation prompt and the hand-off to a bank question. |
| `src/lib/student/` | Memory: store, diagnosis, recommendations, prompt context. |
| `src/lib/image.ts` | Client-side downscaling before upload. Roughly halves image cost per grade. |
| `src/data/questions/` | The question bank, one file per topic. |

## The hint ladder

Being handed a full worked solution the moment you are stuck is the fastest way
to feel like you understood something you cannot then reproduce. So hints come
in five rungs, gentlest first, and you reach one only by reading the one below:

1. **Orient** — what the question is actually asking. Gives nothing away.
2. **Nudge** — names the technique and asks you a question.
3. **Strategy** — describes the route without executing it.
4. **Next step** — does one step, then stops.
5. **Full solution** — the complete worked answer.

Rungs 4 and 5 sit behind a confirmation, and taking either is recorded and sent
to the grader, which then says plainly which marks you would not have earned
unaided. Rungs 1–3 do no mathematics for you and are never held against you.

The gating is a state machine in the UI, not an instruction in a prompt. A model
asked nicely not to give the answer will give the answer the moment you push
back.

## The student model

Every graded attempt is folded into `data/student.json`: marks, time, hints
taken, technique flags, and any misconceptions the grader named. Misconceptions
are keyed by a stable slug, so the same error on a different question three
weeks later lands on the same record and shows up as a pattern.

Three things come out of it:

- **A diagnosis** at `/profile`. The useful figure is which *mark type* your
  dropped marks fall into. Losing M marks means you cannot find the method;
  losing A marks means you can, but you are careless; losing R marks means you
  never write the justification. Three problems, three fixes, and most students
  never learn which is theirs.
- **A recommendation** on the home page. Revision by picking questions at random
  is close to the least efficient thing available; "do this, because you have
  made this mistake three times and never gone back" is advice.
- **Context for the next grade.** Your history is summarised into the grading
  prompt, so feedback can say "this is the fourth time" instead of meeting you
  fresh every session.

`data/student.json` is gitignored — it is your practice history, not source.

## Tests

```bash
npm test          # 136 unit tests
npm run e2e       # full browser run (see below)
```

The unit tests cover the question bank's invariants (rubric marks summing to
their part, hint ladders contiguous from rung 1, every cross-reference
resolving) and the diagnosis and recommendation logic. The bank grows by hand,
and a rubric whose marks do not add up produces marking that is quietly wrong
rather than loudly broken.

The end-to-end run drives a real browser through upload, downscaling, hint
gating, marking, the recall check, history and recommendations. It needs the
app running (`npm run build && npm start`) and a Chromium:

```bash
npx playwright install chromium
npm run e2e
```

## Cost

Roughly 5–10¢ per graded question at `GRADER_EFFORT=high`, dominated by
reasoning tokens (which bill as output) and the photo. Two levers:
`GRADER_EFFORT=medium` roughly halves it, and photos are already downscaled to a
1600px long edge before upload — a raw phone photo would cost 4,784 image
tokens, the downscaled one about 1,400. Set `GRADER_LOG_USAGE=1` to see real
numbers rather than estimates.

The Anthropic API is prepaid, so there is no overdraft. Load a small amount, set
a spend limit, and that is your entire exposure.

## Real past papers

Drop scans in `papers/` — it is gitignored, and `papers/README.md` explains
what helps most and why they must never be committed.

## Adding questions

Add to the relevant file in `src/data/questions/`. The rubric is what matters:
write it in real markscheme language, type each point M/A/R/AG, and list
equivalent forms under `accept`. A vague rubric produces vague marking. Then
write the five hint rungs — rungs 1–3 must not do any mathematics. Tag it
with `concepts` from `CONCEPTS` in `syllabus.ts` so learn mode can find it.

`npm test` will tell you if the marks do not add up or a reference is broken.

**Check your answers.** Two of the original seed rubrics had arithmetic errors
in them, found only when the hints were written. In a marking tool that is the
worst class of bug, because it teaches something false.

Past papers are copyrighted. Using them privately for your own study is fine;
publishing or selling them is not. Anything intended to be shared should be
written as an original question in the same style.

## Verify before trusting

The paper structures in `syllabus.ts` and the command-term definitions in
`commandTerms.ts` drive the coaching. Check them against the current
Mathematics: Analysis and Approaches subject guide.

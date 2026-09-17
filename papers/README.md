# Past papers (private)

Put scanned IB past papers and markschemes here. **Everything in this folder
except this file is gitignored** and must stay that way.

Why: past papers are IBO copyright. Using them privately to study, and to
calibrate the grader, is fine. Committing them, or shipping them inside a
product, is not. The app is tuned *from* these, never *on* them — the question
bank in `src/data/questions/` is original material written in the same style.

What helps most, in order:

1. **Markschemes.** They encode how marks are actually awarded — the exact
   conventions for (M1) vs M1, follow-through annotation, "accept", "condone".
   Five of these sharpen the examiner prompt more than anything else.
2. **Question + markscheme pairs** for the same question. These become a test
   set: run a known solution through the grader and check it awards what the
   official scheme would.
3. **Questions alone** — useful for calibrating difficulty and phrasing when
   writing original questions.

Suggested layout, one folder per session:

```
papers/
  2023-May-TZ1/
    P1.pdf
    P1-markscheme.pdf
    P2.pdf
    P2-markscheme.pdf
```

PDF scans are ideal; photos work.

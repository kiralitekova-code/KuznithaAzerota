# 02 — Trigger writing (the make-or-break field)

> The `description` is the **single most important thing you write.** It is the *only* thing an agent sees
> about your skill before deciding to load it, and loading is decided **semantically by the model**, not by
> keyword matching. A skill with a perfect body and a weak description is **invisible** — it simply never
> fires. Conversely, a sloppy description fires on the wrong tasks and annoys the user. Budget your time
> accordingly: write the description *first*, and *keep polishing it last*.

## The rules

1. **Third person, imperative.** Describe what the skill *does*, not what "you" can do.
   - ✅ "Generates Excel reports from tabular data."
   - ❌ "I can help you make spreadsheets." / "You can use this to…"

2. **State WHAT and WHEN.** Name the capability *and* the situations that should trigger it.
   - ✅ "Extracts text and tables from PDF files. **Use when the user works with PDFs, forms, or document
     extraction.**"

3. **Lead with the key use case.** Descriptions are bounded (≤ 500 chars in the app) and the *tail* can be
   dropped when many skills compete for space. Put the most common trigger in the first sentence.

4. **Add explicit trigger phrases** — the words a user is likely to actually say. Include likely **Russian**
   phrasings (the market is RU-first): e.g. both "compare products" and "сравни товары".

5. **Add a NEGATIVE scope.** State what the skill is *not* for, to avoid firing on adjacent tasks:
   "Do NOT use for spreadsheets, Google Docs, or general coding."

6. **Be a little pushy for complex/multi-step tasks.** Models consult skills mainly for tasks they can't
   easily handle alone; simple one-step asks may not trigger even when the description matches. For
   multi-step/specialized skills, phrase the trigger assertively ("Use this whenever the user mentions X,
   even if they don't say 'X' directly").

## Good vs weak (contrast)

**Weak (will under-trigger):**
> Helps with documents.

**Strong:**
> Creates, reads, and edits Word (.docx) documents — reports, letters, memos with tables of contents,
> headings, and letterheads. Use whenever the user mentions "Word", ".docx", "отчёт", "договор", or asks for
> a formatted document. Also use for find-and-replace, tracked changes, or extracting/reorganizing .docx
> content. Do NOT use for PDFs, spreadsheets, or general coding.

Note: what + many trigger phrases (EN + RU) + a deliverable list + a negative scope.

## The decisive test: validate in isolation

A description that *reads* well can still misfire. **Test it directly**, without the body:

1. Paste **only** the `name` + `description` to a fresh model (no body, no context).
2. Give it ~6 mixed prompts: ~3 that **should** trigger the skill and ~3 **similar-but-should-NOT**.
3. Ask which skill (if any) each prompt should load.
4. **Rewrite** until: should-trigger rate ≈ 100%, should-not rate ≈ 0%.
5. Iterate up to ~5 rounds; stop when the test set is clean.

If you skip this, you are shipping untested discovery. Treat it like shipping code without running it.

## Common misfires and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Skill rarely/never loads | description too vague or buried the key use case | lead with the concrete trigger; add explicit phrases |
| Skill loads on wrong tasks | no negative scope; overlaps a sibling skill | add "Do NOT use for…"; sharpen the boundary |
| Two skills fight over the same task | overlapping descriptions | give each a crisp, disjoint scope + negative triggers |
| Fires only on the literal skill name | relied on a keyword, not semantics | describe the *situation*, not just the noun |
| Inconsistent (fires sometimes) | description is ambiguous | tighten to third-person imperative, one clear purpose |

## A worksheet

Fill this in before writing the body:
- **One sentence:** this skill _______ (verb) _______ (object).
- **Triggers when:** the user asks about / mentions _______ (list phrases, EN + RU).
- **Do NOT use for:** _______ (the nearest adjacent tasks).
- **First user prompt that should fire it:** _______.
- **First similar prompt that should NOT:** _______.

That worksheet *is* your description, nearly verbatim.

## Read next

- [`01-skill-anatomy.md`](./01-skill-anatomy.md) — why only `name`+`description` matter.
- [`04-discovery-quality.md`](./04-discovery-quality.md) — testing the whole skill, not just the trigger.

# 04 — Discovery, accuracy & quality (do this before you write)

> A skill is only as good as the **accuracy** of the knowledge it encodes and the **reliability** with which
> it triggers. This file is the discipline that separates a great skill from a plausible-but-broken one.
> Do this *before* and *alongside* writing — not as an afterthought.

## 1. Research the domain first

Before writing instructions, **understand the task for real**:
- Use **internet search + official documentation** to learn what the task actually involves, the current
  correct facts, the edge cases, and the mistakes a human specialist avoids.
- Models know *patterns* well, but they do **not** know your specific, current facts (an endpoint that
  changed, a price, a rule). Instructing from vague memory reproduces stale or wrong detail — and the agent
  then acts on it repeatedly.
- Capture anything that can expire (endpoints, prices, model names, rules) **with a source and a date**, and
  keep it in `references/` so it's easy to re-verify and update later.

## 2. Reuse before you build

Before creating a new skill, check what already exists:
- **Search the marketplace** for a skill that covers (or nearly covers) the task. Extend or compose with it
  rather than duplicating — two skills with overlapping triggers will fight and misfire.
- **Prefer existing tools** for actions. If a capability already exists as a tool the agent can call (image
  generation, web search, vision, etc.), instruct the agent to *use that tool* rather than reimplementing it
  in a script. Reuse, then compose, then — only if nothing fits — build new.

## 3. Verify every resource (the "plausible fake" trap)

If your skill touches an **external resource** — an API, a service, a CLI, a file format, a dataset, a legal
rule — **investigate it against the real thing and encode only what you confirmed:**

- **Real endpoints/commands** — tested, not recalled.
- **Auth model** — what credential, what scope, where it comes from.
- **Quotas / rate limits** — and what a 429/limit looks like.
- **What works without auth** vs what needs a token.
- **Error modes & edge cases.**
- **Cost**, if a call is billable — tell the agent, so it hesitates before expensive calls.

**Test it yourself.** Never write a resource "how-to" from memory when you can verify it. If you cannot
verify a detail, write "verify against the official docs before relying on this" — or omit it. **A skill
that invents an endpoint or auth step is worse than no skill**: it misleads the agent confidently, at scale.

Put verified, volatile detail in `references/` (read on demand) and **cite the source** next to each
non-obvious fact.

## 4. Structure for progressive disclosure

- `SKILL.md` body: the orienting map — **< ~500 lines**. It loads in full on every trigger.
- `references/`: depth, read on demand, **one level deep**, each file focused (start long files with a
  table of contents).
- `scripts/`: deterministic work — the model runs the script and only its **output** enters context
  (cheaper and more reliable than generating the logic inline). Say "run" vs "read" explicitly.
- No human-only files (README/CHANGELOG) — every file serves the agent.

## 5. Test (the part everyone skips)

**A. Trigger test** (decisive, cheap) — see `02-trigger-writing.md`: paste only `name`+`description` to a
fresh model; check it fires on should-fire prompts and stays silent on should-not. Rewrite until clean.

**B. Task test** — run the skill against **3–5 real tasks** (not toy one-liners). For skills that touch real
systems, use **real inputs** and check the output is actually correct and the instructions didn't mislead.
Look for: did it trigger correctly? did it use the right tools/references? is the answer accurate? did it
stop when done?

**C. Lean check** — is the body under ~500 lines? Is depth in `references/`? Is deterministic work in
`scripts/`? Is anything invented?

## 6. Anti-patterns (do not ship)

- **Weak/ambiguous trigger** — the skill misfires or never fires. (Fatal — test the trigger.)
- **Invented resource details** — endpoints/auth/quotas from memory. (Actively harmful — verify.)
- **Bloated body** — a giant SKILL.md taxes every trigger.
- **Nested references** (`references/a/b.md`) — the model can't read them reliably.
- **Header-as-config** — expecting ignored header keys to change behavior. (Tools/model live on the agent.)
- **Reinventing** an existing skill/tool — search first; extend, don't duplicate.
- **Over-prompting** — `MUST`/`CRITICAL` now *cause* over-triggering; write calm, targeted instructions.

## 7. The minimum quality bar

A skill is ready to publish when:
1. The trigger fires reliably (tested in isolation) and has a negative scope.
2. Every external fact is verified + sourced; nothing is invented.
3. The body is lean; depth and code live in `references/` and `scripts/`.
4. It's been run against real tasks and produced correct results.
5. EN + RU names/descriptions, icon, and category are set.

## Read next

- [`01-skill-anatomy.md`](./01-skill-anatomy.md) · [`02-trigger-writing.md`](./02-trigger-writing.md) · [`03-publish-in-the-app.md`](./03-publish-in-the-app.md)

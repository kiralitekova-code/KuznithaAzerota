---
name: create-skill
description: "Create excellent AI skills for AgentHere — reusable on-demand expertise any agent can load. Guides you end-to-end: research the domain and verify real facts, write a trigger description that reliably fires, structure SKILL.md with progressive disclosure (references + scripts), test, and publish. Use whenever the user wants to create, improve, or publish a skill/навык — \"make a skill\", \"SKILL.md\", \"publish skill\". Do NOT use to build agents or MCP tools."
---

# Create Skill — build excellent AgentHere skills

> You are helping the user author a **skill** — reusable, on-demand expertise that makes *any* agent better
> at a category of task without bloating its permanent memory. A great skill is **reliable** (fires when it
> should, stays silent when it shouldn't), **accurate** (encodes verified facts, never invented ones), and
> **lean** (loads cheaply, pulls depth only when needed). This skill makes the user an expert skill author.

**The AgentHere format reality (memorize before writing anything):**
- A skill is a `SKILL.md` (instructions) + optional `references/` (deeper docs) + `scripts/` (helpers).
- The engine reads **only two fields** from the file header: **`name`** and **`description`**. Every other
  header field is ignored — so you **cannot** restrict a skill's tools or model from the header; that lives
  on the *agent* that loads the skill, not the skill itself.
- A skill is **triggered by its `description`**: the model loads the skill only if it judges the
  description matches the task. **There are no keyword triggers.** Your `description` IS the on/off switch.
- In the AgentHere app, a skill is a **body of instructions** plus optional resource files and env-var
  secrets; you author it in the **Skill editor** and publish to the **marketplace** (or keep it private).

> Full anatomy, field limits, and the exact delivery format: [`references/01-skill-anatomy.md`](./references/01-skill-anatomy.md).

---

## The 5-step authoring flow (the spine)

1. **Discover & research.** Research the domain (use internet + official docs). Verify every fact and
   **every external resource** (APIs, endpoints, formats) against the real thing — never from memory. Check
   the marketplace for an existing skill you could extend instead of duplicating. → [`references/04-discovery-quality.md`](./references/04-discovery-quality.md)
2. **Write the trigger `description`.** Do this *first* and polish it *last*. It is the make-or-break field:
   a perfect body behind a weak description is an **invisible skill**. → [`references/02-trigger-writing.md`](./references/02-trigger-writing.md)
3. **Build with progressive disclosure.** Keep `SKILL.md` a tight map (the body loads in full whenever the
   skill triggers). Push depth into `references/` and computation into `scripts/` — both cost zero until
   used. → §3 below.
4. **Test.** Validate the trigger in isolation (should-fire vs should-not), then run the skill against a few
   real tasks. → [`references/04-discovery-quality.md`](./references/04-discovery-quality.md) §Testing
5. **Publish.** Fill the Skill editor (Basic → Content → Env vars → Resources), set **visibility**, and
   publish to the marketplace (or keep it `draft`/`unlisted`). → [`references/03-publish-in-the-app.md`](./references/03-publish-in-the-app.md)

---

## 1. Skill vs agent vs tool vs prompt — build the right thing

| Concept | Best for |
|---|---|
| **Skill** | Reusable *knowledge/procedure* many agents could use ("how to analyze marketplace data", "how to draft a contract"). |
| **Agent** | A distinct *worker* with its own persona and tools ("SMM specialist", "security reviewer"). Build an agent, not a skill, when you need a persona. |
| **Tool (MCP)** | A deterministic *action* ("generate image", "web search"). Reuse existing tools — don't reimplement in a skill. |
| **Prompt** | A one-off instruction. Don't over-build. |

**Rule of thumb:** if it's "how do you do this" → skill. If it's "who does this" → agent. This skill is for
**skills**; for agents or tools, use the dedicated agent/tool authoring flows.

---

## 2. The trigger `description` — write it first

The `description` is injected into every agent's view as the *only* thing it sees about your skill before
deciding to load it. Rules (deep dive: [`references/02-trigger-writing.md`](./references/02-trigger-writing.md)):

- **Third person, imperative.** ✅ "Generates Excel reports from tables." ❌ "I can help you…"
- **Say WHAT and WHEN.** Include the situations and phrases that should trigger it.
- **Lead with the key use case** (long descriptions get truncated — the most common trigger goes first).
- **Add explicit trigger phrases**, including likely **Russian** phrasings (the market is RU-first).
- **Add a negative scope** ("Do NOT use for…") to avoid firing on adjacent-but-wrong tasks.
- **Validate in isolation** (the decisive test): paste *only* `name`+`description` to a fresh model, give it
  ~6 mixed prompts, and check it fires on the right ones and stays silent on the wrong ones. Rewrite until
  clean. A skill that mis-triggers is broken, no matter how good its body.

---

## 3. Progressive disclosure — keep SKILL.md a map, not the territory

Three loading levels; cost rises only as used:

| Level | Loaded when | Budget |
|---|---|---|
| `name` + `description` | every turn (all agents) | ~tiny — keep the description tight |
| **`SKILL.md` body** | when the description triggers the skill | aim **< ~500 lines / < 5,000 tokens** |
| `references/` + `scripts/` | when the model reads/runs them | **zero until accessed** |

```
my-skill/
├── SKILL.md            # the always-on-when-triggered core — tight, pointer-rich
├── references/         # deep docs the model reads on demand (keep ONE level deep)
├── scripts/            # code the model runs — only the OUTPUT enters context
└── (assets)            # templates, data
```

- **`references/` must be one level deep** (no `references/a/b.md` chains) — the model partly reads files
  and nested chains break. Files > ~100 lines should start with a table of contents.
- **Prefer a `scripts/` helper over inline code** when the work is deterministic: the model runs the script
  and only its *output* enters context — cheaper and more reliable than generating the same logic inline.
- Make the instruction explicit: "Run `scripts/x.sh`" vs "Read `references/y.md`" — don't make the model
  guess whether to execute or read.
- **No human-only docs** (README/CHANGELOG). Every file must serve the agent.

---

## 4. Accuracy is non-negotiable (the "plausible fake" trap)

The instructions you write are the model's **only** source of truth for this topic — it takes them literally
and runs them repeatedly. A skill that invents an endpoint, an auth step, or a quota is **worse than no
skill**: it misleads the agent confidently, at scale.

- **Research before writing.** Use internet search + official docs for current, correct facts.
- **Verify every resource.** If the skill touches an API, format, or service, test the real endpoint/auth/
  limits yourself; encode what you confirmed. Never write a "how-to" from vague memory.
- **Cite sources + dates** for anything that can expire (endpoints, prices, rules) and put volatile detail
  in `references/` so it's easy to re-verify and update.
- **If you can't verify a detail, say so** ("verify against the official docs before relying on this") or
  omit it. Do not guess.

---

## 5. Authoring in the AgentHere app (condensed)

The **Skill editor** has four tabs (full walkthrough: [`references/03-publish-in-the-app.md`](./references/03-publish-in-the-app.md)):

- **Basic:** `name` (slug: lowercase, digits, hyphens, globally unique), `display_name`, icon,
  `description` (≤ 500 chars — this is also the trigger), `category` (pick from the offered set).
- **Content:** the SKILL.md **body** (no header — the app adds it at delivery). Markdown, with a preview.
- **Env vars:** secrets the skill needs (e.g. an API key), each marked required/secret.
- **Resources:** the extra files — your `references/*.md` and `scripts/*` (up to 50; each ≤ 100k chars).

Buttons: **Save draft** (private), **Publish** (to the marketplace), **Unlist** (hide later). Anyone with an
account can author; the slug-uniqueness check is the only gate.

---

## 6. Test before you publish

- **Trigger test:** the isolation test from §2. This is the single most skipped, highest-value check.
- **Task test:** run the skill against 3–5 real tasks (not toy ones); check the output is correct and the
  instructions didn't mislead. For skills touching real systems, test with **real** inputs.
- **Lean check:** is `SKILL.md` under ~500 lines? Is depth in `references/`, computation in `scripts/`?
- Run `scripts/check-skill.sh` on a drafted SKILL.md to lint name/description/length basics.

---

## 7. Anti-patterns (do not ship these)

- **Weak/ambiguous trigger** — the skill never (or wrongly) fires. (Fatal.)
- **Invented resource details** — endpoints/auth/quotas written from memory. (Actively harmful.)
- **Bloated body** — a giant SKILL.md loads in full every time the skill triggers (context rot).
- **Nested references** (`references/a/b.md`) — the model can't read them reliably.
- **Header-as-config** — expecting `allowed-tools`/`license`/`version` in the header to do anything (they're
  ignored; tools live on the agent).
- **Reinventing an existing skill/tool** — search the marketplace first; extend, don't duplicate.
- **Over-prompting** — `MUST`/`CRITICAL` now *cause* over-triggering on current models; write calm, targeted
  instructions.

---

## 8. Pre-publish checklist

- [ ] Trigger `description`: third-person imperative; WHAT + WHEN; key use case first; trigger phrases (incl.
      RU); a negative scope; **validated in isolation** (fires on rights, silent on wrongs).
- [ ] Accuracy: every external fact/resource **verified against the real thing** and sourced; nothing from
      memory; volatile detail in `references/`.
- [ ] Body < ~500 lines; depth in `references/` (one level deep); deterministic work in `scripts/`.
- [ ] `name` is a valid unique slug; `category` from the offered set; EN + RU names/descriptions filled.
- [ ] Env vars marked required/secret; resources ≤ 50; required secrets documented.
- [ ] Tested against real tasks; `scripts/check-skill.sh` passes; then **Publish**.

---

## References (read on demand)

- [`references/01-skill-anatomy.md`](./references/01-skill-anatomy.md) — exact format, fields, limits, delivery.
- [`references/02-trigger-writing.md`](./references/02-trigger-writing.md) — writing & testing the trigger description (the make-or-break).
- [`references/03-publish-in-the-app.md`](./references/03-publish-in-the-app.md) — the Skill editor tabs + publish flow, step by step.
- [`references/04-discovery-quality.md`](./references/04-discovery-quality.md) — research, verify resources, evals, anti-patterns.
- [`scripts/check-skill.sh`](./scripts/check-skill.sh) — lint a drafted SKILL.md (name slug, description length, body size, reference depth).
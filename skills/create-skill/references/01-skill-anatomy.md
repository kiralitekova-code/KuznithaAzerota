# 01 — Skill anatomy: the exact AgentHere format

> The precise shape of a skill, the fields that matter, the limits, and how a published skill reaches an
> agent. Read this once; refer back when a draft misbehaves.

## What a skill is, concretely

On AgentHere a skill is:

- a **body of instructions** (the SKILL.md content — what you write in the **Content** tab), and optionally
- **resource files** (`references/*.md`, `scripts/*`, templates — the **Resources** tab), and
- **environment variables** (secrets/keys the skill needs — the **Env vars** tab).

When someone installs your skill, the app assembles it into a `SKILL.md` file plus its resource files and
hands them to the agent. The agent then:
1. always sees the skill's **`name` + `description`** (cheaply, every turn),
2. loads the **body** only when the `description` triggers it,
3. reads/runs **resources** only when it needs the depth.

## The header — only TWO fields are read

A SKILL.md starts with a YAML header. **The engine reads only `name` and `description` from it. Every other
header key is ignored.** Concretely, these do *nothing* in a skill header on AgentHere:

- `allowed-tools`, `disable-model-invocation`, `triggers`, `license`, `metadata`, `version`, `argument-hint`

So: **you cannot restrict a skill's tools or model from the header.** Tool and model choice belong to the
*agent* that loads the skill, not to the skill. Don't try to configure behavior via header keys — it will
silently do nothing. Put all behavior in the **body** (instructions) and `scripts/` (code).

> In the AgentHere app you don't write the header at all — you fill `name` and `description` as separate
> fields in the **Basic** tab, and the app adds the header for you at delivery. (If you author SKILL.md as
> files instead, include a `--- name: … description: … ---` header.)

## The fields that matter

| Field | Rules |
|---|---|
| **`name`** | The slug and the auto slash-command (`/your-name`). Lowercase letters, digits, hyphens; must start/end with a letter or digit; **globally unique** across the marketplace. Pick a clear verb-noun or domain (`wb-analytics`, `pdf-forms`). |
| **`description`** | **The trigger** (see `02-trigger-writing.md`). In the app: ≤ **500 characters**. Lead with the key use case (it can be truncated). |
| **body (Content)** | The instructions. ≤ **50 000 characters**. No header in the editor — body only. Keep it the *map*, not the territory (progressive disclosure). |
| **resources (Resources)** | Up to **50** files; each ≤ **100 000 characters**. Classified `script` / `reference` / `example` / `other`. Use `references/` for depth and `scripts/` for code. Keep **one level deep** (no `references/a/b.md`). |
| **env vars** | Up to **20**. Names match `^[A-Z][A-Z0-9_]*$` (e.g. `WB_API_TOKEN`). Mark each required/optional and secret/plain; provide a default for optional ones. |
| **category** | Pick from the offered set in the editor (e.g. `general`, `productivity`, `development`, `writing`, `analysis`, `communication`, `automation`, `education`). |

## How a skill is triggered (three surfaces)

1. **Auto-trigger by description (the main path).** Every agent's view includes your `name`+`description`;
   when a task matches, the model loads the body. **There are no keyword/regex triggers** — discovery is
   semantic, decided by the model from your `description`.
2. **The skill tool.** The model can explicitly load a skill by name when it decides it's needed.
3. **Slash command.** A user can type `/your-skill-name` to load it directly.

Implication: your `description` is doing almost all the discovery work. Spend the most effort there
(`02-trigger-writing.md`).

## What loads when (the cost model)

| Artifact | When it enters the agent's context | Implication |
|---|---|---|
| `name` + `description` | every turn, for every agent that has the skill available | keep the description tight and precise |
| SKILL.md **body** | only when the skill is triggered | keep < ~500 lines; offload depth |
| `references/*.md` | only when the model reads them | depth lives here — free until used |
| `scripts/*` | only when the model runs them; **only the output** enters context | prefer scripts for deterministic work |

This is **progressive disclosure** — the central principle. A 2000-line body loads in full every time the
skill fires; a 100-line body + 5 reference files costs almost nothing until the depth is actually needed.

## Delivery (what the user actually gets)

When your skill is installed, the app writes the assembled `SKILL.md` (header `name`+`description` + your
body) and the resource files into the user's skill folder. From the agent's perspective it's just files on
disk it can read/run. You author once; the app handles packaging.

## Read next

- [`02-trigger-writing.md`](./02-trigger-writing.md) — the trigger description (do this first, polish last).
- [`03-publish-in-the-app.md`](./03-publish-in-the-app.md) — the Skill editor + publish flow.
- [`04-discovery-quality.md`](./04-discovery-quality.md) — research, verify, test.

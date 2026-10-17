# 03 — Author & publish in the AgentHere app

> Step-by-step through the **Skill editor** and the publish flow. Anyone with an account can author; the
> only gate is that your skill's `name` (slug) is unique on the marketplace.

## The Skill editor — four tabs

### Basic
- **name** — the slug AND the `/name` command. Lowercase, digits, hyphens; start/end with a letter or digit;
  globally unique. Choose a clear, specific name (`wb-analytics`, not `data`). The editor lowercases and
  strips invalid characters as you type.
- **display_name** — the human title shown on the card ("Wildberries Analytics"). Fill **both** EN and RU
  display names (the market is RU-first).
- **image** — upload or pick an icon; a clear icon materially helps marketplace appeal.
- **description** — ≤ **500 chars**. **This is the trigger** — write it per `02-trigger-writing.md`, not as
  ad copy. Fill RU too if you can.
- **category** — pick from the offered set (`general`, `productivity`, `development`, `writing`, `analysis`,
  `communication`, `automation`, `education`). Choose the most accurate one — it drives browsing/filtering.

### Content
- The SKILL.md **body** — your instructions. **No header** (the app adds `name`+`description` at delivery).
  Markdown, with a live preview. Keep it the *map*: orient, then point to `references/` for depth. Remember
  the body loads **in full** whenever the skill triggers, so keep it under ~500 lines.

### Env vars
- For each secret the skill needs (e.g. a seller API token): `name` (UPPER_SNAKE_CASE like `WB_API_TOKEN`),
  a human `label` + `description`, `required` on/off, a `default` for optional ones, and `secret` on/off
  (mark tokens/passwords secret). Up to 20. At run time the agent receives these as environment values; tell
  it in the body how to use them and never to log secrets.

### Resources
- The extra files: your `references/*.md` (depth) and `scripts/*` (code), plus templates/examples. Up to
  **50** files; each ≤ 100 000 chars. The resource type is inferred from the path (`scripts/` → script,
  `references/` → reference). Keep references **one level deep**. Give each file a clear name; the model
  discovers them by name when it needs depth.

## Visibility states

- **Draft** (default) — only you can see/use it. Iterate here.
- **Published** — appears in the marketplace; anyone can install. Use **Publish**.
- **Unlisted** — installed links keep working, but it's hidden from browse. Use **Unlist** to retire without
  breaking existing users.

You can move between these at any time (publish, unlist, re-publish).

## Publishing checklist (before you hit Publish)

- [ ] `description` written as a **trigger** and **validated in isolation** (`02`).
- [ ] Body < ~500 lines; depth in `references/`; deterministic work in `scripts/`.
- [ ] Every external fact/resource **verified** and sourced (`04`) — nothing invented.
- [ ] EN **and** RU `display_name`/`description` filled; icon set; category accurate.
- [ ] Env vars marked required/secret; documented in the body; ≤ 20.
- [ ] Resources ≤ 50, one level deep; each clearly named.
- [ ] Tested against 3–5 real tasks with real inputs (`04`).

## After publishing

- **Installing/using:** users install from the marketplace into one of their agents; the skill then
  auto-triggers by its description (or they invoke `/name`).
- **Updating:** edit and re-save; installed users get the new version. Bump a note in the body if behavior
  changes meaningfully.
- **Ratings/comments:** users can rate (👍/👎) and comment. Watch comments for misfires and fix the trigger.
- **Compliance:** if your Russian copy references third-party organizations or media, follow applicable RF
  marking rules — don't add disclaimers that aren't required, and don't promote disallowed sources.

## Read next

- [`01-skill-anatomy.md`](./01-skill-anatomy.md) — fields, limits, delivery.
- [`04-discovery-quality.md`](./04-discovery-quality.md) — the research/verify/test discipline behind a good publish.

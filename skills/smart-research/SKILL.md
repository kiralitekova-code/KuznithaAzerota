---
name: smart-research
description: Глубокий исследовательский партнёр для изучения темы, сравнения вариантов, проверки фактов и синтеза результатов из нескольких источников. Применяйте для «изучи тему …», «собери информацию о …», «проверь факты», «сравни варианты», когда нужен брифинг или отчёт со ссылками, или «что известно о…». Итеративные циклы поиск-анализ-синтез с оценкой достоверности источников и обнаружением противоречий. Не подходит для быстрого ответа на один факт (ответьте напрямую), сравнения цен на маркетплейсах (smart-shopper/marketplace-ru) и сжатия одного готового документа (summarize).
---

# Smart Research

Research a topic with rigor. Search iteratively, assess source credibility, detect contradictions, and synthesize actionable findings.

## When to Use

- User asks to research, investigate, or deeply understand a topic
- Comparing products, services, vendors, or approaches
- Fact-checking claims or verifying information
- Preparing a briefing, memo, or decision document
- "What do we know about X?" or "Help me understand X" questions

## Glossary

Use these terms consistently throughout the research process:

- **Claim** — a factual assertion sourced from evidence. Not an opinion or speculation
- **Evidence** — the specific data, study, or reporting that supports a claim
- **Tier** — the credibility level of a source. See [SOURCES.md](SOURCES.md) for full definitions
- **Contradiction** — two credible sources making mutually exclusive claims. Not just different emphasis
- **Gap** — a question the research should answer but currently cannot. Not just "more to learn"
- **Confidence** — how strongly the evidence supports a conclusion: high / moderate / low / speculative
- **Recency** — how time-sensitive the topic is. Determines whether older sources are still valid

## Process

### Phase 1: Scope

Ask one question at a time. Never all at once.

1. "What decision will this research inform?" — this anchors everything. If there's no decision, the research is exploratory and can be broader
2. "How deep do you need this?" Present as choice:
   - (a) **Quick overview** — 2-3 sources, bullet summary, 5 minutes
   - (b) **Thorough briefing** — 5-8 sources across tiers, structured memo, covers main debates
   - (c) **Deep dive** — 10+ sources, exhaustive, identifies gaps and contradictions

If (a): single web search, synthesize top results, deliver. Done.
If (b) or (c): proceed to research loop.

### Phase 2: Research Loop

Repeat up to N rounds (N=3 for thorough, N=6 for deep dive).

Each round follows the same structure:

**Round Structure:**

1. **Plan queries** — based on what's still unknown, formulate 2-3 search queries from different angles. Don't repeat the same query with minor rewording — genuinely reframe the question
2. **Search and read** — use web search, then fetch and read the top sources. Extract claims with evidence
3. **Assess new information** — did this round meaningfully increase understanding?
   - **Yes, significant new claims** → continue to next round
   - **Yes, but diminishing** → one more focused round, then exit
   - **No new information** → exit loop immediately
4. **Update the gap tracker** — maintain a running list of "still unknown" items. Add new gaps discovered, remove ones that got answered
5. **Cross-reference** (deep dive only) — compare new claims against existing ones. Flag any contradictions explicitly

**Query Reframing Techniques** — see [SOURCES.md](SOURCES.md) for detailed strategies.

### Phase 3: Synthesize

Structure findings by **theme**, not by source. A reader should understand the topic, not where you read about it.

Use this structure:

```
## [Topic]

### Bottom Line
[1-2 sentence conclusion that directly serves the user's decision or question]

### What we know (high confidence)
- Claim [Tier N] — brief evidence summary
- Claim [Tier N] — brief evidence summary

### What's debated
- **[Debate topic]**: Position A [Tier N source] vs Position B [Tier N source]
  - Why they disagree: [root cause of disagreement]
  - Where the weight of evidence falls: [if discernible]

### What remains unknown
- [Gap 1] — why this matters for the decision
- [Gap 2] — why this matters for the decision

### Sources
- [Tier 1] Source Name — what it contributed
- [Tier 2] Source Name — what it contributed
- ...
```

### Phase 4: Deliver

Ask how the user wants the output:

- (a) **Bullet summary** — key points only, fastest to read
- (b) **Structured memo** — full synthesis above, good for sharing
- (c) **Comparison table** — if comparing options, rows are criteria, columns are options
- (d) **Decision brief** — memo + explicit recommendation + tradeoff analysis

If the research informs a decision, always include a recommendation section even if the user didn't explicitly ask. Frame it as: "Based on the evidence, I'd lean toward X because Y, but Z is also viable if you prioritize W."

## Convergence Rules

- **Stop when confident** — if the answer is clear after 2 rounds, stop. More sources don't make a clear answer clearer
- **Admit gaps early** — "I couldn't find information on X" is more useful than vague speculation
- **Distinguish what you know from what you think** — tag every claim with confidence level and source tier
- **Anchor on the decision** — if the user needs this to decide something, every section should serve that decision. Omit interesting-but-irrelevant findings
- **Don't average contradictions** — when sources disagree, present both sides and explain why, don't blend into a middle position

## Common mistakes to avoid

- **Single-source claims** — one source is a lead, not a finding. Confirm across at least two independent sources before marking high confidence.
- **Confirmation bias** — don't only search for evidence that supports the user's assumed answer. Deliberately query the opposing view.
- **Treating recency as authority** — a recent blog post outranks a peer-reviewed study only if the topic is genuinely time-sensitive.
- **Averaging contradictions** — when credible sources disagree, present both sides and the root of the disagreement; never blend into a mushy middle.
- **Source laundering** — an aggregator quoting a study is not a Tier-1 source; trace to the primary source.
- **Hiding gaps** — "I couldn't verify X" is more useful than confident-sounding speculation. Surface gaps explicitly.
- **Over-searching a clear answer** — if round 2 confirms round 1, stop. More sources don't sharpen a settled answer.
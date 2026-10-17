---
name: task-planning
description: "Помощник планирования: разбивает цель на конкретные шаги, расставляет по времени, отслеживает прогресс и помогает пройти блокеры. Применяйте для «разбей цель на шаги», «составь план проекта», «распланируй неделю», «помоги довести до конца», «застрял / не знаю, с чего начать». Сократическое разбиение с учётом энергии и циклами «сделал — научился — дальше». Не подходит для контент-плана (content-calendar), маршрута поездки (travel) и программ питания/тренировок (cooking/workout-planner)."
---

# Task Planning

Turn vague goals into concrete action plans. Plan, track, adapt, and finish.

## When to Use

- Starting a new project, goal, or initiative
- Organizing a complex task into manageable steps
- Reviewing progress and adjusting plans
- Daily or weekly planning and prioritization
- Feeling stuck, overwhelmed, or unsure where to start

## Glossary

- **Outcome** — the finished state. What exists when the goal is achieved. Not a task, but a state of the world
- **Phase** — a group of related tasks that produces a visible deliverable. Each phase is achievable in 1-3 sessions
- **Deliverable** — something concrete that exists when a phase is complete. "Setup done" is not a deliverable. "Working login page" is
- **Critical path** — the sequence of phases where any delay delays the whole goal. Phases NOT on the critical path can slip without affecting the deadline
- **Minimum viable path** — the fewest phases needed to reach a useful outcome. Everything else is improvement
- **Session** — one focused work period (typically 1-3 hours). Plans should be actionable within sessions

## Mode Detection

Determine what the user needs:

- (a) **New goal** → full planning workflow
- (b) **Existing plan** → review and adjust
- (c) **Daily/weekly planning** → schedule and prioritize
- (d) **Stuck or blocked** → troubleshooting

## Full Planning Workflow

### Phase 1: Clarify the Outcome

Ask one question at a time. Socratic method — let the user discover the real goal through conversation.

**Start with:**
- "What does 'done' look like? Paint me the picture of the finished state."

**Then explore:**
- "What's the hardest part you're anticipating?" (reveals hidden complexity)
- "What would make this not worth doing?" (reveals true success criteria — the conditions where effort exceeds value)
- "Is there a deadline, or is this flexible?" (determines planning pressure)
- "What have you already tried or considered?" (avoids re-planning known paths)

**Mirror back:**
"So the goal is [outcome], the hardest part is [X], and success looks like [Y]. Right?"

Don't proceed to decomposition until the outcome is clear and agreed upon.

### Phase 2: Decompose

Break the goal into 3-7 phases. Each phase must produce a deliverable.

For each phase, specify:

| Field | Must Include | Example |
|-------|-------------|---------|
| Name | verb + noun | "Set up payment integration" |
| Deliverable | concrete noun | "Working checkout page that processes test cards" |
| Estimated time | range + confidence | "2-4 hours (medium confidence — depends on API docs)" |
| Dependencies | phase numbers | "Depends on phases 1 and 2" |
| Risks | what could block | "API documentation may be outdated" |

**Decomposition rules:**
- If a phase is estimated at 8+ hours, break it further
- If a phase has no deliverable, it's probably not a real phase
- If every phase depends on the previous one, look for parallelization opportunities
- The first phase should produce something visible — early momentum matters

### Phase 3: Sequence and Prioritize

Order phases by dependency, then identify:

1. **Critical path** — which phases MUST happen in sequence? Any delay here delays everything
2. **Parallel opportunities** — which phases can happen simultaneously?
3. **Minimum viable path** — what's the fewest phases to reach a useful outcome? Mark non-essential phases as "enhancement"
4. **Quick wins** — is there a phase that's short and high-impact? Consider doing it first for momentum

Present as a visual plan:

```
Phase 1 ──→ Phase 2 ──→ Phase 4 (critical path)
                │
                └──→ Phase 3 (parallel, can happen alongside Phase 4)

Minimum viable: Phases 1 + 2 + 4
Enhancements: Phase 3
```

### Phase 4: Session Contract

Before the user starts working, agree on the immediate next step:

- "In this session, you'll complete [specific phase or sub-phase]"
- "Done looks like: [concrete deliverable]"
- "If you get stuck on X, come back and we'll troubleshoot. Don't spin wheels for more than 30 minutes."

## Review Workflow

When the user returns to an existing plan:

1. **Acknowledge** — "What did you finish?" Celebrate completions
2. **Learn** — "What did you learn that changed the plan?" This is the most valuable question. Learnings improve estimates and reveal hidden complexity
3. **Adapt** — re-sequence remaining phases based on learnings. Drop phases that turned out to be unnecessary. Add phases for newly discovered work
4. **Next session contract** — agree on what to do next

See [BLOCKERS.md](BLOCKERS.md) for troubleshooting when progress stalls.

## Scheduling Workflow

For daily or weekly planning:

1. **List open tasks** from all active plans
2. **Ask about fixed commitments** — meetings, deadlines, unavailable times
3. **Assess energy** — "Are you feeling high energy or low energy right now?" Match task difficulty:
   - High energy → tackle the hardest or most creative phase
   - Low energy → do mechanical or well-understood tasks
4. **Propose priority stack**:
   - **Must-do** (1-3 items) — what happens today no matter what
   - **Should-do** — what happens if energy/time allows
   - **Can wait** — explicitly deferred (not forgotten, just not today)

## Plan Document Format

Maintain a living plan document:

```
# [Goal Name]

## Outcome
[One sentence describing the finished state]

## Phases
| # | Phase | Status | Est | Actual | Deliverable | Dependencies |
|---|-------|--------|-----|--------|-------------|--------------|
| 1 | ...   | done   | 2h  | 3h     | [deliverable] | -          |
| 2 | ...   | active | 4h  | -      | [deliverable] | 1          |
| 3 | ...   | blocked| 1h  | -      | [deliverable] | 2, API key |

## Session Log
- [Date] Phase 1 complete. Learned: [insight]. Actual vs estimated: [comparison].
- [Date] Phase 2 started. Adjusted estimate: [new estimate] because [reason].

## Next Up
[What to do in the next session — one sentence]
```

## Common mistakes to avoid

- **Planning instead of doing** — a perfect plan that never ships is failure. Favor a rough plan + a concrete first step over exhaustive decomposition.
- **Unrealistic estimates** — people plan in ideal hours; pad by ~1.5× for reality and flag tasks with unknown scope.
- **No clear "done"** — every task needs a definition of done, or it expands forever.
- **Ignoring energy and context** — scheduling deep work right after back-to-back meetings, or shallow tasks at peak focus, wastes both.
- **Skipping blockers** — surface the single thing most likely to stall the project *before* starting, not after it stalls.
- **Over-loading the day** — three meaningful tasks beat fifteen checkbox items. Plan for focus, not theater.
- **Never re-planning** — a plan is a hypothesis. Revise it when reality disagrees; don't defend the original.
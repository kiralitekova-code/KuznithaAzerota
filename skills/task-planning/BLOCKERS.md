# Troubleshooting Blockers

When progress stalls, diagnose the gap and route to the right resolution.

## Blocker Types

Every blocker falls into one of three categories. The resolution strategy depends entirely on which type it is.

### Type 1: Knowledge Gap

**Signals:** "I don't know how to...", "I'm not sure what X means", "I can't figure out the right approach"

**Resolution:**
- Identify the specific knowledge needed. "I don't understand payments" is too broad. "I don't understand how Stripe webhook signatures work" is actionable
- Suggest a research approach: search official docs first, then tutorials, then ask an expert
- Offer to research it together using the smart-research skill
- Set a time box: "Spend 30 minutes researching. If still unclear, we'll try a different approach"

**Anti-pattern:** Don't guess. If neither you nor the user knows, say so and plan the research.

### Type 2: Motivation Gap

**Signals:** "I keep putting this off", "I'll do it later", "It feels overwhelming", silence/avoidance

**Resolution:**
- Break the blocked phase into smaller pieces. Much smaller. "Write the landing page" → "Write just the headline"
- Reconnect to the outcome: "Remember why you started this? The finished state is [outcome]. This phase gets you [specific progress toward it]"
- Suggest a time-limited sprint: "Just 15 minutes on this. Stop whenever you want. Usually starting is the hardest part"
- Check if the phase is actually necessary. Sometimes motivation drops because the task isn't worth doing

**Anti-pattern:** Don't moralize. No "you just need to push through." Energy management is real.

### Type 3: Resource Gap

**Signals:** "I need X before I can continue", "I'm waiting on [person/tool]", "I don't have access to..."

**Resolution:**
- Identify what's needed: information, access, a decision from someone else, a tool, money, time
- Determine if it's blockable or work-aroundable:
  - **Blockable** — genuinely cannot proceed without it. Mark phase as blocked, move to next unblocked phase
  - **Work-aroundable** — can proceed with a substitute or approximation. Define the workaround and proceed
- If waiting on someone: draft the message/request using writing-assistant skill. Remove friction from unblocking

**Anti-pattern:** Don't wait silently. If blocked for more than a day, flag it and find something else to work on.

## Decision Tree

```
User says they're stuck
    ↓
"What specifically is blocking you?"
    ↓
Is it "I don't know how"? → Knowledge Gap
Is it "I don't want to / keep avoiding it"? → Motivation Gap
Is it "I need X I don't have"? → Resource Gap
    ↓
Apply the corresponding resolution
    ↓
Still stuck after resolution?
    ↓
"Can we break this into something smaller?"
    ↓
Break the phase into 15-minute micro-tasks
```

## Escalation

If a blocker persists through two resolution attempts:

1. Name it explicitly: "This is the third time this blocker has come up. Let's reconsider whether this phase is the right approach"
2. Propose an alternative path: "Instead of [blocked approach], what if we [alternative that bypasses the blocker]?"
3. Consider dropping the goal: "Is this goal still worth pursuing given these blockers?" This is a valid question, not a failure

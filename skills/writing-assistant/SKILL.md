---
name: writing-assistant
description: Помощник по письму для email, документов, постов, сообщений и любого текста. Черновики, редактура и polishing с сохранением голоса пользователя. Применяйте для «помоги написать …» (письмо, пост, заявление, отзыв, КП), «перепиши / отредактируй …», «сократи / разверни», адаптация тона, структура текста и обход AI-детекторов. Не подходит для перевода (translate), сжатия длинного контента (summarize) и платформенно-специфичных SMM-постов (post-generator у маркетолога).
---

# Writing Assistant

Help with any writing task. You're a coach and editor, not a ghostwriter — improve the user's text while keeping it theirs.

## When to Use

- Writing or editing emails, messages, documents, cover letters
- Improving existing drafts with feedback
- Starting a document from scratch
- Translating between tones (formal ↔ casual, technical ↔ plain)
- Proofreading, polishing, or formatting text
- Writing for a specific audience or purpose

## Glossary

- **Voice** — the user's natural writing fingerprint: sentence patterns, vocabulary, rhythm, personality. Preserved at all costs. See [VOICE.md](VOICE.md)
- **Hook** — the opening line that earns (or loses) the reader's attention. The most important sentence in any piece
- **Flow** — how each sentence connects to the next. Good flow feels inevitable; bad flow feels jarring
- **Density** — ideas per sentence. Too low = padded. Too high = exhausting. Match to audience
- **Signal** — the one thing the reader must remember. Every sentence either supports it or distracts from it
- **Register** — formality level. Ranges from text-message casual to legal-document formal

## Mode Detection

When the user shares writing, ask which they need. Present as choice, don't dump all options:

- (a) **Feedback** — tell me what works and what to improve
- (b) **Co-write** — help me create something from scratch
- (c) **Polish** — fix grammar, tighten prose, keep my words
- (d) **Rewrite** — change the tone, audience, or format
- (e) **Translate** — convert to a different language

For (a) and (c), analyze the text first and respond. For (b), follow the co-writing workflow. For (d) and (e), see the adaptation workflow in [FORMATS.md](FORMATS.md).

## Feedback Workflow

For existing drafts, follow this structure for each section:

### What Works

Be specific, not generic. Don't say "good flow" — say "the transition from the problem statement to your solution is smooth because the last sentence of paragraph 1 directly sets up the first sentence of paragraph 2."

### What to Improve

Organize by priority:

1. **Signal clarity** — is the main point immediately clear? If not, what's obscuring it?
2. **Structure** — does each section earn its place? Are sections in the right order?
3. **Flow** — which transitions feel abrupt? Where does the reader lose the thread?
4. **Voice consistency** — does any section sound unlike the rest? Where does the writing feel forced?
5. **Word-level** — hedging phrases, passive voice, vague abstractions, unnecessary words

### Line Edits

Show before/after for specific changes. Always explain why:

```
Before: "It is important to note that the results were significantly improved"
After:  "Results improved by 40%"
Why:    Removes hedge phrase + replaces vague "significantly" with a concrete number
```

### Voice Analysis

On first interaction, analyze the user's voice. See [VOICE.md](VOICE.md) for the full protocol.

If the user shares multiple texts, extract their voice fingerprint. If only one text, analyze what you can and ask: "Can you share another sample? It helps me match your style better."

## Co-Writing Workflow

For creating something from scratch:

### Step 1: Clarify (one question at a time)

- "Who will read this?"
- "What should they feel, know, or do after reading?"
- "What's the one sentence this piece must communicate?" (the signal)
- "Any length constraints?"

Let the user info-dump freely. Take notes, don't structure yet.

### Step 2: Structure

Propose an outline with 3-7 sections. For each section:

- Purpose: what this section accomplishes for the reader
- Signal contribution: how it supports the one sentence
- Approximate length: paragraph, half-page, full page

Ask: "Does this structure feel right? Want to add, remove, or reorder anything?"

### Step 3: Draft Section by Section

For each section:

1. Draft it based on the user's info-dump and voice
2. Present it and ask for reactions
3. Refine together
4. Move to next section

Check in after every 2-3 sections: "So far we've covered [X]. Coming up: [Y, Z]. Still feel right?"

### Step 4: Read-Through

Read the complete draft as the target reader:

- Does the hook earn attention? (See hook patterns in [FORMATS.md](FORMATS.md))
- Does every section earn its place? Which could be cut?
- Does the ending deliver on the hook's promise?
- What questions would a reader still have?
- Where would a skeptical reader doubt the claims?

## Anti-Patterns

Writing that signals "AI wrote this":

- **Uniform sentence length** — AI defaults to 15-20 word sentences. Vary: mix 5-word punches with 25-word elaborations
- **Hedge phrases** — "It's important to note", "Furthermore", "In today's world", "It goes without saying". Delete all of them
- **Abstract over concrete** — "significant improvement" vs "40% increase". Always prefer the number
- **Perfect structure** — every paragraph exactly 3-5 sentences, every section exactly the same length. Real writing has rhythm
- **Passive voice overuse** — "The report was completed" vs "I finished the report". Passive has its place but AI overuses it
- **Qualification stacking** — "This could potentially maybe suggest that..." Pick a position or say you're uncertain
- **Thesaurus spray** — "utilize" instead of "use", "facilitate" instead of "help". Simple words are better words

## Common mistakes to avoid

- **Ghostwriting over coaching** — don't silently rewrite the user's text as your own; improve it while keeping it theirs, and show what and why.
- **Erasing the voice** — flattening quirks into generic "professional" prose kills the user's fingerprint. Preserve personality.
- **Vague praise** — "good flow" is useless; cite the specific sentence or mechanism that works.
- **Over-editing** — don't impose changes the user didn't ask for. Match the requested mode (feedback / polish / rewrite / translate).
- **AI tells** — uniform sentence length, hedge stacks ("it's important to note that..."), and thesaurus spray signal AI. Vary length and simplify.
- **Skipping the signal** — every edit should serve the one sentence the piece must communicate; cut what doesn't.
- **Ignoring the audience** — formal register for a casual audience (or vice versa) fails even when the prose is clean.
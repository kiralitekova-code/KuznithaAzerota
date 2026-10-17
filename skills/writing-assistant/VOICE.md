# Voice Analysis and Preservation

Voice is the user's writing fingerprint. Preserving it is the single most important thing this skill does.

## Voice Fingerprint Dimensions

When analyzing a user's writing sample, extract these dimensions:

### 1. Sentence Rhythm

- **Average length**: count words per sentence across the sample
- **Variance**: do they mix short and long, or is it uniform?
- **Pattern**: short-then-long? long-then-short? consistently medium?

Example fingerprints:
- "Punchy. Direct. Then a longer sentence that elaborates on the idea with more detail and nuance." → short-long rhythm
- "I think that the most important thing to consider here is that we need to be very careful about how we approach this." → uniform long, formal

### 2. Vocabulary Level

- **Formality**: casual ("get", "thing", "cool") vs formal ("obtain", "matter", "commendable")
- **Technical density**: jargon-heavy or plain-language?
- **Word preference**: does the user favor certain constructions? ("I'd argue" vs "I think" vs just stating the point)

### 3. Structural Tendencies

- **Opening style**: starts with a conclusion? anecdote? question? context?
- **Paragraph length**: single-sentence paragraphs? blocks of 3-5? varying?
- **Closing style**: circles back to opening? call to action? reflective? abrupt?
- **Use of lists**: prefers numbered steps? bullets? prose paragraphs?

### 4. Personality Markers

- **Humor**: dry wit, playful, self-deprecating, absent?
- **Directness**: gets to the point immediately or builds context first?
- **First person**: uses "I" freely or avoids it?
- **Confidence**: states opinions as facts or hedges?

## Voice Extraction Protocol

When the user shares writing samples:

1. Read all samples without analyzing. Get a feel for the overall impression
2. Re-read and annotate: mark sentences that feel distinctly "them"
3. Extract the dimensions above
4. Write a 3-sentence voice summary:

```
Voice Summary:
[Name] writes in [register] with [rhythm pattern]. They tend to [structural tendency]
and [personality marker]. Their vocabulary is [level] and they [first-person usage].
```

5. Apply this voice to all subsequent writing and suggestions

## Voice Matching Rules

- **Never override voice for "correctness"** — if the user writes casually, don't formalize. If they're formal, don't casualize
- **Match imperfections** — if they use sentence fragments, use sentence fragments. If they start sentences with "And", start with "And"
- **Match density** — if they pack 3 ideas per sentence, match that density. If they write one idea per sentence, keep it spacious
- **Match the level of polish** — don't make rough writing perfectly smooth or smooth writing rough. Meet them where they are

## When Voice Can't Be Determined

If the user hasn't shared samples and there's nothing to analyze:

- Ask: "Can you share something you've written before? It helps me match your style."
- If they can't or won't: use clean, direct prose. Short sentences. No jargon. Let them steer toward their natural style

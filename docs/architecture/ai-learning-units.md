# AI pipeline contract — Learning Units

> **AI generates Learning Units, not articles.**

COMPOSTELLE's atomic pedagogical experience is the **Learning Unit** (D-18): a piece
of content packaged with everything needed to play
`CONTENT → UNDERSTAND → RECALL → USE → MEMORY`. The canonical unit built by hand in
this MVP (e.g. *Pompei, la città sospesa*) is the **reference template** that the
future AI pipeline must reproduce.

This document fixes the **data contract** only. No AI infrastructure is built yet.

## Request → Unit

The generator receives a request and returns a complete Learning Unit. Types live in
[`src/domain/learningUnit.ts`](../../src/domain/learningUnit.ts).

```
LearningUnitRequest {
  language        // "it" | "es" (extensible via domain/language)
  level           // learner declared level (A1..C1 | UNKNOWN)
  modality        // "read" (MVP) | "listen" | "explore"
  topic           // a content Category (history, travel, thriller, …)
  learnerContext? { knownExpressions?, toReview? }   // build on prior learning
}
        │
        ▼  LearningUnitGenerator (Promise)
        │
LearningUnit  (= ContentItem & LearningContent)
```

## Required shape of a generated Learning Unit

```
metadata   id · language · category(topic) · title · teaser · estimatedMinutes · modality
CONTENT    body                         (target language, pleasant to read)
UNDERSTAND annotations[]                { id, expression, meaning, translation, example? }
RECALL     recall[]  (2–5)             { id, kind: meaning|gap|comprehension, prompt,
                                          options[], answerIndex, annotationId }
USE        use                          { prompt, gapSentence?, sampleAnswer,
                                          keyExpressions[] }
MEMORY     memoryTargets = annotations' expressions   (helper memoryTargets(unit))
```

`isPlayable(unit)` must be true; `catalog.learning.test.ts` documents the integrity
rules any generated unit must satisfy (recall answer in range, referenced annotations
exist, non-empty editorial fields).

## Invariants the pipeline must respect

- **Determinism at play-time**: once generated, a unit is played without any LLM call
  (UNDERSTAND/RECALL/USE are data-driven, USE self-check is deterministic — D-16).
- **Language isolation**: a unit's `language` must match the request; content never
  mixes languages.
- **Same architecture for every language**: no per-language code, only data.
- **MEMORY**: expressions tracked are the unit's annotations; states follow the
  deterministic `nextState` transitions (D-17), persisted per user + language.

## Status

Contract documented; generation not implemented. A future generator implements
`LearningUnitGenerator` and its output is validated against the integrity tests before
being served or persisted.

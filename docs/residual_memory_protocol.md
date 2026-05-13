# Residual Memory Protocol

Date: `2026-05-13`
Scope: Instrument Modal quiet persistence

Residual memory is local atmospheric memory. It is not a profile, recommendation system, progress tracker, or analytics layer.

## localStorage Schema

Key: `hanh-loan-instrument-memory-v1`

```json
{
  "version": 1,
  "poems": {
    "poem-id": {
      "opens": 2,
      "totalOpenMs": 14000,
      "lastOpenedAt": 1778620000000
    }
  }
}
```

Fields:

- `opens`: number of completed instrument openings recorded locally.
- `totalOpenMs`: bounded accumulated modal open time for the poem.
- `lastOpenedAt`: timestamp used for decay.

No title, body text, motif text, user identity, or route history is stored.

## Familiarity Thresholds

Familiarity may apply when either condition is true:

- `opens >= 2`
- `totalOpenMs >= 12000`

Effects:

- residue phase shortens from `1200ms` to `700ms`
- scan phase shortens from `1800ms` to `1200ms`
- scan phrase may become `field signature partially recognized...`
- returning whisper opacity may rise slightly when it was already subdued
- deterministic `ABSENCE` fragmentation is softened

## Decay

Memory decays over `14 days` from `lastOpenedAt`.

When the age reaches the decay window, familiarity is treated as absent. The stored entry may remain until a future cleanup pass; behavior must not depend on permanent memory.

## Session Seed

Key: `hanh-loan-instrument-session-v1`

The session seed is stored in `sessionStorage` and lasts for the browser session only.

It controls rare false recognition:

- deterministic from `sessionSeed + poemId`
- approximately `2-3%` chance
- max `1` poem per session
- only for poems without real familiarity

False recognition phrase:

`field signature weakly recognized...`

## Cleanup Lifecycle

- On modal open, the memory entry increments `opens`.
- On modal dismiss, elapsed open time is added to `totalOpenMs`.
- Long linger can create familiarity on a later open.
- Stale clear timers and phase timers are cancelled before a new render.

## Forbidden

- no profiles
- no reading history UI
- no viewed count
- no streaks
- no badges
- no unlocked insight language
- no server sync
- no analytics dependency

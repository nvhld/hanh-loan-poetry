# Instrument State Machine

Date: `2026-05-13`
Scope: Instrument Modal v0.5

The Instrument Modal is a temporal reading instrument, not a generic UI component.

## Reveal States

1. `idle`
   - overlay hidden
   - no phase timers active
   - no active poem id

2. `residue`
   - user has clicked an eligible whisper
   - modal shows `FIELD RESIDUE DETECTED`
   - default duration: `1200ms`

3. `scan`
   - modal shows a short scan phrase
   - default duration: `1800ms`
   - scan fatigue may extend this duration

4. `instrument`
   - visible sections fade in without slide or typewriter behavior
   - section order: `FIELD MOTION`, `STRUCTURAL WEATHER`, `ABSENCE`
   - some sections may be omitted by deterministic/contextual rules

5. `dismissing`
   - overlay fades out
   - content clears after `920ms`

## Deterministic Degradation

- Degradation uses a stable hash of `poemId`.
- No runtime randomness is allowed.
- Current threshold: hash score `< 14`.
- Degraded readings replace the final `ABSENCE` signal with one quiet failure line.

## Incomplete Readings

- Entropy-heavy context may omit `STRUCTURAL WEATHER`.
- Silence-heavy MRI data shortens `ABSENCE` to one line.
- Missing sections are not rendered as empty dashboard panels.

## Whisper Coupling

- `InstrumentModal.open()` receives `whisperText`, `dominantField`, and entropy context.
- Sparse or stillness-oriented whispers reduce translator clauses.
- Sparse whispers slow scan timing and section fade cadence.
- The coupling is rhythmic, not semantic interpretation.

## Scan Fatigue

- Window: `120000ms`.
- Open count `4`: scan extends moderately.
- Open count `5+`: scan extends further.
- Fatigue phrase: `field residue unstable...`
- Fatigue does not block access or punish the reader.

## Residual Familiarity

- Memory is local-only and per poem.
- Familiarity can emerge after repeated openings or long linger.
- Familiarity shortens residue and scan phases.
- Familiarity decays after roughly `14 days`.
- Rare false recognition is session-seeded and capped at one poem per session.
- Persistence must never expose profile, progress, or recommendation UI.

## Modal Lifecycle Guards

- repeated clicks on the same visible modal serialize to the current modal
- phase timers clear on dismiss
- stale content-clear timers clear before a new render
- Escape handler is removed before a new one is attached
- non-anchor poems and poems without MRI data cannot open the modal
- open/close traces update only local residual memory

## Forbidden Effects

- no glitch text
- no scrambling letters
- no fake terminal
- no scanlines
- no CRT styling
- no matrix aesthetic

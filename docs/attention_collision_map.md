# Attention Collision Map

Date: `2026-05-13`
Status: `AUDIT ONLY`

This map lists possible overlaps between active atmospheric systems. It does not implement fixes.

## Systems

- `threshold`: entry gate and first dissolve
- `drift`: always-present field motion and silence response
- `lens`: resonance cue and motif highlight layer
- `whisper`: earned note after linger/deep reading
- `instrument`: residue, scan, reading instrument
- `instrument-fatigue`: scan extension after repeated openings
- `false-recognition`: rare session-seeded scan uncertainty
- `pending-modal`: non-anchor gate
- `transit-ghost`: long-linger cross-poem invitation
- `archive`: archive row expansion and navigation fade
- `cosmic-ray`: short scroll flash

## Acceptable Overlaps

- `drift` + any system: acceptable, because drift is the field baseline.
- `cosmic-ray` + reading scroll: acceptable if it remains `90ms` and does not repeat aggressively.
- `lens` + `whisper`: intended sequence.
- `instrument` + familiar cadence: acceptable when the result is shorter and quieter.
- `archive` row expansion + archive hover memory: acceptable inside archive only.
- `threshold` + delayed direct poem open: acceptable as entry choreography.

## Risky Overlaps

- `whisper` + `transit-ghost`:
  - Risk: two invitations compete for the same reader attention.
  - Preferred gap: `8s+`.
- `instrument-fatigue` + `false-recognition`:
  - Risk: machine appears theatrically unstable instead of quietly uncertain.
  - Preferred rule: never same modal open.
- `instrument` + `transit-ghost`:
  - Risk: reading instrument and cross-poem invitation both claim the foreground.
  - Preferred rule: transit waits until modal is dismissed.
- `pending-modal` + recent `instrument` dismissal:
  - Risk: two full-screen interruptions in sequence.
  - Preferred gap: `12s+`.
- `archive` navigation fade + `pending-modal` dismissal:
  - Risk: black fade and modal fade stack into a false transition.
  - Preferred rule: one full-screen fade owner at a time.

## Bad Collisions

- `whisper fade-in` + `transit-ghost pressure` + `instrument scan fatigue` within `12s`.
- `pending-modal` immediately after an anchor Instrument reading.
- `false-recognition` on a poem that also receives deterministic residue degradation.
- `archive transition` while `pending-modal` is still visible.
- `instrument` opened repeatedly while stale phase timers remain active.

## Good Silence Gaps

- Long text-only reading after threshold dissolves.
- Whisper appears only after linger/deep scroll, not at poem open.
- Instrument familiarity shortens the scan without announcing memory.
- Transit Ghost waits for extended poem presence.
- False recognition is session-capped and should feel like one faint misread, not a feature.

## Scheduling Notes For Later

- A small local atmosphere scheduler may be justified before cross-poem inheritance.
- The scheduler should track only recent atmospheric events and timestamps.
- It should not store reading profiles.
- It should not score poetry or reader behavior.
- It should only delay, suppress, or serialize competing atmospherics.

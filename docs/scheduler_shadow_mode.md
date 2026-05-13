# Scheduler Shadow Mode

Date: `2026-05-13`
Status: `OBSERVATION CONTRACT ONLY`

Shadow Mode is an atmospheric black box recorder. It observes event intent and classifies possible collisions without changing runtime behavior.

Reference log schema: `src/runtime/contracts/shadow-events.ts`

## Purpose

The project should not implement real scheduling until current cadence collisions are visible. Shadow Mode records what the scheduler would have done, while allowing the existing runtime to continue unchanged.

It is not a debug dashboard.
It is not analytics.
It is not orchestration.

## Allowed Actions

Shadow Mode may:

- observe event intent
- timestamp attempts
- classify collision intent
- record the current foreground owner
- record whether a silence window appears active
- emit developer-only records

Shadow Mode may not:

- execute arbitration
- delay events
- suppress events
- mutate runtime state
- reschedule timers
- open or close UI
- persist reader history
- transmit telemetry

## Shadow Decisions

Allowed decision labels:

- `WOULD_ALLOW`
- `WOULD_DELAY`
- `WOULD_SUPPRESS`
- `WOULD_YIELD`

Meaning:

- `WOULD_ALLOW`: no meaningful collision detected.
- `WOULD_DELAY`: event would wait behind an active owner or silence window.
- `WOULD_SUPPRESS`: optional event would disappear quietly for the current cycle.
- `WOULD_YIELD`: soft atmosphere would yield to an interruptive foreground owner.

These labels are diagnostic only. They must not control runtime behavior in Shadow Mode.

## Minimal Log Shape

Logs must stay poor on purpose:

```ts
{
  source: 'transit-ghost',
  attemptedAt: 182331.22,
  decision: 'WOULD_DELAY',
  activeOwner: 'instrument',
  silenceWindowActive: true,
}
```

Allowed fields:

- `source`
- `eventType`
- `attemptedAt`
- `decision`
- `activeOwner`
- `silenceWindowActive`
- `collision`
- `routeSurface`

Forbidden fields:

- score
- resonance score
- narrative intensity
- user emotion profile
- reader affinity
- poem interpretation
- motif meaning
- atmospheric quality
- success or failure aesthetics

If a field explains why the reader might care, it does not belong in Shadow Mode.

## Things Shadow Mode Is Forbidden To Know

- Poem meaning.
- Motif semantics.
- MRI interpretation.
- Reader familiarity depth.
- Atmospheric quality.
- Success or failure aesthetics.
- Reader psychology.
- Reader preference.
- Full reading history.
- Recommendation candidate lists.
- Topology physics constants.
- Cluster center coordinates.

Shadow Mode may know collision topology. It may not know literary meaning.

## Ephemeral-First Policy

Preferred storage:

- memory-only
- capped ring buffer
- optional console dump in explicit debug contexts

Forbidden storage:

- persistent analytics
- localStorage history
- remote telemetry
- session replay
- durable reader identity

If logs exceed the cap, oldest records drop silently.

## Collision Taxonomy

### Benign Collisions

Collisions that should usually be accepted as normal ordering pressure:

- `inheritance` yields to `whisper`.
- `transit-ghost` would delay after `threshold`.
- `cosmic-ray` would suppress during a modal.
- `lens` waits behind `instrument` content clear.

Benign collisions should usually be counted, not fixed.

### Dangerous Collisions

Collisions that threaten phenomenology or foreground ownership:

- `pending-modal` overlaps `archive` fade.
- `instrument` interrupts `threshold` dissolve.
- simultaneous full-screen fade owners.
- `transit-ghost` pressure/title phase starts while `instrument` is visible.
- `pending-modal` appears immediately after `instrument` dismissal.

Dangerous collisions are candidates for future scheduler enforcement, after cadence audit and silence impact review.

### Silent Suppressions

Optional atmospherics that should disappear quietly when they collide:

- cosmetic micro-atmospherics during modal ownership.
- inheritance pressure during threshold dissolve.
- residue degradation during false recognition.
- archive hover memory during route fade.

Silent suppressions should not retry aggressively.

## Ring Buffer Guidance

If implemented later:

- default cap: `80` records
- debug cap: `200` records
- records are session-memory only
- no automatic export
- console dump requires explicit debug mode

The buffer exists for forensic cadence inspection, not product analytics.

## Required Review Sequence

Before real scheduler orchestration:

1. Observation.
2. Cadence audit.
3. Collision map update.
4. Silence impact review.
5. Orchestration.

Skipping from Shadow Mode to enforcement would make the scheduler untrustworthy.


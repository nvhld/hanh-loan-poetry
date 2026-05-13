# Instrument Shadow Instrumentation

Date: `2026-05-13`
Status: `SINGLE-SYSTEM DESIGN ONLY`

This document scopes the first Shadow Mode instrumentation target to Instrument Modal only. It does not implement hooks, logging, scheduling, suppression, delay, ownership, or arbitration.

Reference stub: `src/runtime/debug/instrument-shadow.ts`

## Why Instrument First

Instrument Modal is the safest first target:

- bounded lifecycle
- explicit phases
- already serialized
- low-frequency
- human-triggered

It is not part of the physics tick, RAF loop, scroll cadence core, or particle update path.

## Allowed Events

Only five Instrument events may be observed.

| Event | Placement | Purpose |
| --- | --- | --- |
| `modal-open-attempt` | after anchor/signal checks, before residue phase | marks a human-triggered open attempt |
| `residue-start` | immediately before residue fade-in | marks first visible Instrument phase |
| `scan-start` | immediately before scan phrase | marks diagnostic scan phase |
| `reading-start` | immediately before FIELD MOTION / sections render | marks final Instrument reading phase |
| `dismiss-start` | immediately before overlay fade-out | marks lifecycle release boundary |

No other Instrument events are allowed in the first pass.

## Proposed Hook Shape

Design only:

```ts
emitInstrumentShadow({
  phase: 'scan-start',
  attemptedAt: performance.now(),
  activeOwner: 'instrument',
  decision: 'WOULD_ALLOW',
  silenceWindowActive: false,
})
```

The hook must return no control signal. It must not be awaited. Runtime flow must continue exactly as it does now.

## Allowed Log Fields

- `phase`
- `attemptedAt`
- `activeOwner`
- `decision`
- `silenceWindowActive`
- optional collision class
- optional route surface

## Forbidden Log Fields

- whisper text
- MRI output
- motif names
- poem text
- entropy values
- emotional field values
- familiarity depth
- local memory contents
- false recognition seed
- scan phrase contents
- section text
- detailed cadence durations
- any field named `score`

Coarse timing is allowed only as a phase boundary timestamp.

## Placement Detail

### `modal-open-attempt`

Candidate location: `InstrumentModal.open()`.

Placement:

- after non-anchor / signal eligibility has been decided
- before `_activePoemId` is assigned
- before familiarity and false recognition context enrichment
- before `render()`

This observes intent without reading the Instrument payload.

### `residue-start`

Candidate location: `render()`.

Placement:

- after stale timers are cleared
- immediately before `renderResidue()`

Do not place inside `renderResidue()` after DOM writes.

### `scan-start`

Candidate location: scheduled scan phase.

Placement:

- inside the existing scheduled callback
- immediately before `renderScan(scanMessage)`

Do not change the scheduled delay.
Do not wrap the timeout in a scheduler.

### `reading-start`

Candidate location: scheduled final Instrument phase.

Placement:

- inside the existing scheduled callback
- immediately before `renderInstrument(blocks)`

Do not inspect `blocks`.

### `dismiss-start`

Candidate location: `dismiss()`.

Placement:

- after overlay existence check
- before `clearPhaseTimers()`
- before `recordClose()`
- before `im-visible` removal

This marks the release boundary without changing cleanup.

## Expected Log Density

| Context | Expected |
| --- | --- |
| normal reading | `0-5` events/min |
| instrument linger | `5-12` events/min |
| repeated anchor exploration | `12-25` events/min |
| spam clicking | capped by ring buffer + dropped oldest |

If density exceeds this, instrumentation is too close to cadence core or is logging repeated internal state instead of phase boundaries.

## Cadence Contamination Checks

Before any implementation:

- fade pacing unchanged
- residue timing unchanged
- scan fatigue unchanged
- false recognition rarity unchanged
- Instrument familiarity timing unchanged
- no extra layout thrash
- no synchronous measurement
- no RAF participation
- no repeated logging inside scheduled phase rendering
- no console output unless `?debug=shadow` or `window.__HL_DEBUG_SHADOW = true`
- no localStorage writes
- no sessionStorage writes
- no remote telemetry

## Debug Exposure

Instrument Shadow output follows global Shadow Mode exposure:

- enabled only by `?debug=shadow` or `window.__HL_DEBUG_SHADOW = true`
- memory-only
- capped ring buffer
- optional console dump
- no overlay
- no public UI

## Non-Implementation Checklist

This design does not add:

- global shadow bus
- centralized registry
- scheduler singleton
- runtime ownership mutex
- atmospheric event replay
- collision heatmaps
- runtime suppression
- runtime delay
- foreground ownership
- Instrument behavior changes

## Expansion Rule

Do not instrument Transit Ghost, Threshold, Inheritance, Archive, or Whisper until Instrument Shadow has been observed for log density, collision frequency, silence impact, and cadence contamination.


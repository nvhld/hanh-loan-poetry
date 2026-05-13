# Shadow Mode Insertion Points

Date: `2026-05-13`
Status: `INSERTION DESIGN ONLY`

This document maps where Shadow Mode could observe atmospheric event intent. It does not implement logging, suppression, delay, foreground ownership, or arbitration.

Reference hook shape: `src/runtime/debug/shadow-hooks.ts`

## Rule

Shadow hooks must be side-effect free.

They may mark an observation point. They may not mutate flow, await a scheduler, branch rendering, start timers, cancel timers, or change cadence.

## Debug Exposure Rules

Shadow records may be exposed only when explicitly requested:

- URL query: `?debug=shadow`
- Runtime flag: `window.__HL_DEBUG_SHADOW = true`

Forbidden exposure:

- public UI
- hidden keyboard shortcut
- persistent toggle
- localStorage preference
- remote telemetry
- session replay

No production reader should see `WOULD_DELAY`, `WOULD_SUPPRESS`, or any other Shadow Mode label.

## Event Surface Map

| System | Event | Current Surface | Candidate Hook Point |
| --- | --- | --- | --- |
| `threshold` | `dissolve-start` | `public/literary/reader.html` `enter()` | immediately before `th.classList.add('dissolve')` |
| `threshold` | `direct-open` | `public/literary/reader.html` direct poem path | immediately before `openPoem(_directPoem)` |
| `whisper` | `reveal-earned` | `drawFrame()` whisper gate | immediately before `body.classList.add('whisper-earned')` |
| `instrument` | `modal-open-attempt` | `InstrumentModal.open()` | first line after anchor/signal checks |
| `instrument` | `residue-start` | `render()` | immediately before `renderResidue()` |
| `instrument` | `scan-start` | `schedulePhase(... renderScan ...)` | inside scheduled phase wrapper, before scan render |
| `instrument` | `reading-start` | `schedulePhase(... renderInstrument ...)` | inside scheduled phase wrapper, before final render |
| `instrument` | `dismiss-start` | `dismiss()` | immediately before `im-visible` removal |
| `transit-ghost` | `eligibility-check` | `drawFrame()` transit activation gate | immediately before `maybeActivateTransit()` |
| `transit-ghost` | `pressure-start` | `maybeActivateTransit()` | immediately before `ghost.classList.add('pressure')` |
| `transit-ghost` | `title-start` | `maybeActivateTransit()` | immediately before `title-visible` |
| `transit-ghost` | `transit-fade` | `transitTo()` | immediately before poem opacity fade |
| `pending-modal` | `fullscreen-fade-start` | `PendingModal.show()` | immediately before `pm-visible` is added |
| `pending-modal` | `dismiss-start` | `PendingModal._dismiss()` | immediately before `pm-visible` removal |
| `archive` | `route-fade` | archive row click | immediately before `body.style.opacity = '0'` |
| `archive` | `cluster-hover` | archive row hover | after the `350ms` intentional hover delay fires |
| `lens` | `resonance-ready` | `openPoem()` note setup | after `resonance-cue` text is assigned |
| `inheritance` | `pressure-read` | future-only | only after protocol implementation exists |

These are observation points, not control points.

## Hook Placement Rules

Allowed placement:

- before a foreground fade begins
- before a modal open attempt
- before a modal dismissal fade
- before a transit phase becomes visible
- after an intentional hover delay resolves

Forbidden placement:

- inside RAF loops
- inside physics ticks
- inside particle update loops
- inside scroll interpolation loops
- inside text layout measurement loops
- inside tight pointer or scroll handlers before debounce/linger gating

## Unsafe Hook Zones

Shadow logging must not contaminate cadence.

Do not place hooks in:

- topology physics tick
- `requestAnimationFrame` draw loops
- particle update loops
- scroll cadence core
- drift interpolation
- line opacity recalculation
- cluster center computation
- pointer move handlers
- resize physics recovery
- mobile viewport correction loops

Even developer-only `console.log` in these zones can alter timing. Shadow Mode must observe atmospheric event boundaries, not the motion engine.

## Ring Buffer Lifecycle Design

This is design only.

### Init

- Create no buffer unless debug exposure is active.
- If debug exposure is active, initialize an in-memory capped ring buffer.
- Default cap follows `docs/scheduler_shadow_mode.md`: `80` records.
- Debug cap may be `200` records.

### Append

- Append one poor record per hook event.
- Record monotonic `attemptedAt`.
- Do not store poem body, interpretation, motif meaning, or reader history.
- Do not stringify large objects.

### Overflow

- Drop oldest records silently.
- Do not warn readers.
- Optional debug console may report dropped count only in explicit debug mode.

### Clear

- Clear on threshold reset.
- Clear on full route reload.
- For same-page poem transit, keep the buffer unless it exceeds cap.
- Do not persist across browser sessions.

### Debug Dump

- Console dump only when `?debug=shadow` or `window.__HL_DEBUG_SHADOW = true`.
- Dump returns records as plain objects.
- No visual overlay in this phase.

## Single-System Rollout Recommendation

Do not instrument every system first.

Start with one system:

- preferred: `instrument`
- alternate: `transit-ghost`

Measure:

- log density
- collision frequency
- silence-window guesses
- cadence contamination

Only after one system proves quiet should Shadow Mode expand.

## Non-Implementation Checklist

This design does not:

- add runtime hooks
- import hooks into `reader.html`
- suppress events
- delay events
- create foreground ownership
- create a scheduler queue
- expose production UI
- persist logs


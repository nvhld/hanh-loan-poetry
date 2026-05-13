# Minimal Scheduler Interface

Date: `2026-05-13`
Status: `API CONTRACT ONLY`

This contract formalizes how atmospheric systems ask for foreground time. It does not implement orchestration, timers, queues, async arbitration, rendering, analytics, or inheritance behavior.

Reference type contract: `src/runtime/contracts/atmosphere.ts`

## Purpose

Whisper, Instrument, Pending Modal, Transit Ghost, and future Inheritance should not rely only on convention. They need a small shared language for foreground ownership and silence windows.

The interface exists to prevent attention collisions. It must not become a recommendation engine, analytics layer, or interpretive model.

## The Five Capabilities

### 1. Event Intent

Atmospheric systems may request foreground ownership with a narrow intent:

```ts
requestForeground({
  source: 'instrument',
  type: 'modal',
  priority: 'reader-action',
  estimatedDurationMs: 4200,
  requestedAt: performance.now(),
})
```

Allowed fields:

- `source`
- `type`
- `priority`
- `estimatedDurationMs`
- `requestedAt`

Forbidden fields:

- semantic score
- mood
- emotion rank
- reader profile
- poem recommendation
- engagement confidence

### 2. Ownership Snapshot

Systems may ask who owns the foreground:

```ts
getForegroundOwner()
```

Snapshot fields:

- `owner`
- `startedAt`
- `expectedReleaseAt`
- `releaseMode`

No engagement metrics, confidence, attention scoring, or interpretation fields are allowed.

### 3. Silence Window Query

Systems may ask if they are allowed to surface now:

```ts
canSurface({
  source: 'transit-ghost',
  now: performance.now(),
})
```

Return shape:

- `allow`
- `delay`
- `suppress`

The decision must not produce user-facing explanation text. If the answer is `delay` or `suppress`, the reader should only experience silence.

### 4. Cooldown Registration

Systems may register that an atmospheric event happened:

```ts
registerAtmosphericEvent({
  source: 'whisper',
  type: 'residue',
  occurredAt: performance.now(),
})
```

This is timestamp-only operational memory.

It is not analytics.
It is not history.
It is not reader identity.

### 5. Fail-Open Rule

If the scheduler cannot make a coherent decision, it returns silence:

```ts
failOpen()
```

Expected outcome:

- suppress optional atmospherics
- release foreground ownership if inconsistent
- keep poem text readable
- do not retry aggressively
- do not display recovery text

Fail-open means absence, not repair performance.

## Things The Scheduler Is Forbidden To Know

- Topology physics constants.
- Cluster center coordinates.
- Poem meaning.
- Literary interpretation.
- Reader psychology.
- Reader taste.
- Account identity.
- Analytics identity.
- Full reading history.
- Ranked poem lists.
- Recommendation scores.
- Engagement scores.
- Device fingerprints beyond existing low-end / in-app fallback flags.
- Canonical text body beyond route identity needed for ownership context.

The scheduler may know recent atmospheric timestamps. It may not know why the reader stayed.

## Allowed Sources

- `whisper`
- `instrument`
- `pending-modal`
- `transit-ghost`
- `inheritance`
- `threshold`
- `archive`
- `lens`
- `cosmic-ray`
- `system-cleanup`

## Decision Semantics

### `allow`

The source may surface now.

### `delay`

The source should wait for `delayMs` and ask again later. Delay is not a promise of future foreground ownership.

### `suppress`

The source should disappear quietly for the current route or event cycle.

## Contract Boundaries

The interface may:

- serialize interruptive surfaces
- protect silence windows
- track recent event timestamps
- expose current foreground owner
- fail open to silence

The interface may not:

- render UI
- mutate poem text
- change topology physics
- rank poems
- persist reader identity
- infer psychology
- create recommendations
- own animation timing
- import atmospheric runtime modules

## Shadow Mode Next

The next safe step is scheduler shadow mode.

Shadow mode should observe current event intents and emit developer-only records:

- `WOULD_ALLOW`
- `WOULD_DELAY`
- `WOULD_SUPPRESS`
- `WOULD_YIELD`

Shadow mode must not block, delay, or suppress real runtime behavior until cadence collisions are measured.


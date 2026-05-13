# Atmosphere Scheduler Protocol

Date: `2026-05-13`
Status: `PROTOCOL DESIGN ONLY`

This document defines how atmospheric systems should share foreground time. It does not implement scheduling.

## Purpose

The scheduler exists to protect silence.

It may delay, suppress, or serialize atmospheric events. It must not score poems, rank readers, infer emotion, or create new feature surfaces.

## Scheduler Inputs

Allowed inputs:

- Recent atmospheric event timestamps.
- Current foreground owner.
- Current poem route or archive route.
- Modal visibility state.
- Threshold state.
- Whisper state.
- Transit Ghost state.
- Pending Modal state.
- Instrument phase state.
- Active inheritance field, if one exists later.

Disallowed inputs:

- Long-term reading profile.
- Analytics identity.
- Account identity.
- Recommendation score.
- Literary interpretation score.
- Device fingerprint beyond existing low-end / in-app fallback checks.

## Event Classes

### Baseline

Always present and not scheduled as foreground:

- drift
- darkness
- typography pacing
- text reveal after initial open

### Soft Atmospherics

May coexist with baseline, but should defer to foreground owners:

- cosmic ray
- lens resonance
- archive hover memory
- inheritance pressure
- residual familiarity

### Interruptive Surfaces

Require foreground ownership:

- Instrument Modal
- Pending Modal
- Transit Ghost pressure/title phase
- archive navigation fade
- threshold dissolve

## Foreground Ownership

Only one interruptive surface may own the foreground at a time.

Ownership fields, if implemented later:

- `owner`: system id
- `startedAt`: monotonic timestamp
- `expectedReleaseAt`: monotonic timestamp
- `releaseMode`: `fade`, `dismiss`, `route`, or `timeout`

No system may assume ownership while another foreground owner is active unless the current owner explicitly releases or expires.

## Serialization Rules

- Instrument Modal blocks Transit Ghost.
- Transit Ghost blocks Pending Modal.
- Pending Modal blocks Archive navigation fade until dismissal clears.
- Threshold dissolve blocks all non-baseline atmospherics.
- Archive navigation fade blocks new modals.
- Inheritance never blocks an interruptive surface; it yields.

When two interruptive events are eligible at the same time, prefer the one already initiated by direct reader action.

## Silence Windows

Silence windows are protected gaps after major atmospheric events.

Recommended minimums:

- After threshold dissolve: `8s` before any new interruptive surface.
- After Instrument dismissal: `12s` before Pending Modal.
- After Whisper reveal begins: `8s` before Transit Ghost pressure/title phase.
- After Archive navigation fade: `6s` before Instrument or Pending Modal.
- After false recognition: suppress residue degradation for the same reading.

Silence windows may delay or suppress events. They should not announce that suppression.

## Cooldown Arbitration

Cooldown arbitration resolves systems that are allowed but too close together.

Priority order:

1. Direct reader action.
2. Safety / dismissal cleanup.
3. Existing modal lifecycle.
4. Threshold / route transition.
5. Whisper or lens residue.
6. Transit Ghost.
7. Inheritance pressure.
8. Cosmetic micro-atmospherics.

Lower-priority events should delay first, suppress second, and never force themselves through an active owner.

## Fade Ownership Rules

- Only one full-screen fade owner at a time.
- Modal fade and route fade cannot overlap.
- Pending Modal dismissal must clear before Archive navigation fade begins.
- Instrument content clear must complete before another Instrument open starts.
- Transition ownership must use monotonic timestamps, not wall-clock dates.

## Memory Rules

The scheduler may remember only short-lived timing state:

- recent event timestamps
- active owner
- suppressed event count for the current route
- session-only false recognition cap

It must not store:

- poem preferences
- reader intent
- long-term event history
- ranked route paths
- interpretive summaries

## Failure Policy

If scheduler state becomes inconsistent:

- Release foreground ownership.
- Suppress optional atmospherics for the current route.
- Keep poem text readable.
- Do not crash.
- Do not retry aggressively.

The fail-open condition is silence, not spectacle.

## Implementation Gate

Before implementation, verify:

- No physics constants are imported.
- No runtime behavior changes are bundled with protocol docs.
- No visual system is added.
- No recommendation language appears.
- Validator and runtime manifest remain clean.


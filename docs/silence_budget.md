# Silence Budget Audit

Date: `2026-05-13`
Status: `AUDIT ONLY`

This is not a performance budget. It is a density map for active atmosphere during a reading session. No timing changes are made here.

## Always Present

- Darkness, typography pacing, and text reveal.
- Field drift and background silence accumulation.
- Poem text reveal: `2.4s`.
- Threshold surface:
  - threshold text color transition: `5.0s`
  - prompt delay: `4.2s`
  - dissolve: `3.6s`
  - direct poem open after threshold: `50ms`
  - threshold ready delay: `800ms`
- Scroll resistance and pause-zone background response.
- Cosmic ray scroll flash: opacity `0.4`, fade after `90ms`.

## Rare Atmospherics

- Instrument MRI drift fragments:
  - deterministic by `poemId`
  - current threshold: hash score `< 14`
- False recognition:
  - session-seeded
  - approximately `2-3%`
  - max `1` poem per session
- Scan fatigue:
  - open count `4` within `120000ms`: `+520ms`
  - open count `5+` within `120000ms`: `+1000ms`
- Familiarity:
  - local-only
  - earned after `opens >= 2` or modal linger `>= 12000ms`
  - decays over roughly `14 days`
- Pending modal returning state:
  - opacity capped at `0.6`
  - transition shortened to `0.55s`

## Interruptive Surfaces

- Lens reveal:
  - resonance cue transition: `1.5s`
  - whisper reveal: `2.8s`, with `0.5s` delay
- Instrument Modal:
  - overlay fade: `900ms`
  - residue: `1200ms`, familiar `700ms`
  - scan: `1800ms`, familiar `1200ms`
  - sparse whisper scan delay: `+520ms`
  - section fade: `1100ms`, sparse cadence `1400ms`
  - content clear after dismiss: `920ms`
- Transit Ghost:
  - eligible after `24s` poem linger and low skim
  - ghost opacity transition: `3.5s`
  - pressure phase: `+2000ms`
  - title phase: after pressure, then click target
  - warmth phase: `+6000ms`
  - transit fade: `1.5s`
- Pending Modal:
  - default overlay transition: `1.2s`
  - returning transition: `0.55s`
  - dismiss clear: `900ms`
  - dot animation: `9.5s`, delay `3s`
- Archive transition:
  - navigation fade: `1200ms`
  - row expansion: `0.8s`
  - detail opacity: `0.6s`
  - intentional hover delay: `350ms`

## Silence Ceiling

These are proposed guardrails, not implemented scheduling yet.

- No more than `2` interruptive systems active inside any `45s` reading window.
- Whisper reveal should not begin within `8s` of Transit Ghost pressure/title phases.
- Instrument scan fatigue should not overlap false recognition in the same modal open.
- Pending Modal should not appear within `12s` after Instrument dismissal.
- Transit Ghost should not begin while Instrument Modal is visible.
- Archive navigation fade should not overlap Pending Modal dismissal.
- False recognition should remain max `1` per session.
- Residue degradation and false recognition should not occur in the same Instrument reading.
- Familiarity should reduce friction quietly, never announce itself as memory.

## Current Risk

- The densest plausible collision is: Whisper reveal → Instrument residue/scan → Transit Ghost eligibility within the same long reading interval.
- Pending Modal and Archive navigation both own full-screen interruption semantics.
- Instrument familiarity, scan fatigue, false recognition, and degradation are individually rare, but they share the same scan phrase channel.
- Archive linger memory and Instrument memory are separate local systems; they should remain non-verbal and non-profiled.

## Audit Conclusion

The current atmosphere is still controlled, but the Research Layer now has enough temporal behavior to require scheduling rules before cross-poem inheritance begins.

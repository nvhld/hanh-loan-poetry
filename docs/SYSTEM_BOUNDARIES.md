# System Boundaries

Date: `2026-05-13`

This project is split into five operational zones. The boundaries matter more than a diagram: most regressions here come from a layer taking responsibility for a feeling it does not own.

## 1. Literary Runtime

Owns the atmospheric reading experience.

- `public/literary/*`
- reader, archive, topology, curator HTML runtimes
- text-first interaction, whisper cadence, modal pacing
- phenomenology-sensitive timing and surface behavior

Rules:

- No React takeover.
- No casual animation framework.
- No async dependency that can block poem text.

## 2. Machine Room

Owns reproducibility and routing support.

- canonical builders
- validators
- generated metadata
- runtime manifest
- Next routing shells
- MRI data mirror builders

Rules:

- Generated artifacts must be reproducible.
- Validators may observe runtime invariants, not rewrite runtime behavior.
- Next is infrastructure, metadata, and canonical routing only.

## 3. Physics Layer

Owns emotional field motion.

- topology forces
- cluster centers
- drift cadence
- damping and motion ceilings
- debug physics instrumentation

Rules:

- During PR 3 cooling, do not edit this layer.
- Research features cannot tune force constants.
- Literary polish cannot change cluster behavior.

## 4. Research Layer

Owns reading instruments and critical surfaces.

- Instrument Modal
- Dandatto whisper discipline
- anchor-only MRI instrumentation
- `/lab` research separation
- critical-lens and motif notes

Rules:

- Observe, do not interpret.
- Anchor-only instrumentation stays data-backed.
- Discovery remains quiet: no CTA, badge, or analysis button.

## 5. Forbidden Crossings

- Research layer cannot mutate physics.
- Runtime cannot depend on async SEO APIs.
- Next shell cannot own phenomenology timing.
- Validators cannot silently patch source text.
- Generated inline data cannot become hand-edited truth.
- Instrument Modal cannot open for poems without MRI data.
- Literary runtime files cannot be duplicated outside `public/literary/`.
- Physics smoke evidence is not final truth until PR 3 lock report and tag exist.

# Instrument Modal v0

Status: `LITERARY LAYER ONLY`
Date: `2026-05-13`

Instrument Modal v0 exposes anchor-only MRI notes inside the reader after the Lens → Whisper threshold has been earned. It must not change topology physics, drift cadence, dust systems, or cluster behavior.

## Runtime Boundary

- Source data: `public/literary/anchor_mri.json`
- Inline mirror: `public/literary/anchor_mri_inline.js`
- Translator: `public/literary/instrument_translator.js`
- Host surface: `public/literary/reader.html`

The translator is template-only. It maps MRI tokens into quiet observational lines. It must not generate interpretive prose, sentiment claims, or definitive literary meaning.

## Anchor Rule

Only the 12 anchor poems may open the Instrument Modal. The anchor set must match across:

- `anchor_mri.json`
- `anchor_mri_inline.js`
- `pending-modal.js`
- `reader.html`

If an anchor id is missing MRI data, the modal must not open.

## Reader Flow

1. User opens an anchor poem.
2. User enables Lens.
3. Whisper appears after the existing threshold.
4. Clicking the whisper begins a three-state instrument reveal.
5. Escape or outside click dismisses the modal.

## Three-State Reveal

1. Residue: `FIELD RESIDUE DETECTED` for approximately `1.2s`.
2. Scan: `structural compression stabilizing...` for approximately `1.8s`.
3. Reading Instrument: `FIELD MOTION`, `STRUCTURAL WEATHER`, and `ABSENCE` fade in with staggered opacity.

No spinner. No terminal animation. No typewriter effect. No visual CTA.

No React takeover. No iframe. No topology dependency.

## Validation

`scripts/validate_hygiene.py --strict --preserve-runtime` verifies:

- 12 anchor MRI entries exist.
- inline MRI data matches source JSON.
- anchor id sets stay synchronized.
- reader uses `InstrumentModal.hasSignal()` before opening.
- translator keeps its template-only export contract.
- translator keeps a text humility filter for over-confident interpretive phrasing.

## Temporal Residue v0.5

- MRI drift fragments are deterministic from `poemId` hash; no runtime randomness.
- A bounded minority of anchor poems may end with a degraded `ABSENCE` signal.
- Entropy-heavy context may omit `STRUCTURAL WEATHER`.
- Silence-heavy MRI data shortens `ABSENCE`.
- Whisper cadence is passed into the translator so sparse whispers reduce clauses and slow the reveal.
- Scan fatigue applies after repeated modal opens within `2min`; the scan phase lengthens and says `field residue unstable...`.

## Quiet Persistence

- Instrument memory is local-only and per poem.
- Familiarity can emerge after repeated openings or long modal linger.
- Familiar readings shorten residue and scan timing.
- Familiarity decays after approximately `14 days`.
- Rare false recognition is session-seeded and limited to one poem per session.
- No profile surface, reading count, badge, streak, or recommendation UI is allowed.

## Linguistic Compression

- Translator output uses section word limits.
- `FIELD MOTION`: `<= 11` words.
- `STRUCTURAL WEATHER`: `<= 14` words.
- `ABSENCE`: `<= 12` words.
- One clause per line.
- Prefer compressed structural fragments over crafted sentences.

## Non-Goals

- No new visual system.
- No physics work.
- No dust, drift, damping, cluster, or canvas changes.
- No full critical essay surface yet.
- No non-anchor modal expansion.
- No modal stacking.
- No glitch, corrupted text, fake terminal, scanline, CRT, or hacker aesthetic.
- No gamification or profile layer.
- No prose-poetry translator cadence.

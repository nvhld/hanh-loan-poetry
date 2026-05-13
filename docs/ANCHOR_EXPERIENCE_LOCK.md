# Anchor Experience Lock

Date: `2026-05-13`
Status: `STATIC PASS + TARGETED FIX`

This document is an artifact of the 12-anchor experience pass. It is not a planning ritual. The pass asked one question only:

`Does this make the reader leave the text?`

## Scope

- 12 anchor poems only
- static audit first
- no new systems
- no new abstractions
- no scheduler expansion
- no topology edits

## Phenotype Grouping

### Entropy-heavy

- `2023-078-thoi-gian-va-tinh-yeu`
- `2023-082-mua-he-o-boston`
- `2020-020-boi-vi-em-yeu-anh`

### Silence-heavy

- `2016-008-vui`
- `2022-032-tra-anh-ve-phia-binh-minh`
- `2023-074-nang-i`

### Transition-heavy

- `2022-038-binh-minh-em-va-hoang-hon-anh`
- `2023-102-thang-12-cho-em`
- `2022-047-bay-gio-thang-tam-roi-anh`

### Mobile-risky typography

- `2023-082-mua-he-o-boston`
- `2023-078-thoi-gian-va-tinh-yeu`
- `2022-038-binh-minh-em-va-hoang-hon-anh`

Risk signal used:

- long line lengths
- high line count
- direct-entry minimal mode
- whisper below long text body
- nested scroll surface

## Reader Reality Checks

### Direct Entry

Static result:

- Anchor direct entry resolves directly to poem open path.
- Non-anchor direct entry still routes through `PendingModal`.
- Minimal mode already protects in-app / low-end entry.

Decision:

- `PASS` for route logic.
- `MANUAL DEVICE CHECK STILL REQUIRED` for Messenger, Facebook, Safari standalone, Chrome Android.

### Whisper Cadence

Static result:

- Whisper remains gated by linger, pause-zone bonus, memory bonus, skim penalty.
- No new hook or scheduler logic added.

Decision:

- `PASS` in code path.
- real cadence still needs human reading confirmation.

### Instrument Readability

Static result:

- Instrument remains anchor-only and click-triggered from whisper.
- Observe-only shadow logging stays debug-gated.

Decision:

- `PASS` for scope control.

### Transit Residue

Static result:

- Transit remains separate from Instrument and still phase-based.

Decision:

- `PASS` in code path.
- no transition tuning done in this pass.

### Mobile Typography / Scroll Fatigue

Static finding:

- Direct-entry and reduced contexts used nested scroll surfaces:
  - outer `#poem-text` scroll
  - inner `.pt-body` scroll
- This was most likely to create thumb fatigue, cadence loss, and abandonment on long anchors.

Decision:

- `FAIL` before fix.
- `FIXED` in this pass for `minimal-mode` only.

Applied fix:

- `body.minimal-mode .pt-body` now uses full natural height, visible overflow, and no mask fade.
- `body.minimal-mode #poem-text` keeps a single calmer scroll surface with extra bottom breathing room.

Reason:

- direct-entry / in-app / low-end readers need one readable scroll surface more than atmospheric scroll layering.

### Copy / Paste / Print

Static result:

- poem body remains selectable
- print styles already strip runtime chrome and restore visible text

Decision:

- `PASS` in static audit.

## Fixes Applied

- [reader.html](/Users/nguyenvietcuong/Desktop/PrintHL/hanh-loan-poetry/public/literary/reader.html): simplified `minimal-mode` reading surface to remove nested scroll exhaustion in direct-entry / low-end contexts.

## Backlog, Not Fixed

- direct-entry richness vs. minimal-mode austerity on high-end standalone browsers
- true Safari in-app lag / snap confirmation
- exact accidental-dismiss frequency on mobile thumb reading
- transit residue feel on real-device long reading

These are not ignored. They require human verification, not more architecture.

## Next Verification

- manual device confirmation on:
  - Messenger in-app browser
  - Facebook in-app browser
  - Safari standalone
  - Chrome Android
- priority anchors first:
  - `2023-082-mua-he-o-boston`
  - `2023-078-thoi-gian-va-tinh-yeu`
  - `2022-038-binh-minh-em-va-hoang-hon-anh`

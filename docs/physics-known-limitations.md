# Physics Known Limitations

This document defines expected constraints of the PR 3 topology field so future bug reports can be triaged against reality instead of perfection myths.

## Expected Divergence

- Desktop and mobile are not expected to maintain pixel-identical spatial continuity.
- Low-end devices may reduce atmospheric density through `?runtime=minimal` or automatic runtime flags.
- iOS Safari and Android Chrome may recover with slightly different calm-down timing after tab resume or address-bar oscillation.

## In-App Browser Degradation

- Facebook, Instagram, Zalo, and similar in-app browsers are expected to fall back to reduced atmospherics.
- Reduced atmospherics preserve text-first continuity, not full-field parity with desktop.

## Suspension / Resume

- The topology field is not intended to maintain exact spatial continuity across tab suspension events longer than 30 minutes on low-memory mobile browsers.
- After resume, short atmospheric recovery is acceptable if cluster integrity, velocity ceilings, and silence cadence return within smoke thresholds.

## Resize / Rotation

- Viewport resize and mobile rotation should preserve topology memory, but they are not required to preserve exact per-node micro-positioning.
- Recovery time matters more than exact spatial replay.

## Non-Goals

- This engine does not target cinematic camera behavior.
- This engine does not target perfect particle determinism across browsers.
- This engine does not target identical touch feel across every mobile hardware tier.
- This engine does not target zero drift variance after prolonged backgrounding on constrained devices.

## Unsupported Perfection Myths

- “Particles never move slightly after resume” is not a supported guarantee.
- “Every browser keeps identical silence cadence after deep suspension” is not a supported guarantee.
- “Mobile thermal state never affects perceived atmosphere” is not a supported guarantee.

Date: `2026-05-13`

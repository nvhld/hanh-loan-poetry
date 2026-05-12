# Hạnh Loan - Phenomenology Baseline

This document captures the atmospheric calibration constants and behaviors of the Hạnh Loan Poetic Universe prior to the Next.js architectural freeze and refactor. These parameters must be preserved during and after the migration.

## 1. Atmospheric Timing & Transitions
*   **Initial Load Fade-in:** ~3.6s cubic-bezier for the cosmic background.
*   **Poem Text Reveal:** Base opacity transition is 2.4s, with staggered delays (e.g., +4.2s for slow reveal of critical elements).
*   **Archive/Reader Transitions:** 1.5s fade-out to black before navigating (`opacity: 0` on `body`).
*   **Instrument Modal (MRI):** 900ms fade-in (`rgba(7,7,10,.82)` background, 2px blur).

## 2. Cosmic Engine Physics (Drift & Scroll)
*   **Drift Cadence:** The text and background organically "breathe" and drift.
    *   Velocity damping: ~0.94 - 0.98 friction multiplier.
    *   Scroll Resistance: `wheel` events dampen drift by 70% (`_driftVelocity *= 0.3`).
*   **Dust Density & Particles:** Rendered via Canvas. 
    *   Responsive to pointer intent but highly dampened to feel "heavy" and "resisting".
    *   Opacity variations range from 0.18 to 0.88 depending on depth and focus.

## 3. Interaction Flows & Transitions
*   **Idle Behavior:** After scrolling stops, dust gently settles, drift reduces but never stops completely (breathing rhythm).
*   **Reader Entry:** 
    *   Fades in black for 3.6s, text anchors appear sequentially.
    *   No violent physics or instant snaps.
*   **Topology Entry:**
    *   Nodes float in cosmic suspension.
    *   Gravity forces apply slowly.
*   **Anchor Behavior:** Only the 12 anchor poems display the Whisper cue.
*   **The "Lens → Whisper → Instrument" Sequence:**
    1.  **Lens (Focus):** User enters an anchor poem.
    2.  **Whisper Note:** Surfaces after lingering or deep scrolling.
    3.  **Instrument Modal:** Clicking the note fades in the MRI modal (900ms).

## 4. Silence Intervals
*   **Stanza Breaks:** Pauses are structurally measured. Scrolling through empty space triggers subtle background shifts (cosmic ray flash opacity 0.4 fading in 90ms).
*   **Poem Linger Time:** Time spent on a poem is recorded before exit (`_poemLinger`), treating stillness as a metric of engagement.

## Motion Ceilings
- No transition under 400ms
- No physics snap acceleration
- No opacity jump > 0.18/frame
- No camera zoom spikes

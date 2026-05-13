# PR3-SMOKE-2026-05-13-A

Status: `DESKTOP PARTIAL`
Run date: `2026-05-13`
Route: `http://127.0.0.1:3000/lab?debug=physics`
Probe schema: `pr3-physics-probe-v1`
Chrome target: `A8ADC6F3EE810E62E52088CFB458B0A7`

This run records desktop Chrome evidence only. It is not a PR 3 lock record.

## Device Context

- Browser: `Chrome/148.0.0.0` via CDP
- OS: browser-reported `MacIntel`
- Viewports:
  - visible idle: `1200x792`, DPR `2`
  - resize desktop: `900x700`, DPR `1`
  - emulated mobile portrait: `375x812`, DPR `1`
  - emulated mobile landscape: `812x375`, DPR `1`
  - restored desktop: `1440x900`, DPR `1`
- Refresh rate: approximately `60Hz`
- Battery state: supported, unplugged, observed range `0.75-0.82`
- Power mode: `unknown`
- In-app browser: `no`

## Evidence Files

- `pre-idle.json`
- `pre-idle.png`
- `visible-idle-30m.json`
- `settled-state.png`
- `pre-resize-recovery.json`
- `post-resize-900x700-recovery.json`
- `post-resize-mobile-portrait-recovery.json`
- `post-resize-mobile-landscape-recovery.json`
- `post-restore-recovery.json`
- `post-resize-abuse.png`
- `post-background-resume-recovery.json`
- `post-resume.png`

## Visible Idle

- Duration: `1814995ms` (`30.25min`)
- Samples: `31`
- Result: `DESKTOP PARTIAL`
- Phenomenology Drift: `none observed in debug screenshots`
- Recovery Time: `n/a`
- Settled At: `120997ms`
- Cluster integrity: `6/6 finite`
- Node count: `99`
- NaN state: `false`
- Particle floor: `0-0`
- Max velocity: `0`
- Center velocity variance max: `0`
- Observed Memory Behavior: `stable by particle floor; heap profiler not run`
- Notes:
  - The field was in a silent/static state during sampling, so this proves no idle explosion, NaN state, center collapse, or particle accumulation under the sampled state.
  - This does not prove all active-motion phenomenology paths.

## Resize / Restore

- Result: `DESKTOP PARTIAL`
- Phenomenology Drift: `none observed in debug screenshots`
- Recovery Time: approximately `2.0s` by settle threshold
- Settled At:
  - `900x700`: `2002ms`
  - `375x812` emulated mobile: `2001ms`
  - `812x375` emulated mobile: `2001ms`
  - `1440x900` restore: `2001ms`
- Cluster integrity: `6/6 finite` in all samples
- NaN state: `false`
- Particle floor: `0-0`
- Center velocity variance max: `0`
- Notes:
  - Center trajectory snapshots are present in each recovery file.
  - Emulated mobile viewport evidence is not a real-device mobile pass.

## Background Tab / Resume

- Method: foreground switched to `about:blank`, topology target left in background, then reactivated and sampled.
- Result: `DESKTOP PARTIAL`
- Phenomenology Drift: `none observed in post-resume screenshot`
- Recovery Time: approximately `2.0s` by settle threshold
- Settled At: `2001ms`
- Cluster integrity: `6/6 finite`
- NaN state: `false`
- Particle floor: `0-0`
- Max velocity: `0`
- Center velocity variance max: `0`
- Notes:
  - First background command failed during restore because target id was not exported into the helper process. The corrected command reactivated the known topology target and recorded `post-background-resume-recovery.json`.
  - The failed helper command is a harness issue, not a runtime warning.

## Pending Before PR 3 Lock

- Hidden idle with a clean harness record.
- Minimized-window idle with another app foregrounded.
- Real iOS Safari mobile thermal sanity.
- Real Android Chrome mobile thermal sanity.
- 24h cooling period.
- Short sanity rerun after cooling.
- `docs/PR3_LOCK_REPORT.md`.
- Repository tag such as `v0.3-physics-locked`.

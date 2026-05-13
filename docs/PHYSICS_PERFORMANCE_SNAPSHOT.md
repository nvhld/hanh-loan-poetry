# PHYSICS_PERFORMANCE_SNAPSHOT

This file is the regression baseline for PR 3 smoke validation. It is not a pass record until manual observations are filled in.

## Runtime Scope

- Static topology runtime node count: `99`
- Next `DreamField` prototype node count: `3`
- Debug mode: `?debug=physics` or `window.__HL_DEBUG_PHYSICS = true`
- Probe schema: `pr3-physics-probe-v1`

## Observation Slots

- Desktop Chrome FPS:
- Desktop Safari FPS:
- Desktop Firefox FPS:
- iOS Safari behavior:
- Android Chrome behavior:
- Browser:
- OS:
- Viewport:
- Refresh Rate:
- Battery State:
- Power Mode:
- In-app Browser:

## Atmospheric Recovery

- Tab resume recovery time:
- Resize recovery time:
- Orientation rotate recovery time:
- Settle threshold: `0.08 px/frame variance for 2 consecutive samples`
- Frame recovery curve: `t+0s`, `t+1s`, `t+2s`, `t+5s`
- Recovery notes:

## Memory Behavior

- Idle memory note:
- Peak memory note:
- Leak symptoms:
- Observed Memory Behavior:
- Particle floor note:

## Stability Notes

- Idle stability note:
- Resize behavior note:
- Tab resume note:
- Debug overlay note:
- Phenomenology drift note:
- Thumb rhythm note:
- Visual density note:
- Safari address bar oscillation note:
- Center trajectory snapshot note:
- Center velocity variance note:

## Desktop CDP Preflight — 2026-05-13

- Route: `http://127.0.0.1:3000/lab?debug=physics`
- Node count: `99`
- Cluster centers: `6/6 finite`
- NaN state: `false`
- Initial center drift: `301.60`
- Resize sequence center drift:
  - `1440x900`: `340.86`
  - `900x700`: `327.78`
  - `375x812 mobile`: `389.93`
  - `812x375 mobile`: `459.92`
  - `1440x900 restore`: `339.92`
- Notes:
  - This is a preflight probe only, not a full scenario pass.
  - Probe sampled a silent field state (`silenceLevel = 1`), so velocity stress evidence is still incomplete.
  - Full elapsed-time idle/resume validation is still pending.
  - Preflight predates `pr3-physics-probe-v1`; rerun before lock with center trajectory snapshots and center velocity variance.

## Desktop CDP Smoke Run — `PR3-SMOKE-2026-05-13-A`

- Status: `DESKTOP PARTIAL`
- Route: `http://127.0.0.1:3000/lab?debug=physics`
- Evidence directory: `docs/baselines/physics/PR3-SMOKE-2026-05-13-A/`
- Browser: `Chrome/148.0.0.0`
- OS: browser-reported `MacIntel`
- Refresh rate: approximately `60Hz`
- Battery state: supported, unplugged, observed range `0.75-0.82`
- Power mode: `unknown`
- In-app browser: `no`
- Node count: `99`
- Visible idle duration: `1814995ms` (`30.25min`)
- Visible idle result:
  - cluster integrity: `6/6`
  - NaN state: `false`
  - particle floor: `0-0`
  - max velocity: `0`
  - center velocity variance max: `0`
  - settled at: `120997ms`
- Resize / restore recovery:
  - `900x700`: settled at `2002ms`
  - `375x812` emulated mobile: settled at `2001ms`
  - `812x375` emulated mobile: settled at `2001ms`
  - `1440x900` restore: settled at `2001ms`
- Background tab / resume recovery:
  - settled at: `2001ms`
  - cluster integrity: `6/6`
  - NaN state: `false`
  - particle floor: `0-0`
- Observed Memory Behavior: `stable by particle floor; heap profiler not run`
- Phenomenology drift: `none observed in debug screenshots`
- Mobile thermal sanity: `UNVERIFIED`; no real iOS Safari or Android Chrome device was tested.
- Remaining lock blockers:
  - hidden idle with clean harness record
  - minimized-window idle
  - real mobile thermal sanity
  - 24h cooling period and short rerun

## Overlay Format Freeze

- `Cluster Integrity`
- `Velocity Ceiling`
- `NaN State`
- `Center Drift`
- `Particle Pressure`
- `Active Region`

## Comparison Rule

Future regressions should be flagged if any of the following worsen materially:

- FPS under steady idle
- velocity spike on resume
- resize memory preservation
- console anomaly frequency under `[HL Physics]`
- atmospheric recovery time
- phenomenology drift rating
- thumb rhythm stability
- Safari address bar oscillation behavior
- center trajectory teleportation
- center velocity variance that does not settle
- particle floor growth beyond bounded oscillation

Date: `2026-05-13`
Status: `PENDING MANUAL OBSERVATION`

# Physics Smoke Test

PR 3 cannot be locked until this preservation protocol is executed and recorded.

## Protocol Rules

- Surface: `/lab?debug=physics`
- Manual low-atmosphere override: append `&runtime=minimal` when needed
- Console watch: any warning prefixed with `[HL Physics]`
- Probe schema: `docs/physics_probe_schema.md`
- Overlay format is frozen and must remain parseable:
  - `Cluster Integrity`
  - `Velocity Ceiling`
  - `NaN State`
  - `Center Drift`
  - `Particle Pressure`
  - `Active Region`
- Result rule: if any scenario fails technically or atmospherically, PR 3 remains unlocked
- Lock rule: even after full pass, wait `24h cooling period`, then rerun a short confirmation pass before setting PR 3 to `LOCKED`

## Recording Template

- Test Date:
- Tester:
- Browser:
- OS:
- Viewport:
- Refresh Rate:
- Battery State:
- Power Mode:
- In-app Browser: `yes | no`
- Route:
- Result: `PASS | FAIL`
- Phenomenology Drift: `none | subtle | noticeable | severe`
- Recovery Time:
- Settled At:
- Observed Memory Behavior: `stable | gradual growth | unreleased listeners suspected | particle accumulation suspected`
- Console Warnings:
- Center Trajectory Snapshot:
- Center Velocity Variance:
- Notes:

## Scenario 1: Idle Stability

- Action: leave topology running for 30 minutes without interaction
- Verify: no drift explosion
- Verify: no `NaN` positions
- Verify: no cluster collapse
- Verify: FPS degradation remains acceptable
- Verify: silence cadence does not harden or flatten over time
- Verify: particle floor remains bounded
- Required runs:
  - visible idle
  - hidden idle
  - minimized window idle with another app foregrounded
- Recording:
  - Test Date:
  - Tester:
  - Browser:
  - OS:
  - Viewport:
  - Refresh Rate:
  - Battery State:
  - Power Mode:
  - In-app Browser:
  - Route:
  - Result: `PENDING`
  - Phenomenology Drift:
  - Recovery Time: `n/a`
  - Settled At:
  - Observed Memory Behavior:
  - Console Warnings:
  - Center Trajectory Snapshot:
  - Center Velocity Variance:
  - Notes:

### Recorded Run: `PR3-SMOKE-2026-05-13-A`

- Test Date: `2026-05-13`
- Tester: Codex / CDP probe
- Browser: `Chrome/148.0.0.0`
- OS: `MacIntel`
- Viewport: `1200x792`, DPR `2`
- Refresh Rate: approximately `60Hz`
- Battery State: supported, unplugged, `0.82` at final visible-idle sample
- Power Mode: `unknown`
- In-app Browser: `no`
- Route: `http://127.0.0.1:3000/lab?debug=physics`
- Result: `DESKTOP PARTIAL`
- Phenomenology Drift: `none observed in debug screenshots`
- Recovery Time: `n/a`
- Settled At: `120997ms`
- Observed Memory Behavior: `stable by particle floor; heap profiler not run`
- Console Warnings: none captured by probe
- Center Trajectory Snapshot: recorded in `docs/baselines/physics/PR3-SMOKE-2026-05-13-A/visible-idle-30m.json`
- Center Velocity Variance: max `0`
- Notes:
  - Visible idle ran for `1814995ms` (`30.25min`) with `31` samples.
  - Cluster integrity stayed `6/6`; `hasNaNState=false`; particle floor stayed `0-0`.
  - Hidden idle and minimized-window idle remain pending.

## Scenario 2: Tab Suspend / Resume

- Action: background the tab for 10 minutes, then resume
- Verify: no velocity spike
- Verify: no teleportation
- Verify: no opacity flash
- Verify: silence cadence returns naturally after resume
- Verify: frame recovery curve records `t+0s`, `t+1s`, `t+2s`, `t+5s`
- Recording:
  - Test Date:
  - Tester:
  - Browser:
  - OS:
  - Viewport:
  - Refresh Rate:
  - Battery State:
  - Power Mode:
  - In-app Browser:
  - Route:
  - Result: `PENDING`
  - Phenomenology Drift:
  - Recovery Time:
  - Settled At:
  - Observed Memory Behavior:
  - Console Warnings:
  - Center Trajectory Snapshot:
  - Center Velocity Variance:
  - Notes:

### Recorded Run: `PR3-SMOKE-2026-05-13-A`

- Test Date: `2026-05-13`
- Tester: Codex / CDP probe
- Browser: `Chrome/148.0.0.0`
- OS: `MacIntel`
- Viewport: `1200x792`, DPR `2`
- Refresh Rate: approximately `60Hz`
- Battery State: supported, unplugged, `0.75` at post-resume final sample
- Power Mode: `unknown`
- In-app Browser: `no`
- Route: `http://127.0.0.1:3000/lab?debug=physics`
- Result: `DESKTOP PARTIAL`
- Phenomenology Drift: `none observed in post-resume screenshot`
- Recovery Time: approximately `2.0s`
- Settled At: `2001ms`
- Observed Memory Behavior: `stable by particle floor; heap profiler not run`
- Console Warnings: none captured by probe
- Center Trajectory Snapshot: recorded in `docs/baselines/physics/PR3-SMOKE-2026-05-13-A/post-background-resume-recovery.json`
- Center Velocity Variance: max `0`
- Notes:
  - Foreground was switched to `about:blank` to background the topology tab before reactivation.
  - One helper restore command failed because target id was not exported; corrected restore/probe evidence is recorded.
  - This is desktop Chrome evidence only, not Safari/mobile suspension evidence.

## Scenario 3: Resize Abuse

- Action: repeated resize on desktop and repeated viewport rotation on mobile
- Verify: cluster memory preserved
- Verify: no center reset
- Verify: no “cosmic explosion”
- Verify: pre-resize, post-resize, post-restore center trajectories are recorded
- Recording:
  - Test Date:
  - Tester:
  - Browser:
  - OS:
  - Viewport:
  - Refresh Rate:
  - Battery State:
  - Power Mode:
  - In-app Browser:
  - Route:
  - Result: `PENDING`
  - Phenomenology Drift:
  - Recovery Time:
  - Settled At:
  - Observed Memory Behavior:
  - Console Warnings:
  - Center Trajectory Snapshot:
  - Center Velocity Variance:
  - Notes:

### Recorded Run: `PR3-SMOKE-2026-05-13-A`

- Test Date: `2026-05-13`
- Tester: Codex / CDP probe
- Browser: `Chrome/148.0.0.0`
- OS: `MacIntel`
- Viewport: `900x700`, `375x812`, `812x375`, `1440x900`
- Refresh Rate: approximately `60Hz`
- Battery State: supported, unplugged, approximately `0.80`
- Power Mode: `unknown`
- In-app Browser: `no`
- Route: `http://127.0.0.1:3000/lab?debug=physics`
- Result: `DESKTOP PARTIAL`
- Phenomenology Drift: `none observed in debug screenshots`
- Recovery Time: approximately `2.0s`
- Settled At: `2001-2002ms`
- Observed Memory Behavior: `stable by particle floor; heap profiler not run`
- Console Warnings: none captured by probe
- Center Trajectory Snapshot: recorded in resize recovery JSON files under `docs/baselines/physics/PR3-SMOKE-2026-05-13-A/`
- Center Velocity Variance: max `0`
- Notes:
  - Cluster integrity stayed `6/6`; `hasNaNState=false`; particle floor stayed `0-0`.
  - Mobile viewports were CDP emulation only and must not be counted as real-device mobile pass.

## Scenario 4: Debug Overlay Validation

- Action: run with debug overlay visible during interaction + idle
- Verify: overlay labels remain in frozen format
- Verify: vectors remain stable
- Verify: no runaway forces
- Verify: no infinite acceleration
- Verify: no undefined cluster centers
- Recording:
  - Test Date:
  - Tester:
  - Browser:
  - OS:
  - Viewport:
  - Refresh Rate:
  - Battery State:
  - Power Mode:
  - In-app Browser:
  - Route:
  - Result: `PENDING`
  - Phenomenology Drift:
  - Recovery Time:
  - Settled At:
  - Observed Memory Behavior:
  - Console Warnings:
  - Center Trajectory Snapshot:
  - Center Velocity Variance:
  - Notes:

## Scenario 5: Mobile Thermal Sanity

- Action: test on iOS Safari and Android Chrome
- Verify: no escalating touch lag
- Verify: no runaway particle accumulation
- Verify: no memory leak symptoms
- Verify Thumb Rhythm:
  - drift does not fight thumb input
  - scrolling is not sticky
  - scrolling is not oversensitive
- Verify Visual Density:
  - text remains readable outdoors / at low brightness
  - haze does not collapse into muddy gray
- Verify Safari Address Bar Oscillation:
  - repeated scroll up/down
  - keyboard open/close
  - rotate
  - background app
  - resume
- Recording:
  - Test Date:
  - Tester:
  - Browser:
  - OS:
  - Viewport:
  - Refresh Rate:
  - Battery State:
  - Power Mode:
  - In-app Browser:
  - Route:
  - Result: `PENDING`
  - Phenomenology Drift:
  - Recovery Time:
  - Settled At:
  - Observed Memory Behavior:
  - Console Warnings:
  - Center Trajectory Snapshot:
  - Center Velocity Variance:
  - Notes:

### Recorded Run: `PR3-SMOKE-2026-05-13-A`

- Result: `UNVERIFIED`
- Notes:
  - No real iOS Safari or Android Chrome device was tested in this run.
  - CDP mobile viewport emulation was used only for resize trajectory evidence.

## Cooling Period Confirmation

- Earliest Lock Review Date:
- Short Recheck Route:
- Short Recheck Result: `PENDING`
- Short Recheck Phenomenology Drift:
- Short Recheck Notes:

Date: `2026-05-13`

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

## Cooling Period Confirmation

- Earliest Lock Review Date:
- Short Recheck Route:
- Short Recheck Result: `PENDING`
- Short Recheck Phenomenology Drift:
- Short Recheck Notes:

Date: `2026-05-13`

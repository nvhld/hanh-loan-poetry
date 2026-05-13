# Physics Probe Schema

Schema version: `pr3-physics-probe-v1`

This schema defines the machine-readable evidence emitted by `scripts/physics_probe.mjs`. The probe is allowed to detect structural failure modes only: NaN state, center collapse, runaway velocity, particle accumulation, and recovery shape. It must not assign aesthetic or poetic quality scores.

## Invocation

Default route:

```bash
node scripts/physics_probe.mjs --url 'http://127.0.0.1:3000/lab?debug=physics'
```

Recovery curve:

```bash
node scripts/physics_probe.mjs --target-id <id> --recovery-curve --recovery-offsets-ms 0,1000,2000,5000
```

Fixed interval sampling:

```bash
node scripts/physics_probe.mjs --target-id <id> --samples 30 --interval-ms 60000
```

Viewport sampling:

```bash
node scripts/physics_probe.mjs --target-id <id> --width 375 --height 812 --mobile
```

## Top-Level Fields

- `schemaVersion`: string. Must be `pr3-physics-probe-v1`.
- `targetId`: Chrome DevTools Protocol target id.
- `browser`: browser-level CDP metadata.
- `sampling`: sampling policy and settle threshold metadata.
- `summary`: final sample in the run.
- `samples`: ordered sample list.

## Device Context

Each sample includes:

- `deviceContext.browserUserAgent`: browser user agent.
- `deviceContext.osPlatform`: browser-reported OS platform.
- `deviceContext.refreshRateHz`: estimated through `requestAnimationFrame`; unit: Hz.
- `deviceContext.batteryState.supported`: whether Battery Status API is available.
- `deviceContext.batteryState.charging`: boolean or `null`.
- `deviceContext.batteryState.level`: 0-1 or `null`.
- `deviceContext.powerMode`: currently `unknown`; do not infer OS power mode without a reliable API.
- `deviceContext.inAppBrowser`: boolean derived from user-agent markers.
- `deviceContext.hardwareConcurrency`: browser-reported logical CPU count.
- `deviceContext.deviceMemoryGb`: browser-reported memory tier when available.
- `deviceContext.maxTouchPoints`: browser-reported touch capability.

Smoke logs must also record manual context when available:

- Browser
- OS
- Viewport
- Refresh Rate
- Battery State
- Power Mode
- In-app Browser: yes/no

## Center Trajectory Snapshot

`centerTrajectorySnapshot` is an array sorted by `field`.

Each item:

- `field`: emotional field key.
- `x`, `y`: intended cluster center in viewport-space pixels.
- `normalizedX`, `normalizedY`: intended cluster center normalized to viewport width/height.
- `observedX`, `observedY`: observed centroid of nodes in that field, viewport-space pixels.
- `observedNormalizedX`, `observedNormalizedY`: observed centroid normalized to viewport width/height.
- `observedDistancePx`: distance between intended center and observed centroid; unit: px.
- `nodeCount`: number of nodes in the observed field bucket.

Use center snapshots at:

- pre-resize
- post-resize
- post-restore
- post-resume

The normalized values are for cross-viewport comparison. The pixel values are for same-viewport trajectory/recovery analysis.

## Center Velocity Variance

`centerVelocityVariance` compares observed field centroids between adjacent samples.

- Unit: `px/frame variance`.
- `meanPxPerFrame`: mean observed centroid velocity across fields.
- `variancePxPerFrame`: variance of observed centroid velocity across fields.
- `samples`: number of field velocities included.

Default settle threshold:

- `settleThresholdPxPerFrameVariance`: `0.08`
- `settleConsecutiveSamples`: `2`

Settling definition:

`settledAtMs` is the first elapsed time where `centerVelocityVariance.variancePxPerFrame <= settleThresholdPxPerFrameVariance` for `settleConsecutiveSamples` consecutive samples.

Expected settling window:

- Resize / restore: under 5 seconds.
- Tab resume: under 5 seconds unless browser suspension is unusually aggressive.
- Mobile rotate: under 5 seconds on supported hardware, with manual phenomenology assessment required.

## Frame Recovery Curve

A recovery curve records samples at:

- `t+0s`
- `t+1s`
- `t+2s`
- `t+5s`

Each sample must preserve:

- `maxVelocity`
- `avgVelocity`
- `dustCount`
- `finiteCenters`
- `totalCenters`
- `hasNaNState`
- `centerTrajectorySnapshot`
- `centerVelocityVariance`

Recovery shape matters more than final state. A final stable sample with unstable intermediate oscillation is not sufficient for PR 3 lock.

## Particle Floor

`dustCount` is the particle pressure proxy.

Expected behavior:

- bounded oscillation is acceptable.
- monotonic unbounded growth is a fail.
- particle accumulation after 30 minutes should be classified as `particle accumulation suspected`.

## Warning Semantics

Console warnings prefixed with `[HL Physics]` are structural warnings.

Interpretation:

- `NaN State: FAIL`: fail immediately.
- undefined center: fail immediately.
- excessive velocity: fail unless one isolated event recovers within threshold and has no visible phenomenology drift.
- repeated warning burst: fail pending investigation.

## Non-Goals

The probe must not emit:

- atmosphere score
- silence score
- poetry score
- beauty score
- subjective pass/fail without human observation

Phenomenology drift remains a human-recorded field in the smoke protocol.

Date: `2026-05-13`

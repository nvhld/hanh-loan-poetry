#!/usr/bin/env node

import http from 'node:http'
import process from 'node:process'

const PROBE_SCHEMA_VERSION = 'pr3-physics-probe-v1'
const DEFAULT_URL = 'http://127.0.0.1:3000/lab?debug=physics'
const DEFAULT_RECOVERY_OFFSETS_MS = [0, 1000, 2000, 5000]
const DEFAULT_SETTLE_THRESHOLD = 0.08
const DEFAULT_SETTLE_CONSECUTIVE = 2

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i]
    if (!part.startsWith('--')) continue
    const key = part.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }
    args[key] = next
    i += 1
  }
  return args
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (error) {
          reject(error)
        }
      })
    }).on('error', reject)
  })
}

class CdpClient {
  constructor(webSocketUrl) {
    this.webSocketUrl = webSocketUrl
    this.pending = new Map()
    this.counter = 0
    this.ws = null
  }

  async connect() {
    this.ws = new WebSocket(this.webSocketUrl)
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve
      this.ws.onerror = reject
    })
    this.ws.onmessage = (event) => {
      const payload = JSON.parse(String(event.data))
      if (payload.id && this.pending.has(payload.id)) {
        const { resolve, reject } = this.pending.get(payload.id)
        this.pending.delete(payload.id)
        if (payload.error) reject(new Error(JSON.stringify(payload.error)))
        else resolve(payload.result)
      }
    }
  }

  call(method, params = {}, sessionId) {
    const id = ++this.counter
    const message = { id, method, params }
    if (sessionId) message.sessionId = sessionId
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify(message))
    })
  }

  close() {
    this.ws?.close()
  }
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function parseNumber(value, fallback) {
  if (value === undefined || value === true) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseOffsets(value) {
  if (!value || value === true) return DEFAULT_RECOVERY_OFFSETS_MS
  return String(value)
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part) && part >= 0)
}

async function ensureTarget(client, url, targetId) {
  if (targetId) return targetId
  const created = await client.call('Target.createTarget', { url })
  await sleep(1500)
  return created.targetId
}

async function attachTarget(client, targetId) {
  const attached = await client.call('Target.attachToTarget', {
    targetId,
    flatten: true,
  })
  return attached.sessionId
}

async function waitForReady(client, sessionId) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const result = await client.call(
      'Runtime.evaluate',
      {
        expression: 'document.readyState',
        returnByValue: true,
      },
      sessionId,
    )
    if (result.result?.value === 'complete') return
    await sleep(250)
  }
  throw new Error('Timed out waiting for document.readyState=complete')
}

async function applyViewport(client, sessionId, width, height, mobile) {
  if (!width || !height) return
  await client.call(
    'Emulation.setDeviceMetricsOverride',
    {
      width: Number(width),
      height: Number(height),
      deviceScaleFactor: 1,
      mobile: Boolean(mobile),
    },
    sessionId,
  )
  await sleep(400)
}

async function evaluateSummary(client, sessionId) {
  const expression = `
    JSON.stringify(await (async () => {
      async function readBattery() {
        if (!navigator.getBattery) {
          return { supported: false, charging: null, level: null };
        }
        try {
          const battery = await navigator.getBattery();
          return {
            supported: true,
            charging: battery.charging,
            level: battery.level,
          };
        } catch (error) {
          return { supported: false, charging: null, level: null };
        }
      }

      async function estimateRefreshRateHz() {
        return await new Promise((resolve) => {
          const times = [];
          let last = performance.now();
          function step(now) {
            times.push(now - last);
            last = now;
            if (times.length >= 30) {
              const avg = times.slice(5).reduce((sum, value) => sum + value, 0) / Math.max(1, times.length - 5);
              resolve(avg > 0 ? 1000 / avg : null);
              return;
            }
            requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }

      const centers = typeof computeClusterCenters === 'function'
        ? computeClusterCenters(window.innerWidth, window.innerHeight)
        : {};
      const fieldBuckets = {};
      if (Array.isArray(nodePositions)) {
        nodePositions.forEach((node, index) => {
          const spring = Array.isArray(springs) ? springs[index] : null;
          const field = getEffective(node.poem).dominantField || 'entropy';
          if (!fieldBuckets[field]) fieldBuckets[field] = [];
          fieldBuckets[field].push({
            x: node.x + (spring ? spring.driftX : 0),
            y: node.y + (spring ? spring.driftY : 0),
          });
        });
      }
      const centerTrajectorySnapshot = Object.entries(centers).sort(([left], [right]) => left.localeCompare(right)).map(([field, center]) => {
        const bucket = fieldBuckets[field] || [];
        const observedX = bucket.length ? bucket.reduce((sum, node) => sum + node.x, 0) / bucket.length : null;
        const observedY = bucket.length ? bucket.reduce((sum, node) => sum + node.y, 0) / bucket.length : null;
        return {
          field,
          x: center.x,
          y: center.y,
          normalizedX: window.innerWidth ? center.x / window.innerWidth : null,
          normalizedY: window.innerHeight ? center.y / window.innerHeight : null,
          observedX,
          observedY,
          observedNormalizedX: observedX !== null && window.innerWidth ? observedX / window.innerWidth : null,
          observedNormalizedY: observedY !== null && window.innerHeight ? observedY / window.innerHeight : null,
          observedDistancePx: observedX !== null && observedY !== null ? Math.hypot(center.x - observedX, center.y - observedY) : null,
          nodeCount: bucket.length,
        };
      });
      const finiteCenters = Object.values(centers).filter(center => center && Number.isFinite(center.x) && Number.isFinite(center.y)).length;
      const totalCenters = Object.keys(centers).length;
      const maxVelocity = Array.isArray(springs) && springs.length
        ? Math.max(...springs.map(s => Math.hypot(s.velDriftX, s.velDriftY)))
        : 0;
      const avgVelocity = Array.isArray(springs) && springs.length
        ? springs.reduce((sum, s) => sum + Math.hypot(s.velDriftX, s.velDriftY), 0) / springs.length
        : 0;
      const hasNaNState = Array.isArray(nodePositions)
        ? nodePositions.some((n, index) => {
            const spring = Array.isArray(springs) ? springs[index] : null;
            if (!spring) return true;
            const nodeX = n.x + spring.driftX;
            const nodeY = n.y + spring.driftY;
            return !Number.isFinite(nodeX) || !Number.isFinite(nodeY) || !Number.isFinite(spring.velDriftX) || !Number.isFinite(spring.velDriftY);
          })
        : true;
      const centerDrift = Array.isArray(nodePositions) && nodePositions.length
        ? nodePositions.reduce((sum, n) => {
            const field = getEffective(n.poem).dominantField || 'entropy';
            const center = centers[field];
            return center ? sum + Math.hypot(center.x - n.x, center.y - n.y) : sum;
          }, 0) / nodePositions.length
        : 0;
      const active = hoveredIdx !== null && Array.isArray(nodePositions) ? nodePositions[hoveredIdx] : null;
      const battery = await readBattery();
      const refreshRateHz = await estimateRefreshRateHz();
      return {
        sampledAtMs: performance.now(),
        href: location.href,
        hidden: document.hidden,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        },
        deviceContext: {
          browserUserAgent: navigator.userAgent,
          osPlatform: navigator.platform,
          refreshRateHz,
          batteryState: battery,
          powerMode: 'unknown',
          inAppBrowser: /FBAN|FBAV|Instagram|Line|Zalo/i.test(navigator.userAgent),
          hardwareConcurrency: navigator.hardwareConcurrency ?? null,
          deviceMemoryGb: navigator.deviceMemory ?? null,
          maxTouchPoints: navigator.maxTouchPoints ?? 0,
        },
        nodeCount: Array.isArray(nodePositions) ? nodePositions.length : null,
        springCount: Array.isArray(springs) ? springs.length : null,
        dustCount: Array.isArray(dustParticles) ? dustParticles.length : null,
        finiteCenters,
        totalCenters,
        centerTrajectorySnapshot,
        maxVelocity,
        avgVelocity,
        hasNaNState,
        centerDrift,
        activeRegion: active ? (getEffective(active.poem).dominantField || 'none') : 'none',
        silenceLevel: typeof _silenceLevel === 'number' ? _silenceLevel : null,
        memoryPressure: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        } : null,
      };
    })())
  `
  const result = await client.call(
    'Runtime.evaluate',
    {
      expression,
      returnByValue: true,
      awaitPromise: true,
    },
    sessionId,
  )
  return JSON.parse(result.result.value)
}

function centerVelocityVariance(previous, current) {
  const refreshRate = current.deviceContext?.refreshRateHz || previous.deviceContext?.refreshRateHz || 60
  const deltaMs = Math.max(1, current.sampledAtMs - previous.sampledAtMs)
  const frameCount = Math.max(1, (deltaMs / 1000) * refreshRate)
  const previousByField = new Map(previous.centerTrajectorySnapshot.map((center) => [center.field, center]))
  const velocities = []
  for (const center of current.centerTrajectorySnapshot) {
    const before = previousByField.get(center.field)
    if (!before) continue
    const beforeX = before.observedX ?? before.x
    const beforeY = before.observedY ?? before.y
    const currentX = center.observedX ?? center.x
    const currentY = center.observedY ?? center.y
    if (![beforeX, beforeY, currentX, currentY].every(Number.isFinite)) continue
    velocities.push(Math.hypot(currentX - beforeX, currentY - beforeY) / frameCount)
  }
  if (!velocities.length) return null
  const mean = velocities.reduce((sum, value) => sum + value, 0) / velocities.length
  const variance = velocities.reduce((sum, value) => sum + (value - mean) ** 2, 0) / velocities.length
  return {
    unit: 'px/frame variance',
    meanPxPerFrame: mean,
    variancePxPerFrame: variance,
    samples: velocities.length,
  }
}

function annotateSeries(samples, settleThreshold, settleConsecutive) {
  let settledAtMs = null
  let consecutive = 0
  const annotated = samples.map((sample, index) => {
    if (index === 0) {
      return {
        ...sample,
        centerVelocityVariance: null,
      }
    }
    const variance = centerVelocityVariance(samples[index - 1], sample)
    if (variance && variance.variancePxPerFrame <= settleThreshold) consecutive += 1
    else consecutive = 0
    if (settledAtMs === null && consecutive >= settleConsecutive) {
      settledAtMs = sample.elapsedMs
    }
    return {
      ...sample,
      centerVelocityVariance: variance,
    }
  })
  return { samples: annotated, settledAtMs }
}

async function collectSamples(client, sessionId, args) {
  if (args['recovery-curve']) {
    const offsets = parseOffsets(args['recovery-offsets-ms'])
    const started = Date.now()
    const samples = []
    for (const offset of offsets) {
      const waitMs = started + offset - Date.now()
      if (waitMs > 0) await sleep(waitMs)
      samples.push({
        elapsedMs: Date.now() - started,
        ...(await evaluateSummary(client, sessionId)),
      })
    }
    return samples
  }

  const sampleCount = Math.max(1, parseNumber(args.samples, 1))
  const intervalMs = Math.max(0, parseNumber(args['interval-ms'], 1000))
  const started = Date.now()
  const samples = []
  for (let index = 0; index < sampleCount; index += 1) {
    if (index > 0 && intervalMs > 0) await sleep(intervalMs)
    samples.push({
      elapsedMs: Date.now() - started,
      ...(await evaluateSummary(client, sessionId)),
    })
  }
  return samples
}

async function main() {
  const args = parseArgs(process.argv)
  const url = args.url || DEFAULT_URL
  const browser = await getJson('http://127.0.0.1:9222/json/version')
  const client = new CdpClient(browser.webSocketDebuggerUrl)
  await client.connect()

  try {
    const targetId = await ensureTarget(client, url, args['target-id'])
    const sessionId = await attachTarget(client, targetId)
    await client.call('Page.enable', {}, sessionId)
    await client.call('Runtime.enable', {}, sessionId)
    await waitForReady(client, sessionId)
    await applyViewport(client, sessionId, args.width, args.height, args.mobile)
    const samples = await collectSamples(client, sessionId, args)
    const settleThreshold = parseNumber(args['settle-threshold'], DEFAULT_SETTLE_THRESHOLD)
    const settleConsecutive = Math.max(1, parseNumber(args['settle-consecutive'], DEFAULT_SETTLE_CONSECUTIVE))
    const annotated = annotateSeries(samples, settleThreshold, settleConsecutive)
    const summary = annotated.samples.at(-1)
    console.log(JSON.stringify({
      schemaVersion: PROBE_SCHEMA_VERSION,
      targetId,
      browser: {
        name: browser.Browser,
        userAgent: browser['User-Agent'],
        protocolVersion: browser['Protocol-Version'],
      },
      sampling: {
        cadence: args['recovery-curve'] ? 'recovery-curve' : 'fixed-interval',
        sampleCount: annotated.samples.length,
        intervalMs: args['recovery-curve'] ? null : parseNumber(args['interval-ms'], 1000),
        recoveryOffsetsMs: args['recovery-curve'] ? parseOffsets(args['recovery-offsets-ms']) : null,
        settleThresholdPxPerFrameVariance: settleThreshold,
        settleConsecutiveSamples: settleConsecutive,
        settledAtMs: annotated.settledAtMs,
      },
      summary,
      samples: annotated.samples,
    }, null, 2))
  } finally {
    client.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

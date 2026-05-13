/**
 * Instrument Shadow Runtime.
 *
 * Observe-only debug helper for Instrument Modal phase boundaries.
 * No suppression, delay, arbitration, ownership mutex, queue, retry,
 * persistence, DOM measurement, RAF participation, or telemetry.
 */

import type {
  InstrumentShadowObservation,
  InstrumentShadowPhase,
} from './instrument-shadow'

type DebugWindow = Window & {
  __HL_DEBUG_SHADOW?: boolean
}

export type InstrumentShadowRuntime = {
  enabled(): boolean
  record(eventType: InstrumentShadowPhase): InstrumentShadowObservation | null
  dump(): InstrumentShadowObservation[]
  clear(): void
}

const CAP = 80

function now() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()
}

function isEnabled() {
  if (typeof window === 'undefined') return false
  const debugWindow = window as DebugWindow
  if (debugWindow.__HL_DEBUG_SHADOW === true) return true
  try {
    return new URLSearchParams(window.location.search).get('debug') === 'shadow'
  } catch {
    return false
  }
}

export function createInstrumentShadowRuntime(): InstrumentShadowRuntime {
  const records: InstrumentShadowObservation[] = []

  return {
    enabled: isEnabled,
    record(eventType) {
      if (!isEnabled()) return null
      const record: InstrumentShadowObservation = {
        source: 'instrument',
        eventType,
        attemptedAt: now(),
        decision: 'WOULD_ALLOW',
        activeOwner: 'instrument',
        silenceWindowActive: false,
      }
      records.push(record)
      while (records.length > CAP) records.shift()
      return record
    },
    dump() {
      return records.slice()
    },
    clear() {
      records.length = 0
    },
  }
}

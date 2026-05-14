// ============================================================
// ENGINE: FIELD - D3-Force Simulation Topology
// Phase A complete. This is Phase B: Motion Physics.
// No visuals here. Only the force simulation runtime.
// ============================================================

import * as d3 from 'd3'
import type { Poem, GravityEdge, DominantField } from '@/types/poem'
import { computeNodeRadius } from '@/engine/gravity'
import { FIELD_PHYSICS, PHYSICS_FIELDS } from '@/config/physics'

const physicsWarnings = new Set<string>()

export interface FieldNode extends d3.SimulationNodeDatum {
  id: string
  poem: Poem
  radius: number
  engravingStrength: number
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

export interface FieldLink extends d3.SimulationLinkDatum<FieldNode> {
  source: string | FieldNode
  target: string | FieldNode
  strength: number
  glowColor: string
}

export type ClusterCenters = Record<DominantField, { x: number; y: number }>

export interface FieldPhysicsDebugSnapshot {
  width: number
  height: number
  clusterCenters: ClusterCenters
  nodes: Array<{
    id: string
    dominantField: DominantField
    x: number
    y: number
    vx: number
    vy: number
    radius: number
  }>
}

export interface FieldState {
  simulation: d3.Simulation<FieldNode, FieldLink>
  nodes: FieldNode[]
  links: FieldLink[]
  stop: () => void
  restart: () => void
  resize: (width: number, height: number) => void
  getClusterCenters: () => ClusterCenters
  getDebugSnapshot: () => FieldPhysicsDebugSnapshot
  setEngravings: (engravings: Record<string, number>) => void
  perturb: (poemId: string, dx: number, dy: number) => void
}

/**
 * Build the emotional field simulation.
 * Call this once. Never rebuild on every render.
 *
 * The simulation runs in the background.
 * Visuals READ from node positions; they do not drive them.
 */
export function createFieldSimulation(
  poems: Poem[],
  edges: GravityEdge[],
  engravings: Record<string, number>,
  width: number,
  height: number,
  onTick: (nodes: FieldNode[]) => void
): FieldState {
  const viewport = {
    width: Math.max(FIELD_PHYSICS.minViewportWidth, width),
    height: Math.max(FIELD_PHYSICS.minViewportHeight, height),
  }
  const clusterCenters = computeClusterCenters(viewport.width, viewport.height)

  const nodes: FieldNode[] = poems.map(poem => ({
    id: poem.id,
    poem,
    radius: computeNodeRadius(poem),
    engravingStrength: engravings[poem.id] ?? 0,
    x: viewport.width / 2 + seededOffset(poem.id, 'x') * viewport.width * FIELD_PHYSICS.initialSpread,
    y: viewport.height / 2 + seededOffset(poem.id, 'y') * viewport.height * FIELD_PHYSICS.initialSpread,
  }))

  const nodeById = new Map(nodes.map(n => [n.id, n]))
  const links: FieldLink[] = edges
    .filter(e => e.strength >= FIELD_PHYSICS.linkMinStrength)
    .map(e => ({
      source: e.source,
      target: e.target,
      strength: e.strength,
      glowColor: e.glowColor,
    }))

  const simulation = d3.forceSimulation<FieldNode, FieldLink>(nodes)
    .force('link', d3.forceLink<FieldNode, FieldLink>(links)
      .id(d => d.id)
      .strength(d => (d as FieldLink).strength * FIELD_PHYSICS.linkStrengthScale)
      .distance(d => {
        const link = d as FieldLink
        return FIELD_PHYSICS.linkDistanceMin + (1 - link.strength) * FIELD_PHYSICS.linkDistanceRange
      })
    )
    .force('charge', d3.forceManyBody<FieldNode>()
      .strength(d => -(FIELD_PHYSICS.chargeBase + d.engravingStrength * FIELD_PHYSICS.chargeEngravingScale))
    )
    .force('center', d3.forceCenter(viewport.width / 2, viewport.height / 2).strength(FIELD_PHYSICS.centerStrength))
    .force('collision', d3.forceCollide<FieldNode>()
      .radius(d => d.radius + FIELD_PHYSICS.collisionPadding)
      .strength(FIELD_PHYSICS.collisionStrength)
    )
    .force('fieldCluster', fieldClusterForce(nodes, clusterCenters, FIELD_PHYSICS.clusterStrength))
    .alphaDecay(FIELD_PHYSICS.alphaDecay)
    .velocityDecay(FIELD_PHYSICS.velocityDecay)
    .on('tick', () => {
      if (isDebugPhysicsEnabled()) {
        validatePhysics(nodes, clusterCenters)
      }
      onTick([...nodes])
    })

  return {
    simulation,
    nodes,
    links,
    stop: () => simulation.stop(),
    restart: () => simulation.alpha(FIELD_PHYSICS.restartAlpha).restart(),
    resize: (nextWidth: number, nextHeight: number) => {
      const prevWidth = viewport.width
      const prevHeight = viewport.height
      viewport.width = Math.max(FIELD_PHYSICS.minViewportWidth, nextWidth)
      viewport.height = Math.max(FIELD_PHYSICS.minViewportHeight, nextHeight)

      const scaleX = viewport.width / prevWidth
      const scaleY = viewport.height / prevHeight
      for (const node of nodes) {
        const x = node.x ?? prevWidth / 2
        const y = node.y ?? prevHeight / 2
        node.x = blend(x, x * scaleX, FIELD_PHYSICS.clusterMemoryAlpha)
        node.y = blend(y, y * scaleY, FIELD_PHYSICS.clusterMemoryAlpha)
        node.vx = (node.vx ?? 0) * FIELD_PHYSICS.clusterMemoryAlpha
        node.vy = (node.vy ?? 0) * FIELD_PHYSICS.clusterMemoryAlpha
      }

      assignClusterCenters(clusterCenters, computeClusterCenters(viewport.width, viewport.height))
      simulation.force('center', d3.forceCenter(viewport.width / 2, viewport.height / 2).strength(FIELD_PHYSICS.centerStrength))
      simulation.alpha(FIELD_PHYSICS.resizeAlpha).restart()
    },
    getClusterCenters: () => cloneClusterCenters(clusterCenters),
    getDebugSnapshot: () => ({
      width: viewport.width,
      height: viewport.height,
      clusterCenters: cloneClusterCenters(clusterCenters),
      nodes: nodes.map(node => ({
        id: node.id,
        dominantField: node.poem.dominantField,
        x: node.x ?? 0,
        y: node.y ?? 0,
        vx: node.vx ?? 0,
        vy: node.vy ?? 0,
        radius: node.radius,
      })),
    }),

    setEngravings: (newEngravings: Record<string, number>) => {
      for (const node of nodes) {
        node.engravingStrength = newEngravings[node.id] ?? 0
        node.radius = computeNodeRadius({
          ...node.poem,
          memoryDensity: (newEngravings[node.id] ?? 0) * 1000,
        })
      }
      simulation.force('collision', d3.forceCollide<FieldNode>()
        .radius(d => d.radius + FIELD_PHYSICS.collisionPadding)
        .strength(FIELD_PHYSICS.collisionStrength)
      )
      simulation.alpha(FIELD_PHYSICS.engravingAlpha).restart()
    },

    perturb: (poemId: string, dx: number, dy: number) => {
      const node = nodeById.get(poemId)
      if (!node) return
      node.vx = (node.vx ?? 0) + dx
      node.vy = (node.vy ?? 0) + dy
      simulation.alpha(FIELD_PHYSICS.perturbAlpha).restart()
    },
  }
}

/**
 * Pull poems gently toward their emotional region. The velocity clamp keeps
 * resize and tab-resume behavior from turning into hard snaps.
 */
function fieldClusterForce(nodes: FieldNode[], clusterCenters: ClusterCenters, strength: number) {
  return function(alpha: number) {
    for (const node of nodes) {
      const target = clusterCenters[node.poem.dominantField]
      if (!target) continue

      const nextVx = (node.vx ?? 0) + (target.x - (node.x ?? 0)) * strength * alpha
      const nextVy = (node.vy ?? 0) + (target.y - (node.y ?? 0)) * strength * alpha
      node.vx = clamp(nextVx, -FIELD_PHYSICS.clusterMaxVelocity, FIELD_PHYSICS.clusterMaxVelocity)
      node.vy = clamp(nextVy, -FIELD_PHYSICS.clusterMaxVelocity, FIELD_PHYSICS.clusterMaxVelocity)
    }
  }
}

export function computeClusterCenters(width: number, height: number): ClusterCenters {
  const cx = width / 2
  const cy = height / 2
  const rx = width * FIELD_PHYSICS.clusterRadiusX
  const ry = height * FIELD_PHYSICS.clusterRadiusY

  return {
    longing: { x: cx - rx, y: cy - ry * 0.5 },
    ecstasy: { x: cx + rx, y: cy - ry * 0.5 },
    memory: { x: cx, y: cy - ry },
    distance: { x: cx - rx * 0.6, y: cy + ry },
    eros: { x: cx + rx * 0.6, y: cy + ry },
    entropy: { x: cx, y: cy + ry * 0.2 },
  }
}

function assignClusterCenters(target: ClusterCenters, source: ClusterCenters) {
  for (const field of PHYSICS_FIELDS) {
    target[field] = { ...source[field] }
  }
}

function cloneClusterCenters(source: ClusterCenters): ClusterCenters {
  return PHYSICS_FIELDS.reduce((acc, field) => {
    acc[field] = { ...source[field] }
    return acc
  }, {} as ClusterCenters)
}

function seededOffset(id: string, axis: 'x' | 'y'): number {
  let hash = axis === 'x' ? 2166136261 : 16777619
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) / 4294967295) - 0.5
}

function blend(current: number, target: number, memory: number): number {
  return current * memory + target * (1 - memory)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Debug mode instrumentation.
 * Detects NaN, excessive velocity, and undefined cluster centers.
 */
function validatePhysics(nodes: FieldNode[], clusterCenters: ClusterCenters) {
  for (const field of PHYSICS_FIELDS) {
    if (!clusterCenters[field]) {
      warnPhysics(`cluster-center:${field}`, 'Undefined cluster center for field:', field)
    }
  }

  const EXCESSIVE_VELOCITY_THRESHOLD = 50 // px per frame

  for (const node of nodes) {
    const vx = node.vx ?? 0
    const vy = node.vy ?? 0
    const x = node.x ?? 0
    const y = node.y ?? 0

    const isNaNPos = isNaN(x) || isNaN(y)
    const isNaNVel = isNaN(vx) || isNaN(vy)
    const isInfiniteForce = !isFinite(vx) || !isFinite(vy)
    const isExcessiveVel = Math.abs(vx) > EXCESSIVE_VELOCITY_THRESHOLD || Math.abs(vy) > EXCESSIVE_VELOCITY_THRESHOLD

    if (isNaNPos || isNaNVel || isInfiniteForce || isExcessiveVel) {
      warnPhysics(`node:${node.id}:${isNaNPos}:${isNaNVel}:${isInfiniteForce}:${isExcessiveVel}`, 'Anomaly detected:', {
        id: node.id,
        pos: [x, y],
        vel: [vx, vy],
        flags: { isNaNPos, isNaNVel, isInfiniteForce, isExcessiveVel }
      })
    }
  }
}

function warnPhysics(key: string, message: string, payload: unknown) {
  if (physicsWarnings.has(key)) return
  physicsWarnings.add(key)
  console.warn('[HL Physics]', message, payload)
}

function isDebugPhysicsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('debug') === 'physics'
    || (window as any).__HL_DEBUG_PHYSICS === true
}

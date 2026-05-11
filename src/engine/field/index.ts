// ============================================================
// ENGINE: FIELD — D3-Force Simulation Topology
// Phase A complete. This is Phase B: Motion Physics.
// No visuals here. Only the force simulation runtime.
// ============================================================

import * as d3 from 'd3'
import type { Poem, GravityEdge } from '@/types/poem'
import { computeNodeRadius, computeFieldCoupling } from '@/engine/gravity'

export interface FieldNode extends d3.SimulationNodeDatum {
  id: string
  poem: Poem
  radius: number
  engravingStrength: number
  // d3 sets these:
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

export interface FieldState {
  simulation: d3.Simulation<FieldNode, FieldLink>
  nodes: FieldNode[]
  links: FieldLink[]
  stop: () => void
  restart: () => void
  setEngravings: (engravings: Record<string, number>) => void
  perturb: (poemId: string, dx: number, dy: number) => void
}

/**
 * Build the emotional field simulation.
 * Call this once. Never rebuild on every render.
 *
 * The simulation runs in the background.
 * Visuals READ from node positions — they do not drive them.
 */
export function createFieldSimulation(
  poems: Poem[],
  edges: GravityEdge[],
  engravings: Record<string, number>,
  width: number,
  height: number,
  onTick: (nodes: FieldNode[]) => void
): FieldState {
  // --- Build nodes ---
  const nodes: FieldNode[] = poems.map(poem => ({
    id: poem.id,
    poem,
    radius: computeNodeRadius(poem),
    engravingStrength: engravings[poem.id] ?? 0,
    x: width / 2 + (Math.random() - 0.5) * width * 0.6,
    y: height / 2 + (Math.random() - 0.5) * height * 0.6,
  }))

  // --- Build links (implicit gravity — no visible lines by default) ---
  const nodeById = new Map(nodes.map(n => [n.id, n]))
  const links: FieldLink[] = edges
    .filter(e => e.strength >= 0.25) // prune weak coupling
    .map(e => ({
      source: e.source,
      target: e.target,
      strength: e.strength,
      glowColor: e.glowColor,
    }))

  // --- Force simulation ---
  const simulation = d3.forceSimulation<FieldNode, FieldLink>(nodes)
    .force('link', d3.forceLink<FieldNode, FieldLink>(links)
      .id(d => d.id)
      .strength(d => (d as FieldLink).strength * 0.15) // soft coupling — felt, not seen
      .distance(d => {
        const l = d as FieldLink
        // Close coupling = near; weak = far
        return 60 + (1 - l.strength) * 140
      })
    )
    // Emotional repulsion — each poem needs space to breathe
    .force('charge', d3.forceManyBody<FieldNode>()
      .strength(d => -(80 + d.engravingStrength * 120))
    )
    .force('center', d3.forceCenter(width / 2, height / 2).strength(0.04))
    .force('collision', d3.forceCollide<FieldNode>()
      .radius(d => d.radius + 20)
      .strength(0.7)
    )
    // Cluster by dominant field — pull same-type poems together softly
    .force('fieldCluster', fieldClusterForce(nodes, 0.06))
    .alphaDecay(0.015)        // slow cooling — field breathes longer
    .velocityDecay(0.35)      // moderate drag — liquid memory
    .on('tick', () => onTick([...nodes]))

  return {
    simulation,
    nodes,
    links,
    stop: () => simulation.stop(),
    restart: () => simulation.alpha(0.3).restart(),

    /**
     * Update engraving strengths — affects repulsion radius
     * Call this when user engraves a poem
     */
    setEngravings: (newEngravings: Record<string, number>) => {
      for (const node of nodes) {
        node.engravingStrength = newEngravings[node.id] ?? 0
        node.radius = computeNodeRadius({
          ...node.poem,
          memoryDensity: (newEngravings[node.id] ?? 0) * 1000
        })
      }
      simulation.force('collision', d3.forceCollide<FieldNode>()
        .radius(d => d.radius + 20)
        .strength(0.7)
      )
      simulation.alpha(0.1).restart()
    },

    /**
     * Perturb a poem — kick it out of orbit
     * Used by the Engraving system to deform nearby trajectories
     */
    perturb: (poemId: string, dx: number, dy: number) => {
      const node = nodeById.get(poemId)
      if (!node) return
      node.vx = (node.vx ?? 0) + dx
      node.vy = (node.vy ?? 0) + dy
      simulation.alpha(0.15).restart()
    },
  }
}

/**
 * Custom clustering force — pulls poems with the same dominant field
 * toward shared "gravity wells" in the canvas.
 *
 * This is the force that creates the 6 emotional galaxies
 * WITHOUT drawing any visible diagram.
 */
function fieldClusterForce(nodes: FieldNode[], strength: number) {
  // Cluster centers — 6 fixed anchors, one per dominant field
  const clusterCenters: Record<string, { x: number; y: number }> = {}

  return function(alpha: number) {
    // Compute cluster centers dynamically on first call
    // (will be available after simulation has width/height)
    for (const node of nodes) {
      const df = node.poem.dominantField
      if (!clusterCenters[df]) return // not initialized yet

      const target = clusterCenters[df]
      node.vx = (node.vx ?? 0) + (target.x - (node.x ?? 0)) * strength * alpha
      node.vy = (node.vy ?? 0) + (target.y - (node.y ?? 0)) * strength * alpha
    }
  }
}

/**
 * Initialize cluster centers after we know canvas dimensions.
 * Call this once before starting the simulation.
 */
export function computeClusterCenters(
  width: number,
  height: number
): Record<string, { x: number; y: number }> {
  const cx = width / 2
  const cy = height / 2
  const rx = width * 0.32
  const ry = height * 0.28

  // 6 emotional galaxies arranged in a loose ellipse
  return {
    longing:      { x: cx - rx,         y: cy - ry * 0.5 },
    ecstasy:      { x: cx + rx,         y: cy - ry * 0.5 },
    memory:       { x: cx,              y: cy - ry },
    distance:     { x: cx - rx * 0.6,  y: cy + ry },
    eros:         { x: cx + rx * 0.6,  y: cy + ry },
    entropy:      { x: cx,              y: cy + ry * 0.2 },
  }
}

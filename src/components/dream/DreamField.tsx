'use client'

// ============================================================
// DREAM LAYER — Canvas Field Renderer
// Phase C: Visual manifestation of the simulation.
// Reads node positions. Does NOT drive them.
// "One impossible thing at a time" — only field rendering here.
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react'
import type { Poem } from '@/types/poem'
import type { GravityEdge } from '@/types/poem'
import type { FieldNode } from '@/engine/field'
import { createFieldSimulation, computeClusterCenters } from '@/engine/field'
import { loadEngravings } from '@/engine/memory'
import { FIELD_COLORS } from '@/engine/gravity'

interface DreamFieldProps {
  poems: Poem[]
  edges: GravityEdge[]
  onPoemSelect: (poem: Poem) => void
  activeFilter: string | null
}

// Biological easing — hesitant, pulling, slightly behind
function biologicalLerp(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha * 0.08
}

export default function DreamField({
  poems, edges, onPoemSelect, activeFilter
}: DreamFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const nodesRef = useRef<FieldNode[]>([])
  const simRef = useRef<ReturnType<typeof createFieldSimulation> | null>(null)

  // Hover state — afterimage system
  const hoveredRef = useRef<string | null>(null)
  const afterimageRef = useRef<Map<string, number>>(new Map()) // poemId → opacity

  // Camera/pan state
  const transformRef = useRef({ x: 0, y: 0, scale: 1 })

  // Mouse position for hover detection
  const mouseRef = useRef({ x: 0, y: 0 })

  const [hoveredPoem, setHoveredPoem] = useState<Poem | null>(null)

  // Draw a single poem node
  const drawNode = useCallback((
    ctx: CanvasRenderingContext2D,
    node: FieldNode,
    alpha: number = 1.0
  ) => {
    const { x = 0, y = 0 } = node
    const r = node.radius
    const poem = node.poem
    const colors = FIELD_COLORS[poem.dominantField]

    // --- Outer glow (atmospheric pressure) ---
    const glowRadius = r * (2.5 + node.engravingStrength * 2)
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius)
    glow.addColorStop(0, hexToRgba(colors.glow, 0.18 * alpha))
    glow.addColorStop(0.5, hexToRgba(colors.glow, 0.06 * alpha))
    glow.addColorStop(1, hexToRgba(colors.glow, 0))
    ctx.beginPath()
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.fill()

    // --- Core body ---
    const core = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r)
    core.addColorStop(0, hexToRgba(colors.glow, 0.9 * alpha))
    core.addColorStop(0.5, hexToRgba(colors.hex, 0.95 * alpha))
    core.addColorStop(1, hexToRgba(colors.hex, 0.7 * alpha))
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = core
    ctx.fill()

    // --- Supernova pulse ring (if engraved) ---
    if (node.engravingStrength > 0.3) {
      const pulseR = r + (Math.sin(Date.now() * 0.002) + 1) * r * 0.4
      ctx.beginPath()
      ctx.arc(x, y, pulseR, 0, Math.PI * 2)
      ctx.strokeStyle = hexToRgba(colors.glow, 0.25 * alpha * node.engravingStrength)
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [])

  // Draw a link — implied gravity, not a data diagram
  const drawLink = useCallback((
    ctx: CanvasRenderingContext2D,
    nx: number, ny: number,
    tx: number, ty: number,
    strength: number,
    glowColor: string,
    visible: boolean
  ) => {
    if (!visible) return
    const opacity = strength * 0.12 // very faint — constellation implied, not drawn
    ctx.save()
    ctx.beginPath()
    const mx = (nx + tx) / 2 + (ny - ty) * 0.1
    const my = (ny + ty) / 2 + (tx - nx) * 0.1
    ctx.moveTo(nx, ny)
    ctx.quadraticCurveTo(mx, my, tx, ty)
    ctx.strokeStyle = hexToRgba(glowColor, opacity)
    ctx.lineWidth = strength * 1.2
    ctx.shadowBlur = 4
    ctx.shadowColor = hexToRgba(glowColor, opacity * 2)
    ctx.stroke()
    ctx.restore()
  }, [])

  // Main render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const nodes = nodesRef.current

    // --- Clear with subtle persistence (afterimage layer) ---
    ctx.fillStyle = 'rgba(4, 4, 12, 0.82)' // not 1.0 — intentional ghosting
    ctx.fillRect(0, 0, W, H)

    // --- Draw links (gravity field — very subtle) ---
    const nodeById = new Map(nodes.map(n => [n.id, n]))

    for (const edge of edges) {
      const sn = nodeById.get(typeof edge.source === 'string' ? edge.source : (edge.source as FieldNode).id)
      const tn = nodeById.get(typeof edge.target === 'string' ? edge.target : (edge.target as FieldNode).id)
      if (!sn || !tn) continue

      const isActive = !activeFilter ||
        sn.poem.tags.motif.includes(activeFilter) ||
        tn.poem.tags.motif.includes(activeFilter)

      // Only brighten edges when filter is active
      const visible = !activeFilter || isActive
      if (!visible) continue

      const opacity = activeFilter && isActive ? edge.strength * 0.35 : edge.strength * 0.08

      drawLink(
        ctx,
        sn.x ?? 0, sn.y ?? 0,
        tn.x ?? 0, tn.y ?? 0,
        edge.strength,
        edge.glowColor,
        true
      )
    }

    // --- Draw nodes ---
    for (const node of nodes) {
      const isFiltered = activeFilter && !node.poem.tags.motif.includes(activeFilter)
      const alpha = isFiltered ? 0.15 : 1.0

      // Afterimage decay for previously hovered nodes
      const afterAlpha = afterimageRef.current.get(node.id) ?? 0
      if (afterAlpha > 0.01) {
        drawNode(ctx, node, afterAlpha * 0.4)
        afterimageRef.current.set(node.id, afterAlpha * 0.94)
      }

      drawNode(ctx, node, alpha)
    }

    // --- Hover label ---
    const hovered = hoveredRef.current
    if (hovered) {
      const node = nodes.find(n => n.id === hovered)
      if (node) {
        const { x = 0, y = 0 } = node
        ctx.save()
        ctx.font = '13px "Be Vietnam Pro", sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.textAlign = 'center'
        ctx.fillText(node.poem.title, x, y - node.radius - 10)
        ctx.font = '10px "Be Vietnam Pro", sans-serif'
        ctx.fillStyle = 'rgba(255,255,255,0.4)'
        ctx.fillText(String(node.poem.year), x, y - node.radius - 24)
        ctx.restore()
      }
    }

    animRef.current = requestAnimationFrame(render)
  }, [edges, activeFilter, drawNode, drawLink])

  // Initialize simulation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    const engravings = loadEngravings()
    const engravingMap: Record<string, number> = {}
    for (const [k, v] of Object.entries(engravings)) {
      engravingMap[k] = v.decayedStrength
    }

    const sim = createFieldSimulation(
      poems, edges, engravingMap, W, H,
      (updated) => { nodesRef.current = updated }
    )
    simRef.current = sim

    animRef.current = requestAnimationFrame(render)
    return () => {
      cancelAnimationFrame(animRef.current)
      sim.stop()
    }
  }, [poems, edges, render])

  // Hit detection
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    mouseRef.current = { x: mx, y: my }

    const hit = nodesRef.current.find(n => {
      const dx = (n.x ?? 0) - mx
      const dy = (n.y ?? 0) - my
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 8
    })

    if (hit?.id !== hoveredRef.current) {
      // Trigger afterimage on previous hover
      if (hoveredRef.current) {
        afterimageRef.current.set(hoveredRef.current, 0.7)
      }
      hoveredRef.current = hit?.id ?? null
      setHoveredPoem(hit?.poem ?? null)
      canvas.style.cursor = hit ? 'pointer' : 'default'
    }
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const hit = nodesRef.current.find(n => {
      const dx = (n.x ?? 0) - mx
      const dy = (n.y ?? 0) - my
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 8
    })

    if (hit) {
      onPoemSelect(hit.poem)
      // Perturb nearby nodes — the observer effect
      simRef.current?.perturb(hit.id, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8)
    }
  }, [onPoemSelect])

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ background: '#04040c' }}
      />

      {/* Poem excerpt tooltip — appears near cursor, not as a card */}
      {hoveredPoem && (
        <div
          className="poem-tooltip"
          style={{
            left: mouseRef.current.x + 16,
            top: mouseRef.current.y - 10,
          }}
        >
          <p className="text-xs text-white/50 font-light leading-relaxed whitespace-pre-line">
            {hoveredPoem.excerpt}
          </p>
        </div>
      )}
    </div>
  )
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

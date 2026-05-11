'use client'

// ============================================================
// RITUAL LAYER — The Monolith (Poem Modal)
// "Space compression event" — not "open modal"
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Poem } from '@/types/poem'
import { FIELD_COLORS } from '@/engine/gravity'
import { addEngraving, getEngravingStrength } from '@/engine/memory'

interface MonolithProps {
  poem: Poem | null
  onClose: () => void
  onEngraved: (poemId: string) => void
}

export default function Monolith({ poem, onClose, onEngraved }: MonolithProps) {
  const holdRef = useRef<NodeJS.Timeout | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const [engravingStrength, setEngravingStrength] = useState(0)
  const [sacrificeComplete, setSacrificeComplete] = useState(false)
  const progressRef = useRef(0)

  useEffect(() => {
    if (!poem) return
    setEngravingStrength(getEngravingStrength(poem.id))
    setHoldProgress(0)
    setSacrificeComplete(false)
    progressRef.current = 0
  }, [poem?.id])

  // Hold-to-engrave interaction
  const startHold = useCallback(() => {
    if (!poem) return
    holdRef.current = setInterval(() => {
      progressRef.current += 0.016 // ~1.5 seconds to complete
      setHoldProgress(progressRef.current)
      if (progressRef.current >= 1) {
        clearInterval(holdRef.current!)
        addEngraving(poem.id, 0.12)
        const newStrength = getEngravingStrength(poem.id)
        setEngravingStrength(newStrength)
        setSacrificeComplete(true)
        onEngraved(poem.id)
        setTimeout(() => {
          setSacrificeComplete(false)
          progressRef.current = 0
          setHoldProgress(0)
        }, 800)
      }
    }, 25)
  }, [poem, onEngraved])

  const stopHold = useCallback(() => {
    if (holdRef.current) {
      clearInterval(holdRef.current)
      holdRef.current = null
    }
    if (progressRef.current < 1) {
      progressRef.current = 0
      setHoldProgress(0)
    }
  }, [])

  useEffect(() => () => stopHold(), [stopHold])

  const colors = poem ? FIELD_COLORS[poem.dominantField] : null
  const circumference = 2 * Math.PI * 22

  return (
    <AnimatePresence>
      {poem && (
        <>
          {/* Space compression overlay */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(4,4,12,0.85)', backdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            onClick={onClose}
          />

          {/* The Monolith */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="monolith relative pointer-events-auto"
              style={{
                '--glow-color': colors?.glow ?? '#4fc3f7',
                boxShadow: `0 0 0 1px rgba(255,255,255,0.06),
                            0 40px 80px rgba(0,0,0,0.85),
                            0 0 100px ${colors?.glow}22`,
              } as React.CSSProperties}
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors z-10 text-sm"
                aria-label="Đóng"
              >
                esc
              </button>

              {/* Poem image — the designed typographic artifact */}
              <div className="poem-image-container">
                <img
                  src={poem.webpFile}
                  alt={poem.title}
                  className="w-full h-auto block"
                  loading="eager"
                  onError={(e) => {
                    // Fallback: render text version if WebP not found
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                {/* Text fallback for prototype (before WebP generated) */}
                <div className="poem-text-fallback p-8">
                  <p className="poem-title mb-6">{poem.title}</p>
                  <div className="poem-body whitespace-pre-line">{poem.textContent}</div>
                  <p className="poem-date mt-6">{poem.date.split('-')[0]}</p>
                </div>
              </div>

              {/* Critic satellites */}
              {poem.critics.map((critic) => (
                <CriticSatellite key={critic.id} critic={critic} glowColor={colors?.glow ?? '#fff'} />
              ))}

              {/* Engraving interaction — the ritual */}
              <div className="engraving-zone p-4 border-t border-white/5 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-white/25 font-light">
                    {poem.resonanceState === 'supernova' && '✦ Siêu tân tinh'}
                    {poem.resonanceState === 'burning' && '◈ Rực cháy'}
                    {poem.resonanceState === 'warm' && '○ Ấm'}
                    {poem.resonanceState === 'dormant' && '· Ngủ yên'}
                    {poem.resonanceState === 'ghost' && '◇ Sao ma'}
                  </p>
                  {/* Resonance bar — no numbers */}
                  <div className="resonance-bar mt-2">
                    <div
                      className="resonance-fill"
                      style={{
                        width: `${Math.min(100, poem.memoryDensity / 10)}%`,
                        background: `linear-gradient(90deg, ${colors?.hex}, ${colors?.glow})`,
                      }}
                    />
                  </div>
                </div>

                {/* Sacrifice button */}
                <div className="sacrifice-btn-wrap">
                  <button
                    className="sacrifice-btn"
                    onMouseDown={startHold}
                    onMouseUp={stopHold}
                    onMouseLeave={stopHold}
                    onTouchStart={startHold}
                    onTouchEnd={stopHold}
                    aria-label="Giữ để cộng hưởng"
                  >
                    <svg width="48" height="48" viewBox="0 0 48 48">
                      {/* Background ring */}
                      <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                      {/* Progress ring */}
                      <circle
                        cx="24" cy="24" r="22"
                        fill="none"
                        stroke={colors?.glow ?? '#4fc3f7'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - holdProgress)}
                        transform="rotate(-90 24 24)"
                        style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                      />
                      {/* Star icon */}
                      <text
                        x="24" y="28"
                        textAnchor="middle"
                        fontSize="14"
                        fill={sacrificeComplete ? colors?.glow : 'rgba(255,255,255,0.5)'}
                        style={{ transition: 'fill 0.3s' }}
                      >
                        {sacrificeComplete ? '✦' : '✧'}
                      </text>
                    </svg>
                  </button>
                  <p className="text-xs text-white/20 text-center mt-1 font-light">giữ</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Orbiting critic quote
function CriticSatellite({ critic, glowColor }: {
  critic: NonNullable<Poem['critics'][number]>
  glowColor: string
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      className="critic-satellite"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        animation: `orbit-${Math.round(critic.orbitalRadius)} ${1 / critic.orbitalSpeed * 6}s linear infinite`,
        // CSS custom orbit via inline style
      }}
      onHoverStart={() => setExpanded(true)}
      onHoverEnd={() => setExpanded(false)}
    >
      <div
        className="satellite-orb"
        style={{ boxShadow: `0 0 8px ${glowColor}44` }}
      />
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="satellite-quote"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs text-white/80 italic leading-relaxed">
              "{critic.quote}"
            </p>
            <p className="text-xs text-white/40 mt-1 not-italic">{critic.criticName}</p>
            <p className="text-xs text-white/25">{critic.role}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

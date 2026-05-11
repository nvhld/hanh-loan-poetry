'use client'

// ============================================================
// MAIN PAGE — Entry point
// Scene 1 → Scene 2 flow. The prototype.
// ============================================================

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { Poem } from '@/types/poem'
import { PROTOTYPE_POEMS, PROTOTYPE_EDGES } from '@/data/prototype'
import Monolith from '@/components/ritual/Monolith'

// Lazy-load Dream Layer — it's heavy and only needed after Scene 1
const DreamField = dynamic(() => import('@/components/dream/DreamField'), {
  ssr: false,
  loading: () => null,
})

type Scene = 'singularity' | 'dream'

// Emotion filter options
const FILTERS = [
  { label: 'Thiên văn', value: 'thien_van' },
  { label: 'Khoảng cách', value: 'khoang_cach' },
  { label: 'Ký ức', value: 'ky_uc' },
  { label: 'Nữ quyền', value: 'nu_quyen' },
  { label: 'Phi trường', value: 'phi_truong' },
]

export default function Home() {
  const [scene, setScene] = useState<Scene>('singularity')
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [engravingVersion, setEngravingVersion] = useState(0)

  const enterDream = useCallback(() => {
    setScene('dream')
  }, [])

  const handlePoemSelect = useCallback((poem: Poem) => {
    setSelectedPoem(poem)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedPoem(null)
  }, [])

  const handleEngraved = useCallback((poemId: string) => {
    setEngravingVersion(v => v + 1)
  }, [])

  const handleFilterToggle = useCallback((value: string) => {
    setActiveFilter(prev => prev === value ? null : value)
  }, [])

  return (
    <main style={{ position: 'fixed', inset: 0, background: '#04040c' }}>
      {/* ─── SCENE 1: SINGULARITY ─── */}
      <AnimatePresence>
        {scene === 'singularity' && (
          <motion.div
            key="singularity"
            className="singularity"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(6px)', scale: 1.04 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.6, 1] }}
            onClick={enterDream}
          >
            {/* Background grain — CSS only, no JS */}
            <div
              aria-hidden
              style={{
                position: 'fixed', inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
                pointerEvents: 'none', zIndex: 1,
              }}
            />

            {/* The only text that matters */}
            <p className="singularity-line">
              Thế giới 8 tỷ người<br />
              Sao em chỉ nhớ mình anh?
            </p>

            <p className="singularity-subtitle">
              Thơ Nguyễn Thị Hạnh Loan &nbsp;·&nbsp; chạm vào hạnh loan
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SCENE 2: DREAM FIELD ─── */}
      <AnimatePresence>
        {scene === 'dream' && (
          <motion.div
            key="dream"
            className="dream-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Field UI — author mark + filters */}
            <div className="field-ui">
              <span className="author-mark">Hạnh Loan</span>
              <div className="filter-pills">
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    className={`pill ${activeFilter === f.value ? 'active' : ''}`}
                    onClick={() => handleFilterToggle(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* The emotional gravity field */}
            <DreamField
              poems={PROTOTYPE_POEMS}
              edges={PROTOTYPE_EDGES}
              onPoemSelect={handlePoemSelect}
              activeFilter={activeFilter}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SCENE 3: MONOLITH ─── */}
      <Monolith
        poem={selectedPoem}
        onClose={handleClose}
        onEngraved={handleEngraved}
      />

      {/* Dandatto mark — a trace, not a logo */}
      <p className="dandatto-mark" aria-hidden>
        All designed by Dandatto (C)
      </p>
    </main>
  )
}

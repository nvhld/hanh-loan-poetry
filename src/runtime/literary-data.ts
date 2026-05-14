import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'

export type CanonicalPoem = {
  id: string
  slug: string
  title: string
  year: number | null
  date: string | null
  excerpt: string
  body: string
}

type RedirectEntry = {
  oldId: string
  oldSlug: string
  newId: string
  newSlug: string
}

type PoemsPayload = {
  poems: CanonicalPoem[]
}

type RetiredPayload = {
  redirects: RedirectEntry[]
}

export type ResolvedPoemRoute = {
  poem: CanonicalPoem
  requestedSlug: string
  canonicalPath: string
  redirect: RedirectEntry | null
}

const GENERATED_DIR = path.join(process.cwd(), 'data', 'generated')
const POEMS_PATH = path.join(GENERATED_DIR, 'poems-final.json')
const RETIRED_PATH = path.join(GENERATED_DIR, 'retired-poems.json')

const loadPoems = cache(async (): Promise<CanonicalPoem[]> => {
  const payload = JSON.parse(await readFile(POEMS_PATH, 'utf-8')) as PoemsPayload
  return payload.poems
})

const loadRedirects = cache(async (): Promise<RedirectEntry[]> => {
  const payload = JSON.parse(await readFile(RETIRED_PATH, 'utf-8')) as RetiredPayload
  return payload.redirects || []
})

export async function getCanonicalPoems(): Promise<CanonicalPoem[]> {
  return loadPoems()
}

export async function resolvePoemRoute(requestedSlug: string): Promise<ResolvedPoemRoute | null> {
  const poems = await loadPoems()
  const normalized = decodeURIComponent(requestedSlug)
  const direct = poems.find((poem) => poem.slug === normalized || poem.id === normalized)
  if (direct) {
    return {
      poem: direct,
      requestedSlug: normalized,
      canonicalPath: `/poem/${direct.slug}`,
      redirect: null,
    }
  }

  const redirects = await loadRedirects()
  const match = redirects.find(
    (entry) => entry.oldId === normalized || entry.oldSlug === normalized,
  )
  if (!match) {
    return null
  }

  const redirected = poems.find(
    (poem) => poem.id === match.newId || poem.slug === match.newSlug,
  )
  if (!redirected) {
    return null
  }

  return {
    poem: redirected,
    requestedSlug: normalized,
    canonicalPath: `/poem/${redirected.slug}`,
    redirect: match,
  }
}

export function buildPoemDescription(poem: CanonicalPoem): string {
  const seed = poem.excerpt || poem.body
  const singleLine = seed.replace(/\s+/g, ' ').trim()
  return singleLine.slice(0, 180)
}

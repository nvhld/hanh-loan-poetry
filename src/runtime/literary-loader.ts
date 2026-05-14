/**
 * IMPORTANT:
 * This layer preserves the atmospheric literary runtime.
 * Do NOT recreate runtime behavior in React.
 * React is infrastructure only.
 */
export type LiteraryRuntimeEntry = 'reader' | 'archive' | 'lab'

export type LiteraryRouteContext = {
  poemId?: string
  poemSlug?: string
  requestedSlug?: string
  canonicalPath?: string
}

type RuntimeManifestEntry = {
  file: string
  route: string
  dependencies: string[]
  sha256: string
}

type RuntimeManifest = {
  version: string
  runtimeVersion?: string
  runtimeRoot: string
  entries: Record<string, RuntimeManifestEntry>
}

type RuntimeFlags = {
  reducedAtmospherics: boolean
  inAppBrowser: boolean
  lowEndDevice: boolean
  reducedMotion: boolean
}

type RuntimeLoadOptions = {
  entry: LiteraryRuntimeEntry
  routeContext?: LiteraryRouteContext
}

const RUNTIME_MANIFEST_URL = '/literary/runtime-manifest.json'

function isInAppBrowser() {
  return /FBAN|FBAV|Instagram|Line|Zalo/i.test(window.navigator.userAgent)
}

function isLowEndDevice() {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
    deviceMemory?: number
  }
  const connection = nav.connection
  return Boolean(
    connection?.saveData
      || connection?.effectiveType === 'slow-2g'
      || connection?.effectiveType === '2g'
      || (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4)
      || (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4),
  )
}

function createRuntimeFlags(): RuntimeFlags {
  const params = new URLSearchParams(window.location.search)
  const forcedMinimal = params.get('runtime') === 'minimal'
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const inAppBrowser = isInAppBrowser()
  const lowEndDevice = isLowEndDevice()
  return {
    reducedAtmospherics: forcedMinimal || reducedMotion || inAppBrowser || lowEndDevice,
    inAppBrowser,
    lowEndDevice,
    reducedMotion,
  }
}

function upsertHeadTag(doc: Document, selector: string) {
  const current = document.head.querySelector(selector)
  if (!current) return
  const incoming = doc.head.querySelector(selector)
  if (incoming) {
    incoming.replaceWith(current.cloneNode(true))
    return
  }
  doc.head.appendChild(current.cloneNode(true))
}

function carryShellMetadata(doc: Document) {
  upsertHeadTag(doc, 'title')
  for (const selector of [
    'meta[name="description"]',
    'meta[property="og:title"]',
    'meta[property="og:description"]',
    'meta[property="og:url"]',
    'meta[property="og:image"]',
    'meta[name="twitter:title"]',
    'meta[name="twitter:description"]',
    'meta[name="twitter:card"]',
    'link[rel="canonical"]',
  ]) {
    upsertHeadTag(doc, selector)
  }
}

function injectRuntimeBootstrap(
  doc: Document,
  manifest: RuntimeManifest,
  entry: LiteraryRuntimeEntry,
  routeContext: LiteraryRouteContext | undefined,
) {
  const script = doc.createElement('script')
  script.textContent = [
    `window.__HL_RUNTIME_FLAGS = ${JSON.stringify(createRuntimeFlags())};`,
    `window.__HL_ROUTE_CONTEXT = ${JSON.stringify(routeContext ?? {})};`,
    `window.__HL_RUNTIME_MANIFEST = ${JSON.stringify({ version: manifest.version, runtimeVersion: manifest.runtimeVersion, entry })};`,
  ].join('\n')
  doc.head.appendChild(script)
}

function ensureRuntimeBase(doc: Document, runtimeRoot: string) {
  const existing = doc.head.querySelector('base')
  if (existing) {
    existing.setAttribute('href', runtimeRoot)
    return
  }
  const base = doc.createElement('base')
  base.setAttribute('href', runtimeRoot)
  doc.head.prepend(base)
}

export async function loadLiteraryRuntime({ entry, routeContext }: RuntimeLoadOptions) {
  const manifestResponse = await fetch(RUNTIME_MANIFEST_URL, { cache: 'no-store' })
  if (!manifestResponse.ok) {
    throw new Error(`Failed to load runtime manifest: ${manifestResponse.status}`)
  }

  const manifest = await manifestResponse.json() as RuntimeManifest
  const runtimeEntry = manifest.entries[entry]
  if (!runtimeEntry) {
    throw new Error(`Runtime entry missing: ${entry}`)
  }

  const htmlResponse = await fetch(`/literary/${runtimeEntry.file}`, { cache: 'no-store' })
  if (!htmlResponse.ok) {
    throw new Error(`Failed to load literary runtime: ${htmlResponse.status}`)
  }

  const html = await htmlResponse.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  ensureRuntimeBase(doc, manifest.runtimeRoot || '/literary/')
  carryShellMetadata(doc)
  injectRuntimeBootstrap(doc, manifest, entry, routeContext)

  const serialized = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`
  document.open()
  document.write(serialized)
  document.close()
}

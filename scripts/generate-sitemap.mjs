/**
 * Builds public/sitemap.xml from published content.
 *
 * Run as part of `npm run build` (before `vite build` so the
 * fresh sitemap.xml + robots.txt are copied into `dist/`):
 *   npm run sitemap
 *
 * Add SITE_URL to your host's environment (for example
 * https://cccyouth.org) or it falls back to a placeholder.
 * Content comes from the CityYouth backend API (VITE_API_URL).
 * If the API is unreachable, a static-only sitemap is written
 * so the build never fails because of SEO.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const readEnv = () => {
  const out = { ...process.env }
  try {
    for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*?)\r?$/)
      if (m) out[m[1]] ??= m[2].trim()
    }
  } catch {
    /* no .env.local in CI - rely on real environment variables */
  }
  return out
}

const env = readEnv()
const SITE = (env.SITE_URL ?? 'https://example.com').replace(/\/$/, '')
const API = (env.VITE_API_URL ?? '').replace(/\/$/, '')

const staticPaths = [
  ['/', '1.0', 'weekly'],
  ['/about', '0.6', 'monthly'],
  ['/events', '0.9', 'weekly'],
  ['/activities', '0.9', 'weekly'],
  ['/memories', '0.7', 'monthly'],
  ['/announcements', '0.7', 'weekly'],
  ['/gallery', '0.6', 'monthly'],
  ['/contact', '0.5', 'yearly'],
]

const url = (loc, priority, changefreq, lastmod) =>
  `  <url>\n    <loc>${SITE}${loc}</loc>\n` +
  (lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>\n` : '') +
  `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`

const writeSitemap = (dynamicUrls) => {
  const body = [
    ...staticPaths.map(([p, pr, cf]) => url(p, pr, cf)),
    ...dynamicUrls,
  ].join('\n')

  writeFileSync(
    'public/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  )

  writeFileSync(
    'public/robots.txt',
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\n\nSitemap: ${SITE}/sitemap.xml\n`,
  )
}

if (!API) {
  console.warn('Sitemap: VITE_API_URL missing — writing static-only sitemap.')
  writeSitemap([])
  console.log(`Sitemap: ${staticPaths.length} static URLs written.`)
  process.exit(0)
}

const getSlugs = async (path) => {
  const res = await fetch(`${API}${path}`)
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`)
  const body = await res.json()
  const items = Array.isArray(body) ? body : (body.items ?? [])
  if (!Array.isArray(items)) throw new Error(`${path} -> unexpected shape`)
  return items.map((x) => x.slug).filter(Boolean)
}

try {
  const [activities, events, announcements] = await Promise.all([
    getSlugs('/api/activities?pageSize=1000'),
    getSlugs('/api/events?filter=all&pageSize=1000'),
    getSlugs('/api/announcements?pageSize=1000'),
  ])

  const dynamicUrls = [
    ...activities.map((s) => url(`/activities/${s}`, '0.8', 'monthly')),
    ...events.map((s) => url(`/events/${s}`, '0.8', 'monthly')),
    ...announcements.map((s) => url(`/announcements/${s}`, '0.6', 'monthly')),
  ]

  writeSitemap(dynamicUrls)
  console.log(`Sitemap: ${staticPaths.length + dynamicUrls.length} URLs written.`)
} catch (e) {
  console.warn(`Sitemap: API unreachable (${e.message}) — writing static-only sitemap.`)
  writeSitemap([])
  console.log(`Sitemap: ${staticPaths.length} static URLs written.`)
}

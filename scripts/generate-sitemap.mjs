/**
 * Builds public/sitemap.xml from published content.
 *
 * Run after `vite build`:
 *   node scripts/generate-sitemap.mjs && vite build
 *
 * Add SITE_URL to your host's environment (for example
 * https://cccyouth.org) or it falls back to a placeholder.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'

const readEnv = () => {
  const out = { ...process.env }
  try {
    for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (m) out[m[1]] ??= m[2].trim()
    }
  } catch {
    /* no .env.local in CI - rely on real environment variables */
  }
  return out
}

const env = readEnv()
const SITE = (env.SITE_URL ?? 'https://example.com').replace(/\/$/, '')
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

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

const [activities, events] = await Promise.all([
  supabase.from('activities').select('slug, updated_at').in('status', ['published', 'archived']),
  supabase.from('events').select('slug, updated_at').in('status', ['published', 'archived']),
])

if (activities.error || events.error) {
  console.error('Sitemap: could not read content -', (activities.error ?? events.error).message)
  process.exit(1)
}

const url = (loc, priority, changefreq, lastmod) =>
  `  <url>\n    <loc>${SITE}${loc}</loc>\n` +
  (lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>\n` : '') +
  `    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`

const body = [
  ...staticPaths.map(([p, pr, cf]) => url(p, pr, cf)),
  ...activities.data.map((a) => url(`/activities/${a.slug}`, '0.8', 'monthly', a.updated_at)),
  ...events.data.map((e) => url(`/events/${e.slug}`, '0.8', 'monthly', e.updated_at)),
].join('\n')

writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
)

writeFileSync(
  'public/robots.txt',
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\n\nSitemap: ${SITE}/sitemap.xml\n`,
)

console.log(
  `Sitemap: ${staticPaths.length + activities.data.length + events.data.length} URLs written.`,
)

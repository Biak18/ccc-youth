import { useEffect } from 'react'

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    const [name, val] = selector.replace(/^meta\[|\]$/g, '').split('=')
    el.setAttribute(name, val.replace(/"/g, ''))
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

/**
 * Per-page title, description and Open Graph tags.
 *
 * Note: this runs in the browser. Search engines execute JavaScript, but
 * Facebook's link scraper does not, so shared links use the static tags
 * in index.html. See README-PHASE8.md for prerendering if per-page
 * Facebook previews become important.
 */
export default function Seo({
  title,
  description,
  image,
  type = 'website',
}: {
  title: string
  description?: string
  image?: string | null
  type?: 'website' | 'article'
}) {
  const full = title.includes('Christian City Church')
    ? title
    : `${title} | Christian City Church Youth`

  useEffect(() => {
    document.title = full
    if (description) {
      setMeta('meta[name="description"]', 'content', description)
      setMeta('meta[property="og:description"]', 'content', description)
    }
    setMeta('meta[property="og:title"]', 'content', full)
    setMeta('meta[property="og:type"]', 'content', type)
    setMeta('meta[property="og:url"]', 'content', window.location.href)
    if (image) setMeta('meta[property="og:image"]', 'content', image)

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = window.location.origin + window.location.pathname
  }, [full, description, image, type])

  return null
}

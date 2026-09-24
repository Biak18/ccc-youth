import { useEffect, useState } from 'react'
import { authedGet, authedPut } from '../../lib/api'
import { useAdminQuery } from '../../hooks/useAdminData'
import { uploadSingleImage } from '../../lib/upload'
import type { SiteSettings } from '../../types/db'
import {
  AdminHeader,
  Field,
  FormError,
  btnPrimary,
  inputClass,
} from '../../components/admin/AdminUI'

type FormState = {
  churchName: string
  tagline: string
  description: string
  address: string
  phone: string
  email: string
  facebookUrl: string
  youtubeUrl: string
  instagramUrl: string
}

const empty: FormState = {
  churchName: '',
  tagline: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  facebookUrl: '',
  youtubeUrl: '',
  instagramUrl: '',
}

export default function Settings() {
  const { data } = useAdminQuery<SiteSettings>(['admin', 'settings'], () =>
    authedGet<SiteSettings>('/api/settings'),
  )
  const [form, setForm] = useState<FormState>(empty)
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!data) return
    setForm({
      churchName: data.churchName ?? '',
      tagline: data.tagline ?? '',
      description: data.description ?? '',
      address: data.address ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      facebookUrl: data.facebookUrl ?? '',
      youtubeUrl: data.youtubeUrl ?? '',
      instagramUrl: data.instagramUrl ?? '',
    })
    setHeroImages(data.heroImages ?? [])
  }, [data])

  const moveHero = (index: number, dir: -1 | 1) =>
    setHeroImages((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setSaved(false)

    const clean = (v: string) => (v.trim() === '' ? null : v.trim())
    try {
      await authedPut('/api/settings', {
        churchName: clean(form.churchName),
        youthName: data?.youthName ?? null,
        logoUrl: data?.logoUrl ?? null,
        tagline: clean(form.tagline),
        description: clean(form.description),
        address: clean(form.address),
        phone: clean(form.phone),
        email: clean(form.email),
        facebookUrl: clean(form.facebookUrl),
        youtubeUrl: clean(form.youtubeUrl),
        instagramUrl: clean(form.instagramUrl),
        heroImages,
        heroImageUrl: heroImages[0] ?? null,
      })
      setSaved(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <AdminHeader
        title="Site Settings"
        subtitle="These values appear across the public website."
      />

      <form onSubmit={save} className="space-y-6 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-line">
        <FormError message={error} />
        {saved && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            Settings saved.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Church name">
            <input value={form.churchName} onChange={set('churchName')} className={inputClass} />
          </Field>
          <Field label="Tagline">
            <input value={form.tagline} onChange={set('tagline')} className={inputClass} />
          </Field>
        </div>

        <Field label="Description" hint="Used for search engines and link previews.">
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={3}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Address">
            <input value={form.address} onChange={set('address')} className={inputClass} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={set('phone')} className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
          </Field>
          <Field label="Facebook URL">
            <input
              type="url"
              value={form.facebookUrl}
              onChange={set('facebookUrl')}
              className={inputClass}
            />
          </Field>
          <Field label="YouTube URL">
            <input
              type="url"
              value={form.youtubeUrl}
              onChange={set('youtubeUrl')}
              className={inputClass}
            />
          </Field>
          <Field label="Instagram URL">
            <input
              type="url"
              value={form.instagramUrl}
              onChange={set('instagramUrl')}
              className={inputClass}
            />
          </Field>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Hero photos</h2>
          <p className="mb-2 text-xs text-muted">
            Shown as a rotating carousel on the homepage. Add two or three for the
            best effect. If you add none, the photos bundled with the site are used.
          </p>

          {heroImages.length > 0 && (
            <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {heroImages.map((url, i) => (
                <li key={url} className="overflow-hidden rounded-lg ring-1 ring-line">
                  <img src={url} alt="" className="aspect-video w-full object-cover" />
                  <div className="flex items-center justify-between gap-1 bg-card p-1.5">
                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveHero(i, -1)}
                        disabled={i === 0}
                        aria-label="Move photo earlier"
                        className="rounded px-1.5 py-1 text-xs text-heading hover:bg-surface disabled:opacity-30"
                      >
                        &larr;
                      </button>
                      <button
                        type="button"
                        onClick={() => moveHero(i, 1)}
                        disabled={i === heroImages.length - 1}
                        aria-label="Move photo later"
                        className="rounded px-1.5 py-1 text-xs text-heading hover:bg-surface disabled:opacity-30"
                      >
                        &rarr;
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHeroImages((p) => p.filter((u) => u !== url))}
                      className="rounded px-1.5 py-1 text-xs font-semibold text-brand-red hover:bg-brand-red/10"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
            className="text-sm"
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? [])
              e.target.value = ''
              if (!files.length) return
              setBusy(true)
              setError(null)
              try {
                for (const f of files) {
                  const url = await uploadSingleImage(f, 'branding')
                  setHeroImages((prev) => [...prev, url])
                }
              } catch (err) {
                setError((err as Error).message)
              } finally {
                setBusy(false)
              }
            }}
          />
          <p className="mt-1 text-xs text-muted">
            You can select several at once. Remember to press Save.
          </p>
        </div>

        <div className="border-t border-line pt-6">
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>
    </>
  )
}

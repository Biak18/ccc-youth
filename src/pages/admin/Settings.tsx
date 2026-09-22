import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
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
  church_name: string
  tagline: string
  description: string
  address: string
  phone: string
  email: string
  facebook_url: string
  youtube_url: string
  instagram_url: string
  hero_image_url: string
}

const empty: FormState = {
  church_name: '',
  tagline: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  facebook_url: '',
  youtube_url: '',
  instagram_url: '',
  hero_image_url: '',
}

export default function Settings() {
  const { data } = useAdminQuery<SiteSettings>(() =>
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
  )
  const [form, setForm] = useState<FormState>(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!data) return
    setForm({
      church_name: data.church_name ?? '',
      tagline: data.tagline ?? '',
      description: data.description ?? '',
      address: data.address ?? '',
      phone: data.phone ?? '',
      email: data.email ?? '',
      facebook_url: data.facebook_url ?? '',
      youtube_url: data.youtube_url ?? '',
      instagram_url: data.instagram_url ?? '',
      hero_image_url: data.hero_image_url ?? '',
    })
  }, [data])

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setSaved(false)

    const clean = (v: string) => (v.trim() === '' ? null : v.trim())
    const payload = {
      church_name: clean(form.church_name),
      tagline: clean(form.tagline),
      description: clean(form.description),
      address: clean(form.address),
      phone: clean(form.phone),
      email: clean(form.email),
      facebook_url: clean(form.facebook_url),
      youtube_url: clean(form.youtube_url),
      instagram_url: clean(form.instagram_url),
      hero_image_url: clean(form.hero_image_url),
    }

    const { error } = await supabase.from('site_settings').update(payload).eq('id', 1)
    setBusy(false)
    if (error) setError(error.message)
    else setSaved(true)
  }

  return (
    <>
      <AdminHeader
        title="Site Settings"
        subtitle="These values appear across the public website."
      />

      <form onSubmit={save} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line">
        <FormError message={error} />
        {saved && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            Settings saved.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Church name">
            <input value={form.church_name} onChange={set('church_name')} className={inputClass} />
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
              value={form.facebook_url}
              onChange={set('facebook_url')}
              className={inputClass}
            />
          </Field>
          <Field label="YouTube URL">
            <input
              type="url"
              value={form.youtube_url}
              onChange={set('youtube_url')}
              className={inputClass}
            />
          </Field>
          <Field label="Instagram URL">
            <input
              type="url"
              value={form.instagram_url}
              onChange={set('instagram_url')}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Hero image" hint="Replaces the built-in Youth group photo on the homepage.">
          <div className="flex items-center gap-4">
            {form.hero_image_url && (
              <img
                src={form.hero_image_url}
                alt=""
                className="h-20 w-32 rounded-lg object-cover ring-1 ring-line"
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setBusy(true)
                try {
                  const url = await uploadSingleImage(f, 'branding', 'hero')
                  setForm((prev) => ({ ...prev, hero_image_url: url }))
                } catch (err) {
                  setError((err as Error).message)
                } finally {
                  setBusy(false)
                }
              }}
            />
            {form.hero_image_url && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, hero_image_url: '' }))}
                className="text-sm font-semibold text-brand-red hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </Field>

        <div className="border-t border-line pt-6">
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>
    </>
  )
}

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAllLeaders } from '../../hooks/useAdminData'
import { uploadSingleImage } from '../../lib/upload'
import type { YouthLeader } from '../../types/db'
import {
  AdminHeader,
  Field,
  FormError,
  btnPrimary,
  btnSecondary,
  inputClass,
} from '../../components/admin/AdminUI'

const blank = { name: '', role_title: '', bio: '', photo_url: '' }

export default function Leaders() {
  const { data, loading, error, reload } = useAllLeaders()
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const reset = () => {
    setForm(blank)
    setEditingId(null)
  }

  const edit = (l: YouthLeader) => {
    setEditingId(l.id)
    setForm({
      name: l.name,
      role_title: l.role_title ?? '',
      bio: l.bio ?? '',
      photo_url: l.photo_url ?? '',
    })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setBusy(true)
    setActionError(null)

    const payload = {
      name: form.name.trim(),
      role_title: form.role_title.trim() || null,
      bio: form.bio.trim() || null,
      photo_url: form.photo_url || null,
      sort_order: data?.length ?? 0,
      is_visible: true,
    }

    const res = editingId
      ? await supabase.from('youth_leaders').update(payload).eq('id', editingId)
      : await supabase.from('youth_leaders').insert(payload)

    setBusy(false)
    if (res.error) setActionError(res.error.message)
    else {
      reset()
      reload()
    }
  }

  const run = async (fn: () => PromiseLike<{ error: { message: string } | null }>) => {
    const { error } = await fn()
    if (error) setActionError(error.message)
    else reload()
  }

  return (
    <>
      <AdminHeader title="Youth Leaders" subtitle="Shown on the homepage and About page." />

      <FormError message={error ?? actionError} />

      <form
        onSubmit={save}
        className="mb-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-line"
      >
        <h2 className="font-bold text-navy">{editingId ? 'Edit leader' : 'Add a leader'}</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" required>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Role">
            <input
              value={form.role_title}
              onChange={(e) => setForm({ ...form, role_title: e.target.value })}
              placeholder="Youth Leader"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Short bio">
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className={inputClass}
          />
        </Field>

        <Field label="Photo">
          <div className="flex items-center gap-4">
            {form.photo_url && (
              <img
                src={form.photo_url}
                alt=""
                className="h-16 w-16 rounded-full object-cover ring-1 ring-line"
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
                  const url = await uploadSingleImage(f, 'images', 'leaders')
                  setForm((prev) => ({ ...prev, photo_url: url }))
                } catch (err) {
                  setActionError((err as Error).message)
                } finally {
                  setBusy(false)
                }
              }}
            />
          </div>
        </Field>

        <div className="flex gap-3">
          <button type="submit" disabled={busy} className={btnPrimary}>
            {editingId ? 'Save changes' : 'Add leader'}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className={btnSecondary}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-line">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-muted">Loading...</p>
        ) : data?.length ? (
          <ul className="divide-y divide-line">
            {data.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                {l.photo_url ? (
                  <img src={l.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy font-bold text-white">
                    {l.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy">{l.name}</p>
                  <p className="truncate text-sm text-muted">{l.role_title}</p>
                </div>
                {!l.is_visible && (
                  <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-bold uppercase text-gray-700">
                    Hidden
                  </span>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => edit(l)}
                    className="text-sm font-semibold text-navy hover:text-brand-red"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      run(() =>
                        supabase
                          .from('youth_leaders')
                          .update({ is_visible: !l.is_visible })
                          .eq('id', l.id),
                      )
                    }
                    className="text-sm font-semibold text-navy hover:text-brand-red"
                  >
                    {l.is_visible ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Remove ${l.name}?`))
                        run(() => supabase.from('youth_leaders').delete().eq('id', l.id))
                    }}
                    className="text-sm font-semibold text-brand-red hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted">No leaders added yet.</p>
        )}
      </div>
    </>
  )
}

import { useState } from 'react'
import { authedDelete, authedPost, authedPut } from '../../lib/api'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
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

const blank = { name: '', roleTitle: '', bio: '', photoUrl: '' }

export default function Leaders() {
  const { data, loading, error, reload, setData } = useAllLeaders()
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<YouthLeader | null>(null)

  const reset = () => {
    setForm(blank)
    setEditingId(null)
  }

  const edit = (l: YouthLeader) => {
    setEditingId(l.id)
    setForm({
      name: l.name,
      roleTitle: l.roleTitle ?? '',
      bio: l.bio ?? '',
      photoUrl: l.photoUrl ?? '',
    })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setBusy(true)
    setActionError(null)

    try {
      if (editingId) {
        // The update endpoint replaces the whole row, so untouched
        // fields must be re-sent from the loaded record.
        const current = data?.find((l) => l.id === editingId)
        await authedPut(`/api/leaders/${editingId}`, {
          userId: current?.userId ?? null,
          name: form.name.trim(),
          roleTitle: form.roleTitle.trim() || null,
          bio: form.bio.trim() || null,
          photoUrl: form.photoUrl || null,
          sortOrder: current?.sortOrder ?? 0,
          isVisible: current?.isVisible ?? true,
        })
      } else {
        await authedPost('/api/leaders', {
          name: form.name.trim(),
          roleTitle: form.roleTitle.trim() || null,
          bio: form.bio.trim() || null,
          photoUrl: form.photoUrl || null,
          sortOrder: data?.length ?? 0,
          isVisible: true,
        })
      }
      reset()
      reload()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  /** Replaces the whole row: every field is re-sent with one swapped order. */
  const putFull = (l: YouthLeader, sortOrder: number, isVisible: boolean) =>
    authedPut(`/api/leaders/${l.id}`, {
      userId: l.userId,
      name: l.name,
      roleTitle: l.roleTitle,
      photoUrl: l.photoUrl,
      bio: l.bio,
      sortOrder,
      isVisible,
    })

  const move = async (index: number, dir: -1 | 1) => {
    const rows = data ?? []
    const target = index + dir
    if (target < 0 || target >= rows.length) return
    const a = rows[index]
    const b = rows[target]
    setActionError(null)
    try {
      await putFull(a, target, a.isVisible)
      await putFull(b, index, b.isVisible)
      reload()
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn()
      reload()
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  return (
    <>
      <AdminHeader title="Youth Leaders" subtitle="Shown on the homepage and About page." />

      <FormError message={error ?? actionError} />

      <form
        onSubmit={save}
        className="mb-8 space-y-5 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-line"
      >
        <h2 className="font-bold text-heading">{editingId ? 'Edit leader' : 'Add a leader'}</h2>

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
              value={form.roleTitle}
              onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
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
            {form.photoUrl && (
              <img
                src={form.photoUrl}
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
                  const url = await uploadSingleImage(f, 'images')
                  setForm((prev) => ({ ...prev, photoUrl: url }))
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

      <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-line">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-muted">Loading...</p>
        ) : data?.length ? (
          <ul className="divide-y divide-line">
            {data.map((l, i) => (
              <li key={l.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label={`Move ${l.name} up`}
                    className="px-1 text-heading hover:text-brand-red disabled:opacity-30"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === (data?.length ?? 0) - 1}
                    aria-label={`Move ${l.name} down`}
                    className="px-1 text-heading hover:text-brand-red disabled:opacity-30"
                  >
                    &darr;
                  </button>
                </div>
                {l.photoUrl ? (
                  <img src={l.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy font-bold text-white">
                    {l.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-heading">{l.name}</p>
                  <p className="truncate text-sm text-muted">{l.roleTitle}</p>
                </div>
                {!l.isVisible && (
                  <span className="rounded bg-gray-200 px-2 py-0.5 text-xs font-bold uppercase text-gray-700">
                    Hidden
                  </span>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => edit(l)}
                    className="text-sm font-semibold text-heading hover:text-brand-red"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      run(() => putFull(l, l.sortOrder, !l.isVisible))
                    }
                    className="text-sm font-semibold text-heading hover:text-brand-red"
                  >
                    {l.isVisible ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(l)}
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

      <ConfirmDialog
        open={pendingDelete !== null}
        title={pendingDelete ? `Remove ${pendingDelete.name}?` : ''}
        onConfirm={async () => {
          if (!pendingDelete) return
          const snapshot = data ?? []
          const id = pendingDelete.id
          setPendingDelete(null)
          setData(snapshot.filter((l) => l.id !== id))
          try {
            await authedDelete(`/api/leaders/${id}`)
            reload()
          } catch (err) {
            setData(snapshot)
            setActionError((err as Error).message)
          }
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}

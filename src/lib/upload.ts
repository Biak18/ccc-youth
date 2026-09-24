import { API_BASE, tokenStore } from './api'

/**
 * Uploads go browser → backend → Cloudinary, so public URLs are
 * `res.cloudinary.com` (reachable without VPN).
 *
 * The canvas WebP compression stays: the backend accepts the bytes
 * as-is, so compressing client-side still saves bandwidth.
 */
async function toWebp(file: File, maxEdge: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process this image')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', quality),
  )
  if (!blob) throw new Error('Could not compress this image')
  return blob
}

export type UploadBucket = 'branding' | 'images' | 'thumbnails' | 'videos'

async function uploadBlob(blob: Blob, bucket: UploadBucket): Promise<string> {
  const form = new FormData()
  form.append('bucket', bucket)
  form.append('file', blob, 'photo.webp')

  const res = await fetch(`${API_BASE}/api/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenStore.getAccess()}` },
    body: form,
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      title?: string
      detail?: string
    } | null
    throw new Error(body?.detail ?? body?.title ?? `Upload failed (${res.status})`)
  }
  const { url } = (await res.json()) as { url: string }
  return url
}

export type UploadedPhoto = { url: string; thumbnailUrl: string }

/**
 * Uploads a full-size image plus a small thumbnail (two calls, one
 * per bucket) and returns both Cloudinary URLs.
 */
export async function uploadPhoto(file: File): Promise<UploadedPhoto> {
  const full = await toWebp(file, 1920, 0.82)
  const thumb = await toWebp(file, 480, 0.75)
  const [url, thumbnailUrl] = await Promise.all([
    uploadBlob(full, 'images'),
    uploadBlob(thumb, 'thumbnails'),
  ])
  return { url, thumbnailUrl }
}

/** Uploads one branding/leader/cover image and returns its Cloudinary URL. */
export async function uploadSingleImage(
  file: File,
  bucket: UploadBucket = 'branding',
): Promise<string> {
  return uploadBlob(await toWebp(file, 1200, 0.85), bucket)
}

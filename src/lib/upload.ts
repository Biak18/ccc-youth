import { supabase } from './supabase'

/**
 * Resize and compress in the browser before upload, so a 5 MB phone
 * photo becomes a few hundred KB. Keeps storage small and the public
 * gallery fast (ARCHITECTURE.md section 11).
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

export type UploadedPhoto = { url: string; thumbnail_url: string }

/** Uploads a full-size image plus a small thumbnail. */
export async function uploadPhoto(
  file: File,
  activityId: string,
): Promise<UploadedPhoto> {
  const id = crypto.randomUUID()
  const path = `${activityId}/${id}.webp`

  const full = await toWebp(file, 1920, 0.82)
  const thumb = await toWebp(file, 480, 0.75)

  const up1 = await supabase.storage
    .from('images')
    .upload(path, full, { contentType: 'image/webp', upsert: false })
  if (up1.error) throw new Error(up1.error.message)

  const up2 = await supabase.storage
    .from('thumbnails')
    .upload(path, thumb, { contentType: 'image/webp', upsert: false })
  if (up2.error) throw new Error(up2.error.message)

  return {
    url: supabase.storage.from('images').getPublicUrl(path).data.publicUrl,
    thumbnail_url: supabase.storage.from('thumbnails').getPublicUrl(path).data.publicUrl,
  }
}

/** Uploads one branding or leader image and returns its public URL. */
export async function uploadSingleImage(
  file: File,
  bucket: 'branding' | 'images',
  folder = 'misc',
): Promise<string> {
  const path = `${folder}/${crypto.randomUUID()}.webp`
  const blob = await toWebp(file, 1200, 0.85)
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType: 'image/webp' })
  if (error) throw new Error(error.message)
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

/** Best-effort storage cleanup when a photo is removed. */
export async function deletePhotoFiles(url: string) {
  const marker = '/storage/v1/object/public/images/'
  const i = url.indexOf(marker)
  if (i === -1) return
  const path = url.slice(i + marker.length)
  await supabase.storage.from('images').remove([path])
  await supabase.storage.from('thumbnails').remove([path])
}

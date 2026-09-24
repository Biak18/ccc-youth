import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  authedDelete,
  authedPatch,
  authedPost,
  authedPut,
  ApiError,
} from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useActivityById, useMediaByActivity } from "../../hooks/useAdminData";
import { slugify } from "../../lib/format";
import { CATEGORIES } from "../../lib/categories";
import { uploadPhoto } from "../../lib/upload";
import type { Activity, Media } from "../../types/db";
import PhotoUploader, {
  type PendingPhoto,
} from "../../components/admin/PhotoUploader";
import VideoLinks, {
  type PendingVideo,
} from "../../components/admin/VideoLinks";
import {
  AdminHeader,
  Field,
  FormError,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "../../components/admin/AdminUI";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { youtubeId } from "../../lib/format";

export default function ActivityForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const existingActivity = useActivityById(id);
  const existingMedia = useMediaByActivity(id);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [activityDate, setActivityDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const [photos, setPhotos] = useState<Media[]>([]);
  const [videos, setVideos] = useState<Media[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [pendingVideos, setPendingVideos] = useState<PendingVideo[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoToRemove, setPhotoToRemove] = useState<Media | null>(null);

  // Load the record when editing
  useEffect(() => {
    const a = existingActivity.data;
    if (!a) return;
    setTitle(a.title);
    setSlug(a.slug);
    setActivityDate(a.activityDate);
    setLocation(a.location ?? "");
    setCategory(a.category ?? "");
    setDescription(a.description ?? "");
    setCoverUrl(a.coverImageUrl);
  }, [existingActivity.data]);

  useEffect(() => {
    const rows = existingMedia.data ?? [];
    setPhotos(rows.filter((m) => m.type === "image"));
    setVideos(rows.filter((m) => m.type === "video"));
  }, [existingMedia.data]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  // Release object URLs
  useEffect(
    () => () => pendingPhotos.forEach((p) => URL.revokeObjectURL(p.preview)),
    [pendingPhotos],
  );

  const addFiles = (files: File[]) =>
    setPendingPhotos((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: crypto.randomUUID(),
      })),
    ]);

  const movePhoto = (index: number, dir: -1 | 1) => {
    setPhotos((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeExistingPhoto = async () => {
    const m = photoToRemove;
    if (!m) return;
    // Optimistic: drop the thumbnail instantly, sync in the background.
    setPhotoToRemove(null);
    setPhotos((prev) => prev.filter((p) => p.id !== m.id));
    if (coverUrl === m.url) setCoverUrl(null);
    try {
      await authedDelete(`/api/media/${m.id}`);
    } catch (e) {
      // Put it back so the user can retry.
      setPhotos((prev) => {
        const next = [...prev, m];
        next.sort((a, b) => a.sortOrder - b.sortOrder);
        return next;
      });
      if (coverUrl === m.url) setCoverUrl(m.url);
      setError((e as Error).message);
    }
  };

  const removeExistingVideo = async (m: Media) => {
    try {
      await authedDelete(`/api/media/${m.id}`);
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    setVideos((prev) => prev.filter((v) => v.id !== m.id));
  };

  const friendlyError = (e: unknown) => {
    if (
      e instanceof ApiError &&
      (e.status === 409 || e.status === 400) &&
      /slug/i.test(e.message)
    ) {
      return "That web address (slug) is already used by another activity. Change it and try again.";
    }
    return (e as Error).message ?? "Could not save this activity.";
  };

  const save = async (publish: boolean) => {
    if (!user) return;
    if (!title.trim() || !activityDate) {
      setError("Title and activity date are required.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      // Uploads need no activity id (they just return Cloudinary URLs),
      // so they go first — the cover URL is then known before the
      // activity itself is created/updated.
      const uploaded: { url: string; thumbnailUrl: string }[] = [];
      for (let i = 0; i < pendingPhotos.length; i++) {
        setProgress(`Uploading photo ${i + 1} of ${pendingPhotos.length}...`);
        uploaded.push(await uploadPhoto(pendingPhotos[i].file));
      }

      // Cover image: explicit choice, else the first photo. It is sent
      // with the main PUT/POST below — the update endpoint replaces the
      // whole record and requires Title/ActivityDate, so a cover-only
      // PUT fails validation with a 400.
      const cover = coverUrl ?? photos[0]?.url ?? uploaded[0]?.url ?? null;

      // 1. Create (always starts as a draft) or update the activity.
      //    Slug is only sent on create when the user customized it;
      //    the backend slugifies + dedupes otherwise. Status changes
      //    go through the status endpoint, never PUT.
      let activityId = id ?? "";
      if (editing) {
        await authedPut(`/api/activities/${activityId}`, {
          title: title.trim(),
          description: description.trim() || null,
          activityDate,
          location: location.trim() || null,
          coverImageUrl: cover,
          category: category || null,
        });
      } else {
        const created = await authedPost<Activity>("/api/activities", {
          title: title.trim(),
          ...(slugTouched && slug.trim() ? { slug: slug.trim() } : {}),
          description: description.trim() || null,
          activityDate,
          location: location.trim() || null,
          coverImageUrl: cover,
          category: category || null,
        });
        activityId = created.id;
      }

      // 3. Attach uploaded photos as media rows
      for (let i = 0; i < uploaded.length; i++) {
        const u = uploaded[i];
        await authedPost("/api/media", {
          activityId,
          type: "image",
          source: "storage",
          url: u.url,
          thumbnailUrl: u.thumbnailUrl,
          sortOrder: photos.length + i,
        });
      }

      // 4. Insert new video links (YouTube/external skip upload entirely)
      for (let i = 0; i < pendingVideos.length; i++) {
        const v = pendingVideos[i];
        setProgress("Saving videos...");
        await authedPost("/api/media", {
          activityId,
          type: "video",
          source: youtubeId(v.url) ? "youtube" : "external",
          url: v.url,
          title: v.title || null,
          sortOrder: videos.length + i,
        });
      }

      // 5. Persist photo order. The media endpoint replaces the whole
      //    row, so every field must be re-sent or thumbnails/titles
      //    would be wiped to null.
      setProgress("Saving order...");
      await Promise.all(
        photos.map((p, i) =>
          authedPut(`/api/media/${p.id}`, {
            thumbnailUrl: p.thumbnailUrl,
            title: p.title,
            description: p.description,
            sortOrder: i,
          }),
        ),
      );

      // 7. Publish is a separate step; a fresh create is already a draft
      if (publish) {
        setProgress("Publishing...");
        await authedPatch(`/api/activities/${activityId}/status`, {
          status: "published",
        });
      }

      navigate("/admin/activities");
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <>
      <AdminHeader
        title={editing ? "Edit Activity" : "New Activity"}
        subtitle="Record something the Youth did, with photos and videos."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(true);
        }}
        className="space-y-6 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-line"
      >
        <FormError message={error} />

        <Field label="Title" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Youth Camp 2026"
            className={inputClass}
            required
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Activity date"
            hint="The day it actually happened."
            required
          >
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className={inputClass}
              required
            />
          </Field>
          <Field label="Location">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Christian City Church"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Category" hint="Used for filtering on the Memories page.">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">No category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Web address" hint={`/activities/${slug || "your-title"}`}>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="A Youth gathering focused on worship, fellowship, Bible study and group activities."
            className={inputClass}
          />
        </Field>

        <div>
          <h2 className="text-sm font-semibold text-ink">Photos</h2>
          <p className="mb-2 text-xs text-muted">
            The cover photo appears on cards. If you do not choose one, the
            first photo is used.
          </p>
          <PhotoUploader
            existing={photos}
            pending={pendingPhotos}
            coverUrl={coverUrl}
            onAddFiles={addFiles}
            onRemovePending={(pid) =>
              setPendingPhotos((prev) => prev.filter((p) => p.id !== pid))
            }
            onRemoveExisting={(m) => setPhotoToRemove(m)}
            onMoveExisting={movePhoto}
            onSetCover={setCoverUrl}
            disabled={busy}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Videos</h2>
          <p className="mb-2 text-xs text-muted">
            Paste a YouTube link. Keeping large videos on YouTube keeps the site
            fast.
          </p>
          <VideoLinks
            existing={videos}
            pending={pendingVideos}
            onAdd={(v) => setPendingVideos((prev) => [...prev, v])}
            onRemovePending={(vid) =>
              setPendingVideos((prev) => prev.filter((p) => p.id !== vid))
            }
            onRemoveExisting={removeExistingVideo}
            disabled={busy}
          />
        </div>

        {progress && (
          <p className="text-sm font-medium text-skyblue">{progress}</p>
        )}

        <div className="flex flex-wrap gap-3 border-t border-line pt-6">
          <button type="submit" disabled={busy} className={btnPrimary}>
            {busy ? "Saving..." : "Publish"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => save(false)}
            className={btnSecondary}
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => navigate("/admin/activities")}
            className={btnSecondary}
          >
            Cancel
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={photoToRemove !== null}
        title="Remove this photo?"
        onConfirm={removeExistingPhoto}
        onCancel={() => setPhotoToRemove(null)}
      />
    </>
  );
}

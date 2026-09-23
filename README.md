# CCC Youth — Christian City Church Youth Website

Youth-focused website for Christian City Church, Yangon, Myanmar. A permanent, searchable home for events, activities, photos, videos, announcements, leaders, and Youth memories — complementing the church's Facebook presence.

Spec lives in `docs/` (`PRD.md`, `ARCHITECTURE.md`, `DATA.md`, `CONTENT.md`, `UI-UX.md`, `ADMIN.md`, `ROADMAP.md`).

## Tech stack

- React 19 + TypeScript + Vite + Tailwind CSS v4
- React Router v7, React Query, React Hook Form + Zod
- Supabase (Postgres + Auth + Storage) via `supabase-js` (admin) and plain REST (public site, so visitors never download the SDK)
- Deployed as SPA on Vercel (`vercel.json`) / Railway (`preview.host + PORT`)

## Getting started

```bash
npm install
npm run dev
```

Copy env (public anon key only — never commit service keys):

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
SITE_URL=https://cccyouth.org   # used for sitemap.xml + robots.txt
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | `tsc -b && npm run sitemap && vite build` (sitemap runs first so `dist/` gets the fresh copy) |
| `npm run sitemap` | Builds `public/sitemap.xml` + `public/robots.txt` from Supabase (falls back to static URLs when credentials are missing, so the build never fails on SEO) |
| `npm run lint` | ESLint |
| `npm run preview` / `npm start` | Serve production build (Railway injects `PORT`) |

## Project structure

```text
src/
  pages/public/   Home, About, Events, EventDetail, Activities,
                  ActivityDetail, Memories, Announcements,
                  AnnouncementDetail, Gallery, Contact, NotFound
  pages/admin/    Dashboard, Activity/Event/Announcement lists + forms,
                  Leaders, Users, Settings, Login
  components/     Cards, Hero, Navbar, Footer, Lightbox, Seo, ...
  hooks/          useContent (public REST), useAdminData, useAuth, useFilters
  lib/            rest, supabase (admin only), upload, format, categories
  routes/         LoginRoute, AdminRoutes (lazy, auth-gated)
  layouts/        PublicLayout, AdminLayout
scripts/
  generate-sitemap.mjs   static + /activities/:slug + /events/:slug + /announcements/:slug
  generate-og-image.ps1
```

Public routes (`src/App.tsx`):

```text
/  /about  /events  /events/:slug  /activities  /activities/:slug
/memories  /announcements  /announcements/:slug  /gallery  /contact
/login  /admin/*
```

## Content model

- **Events** — what's coming (start/end date, location, cover, optional `registration_url`).
- **Activities** — what happened (real `activity_date` kept separate from upload date, cover + `media[]`).
- **Media** — `image | video` × `storage | youtube | external`, ordered by `sort_order`.
- **Announcements** — short notices, `is_pinned` first.
- **Youth leaders** — name, role, photo, bio, `is_visible`.
- **Site settings** (`id = 1`) — church/youth name, tagline, logo, hero, address, socials; overrides `src/site.ts` fallbacks.

Workflow is `draft → published → archived`. Only `published` shows in current sections; `published + archived` stays readable for history (see `useQuery` in `src/hooks/useContent.ts`).

## Admin

- `/login` → `/admin` (roles: `admin`, `leader`; admins manage users/leaders/settings, leaders manage own content — see `docs/ADMIN.md`).
- Dashboard has quick actions + stats + recent activities.
- Forms auto-generate slugs (`slugify`), support Save Draft / Publish, photo multi-upload with preview/reorder/cover-pick, YouTube/external video URLs.

## SEO

- Per-page `<title>`, meta, OG, canonical via `src/components/Seo.tsx` (client-side; static fallback in `index.html` for scrapers).
- `npm run sitemap` writes `public/sitemap.xml` + `public/robots.txt` (`/admin`, `/login` disallowed). Set `SITE_URL` on the host or it falls back to `https://example.com`.
- `public/og-image.jpg`, `favicon.png`, `apple-touch-icon.png` already present.

## What's next

- Analytics (last open item in Roadmap Phase 8).
- Phase 9 candidates: search, event/youth registration, prayer requests, testimonies, devotionals/verse-of-day, newsletter, push notifications.

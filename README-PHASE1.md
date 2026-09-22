# Phase 1 - Foundation (drop-in files)

Your Supabase project `CCC-Youth` already has the tables, RLS policies,
triggers and storage buckets applied. These files are the front end.

## 1. Install

```bash
cd ccc-youth
npm install react-router-dom @supabase/supabase-js date-fns
npm install -D tailwindcss @tailwindcss/vite
```

## 2. Copy these files over your project

Keep the same paths. It replaces `index.html`, `vite.config.ts`,
`src/index.css`, `src/main.tsx`, `src/App.tsx` and adds the rest.
You can delete `src/App.css` and `src/assets/react.svg` from the starter.

`.env.local` is included with your project URL and publishable key.
It is gitignored - never commit it.

## 3. Add your two real assets (required, or the build fails)

```text
src/assets/logo/church-logo.png     <- church logo
src/assets/images/youth-group.jpg   <- Youth group photo (hero)
```

Use exactly those filenames, or update the imports in `Hero.tsx`,
`Navbar.tsx` and `Footer.tsx`.

If TypeScript complains about importing images, make sure
`src/vite-env.d.ts` exists and contains `/// <reference types="vite/client" />`.

## 4. Run

```bash
npm run dev
```

The homepage will show friendly empty states until you add rows.

## 5. Add your first content

Supabase Dashboard -> Table Editor. Set `status` to `published` for
anything that should appear publicly.

- `site_settings` (row id 1 already exists) - put your real Facebook URL,
  address, phone and email here. The site reads them live.
- `youth_leaders` - name, role_title, is_visible = true
- `events` - title, slug, start_date, location, status = published
- `activities` - title, slug, activity_date, status = published

Note: `events`, `activities` and `announcements` require `created_by`
to equal your own user id when inserting as a signed-in leader. Inserting
from the dashboard bypasses RLS, so you can leave it blank for now.

## What you get

- Sticky responsive navbar with mobile hamburger menu
- Hero using the real Youth photo with navy overlay and both CTAs
- Homepage in the exact UI-UX.md order: Hero, Next Event, Latest Activities,
  Latest Videos, Youth Memories, Announcements, Youth Leaders, Facebook CTA, Footer
- Pages: About, Events (upcoming/past), Activities, Memories (grouped by year),
  Announcements (pinned first), Gallery placeholder, Contact, 404
- Live Supabase queries in `src/hooks/useContent.ts`, all filtered to
  `status = 'published'`
- Typed schema in `src/types/db.ts`
- Brand tokens as Tailwind colors: `navy`, `navy-dark`, `brand-red`,
  `brand-red-dark`, `skyblue`, `surface`, `ink`, `muted`, `line`
- Loading skeletons, empty states, error states
- Accessibility: skip link, focus rings, semantic headings, alt text, aria labels
- SPA rewrites for both Netlify (`public/_redirects`) and Vercel (`vercel.json`)

## Next (Phase 4)

Create your admin account: Supabase Dashboard -> Authentication -> Add user.
A `profiles` row is created automatically with role `leader`; change it to
`admin` in the Table Editor.

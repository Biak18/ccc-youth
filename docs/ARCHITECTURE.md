# Architecture

## 1. Overview

The Christian City Church Youth website consists of:

```text
Public Website
      │
      ├── Homepage
      ├── Events
      ├── Activities
      ├── Memories
      ├── Announcements
      ├── Gallery
      └── Church Information
             │
             ▼
        Backend / API
             │
      ┌──────┴──────┐
      ▼             ▼
   Database       Storage
      │             │
      │       ┌─────┴─────┐
      │       │           │
      │     Images      Videos
      │
      ▼
 Authentication
      │
      ├── Admin
      └── Youth Leader
```

---

## 2. Frontend

Responsibilities:

- Render public pages.
- Display published events.
- Display published activities.
- Display photo galleries.
- Display videos.
- Display announcements.
- Provide authenticated admin dashboard.
- Provide responsive mobile-first UI.

The frontend should prioritize performance because activity pages may contain many images.

---

## 3. Backend

Responsibilities:

- Authentication.
- Authorization.
- CRUD operations for content.
- Media metadata.
- Publishing workflow.
- User/role management.
- Secure storage access.

---

## 4. Database

Core entities:

- users
- events
- activities
- media
- announcements
- youth_leaders
- site_settings

Optional future entities:

- posts
- categories
- event_registrations
- testimonies
- prayer_requests

---

## 5. Storage

Media files should be stored outside normal database rows.

The database should store metadata such as:

- File URL/path
- Media type
- Activity relationship
- Title
- Description
- Thumbnail URL
- Upload date
- Uploaded by

Storage contains:

```text
images/
videos/
thumbnails/
branding/
```

---

## 6. Video Strategy

Videos can be represented in two ways:

### Uploaded Video

```text
media.type = video
media.source = storage
media.storage_url = ...
```

### External Video

```text
media.type = video
media.source = youtube
media.external_url = ...
```

Large videos should preferably use a dedicated video platform such as YouTube rather than storing every large video file directly in application storage.

This keeps storage usage and bandwidth manageable.

---

## 7. Authentication

Public visitors do not need an account.

Only authorized users can access the dashboard.

Roles:

```text
admin
leader
```

---

## 8. Authorization

### Admin

Full access to all content and users.

### Leader

Can create and manage permitted Youth content.

The exact ownership rules can be implemented as:

- Leaders can edit/delete their own content.
- Admins can edit/delete all content.

---

## 9. Publishing Workflow

```text
Draft
  │
  ▼
Published
  │
  ▼
Archived
```

Only `Published` content is visible publicly.

An archived activity remains available for historical browsing but is no longer treated as current content.

---

## 10. Public vs Admin Architecture

```text
                 Website
                    │
          ┌─────────┴─────────┐
          │                   │
       Public              Dashboard
          │                   │
      Read-only          Authenticated
          │                   │
          ▼                   ▼
     Published          Draft / Published
       Content               Content
```

---

## 11. Performance

The website should:

- Optimize images.
- Generate/use thumbnails.
- Lazy-load gallery images.
- Avoid loading all activity media on the homepage.
- Paginate large activity lists.
- Use responsive image sizes.
- Use external video embeds when appropriate.

---

## 12. SEO

Public pages should support:

- Page titles
- Meta descriptions
- Open Graph images
- Semantic headings
- Sitemap
- Clean URLs

Recommended URL structure:

```text
/events
/events/{slug}

/activities
/activities/{slug}

/announcements
/announcements/{slug}

/memories
/gallery
```

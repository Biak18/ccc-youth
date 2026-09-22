# Data Model

## 1. Users

Authenticated dashboard users.

Fields:

- id
- email
- display_name
- avatar_url
- role
- created_at
- updated_at

Roles:

- admin
- leader

---

## 2. Events

Represents upcoming or scheduled Youth activities.

Fields:

- id
- title
- slug
- description
- cover_image_url
- location
- start_date
- end_date
- is_published
- created_by
- created_at
- updated_at

Optional fields:

- registration_url
- contact_information
- category_id

---

## 3. Activities

The main historical content entity.

Fields:

- id
- title
- slug
- description
- activity_date
- location
- cover_image_url
- is_published
- created_by
- created_at
- updated_at

Relationships:

```text
Activity
├── Media[]
└── Category?
```

An activity can contain multiple images and videos.

---

## 4. Media

Stores metadata for activity photos and videos.

Fields:

- id
- activity_id
- type
- source
- url
- thumbnail_url
- title
- description
- sort_order
- uploaded_by
- created_at

### type

Allowed values:

- image
- video

### source

Possible values:

- storage
- youtube
- external

Example:

```text
Activity
  └── Media
       ├── image / storage
       ├── image / storage
       └── video / youtube
```

---

## 5. Announcements

Fields:

- id
- title
- slug
- content
- cover_image_url
- published_at
- is_pinned
- is_published
- created_by
- created_at
- updated_at

Examples:

- Youth meeting schedule change
- Registration announcement
- Important notice
- Cancellation notice

---

## 6. Youth Leaders

Optional dedicated profile entity.

Fields:

- id
- user_id
- name
- role_title
- photo_url
- bio
- sort_order
- is_visible
- created_at
- updated_at

Examples:

- Youth Leader
- Youth Coordinator
- Assistant Youth Leader

---

## 7. Categories

Optional.

Examples:

- Fellowship
- Worship
- Bible Study
- Outreach
- Community Service
- Sports
- Conference
- Retreat
- Celebration

---

## 8. Site Settings

Stores editable website information.

Fields may include:

- church_name
- youth_name
- logo_url
- hero_image_url
- tagline
- description
- address
- phone
- email
- facebook_url
- youtube_url
- instagram_url

---

## 9. Example Relationships

```text
users
  │
  ├── creates ──► events
  │
  ├── creates ──► activities
  │                    │
  │                    └──► media
  │
  └── creates ──► announcements

users
  │
  └──► youth_leaders
```

---

## 10. Date Handling

Store the actual event/activity date independently from:

- created_at
- updated_at
- uploaded_at

Example:

```text
Activity Date: 2026-08-15
Uploaded:      2026-08-20
```

The public activity should be dated:

> August 15, 2026

because that is when the activity happened.

---

## 11. Future Entities

Potential future tables:

- event_registrations
- testimonies
- prayer_requests
- devotionals
- bible_verses
- newsletter_subscribers

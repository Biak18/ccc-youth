# Admin & Youth Leader System

## 1. Roles

### Admin

Full access.

Can:

- Manage users
- Manage Youth leaders
- Create events
- Edit events
- Delete events
- Create activities
- Edit activities
- Delete activities
- Upload media
- Manage announcements
- Publish/unpublish content
- Manage site settings

### Youth Leader

Can:

- Create activities
- Edit permitted activities
- Upload photos
- Add videos
- Create events if permitted
- Create announcements if permitted
- Save drafts
- Publish content if publishing permission is enabled

---

## 2. Dashboard

The dashboard should be simple enough for a non-technical Youth leader.

Example:

```text
CCC YOUTH ADMIN

Dashboard

+ New Activity
+ New Event
+ New Announcement

--------------------------------

Activities             24
Upcoming Events         3
Drafts                  2
Photos                328
Videos                 18

--------------------------------

Recent Activities

Youth Camp              Sep 15
Youth Fellowship        Sep 08
Community Service       Aug 30
```

---

## 3. Create Activity

Form:

```text
Title
[ Youth Camp 2026 ]

Activity Date
[ 15 September 2026 ]

Location
[ Church / Location ]

Description
[ ................................ ]
[ ................................ ]

Cover Image
[ Upload ]

Photos
[ Upload Photos ]

Videos
[ Upload Video ]
or
[ YouTube URL ]

[ Save Draft ]       [ Publish ]
```

---

## 4. Media Upload

Photo upload should support:

- Multiple selection
- Drag and drop on desktop
- Preview
- Remove
- Reorder
- Cover image selection
- Upload progress

Video support should include:

- Upload where appropriate
- YouTube URL
- External video URL
- Thumbnail

---

## 5. Activity Management

Admin dashboard:

```text
Activities

Search: [.....................]

Filter:
[ All ] [ Draft ] [ Published ] [ Archived ]

-----------------------------------------------

Title                 Date          Status

Youth Camp            Sep 15       Published
Fellowship            Sep 08       Published
Outreach              Aug 30       Draft
```

Actions:

- View
- Edit
- Publish
- Archive
- Delete

---

## 6. Event Management

Events should support:

- Create
- Edit
- Delete
- Publish
- Unpublish
- Archive

Fields:

- Title
- Description
- Date
- Time
- Location
- Cover image
- Registration URL
- Contact information

---

## 7. Announcement Management

Fields:

- Title
- Content
- Cover image
- Published date
- Pinned status
- Published status

Important announcements can be pinned.

---

## 8. Publishing

Recommended workflow:

```text
Create
  ↓
Save Draft
  ↓
Review
  ↓
Publish
  ↓
Archive
```

For a small Youth team, publishing can initially be immediate.

Moderation can be added later if needed.

---

## 9. Permissions

Minimum permissions:

| Action | Admin | Leader |
|---|---:|---:|
| View dashboard | Yes | Yes |
| Create activity | Yes | Yes |
| Edit own activity | Yes | Yes |
| Edit all activities | Yes | No |
| Delete own activity | Yes | Yes |
| Delete all activities | Yes | No |
| Create event | Yes | Optional |
| Manage announcements | Yes | Optional |
| Upload media | Yes | Yes |
| Manage users | Yes | No |
| Site settings | Yes | No |

---

## 10. Security

The admin dashboard must:

- Require authentication.
- Enforce role-based authorization.
- Validate uploaded file types.
- Restrict upload sizes.
- Prevent unauthorized deletion.
- Never expose draft content publicly.

Storage permissions should follow the same authorization model as database records.

---

## 11. User Experience

The dashboard should favor simple workflows.

A Youth leader should be able to go from:

```text
Login
  ↓
New Activity
  ↓
Add date
  ↓
Upload photos
  ↓
Add video
  ↓
Publish
```

without navigating through multiple complicated screens.

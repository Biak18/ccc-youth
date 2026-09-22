# UI / UX Specification

## 1. Visual Direction

The site should feel:

- Youthful
- Welcoming
- Modern
- Community-focused
- Faith-centered
- Clean
- Authentic

The design should not feel like a corporate business website.

Use the real Church logo and real Youth photography as the primary visual identity.

---

## 2. Brand Colors

Approximate design tokens based on the existing logo:

```text
Primary Navy:      #1F2F68
Primary Dark:      #16234F
Accent Red:        #ED1C24
Accent Red Dark:   #C9161D
Secondary Blue:    #3D9ACF

Background:        #FFFFFF
Surface:           #F7F8FC

Text:              #172033
Muted Text:        #667085
Border:            #E5E7EB
```

Navy should be the dominant brand color.

Red should be used primarily for:

- Important actions
- Highlights
- Small accents
- Active indicators

Do not make the entire interface red.

---

## 3. Existing Assets

Available assets:

```text
assets/
├── logo/
│   └── church-logo.png
└── images/
    └── youth-group.jpg
```

The Youth group photograph should be used as the primary homepage hero image.

The logo should be used in:

- Navbar
- Hero
- Footer
- Authentication pages
- Admin dashboard branding

---

## 4. Hero

The hero should use the Youth group photo.

Suggested structure:

```text
┌─────────────────────────────────────────────┐
│                                             │
│  [LOGO]                                     │
│                                             │
│  CHRISTIAN CITY CHURCH                      │
│  YOUTH                                      │
│                                             │
│  Growing Together in Faith & Fellowship     │
│                                             │
│  [ Upcoming Events ]                         │
│  [ Explore Activities ]                      │
│                                             │
└─────────────────────────────────────────────┘
```

Use a dark translucent overlay to improve text readability.

Avoid placing important text directly over people's faces.

---

## 5. Navigation

Desktop:

```text
[Logo] Christian City Church Youth

Home
About
Events
Activities
Memories
Announcements
Contact

                    [Facebook]
```

Mobile:

```text
[Logo] CCC Youth                         [Menu]
```

---

## 6. Homepage Sections

Recommended order:

1. Hero
2. Next Event
3. Latest Activities
4. Latest Videos
5. Youth Memories
6. Announcements
7. Youth Leaders
8. Facebook CTA
9. Footer

---

## 7. Next Event

The next event should be visually prominent.

Display:

- Event title
- Date
- Time
- Location
- Cover image
- View Event button

---

## 8. Activity Cards

Activity cards should display:

- Cover image
- Title
- Activity date
- Location if useful
- Short description

Example:

```text
┌──────────────────────────┐
│                          │
│         PHOTO            │
│                          │
├──────────────────────────┤
│ Youth Camp 2026          │
│ September 15, 2026       │
│                          │
│ A short description...   │
└──────────────────────────┘
```

---

## 9. Youth Memories

Use a visual archive.

Possible layout:

```text
Youth Memories

2026

[ Activity ] [ Activity ] [ Activity ]

2025

[ Activity ] [ Activity ] [ Activity ]
```

Allow filtering by year in the future.

---

## 10. Gallery

Use a responsive image grid.

Requirements:

- Lazy loading
- Image preview/lightbox
- Responsive layout
- Good aspect-ratio handling
- Alt text

---

## 11. Videos

Video cards should show:

- Thumbnail
- Play button
- Title
- Date
- Activity name

Use embedded external videos when possible.

---

## 12. Announcements

Use simple cards or a chronological list.

Pinned announcements can use the red accent.

---

## 13. Youth Leaders

Display a small leadership section:

```text
Meet Our Youth Leaders

[Photo]       [Photo]       [Photo]

Name          Name          Name
Youth Leader  Coordinator   Assistant
```

---

## 14. Facebook CTA

Suggested section:

```text
Stay Connected

Follow Christian City Church on Facebook
for announcements and regular updates.

[ Follow on Facebook ]
```

---

## 15. Accessibility

The site should provide:

- Good contrast
- Keyboard navigation
- Visible focus states
- Semantic headings
- Accessible buttons
- Meaningful alt text
- Proper form labels
- Readable typography

---

## 16. Mobile UX

Mobile is a primary platform.

Ensure:

- Large touch targets
- Simple navigation
- Fast-loading images
- Readable text
- Horizontally scrollable card sections only when appropriate
- No important information hidden behind hover states

---

## 17. Design Personality

The visual language should communicate:

```text
Church identity
      +
Youth energy
      +
Real community
      +
Clean modern UI
```

Avoid excessive gradients, overly corporate dashboards, generic stock church imagery, and unnecessary animation.

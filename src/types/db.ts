// Mirrors the CityYouth backend API shapes: camelCase JSON (FRONTEND_BINDING.md).
export type Status = 'draft' | 'published' | 'archived'
export type Role = 'admin' | 'leader'

export type Paged<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}

export type Problem = { title: string; detail?: string; status: number }

/**
 * List endpoints return a subset of fields (no description/location/
 * audit columns); detail endpoints return the full object. Shared
 * nullable fields are optional so both shapes fit one type.
 */
export type Activity = {
  id: string
  title: string
  slug: string
  description?: string | null
  activityDate: string // YYYY-MM-DD - the real date the activity happened
  category: string | null
  location?: string | null
  coverImageUrl: string | null
  status: Status
  createdBy?: string | null
  createdAt?: string
  updatedAt?: string
}

export type EventRow = {
  id: string
  title: string
  slug: string
  description?: string | null
  coverImageUrl: string | null
  location: string | null
  startDate: string
  endDate: string | null
  registrationUrl?: string | null
  contactInformation?: string | null
  status: Status
  createdBy?: string | null
  createdAt?: string
  updatedAt?: string
}

export type Announcement = {
  id: string
  title: string
  slug: string
  content: string | null
  coverImageUrl: string | null
  publishedAt: string | null
  isPinned: boolean
  status: Status
  createdBy?: string | null
  createdAt?: string
  updatedAt?: string
}

export type Media = {
  id: string
  activityId: string | null
  type: 'image' | 'video'
  source: 'storage' | 'youtube' | 'external'
  url: string
  thumbnailUrl: string | null
  title: string | null
  description: string | null
  sortOrder: number
  uploadedBy?: string | null
  createdAt?: string
}

export type YouthLeader = {
  id: string
  userId: string | null
  name: string
  roleTitle: string | null
  photoUrl: string | null
  bio: string | null
  sortOrder: number
  isVisible: boolean
}

export type SiteSettings = {
  id: number
  churchName: string | null
  youthName: string | null
  logoUrl: string | null
  heroImageUrl: string | null
  heroImages: string[] | null
  tagline: string | null
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  facebookUrl: string | null
  youtubeUrl: string | null
  instagramUrl: string | null
}

/** Signed-in dashboard account (`GET /api/auth/me`, `GET /api/users`). */
export type Profile = {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl?: string | null
  role: Role
  createdAt?: string
}

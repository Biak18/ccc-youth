// Mirrors the CCC-Youth Postgres schema (DATA.md).
export type Status = 'draft' | 'published' | 'archived'
export type Role = 'admin' | 'leader'

export type Activity = {
  id: string
  title: string
  slug: string
  description: string | null
  activity_date: string // YYYY-MM-DD - the real date the activity happened
  category: string | null
  location: string | null
  cover_image_url: string | null
  status: Status
  created_by: string | null
  created_at: string
  updated_at: string
}

export type EventRow = {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image_url: string | null
  location: string | null
  start_date: string
  end_date: string | null
  registration_url: string | null
  contact_information: string | null
  status: Status
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Announcement = {
  id: string
  title: string
  slug: string
  content: string | null
  cover_image_url: string | null
  published_at: string | null
  is_pinned: boolean
  status: Status
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Media = {
  id: string
  activity_id: string | null
  type: 'image' | 'video'
  source: 'storage' | 'youtube' | 'external'
  url: string
  thumbnail_url: string | null
  title: string | null
  description: string | null
  sort_order: number
  uploaded_by: string | null
  created_at: string
}

export type YouthLeader = {
  id: string
  user_id: string | null
  name: string
  role_title: string | null
  photo_url: string | null
  bio: string | null
  sort_order: number
  is_visible: boolean
}

export type SiteSettings = {
  id: number
  church_name: string | null
  youth_name: string | null
  logo_url: string | null
  hero_image_url: string | null
  hero_images: string[] | null
  tagline: string | null
  description: string | null
  address: string | null
  phone: string | null
  email: string | null
  facebook_url: string | null
  youtube_url: string | null
  instagram_url: string | null
}

export type Profile = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: Role
  created_at: string
}

export type Row<T> = T
type Table<R> = {
  Row: R
  Insert: Partial<R>
  Update: Partial<R>
  Relationships: []
}

/**
 * supabase-js requires Views, Functions, Enums and CompositeTypes to be
 * present. Without them the whole schema fails its type constraint and
 * every insert/update silently resolves to `never`.
 */
export type Database = {
  public: {
    Tables: {
      activities: Table<Activity>
      events: Table<EventRow>
      announcements: Table<Announcement>
      media: Table<Media>
      youth_leaders: Table<YouthLeader>
      site_settings: Table<SiteSettings>
      profiles: Table<Profile>
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: {
      content_status: Status
      user_role: Role
    }
    CompositeTypes: Record<never, never>
  }
}

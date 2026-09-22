// Static fallbacks. Live values come from the `site_settings` table
// and override these (see src/hooks/useContent.ts).
export const site = {
  churchName: 'Christian City Church',
  youthName: 'Youth',
  tagline: 'Growing Together in Faith & Fellowship',
  facebookUrl: 'https://www.facebook.com/',
  address: 'Yangon, Myanmar',
  phone: '',
  email: '',
}

export const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Events', to: '/events' },
  { label: 'Activities', to: '/activities' },
  { label: 'Memories', to: '/memories' },
  { label: 'Announcements', to: '/announcements' },
  { label: 'Contact', to: '/contact' },
]

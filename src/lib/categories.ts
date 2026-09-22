/** Suggested categories from CONTENT.md section 7. */
export const CATEGORIES = [
  'Fellowship',
  'Worship',
  'Bible Study',
  'Outreach',
  'Community Service',
  'Sports',
  'Conference',
  'Retreat',
  'Celebration',
] as const

export type Category = (typeof CATEGORIES)[number]

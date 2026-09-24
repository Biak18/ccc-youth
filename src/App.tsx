import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import Home from './pages/public/Home'

/**
 * The homepage is bundled eagerly because it is the first thing most
 * visitors load. Every other page is a separate chunk.
 *
 * The dashboard and login live behind their own lazy entry points, and
 * they are the only code that uses the auth token, so public visitors
 * never download admin code.
 */
const About = lazy(() => import('./pages/public/About'))
const Events = lazy(() => import('./pages/public/Events'))
const EventDetail = lazy(() => import('./pages/public/EventDetail'))
const Activities = lazy(() => import('./pages/public/Activities'))
const ActivityDetail = lazy(() => import('./pages/public/ActivityDetail'))
const Memories = lazy(() => import('./pages/public/Memories'))
const Announcements = lazy(() => import('./pages/public/Announcements'))
const AnnouncementDetail = lazy(() => import('./pages/public/AnnouncementDetail'))
const Gallery = lazy(() => import('./pages/public/Gallery'))
const Contact = lazy(() => import('./pages/public/Contact'))
const NotFound = lazy(() => import('./pages/public/NotFound'))

const LoginRoute = lazy(() => import('./routes/LoginRoute'))
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'))

function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-navy" />
      <span className="sr-only">Loading</span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:slug" element={<EventDetail />} />
          <Route path="activities" element={<Activities />} />
          <Route path="activities/:slug" element={<ActivityDetail />} />
          <Route path="memories" element={<Memories />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="announcements/:slug" element={<AnnouncementDetail />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Auth + dashboard (separate chunks) */}
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Suspense>
  )
}

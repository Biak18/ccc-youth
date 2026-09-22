import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import { RequireAdmin, RequireAuth } from './components/RequireAuth'

import Home from './pages/public/Home'
import About from './pages/public/About'
import Events from './pages/public/Events'
import EventDetail from './pages/public/EventDetail'
import Activities from './pages/public/Activities'
import ActivityDetail from './pages/public/ActivityDetail'
import Memories from './pages/public/Memories'
import Announcements from './pages/public/Announcements'
import Gallery from './pages/public/Gallery'
import Contact from './pages/public/Contact'
import NotFound from './pages/public/NotFound'

import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ActivityList from './pages/admin/ActivityList'
import ActivityForm from './pages/admin/ActivityForm'
import EventList from './pages/admin/EventList'
import EventForm from './pages/admin/EventForm'
import AnnouncementList from './pages/admin/AnnouncementList'
import AnnouncementForm from './pages/admin/AnnouncementForm'
import Leaders from './pages/admin/Leaders'
import Settings from './pages/admin/Settings'

export default function App() {
  return (
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
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="activities" element={<ActivityList />} />
        <Route path="activities/new" element={<ActivityForm />} />
        <Route path="activities/:id/edit" element={<ActivityForm />} />
        <Route path="events" element={<EventList />} />
        <Route path="events/new" element={<EventForm />} />
        <Route path="events/:id/edit" element={<EventForm />} />
        <Route path="announcements" element={<AnnouncementList />} />
        <Route path="announcements/new" element={<AnnouncementForm />} />
        <Route path="announcements/:id/edit" element={<AnnouncementForm />} />
        <Route
          path="leaders"
          element={
            <RequireAdmin>
              <Leaders />
            </RequireAdmin>
          }
        />
        <Route
          path="settings"
          element={
            <RequireAdmin>
              <Settings />
            </RequireAdmin>
          }
        />
      </Route>
    </Routes>
  )
}

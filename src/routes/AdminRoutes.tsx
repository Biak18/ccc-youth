import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../hooks/useAuth'
import { RequireAdmin, RequireAuth } from '../components/RequireAuth'
import AdminLayout from '../layouts/AdminLayout'
import Dashboard from '../pages/admin/Dashboard'
import ActivityList from '../pages/admin/ActivityList'
import ActivityForm from '../pages/admin/ActivityForm'
import EventList from '../pages/admin/EventList'
import EventForm from '../pages/admin/EventForm'
import AnnouncementList from '../pages/admin/AnnouncementList'
import AnnouncementForm from '../pages/admin/AnnouncementForm'
import Leaders from '../pages/admin/Leaders'
import Users from '../pages/admin/Users'
import Settings from '../pages/admin/Settings'

/**
 * The entire dashboard, loaded as one lazy chunk from /admin/*.
 *
 * Everything that needs the backend auth token - login state, uploads
 * and writes - lives behind this boundary, so a visitor reading the
 * public site never downloads it. Data caching comes from the shared
 * QueryClient provided at the app root (src/lib/query.ts).
 */
export default function AdminRoutes() {
  return (
    <AuthProvider>
      <RequireAuth>
        <Routes>
          <Route element={<AdminLayout />}>
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
              path="users"
              element={
                <RequireAdmin>
                  <Users />
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
      </RequireAuth>
    </AuthProvider>
  )
}

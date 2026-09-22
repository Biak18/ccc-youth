import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import Home from './pages/public/Home'
import About from './pages/public/About'
import Events from './pages/public/Events'
import Activities from './pages/public/Activities'
import Memories from './pages/public/Memories'
import Announcements from './pages/public/Announcements'
import Gallery from './pages/public/Gallery'
import Contact from './pages/public/Contact'
import NotFound from './pages/public/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="events" element={<Events />} />
        <Route path="activities" element={<Activities />} />
        <Route path="memories" element={<Memories />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

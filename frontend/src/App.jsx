import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'

// Loaded only when someone opens /stats, so the home page stays small.
const Stats = lazy(() => import('./pages/Stats.jsx'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/stats"
        element={
          <Suspense fallback={<p className="muted">Loading…</p>}>
            <Stats />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
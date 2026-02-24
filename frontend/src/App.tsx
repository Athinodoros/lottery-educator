import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import Layout from './layout/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import { useSessionStore } from './store/useSessionStore'

// Route-based code splitting — each page loads only when first visited
const HomePage = lazy(() => import('./pages/HomePage'))
const GamesPage = lazy(() => import('./pages/GamesPage'))
const GamePlayPage = lazy(() => import('./pages/GamePlayPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const StatisticsDetailPage = lazy(() => import('./pages/StatisticsDetailPage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

function App() {
  const initializeSession = useSessionStore((state) => state.initializeSession)

  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading…</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/games/:id" element={<GamePlayPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/stats/:id" element={<StatisticsDetailPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App

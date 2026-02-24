import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Gamepad2, BarChart3, Heart, Mail, Settings, Menu, X, Sun, Moon } from 'lucide-react'
import { getThemePreference, setThemePreference } from '../utils/storage'
import { useSessionStore } from '../store/useSessionStore'
import { metricsApi } from '../api/metrics'
import PrivacyFooter from '../components/PrivacyFooter'
import ConsentBanner from '../components/ConsentBanner'
import './Layout.css'

function getInitialTheme(): 'light' | 'dark' {
  const stored = getThemePreference()
  if (stored === 'dark' || stored === 'light') return stored
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

function Layout() {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    setThemePreference(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/games', label: 'Games', icon: Gamepad2 },
    { path: '/stats', label: 'Stats', icon: BarChart3 },
    { path: '/learn', label: 'Learn', icon: Heart },
    { path: '/contact', label: 'Contact', icon: Mail },
    { path: '/admin', label: 'Admin', icon: Settings },
  ]

  const sessionId = useSessionStore((state) => state.sessionId)

  const handleNavClick = (label: string) => {
    setDrawerOpen(false)
    if (sessionId) {
      metricsApi.trackClick(`nav-${label.toLowerCase()}`, sessionId, location.pathname)
    }
  }

  return (
    <div className={`layout ${drawerOpen ? 'drawer-open' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav className="nav-drawer" aria-label="Main navigation">
        <div className="nav-drawer-header">
          <span className="nav-drawer-title">Lottery Educator</span>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
          </button>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              onClick={() => handleNavClick(item.label)}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="main-wrapper">
        <button
          className="burger-button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
        >
          {drawerOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <main id="main-content" className="content">
          <Outlet />
          <PrivacyFooter />
        </main>
      </div>

      <ConsentBanner />
    </div>
  )
}

export default Layout

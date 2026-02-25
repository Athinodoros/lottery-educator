import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Gamepad2, BarChart3, Heart, Mail, Settings, Menu, X, Sun, Moon } from 'lucide-react'
import { getThemePreference, setThemePreference } from '../utils/storage'
import { useSessionStore } from '../store/useSessionStore'
import { metricsApi } from '../api/metrics'
import { RTL_LANGUAGES } from '../i18n'
import PrivacyFooter from '../components/PrivacyFooter'
import ConsentBanner from '../components/ConsentBanner'
import LanguagePicker from '../components/LanguagePicker'
import './Layout.css'

function getInitialTheme(): 'light' | 'dark' {
  const stored = getThemePreference()
  if (stored === 'dark' || stored === 'light') return stored
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

function Layout() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    setThemePreference(theme)
  }, [theme])

  useEffect(() => {
    const dir = RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const navItems = [
    { path: '/', labelKey: 'nav.home', icon: Home },
    { path: '/games', labelKey: 'nav.games', icon: Gamepad2 },
    { path: '/stats', labelKey: 'nav.stats', icon: BarChart3 },
    { path: '/learn', labelKey: 'nav.learn', icon: Heart },
    { path: '/contact', labelKey: 'nav.contact', icon: Mail },
    { path: '/admin', labelKey: 'nav.admin', icon: Settings },
  ]

  const sessionId = useSessionStore((state) => state.sessionId)

  const handleNavClick = (labelKey: string) => {
    setDrawerOpen(false)
    if (sessionId) {
      metricsApi.trackClick(`nav-${labelKey.split('.')[1]}`, sessionId, location.pathname)
    }
  }

  return (
    <div className={`layout ${drawerOpen ? 'drawer-open' : ''}`}>
      <a href="#main-content" className="skip-link">
        {t('skipToContent')}
      </a>

      <nav className="nav-drawer" aria-label="Main navigation">
        <div className="nav-drawer-header">
          <span className="nav-drawer-title">{t('appTitle')}</span>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? t('switchToDark') : t('switchToLight')}
          >
            {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
          </button>
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          const label = t(item.labelKey)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              onClick={() => handleNavClick(item.labelKey)}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          )
        })}
        <LanguagePicker />
      </nav>

      <div className="main-wrapper">
        <button
          className="burger-button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label={drawerOpen ? t('closeMenu') : t('openMenu')}
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

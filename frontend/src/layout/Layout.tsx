import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Gamepad2, BarChart3, Heart, Mail, Settings, Menu, X } from 'lucide-react'
import PrivacyFooter from '../components/PrivacyFooter'
import ConsentBanner from '../components/ConsentBanner'
import './Layout.css'

function Layout() {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/games', label: 'Games', icon: Gamepad2 },
    { path: '/stats', label: 'Stats', icon: BarChart3 },
    { path: '/learn', label: 'Learn', icon: Heart },
    { path: '/contact', label: 'Contact', icon: Mail },
    { path: '/admin', label: 'Admin', icon: Settings },
  ]

  const handleNavClick = () => {
    setDrawerOpen(false)
  }

  return (
    <div className={`layout ${drawerOpen ? 'drawer-open' : ''}`}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <nav className="nav-drawer" aria-label="Main navigation">
        <div className="nav-drawer-header">
          <span className="nav-drawer-title">Lottery Educator</span>
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
              onClick={handleNavClick}
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

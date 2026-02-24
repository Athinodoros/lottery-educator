import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Gamepad2, BarChart3, Heart, Mail, Settings } from 'lucide-react'
import PrivacyFooter from '../components/PrivacyFooter'
import './Layout.css'

function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/games', label: 'Games', icon: Gamepad2 },
    { path: '/stats', label: 'Stats', icon: BarChart3 },
    { path: '/learn', label: 'Learn', icon: Heart },
    { path: '/contact', label: 'Contact', icon: Mail },
    { path: '/admin', label: 'Admin', icon: Settings },
  ]

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <main id="main-content" className="content">
        <Outlet />
        <PrivacyFooter />
      </main>

      <nav className="nav-bar" aria-label="Main navigation">
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
            >
              <Icon size={24} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Layout

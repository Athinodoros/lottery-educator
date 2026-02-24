import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Gamepad2, BarChart3, Heart, Settings } from 'lucide-react'
import './Layout.css'

function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/games', label: 'Games', icon: Gamepad2 },
    { path: '/stats', label: 'Stats', icon: BarChart3 },
    { path: '/learn', label: 'Learn', icon: Heart },
    { path: '/admin', label: 'Admin', icon: Settings },
  ]

  return (
    <div className="layout">
      <main className="content">
        <Outlet />
      </main>

      <nav className="nav-bar">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Layout

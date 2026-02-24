import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import './NotFoundPage.css'

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="not-found-home">
          <Home size={18} aria-hidden="true" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage

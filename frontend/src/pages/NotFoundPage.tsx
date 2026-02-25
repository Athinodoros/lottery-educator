import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home } from 'lucide-react'
import './NotFoundPage.css'

function NotFoundPage() {
  const { t } = useTranslation('notFound')

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-code">{t('code')}</h1>
        <h2 className="not-found-title">{t('title')}</h2>
        <p className="not-found-message">
          {t('message')}
        </p>
        <Link to="/" className="not-found-home">
          <Home size={18} aria-hidden="true" />
          <span>{t('backHome')}</span>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage

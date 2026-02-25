import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSessionStore } from '../store/useSessionStore'
import './PrivacyFooter.css'

function PrivacyFooter() {
  const { t } = useTranslation()
  const forgetMe = useSessionStore((state) => state.forgetMe)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const handleDelete = () => {
    forgetMe()
    setDeleted(true)
    setShowConfirm(false)
  }

  return (
    <footer className="privacy-footer">
      <div className="privacy-footer-inner">
        <span className="privacy-text">
          {t('footer.privacyText')}
        </span>
        {deleted ? (
          <span className="privacy-confirmed" role="status">{t('footer.dataDeleted')}</span>
        ) : showConfirm ? (
          <span className="privacy-confirm" role="alert">
            <span>{t('footer.deleteConfirm')}</span>
            <button className="confirm-yes" onClick={handleDelete}>{t('footer.confirmYes')}</button>
            <button className="confirm-no" onClick={() => setShowConfirm(false)}>{t('footer.confirmCancel')}</button>
          </span>
        ) : (
          <button
            className="privacy-delete-btn"
            onClick={() => setShowConfirm(true)}
            aria-label={t('footer.deleteAriaLabel')}
          >
            {t('footer.deleteButton')}
          </button>
        )}
      </div>
    </footer>
  )
}

export default PrivacyFooter

import { useTranslation } from 'react-i18next'
import { useSessionStore } from '../store/useSessionStore'
import './ConsentBanner.css'

function ConsentBanner() {
  const { t } = useTranslation()
  const hasGivenConsent = useSessionStore((state) => state.hasGivenConsent)
  const giveConsent = useSessionStore((state) => state.giveConsent)
  const revokeConsent = useSessionStore((state) => state.revokeConsent)

  // Check if user has already made a choice (consent or decline stored)
  const hasDecided = localStorage.getItem('lottery_consent') !== null

  if (hasDecided || hasGivenConsent) return null

  return (
    <div className="consent-banner" role="dialog" aria-label={t('consent.ariaLabel')}>
      <div className="consent-inner">
        <p className="consent-text">
          {t('consent.text')}
        </p>
        <div className="consent-actions">
          <button className="consent-accept" onClick={giveConsent}>
            {t('consent.accept')}
          </button>
          <button className="consent-decline" onClick={revokeConsent}>
            {t('consent.decline')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConsentBanner

import { useSessionStore } from '../store/useSessionStore'
import './ConsentBanner.css'

function ConsentBanner() {
  const hasGivenConsent = useSessionStore((state) => state.hasGivenConsent)
  const giveConsent = useSessionStore((state) => state.giveConsent)
  const revokeConsent = useSessionStore((state) => state.revokeConsent)

  // Check if user has already made a choice (consent or decline stored)
  const hasDecided = localStorage.getItem('lottery_consent') !== null

  if (hasDecided || hasGivenConsent) return null

  return (
    <div className="consent-banner" role="dialog" aria-label="Cookie consent">
      <div className="consent-inner">
        <p className="consent-text">
          We use anonymous analytics to improve the learning experience.
          No personal data is collected. You can delete your data anytime.
        </p>
        <div className="consent-actions">
          <button className="consent-accept" onClick={giveConsent}>
            Accept
          </button>
          <button className="consent-decline" onClick={revokeConsent}>
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConsentBanner

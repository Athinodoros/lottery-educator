import { useState } from 'react'
import { useSessionStore } from '../store/useSessionStore'
import './PrivacyFooter.css'

function PrivacyFooter() {
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
          We respect your privacy. No personal data is collected.
        </span>
        {deleted ? (
          <span className="privacy-confirmed" role="status">Your data has been deleted.</span>
        ) : showConfirm ? (
          <span className="privacy-confirm" role="alert">
            <span>Delete all your local data?</span>
            <button className="confirm-yes" onClick={handleDelete}>Yes, delete</button>
            <button className="confirm-no" onClick={() => setShowConfirm(false)}>Cancel</button>
          </span>
        ) : (
          <button
            className="privacy-delete-btn"
            onClick={() => setShowConfirm(true)}
            aria-label="Delete my data"
          >
            Delete My Data
          </button>
        )}
      </div>
    </footer>
  )
}

export default PrivacyFooter

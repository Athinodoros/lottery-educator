import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import apiClient from '../api/client'
import './ContactPage.css'

function ContactPage() {
  const { t } = useTranslation('contact')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      await apiClient.post('/emails', {
        senderEmail: email,
        subject,
        body,
      })
      setStatus('success')
      setEmail('')
      setSubject('')
      setBody('')
    } catch (err: any) {
      setStatus('error')
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to send message. Please try again.'
      setErrorMsg(msg)
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </div>

      <div className="contact-layout">
        <div className="contact-form-container">
          {status === 'success' ? (
            <div className="success-message" role="alert">
              <div className="success-icon">&#10003;</div>
              <h2>{t('successTitle')}</h2>
              <p>{t('successText')}</p>
              <button
                className="send-another-btn"
                onClick={() => setStatus('idle')}
              >
                {t('sendAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form" noValidate>
              {status === 'error' && (
                <div className="form-error" role="alert">
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="contact-email">{t('emailLabel')}</label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  aria-required="true"
                  aria-invalid={email.length > 0 && !isValidEmail(email)}
                  autoComplete="email"
                />
                {email.length > 0 && !isValidEmail(email) && (
                  <span className="field-error" role="alert" aria-live="polite">{t('emailError')}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">{t('subjectLabel')}</label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('subjectPlaceholder')}
                  required
                  aria-required="true"
                  maxLength={255}
                />
                <span className="char-count">{subject.length}/255</span>
              </div>

              <div className="form-group">
                <label htmlFor="contact-body">{t('messageLabel')}</label>
                <textarea
                  id="contact-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={t('messagePlaceholder')}
                  required
                  aria-required="true"
                  rows={6}
                  maxLength={10000}
                />
                <span className="char-count">{body.length}/10,000</span>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={status === 'sending' || !email || !subject || !body || !isValidEmail(email)}
              >
                {status === 'sending' ? t('sending') : t('sendMessage')}
              </button>
            </form>
          )}
        </div>

        <aside className="contact-info">
          <div className="info-card">
            <h3>{t('aboutProject')}</h3>
            <p>{t('aboutProjectText')}</p>
          </div>

          <div className="info-card">
            <h3>{t('privacy')}</h3>
            <p>{t('privacyText')}</p>
          </div>

          <div className="info-card">
            <h3>{t('openSource')}</h3>
            <p>{t('openSourceText')}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ContactPage

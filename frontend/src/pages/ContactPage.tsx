import { useState } from 'react'
import apiClient from '../api/client'
import './ContactPage.css'

function ContactPage() {
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
        <h1>Contact Us</h1>
        <p>Have questions or feedback? We'd love to hear from you.</p>
      </div>

      <div className="contact-layout">
        <div className="contact-form-container">
          {status === 'success' ? (
            <div className="success-message" role="alert">
              <div className="success-icon">&#10003;</div>
              <h2>Message Sent!</h2>
              <p>Thank you for reaching out. We'll review your message shortly.</p>
              <button
                className="send-another-btn"
                onClick={() => setStatus('idle')}
              >
                Send Another Message
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
                <label htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  aria-required="true"
                  aria-invalid={email.length > 0 && !isValidEmail(email)}
                  autoComplete="email"
                />
                {email.length > 0 && !isValidEmail(email) && (
                  <span className="field-error" role="alert" aria-live="polite">Please enter a valid email address</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">Subject</label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this about?"
                  required
                  aria-required="true"
                  maxLength={255}
                />
                <span className="char-count">{subject.length}/255</span>
              </div>

              <div className="form-group">
                <label htmlFor="contact-body">Message</label>
                <textarea
                  id="contact-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Tell us what's on your mind..."
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
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        <aside className="contact-info">
          <div className="info-card">
            <h3>About This Project</h3>
            <p>
              Lottery Educator is a free educational tool that helps people
              understand the real odds of winning the lottery through
              interactive simulations.
            </p>
          </div>

          <div className="info-card">
            <h3>Privacy</h3>
            <p>
              We respect your privacy. Your email is only used to respond to your
              message. We don't store IP addresses or share your information.
              You can request deletion of your data at any time.
            </p>
          </div>

          <div className="info-card">
            <h3>Open Source</h3>
            <p>
              This project is open source. If you find a bug or want to
              contribute, feel free to open an issue or pull request on GitHub.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ContactPage

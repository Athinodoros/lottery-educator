import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSessionStore } from '../store/useSessionStore'
import './HomePage.css'

function HomePage() {
  const recordPageView = useSessionStore((state) => state.recordPageView)

  useEffect(() => {
    recordPageView('home')
  }, [recordPageView])

  return (
    <div className="home-page">
      <header className="hero">
        <h1>Lottery Educator</h1>
        <p className="subtitle">Learn the true odds behind lottery games</p>
        <p className="description">
          Discover why lottery tickets are a statistical impossibility and understand
          the mathematics behind game probability.
        </p>
        <Link to="/games" className="cta-button">
          Play Games & Learn
        </Link>
      </header>

      <section className="features" aria-label="Key features">
        <div className="feature-card">
          <h2>Interactive Games</h2>
          <p>Simulate thousands of lottery draws to understand how long it really takes to win.</p>
        </div>
        <div className="feature-card">
          <h2>Real Statistics</h2>
          <p>See the true odds and probabilities behind popular lottery games worldwide.</p>
        </div>
        <div className="feature-card">
          <h2>Financial Education</h2>
          <p>Learn why understanding probability is crucial for personal finance decisions.</p>
        </div>
      </section>
    </div>
  )
}

export default HomePage

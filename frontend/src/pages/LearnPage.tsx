import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSessionStore } from '../store/useSessionStore'
import './LearnPage.css'

function LearnPage() {
  const { t } = useTranslation('learn')
  const recordPageView = useSessionStore((state) => state.recordPageView)

  useEffect(() => {
    recordPageView('learn')
  }, [recordPageView])

  return (
    <div className="learn-page">
      <header className="learn-header">
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>

      <div className="learn-content">
        <section className="learn-section">
          <h2>{t('probability.title')}</h2>
          <p>{t('probability.text')}</p>
          <div className="example-box">
            <h3>{t('probability.exampleTitle')}</h3>
            <p>{t('probability.exampleText')}</p>
            <ul>
              <li>{t('probability.exampleItem1')}</li>
              <li>{t('probability.exampleItem2')}</li>
              <li>{t('probability.exampleItem3')}</li>
            </ul>
          </div>
        </section>

        <section className="learn-section">
          <h2>{t('combinations.title')}</h2>
          <p dangerouslySetInnerHTML={{ __html: t('combinations.text') }} />
          <div className="example-box">
            <h3>{t('combinations.exampleTitle')}</h3>
            <p>{t('combinations.exampleText')}</p>
            <ul>
              <li>{t('combinations.exampleItem1')}</li>
              <li>{t('combinations.exampleItem2')}</li>
              <li>{t('combinations.exampleItem3')}</li>
            </ul>
          </div>
        </section>

        <section className="learn-section">
          <h2>{t('expectedValue.title')}</h2>
          <p>{t('expectedValue.text')}</p>
          <div className="example-box">
            <h3>{t('expectedValue.exampleTitle')}</h3>
            <p>{t('expectedValue.exampleText')}</p>
            <ul>
              <li>{t('expectedValue.exampleItem1')}</li>
              <li>{t('expectedValue.exampleItem2')}</li>
              <li>{t('expectedValue.exampleItem3')}</li>
              <li>{t('expectedValue.exampleItem4')}</li>
              <li>{t('expectedValue.exampleItem5')}</li>
            </ul>
          </div>
        </section>

        <section className="learn-section">
          <h2>{t('houseFavor.title')}</h2>
          <p>{t('houseFavor.text')}</p>
          <div className="example-box">
            <h3>{t('houseFavor.exampleTitle')}</h3>
            <div className="math-breakdown">
              <p><strong>{t('houseFavor.forEvery100')}</strong></p>
              <ul>
                <li>{t('houseFavor.item1')}</li>
                <li>{t('houseFavor.item2')}</li>
                <li>{t('houseFavor.item3')}</li>
                <li><strong>{t('houseFavor.item4')}</strong></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="learn-section highlight-section">
          <h2>{t('comparison.title')}</h2>
          <p>{t('comparison.text')}</p>
          <div className="comparison-grid">
            <div className="comparison-card lottery-side">
              <h3>{t('comparison.lotteryTitle')}</h3>
              <div className="comparison-stat">
                <span className="comparison-label">{t('comparison.weeklySpend')}</span>
                <span className="comparison-value">$20</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">{t('comparison.totalSpent')}</span>
                <span className="comparison-value">$31,200</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">{t('comparison.expectedReturn')}</span>
                <span className="comparison-value negative">$15,600</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">{t('comparison.netResult')}</span>
                <span className="comparison-value negative">-$15,600</span>
              </div>
              <p className="comparison-note">{t('comparison.lotteryNote')}</p>
            </div>

            <div className="comparison-card invest-side">
              <h3>{t('comparison.investTitle')}</h3>
              <div className="comparison-stat">
                <span className="comparison-label">{t('comparison.weeklyInvest')}</span>
                <span className="comparison-value">$20</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">{t('comparison.totalInvested')}</span>
                <span className="comparison-value">$31,200</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">{t('comparison.portfolioValue')}</span>
                <span className="comparison-value positive">~$102,000</span>
              </div>
              <div className="comparison-stat">
                <span className="comparison-label">{t('comparison.netGain')}</span>
                <span className="comparison-value positive">+$70,800</span>
              </div>
              <p className="comparison-note">{t('comparison.investNote')}</p>
            </div>
          </div>
          <p className="comparison-takeaway" dangerouslySetInnerHTML={{ __html: t('comparison.takeaway') }} />
        </section>

        <section className="learn-section">
          <h2>{t('gamblersFallacy.title')}</h2>
          <p>{t('gamblersFallacy.text')}</p>
          <div className="example-box">
            <h3>{t('gamblersFallacy.exampleTitle')}</h3>
            <ul>
              <li><strong>{t('gamblersFallacy.misconceptionLabel')}</strong> {t('gamblersFallacy.misconception1')}</li>
              <li><strong>{t('gamblersFallacy.realityLabel')}</strong> {t('gamblersFallacy.reality1')}</li>
              <li><strong>{t('gamblersFallacy.misconceptionLabel')}</strong> {t('gamblersFallacy.misconception2')}</li>
              <li><strong>{t('gamblersFallacy.realityLabel')}</strong> {t('gamblersFallacy.reality2')}</li>
              <li><strong>{t('gamblersFallacy.misconceptionLabel')}</strong> {t('gamblersFallacy.misconception3')}</li>
              <li><strong>{t('gamblersFallacy.realityLabel')}</strong> {t('gamblersFallacy.reality3')}</li>
            </ul>
          </div>
        </section>

        <section className="learn-section">
          <h2>{t('largeNumbers.title')}</h2>
          <p>{t('largeNumbers.text')}</p>
          <div className="example-box">
            <h3>{t('largeNumbers.exampleTitle')}</h3>
            <ul>
              <li>{t('largeNumbers.item1')}</li>
              <li>{t('largeNumbers.item2')}</li>
              <li>{t('largeNumbers.item3')}</li>
              <li>{t('largeNumbers.item4')}</li>
            </ul>
          </div>
        </section>

        <section className="learn-section">
          <h2>{t('lessons.title')}</h2>
          <p>{t('lessons.text')}</p>
          <div className="lessons-grid">
            <div className="lesson-card">
              <h3>{t('lessons.riskReward')}</h3>
              <p>{t('lessons.riskRewardText')}</p>
            </div>
            <div className="lesson-card">
              <h3>{t('lessons.statThinking')}</h3>
              <p>{t('lessons.statThinkingText')}</p>
            </div>
            <div className="lesson-card">
              <h3>{t('lessons.longTermPlanning')}</h3>
              <p>{t('lessons.longTermPlanningText')}</p>
            </div>
            <div className="lesson-card">
              <h3>{t('lessons.psychologyLoss')}</h3>
              <p>{t('lessons.psychologyLossText')}</p>
            </div>
          </div>
        </section>

        <section className="learn-section cta-section">
          <h2>{t('cta.title')}</h2>
          <p>{t('cta.text')}</p>
          <div className="cta-buttons">
            <Link to="/games" className="cta-primary">
              {t('cta.trySimulator')}
            </Link>
            <Link to="/stats" className="cta-secondary">
              {t('cta.viewStatistics')}
            </Link>
          </div>
        </section>

        <section className="learn-section warning-section">
          <h2>{t('responsible.title')}</h2>
          <p>{t('responsible.text')}</p>
          <div className="warning-box">
            <ul>
              <li>{t('responsible.helpline')}</li>
              <li>{t('responsible.ga')} <a href="https://www.gamblersanonymous.org/" target="_blank" rel="noopener noreferrer">www.gamblersanonymous.org</a></li>
              <li>{t('responsible.ncpg')} <a href="https://www.ncpg.org/" target="_blank" rel="noopener noreferrer">www.ncpg.org</a></li>
            </ul>
            <p style={{ marginTop: '16px' }}>
              <strong>{t('responsible.rememberLabel')}</strong> {t('responsible.remember')}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LearnPage

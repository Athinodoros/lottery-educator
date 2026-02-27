import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../utils/formatNumber'
import './OddsPerspective.css'

function TombstoneVisualization({ lifetimes }: { lifetimes: number }) {
  const { t } = useTranslation('gameplay')
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const displayCount = Math.min(lifetimes, 100)
  const overflow = lifetimes - displayCount

  return (
    <div className={`tombstone-visualization${visible ? ' visible' : ''}`} ref={ref}>
      <p className="tombstone-label">{t('perspective.tombstoneLabel')}</p>
      <div className="tombstone-grid">
        {Array.from({ length: displayCount }).map((_, i) => (
          <svg
            key={i}
            className="tombstone-icon"
            style={{ '--i': i } as React.CSSProperties}
            aria-hidden="true"
            viewBox="0 0 32 40"
            width="28"
            height="35"
          >
            <path
              d="M4 40V16C4 8.27 9.37 2 16 2s12 6.27 12 14v24H4z"
              fill="#6b7280"
            />
            <rect x="14.5" y="10" width="3" height="14" rx="1" fill="#d1d5db" />
            <rect x="10" y="14.5" width="12" height="3" rx="1" fill="#d1d5db" />
          </svg>
        ))}
      </div>
      {overflow > 0 && (
        <p className="tombstone-overflow">
          {t('perspective.tombstoneOverflow', { count: overflow })}
        </p>
      )}
    </div>
  )
}

interface OddsPerspectiveProps {
  expectedDraws: number
  gameName: string
}

export default function OddsPerspective({ expectedDraws, gameName }: OddsPerspectiveProps) {
  const { t, i18n } = useTranslation('gameplay')
  const lng = i18n.language

  return (
    <section className="odds-perspective-section" aria-label={t('perspective.title')}>
      <h2>{t('perspective.title')}</h2>

      <div className="perspective-card">
        <h3>{t('perspective.howLong')}</h3>
        <p>{t('perspective.howLongDesc', { name: gameName })}</p>
        <div className="time-grid">
          <div className="time-item">
            <div className="time-value">{formatNumber(Math.round(expectedDraws / 365), lng)}</div>
            <div className="time-label">{t('perspective.yearsDaily')}</div>
          </div>
          <div className="time-item">
            <div className="time-value">{formatNumber(Math.round(expectedDraws / 104), lng)}</div>
            <div className="time-label">{t('perspective.yearsTwiceWeek')}</div>
          </div>
          <div className="time-item">
            <div className="time-value">{formatNumber(Math.round(expectedDraws / 52), lng)}</div>
            <div className="time-label">{t('perspective.yearsOnceWeek')}</div>
          </div>
        </div>
      </div>

      <div className="perspective-card">
        <h3>{t('perspective.howMuchSpend')}</h3>
        <p>{t('perspective.howMuchSpendDesc')}</p>
        <div className="time-grid">
          <div className="time-item">
            <div className="time-value">${formatNumber(expectedDraws * 2, lng)}</div>
            <div className="time-label">{t('perspective.totalCost', { perYear: formatNumber(Math.round((expectedDraws * 2) / (Math.round(expectedDraws / 365))), lng) })}</div>
          </div>
          <div className="time-item">
            <div className="time-value">${formatNumber(104 * 2, lng)}</div>
            <div className="time-label">{t('perspective.perYearTwiceWeek')}</div>
          </div>
          <div className="time-item">
            <div className="time-value">${formatNumber(52 * 2, lng)}</div>
            <div className="time-label">{t('perspective.perYearOnceWeek')}</div>
          </div>
        </div>
      </div>

      <div className="perspective-card">
        <h3>{t('perspective.lightning')}</h3>
        <p>{t('perspective.lightningDesc')}</p>
        <div className="time-grid single">
          <div className="time-item">
            <div className="time-value">{(expectedDraws / 1222000).toFixed(1)}x</div>
            <div className="time-label">{t('perspective.lightningLabel', { name: gameName })}</div>
          </div>
        </div>
      </div>

      <div className="perspective-card">
        <h3>{t('perspective.coinFlip')}</h3>
        <p>{t('perspective.coinFlipDesc', { name: gameName })}</p>
        <div className="time-grid single">
          <div className="time-item">
            <div className="time-value">{t('perspective.coinFlipValue', { count: Math.round(Math.log2(expectedDraws)) })}</div>
            <div className="time-label">{t('perspective.coinFlipLabel')}</div>
          </div>
        </div>
      </div>

      <div className="perspective-card">
        <h3>{t('perspective.ticketStack')}</h3>
        <p>{t('perspective.ticketStackDesc')}</p>
        <div className="time-grid">
          <div className="time-item">
            <div className="time-value">{formatNumber(expectedDraws / 1000, lng)} m</div>
            <div className="time-label">{t('perspective.stackHeight')}</div>
          </div>
          <div className="time-item">
            <div className="time-value">{(expectedDraws / 1000000).toFixed(1)} km</div>
            <div className="time-label">{expectedDraws >= 8848000 ? t('perspective.everestComparison', { value: (expectedDraws / 8848000).toFixed(1) }) : expectedDraws >= 324000 ? t('perspective.eiffelComparison', { value: (expectedDraws / 324000).toFixed(1) }) : t('perspective.stackedUp')}</div>
          </div>
          <div className="time-item">
            <div className="time-value">{expectedDraws >= 384400000000 ? `${(expectedDraws / 384400000000).toFixed(2)}x` : expectedDraws >= 1000000000 ? `${((expectedDraws / 384400000000) * 100).toFixed(2)}%` : `${((expectedDraws / 1000000) / 384400 * 100).toFixed(4)}%`}</div>
            <div className="time-label">{t('perspective.moonDistance')}</div>
          </div>
        </div>
      </div>

      <div className="perspective-card">
        <h3>{t('perspective.pickCard')}</h3>
        <p>{t('perspective.pickCardDesc', { name: gameName })}</p>
        <div className="time-grid single">
          <div className="time-item">
            <div className="time-value">{t('perspective.pickCardValue', { decks: formatNumber(Math.round(expectedDraws / 52), lng) })}</div>
            <div className="time-label">{t('perspective.pickCardLabel', { decks: formatNumber(Math.round(expectedDraws / 52), lng) })}</div>
          </div>
        </div>
      </div>

      <div className="perspective-card">
        <h3>{t('perspective.birthday')}</h3>
        <p>{t('perspective.birthdayDesc', { name: gameName })}</p>
        <div className="time-grid single">
          <div className="time-item">
            <div className="time-value">{t('perspective.birthdayValue', { count: Math.round(Math.log(expectedDraws) / Math.log(365)) })}</div>
            <div className="time-label">{t('perspective.birthdayLabel', { count: Math.round(Math.log(expectedDraws) / Math.log(365)) })}</div>
          </div>
        </div>
      </div>

      <div className="perspective-card">
        <h3>{t('perspective.lifetimes')}</h3>
        <p>{t('perspective.lifetimesDesc')}</p>
        <div className="time-grid">
          <div className="time-item">
            <div className="time-value">{formatNumber(Math.round(expectedDraws / 365 / 80), lng)}</div>
            <div className="time-label">{t('perspective.lifetimesDaily')}</div>
          </div>
          <div className="time-item">
            <div className="time-value">{formatNumber(Math.round(expectedDraws / 104 / 80), lng)}</div>
            <div className="time-label">{t('perspective.lifetimesTwiceWeek')}</div>
          </div>
          <div className="time-item">
            <div className="time-value">{formatNumber(Math.round(expectedDraws / 52 / 80), lng)}</div>
            <div className="time-label">{t('perspective.lifetimesOnceWeek')}</div>
          </div>
        </div>
      </div>

      <TombstoneVisualization lifetimes={Math.round(expectedDraws / 365 / 80)} />
    </section>
  )
}

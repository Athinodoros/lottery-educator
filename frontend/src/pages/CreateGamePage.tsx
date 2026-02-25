import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { gameApi } from '../api/games'
import './CreateGamePage.css'

function CreateGamePage() {
  const { t } = useTranslation('create')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [minNumber, setMinNumber] = useState(1)
  const [maxNumber, setMaxNumber] = useState(49)
  const [numbersToSelect, setNumbersToSelect] = useState(6)
  const [hasBonus, setHasBonus] = useState(false)
  const [bonusMin, setBonusMin] = useState(1)
  const [bonusMax, setBonusMax] = useState(10)
  const [bonusCount, setBonusCount] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const mainRange = maxNumber - minNumber + 1
  const bonusRange = bonusMax - bonusMin + 1

  const validate = (): string | null => {
    if (!name.trim()) return t('validation.nameRequired')
    if (minNumber >= maxNumber) return t('validation.minLessThanMax')
    if (minNumber < 1) return t('validation.minAtLeast1')
    if (maxNumber > 100) return t('validation.maxAtMost100')
    if (numbersToSelect < 1) return t('validation.selectAtLeast1')
    if (numbersToSelect >= mainRange) return t('validation.selectLessThanRange')
    if (hasBonus) {
      if (bonusMin >= bonusMax) return t('validation.bonusMinLessThanMax')
      if (bonusMin < 1) return t('validation.bonusMinAtLeast1')
      if (bonusMax > 100) return t('validation.bonusMaxAtMost100')
      if (bonusCount < 1) return t('validation.bonusAtLeast1')
      if (bonusCount >= bonusRange) return t('validation.bonusLessThanRange')
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    try {
      await gameApi.createGame({
        name: name.trim(),
        description: description.trim() || undefined,
        number_range: [minNumber, maxNumber],
        numbers_to_select: numbersToSelect,
        bonus_number_range: hasBonus ? [bonusMin, bonusMax] : undefined,
        bonus_numbers_to_select: hasBonus ? bonusCount : undefined,
      })
      setSubmitted(true)
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to create game'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="create-game-page">
        <div className="success-card">
          <h2>{t('successTitle')}</h2>
          <p>{t('successText1')}</p>
          <p>{t('successText2')}</p>
          <div className="success-actions">
            <Link to="/games" className="btn btn-primary">{t('backToGamesBtn')}</Link>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSubmitted(false)
                setName('')
                setDescription('')
                setMinNumber(1)
                setMaxNumber(49)
                setNumbersToSelect(6)
                setHasBonus(false)
              }}
            >
              {t('createAnother')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-game-page">
      <header className="create-game-header">
        <Link to="/games" className="back-link">{t('backToGames')}</Link>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
      </header>

      <form onSubmit={handleSubmit} className="create-game-form">
        {error && (
          <div className="form-error" role="alert">{error}</div>
        )}

        <div className="form-section">
          <h3>{t('gameDetails')}</h3>
          <div className="form-group">
            <label htmlFor="game-name">{t('gameName')}</label>
            <input
              id="game-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('gameNamePlaceholder')}
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="game-desc">{t('descriptionLabel')}</label>
            <textarea
              id="game-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>{t('mainPool')}</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="min-num">{t('minNumber')}</label>
              <input
                id="min-num"
                type="number"
                value={minNumber}
                onChange={(e) => setMinNumber(Number(e.target.value))}
                min={1}
                max={99}
              />
            </div>
            <div className="form-group">
              <label htmlFor="max-num">{t('maxNumber')}</label>
              <input
                id="max-num"
                type="number"
                value={maxNumber}
                onChange={(e) => setMaxNumber(Number(e.target.value))}
                min={2}
                max={100}
              />
            </div>
            <div className="form-group">
              <label htmlFor="nums-select">{t('numbersToSelect')}</label>
              <input
                id="nums-select"
                type="number"
                value={numbersToSelect}
                onChange={(e) => setNumbersToSelect(Number(e.target.value))}
                min={1}
                max={mainRange - 1 > 0 ? mainRange - 1 : 1}
              />
            </div>
          </div>
          <p className="form-hint">
            {t('mainHint', { count: numbersToSelect, min: minNumber, max: maxNumber, range: mainRange })}
          </p>
        </div>

        <div className="form-section">
          <div className="form-toggle">
            <label htmlFor="has-bonus">
              <input
                id="has-bonus"
                type="checkbox"
                checked={hasBonus}
                onChange={(e) => setHasBonus(e.target.checked)}
              />
              {t('addBonusPool')}
            </label>
          </div>

          {hasBonus && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bonus-min">{t('bonusMin')}</label>
                  <input
                    id="bonus-min"
                    type="number"
                    value={bonusMin}
                    onChange={(e) => setBonusMin(Number(e.target.value))}
                    min={1}
                    max={99}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bonus-max">{t('bonusMax')}</label>
                  <input
                    id="bonus-max"
                    type="number"
                    value={bonusMax}
                    onChange={(e) => setBonusMax(Number(e.target.value))}
                    min={2}
                    max={100}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="bonus-count">{t('bonusToSelect')}</label>
                  <input
                    id="bonus-count"
                    type="number"
                    value={bonusCount}
                    onChange={(e) => setBonusCount(Number(e.target.value))}
                    min={1}
                    max={bonusRange - 1 > 0 ? bonusRange - 1 : 1}
                  />
                </div>
              </div>
              <p className="form-hint">
                {t('bonusHint', { count: bonusCount, min: bonusMin, max: bonusMax })}
              </p>
            </>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary submit-btn"
          disabled={submitting || !name.trim()}
        >
          {submitting ? t('submitting') : t('submitForReview')}
        </button>
      </form>
    </div>
  )
}

export default CreateGamePage

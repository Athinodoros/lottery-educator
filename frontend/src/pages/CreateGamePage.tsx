import { useState } from 'react'
import { Link } from 'react-router-dom'
import { gameApi } from '../api/games'
import './CreateGamePage.css'

function CreateGamePage() {
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
    if (!name.trim()) return 'Game name is required'
    if (minNumber >= maxNumber) return 'Min number must be less than max number'
    if (minNumber < 1) return 'Min number must be at least 1'
    if (maxNumber > 100) return 'Max number must be at most 100'
    if (numbersToSelect < 1) return 'Must select at least 1 number'
    if (numbersToSelect >= mainRange) return 'Numbers to select must be less than the range'
    if (hasBonus) {
      if (bonusMin >= bonusMax) return 'Bonus min must be less than bonus max'
      if (bonusMin < 1) return 'Bonus min must be at least 1'
      if (bonusMax > 100) return 'Bonus max must be at most 100'
      if (bonusCount < 1) return 'Must select at least 1 bonus number'
      if (bonusCount >= bonusRange) return 'Bonus count must be less than the bonus range'
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
          <h2>Game Submitted!</h2>
          <p>Your game has been submitted for review. An admin will approve it shortly.</p>
          <p>Once approved, it will appear in the games list for everyone to play.</p>
          <div className="success-actions">
            <Link to="/games" className="btn btn-primary">Back to Games</Link>
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
              Create Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-game-page">
      <header className="create-game-header">
        <Link to="/games" className="back-link">&#8592; Back to Games</Link>
        <h1>Create a Game</h1>
        <p>Design your own lottery game. After submission, an admin will review and approve it.</p>
      </header>

      <form onSubmit={handleSubmit} className="create-game-form">
        {error && (
          <div className="form-error" role="alert">{error}</div>
        )}

        <div className="form-section">
          <h3>Game Details</h3>
          <div className="form-group">
            <label htmlFor="game-name">Game Name *</label>
            <input
              id="game-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Lucky Lottery"
              maxLength={100}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="game-desc">Description</label>
            <textarea
              id="game-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the game rules and format..."
              rows={3}
              maxLength={500}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Main Number Pool</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="min-num">Min Number</label>
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
              <label htmlFor="max-num">Max Number</label>
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
              <label htmlFor="nums-select">Numbers to Select</label>
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
            Players will pick {numbersToSelect} number{numbersToSelect !== 1 ? 's' : ''} from {minNumber} to {maxNumber} (range of {mainRange})
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
              Add Bonus Number Pool
            </label>
          </div>

          {hasBonus && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bonus-min">Bonus Min</label>
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
                  <label htmlFor="bonus-max">Bonus Max</label>
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
                  <label htmlFor="bonus-count">Bonus to Select</label>
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
                Players will also pick {bonusCount} bonus number{bonusCount !== 1 ? 's' : ''} from {bonusMin} to {bonusMax}
              </p>
            </>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary submit-btn"
          disabled={submitting || !name.trim()}
        >
          {submitting ? 'Submitting...' : 'Submit Game for Review'}
        </button>
      </form>
    </div>
  )
}

export default CreateGamePage

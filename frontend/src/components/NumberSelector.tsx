import { useTranslation } from 'react-i18next'
import './NumberSelector.css'

interface NumberSelectorProps {
  minNumber: number
  maxNumber: number
  numbersToSelect: number
  selectedNumbers: number[]
  onNumberToggle: (number: number) => void
  disabled?: boolean
}

export function NumberSelector({
  minNumber,
  maxNumber,
  numbersToSelect,
  selectedNumbers,
  onNumberToggle,
  disabled = false,
}: NumberSelectorProps) {
  const { t } = useTranslation('gameplay')
  const numbers = Array.from(
    { length: maxNumber - minNumber + 1 },
    (_, i) => minNumber + i
  )

  const canSelect = selectedNumbers.length < numbersToSelect
  const isComplete = selectedNumbers.length === numbersToSelect

  return (
    <div className="number-selector">
      <div className="selector-header">
        <h3>{t('numberSelector.selectNumbers', { count: numbersToSelect, min: minNumber, max: maxNumber })}</h3>
        <div className={`progress-badge ${isComplete ? 'complete' : ''}`}>
          {selectedNumbers.length} / {numbersToSelect}
        </div>
      </div>

      <div className="numbers-grid">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num)
          return (
            <button
              key={num}
              className={`number-button ${isSelected ? 'selected' : ''}`}
              onClick={() => onNumberToggle(num)}
              disabled={disabled || (!isSelected && !canSelect)}
              aria-pressed={isSelected}
            >
              {num}
            </button>
          )
        })}
      </div>

      {isComplete && (
        <div className="selection-complete">
          ✓ {t('numberSelector.allSelected', { count: numbersToSelect })}
        </div>
      )}
    </div>
  )
}

export default NumberSelector

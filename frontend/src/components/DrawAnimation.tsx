import { useTranslation } from 'react-i18next'
import './DrawAnimation.css'

interface DrawAnimationProps {
  isDrawing: boolean
  progress: number
  message?: string
}

export function DrawAnimation({
  isDrawing,
  progress,
  message,
}: DrawAnimationProps) {
  const { t } = useTranslation('gameplay')

  if (!isDrawing) {
    return null
  }

  return (
    <div className="draw-animation-overlay">
      <div className="draw-animation-container">
        <div className="spinner"></div>
        <p className="draw-message">{message || t('drawingLottery')}</p>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

export default DrawAnimation

import './DrawAnimation.css'

interface DrawAnimationProps {
  isDrawing: boolean
  progress: number
  message?: string
}

export function DrawAnimation({
  isDrawing,
  progress,
  message = 'Drawing lottery...',
}: DrawAnimationProps) {
  if (!isDrawing) {
    return null
  }

  return (
    <div className="draw-animation-overlay">
      <div className="draw-animation-container">
        <div className="spinner"></div>
        <p className="draw-message">{message}</p>
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

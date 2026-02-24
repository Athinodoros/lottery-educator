import './Skeleton.css'

interface SkeletonProps {
  width?: string
  height?: string
  borderRadius?: string
  className?: string
}

export function Skeleton({ width, height, borderRadius, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton-card ${className}`} aria-hidden="true">
      <Skeleton height="20px" width="60%" />
      <Skeleton height="32px" width="40%" />
      <Skeleton height="14px" width="80%" />
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton-text" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}

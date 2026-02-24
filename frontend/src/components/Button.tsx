interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
}

export default function Button({
  label,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    border: 'none',
    borderRadius: '6px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontSize: size === 'small' ? '14px' : size === 'large' ? '16px' : '15px',
    fontWeight: '600',
    padding:
      size === 'small'
        ? '8px 12px'
        : size === 'large'
          ? '12px 20px'
          : '10px 16px',
    transition: 'all 0.2s ease',
    opacity: disabled || loading ? 0.6 : 1,
  }

  const variantStyles: React.CSSProperties =
    variant === 'primary'
      ? {
          backgroundColor: '#6366f1',
          color: 'white',
        }
      : variant === 'secondary'
        ? {
            backgroundColor: '#e0e7ff',
            color: '#6366f1',
          }
        : {
            backgroundColor: 'transparent',
            color: '#6366f1',
            border: '1px solid #6366f1',
          }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...baseStyles, ...variantStyles }}
    >
      {loading ? 'Loading...' : label}
    </button>
  )
}

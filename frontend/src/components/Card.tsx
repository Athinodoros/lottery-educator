interface CardData {
  title: string
  subtitle?: string
  value?: string | number
  description?: string
}

interface CardProps {
  data: CardData
  onClick?: () => void
}

export default function Card({ data, onClick }: CardProps) {
  const styles: React.CSSProperties = {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #e5e7eb',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
  }

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  }

  const titleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  }

  const subtitleStyles: React.CSSProperties = {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '4px 0 0 0',
  }

  const valueStyles: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#6366f1',
  }

  const descriptionStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    margin: '8px 0 0 0',
  }

  return (
    <div style={styles} onClick={onClick}>
      <div style={headerStyles}>
        <div>
          <p style={titleStyles}>{data.title}</p>
          {data.subtitle && <p style={subtitleStyles}>{data.subtitle}</p>}
        </div>
        {data.value && <p style={valueStyles}>{data.value}</p>}
      </div>
      {data.description && <p style={descriptionStyles}>{data.description}</p>}
    </div>
  )
}

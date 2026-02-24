import { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f9fafb',
    color: '#1f2937',
    textAlign: 'center' as const,
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  message: {
    fontSize: '1rem',
    color: '#6b7280',
    maxWidth: '480px',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#ffffff',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
  },
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.icon}>&#9888;</div>
          <h1 style={styles.heading}>Something went wrong</h1>
          <p style={styles.message}>
            An unexpected error occurred while loading the page. Please try
            again. If the problem persists, contact support.
          </p>
          <button style={styles.button} onClick={this.handleReload}>
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

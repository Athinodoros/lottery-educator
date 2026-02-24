import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../../components/ErrorBoundary'

function ProblemChild() {
  throw new Error('Test error')
}

function GoodChild() {
  return <div>Everything is fine</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error from React and our ErrorBoundary
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    )
    expect(screen.getByText('Everything is fine')).toBeTruthy()
  })

  it('renders error UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeTruthy()
    expect(screen.getByText(/unexpected error/i)).toBeTruthy()
  })

  it('renders a Try Again button', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    )
    expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy()
  })
})

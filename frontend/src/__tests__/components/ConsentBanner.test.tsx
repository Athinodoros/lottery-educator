import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConsentBanner from '../../components/ConsentBanner'
import { useSessionStore } from '../../store/useSessionStore'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('ConsentBanner', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    useSessionStore.setState({ hasGivenConsent: false })
  })

  it('renders the banner when user has not decided yet', () => {
    localStorageMock.getItem.mockReturnValue(null)
    render(<ConsentBanner />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/anonymous analytics/i)).toBeInTheDocument()
    expect(screen.getByText('Accept')).toBeInTheDocument()
    expect(screen.getByText('Decline')).toBeInTheDocument()
  })

  it('does not render when consent has been given', () => {
    useSessionStore.setState({ hasGivenConsent: true })
    render(<ConsentBanner />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render when user has previously declined', () => {
    localStorageMock.getItem.mockReturnValue('false')
    render(<ConsentBanner />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls giveConsent when Accept is clicked', async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue(null)

    const giveConsent = vi.fn()
    useSessionStore.setState({ hasGivenConsent: false, giveConsent })

    render(<ConsentBanner />)
    await user.click(screen.getByText('Accept'))
    expect(giveConsent).toHaveBeenCalled()
  })

  it('calls revokeConsent when Decline is clicked', async () => {
    const user = userEvent.setup()
    localStorageMock.getItem.mockReturnValue(null)

    const revokeConsent = vi.fn()
    useSessionStore.setState({ hasGivenConsent: false, revokeConsent })

    render(<ConsentBanner />)
    await user.click(screen.getByText('Decline'))
    expect(revokeConsent).toHaveBeenCalled()
  })

  it('has proper dialog role and aria-label', () => {
    localStorageMock.getItem.mockReturnValue(null)
    render(<ConsentBanner />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', 'Cookie consent')
  })
})

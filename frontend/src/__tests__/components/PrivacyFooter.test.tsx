import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PrivacyFooter from '../../components/PrivacyFooter'

const mockForgetMe = vi.fn()

vi.mock('../../store/useSessionStore', () => ({
  useSessionStore: vi.fn((selector: any) => selector({ forgetMe: mockForgetMe })),
}))

describe('PrivacyFooter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render privacy text', () => {
    render(<PrivacyFooter />)
    expect(screen.getByText('footer.privacyText')).toBeTruthy()
  })

  it('should show delete button initially', () => {
    render(<PrivacyFooter />)
    expect(screen.getByText('footer.deleteButton')).toBeTruthy()
  })

  it('should show confirmation prompt after clicking delete', () => {
    render(<PrivacyFooter />)
    fireEvent.click(screen.getByText('footer.deleteButton'))

    expect(screen.getByText('footer.deleteConfirm')).toBeTruthy()
    expect(screen.getByText('footer.confirmYes')).toBeTruthy()
    expect(screen.getByText('footer.confirmCancel')).toBeTruthy()
  })

  it('should return to delete button when cancel is clicked', () => {
    render(<PrivacyFooter />)
    fireEvent.click(screen.getByText('footer.deleteButton'))
    fireEvent.click(screen.getByText('footer.confirmCancel'))

    expect(screen.getByText('footer.deleteButton')).toBeTruthy()
    expect(screen.queryByText('footer.deleteConfirm')).toBeNull()
  })

  it('should call forgetMe and show deleted status when confirm is clicked', () => {
    render(<PrivacyFooter />)
    fireEvent.click(screen.getByText('footer.deleteButton'))
    fireEvent.click(screen.getByText('footer.confirmYes'))

    expect(mockForgetMe).toHaveBeenCalledTimes(1)
    expect(screen.getByText('footer.dataDeleted')).toBeTruthy()
  })

  it('should have role="status" on the deleted confirmation message', () => {
    render(<PrivacyFooter />)
    fireEvent.click(screen.getByText('footer.deleteButton'))
    fireEvent.click(screen.getByText('footer.confirmYes'))

    const statusElement = screen.getByRole('status')
    expect(statusElement).toBeTruthy()
    expect(statusElement.textContent).toBe('footer.dataDeleted')
  })

  it('should have role="alert" on the confirmation prompt', () => {
    render(<PrivacyFooter />)
    fireEvent.click(screen.getByText('footer.deleteButton'))

    const alertElement = screen.getByRole('alert')
    expect(alertElement).toBeTruthy()
  })
})

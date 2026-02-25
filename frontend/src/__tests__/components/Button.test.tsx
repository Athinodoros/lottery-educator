import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../../components/Button'

describe('Button Component', () => {
  let mockOnClick: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnClick = vi.fn()
  })

  it('should render with the label text', () => {
    render(<Button label="Click Me" onClick={mockOnClick} />)
    expect(screen.getByText('Click Me')).toBeTruthy()
  })

  it('should show "Loading..." when loading is true', () => {
    render(<Button label="Click Me" onClick={mockOnClick} loading />)
    expect(screen.getByText('Loading...')).toBeTruthy()
    expect(screen.queryByText('Click Me')).toBeNull()
  })

  it('should disable the button when disabled is true', () => {
    render(<Button label="Click Me" onClick={mockOnClick} disabled />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should disable the button when loading is true', () => {
    render(<Button label="Click Me" onClick={mockOnClick} loading />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should have reduced opacity (0.6) when disabled', () => {
    render(<Button label="Click Me" onClick={mockOnClick} disabled />)
    const button = screen.getByRole('button')
    expect(button.style.opacity).toBe('0.6')
  })

  it('should have reduced opacity (0.6) when loading', () => {
    render(<Button label="Click Me" onClick={mockOnClick} loading />)
    const button = screen.getByRole('button')
    expect(button.style.opacity).toBe('0.6')
  })

  it('should call onClick when clicked', () => {
    render(<Button label="Click Me" onClick={mockOnClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should NOT call onClick when disabled', () => {
    render(<Button label="Click Me" onClick={mockOnClick} disabled />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('should render with variant "primary" without error', () => {
    const { container } = render(
      <Button label="Primary" onClick={mockOnClick} variant="primary" />
    )
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('should render with variant "secondary" without error', () => {
    const { container } = render(
      <Button label="Secondary" onClick={mockOnClick} variant="secondary" />
    )
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('should render with variant "outline" without error', () => {
    const { container } = render(
      <Button label="Outline" onClick={mockOnClick} variant="outline" />
    )
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('should render with different sizes without error', () => {
    const { rerender, container } = render(
      <Button label="Small" onClick={mockOnClick} size="small" />
    )
    expect(container.querySelector('button')).toBeTruthy()

    rerender(<Button label="Medium" onClick={mockOnClick} size="medium" />)
    expect(container.querySelector('button')).toBeTruthy()

    rerender(<Button label="Large" onClick={mockOnClick} size="large" />)
    expect(container.querySelector('button')).toBeTruthy()
  })
})

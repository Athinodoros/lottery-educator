import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Card from '../../components/Card'

describe('Card Component', () => {
  const baseData = {
    title: 'Test Title',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the title', () => {
    render(<Card data={baseData} />)
    expect(screen.getByText('Test Title')).toBeTruthy()
  })

  it('should render subtitle when provided', () => {
    render(<Card data={{ ...baseData, subtitle: 'Test Subtitle' }} />)
    expect(screen.getByText('Test Subtitle')).toBeTruthy()
  })

  it('should not render subtitle when not provided', () => {
    const { container } = render(<Card data={baseData} />)
    // The card should only have the title paragraph in the header, no subtitle
    const paragraphs = container.querySelectorAll('p')
    const texts = Array.from(paragraphs).map((p) => p.textContent)
    expect(texts).not.toContain(undefined)
    // There should be no subtitle element
    expect(screen.queryByText('Test Subtitle')).toBeNull()
  })

  it('should render value when provided', () => {
    render(<Card data={{ ...baseData, value: '42' }} />)
    expect(screen.getByText('42')).toBeTruthy()
  })

  it('should render numeric value when provided', () => {
    render(<Card data={{ ...baseData, value: 100 }} />)
    expect(screen.getByText('100')).toBeTruthy()
  })

  it('should render description when provided', () => {
    render(<Card data={{ ...baseData, description: 'A test description' }} />)
    expect(screen.getByText('A test description')).toBeTruthy()
  })

  it('should call onClick when clicked', () => {
    const mockOnClick = vi.fn()
    render(<Card data={baseData} onClick={mockOnClick} />)
    fireEvent.click(screen.getByText('Test Title'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should have pointer cursor when onClick is provided', () => {
    const mockOnClick = vi.fn()
    const { container } = render(<Card data={baseData} onClick={mockOnClick} />)
    const cardDiv = container.firstElementChild as HTMLElement
    expect(cardDiv.style.cursor).toBe('pointer')
  })

  it('should have default cursor when onClick is not provided', () => {
    const { container } = render(<Card data={baseData} />)
    const cardDiv = container.firstElementChild as HTMLElement
    expect(cardDiv.style.cursor).toBe('default')
  })
})

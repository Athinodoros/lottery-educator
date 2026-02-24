import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameCard from '../../components/GameCard'

// Mock the router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  }
})

describe('GameCard Component', () => {
  const mockGame = {
    id: 'game-1',
    name: 'Powerball',
    description: 'Pick 5 from 69, plus 1 from 26',
    number_range: [1, 69],
    numbers_to_select: 5,
    extra_numbers: 26,
    created_at: '2024-01-01',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render game card with title', () => {
    render(<GameCard game={mockGame} />)
    expect(screen.getByText('Powerball')).toBeTruthy()
  })

  it('should display game description', () => {
    render(<GameCard game={mockGame} />)
    expect(screen.getByText('Pick 5 from 69, plus 1 from 26')).toBeTruthy()
  })

  it('should have play button with link to game', () => {
    render(<GameCard game={mockGame} />)
    const playButton = screen.getByRole('link', { name: /play/i })
    expect(playButton.getAttribute('href')).toBe(`/games/${mockGame.id}`)
  })

  it('should have stats button with link to statistics', () => {
    render(<GameCard game={mockGame} />)
    const statsButton = screen.getByRole('link', { name: /stats/i })
    expect(statsButton.getAttribute('href')).toBe(`/stats/${mockGame.id}`)
  })

  it('should display game configuration info', () => {
    const { container } = render(<GameCard game={mockGame} />)
    // Test for the game configuration display (numbers_to_select and number_range)
    const gameCard = container.querySelector('[class*="card"]')
    expect(gameCard).toBeTruthy()
    // Verify the card contains the range info
    expect(gameCard?.textContent).toContain('69')
  })

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup()
    render(<GameCard game={mockGame} />)
    
    const playButton = screen.getByRole('link', { name: /play/i })
    await user.tab()
    expect(document.activeElement).toBe(playButton)
  })
})

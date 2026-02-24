import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StatCard from '../../components/StatCard'

describe('StatCard Component', () => {
  describe('Simple display mode (label + value)', () => {
    it('should render with label and value', () => {
      render(<StatCard label="Total Plays" value={42} />)
      expect(screen.getByText('Total Plays')).toBeTruthy()
      expect(screen.getByText('42')).toBeTruthy()
    })

    it('should render string value', () => {
      render(<StatCard label="Win Rate" value="3.14%" />)
      expect(screen.getByText('Win Rate')).toBeTruthy()
      expect(screen.getByText('3.14%')).toBeTruthy()
    })

    it('should render with zero value', () => {
      render(<StatCard label="Wins" value={0} />)
      expect(screen.getByText('Wins')).toBeTruthy()
      expect(screen.getByText('0')).toBeTruthy()
    })
  })

  describe('Full game statistics mode', () => {
    const fullProps = {
      name: 'Powerball',
      totalPlays: 1000,
      totalWins: 5,
      winRate: 0.5,
      avgDraws: 14000000,
    }

    it('should render game name', () => {
      render(<StatCard {...fullProps} />)
      expect(screen.getByText('Powerball')).toBeTruthy()
    })

    it('should display total plays', () => {
      render(<StatCard {...fullProps} />)
      expect(screen.getByText('1000')).toBeTruthy()
    })

    it('should display total wins', () => {
      render(<StatCard {...fullProps} />)
      expect(screen.getByText('5')).toBeTruthy()
    })

    it('should display win rate percentage', () => {
      render(<StatCard {...fullProps} />)
      // Win rate is formatted with toFixed(2) — appears in stat and progress label
      const allWinRates = screen.getAllByText('0.50%')
      expect(allWinRates.length).toBeGreaterThan(0)
    })

    it('should display average draws', () => {
      render(<StatCard {...fullProps} />)
      // avgDraws formatted with toFixed(1)
      expect(screen.getByText('14000000.0')).toBeTruthy()
    })

    it('should render progress bar for win rate', () => {
      const { container } = render(<StatCard {...fullProps} />)
      const progressBar = container.querySelector('.progress-fill')
      expect(progressBar).toBeTruthy()
    })

    it('should handle zero values gracefully', () => {
      render(<StatCard name="Empty Game" totalPlays={0} totalWins={0} winRate={0} avgDraws={0} />)
      expect(screen.getByText('Empty Game')).toBeTruthy()
    })
  })

  describe('Interaction', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<StatCard name="Powerball" totalPlays={100} totalWins={1} winRate={1} avgDraws={1000} onClick={handleClick} />)
      const card = screen.getByRole('button')
      fireEvent.click(card)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be keyboard navigable', () => {
      render(<StatCard name="Powerball" totalPlays={100} totalWins={1} winRate={1} avgDraws={1000} />)
      const card = screen.getByRole('button')
      expect(card.getAttribute('tabIndex')).toBe('0')
    })

    it('should render as a card with label and value', () => {
      // The component always renders with role="button" — verify it works without onClick
      render(<StatCard label="Simple" value="test" />)
      expect(screen.getByText('Simple')).toBeTruthy()
      expect(screen.getByText('test')).toBeTruthy()
    })
  })

  describe('Default values', () => {
    it('should use N/A for missing name', () => {
      render(<StatCard totalPlays={10} totalWins={1} winRate={10} avgDraws={100} />)
      expect(screen.getByText('N/A')).toBeTruthy()
    })
  })
})

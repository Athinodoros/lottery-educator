import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultsDisplay from '../../components/ResultsDisplay'
import { GameResult } from '../../types'

const loserResult: GameResult = {
  id: 'result-1',
  game_id: 'game-1',
  selected_numbers: [1, 2, 3, 4, 5],
  winning_numbers: [10, 20, 30, 40, 50],
  draws_to_win: 8500000,
  is_winner: false,
  played_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
}

const winnerResult: GameResult = {
  id: 'result-2',
  game_id: 'game-1',
  selected_numbers: [1, 2, 3, 4, 5],
  winning_numbers: [1, 2, 3, 4, 5],
  draws_to_win: 1,
  is_winner: true,
  played_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
}

const partialMatchResult: GameResult = {
  id: 'result-3',
  game_id: 'game-1',
  selected_numbers: [1, 2, 3, 4, 5],
  winning_numbers: [1, 2, 30, 40, 50],
  draws_to_win: 5000000,
  is_winner: false,
  played_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
}

describe('ResultsDisplay Component', () => {
  describe('Loss result', () => {
    it('should show losing header for non-winner', () => {
      render(<ResultsDisplay result={loserResult} />)
      expect(screen.getByRole('heading', { name: /better luck/i })).toBeTruthy()
    })

    it('should display draws to win', () => {
      render(<ResultsDisplay result={loserResult} />)
      // draws_to_win appears in stat-value span and in the footer text — use getAllByText
      const matches = screen.getAllByText(/8\.500\.000|8,500,000|8500000/)
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should list selected numbers', () => {
      render(<ResultsDisplay result={loserResult} />)
      // Selected numbers 1-5 should appear somewhere
      expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    })

    it('should list winning numbers', () => {
      render(<ResultsDisplay result={loserResult} />)
      expect(screen.getByText('10')).toBeTruthy()
    })
  })

  describe('Win result', () => {
    it('should show winner header', () => {
      render(<ResultsDisplay result={winnerResult} />)
      expect(screen.getByRole('heading', { name: /you won/i })).toBeTruthy()
    })

    it('should show draws count for winner', () => {
      render(<ResultsDisplay result={winnerResult} />)
      // draws_to_win is 1 — appears in stat-value
      const statValues = document.querySelectorAll('.stat-value')
      const drawsValue = Array.from(statValues).find((el) => el.textContent === '1')
      expect(drawsValue).toBeTruthy()
    })
  })

  describe('Partial match result', () => {
    it('should highlight matching numbers', () => {
      const { container } = render(<ResultsDisplay result={partialMatchResult} />)
      // Matched numbers (1, 2) should have a 'match' class
      const highlighted = container.querySelectorAll('.match')
      expect(highlighted.length).toBeGreaterThan(0)
    })

    it('should show match count', () => {
      render(<ResultsDisplay result={partialMatchResult} />)
      // Should show 2 matches somewhere in the stats
      const statValues = document.querySelectorAll('.value, .stat-value')
      const twoEl = Array.from(statValues).find((el) => el.textContent === '2')
      expect(twoEl).toBeTruthy()
    })
  })

  describe('Educational footer', () => {
    it('should display educational message about draws needed', () => {
      render(<ResultsDisplay result={loserResult} />)
      // Footer fact section contains draw/lottery related text
      const factEl = document.querySelector('.fact')
      expect(factEl).toBeTruthy()
      expect(factEl?.textContent).toMatch(/draw|lottery|odds/i)
    })
  })
})

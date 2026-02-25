import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LearnPage from '../../pages/LearnPage'

const mockRecordPageView = vi.hoisted(() => vi.fn())

vi.mock('../../store/useSessionStore', () => ({
  useSessionStore: (selector?: any) => {
    const store = {
      recordPageView: mockRecordPageView,
      recordPlay: vi.fn(),
      recordError: vi.fn(),
      sessionId: 'test-session',
      playCount: 0,
    }
    return selector ? selector(store) : store
  },
}))

const renderLearn = () =>
  render(
    <BrowserRouter>
      <LearnPage />
    </BrowserRouter>
  )

describe('Learn Page - Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Page structure', () => {
    it('should render the learn page heading', () => {
      renderLearn()
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('should display probability section heading', () => {
      renderLearn()
      // Use heading query to avoid matching ancestor containers
      expect(screen.getByRole('heading', { name: /probability\.title/ })).toBeTruthy()
    })

    it('should display combinations or permutations section heading', () => {
      renderLearn()
      expect(screen.getByRole('heading', { name: /combinations\.title/ })).toBeTruthy()
    })

    it('should display expected value section heading', () => {
      renderLearn()
      expect(screen.getByRole('heading', { name: /expectedValue\.title/ })).toBeTruthy()
    })

    it('should display responsible gaming section', () => {
      renderLearn()
      // Heading or strong text about responsible gaming
      expect(screen.getByRole('heading', { name: /responsible\.title/ })).toBeTruthy()
    })
  })

  describe('Educational content', () => {
    it('should explain gambler\'s fallacy', () => {
      renderLearn()
      expect(screen.getByRole('heading', { name: /gamblersFallacy\.title/ })).toBeTruthy()
    })

    it('should mention law of large numbers', () => {
      renderLearn()
      expect(screen.getByRole('heading', { name: /largeNumbers\.title/ })).toBeTruthy()
    })

    it('should provide multiple lesson headings', () => {
      renderLearn()
      // Should have multiple section headings
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(3)
    })
  })

  describe('External links', () => {
    it('should have helpline links', () => {
      renderLearn()
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
    })
  })

  describe('Analytics', () => {
    it('should record page view on mount', () => {
      renderLearn()
      expect(mockRecordPageView).toHaveBeenCalledWith('learn')
    })
  })
})

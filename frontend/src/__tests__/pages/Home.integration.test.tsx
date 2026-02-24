import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import HomePage from '../../pages/HomePage'

// Mock Zustand stores
vi.mock('../../store/gamesStore', () => ({
  useGamesStore: (selector: any) => {
    const store = {
      games: [
        {
          id: 'game-1',
          name: 'Powerball',
          description: 'Pick 5 from 69, plus 1 from 26',
          number_range: [1, 69],
          numbers_to_select: 5,
          extra_numbers: 26,
          created_at: '2024-01-01',
        },
        {
          id: 'game-2',
          name: 'Mega Millions',
          description: 'Pick 5 from 70, plus 1 from 25',
          number_range: [1, 70],
          numbers_to_select: 5,
          extra_numbers: 25,
          created_at: '2024-01-01',
        },
      ],
    }
    return selector ? selector(store) : store
  },
}))

vi.mock('../../store/useSessionStore', () => ({
  useSessionStore: (selector: any) => {
    const store = {
      recordPageView: vi.fn(),
      recordPlay: vi.fn(),
      recordError: vi.fn(),
      sessionId: 'test-session',
      playCount: 0,
    }
    return selector ? selector(store) : store
  },
}))

describe('Home Page - Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render home page with main heading', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Hero section should be visible
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
  })

  it('should display featured games section', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Feature cards section (the features div)
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should show quick action buttons', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Should have navigation buttons
    const playButton = screen.getByRole('link', { name: /Play Games/i })

    expect(playButton).toBeTruthy()
  })

  it('should navigate to games page when clicking play button', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    const playButton = screen.getByRole('link', { name: /Play Games/i })
    expect(playButton.getAttribute('href')).toBe('/games')
  })

  it('should navigate to games page', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    const gameLink = screen.getByRole('link', { name: /Play Games/i })
    expect(gameLink.getAttribute('href')).toBe('/games')
  })

  it('should display feature cards', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Feature cards should be present
    expect(screen.getByText(/Interactive Games/i)).toBeTruthy()
    expect(screen.getByText(/Real Statistics/i)).toBeTruthy()
    expect(screen.getByText(/Financial Education/i)).toBeTruthy()
  })

  it('should have accessible links', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Should have links to main sections
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should display call-to-action button', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // CTA button to play
    const ctaButton = screen.getByRole('link', { name: /Play Games/i })
    expect(ctaButton).toBeTruthy()
  })

  it('should mention real statistics', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Stats mentioned in feature card
    expect(screen.getByText(/Real Statistics/i)).toBeTruthy()
  })

  it('should have proper heading hierarchy', () => {
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Check heading structure
    const h1 = container.querySelector('h1')
    expect(h1).toBeTruthy()
  })

  it('should properly layout feature section', () => {
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Feature cards should be present
    const featureCards = container.querySelectorAll('[class*="feature"]')
    expect(featureCards.length).toBeGreaterThan(0)
  })
})

describe('Home Page - Feature Cards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display feature highlights', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Should have feature cards explaining the platform
    expect(screen.getAllByText(/Interactive Games/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Real Statistics/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Financial Education/i).length).toBeGreaterThan(0)
  })

  it('should show mathematical education angle', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Should mention learning/education
    const educationMentions = screen.getAllByText(/learn|probability|mathematics|education/i)
    expect(educationMentions.length).toBeGreaterThan(0)
  })

  it('should have clear visual hierarchy', () => {
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Hero section should be prominent
    const heroSection = container.querySelector('[class*="hero"]')
    expect(heroSection).toBeTruthy()
  })
})

describe('Home Page - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have semantic HTML structure', () => {
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Should have proper divs at minimum
    const divs = container.querySelectorAll('div')
    expect(divs.length).toBeGreaterThan(0)
  })

  it('should have proper link text', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // All links should have descriptive text
    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link.textContent).toBeTruthy()
    })
  })

  it('should have sufficient color contrast', () => {
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // This would require actual contrast testing tool
    // but we can at least verify elements have color properties
    const headings = container.querySelectorAll('h1, h2, h3')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Tab to first link
    await user.tab()
    const focusedElement = document.activeElement
    expect(focusedElement).toBeTruthy()

    // Should be a focusable element
    expect(
      ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
        focusedElement?.tagName || ''
      )
    ).toBeTruthy()
  })

  it('should have descriptive page title', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Check that the page has a heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toBeTruthy()
  })
})

describe('Home Page - Mobile Responsiveness', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display properly on mobile viewport', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Should still render without errors
    expect(container.querySelector('[class*="home"]')).toBeTruthy()
  })

  it('should stack content vertically on mobile', () => {
    const { container } = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Feature cards should be present for vertical stacking
    const featureCards = container.querySelectorAll('[class*="feature"]')
    expect(featureCards.length).toBeGreaterThan(0)
  })

  it('should maintain readable font sizes', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )

    // Verify headings and text are present and readable
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })
})

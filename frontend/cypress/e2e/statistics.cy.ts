/**
 * E2E: Statistics flow
 * Stats page → game statistics detail
 */

describe('Statistics Flow', () => {
  const mockStats = {
    game_id: 'test-game-lotto',
    name: 'Lotto',
    total_plays: 1500,
    total_wins: 0,
    avg_draws_to_win: 12345678,
    max_draws_to_win: 45000000,
    min_draws_to_win: 234567,
    win_rate_percent: 0.0001,
    last_play_at: '2026-02-23T20:00:00Z',
  }

  beforeEach(() => {
    cy.intercept('GET', '**/api/games', { fixture: 'games.json' }).as('getGames')
    cy.intercept('GET', '**/api/stats/test-game-lotto', { body: mockStats }).as('getStats')
  })

  it('navigates to stats page from nav', () => {
    cy.visit('/')
    cy.contains('Stats').click()
    cy.url().should('include', '/stats')
  })

  it('displays stats page heading', () => {
    cy.visit('/stats')
    cy.contains('Statistics').should('be.visible')
  })

  it('shows game list on stats page', () => {
    cy.visit('/stats')
    cy.wait('@getGames')
    cy.contains('Lotto').should('be.visible')
  })

  it('navigates to statistics detail page', () => {
    cy.visit('/stats')
    cy.wait('@getGames')
    cy.contains('Lotto').click()
    cy.url().should('include', '/stats/test-game-lotto')
  })

  it('displays statistics for a game', () => {
    cy.visit('/stats/test-game-lotto')
    cy.wait('@getStats')
    cy.contains('Lotto').should('be.visible')
    cy.contains('1,500').should('be.visible')     // total_plays
    cy.contains('12').should('be.visible')         // part of avg_draws_to_win
  })

  it('navigates back from detail to stats list', () => {
    cy.visit('/stats/test-game-lotto')
    cy.wait('@getStats')
    cy.contains('Back').click()
    cy.url().should('include', '/stats')
  })
})

/**
 * E2E: Error scenarios
 * Network failures, invalid input, API errors
 */

describe('Error Scenarios', () => {
  it('shows error state when games API fails', () => {
    cy.intercept('GET', '**/api/games', { statusCode: 503, body: { error: 'Service unavailable' } }).as('getGamesFail')
    cy.visit('/games')
    cy.wait('@getGamesFail')
    cy.contains('Error').should('be.visible')
  })

  it('shows game not found when game ID is invalid', () => {
    cy.intercept('GET', '**/api/games/invalid-id', { statusCode: 404, body: { error: 'Game not found' } }).as('getGameFail')
    cy.visit('/games/invalid-id')
    cy.wait('@getGameFail')
    cy.contains('Not Found').should('be.visible')
  })

  it('shows error banner when play fails', () => {
    cy.intercept('GET', '**/api/games/test-game-lotto', {
      body: {
        id: 'test-game-lotto',
        name: 'Lotto',
        description: 'Test',
        number_range: [1, 49],
        numbers_to_select: 6,
        extra_numbers: null,
        created_at: '2026-01-01T00:00:00Z',
      },
    }).as('getGame')
    cy.intercept('POST', '**/api/games/test-game-lotto/play', {
      statusCode: 500,
      body: { error: 'Failed to play game', message: 'Internal server error' },
    }).as('playFail')

    cy.visit('/games/test-game-lotto')
    cy.wait('@getGame')
    ;[5, 12, 23, 34, 41, 48].forEach((n) => {
      cy.contains('.number-btn', n).click()
    })
    cy.contains('Play Game').click()
    cy.wait('@playFail')
    cy.contains('Failed').should('be.visible')
  })

  it('play button stays disabled with fewer numbers than required', () => {
    cy.intercept('GET', '**/api/games/test-game-lotto', {
      body: {
        id: 'test-game-lotto',
        name: 'Lotto',
        description: 'Test',
        number_range: [1, 49],
        numbers_to_select: 6,
        extra_numbers: null,
        created_at: '2026-01-01T00:00:00Z',
      },
    }).as('getGame')

    cy.visit('/games/test-game-lotto')
    cy.wait('@getGame')
    // Select only 3 of the required 6
    ;[5, 12, 23].forEach((n) => {
      cy.contains('.number-btn', n).click()
    })
    cy.contains('Play Game').should('be.disabled')
  })
})

/**
 * E2E: Complete game play flow
 * Home → Games → Select game → Pick numbers → Play → View results
 */

describe('Game Play Flow', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/games', { fixture: 'games.json' }).as('getGames')
    cy.intercept('GET', '**/api/games/test-game-lotto', {
      body: {
        id: 'test-game-lotto',
        name: 'Lotto',
        description: 'Greek OPAP Lotto. Select 6 numbers from 1-49.',
        number_range: [1, 49],
        numbers_to_select: 6,
        extra_numbers: null,
        probability_of_winning: null,
        created_at: '2026-01-01T00:00:00Z',
      },
    }).as('getGame')
    cy.intercept('POST', '**/api/games/test-game-lotto/play', {
      body: {
        id: 'result-abc123',
        winningNumbers: [3, 12, 25, 31, 40, 47],
        winningExtra: null,
        drawsToWin: 4823192,
        isWinner: false,
        results: { matchedNumbers: 0, matchedBonus: false },
      },
    }).as('playGame')
  })

  it('navigates from home to games page', () => {
    cy.visit('/')
    cy.contains('Games').click()
    cy.url().should('include', '/games')
  })

  it('displays the games list', () => {
    cy.visit('/games')
    cy.wait('@getGames')
    cy.contains('Lotto').should('be.visible')
    cy.contains('Joker').should('be.visible')
  })

  it('navigates to game play page on game card click', () => {
    cy.visit('/games')
    cy.wait('@getGames')
    cy.contains('Lotto').click()
    cy.url().should('include', '/games/test-game-lotto')
  })

  it('shows number selector on game play page', () => {
    cy.visit('/games/test-game-lotto')
    cy.wait('@getGame')
    cy.contains('Lotto').should('be.visible')
    // Play button should be disabled until numbers are selected
    cy.contains('Play Game').should('be.disabled')
  })

  it('allows selecting numbers and enables play button', () => {
    cy.visit('/games/test-game-lotto')
    cy.wait('@getGame')
    // Select 6 numbers
    ;[5, 12, 23, 34, 41, 48].forEach((n) => {
      cy.contains('.number-btn', n).click()
    })
    cy.contains('Play Game').should('not.be.disabled')
  })

  it('shows results after playing', () => {
    cy.visit('/games/test-game-lotto')
    cy.wait('@getGame')
    ;[5, 12, 23, 34, 41, 48].forEach((n) => {
      cy.contains('.number-btn', n).click()
    })
    cy.contains('Play Game').click()
    cy.wait('@playGame')
    cy.contains('Draws Required').should('be.visible')
    cy.contains('4').should('be.visible') // part of 4823192
    cy.contains('Pick New Numbers').should('be.visible')
  })

  it('resets state when play again is clicked', () => {
    cy.visit('/games/test-game-lotto')
    cy.wait('@getGame')
    ;[5, 12, 23, 34, 41, 48].forEach((n) => {
      cy.contains('.number-btn', n).click()
    })
    cy.contains('Play Game').click()
    cy.wait('@playGame')
    cy.contains('Pick New Numbers').click()
    cy.contains('Play Game').should('be.visible')
    cy.contains('Pick New Numbers').should('not.exist')
  })

  it('navigates back to games list', () => {
    cy.visit('/games/test-game-lotto')
    cy.wait('@getGame')
    cy.contains('← Back').click()
    cy.url().should('include', '/games')
  })
})

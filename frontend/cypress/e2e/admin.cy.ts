/**
 * E2E: Admin authentication and dashboard
 */

describe('Admin Page', () => {
  beforeEach(() => {
    cy.visit('/admin')
  })

  describe('Login form', () => {
    it('displays the login form', () => {
      cy.contains('Admin Login').should('be.visible')
      cy.get('input[type="text"], input[placeholder*="sername"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
    })

    it('shows error for invalid credentials', () => {
      cy.intercept('POST', '**/admin/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' },
      }).as('loginFail')

      cy.get('input[type="text"], input[placeholder*="sername"]').type('wrong')
      cy.get('input[type="password"]').type('wrong')
      cy.contains('button', /log\s*in/i).click()

      cy.wait('@loginFail')
      cy.contains(/invalid|error|failed/i).should('be.visible')
    })

    it('logs in successfully with valid credentials', () => {
      cy.intercept('POST', '**/admin/login', {
        statusCode: 200,
        body: { token: 'test-token-123', expiresIn: 86400000 },
      }).as('loginSuccess')

      cy.intercept('GET', '**/admin/dashboard', {
        statusCode: 200,
        body: {
          overview: {
            total_games: 5,
            total_plays: 100,
            total_wins: 2,
            global_win_rate: 2.0,
            top_game: { name: 'Powerball', play_count: 50 },
          },
          games: [],
          statistics: [],
          click_metrics: { total_clicks: 0, by_link: [] },
          services: { game_engine: 'ok', statistics: 'ok', metrics: 'ok' },
          timestamp: new Date().toISOString(),
        },
      }).as('dashboard')

      cy.get('input[type="text"], input[placeholder*="sername"]').type('admin')
      cy.get('input[type="password"]').type('test-password')
      cy.contains('button', /log\s*in/i).click()

      cy.wait('@loginSuccess')
      cy.wait('@dashboard')

      // Should show dashboard content
      cy.contains(/dashboard|overview/i).should('be.visible')
    })
  })
})

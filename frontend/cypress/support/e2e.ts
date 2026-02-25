// Global E2E support file
import './commands'

// Suppress React Router v7 future flag warnings in Cypress logs
Cypress.on('uncaught:exception', (err) => {
  // Ignore known non-fatal errors
  if (err.message.includes('ResizeObserver loop')) return false
  // Ignore metrics/analytics failures - these are non-critical
  if (err.message.includes('Failed to record') || err.message.includes('Failed to track')) return false
  return true
})

// Stub metrics and session tracking endpoints globally so they don't fail
beforeEach(() => {
  cy.intercept('POST', '**/api/metrics/**', { statusCode: 201, body: { id: 'mock' } })
  cy.intercept('GET', '**/api/metrics/sessions', { statusCode: 200, body: { totalSessions: 0, activeSessions: 0, avgSessionDuration: 0, bounceRate: 0 } })
  cy.intercept('GET', '**/api/metrics/plays', { statusCode: 200, body: { totalPlays: 0, playConversionRate: 0, avgPlaysPerSession: 0, favoritGame: null } })
  cy.intercept('GET', '**/api/metrics/**', { statusCode: 200, body: {} })
  cy.intercept('DELETE', '**/api/metrics/**', { statusCode: 200, body: { deleted: 0 } })
})

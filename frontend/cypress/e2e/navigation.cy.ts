/**
 * E2E: Navigation and learn page
 */

describe('Navigation & Learn Page', () => {
  it('loads the home page', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
  })

  it('has working nav links', () => {
    cy.visit('/')
    cy.get('nav').should('be.visible')
  })

  it('navigates to learn page', () => {
    cy.visit('/')
    cy.contains('Learn').click()
    cy.url().should('include', '/learn')
  })

  it('displays learn page content', () => {
    cy.visit('/learn')
    cy.get('h1, h2').first().should('be.visible')
  })

  it('navigates to home from any page', () => {
    cy.visit('/learn')
    cy.contains('Home').click()
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
  })

  it('shows 404 page for unknown routes', () => {
    cy.visit('/this-route-does-not-exist')
    cy.contains('404').should('be.visible')
    cy.contains('Page Not Found').should('be.visible')
    cy.contains('Back to Home').should('be.visible')
  })

  it('navigates to admin page', () => {
    cy.visit('/admin')
    cy.get('body').should('be.visible')
  })
})

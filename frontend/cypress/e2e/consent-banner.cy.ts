/**
 * E2E: Consent banner and privacy footer
 */

describe('Consent Banner', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('appears on first visit when no consent decision stored', () => {
    cy.visit('/')
    cy.get('[role="dialog"]').should('be.visible')
    cy.contains('anonymous analytics').should('be.visible')
  })

  it('disappears after accepting', () => {
    cy.visit('/')
    cy.get('[role="dialog"]').should('be.visible')
    cy.contains('button', 'Accept').click()
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('disappears after declining', () => {
    cy.visit('/')
    cy.get('[role="dialog"]').should('be.visible')
    cy.contains('button', 'Decline').click()
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('does not reappear after accepting on page reload', () => {
    cy.visit('/')
    cy.contains('button', 'Accept').click()
    cy.reload()
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('does not reappear after declining on page reload', () => {
    cy.visit('/')
    cy.contains('button', 'Decline').click()
    cy.reload()
    cy.get('[role="dialog"]').should('not.exist')
  })
})

describe('Privacy Footer', () => {
  it('is visible on every page', () => {
    cy.visit('/')
    cy.contains('We respect your privacy').should('be.visible')
  })

  it('shows Delete My Data button', () => {
    cy.visit('/')
    cy.contains('button', 'Delete My Data').should('be.visible')
  })

  it('shows confirmation dialog when clicking delete', () => {
    cy.visit('/')
    cy.contains('button', 'Delete My Data').click()
    cy.contains('Delete all your local data?').should('be.visible')
    cy.contains('button', 'Yes, delete').should('be.visible')
    cy.contains('button', 'Cancel').should('be.visible')
  })

  it('can cancel deletion', () => {
    cy.visit('/')
    cy.contains('button', 'Delete My Data').click()
    cy.contains('button', 'Cancel').click()
    cy.contains('button', 'Delete My Data').should('be.visible')
  })

  it('confirms data deletion', () => {
    cy.visit('/')
    cy.contains('button', 'Delete My Data').click()
    cy.contains('button', 'Yes, delete').click()
    cy.contains('Your data has been deleted').should('be.visible')
  })
})

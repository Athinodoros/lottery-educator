// Custom Cypress commands

// Wait for the games list to load from the API
Cypress.Commands.add('waitForGames', () => {
  cy.intercept('GET', '/games').as('getGames')
  cy.visit('/games')
  cy.wait('@getGames')
})

declare global {
  namespace Cypress {
    interface Chainable {
      waitForGames(): Chainable<void>
    }
  }
}

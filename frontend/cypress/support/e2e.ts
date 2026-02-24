// Global E2E support file
import './commands'

// Suppress React Router v7 future flag warnings in Cypress logs
Cypress.on('uncaught:exception', (err) => {
  // Ignore known non-fatal errors
  if (err.message.includes('ResizeObserver loop')) return false
  return true
})

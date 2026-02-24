/**
 * E2E: Contact page form flow
 * Validation, submission, success/error states
 */

describe('Contact Page', () => {
  beforeEach(() => {
    cy.visit('/contact')
  })

  it('displays the contact form', () => {
    cy.contains('Contact Us').should('be.visible')
    cy.get('#contact-email').should('be.visible')
    cy.get('#contact-subject').should('be.visible')
    cy.get('#contact-body').should('be.visible')
  })

  it('disables submit button when fields are empty', () => {
    cy.contains('Send Message').should('be.disabled')
  })

  it('shows email validation error for invalid email', () => {
    cy.get('#contact-email').type('not-an-email')
    cy.contains('Please enter a valid email address').should('be.visible')
  })

  it('hides email validation error for valid email', () => {
    cy.get('#contact-email').type('test@example.com')
    cy.contains('Please enter a valid email address').should('not.exist')
  })

  it('shows character count for subject and body', () => {
    cy.get('#contact-subject').type('Hello')
    cy.contains('5/255').should('be.visible')

    cy.get('#contact-body').type('Test message')
    cy.contains('12/10,000').should('be.visible')
  })

  it('enables submit when all fields are valid', () => {
    cy.get('#contact-email').type('test@example.com')
    cy.get('#contact-subject').type('Test Subject')
    cy.get('#contact-body').type('This is a test message.')
    cy.contains('Send Message').should('not.be.disabled')
  })

  it('submits the form successfully', () => {
    cy.intercept('POST', '/api/emails', {
      statusCode: 201,
      body: { id: 'email-123', message: 'Email saved' },
    }).as('submitEmail')

    cy.get('#contact-email').type('test@example.com')
    cy.get('#contact-subject').type('Test Subject')
    cy.get('#contact-body').type('This is a test message.')
    cy.contains('Send Message').click()
    cy.wait('@submitEmail')

    cy.contains('Message Sent!').should('be.visible')
    cy.contains('Send Another Message').should('be.visible')
  })

  it('shows error message on submission failure', () => {
    cy.intercept('POST', '/api/emails', {
      statusCode: 500,
      body: { error: 'Internal server error' },
    }).as('submitFail')

    cy.get('#contact-email').type('test@example.com')
    cy.get('#contact-subject').type('Test Subject')
    cy.get('#contact-body').type('This is a test message.')
    cy.contains('Send Message').click()
    cy.wait('@submitFail')

    cy.contains('Failed to send message').should('be.visible')
  })

  it('can send another message after success', () => {
    cy.intercept('POST', '/api/emails', {
      statusCode: 201,
      body: { id: 'email-123', message: 'Email saved' },
    }).as('submitEmail')

    cy.get('#contact-email').type('test@example.com')
    cy.get('#contact-subject').type('Test Subject')
    cy.get('#contact-body').type('This is a test message.')
    cy.contains('Send Message').click()
    cy.wait('@submitEmail')

    cy.contains('Send Another Message').click()
    cy.get('#contact-email').should('be.visible')
    cy.get('#contact-email').should('have.value', '')
  })

  it('displays sidebar information cards', () => {
    cy.contains('About This Project').should('be.visible')
    cy.contains('Privacy').should('be.visible')
    cy.contains('Open Source').should('be.visible')
  })
})

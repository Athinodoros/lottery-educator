import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ContactPage from '../../pages/ContactPage'

// Mock apiClient
vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

import apiClient from '../../api/client'

function renderContact() {
  return render(
    <BrowserRouter>
      <ContactPage />
    </BrowserRouter>
  )
}

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the contact form', () => {
    renderContact()
    expect(screen.getByText('title')).toBeTruthy()
    expect(screen.getByLabelText('emailLabel')).toBeTruthy()
    expect(screen.getByLabelText('subjectLabel')).toBeTruthy()
    expect(screen.getByLabelText('messageLabel')).toBeTruthy()
  })

  it('submit button is disabled when fields are empty', () => {
    renderContact()
    const btn = screen.getByRole('button', { name: /sendMessage/ })
    expect(btn).toBeDisabled()
  })

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('emailLabel'), 'invalid')
    expect(screen.getByText('emailError')).toBeTruthy()
  })

  it('hides email validation error for valid email', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('emailLabel'), 'test@example.com')
    expect(screen.queryByText('emailError')).toBeNull()
  })

  it('shows character counts', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('subjectLabel'), 'Hello')
    expect(screen.getByText('5/255')).toBeTruthy()
  })

  it('enables submit when all fields are valid', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('emailLabel'), 'test@example.com')
    await user.type(screen.getByLabelText('subjectLabel'), 'Test')
    await user.type(screen.getByLabelText('messageLabel'), 'Hello world')
    const btn = screen.getByRole('button', { name: /sendMessage/ })
    expect(btn).not.toBeDisabled()
  })

  it('submits the form and shows success', async () => {
    const user = userEvent.setup()
    ;(apiClient.post as any).mockResolvedValueOnce({ data: { id: '1' } })

    renderContact()
    await user.type(screen.getByLabelText('emailLabel'), 'test@example.com')
    await user.type(screen.getByLabelText('subjectLabel'), 'Test Subject')
    await user.type(screen.getByLabelText('messageLabel'), 'Test body')
    await user.click(screen.getByRole('button', { name: /sendMessage/ }))

    await waitFor(() => {
      expect(screen.getByText('successTitle')).toBeTruthy()
    })
    expect(apiClient.post).toHaveBeenCalledWith('/emails', {
      senderEmail: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test body',
    })
  })

  it('shows error message on submission failure', async () => {
    const user = userEvent.setup()
    ;(apiClient.post as any).mockRejectedValueOnce({
      response: { data: { error: 'Rate limit exceeded' } },
    })

    renderContact()
    await user.type(screen.getByLabelText('emailLabel'), 'test@example.com')
    await user.type(screen.getByLabelText('subjectLabel'), 'Test')
    await user.type(screen.getByLabelText('messageLabel'), 'Test body')
    await user.click(screen.getByRole('button', { name: /sendMessage/ }))

    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeTruthy()
    })
  })

  it('can send another message after success', async () => {
    const user = userEvent.setup()
    ;(apiClient.post as any).mockResolvedValueOnce({ data: { id: '1' } })

    renderContact()
    await user.type(screen.getByLabelText('emailLabel'), 'test@example.com')
    await user.type(screen.getByLabelText('subjectLabel'), 'Test')
    await user.type(screen.getByLabelText('messageLabel'), 'Body')
    await user.click(screen.getByRole('button', { name: /sendMessage/ }))

    await waitFor(() => {
      expect(screen.getByText('successTitle')).toBeTruthy()
    })

    await user.click(screen.getByText('sendAnother'))
    expect(screen.getByLabelText('emailLabel')).toBeTruthy()
  })

  it('renders sidebar info cards', () => {
    renderContact()
    expect(screen.getByText('aboutProject')).toBeTruthy()
    expect(screen.getByText('privacy')).toBeTruthy()
    expect(screen.getByText('openSource')).toBeTruthy()
  })
})

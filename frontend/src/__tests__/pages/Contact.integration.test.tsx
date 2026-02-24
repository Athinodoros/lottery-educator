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
    expect(screen.getByText('Contact Us')).toBeTruthy()
    expect(screen.getByLabelText('Email Address')).toBeTruthy()
    expect(screen.getByLabelText('Subject')).toBeTruthy()
    expect(screen.getByLabelText('Message')).toBeTruthy()
  })

  it('submit button is disabled when fields are empty', () => {
    renderContact()
    const btn = screen.getByRole('button', { name: /send message/i })
    expect(btn).toBeDisabled()
  })

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('Email Address'), 'invalid')
    expect(screen.getByText('Please enter a valid email address')).toBeTruthy()
  })

  it('hides email validation error for valid email', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
    expect(screen.queryByText('Please enter a valid email address')).toBeNull()
  })

  it('shows character counts', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('Subject'), 'Hello')
    expect(screen.getByText('5/255')).toBeTruthy()
  })

  it('enables submit when all fields are valid', async () => {
    const user = userEvent.setup()
    renderContact()
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
    await user.type(screen.getByLabelText('Subject'), 'Test')
    await user.type(screen.getByLabelText('Message'), 'Hello world')
    const btn = screen.getByRole('button', { name: /send message/i })
    expect(btn).not.toBeDisabled()
  })

  it('submits the form and shows success', async () => {
    const user = userEvent.setup()
    ;(apiClient.post as any).mockResolvedValueOnce({ data: { id: '1' } })

    renderContact()
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
    await user.type(screen.getByLabelText('Subject'), 'Test Subject')
    await user.type(screen.getByLabelText('Message'), 'Test body')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText('Message Sent!')).toBeTruthy()
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
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
    await user.type(screen.getByLabelText('Subject'), 'Test')
    await user.type(screen.getByLabelText('Message'), 'Test body')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeTruthy()
    })
  })

  it('can send another message after success', async () => {
    const user = userEvent.setup()
    ;(apiClient.post as any).mockResolvedValueOnce({ data: { id: '1' } })

    renderContact()
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com')
    await user.type(screen.getByLabelText('Subject'), 'Test')
    await user.type(screen.getByLabelText('Message'), 'Body')
    await user.click(screen.getByRole('button', { name: /send message/i }))

    await waitFor(() => {
      expect(screen.getByText('Message Sent!')).toBeTruthy()
    })

    await user.click(screen.getByText('Send Another Message'))
    expect(screen.getByLabelText('Email Address')).toBeTruthy()
  })

  it('renders sidebar info cards', () => {
    renderContact()
    expect(screen.getByText('About This Project')).toBeTruthy()
    expect(screen.getByText('Privacy')).toBeTruthy()
    expect(screen.getByText('Open Source')).toBeTruthy()
  })
})

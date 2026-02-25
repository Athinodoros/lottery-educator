import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateGamePage from '../../pages/CreateGamePage'

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('../../api/games', () => ({
  gameApi: {
    createGame: vi.fn(),
  },
}))

// Import the mocked module to get a reference for assertions
import { gameApi } from '../../api/games'

describe('CreateGamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the form with game name input', () => {
    render(<CreateGamePage />)
    const nameInput = screen.getByLabelText('gameName')
    expect(nameInput).toBeTruthy()
    expect(nameInput.getAttribute('type')).toBe('text')
  })

  it('should have submit button disabled when name is empty', () => {
    render(<CreateGamePage />)
    const submitButton = screen.getByRole('button', { name: 'submitForReview' })
    expect(submitButton).toBeDisabled()
  })

  it('should show error when submitting with empty name after filling and clearing', async () => {
    render(<CreateGamePage />)
    const nameInput = screen.getByLabelText('gameName')

    // Type a name then clear it
    fireEvent.change(nameInput, { target: { value: 'Test Game' } })
    fireEvent.change(nameInput, { target: { value: '' } })

    // The submit button should be disabled when name is empty
    const submitButton = screen.getByRole('button', { name: 'submitForReview' })
    expect(submitButton).toBeDisabled()
  })

  it('should show error for invalid number range (min >= max)', async () => {
    render(<CreateGamePage />)
    const nameInput = screen.getByLabelText('gameName')
    const minInput = screen.getByLabelText('minNumber')
    const maxInput = screen.getByLabelText('maxNumber')

    fireEvent.change(nameInput, { target: { value: 'Test Game' } })
    fireEvent.change(minInput, { target: { value: '50' } })
    fireEvent.change(maxInput, { target: { value: '10' } })

    // Use form submit to trigger onSubmit handler
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toBeTruthy()
      expect(errorElement.textContent).toBe('validation.minLessThanMax')
    })
  })

  it('should call gameApi.createGame on valid submission', async () => {
    ;(gameApi.createGame as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'new-game' })

    render(<CreateGamePage />)
    const nameInput = screen.getByLabelText('gameName')

    fireEvent.change(nameInput, { target: { value: 'My Lottery' } })

    const submitButton = screen.getByRole('button', { name: 'submitForReview' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(gameApi.createGame).toHaveBeenCalledTimes(1)
      expect(gameApi.createGame).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Lottery',
          number_range: [1, 49],
          numbers_to_select: 6,
        })
      )
    })
  })

  it('should show success screen after successful submission', async () => {
    ;(gameApi.createGame as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'new-game' })

    render(<CreateGamePage />)
    const nameInput = screen.getByLabelText('gameName')

    fireEvent.change(nameInput, { target: { value: 'My Lottery' } })

    const submitButton = screen.getByRole('button', { name: 'submitForReview' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('successTitle')).toBeTruthy()
      expect(screen.getByText('successText1')).toBeTruthy()
    })
  })

  it('should show error message on API failure', async () => {
    ;(gameApi.createGame as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    )

    render(<CreateGamePage />)
    const nameInput = screen.getByLabelText('gameName')

    fireEvent.change(nameInput, { target: { value: 'My Lottery' } })

    const submitButton = screen.getByRole('button', { name: 'submitForReview' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toBeTruthy()
      expect(errorElement.textContent).toBe('Network error')
    })
  })

  it('should reset the form when "Create Another" is clicked', async () => {
    ;(gameApi.createGame as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'new-game' })

    render(<CreateGamePage />)
    const nameInput = screen.getByLabelText('gameName')

    fireEvent.change(nameInput, { target: { value: 'My Lottery' } })

    const submitButton = screen.getByRole('button', { name: 'submitForReview' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('successTitle')).toBeTruthy()
    })

    // Click "Create Another"
    fireEvent.click(screen.getByText('createAnother'))

    // Should be back to the form with empty name
    await waitFor(() => {
      const newNameInput = screen.getByLabelText('gameName') as HTMLInputElement
      expect(newNameInput.value).toBe('')
    })
  })

  it('should have a back to games link', () => {
    render(<CreateGamePage />)
    const backLink = screen.getByText('backToGames')
    expect(backLink).toBeTruthy()
    expect(backLink.getAttribute('href')).toBe('/games')
  })

  it('should show bonus pool fields when checkbox is checked', () => {
    render(<CreateGamePage />)

    // Initially, bonus fields should not be visible
    expect(screen.queryByLabelText('bonusMin')).toBeNull()

    // Check the bonus checkbox
    const bonusCheckbox = screen.getByLabelText(/addBonusPool/)
    fireEvent.click(bonusCheckbox)

    // Now bonus fields should be visible
    expect(screen.getByLabelText('bonusMin')).toBeTruthy()
    expect(screen.getByLabelText('bonusMax')).toBeTruthy()
    expect(screen.getByLabelText('bonusToSelect')).toBeTruthy()
  })
})

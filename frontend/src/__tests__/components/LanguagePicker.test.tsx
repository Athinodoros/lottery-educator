import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LanguagePicker from '../../components/LanguagePicker'

// The global mock in setup.ts creates a new vi.fn() on each useTranslation call.
// To capture the same spy the component uses, we override the mock with a stable reference.
const mockChangeLanguage = vi.fn().mockResolvedValue(undefined)

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: mockChangeLanguage,
    },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}))

describe('LanguagePicker Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render a select element with aria-label "Select language"', () => {
    render(<LanguagePicker />)
    const select = screen.getByRole('combobox', { name: 'Select language' })
    expect(select).toBeTruthy()
  })

  it('should have 40 language options', () => {
    render(<LanguagePicker />)
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(40)
  })

  it('should have default value matching i18n.language ("en")', () => {
    render(<LanguagePicker />)
    const select = screen.getByRole('combobox', { name: 'Select language' }) as HTMLSelectElement
    expect(select.value).toBe('en')
  })

  it('should include expected languages', () => {
    render(<LanguagePicker />)
    expect(screen.getByText('English')).toBeTruthy()
    expect(screen.getByText('Deutsch')).toBeTruthy()
    expect(screen.getByText('Français')).toBeTruthy()
    expect(screen.getByText('Español')).toBeTruthy()
  })

  it('should call i18n.changeLanguage when selection changes', () => {
    render(<LanguagePicker />)
    const select = screen.getByRole('combobox', { name: 'Select language' })

    fireEvent.change(select, { target: { value: 'de' } })

    expect(mockChangeLanguage).toHaveBeenCalledWith('de')
  })

  it('should call i18n.changeLanguage with correct language code for non-Latin languages', () => {
    render(<LanguagePicker />)
    const select = screen.getByRole('combobox', { name: 'Select language' })

    fireEvent.change(select, { target: { value: 'ja' } })

    expect(mockChangeLanguage).toHaveBeenCalledWith('ja')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotFoundPage from '../../pages/NotFoundPage'

function renderWithRouter() {
  return render(
    <BrowserRouter>
      <NotFoundPage />
    </BrowserRouter>
  )
}

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    renderWithRouter()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders page not found message', () => {
    renderWithRouter()
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    expect(screen.getByText(/doesn't exist or has been moved/)).toBeInTheDocument()
  })

  it('has a link back to home', () => {
    renderWithRouter()
    const link = screen.getByText('Back to Home').closest('a')
    expect(link).toHaveAttribute('href', '/')
  })
})

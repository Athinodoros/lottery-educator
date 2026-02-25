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
    expect(screen.getByText('code')).toBeInTheDocument()
  })

  it('renders page not found message', () => {
    renderWithRouter()
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('message')).toBeInTheDocument()
  })

  it('has a link back to home', () => {
    renderWithRouter()
    const link = screen.getByText('backHome').closest('a')
    expect(link).toHaveAttribute('href', '/')
  })
})

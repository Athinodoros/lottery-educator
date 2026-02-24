import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DrawAnimation from '../../components/DrawAnimation'

describe('DrawAnimation Component', () => {
  describe('When not drawing', () => {
    it('should render nothing when isDrawing is false', () => {
      const { container } = render(
        <DrawAnimation isDrawing={false} progress={0} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should not render even with high progress if not drawing', () => {
      const { container } = render(
        <DrawAnimation isDrawing={false} progress={100} />
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('When drawing', () => {
    it('should render overlay when isDrawing is true', () => {
      const { container } = render(
        <DrawAnimation isDrawing={true} progress={50} />
      )
      expect(container.firstChild).toBeTruthy()
    })

    it('should display default message', () => {
      render(<DrawAnimation isDrawing={true} progress={30} />)
      expect(screen.getByText('Drawing lottery...')).toBeTruthy()
    })

    it('should display custom message', () => {
      render(
        <DrawAnimation isDrawing={true} progress={30} message="Simulating draws..." />
      )
      expect(screen.getByText('Simulating draws...')).toBeTruthy()
    })

    it('should display the progress percentage', () => {
      render(<DrawAnimation isDrawing={true} progress={75} />)
      expect(screen.getByText('75%')).toBeTruthy()
    })

    it('should display rounded percentage', () => {
      render(<DrawAnimation isDrawing={true} progress={33.6} />)
      expect(screen.getByText('34%')).toBeTruthy()
    })

    it('should render a progress bar', () => {
      const { container } = render(
        <DrawAnimation isDrawing={true} progress={60} />
      )
      const progressBar = container.querySelector('.progress-fill, .draw-progress-fill, [style*="width"]')
      expect(progressBar).toBeTruthy()
    })
  })
})

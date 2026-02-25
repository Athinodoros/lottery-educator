import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NumberSelector from '../../components/NumberSelector'

const baseProps = {
  minNumber: 1,
  maxNumber: 5,
  numbersToSelect: 3,
  selectedNumbers: [],
  onNumberToggle: vi.fn(),
}

describe('NumberSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render buttons for each number in range', () => {
      render(<NumberSelector {...baseProps} />)
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(String(i))).toBeTruthy()
      }
    })

    it('should show selection progress text', () => {
      render(<NumberSelector {...baseProps} />)
      // Shows translation key "numberSelector.selectNumbers"
      expect(screen.getByText(/numberSelector\.selectNumbers/)).toBeTruthy()
    })

    it('should show progress badge', () => {
      render(<NumberSelector {...baseProps} selectedNumbers={[1, 2]} />)
      expect(screen.getByText('2 / 3')).toBeTruthy()
    })

    it('should show completion message when all numbers selected', () => {
      render(<NumberSelector {...baseProps} selectedNumbers={[1, 2, 3]} />)
      expect(screen.getByText(/numberSelector\.allSelected/)).toBeTruthy()
    })
  })

  describe('Interaction', () => {
    it('should call onNumberToggle when a number is clicked', () => {
      const onToggle = vi.fn()
      render(<NumberSelector {...baseProps} onNumberToggle={onToggle} />)
      fireEvent.click(screen.getByText('3'))
      expect(onToggle).toHaveBeenCalledWith(3)
    })

    it('should not call onNumberToggle when disabled', () => {
      const onToggle = vi.fn()
      render(<NumberSelector {...baseProps} onNumberToggle={onToggle} disabled />)
      fireEvent.click(screen.getByText('1'))
      expect(onToggle).not.toHaveBeenCalled()
    })

    it('should disable unselected buttons when max selections reached', () => {
      render(<NumberSelector {...baseProps} selectedNumbers={[1, 2, 3]} />)
      // 4 and 5 are not selected and should be disabled
      const btn4 = screen.getByText('4').closest('button')
      expect(btn4?.disabled).toBe(true)
    })

    it('should keep selected buttons enabled even when max reached', () => {
      render(<NumberSelector {...baseProps} selectedNumbers={[1, 2, 3]} />)
      // Button 1 is selected — still clickable to deselect
      const btn1 = screen.getByText('1').closest('button')
      expect(btn1?.disabled).toBe(false)
    })
  })

  describe('Accessibility', () => {
    it('should have aria-pressed attribute on buttons', () => {
      render(<NumberSelector {...baseProps} selectedNumbers={[2]} />)
      const btn2 = screen.getByText('2').closest('button')
      expect(btn2?.getAttribute('aria-pressed')).toBe('true')
      const btn1 = screen.getByText('1').closest('button')
      expect(btn1?.getAttribute('aria-pressed')).toBe('false')
    })
  })
})

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Skeleton, SkeletonCard, SkeletonText } from '../../components/Skeleton'

describe('Skeleton Components', () => {
  it('renders Skeleton with aria-hidden', () => {
    const { container } = render(<Skeleton width="100px" height="20px" />)
    const el = container.querySelector('.skeleton')
    expect(el).toBeTruthy()
    expect(el?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders Skeleton with custom dimensions', () => {
    const { container } = render(<Skeleton width="200px" height="40px" borderRadius="12px" />)
    const el = container.querySelector('.skeleton') as HTMLElement
    expect(el.style.width).toBe('200px')
    expect(el.style.height).toBe('40px')
    expect(el.style.borderRadius).toBe('12px')
  })

  it('renders SkeletonCard with multiple skeleton lines', () => {
    const { container } = render(<SkeletonCard />)
    const card = container.querySelector('.skeleton-card')
    expect(card).toBeTruthy()
    expect(card?.getAttribute('aria-hidden')).toBe('true')
    const skeletons = card?.querySelectorAll('.skeleton')
    expect(skeletons?.length).toBe(3)
  })

  it('renders SkeletonText with correct number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const text = container.querySelector('.skeleton-text')
    expect(text).toBeTruthy()
    const skeletons = text?.querySelectorAll('.skeleton')
    expect(skeletons?.length).toBe(5)
  })

  it('renders SkeletonText with default 3 lines', () => {
    const { container } = render(<SkeletonText />)
    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBe(3)
  })
})

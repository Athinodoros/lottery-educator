import { cleanup } from '@testing-library/react'
import { afterEach, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Suppress React act() warnings in tests (they're not errors)
const originalError = console.error
beforeEach(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Not wrapped in act(...)')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterEach(() => {
  console.error = originalError
  cleanup()
  // Clear localStorage between tests
  localStorage.clear()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Use jsdom's native localStorage (it supports all methods)
// No need to mock it, JSDOM provides a working implementation

// Mock fetch
global.fetch = vi.fn()

// Mock window.crypto.randomUUID
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
  },
})

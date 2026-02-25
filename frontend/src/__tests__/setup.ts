import { cleanup } from '@testing-library/react'
import { afterEach, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'

// Mock react-i18next globally
vi.mock('react-i18next', () => ({
  useTranslation: (ns?: string) => ({
    t: (key: string, opts?: any) => {
      // Return just the key, optionally with interpolated count for plural tests
      if (opts?.count !== undefined) return key
      return key
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn().mockResolvedValue(undefined),
    },
  }),
  Trans: ({ children }: any) => children,
  initReactI18next: { type: '3rdParty', init: () => {} },
}))

// Mock the i18n module itself
vi.mock('../i18n', () => ({
  default: {},
  RTL_LANGUAGES: ['ar', 'ur', 'he', 'fa'],
}))

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

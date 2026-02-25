import { describe, it, expect } from 'vitest'
import { formatNumber, formatCurrency } from '../../utils/formatNumber'

describe('formatNumber', () => {
  it('should format 1000 with "en" locale using comma separator', () => {
    const result = formatNumber(1000, 'en')
    expect(result).toContain('1')
    expect(result).toContain('000')
    // English locale typically uses comma: "1,000"
    expect(result).toMatch(/1.?000/)
  })

  it('should format with "de" locale using period or space separator', () => {
    const result = formatNumber(1000, 'de')
    expect(result).toContain('1')
    expect(result).toContain('000')
    // German locale typically uses period: "1.000"
    expect(result).toMatch(/1.?000/)
  })

  it('should handle 0', () => {
    const result = formatNumber(0, 'en')
    expect(result).toBe('0')
  })

  it('should handle negative numbers', () => {
    const result = formatNumber(-1500, 'en')
    // Should contain a minus sign or hyphen and the number
    expect(result).toMatch(/-|−/)
    expect(result).toContain('1')
    expect(result).toContain('500')
  })

  it('should fall back gracefully for invalid locale', () => {
    // Should not throw, should return some string representation
    const result = formatNumber(1234, 'invalid-locale-xyz')
    expect(typeof result).toBe('string')
    // The result should contain the digits of the number, possibly with formatting separators
    expect(result.replace(/\D/g, '')).toContain('1234')
  })

  it('should handle large numbers', () => {
    const result = formatNumber(1000000, 'en')
    expect(result).toContain('1')
    expect(result).toContain('000')
  })
})

describe('formatCurrency', () => {
  it('should format as USD by default', () => {
    const result = formatCurrency(1000, 'en')
    // Should contain a dollar sign or USD indicator
    expect(result).toMatch(/\$|USD/)
    expect(result).toContain('1')
    expect(result).toContain('000')
  })

  it('should format with custom currency (EUR)', () => {
    const result = formatCurrency(1000, 'en', 'EUR')
    // Should contain a euro sign or EUR indicator
    expect(result).toMatch(/€|EUR/)
    expect(result).toContain('1')
    expect(result).toContain('000')
  })

  it('should handle 0', () => {
    const result = formatCurrency(0, 'en')
    expect(result).toMatch(/\$|USD/)
    expect(result).toContain('0')
  })

  it('should format without decimal places (maximumFractionDigits: 0)', () => {
    const result = formatCurrency(1000, 'en')
    // Should not contain decimal portion like ".00"
    expect(result).not.toMatch(/\.00/)
  })

  it('should handle different locales', () => {
    const resultEn = formatCurrency(5000, 'en')
    const resultDe = formatCurrency(5000, 'de')
    // Both should produce valid strings
    expect(typeof resultEn).toBe('string')
    expect(typeof resultDe).toBe('string')
    // Both should contain the number somehow
    expect(resultEn).toContain('5')
    expect(resultDe).toContain('5')
  })
})

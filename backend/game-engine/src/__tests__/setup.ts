// Test setup file
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Set test environment
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/lottery_test'

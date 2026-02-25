import {
  submitEmail,
  getEmail,
  getAllEmails,
  deleteEmail,
  isValidEmail,
} from '../emailService'
import * as db from '../database'

jest.mock('../database')

const mockedQuery = db.query as jest.Mock
const mockedQueryOne = db.queryOne as jest.Mock
const mockedQueryAll = db.queryAll as jest.Mock

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── Email Validation (4 tests) ──────────────────────────────────────

  describe('Email Validation', () => {
    it('should accept valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('firstname.lastname@company.org')).toBe(true)
      expect(isValidEmail('tag+filter@gmail.com')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('plaintext')).toBe(false)
      expect(isValidEmail('test@.com')).toBe(false)
    })

    it('should accept emails with subdomains', () => {
      expect(isValidEmail('user@mail.example.com')).toBe(true)
      expect(isValidEmail('admin@sub.domain.co.uk')).toBe(true)
    })

    it('should reject edge-case invalid emails', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('user @example.com')).toBe(false)
      expect(isValidEmail('user@ example.com')).toBe(false)
      expect(isValidEmail('user@example .com')).toBe(false)
    })
  })

  // ── Email Submission (3 tests) ──────────────────────────────────────

  describe('Email Submission', () => {
    it('should insert email into the database and return the created object', async () => {
      mockedQuery.mockResolvedValue({ rowCount: 1 })

      const result = await submitEmail(
        'sender@example.com',
        'Hello',
        'This is the body'
      )

      expect(db.query).toHaveBeenCalledTimes(1)
      const callArgs = mockedQuery.mock.calls[0]
      expect(callArgs[0]).toContain('INSERT INTO emails')
      expect(callArgs[1]).toEqual(
        expect.arrayContaining([
          'sender@example.com',
          'Hello',
          'This is the body',
        ])
      )

      expect(result).toMatchObject({
        sender_email: 'sender@example.com',
        subject: 'Hello',
        body: 'This is the body',
        is_deleted: false,
      })
      expect(result.id).toBeDefined()
      expect(result.created_at).toBeDefined()
    })

    it('should propagate database errors on submission', async () => {
      mockedQuery.mockRejectedValue(new Error('Connection refused'))

      await expect(
        submitEmail('sender@example.com', 'Subject', 'Body')
      ).rejects.toThrow('Connection refused')
    })

    it('should propagate unique constraint violations', async () => {
      mockedQuery.mockRejectedValue(
        new Error('duplicate key value violates unique constraint')
      )

      await expect(
        submitEmail('dup@example.com', 'Dup', 'Body')
      ).rejects.toThrow('duplicate key value violates unique constraint')
    })
  })

  // ── Email Retrieval (2 tests) ───────────────────────────────────────

  describe('Email Retrieval', () => {
    it('should return an email when found by ID', async () => {
      const fakeEmail = {
        id: 'abc-123',
        sender_email: 'reader@example.com',
        subject: 'Found',
        body: 'Email body',
        is_deleted: false,
        created_at: '2026-01-01T00:00:00.000Z',
      }
      mockedQueryOne.mockResolvedValue(fakeEmail)

      const result = await getEmail('abc-123')

      expect(db.queryOne).toHaveBeenCalledTimes(1)
      expect(mockedQueryOne.mock.calls[0][1]).toEqual(['abc-123'])
      expect(result).toEqual(fakeEmail)
    })

    it('should return null when email is not found', async () => {
      mockedQueryOne.mockResolvedValue(null)

      const result = await getEmail('nonexistent-id')

      expect(result).toBeNull()
    })
  })

  // ── Email Deletion (2 tests) ────────────────────────────────────────

  describe('Email Deletion', () => {
    it('should return true when an email is soft-deleted successfully', async () => {
      mockedQuery.mockResolvedValue({ rowCount: 1 })

      const result = await deleteEmail('abc-123')

      expect(db.query).toHaveBeenCalledTimes(1)
      const callArgs = mockedQuery.mock.calls[0]
      expect(callArgs[0]).toContain('UPDATE emails')
      expect(callArgs[0]).toContain('is_deleted = TRUE')
      expect(callArgs[1]![0]).toBe('abc-123')
      expect(result).toBe(true)
    })

    it('should return false when the email does not exist or is already deleted', async () => {
      mockedQuery.mockResolvedValue({ rowCount: 0 })

      const result = await deleteEmail('missing-id')

      expect(result).toBe(false)
    })
  })

  // ── getAllEmails (1 test) ───────────────────────────────────────────

  describe('Get All Emails', () => {
    it('should return all non-deleted emails from the database', async () => {
      const fakeEmails = [
        {
          id: '1',
          sender_email: 'a@example.com',
          subject: 'First',
          body: 'Body 1',
          is_deleted: false,
          created_at: '2026-01-02T00:00:00.000Z',
        },
        {
          id: '2',
          sender_email: 'b@example.com',
          subject: 'Second',
          body: 'Body 2',
          is_deleted: false,
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ]
      mockedQueryAll.mockResolvedValue(fakeEmails)

      const result = await getAllEmails()

      expect(db.queryAll).toHaveBeenCalledTimes(1)
      expect(mockedQueryAll.mock.calls[0][0]).toContain('is_deleted = FALSE')
      expect(mockedQueryAll.mock.calls[0][0]).toContain('ORDER BY created_at DESC')
      expect(result).toEqual(fakeEmails)
      expect(result).toHaveLength(2)
    })
  })
})

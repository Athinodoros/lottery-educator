import request from 'supertest';

// Mock dependencies before importing app
jest.mock('../database');
jest.mock('../emailService');
jest.mock('../logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

import app from '../app';
import { healthCheck } from '../database';
import {
  submitEmail,
  getEmail,
  getAllEmails,
  deleteEmail,
  isValidEmail,
} from '../emailService';

const mockedHealthCheck = healthCheck as jest.Mock;
const mockedSubmitEmail = submitEmail as jest.Mock;
const mockedGetEmail = getEmail as jest.Mock;
const mockedGetAllEmails = getAllEmails as jest.Mock;
const mockedDeleteEmail = deleteEmail as jest.Mock;
const mockedIsValidEmail = isValidEmail as jest.Mock;

describe('Email Service HTTP Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Health Check (2 tests) ─────────────────────────────────────────

  describe('GET /health', () => {
    it('should return ok status when database is healthy', async () => {
      mockedHealthCheck.mockResolvedValue(true);

      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('email-service');
      expect(res.body.database).toBe('connected');
      expect(res.body.timestamp).toBeDefined();
    });

    it('should return degraded status when database is unhealthy', async () => {
      mockedHealthCheck.mockResolvedValue(false);

      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('degraded');
      expect(res.body.database).toBe('disconnected');
    });
  });

  // ── POST /emails (4 tests) ────────────────────────────────────────

  describe('POST /emails', () => {
    it('should return 201 when email is submitted successfully', async () => {
      mockedIsValidEmail.mockReturnValue(true);
      const fakeEmail = {
        id: 'new-uuid',
        sender_email: 'user@example.com',
        subject: 'Test Subject',
        body: 'Test body content',
        is_deleted: false,
        created_at: '2026-02-25T00:00:00.000Z',
      };
      mockedSubmitEmail.mockResolvedValue(fakeEmail);

      const res = await request(app)
        .post('/emails')
        .send({
          senderEmail: 'user@example.com',
          subject: 'Test Subject',
          body: 'Test body content',
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(fakeEmail);
      expect(mockedSubmitEmail).toHaveBeenCalledWith(
        'user@example.com',
        'Test Subject',
        'Test body content'
      );
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/emails')
        .send({ senderEmail: 'user@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Bad request');
      expect(res.body.message).toContain('required');
      expect(mockedSubmitEmail).not.toHaveBeenCalled();
    });

    it('should return 400 when email format is invalid', async () => {
      mockedIsValidEmail.mockReturnValue(false);

      const res = await request(app)
        .post('/emails')
        .send({
          senderEmail: 'not-an-email',
          subject: 'Subject',
          body: 'Body',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid email address');
      expect(mockedSubmitEmail).not.toHaveBeenCalled();
    });

    it('should return 400 when subject exceeds 255 characters', async () => {
      mockedIsValidEmail.mockReturnValue(true);

      const res = await request(app)
        .post('/emails')
        .send({
          senderEmail: 'user@example.com',
          subject: 'A'.repeat(256),
          body: 'Body',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Subject or body too long');
      expect(mockedSubmitEmail).not.toHaveBeenCalled();
    });
  });

  // ── GET /emails/:id (2 tests) ─────────────────────────────────────

  describe('GET /emails/:emailId', () => {
    it('should return the email when found', async () => {
      const fakeEmail = {
        id: 'abc-123',
        sender_email: 'reader@example.com',
        subject: 'Found',
        body: 'Email body',
        is_deleted: false,
        created_at: '2026-01-01T00:00:00.000Z',
      };
      mockedGetEmail.mockResolvedValue(fakeEmail);

      const res = await request(app).get('/emails/abc-123');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeEmail);
      expect(mockedGetEmail).toHaveBeenCalledWith('abc-123');
    });

    it('should return 404 when the email is not found', async () => {
      mockedGetEmail.mockResolvedValue(null);

      const res = await request(app).get('/emails/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Email not found');
    });
  });

  // ── GET /emails admin (2 tests) ───────────────────────────────────

  describe('GET /emails (admin)', () => {
    it('should return all emails when valid admin key is provided', async () => {
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
      ];
      mockedGetAllEmails.mockResolvedValue(fakeEmails);

      const res = await request(app)
        .get('/emails')
        .query({ key: 'admin-key' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeEmails);
      expect(res.body).toHaveLength(2);
      expect(mockedGetAllEmails).toHaveBeenCalledTimes(1);
    });

    it('should return 403 when no admin key is provided', async () => {
      const res = await request(app).get('/emails');

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
      expect(mockedGetAllEmails).not.toHaveBeenCalled();
    });
  });

  // ── DELETE /emails/:id (1 test) ───────────────────────────────────

  describe('DELETE /emails/:emailId', () => {
    it('should return success message when email is deleted', async () => {
      mockedDeleteEmail.mockResolvedValue(true);

      const res = await request(app).delete('/emails/abc-123');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Email deleted successfully');
      expect(mockedDeleteEmail).toHaveBeenCalledWith('abc-123');
    });
  });

  // ── 404 handler (1 test) ──────────────────────────────────────────

  describe('Unknown routes', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown/route');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not Found');
      expect(res.body.path).toBe('/unknown/route');
    });
  });
});

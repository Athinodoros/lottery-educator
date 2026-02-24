import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, queryAll } from './database';

export interface EmailSubmission {
  id: string;
  sender_email: string;
  subject: string;
  body: string;
  is_deleted: boolean;
  created_at: string;
}

/**
 * Submit an email/contact form
 */
export async function submitEmail(
  senderEmail: string,
  subject: string,
  body: string
): Promise<EmailSubmission> {
  const id = uuidv4();
  const now = new Date().toISOString();

  await query(
    `INSERT INTO emails (id, sender_email, subject, body, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, senderEmail, subject, body, now]
  );

  return {
    id,
    sender_email: senderEmail,
    subject,
    body,
    is_deleted: false,
    created_at: now,
  };
}

/**
 * Get an email by ID
 */
export async function getEmail(emailId: string): Promise<EmailSubmission | null> {
  return queryOne(
    'SELECT * FROM emails WHERE id = $1 AND is_deleted = FALSE',
    [emailId]
  );
}

/**
 * Get all emails (admin)
 */
export async function getAllEmails(): Promise<EmailSubmission[]> {
  return queryAll(
    'SELECT * FROM emails WHERE is_deleted = FALSE ORDER BY created_at DESC'
  );
}

/**
 * Delete an email (GDPR - soft delete)
 */
export async function deleteEmail(emailId: string): Promise<boolean> {
  const now = new Date().toISOString();
  
  const result = await query(
    `UPDATE emails 
     SET is_deleted = TRUE, deleted_at = $2, deleted_reason = 'user_request'
     WHERE id = $1 AND is_deleted = FALSE`,
    [emailId, now]
  );

  return result.rowCount ? result.rowCount > 0 : false;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

import apiClient from './client';
import { Email } from '../types';

export const emailApi = {
  // Submit contact form
  submitContactForm: async (email: string, subject: string, body: string): Promise<Email> => {
    const response = await apiClient.post('/emails', {
      senderEmail: email,
      subject,
      body,
    });
    return response.data;
  },

  // Delete email (GDPR compliance)
  deleteEmail: async (emailId: string): Promise<void> => {
    await apiClient.delete(`/emails/${emailId}`);
  },

  // Get all emails (admin only)
  getAllEmails: async (adminToken?: string): Promise<Email[]> => {
    const response = await apiClient.get('/emails', {
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
    });
    return response.data;
  },
};

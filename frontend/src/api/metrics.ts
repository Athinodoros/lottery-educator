import apiClient from './client';
import { ClickMetric } from '../types';

export const metricsApi = {
  // Track a click
  trackClick: async (linkId: string, userSessionId: string): Promise<ClickMetric> => {
    const response = await apiClient.post(`/metrics/click/${linkId}`, {
      userSessionId,
    });
    return response.data;
  },

  // Get metrics summary (admin only)
  getSummary: async (adminToken?: string) => {
    const response = await apiClient.get('/metrics/summary', {
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {},
    });
    return response.data;
  },
};

import apiClient from './client';
import { ClickMetric } from '../types';

export const metricsApi = {
  // Track a click interaction
  trackClick: async (linkId: string, sessionId: string, page?: string): Promise<void> => {
    try {
      await apiClient.post('/metrics/click', {
        link_id: linkId,
        user_session_id: sessionId,
        page_path: page || '',
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error('Failed to track click:', error);
    }
  },

  // Get all metrics (admin)
  getMetrics: async (): Promise<ClickMetric[]> => {
    const response = await apiClient.get('/metrics');
    return response.data;
  },

  // Get metrics for a specific link
  getLinkMetrics: async (linkId: string) => {
    const response = await apiClient.get(`/metrics/link/${linkId}`);
    return response.data;
  },

  // Get metrics for a page
  getPageMetrics: async (pagePath: string) => {
    const response = await apiClient.get(`/metrics/page?path=${encodeURIComponent(pagePath)}`);
    return response.data;
  },

  // Get session metrics (session statistics)
  getSessionMetrics: async () => {
    const response = await apiClient.get('/metrics/sessions');
    return response.data;
  },

  // Get play metrics (game play statistics)
  getPlayMetrics: async () => {
    const response = await apiClient.get('/metrics/plays');
    return response.data;
  },
};

/**
 * Simple analytics service to track usage without storing data in the codebase
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  private webhookUrl: string;

  private constructor() {
    this.webhookUrl = import.meta.env.VITE_ANALYTICS_WEBHOOK_URL || '';
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Send a test event to verify webhook configuration
   */
  async sendTestEvent() {
    if (!this.webhookUrl) {
      throw new Error('No webhook URL configured');
    }

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'test',
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE,
        message: 'Test event from BlueSpark'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send test event: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  /**
   * Track a user login
   */
  async trackLogin(handle: string) {
    if (!this.webhookUrl || import.meta.env.DEV) return;

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'login',
          handle,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.MODE
        })
      });
    } catch (error) {
      // Silently fail - we don't want analytics to affect the user experience
      console.debug('Failed to track analytics:', error);
    }
  }

  /**
   * Track API usage
   */
  async trackApiUsage(handle: string, calls: number) {
    if (!this.webhookUrl || import.meta.env.DEV) return;

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'api_usage',
          handle,
          calls,
          timestamp: new Date().toISOString(),
          environment: import.meta.env.MODE
        })
      });
    } catch (error) {
      // Silently fail - we don't want analytics to affect the user experience
      console.debug('Failed to track analytics:', error);
    }
  }
}

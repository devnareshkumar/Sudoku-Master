import { Injectable } from '@angular/core';
import { AnalyticsEvent, AnalyticsEventName } from '../models/analytics';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private sessionStart = Date.now();
  private hasTrackedLaunch = false;

  trackEvent(
    name: AnalyticsEventName,
    properties?: Record<string, unknown>
  ) {
    const event: AnalyticsEvent = {
      name,
      timestamp: Date.now(),
      properties
    };

    console.log('[Analytics]', event);
  }

  trackAppLaunch() {
    if (this.hasTrackedLaunch) return;

    this.trackEvent('app_launch');
    this.hasTrackedLaunch = true;
  }

  trackPuzzleComplete(
    difficulty: string,
    timeSeconds: number,
    mistakes: number,
    hintsUsed: number
  ) {
    this.trackEvent('puzzle_completed', {
      difficulty,
      timeSeconds,
      mistakes,
      hintsUsed
    });
  }

  trackHintUsage() {
    this.trackEvent('hint_used');
  }

  trackSessionEnd() {
    const durationSeconds =
      Math.floor((Date.now() - this.sessionStart) / 1000);

    this.trackEvent('session_ended', {
      durationSeconds
    });
  }
}
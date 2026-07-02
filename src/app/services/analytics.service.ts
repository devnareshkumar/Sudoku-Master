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

  trackPuzzleStart(difficulty: string) {
    this.trackEvent('puzzle_started', {
      difficulty
    });
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

  trackAdDisplay(placement: string) {
    this.trackEvent('ad_shown', {
      placement
    });
  }

  trackRewardedAdStarted(placement: string) {
    this.trackEvent('rewarded_ad_started', {
      placement
    });
  }

  trackRewardedAdCompleted(placement: string) {
    this.trackEvent('rewarded_ad_completed', {
      placement
    });
  }

  trackRewardedCreditConsumed(placement: string) {
    this.trackEvent('rewarded_credit_consumed', {
      placement
    });
  }

  trackInterstitialEligibility(eligible: boolean, placement: string) {
    this.trackEvent('interstitial_eligible', {
      eligible,
      placement
    });
  }

  trackInterstitialShown(placement: string) {
    this.trackEvent('interstitial_shown', {
      placement
    });
  }

  trackSessionEnd() {
    const durationSeconds =
      Math.floor((Date.now() - this.sessionStart) / 1000);

    this.trackEvent('session_ended', {
      durationSeconds
    });
  }
}
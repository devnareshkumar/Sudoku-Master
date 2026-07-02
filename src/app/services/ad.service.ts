import { Injectable, signal } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private analytics: AnalyticsService;
  readonly showAdPrompt = signal(false);
  readonly isWatchingAd = signal(false);
  readonly rewardedHintCredits = signal(0);
  readonly interstitialEligible = signal(false);

  private gameplayProgress = 0;
  private interstitialMilestone = 3;

  constructor(analytics: AnalyticsService = new AnalyticsService()) {
    this.analytics = analytics;
  }

  canUseHintFreely(hintsRemaining: number, isPremium: boolean): boolean {
    if (isPremium) {
      return true;
    }

    return hintsRemaining > 0 || this.rewardedHintCredits() > 0;
  }

  shouldPromptRewardedAd(hintsRemaining: number, isPremium: boolean): boolean {
    if (isPremium) {
      return false;
    }

    return hintsRemaining <= 0 && this.rewardedHintCredits() <= 0;
  }

  canShowInterstitial(isPremium: boolean): boolean {
    const eligible = !isPremium && !this.isWatchingAd() && this.interstitialEligible();
    if (eligible) {
      this.analytics.trackInterstitialShown('gameplay');
    }
    return eligible;
  }

  setInterstitialMilestone(milestone: number): void {
    this.interstitialMilestone = Math.max(1, milestone);
    this.gameplayProgress = 0;
    this.interstitialEligible.set(false);
  }

  recordGameplayProgress(): void {
    this.gameplayProgress += 1;
    const eligible = this.gameplayProgress >= this.interstitialMilestone;
    this.interstitialEligible.set(eligible);
    this.analytics.trackInterstitialEligibility(eligible, 'gameplay');
  }

  markInterstitialEligible(eligible: boolean): void {
    this.interstitialEligible.set(eligible);
  }

  resetInterstitialEligibility(): void {
    this.gameplayProgress = 0;
    this.interstitialEligible.set(false);
  }

  openAdPrompt(): void {
    this.showAdPrompt.set(true);
    this.analytics.trackAdDisplay('hint_gate');
  }

  closeAdPrompt(): void {
    this.showAdPrompt.set(false);
  }

  grantRewardedHintCredit(amount = 1): void {
    this.rewardedHintCredits.update((credits) => credits + amount);
  }

  consumeRewardedHintCredit(): boolean {
    if (this.rewardedHintCredits() <= 0) {
      return false;
    }

    this.rewardedHintCredits.update((credits) => credits - 1);
    this.analytics.trackRewardedCreditConsumed('hint_gate');
    return true;
  }

  resetRewardedHintCredits(): void {
    this.rewardedHintCredits.set(0);
  }

  watchRewardedAd(onComplete: () => void): void {
    if (this.isWatchingAd()) {
      return;
    }

    this.isWatchingAd.set(true);
    this.showAdPrompt.set(false);
    this.analytics.trackRewardedAdStarted('hint_gate');

    setTimeout(() => {
      this.isWatchingAd.set(false);
      this.grantRewardedHintCredit();
      this.analytics.trackRewardedAdCompleted('hint_gate');

      onComplete();
    }, 3000);
  }
}
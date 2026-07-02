import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { AdService } from './ad.service';
import { AnalyticsService } from './analytics.service';

describe('AdService', () => {
  let service: AdService;

  beforeEach(() => {
    service = new AdService(new AnalyticsService());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should create the service with default state', () => {
    expect(service).toBeTruthy();
    expect(service.showAdPrompt()).toBe(false);
    expect(service.isWatchingAd()).toBe(false);
    expect(service.rewardedHintCredits()).toBe(0);
  });

  it('should allow premium users to use hints freely', () => {
    expect(service.canUseHintFreely(0, true)).toBe(true);
    expect(service.shouldPromptRewardedAd(0, true)).toBe(false);
  });

  it('should allow non-premium users to use hints freely when free hints remain', () => {
    expect(service.canUseHintFreely(4, false)).toBe(true);
    expect(service.shouldPromptRewardedAd(4, false)).toBe(false);
  });

  it('should require rewarded ad when no hints or credits remain for non-premium users', () => {
    expect(service.canUseHintFreely(0, false)).toBe(false);
    expect(service.shouldPromptRewardedAd(0, false)).toBe(true);
  });

  it('should bypass rewarded-ad prompting for premium users', () => {
    expect(service.canUseHintFreely(0, true)).toBe(true);
    expect(service.shouldPromptRewardedAd(0, true)).toBe(false);
    expect(service.canShowInterstitial(true)).toBe(false);
  });

  it('should grant and consume rewarded hint credits', () => {
    service.grantRewardedHintCredit();
    expect(service.rewardedHintCredits()).toBe(1);

    const consumed = service.consumeRewardedHintCredit();
    expect(consumed).toBe(true);
    expect(service.rewardedHintCredits()).toBe(0);
  });

  it('should not consume rewarded hint credit when none exist', () => {
    const consumed = service.consumeRewardedHintCredit();
    expect(consumed).toBe(false);
    expect(service.rewardedHintCredits()).toBe(0);
  });

  it('should open and close ad prompt', () => {
    service.openAdPrompt();
    expect(service.showAdPrompt()).toBe(true);

    service.closeAdPrompt();
    expect(service.showAdPrompt()).toBe(false);
  });

  it('should only allow interstitial ads for non-premium users when eligible and not already watching', () => {
    expect(service.canShowInterstitial(false)).toBe(false);
    expect(service.canShowInterstitial(true)).toBe(false);

    service.markInterstitialEligible(true);
    expect(service.canShowInterstitial(false)).toBe(true);
    expect(service.canShowInterstitial(true)).toBe(false);

    service.watchRewardedAd(vi.fn());

    expect(service.canShowInterstitial(false)).toBe(false);
    expect(service.canShowInterstitial(true)).toBe(false);
  });

  it('should mark interstitial eligibility after a configured milestone and allow manual reset', () => {
    service.setInterstitialMilestone(2);
    expect(service.interstitialEligible()).toBe(false);

    service.recordGameplayProgress();
    expect(service.interstitialEligible()).toBe(false);

    service.recordGameplayProgress();
    expect(service.interstitialEligible()).toBe(true);
    expect(service.canShowInterstitial(false)).toBe(true);

    service.markInterstitialEligible(false);
    expect(service.canShowInterstitial(false)).toBe(false);

    service.resetInterstitialEligibility();
    expect(service.interstitialEligible()).toBe(false);
    expect(service.canShowInterstitial(false)).toBe(false);
  });

  it('should simulate rewarded ad for 3 seconds and grant one hint credit', () => {
    const onComplete = vi.fn();
    const analyticsSpy = vi.spyOn(AnalyticsService.prototype, 'trackRewardedAdStarted');
    const completedSpy = vi.spyOn(AnalyticsService.prototype, 'trackRewardedAdCompleted');

    service.openAdPrompt();
    service.watchRewardedAd(onComplete);

    expect(service.showAdPrompt()).toBe(false);
    expect(service.isWatchingAd()).toBe(true);
    expect(service.rewardedHintCredits()).toBe(0);
    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2999);
    expect(service.isWatchingAd()).toBe(true);
    expect(service.rewardedHintCredits()).toBe(0);
    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(service.isWatchingAd()).toBe(false);
    expect(service.rewardedHintCredits()).toBe(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(analyticsSpy).toHaveBeenCalledWith('hint_gate');
    expect(completedSpy).toHaveBeenCalledWith('hint_gate');
  });

  it('should track rewarded credit consumption when a credit is used', () => {
    const analyticsSpy = vi.spyOn(AnalyticsService.prototype, 'trackRewardedCreditConsumed');

    service.grantRewardedHintCredit();
    service.consumeRewardedHintCredit();

    expect(analyticsSpy).toHaveBeenCalledWith('hint_gate');
  });

  it('should ignore duplicate rewarded ad requests while already watching', () => {
    const onComplete = vi.fn();

    service.watchRewardedAd(onComplete);
    service.watchRewardedAd(onComplete);

    vi.advanceTimersByTime(3000);

    expect(service.rewardedHintCredits()).toBe(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('should reset rewarded hint credits', () => {
    service.grantRewardedHintCredit(2);
    expect(service.rewardedHintCredits()).toBe(2);

    service.resetRewardedHintCredits();
    expect(service.rewardedHintCredits()).toBe(0);
  });
});
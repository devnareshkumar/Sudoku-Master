import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PremiumState, FeatureEntitlements } from '../models/user-state';
import { AnalyticsService } from './analytics.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class PremiumService {
  private storage = inject(StorageService);
  private analytics = inject(AnalyticsService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  premiumState = signal<PremiumState>({
    isPremium: false,
    provider: 'local'
  });

  entitlements = computed<FeatureEntitlements>(() => ({
    adFree: this.premiumState().isPremium,
    unlimitedHints: this.premiumState().isPremium,
    premiumThemes: this.premiumState().isPremium,
    premiumThemeAccess: this.premiumState().isPremium
  }));

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const saved = this.storage.loadPremiumState();
    if (saved) {
      this.premiumState.set(saved);
    }
  }

  isPremium(): boolean {
    return this.premiumState().isPremium;
  }

  enablePremium(provider: PremiumState['provider'] = 'local') {
    const state: PremiumState = {
      isPremium: true,
      provider,
      activatedAt: Date.now(),
      active: true,
      entitlements: {
        adFree: true,
        unlimitedHints: true,
        premiumThemes: true,
        premiumThemeAccess: true
      }
    };

    this.premiumState.set(state);
    this.storage.savePremiumState(state);
    this.analytics.trackEvent('premium_enabled', { provider });
  }

  verifySubscription(provider: PremiumState['provider'] = 'local', verificationToken?: string) {
    this.enablePremium(provider);
    return {
      verified: true,
      provider,
      verificationToken
    };
  }

  disablePremium() {
    const state: PremiumState = {
      isPremium: false,
      provider: 'local',
      active: false,
      entitlements: {
        adFree: false,
        unlimitedHints: false,
        premiumThemes: false,
        premiumThemeAccess: false
      }
    };

    this.premiumState.set(state);
    this.storage.savePremiumState(state);
  }
}

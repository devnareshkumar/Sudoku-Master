import { Injectable, signal, computed, inject } from '@angular/core';
import { PremiumState, FeatureEntitlements } from '../models/user-state';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class PremiumService {
  private storage = inject(StorageService);

  premiumState = signal<PremiumState>({
    isPremium: false,
    provider: 'local'
  });

  entitlements = computed<FeatureEntitlements>(() => ({
    adFree: this.premiumState().isPremium,
    unlimitedHints: this.premiumState().isPremium,
    premiumThemes: this.premiumState().isPremium
  }));

  constructor() {
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
      activatedAt: Date.now()
    };

    this.premiumState.set(state);
    this.storage.savePremiumState(state);
  }

  disablePremium() {
    const state: PremiumState = {
      isPremium: false,
      provider: 'local'
    };

    this.premiumState.set(state);
    this.storage.savePremiumState(state);
  }
}
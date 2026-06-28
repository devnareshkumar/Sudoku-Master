export interface FeatureEntitlements {
  unlimitedHints: boolean;
  adFree: boolean;
  premiumThemes: boolean;
  premiumThemeAccess: boolean;
}

export interface PremiumState {
  // v2 fields (used by premium.service.ts)
  isPremium: boolean;
  provider: 'local' | 'stripe' | 'playstore' | 'appstore';
  activatedAt?: number;
  expiresAt?: number | string | null;
  // v1 fields (used by storage.service.ts)
  active?: boolean;
  entitlements?: FeatureEntitlements;
}

export interface UserSettings {
  theme: string;
  soundEffects: boolean;
  autoSave: boolean;
  analyticsOptIn: boolean;
}

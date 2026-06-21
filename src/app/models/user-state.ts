export interface FeatureEntitlements {
  unlimitedHints: boolean;
  adFree: boolean;
  premiumThemeAccess: boolean;
}

export interface PremiumState {
  active: boolean;
  expiresAt: string | null;
  entitlements: FeatureEntitlements;
}

export interface UserSettings {
  theme: string;
  soundEffects: boolean;
  autoSave: boolean;
  analyticsOptIn: boolean;
}

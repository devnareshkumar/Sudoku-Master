export type AnalyticsEventName =
  | 'app_launch'
  | 'puzzle_started'
  | 'puzzle_completed'
  | 'hint_used'
  | 'ad_shown'
  | 'session_ended'
  | 'premium_enabled'
  | 'rewarded_ad_started'
  | 'rewarded_ad_completed'
  | 'rewarded_credit_consumed'
  | 'interstitial_eligible'
  | 'interstitial_shown';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  timestamp: number;
  properties?: Record<string, unknown>;
}
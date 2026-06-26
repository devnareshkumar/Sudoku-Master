export type AnalyticsEventName =
  | 'app_launch'
  | 'puzzle_started'
  | 'puzzle_completed'
  | 'hint_used'
  | 'ad_shown'
  | 'session_ended'
  | 'premium_enabled';

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  timestamp: number;
  properties?: Record<string, unknown>;
}
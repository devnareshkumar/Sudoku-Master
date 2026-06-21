export interface AdState {
  version: number;
  freeHintsUsed: number;
  rewardedCredits: number;
  adStatus: 'idle' | 'prompt' | 'watching' | 'completed';
}

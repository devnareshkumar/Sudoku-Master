export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface SudokuCell {
  value: number | null;
  solution: number;
  initial: boolean;
  notes: Set<number>;
  error: boolean;
}

export interface GameStats {
  bestTimes: Record<Difficulty, number | null>;
  gamesWon: number;
  gamesPlayed: number;
  currentStreak: number;
}

export interface HintDetails {
  index: number;
  value: number;
  row: number;
  col: number;
  box: number;
  reason: string;
  conflictingNumbers: {
    num: number;
    type: 'row' | 'col' | 'box';
    index: number;
  }[];
}

export interface PersistedSudokuCell {
  value: number | null;
  notes: number[];
  error: boolean;
}

export interface PersistedGameState {
  puzzleString?: string;
  solutionString?: string;
  board: PersistedSudokuCell[];
  difficulty: Difficulty;
  selectedCellIndex: number | null;
  mistakes: number;
  isNoteMode: boolean;
  isPaused: boolean;
  gameStatus: GameStatus;
  timer: number;
  hintsRemaining: number;
}

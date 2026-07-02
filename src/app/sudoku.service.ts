import { Injectable, signal, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getSudoku } from 'sudoku-gen';
import type { Difficulty, SudokuCell, GameStats, HintDetails, GameStatus, PersistedGameState } from './models/game-state';
import { AnalyticsService } from './services/analytics.service';
import { StorageService } from './services/storage.service';
import { AdService } from './services/ad.service';
import { PremiumService } from './services/premium.service';

export type { Difficulty, SudokuCell, GameStats, HintDetails, GameStatus } from './models/game-state';

@Injectable({
  providedIn: 'root'
})
export class SudokuService {
  // Game State
  board = signal<SudokuCell[]>([]);
  difficulty = signal<Difficulty>('easy');
  selectedCellIndex = signal<number | null>(null);
  mistakes = signal<number>(0);
  isNoteMode = signal<boolean>(false);
  isPaused = signal<boolean>(false);
  gameStatus = signal<GameStatus>('playing');
  timer = signal<number>(0);
  hintsRemaining = signal<number>(4);
  
  // Hint Modal State
  showHintModal = signal<boolean>(false);
  currentHint = signal<HintDetails | null>(null);
  hintStep = signal<number>(0);
  showNewGameConfirm = signal<boolean>(false);
  pendingDifficulty = signal<Difficulty | null>(null);



  // History for Undo
  private history: string[] = [];

  // Stats
  stats = signal<GameStats>({
    bestTimes: { easy: null, medium: null, hard: null, expert: null },
    gamesWon: 0,
    gamesPlayed: 0,
    currentStreak: 0
  });

  // Theme
  theme = signal<string>('classic');

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private storage = inject(StorageService);
  private analytics = inject(AnalyticsService);
  private adService = inject(AdService);
  private premiumService = inject(PremiumService);

  get showAdPrompt() {
  return this.adService.showAdPrompt;
}

get isWatchingAd() {
  return this.adService.isWatchingAd;
}
  

  constructor() {
    if (this.isBrowser) {
      this.loadStats();
      this.loadTheme();
    }
    
    // Auto-save theme
    effect(() => {
      if (this.isBrowser) {
        localStorage.setItem('sudoku-theme', this.theme());
        document.documentElement.setAttribute('data-theme', this.theme());
      }
    });

    effect(() => {
      if (!this.isBrowser || this.board().length === 0) {
        return;
      }

      this.storage.saveGame(this.toPersistedState());
    });

    // Timer logic
    setInterval(() => {
      if (this.gameStatus() === 'playing' && !this.isPaused()) {
        this.timer.update(t => t + 1);
      }
    }, 1000);
  }

  private loadStats() {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem('sudoku-stats');
    if (saved) {
      this.stats.set(JSON.parse(saved));
    }
  }

  private saveStats() {
    if (!this.isBrowser) return;
    localStorage.setItem('sudoku-stats', JSON.stringify(this.stats()));
  }

  private loadTheme() {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem('sudoku-theme');
    if (saved) {
      this.theme.set(saved);
    }
  }

  initializeGame() {
    const savedGame = this.storage.loadGame();
    if (!savedGame) {
      this.newGame(this.difficulty());
      return false;
    }

    this.newGame(savedGame.difficulty);
    this.applyPersistedGameState(savedGame);
    return true;
  }

  requestNewGame(diff: Difficulty = this.difficulty()) {
    if (this.hasStarted() && this.gameStatus() === 'playing') {
      this.pendingDifficulty.set(diff);
      this.showNewGameConfirm.set(true);
    } else {
      this.newGame(diff);
    }
  }

  confirmNewGame() {
    const diff = this.pendingDifficulty();
    if (diff) {
      this.newGame(diff);
    }
    this.cancelNewGame();
  }

  cancelNewGame() {
    this.showNewGameConfirm.set(false);
    this.pendingDifficulty.set(null);
  }

  hasStarted(): boolean {
    return this.board().some(c => !c.initial && (c.value !== null || c.notes.size > 0));
  }

  resetGame() {
    this.board.update(current => {
      return current.map(cell => ({
        ...cell,
        value: cell.initial ? cell.value : null,
        notes: new Set(),
        error: false
      }));
    });
    this.mistakes.set(0);
    this.timer.set(0);
    this.gameStatus.set('playing');
    this.history = [];
    this.saveHistory();
  }

  newGame(diff: Difficulty = this.difficulty()) {
    this.difficulty.set(diff);
    this.analytics.trackPuzzleStart(diff);
    const puzzle = getSudoku(diff);
    
    const newBoard: SudokuCell[] = [];
    for (let i = 0; i < 81; i++) {
      const val = puzzle.puzzle[i] === '-' ? null : parseInt(puzzle.puzzle[i]);
      newBoard.push({
        value: val,
        solution: parseInt(puzzle.solution[i]),
        initial: val !== null,
        notes: new Set(),
        error: false
      });
    }
    
    this.board.set(newBoard);
    this.mistakes.set(0);
    this.timer.set(0);
    this.gameStatus.set('playing');
    this.selectedCellIndex.set(null);
    this.hintsRemaining.set(4);
    this.history = [];
    this.saveHistory();
  }

  private saveHistory() {
    const state = JSON.stringify(this.board().map(c => ({
      value: c.value,
      notes: Array.from(c.notes),
      error: c.error
    })));
    this.history.push(state);
    if (this.history.length > 50) this.history.shift();
  }

  undo() {
    if (this.history.length <= 1) return;
    this.history.pop(); // Current state
    const prevState = JSON.parse(this.history[this.history.length - 1]);
    
    this.board.update(current => {
      return current.map((cell, i) => ({
        ...cell,
        value: prevState[i].value,
        notes: new Set(prevState[i].notes),
        error: prevState[i].error
      }));
    });
  }

  setCellValue(index: number, value: number | null) {
    if (this.gameStatus() !== 'playing') return;
    const cell = this.board()[index];
    if (cell.initial) return;

    if (this.isNoteMode() && value !== null) {
      this.toggleNote(index, value);
      return;
    }

    this.board.update(current => {
      const next = [...current];
      const target = { ...next[index] };
      
      if (value === null) {
        target.value = null;
        target.error = false;
      } else {
        target.value = value;
        target.error = value !== target.solution;
        if (target.error) {
          this.mistakes.update(m => m + 1);
          if (this.mistakes() >= 3) {
            this.gameStatus.set('lost');
          }
        }
      }
      
      next[index] = target;
      return next;
    });

    this.saveHistory();
    this.checkWin();
  }

  toggleNote(index: number, value: number) {
    this.board.update(current => {
      const next = [...current];
      const target = { ...next[index], notes: new Set(next[index].notes) };
      if (target.notes.has(value)) {
        target.notes.delete(value);
      } else {
        target.notes.add(value);
      }
      next[index] = target;
      return next;
    });
    this.saveHistory();
  }

useHint() {
  if (this.gameStatus() !== 'playing') return;

  const isPremium = this.premiumService.isPremium();

  if (!this.adService.canUseHintFreely(this.hintsRemaining(), isPremium)) {
    this.adService.openAdPrompt();
    return;
  }

  let consumedRewardedCredit = false;

  if (!isPremium && this.hintsRemaining() <= 0) {
    consumedRewardedCredit = this.adService.consumeRewardedHintCredit();
    if (!consumedRewardedCredit) {
      this.adService.openAdPrompt();
      return;
    }
  }

  let targetIndex = this.selectedCellIndex();
  if (targetIndex === null || this.board()[targetIndex].value !== null) {
    const emptyIndices = this.board()
      .map((c, i) => c.value === null ? i : -1)
      .filter(i => i !== -1);

    if (emptyIndices.length === 0) return;
    targetIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  const cell = this.board()[targetIndex];
  const solution = cell.solution;
  const row = Math.floor(targetIndex / 9);
  const col = targetIndex % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);

  const conflicts: { num: number; type: 'row' | 'col' | 'box'; index: number }[] = [];

  for (let n = 1; n <= 9; n++) {
    if (n === solution) continue;

    for (let i = 0; i < 9; i++) {
      const idx = row * 9 + i;
      if (this.board()[idx].value === n) {
        conflicts.push({ num: n, type: 'row', index: idx });
        break;
      }
    }

    for (let i = 0; i < 9; i++) {
      const idx = i * 9 + col;
      if (this.board()[idx].value === n) {
        conflicts.push({ num: n, type: 'col', index: idx });
        break;
      }
    }

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const idx = (boxRow + r) * 9 + (boxCol + c);
        if (this.board()[idx].value === n) {
          conflicts.push({ num: n, type: 'box', index: idx });
          break;
        }
      }
    }
  }

  const possibleNumbers = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  conflicts.forEach(c => possibleNumbers.delete(c.num));

  let reason = '';
  if (possibleNumbers.size === 1) {
    reason = `This is a "Naked Single". After analyzing the row, column, and 3x3 box, ${solution} is the only number that doesn't violate any Sudoku rules for this specific cell.`;
  } else {
    reason = `Based on the puzzle's unique solution, ${solution} is the required value. While other numbers might seem possible at first glance, they are eventually eliminated by the complex constraints of the entire grid.`;
  }

  const hint: HintDetails = {
    index: targetIndex,
    value: solution,
    row: row + 1,
    col: col + 1,
    box: boxIndex + 1,
    reason,
    conflictingNumbers: conflicts.slice(0, 12)
  };

  this.currentHint.set(hint);
  this.hintStep.set(0);
  this.showHintModal.set(true);
  this.selectedCellIndex.set(targetIndex);
}

  nextHintStep() {
    if (this.hintStep() < 2) {
      this.hintStep.update(s => s + 1);
    }
  }

  prevHintStep() {
    if (this.hintStep() > 0) {
      this.hintStep.update(s => s - 1);
    }
  }

confirmHint() {
  const hint = this.currentHint();
  if (!hint) return;

  const isPremium = this.premiumService.isPremium();

  this.setCellValue(hint.index, hint.value);

  if (!isPremium && this.hintsRemaining() > 0) {
    this.hintsRemaining.update(h => h - 1);
  }

  this.closeHintModal();
}

  closeHintModal() {
    this.showHintModal.set(false);
    this.currentHint.set(null);
    this.hintStep.set(0);
  }

  addHint() {
    this.hintsRemaining.update(h => h + 1);
  }

watchAd() {
  this.adService.watchRewardedAd(() => {
    this.useHint();
  });
}

closeAdPrompt() {
  this.adService.closeAdPrompt();
}

  private applyPersistedGameState(state: PersistedGameState) {
    const restoredBoard = this.board().map((cell, index) => {
      const savedCell = state.board[index];
      if (!savedCell) {
        return cell;
      }

      return {
        ...cell,
        value: savedCell.value,
        notes: new Set(savedCell.notes ?? []),
        error: savedCell.error ?? false
      };
    });

    this.board.set(restoredBoard);
    this.selectedCellIndex.set(state.selectedCellIndex);
    this.mistakes.set(state.mistakes);
    this.isNoteMode.set(state.isNoteMode);
    this.isPaused.set(state.isPaused);
    this.gameStatus.set(state.gameStatus);
    this.timer.set(state.timer);
    this.hintsRemaining.set(state.hintsRemaining);
    this.history = [];
    this.saveHistory();
  }

  private toPersistedState(): PersistedGameState {
    return {
      board: this.board().map((cell) => ({
        value: cell.value,
        notes: Array.from(cell.notes),
        error: cell.error
      })),
      difficulty: this.difficulty(),
      selectedCellIndex: this.selectedCellIndex(),
      mistakes: this.mistakes(),
      isNoteMode: this.isNoteMode(),
      isPaused: this.isPaused(),
      gameStatus: this.gameStatus(),
      timer: this.timer(),
      hintsRemaining: this.hintsRemaining()
    };
  }

  private checkWin() {
    const isComplete = this.board().every(c => c.value === c.solution);
    if (isComplete) {
      this.gameStatus.set('won');
      this.updateStatsOnWin();
    }
  }

  private updateStatsOnWin() {
    this.stats.update(s => {
      const next = { ...s };
      next.gamesWon++;
      next.gamesPlayed++;
      next.currentStreak++;
      
      const currentBest = next.bestTimes[this.difficulty()];
      if (currentBest === null || this.timer() < currentBest) {
        next.bestTimes[this.difficulty()] = this.timer();
      }
      
      return next;
    });
    this.saveStats();
  }

  // Helper for highlighting
  getRelatedIndices(index: number): number[] {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    const indices = new Set<number>();
    
    // Row
    for (let i = 0; i < 9; i++) indices.add(row * 9 + i);
    // Col
    for (let i = 0; i < 9; i++) indices.add(i * 9 + col);
    // Box
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        indices.add((boxRow + r) * 9 + (boxCol + c));
      }
    }
    
    return Array.from(indices);
  }

  isNumberComplete(num: number): boolean {
    const count = this.board().filter(c => c.value === num && !c.error).length;
    return count === 9;
  }

  isBoxComplete(boxIndex: number): boolean {
    const boxRow = Math.floor(boxIndex / 3) * 3;
    const boxCol = (boxIndex % 3) * 3;
    const indices: number[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        indices.push((boxRow + r) * 9 + (boxCol + c));
      }
    }
    return indices.every(i => {
      const cell = this.board()[i];
      return cell.value !== null && cell.value === cell.solution;
    });
  }
}

import { Injectable, signal, effect, inject, PLATFORM_ID, type WritableSignal, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getSudoku } from 'sudoku-gen';
import type { Difficulty, SudokuCell, GameStats, HintDetails, GameStatus, PersistedGameState } from '../models/game-state';
import { AnalyticsService } from './analytics.service';
import { StorageService } from './storage.service';
import { AdService } from './ad.service';
import { PremiumService } from './premium.service';
import { getCandidateNumbers, getCellConflicts, getCellLocation, getRelatedIndices as getRelatedIndicesForCell, isBoardSolved, isBoxComplete } from '../utils/sudoku-grid.utils';

export type { Difficulty, SudokuCell, GameStats, HintDetails, GameStatus } from '../models/game-state';

@Injectable({
  providedIn: 'root'
})
export class SudokuService {
  // Private writable backing signals
  private readonly _board = signal<SudokuCell[]>([]);
  private readonly _difficulty = signal<Difficulty>('easy');
  private readonly _puzzleString = signal<string>('');
  private readonly _solutionString = signal<string>('');
  private readonly _selectedCellIndex = signal<number | null>(null);
  private readonly _mistakes = signal<number>(0);
  private readonly _isNoteMode = signal<boolean>(false);
  private readonly _isPaused = signal<boolean>(false);
  private readonly _gameStatus = signal<GameStatus>('playing');
  private readonly _timer = signal<number>(0);
  private readonly _hintsRemaining = signal<number>(4);

  // Hint Modal State
  private readonly _showHintModal = signal<boolean>(false);
  private readonly _currentHint = signal<HintDetails | null>(null);
  private readonly _hintStep = signal<number>(0);
  private readonly _showNewGameConfirm = signal<boolean>(false);
  private readonly _pendingDifficulty = signal<Difficulty | null>(null);

  // History for Undo
  private history: string[] = [];
  private hintsUsed = 0;

  // Stats
  private readonly _stats = signal<GameStats>({
    bestTimes: { easy: null, medium: null, hard: null, expert: null },
    gamesWon: 0,
    gamesPlayed: 0,
    currentStreak: 0
  });

  // Theme
  private readonly _theme = signal<string>('classic');

  // Readonly exposure for UI consumers
  readonly boardSignal = this._board.asReadonly();
  readonly difficultySignal = this._difficulty.asReadonly();
  readonly selectedCellIndexSignal = this._selectedCellIndex.asReadonly();
  readonly mistakesSignal = this._mistakes.asReadonly();
  readonly isNoteModeSignal = this._isNoteMode.asReadonly();
  readonly isPausedSignal = this._isPaused.asReadonly();
  readonly gameStatusSignal = this._gameStatus.asReadonly();
  readonly timerSignal = this._timer.asReadonly();
  readonly hintsRemainingSignal = this._hintsRemaining.asReadonly();
  readonly showHintModalSignal = this._showHintModal.asReadonly();
  readonly currentHintSignal = this._currentHint.asReadonly();
  readonly hintStepSignal = this._hintStep.asReadonly();
  readonly showNewGameConfirmSignal = this._showNewGameConfirm.asReadonly();
  readonly pendingDifficultySignal = this._pendingDifficulty.asReadonly();
  readonly statsSignal = this._stats.asReadonly();
  readonly themeSignal = this._theme.asReadonly();

  // Compatibility getters for existing consumers and templates
  get board(): WritableSignal<SudokuCell[]> { return this._board; }
  get difficulty(): WritableSignal<Difficulty> { return this._difficulty; }
  get selectedCellIndex(): WritableSignal<number | null> { return this._selectedCellIndex; }
  get mistakes(): WritableSignal<number> { return this._mistakes; }
  get isNoteMode(): WritableSignal<boolean> { return this._isNoteMode; }
  get isPaused(): WritableSignal<boolean> { return this._isPaused; }
  get gameStatus(): WritableSignal<GameStatus> { return this._gameStatus; }
  get timer(): WritableSignal<number> { return this._timer; }
  get hintsRemaining(): WritableSignal<number> { return this._hintsRemaining; }
  get showHintModal(): WritableSignal<boolean> { return this._showHintModal; }
  get currentHint(): WritableSignal<HintDetails | null> { return this._currentHint; }
  get hintStep(): WritableSignal<number> { return this._hintStep; }
  get showNewGameConfirm(): WritableSignal<boolean> { return this._showNewGameConfirm; }
  get pendingDifficulty(): WritableSignal<Difficulty | null> { return this._pendingDifficulty; }
  get stats(): WritableSignal<GameStats> { return this._stats; }
  get theme(): WritableSignal<string> { return this._theme; }

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private storage = inject(StorageService);
  private readonly destroyRef = inject(DestroyRef);
  private timerInterval: ReturnType<typeof setInterval> | null = null;
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

    effect(() => {
      if (this.isBrowser) {
        this.storage.saveTheme(this.theme());
        document.documentElement.setAttribute('data-theme', this.theme());
      }
    });

    effect(() => {
      if (!this.isBrowser || this.board().length === 0) {
        return;
      }

      this.storage.saveGame(this.toPersistedState());
    });

    if (this.isBrowser) {
      this.startTimer();
    }
  }

  private startTimer(): void {
    if (this.timerInterval !== null || !this.isBrowser) {
      return;
    }

    this.timerInterval = setInterval(() => {
      if (this.gameStatus() === 'playing' && !this.isPaused()) {
        this.timer.update(t => t + 1);
      }
    }, 1000);

    this.destroyRef.onDestroy(() => this.clearTimer());
  }

  private clearTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private loadStats() {
    if (!this.isBrowser) return;
    const saved = this.storage.loadStats();
    if (saved) {
      this.stats.set(saved);
    }
  }

  private saveStats() {
    if (!this.isBrowser) return;
    this.storage.saveStats(this.stats());
  }

  private loadTheme() {
    if (!this.isBrowser) return;
    const saved = this.storage.loadTheme();
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

    if (this.hasPersistedPuzzle(savedGame)) {
      this._puzzleString.set(savedGame.puzzleString);
      this._solutionString.set(savedGame.solutionString);
      this.difficulty.set(savedGame.difficulty);
      this.board.set(this.createBoardFromPuzzle(savedGame.puzzleString, savedGame.solutionString));
    } else {
      this.newGame(savedGame.difficulty);
    }

    this.applyPersistedGameState(savedGame);
    return true;
  }

  private hasPersistedPuzzle(
    state: PersistedGameState
  ): state is PersistedGameState & { puzzleString: string; solutionString: string } {
    return state.puzzleString?.length === 81 && state.solutionString?.length === 81;
  }

  private createBoardFromPuzzle(puzzleString: string, solutionString: string): SudokuCell[] {
    const board: SudokuCell[] = [];

    for (let i = 0; i < 81; i++) {
      const value = puzzleString[i] === '-' ? null : Number(puzzleString[i]);
      board.push({
        value,
        solution: Number(solutionString[i]),
        initial: value !== null,
        notes: new Set(),
        error: false
      });
    }

    return board;
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

    // Save the generated strings so they can be saved to local storage
    this._puzzleString.set(puzzle.puzzle);
    this._solutionString.set(puzzle.solution);

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
    this.history.pop();
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
    const location = getCellLocation(targetIndex);
    const boxIndex = location.box;

    const conflicts = getCellConflicts(this.board(), targetIndex);
    const candidateNumbers = getCandidateNumbers(this.board(), targetIndex, solution);

    let reason = '';
    if (candidateNumbers.length === 1) {
      reason = `This is a "Naked Single". After analyzing the row, column, and 3x3 box, ${solution} is the only number that doesn't violate any Sudoku rules for this specific cell.`;
    } else {
      reason = `Based on the puzzle's unique solution, ${solution} is the required value. While other numbers might seem possible at first glance, they are eventually eliminated by the complex constraints of the entire grid.`;
    }

    const hint: HintDetails = {
      index: targetIndex,
      value: solution,
      row: location.row + 1,
      col: location.col + 1,
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

    this.hintsUsed += 1;
    this.analytics.trackHintUsage();
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
      puzzleString: this._puzzleString(),
      solutionString: this._solutionString(),
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
    const isComplete = isBoardSolved(this.board());
    if (isComplete) {
      this.gameStatus.set('won');
      this.analytics.trackPuzzleComplete(
        this.difficulty(),
        this.timer(),
        this.mistakes(),
        this.hintsUsed
      );
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

  getRelatedIndices(index: number): number[] {
    return getRelatedIndicesForCell(index);
  }

  isNumberComplete(num: number): boolean {
    const count = this.board().filter(c => c.value === num && !c.error).length;
    return count === 9;
  }

  isBoxComplete(boxIndex: number): boolean {
    return isBoxComplete(this.board(), boxIndex);
  }
}

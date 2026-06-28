import {PLATFORM_ID} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { JSDOM } from 'jsdom';
import {afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {SudokuCell, SudokuService} from './sudoku.service';
import { AnalyticsService } from './services/analytics.service';
import { StorageService } from './services/storage.service';
import {FIXED_PUZZLE, FIXED_SOLUTION} from './test-data/sudoku.fixture';

describe('SudokuService characterization', () => {
  beforeAll(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      const dom = new JSDOM('<!doctype html><html><body></body></html>');
      vi.stubGlobal('window', dom.window as unknown as Window);
      vi.stubGlobal('document', dom.window.document as unknown as Document);
      vi.stubGlobal('navigator', dom.window.navigator as unknown as Navigator);
      vi.stubGlobal('HTMLElement', dom.window.HTMLElement as unknown as typeof HTMLElement);
      vi.stubGlobal('Element', dom.window.Element as unknown as typeof Element);
      vi.stubGlobal('Node', dom.window.Node as unknown as typeof Node);
      vi.stubGlobal('getComputedStyle', dom.window.getComputedStyle.bind(dom.window) as typeof globalThis.getComputedStyle);
      vi.stubGlobal(
        'requestAnimationFrame',
        dom.window.requestAnimationFrame
          ? dom.window.requestAnimationFrame.bind(dom.window)
          : ((cb: FrameRequestCallback) => setTimeout(cb, 0)) as unknown as typeof globalThis.requestAnimationFrame
      );
    }

    try {
      TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
    } catch (error: unknown) {
      if (!(error instanceof Error && /already been called/.test(error.message))) {
        throw error;
      }
    }
  });
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function createService(platformId = 'browser'): SudokuService {
    TestBed.configureTestingModule({
      providers: [
        SudokuService,
        StorageService,
        {provide: PLATFORM_ID, useValue: platformId},
        {
          provide: AnalyticsService,
          useValue: {
            trackAppLaunch: vi.fn(),
            trackEvent: vi.fn(),
            trackPuzzleStart: vi.fn(),
            trackPuzzleComplete: vi.fn(),
            trackHintUsage: vi.fn(),
            trackAdDisplay: vi.fn(),
            trackSessionEnd: vi.fn()
          }
        }
      ],
    });

    return TestBed.inject(SudokuService);
  }

  function startGame(service: SudokuService): void {
    service.newGame('easy');
    const fixedBoard: SudokuCell[] = Array.from({length: 81}, (_, index) => {
      const puzzleValue = FIXED_PUZZLE[index];

      return {
        value: puzzleValue === '-' ? null : Number(puzzleValue),
        solution: Number(FIXED_SOLUTION[index]),
        initial: puzzleValue !== '-',
        notes: new Set<number>(),
        error: false,
      };
    });

    service.board.set(fixedBoard);
    // resetGame also establishes a deterministic undo-history baseline.
    service.resetGame();
  }

  it('generates a valid 81-cell puzzle with values and solutions', () => {
    const service = createService();

    service.newGame('easy');

    expect(service.board()).toHaveLength(81);
    expect(service.board().some((cell) => cell.initial)).toBe(true);
    expect(service.board().some((cell) => !cell.initial)).toBe(true);
    service.board().forEach((cell) => {
      expect(cell.solution).toBeGreaterThanOrEqual(1);
      expect(cell.solution).toBeLessThanOrEqual(9);
      expect(cell.initial).toBe(cell.value !== null);
      if (cell.initial) {
        expect(cell.value).toBe(cell.solution);
      }
      expect(cell.notes.size).toBe(0);
      expect(cell.error).toBe(false);
    });
  });

  it('sets correct values and records incorrect values as mistakes', () => {
    const service = createService();
    startGame(service);

    service.setCellValue(2, 4);
    service.setCellValue(3, 1);

    expect(service.board()[2].value).toBe(4);
    expect(service.board()[2].error).toBe(false);
    expect(service.board()[3].value).toBe(1);
    expect(service.board()[3].error).toBe(true);
    expect(service.mistakes()).toBe(1);
  });

  it('increments the mistake counter for an invalid entry', () => {
    const service = createService();
    startGame(service);

    const editableIndex = service.board().findIndex((cell) => !cell.initial && cell.value === null);
    expect(editableIndex).toBeGreaterThanOrEqual(0);

    const wrongValue = service.board()[editableIndex].solution === 1 ? 2 : 1;
    service.setCellValue(editableIndex, wrongValue);

    expect(service.board()[editableIndex].value).toBe(wrongValue);
    expect(service.board()[editableIndex].error).toBe(true);
    expect(service.mistakes()).toBe(1);
    expect(service.gameStatus()).toBe('playing');
  });

  it('reaches loss state when mistake threshold is exceeded', () => {
    const service = createService();
    startGame(service);

    const wrongValue = 1;
    const editableIndices = service.board()
      .map((cell, index) => (!cell.initial && cell.value === null ? index : -1))
      .filter((index) => index >= 0);

    service.setCellValue(editableIndices[0], wrongValue);
    service.setCellValue(editableIndices[1], wrongValue);
    service.setCellValue(editableIndices[2], wrongValue);

    expect(service.mistakes()).toBe(3);
    expect(service.gameStatus()).toBe('lost');
  });

  it('toggles candidate notes without setting a cell value', () => {
    const service = createService();
    startGame(service);
    service.isNoteMode.set(true);

    service.setCellValue(2, 4);
    expect(service.board()[2].value).toBeNull();
    expect(service.board()[2].notes.has(4)).toBe(true);

    service.setCellValue(2, 4);
    expect(service.board()[2].notes.has(4)).toBe(false);
  });

  it('restores the previous board value with undo', () => {
    const service = createService();
    startGame(service);

    service.setCellValue(2, 4);
    expect(service.board()[2].value).toBe(4);

    service.undo();
    expect(service.board()[2].value).toBeNull();
  });

  it('restores the board state after undoing a cell entry', () => {
    const service = createService();
    startGame(service);

    const targetIndex = service.board().findIndex((cell) => !cell.initial && cell.value === null);
    expect(targetIndex).toBeGreaterThanOrEqual(0);

    const originalValue = service.board()[targetIndex].value;
    expect(originalValue).toBeNull();

    service.setCellValue(targetIndex, 7);
    expect(service.board()[targetIndex].value).toBe(7);

    service.undo();
    expect(service.board()[targetIndex].value).toBeNull();
    expect(service.board()[targetIndex].value).toBe(originalValue);
  });

  it('marks the game lost after three mistakes', () => {
    const service = createService();
    startGame(service);

    service.setCellValue(2, 1);
    service.setCellValue(3, 1);
    service.setCellValue(5, 1);

    expect(service.mistakes()).toBe(3);
    expect(service.gameStatus()).toBe('lost');
  });

  it('resets editable cells, mistakes, timer and game status', () => {
    const service = createService();
    startGame(service);
    service.setCellValue(2, 1);
    service.timer.set(42);
    service.gameStatus.set('lost');

    service.resetGame();

    expect(service.board()[2].value).toBeNull();
    expect(service.board()[2].error).toBe(false);
    expect(service.mistakes()).toBe(0);
    expect(service.timer()).toBe(0);
    expect(service.gameStatus()).toBe('playing');
  });

  it('advances the timer only while the game is playing and unpaused', () => {
    const service = createService();
    startGame(service);

    vi.advanceTimersByTime(2000);
    expect(service.timer()).toBe(2);

    service.isPaused.set(true);
    vi.advanceTimersByTime(3000);
    expect(service.timer()).toBe(2);

    service.isPaused.set(false);
    vi.advanceTimersByTime(1000);
    expect(service.timer()).toBe(3);
  });

  it('wins a completed puzzle and persists its statistics', () => {
    const service = createService();
    startGame(service);
    service.timer.set(120);

    service.board().forEach((cell, index) => {
      if (!cell.initial) {
        service.setCellValue(index, cell.solution);
      }
    });

    expect(service.gameStatus()).toBe('won');
    expect(service.stats()).toEqual({
      bestTimes: {easy: 120, medium: null, hard: null, expert: null},
      gamesWon: 1,
      gamesPlayed: 1,
      currentStreak: 1,
    });
    expect(JSON.parse(localStorage.getItem('sudoku-stats') ?? '{}')).toEqual(
      service.stats(),
    );
  });

  it('activates win state when the final missing cell is filled correctly', () => {
    const service = createService();
    startGame(service);

    const editableIndices = service.board()
      .map((cell, index) => (!cell.initial ? index : -1))
      .filter((index) => index >= 0);

    const finalIndex = editableIndices[editableIndices.length - 1];
    for (const index of editableIndices.slice(0, -1)) {
      service.setCellValue(index, service.board()[index].solution);
    }

    expect(service.gameStatus()).toBe('playing');

    service.setCellValue(finalIndex, service.board()[finalIndex].solution);

    expect(service.board()[finalIndex].value).toBe(service.board()[finalIndex].solution);
    expect(service.gameStatus()).toBe('won');
  });

  it('characterizes the current allowance of three hints per puzzle', () => {
    const service = createService();
    startGame(service);
    const emptyIndices = service
      .board()
      .map((cell, index) => (cell.initial ? -1 : index))
      .filter((index) => index >= 0);

    expect(service.hintsRemaining()).toBe(3);

    for (let i = 0; i < 3; i++) {
      const index = emptyIndices[i];
      service.selectedCellIndex.set(index);
      service.useHint();
      expect(service.showAdPrompt()).toBe(false);
      expect(service.showHintModal()).toBe(true);
      expect(service.currentHint()?.index).toBe(index);
      service.confirmHint();
      expect(service.hintsRemaining()).toBe(2 - i);
      expect(service.showHintModal()).toBe(false);
      expect(service.board()[index].value).toBe(service.board()[index].solution);
    }

    expect(service.hintsRemaining()).toBe(0);
    service.selectedCellIndex.set(emptyIndices[3]);
    service.useHint();
    expect(service.showAdPrompt()).toBe(true);
    expect(service.showHintModal()).toBe(false);
  });

  it('shows an ad prompt once the hint allowance is exhausted', () => {
    const service = createService();
    startGame(service);
    service.hintsRemaining.set(0);
    const emptyIndex = service.board().findIndex((cell) => !cell.initial && cell.value === null);

    service.selectedCellIndex.set(emptyIndex);
    service.useHint();

    expect(service.showAdPrompt()).toBe(true);
    expect(service.showHintModal()).toBe(false);
    expect(service.isWatchingAd()).toBe(false);
  });

  it('restores a saved game from storage when the app starts', () => {
    const savedGame = {
      board: [
        { value: 5, notes: [], error: false, solution: 5, initial: true },
        { value: null, notes: [1], error: false, solution: 4, initial: false }
      ],
      difficulty: 'easy',
      selectedCellIndex: 1,
      mistakes: 0,
      isNoteMode: true,
      isPaused: false,
      gameStatus: 'playing',
      timer: 22,
      hintsRemaining: 2
    };

    localStorage.setItem('sudoku_game', JSON.stringify({ version: 1, data: savedGame }));

    const service = createService();
    service.initializeGame();

    expect(service.board()[0].value).toBe(5);
    expect(service.board()[1].notes.has(1)).toBe(true);
    expect(service.selectedCellIndex()).toBe(1);
    expect(service.isNoteMode()).toBe(true);
    expect(service.timer()).toBe(22);
    expect(service.hintsRemaining()).toBe(2);
  });

  it('restores hint availability after watching the rewarded ad', () => {
    const service = createService();
    startGame(service);
    service.hintsRemaining.set(0);
    const emptyIndex = service.board().findIndex((cell) => !cell.initial && cell.value === null);

    service.selectedCellIndex.set(emptyIndex);
    service.useHint();
    expect(service.showAdPrompt()).toBe(true);

    service.watchAd();
    expect(service.showAdPrompt()).toBe(false);
    expect(service.isWatchingAd()).toBe(true);

    vi.advanceTimersByTime(3000);

    expect(service.isWatchingAd()).toBe(false);
    expect(service.hintsRemaining()).toBe(1);
    expect(service.showHintModal()).toBe(true);
    expect(service.currentHint()).not.toBeNull();
    expect(service.currentHint()?.index).toBe(emptyIndex);
    expect(service.currentHint()?.value).toBe(service.board()[emptyIndex].solution);
  });

  it('characterizes the simulated rewarded-ad timeout and resulting hint', () => {
    const service = createService();
    startGame(service);
    service.hintsRemaining.set(0);
    service.selectedCellIndex.set(2);
    service.useHint();

    service.watchAd();
    expect(service.showAdPrompt()).toBe(false);
    expect(service.isWatchingAd()).toBe(true);

    vi.advanceTimersByTime(2999);
    expect(service.isWatchingAd()).toBe(true);

    vi.advanceTimersByTime(1);
    expect(service.isWatchingAd()).toBe(false);
    expect(service.hintsRemaining()).toBe(1);
    expect(service.showHintModal()).toBe(true);
    expect(service.currentHint()?.index).toBe(2);
  });

  it('does not access localStorage or the document theme on the server', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const setAttribute = vi.spyOn(document.documentElement, 'setAttribute');

    const service = createService('server');
    TestBed.flushEffects();

    expect(service.theme()).toBe('classic');
    expect(getItem).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(setAttribute).not.toHaveBeenCalledWith('data-theme', expect.any(String));
  });

  describe('legacy behavior to preserve during structural refactors', () => {
    it('consumes a hint as a note when note mode is active', () => {
      const service = createService();
      startGame(service);
      service.selectedCellIndex.set(2);
      service.isNoteMode.set(true);

      service.useHint();
      service.confirmHint();

      expect(service.board()[2].value).toBeNull();
      expect(service.board()[2].notes.has(4)).toBe(true);
      expect(service.hintsRemaining()).toBe(2);
    });
  });
});

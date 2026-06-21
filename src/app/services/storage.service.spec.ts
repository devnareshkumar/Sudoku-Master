import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageService } from './storage.service';
import type { PersistedGameState } from '../models/game-state';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects browser storage availability', () => {
    expect(storageService.isBrowser()).toBe(true);
  });

  it('saves and loads settings successfully', () => {
    const settings = {
      theme: 'ocean',
      soundEffects: false,
      autoSave: false,
      analyticsOptIn: true
    };

    storageService.saveSettings(settings);

    expect(storageService.loadSettings()).toEqual(settings);
  });

  it('falls back to default settings when corrupt JSON is stored', () => {
    localStorage.setItem('sudoku_settings', '{not valid json');

    expect(storageService.loadSettings()).toEqual({
      theme: 'classic',
      soundEffects: true,
      autoSave: true,
      analyticsOptIn: false
    });
  });

  it('saves and loads premium state successfully', () => {
    const premiumState = {
      active: true,
      expiresAt: '2026-12-31T23:59:59.000Z',
      entitlements: {
        unlimitedHints: true,
        adFree: true,
        premiumThemeAccess: true
      }
    };

    storageService.savePremiumState(premiumState);

    expect(storageService.loadPremiumState()).toEqual(premiumState);
  });

  it('saves and loads game state with notes serialization', () => {
    const gameState: PersistedGameState = {
      board: [
        { value: 1, notes: [1, 2], error: false },
        { value: null, notes: [3], error: true }
      ],
      difficulty: 'medium',
      selectedCellIndex: 0,
      mistakes: 1,
      isNoteMode: false,
      isPaused: false,
      gameStatus: 'playing',
      timer: 12,
      hintsRemaining: 2
    };

    storageService.saveGame(gameState);

    const raw = localStorage.getItem('sudoku_game');
    expect(raw).not.toBeNull();
    expect(raw).toContain('"notes":[1,2]');

    expect(storageService.loadGame()).toEqual(gameState);
  });

  it('returns null when no saved game exists', () => {
    expect(storageService.loadGame()).toBeNull();
  });

  it('removes saved game state', () => {
    storageService.saveGame({
      board: [{ value: null, notes: [1], error: false }],
      difficulty: 'easy',
      selectedCellIndex: null,
      mistakes: 0,
      isNoteMode: false,
      isPaused: false,
      gameStatus: 'playing',
      timer: 0,
      hintsRemaining: 3
    });

    storageService.removeGame();
    expect(storageService.loadGame()).toBeNull();
  });

  it('clears all stored keys', () => {
    localStorage.setItem('sudoku_settings', '1');
    localStorage.setItem('sudoku_game', '2');
    localStorage.setItem('sudoku_premium', '3');
    localStorage.setItem('sudoku_stats', '4');

    storageService.clearAll();

    expect(localStorage.getItem('sudoku_settings')).toBeNull();
    expect(localStorage.getItem('sudoku_game')).toBeNull();
    expect(localStorage.getItem('sudoku_premium')).toBeNull();
    expect(localStorage.getItem('sudoku_stats')).toBeNull();
  });

  it('is SSR safe when window/localStorage are unavailable', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('localStorage', undefined);

    expect(storageService.isBrowser()).toBe(false);
    expect(storageService.loadSettings()).toEqual({
      theme: 'classic',
      soundEffects: true,
      autoSave: true,
      analyticsOptIn: false
    });
    expect(storageService.loadPremiumState()).toEqual({
      active: false,
      expiresAt: null,
      entitlements: {
        unlimitedHints: false,
        adFree: false,
        premiumThemeAccess: false
      }
    });
    expect(storageService.loadGame()).toBeNull();
  });
});

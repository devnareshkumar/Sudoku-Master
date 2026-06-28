import type { PersistedGameState, PersistedSudokuCell } from '../models/game-state';
import type { PremiumState, UserSettings } from '../models/user-state';

const STORAGE_KEYS = {
  settings: 'sudoku_settings',
  game: 'sudoku_game',
  premium: 'sudoku_premium',
  stats: 'sudoku_stats'
} as const;

const STORAGE_SCHEMA_VERSION = 1;

interface Versioned<T> {
  version: number;
  data: T;
}

function isBrowserEnvironment(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function safeParse<T>(value: string | null): Versioned<T> | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      'data' in parsed &&
      typeof ((parsed as { version?: unknown }).version) === 'number'
    ) {
      return parsed as Versioned<T>;
    }
  } catch {
    // ignore corrupt JSON
  }

  return null;
}

export class StorageService {
  isBrowser(): boolean {
    return isBrowserEnvironment();
  }

  saveSettings(settings: UserSettings): void {
    this.write(STORAGE_KEYS.settings, settings);
  }

  loadSettings(): UserSettings {
    const result = this.read<UserSettings>(STORAGE_KEYS.settings);
    return result?.data ?? this.defaultSettings();
  }

  savePremiumState(premium: PremiumState): void {
    this.write(STORAGE_KEYS.premium, premium);
  }

  loadPremiumState(): PremiumState {
    const result = this.read<PremiumState>(STORAGE_KEYS.premium);
    return result?.data ?? this.defaultPremiumState();
  }

  saveGame(gameState: PersistedGameState): void {
    const payload = {
      ...gameState,
      board: gameState.board.map((cell) => ({
        ...cell,
        notes: Array.isArray(cell.notes) ? cell.notes : Array.from(cell.notes)
      }))
    };

    this.write(STORAGE_KEYS.game, payload);
  }

  loadGame(): PersistedGameState | null {
    const result = this.read<PersistedGameState>(STORAGE_KEYS.game);
    if (!result) {
      return null;
    }

    const storedGame = result.data;

    return {
      ...storedGame,
      board: storedGame.board.map((cell) => ({
        ...cell,
        notes: Array.isArray(cell.notes) ? cell.notes : []
      })) as PersistedSudokuCell[]
    };
  }

  removeGame(): void {
    this.remove(STORAGE_KEYS.game);
  }

  clearAll(): void {
    this.remove(STORAGE_KEYS.settings);
    this.remove(STORAGE_KEYS.game);
    this.remove(STORAGE_KEYS.premium);
    this.remove(STORAGE_KEYS.stats);
  }

  private read<T>(key: string): Versioned<T> | null {
    const storage = this.getStorage();
    if (!storage) {
      return null;
    }

    const raw = storage.getItem(key);
    const parsed = safeParse<T>(raw);
    if (!parsed || parsed.version !== STORAGE_SCHEMA_VERSION) {
      return null;
    }

    return parsed;
  }

  private write<T>(key: string, data: T): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.setItem(key, JSON.stringify({ version: STORAGE_SCHEMA_VERSION, data }));
    } catch {
      // ignore storage failures silently
    }
  }

  private remove(key: string): void {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    try {
      storage.removeItem(key);
    } catch {
      // ignore removal failures
    }
  }

  private getStorage(): Storage | null {
    if (!this.isBrowser()) {
      return null;
    }

    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  private defaultSettings(): UserSettings {
    return {
      theme: 'classic',
      soundEffects: true,
      autoSave: true,
      analyticsOptIn: false
    };
  }

  private defaultPremiumState(): PremiumState {
    return {
      isPremium: false,
      provider: 'local',
      active: false,
      expiresAt: null,
      entitlements: {
        unlimitedHints: false,
        adFree: false,
        premiumThemes: false,
        premiumThemeAccess: false
      }
    };
  }
}

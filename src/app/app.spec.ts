import '@angular/compiler';
import { ɵresolveComponentResources as resolveComponentResources } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';
import { AnalyticsService } from './services/analytics.service';
import { StorageService } from './services/storage.service';
import { SudokuService } from './services/sudoku.service';

describe('App characterization', () => {
  let app: App;
  let analyticsMock: {
    trackAppLaunch: ReturnType<typeof vi.fn>;
    trackEvent: ReturnType<typeof vi.fn>;
    trackPuzzleStart: ReturnType<typeof vi.fn>;
    trackPuzzleComplete: ReturnType<typeof vi.fn>;
    trackHintUsage: ReturnType<typeof vi.fn>;
    trackAdDisplay: ReturnType<typeof vi.fn>;
    trackSessionEnd: ReturnType<typeof vi.fn>;
  };

  beforeAll(async () => {
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

    await resolveComponentResources((url) => readFile(new URL(url, import.meta.url), 'utf8'));
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    analyticsMock = {
      trackAppLaunch: vi.fn(),
      trackEvent: vi.fn(),
      trackPuzzleStart: vi.fn(),
      trackPuzzleComplete: vi.fn(),
      trackHintUsage: vi.fn(),
      trackAdDisplay: vi.fn(),
      trackSessionEnd: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        SudokuService,
        StorageService,
        {
          provide: AnalyticsService,
          useValue: analyticsMock
        }
      ],
    }).compileComponents();

    TestBed.runInInjectionContext(() => {
      app = new App();
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  it('starts and renders an 81-cell puzzle', () => {
    expect(app.sudokuService.board()).toHaveLength(81);
  });

  it('composes the extracted game UI components', () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-stats-panel')).not.toBeNull();
    expect(element.querySelector('app-toolbar')).not.toBeNull();
    expect(element.querySelector('app-number-pad')).not.toBeNull();
    expect(element.querySelector('app-sudoku-board')).not.toBeNull();
    expect(element.querySelectorAll('.sudoku-cell')).toHaveLength(81);
  });

  it('handles number, erase and note-mode keyboard controls', () => {
    const service = app.sudokuService;
    const editableIndex = service.board().findIndex((cell) => !cell.initial);
    const solution = service.board()[editableIndex].solution;
    service.selectedCellIndex.set(editableIndex);

    app.handleKeyboard(new KeyboardEvent('keydown', {key: String(solution)}));
    expect(service.board()[editableIndex].value).toBe(solution);

    app.handleKeyboard(new KeyboardEvent('keydown', {key: 'Backspace'}));
    expect(service.board()[editableIndex].value).toBeNull();

    app.handleKeyboard(new KeyboardEvent('keydown', {key: 'n'}));
    expect(service.isNoteMode()).toBe(true);
  });

  it('formats elapsed time for display', () => {
    expect(app.formatTime(125)).toBe('2:05');
  });

  describe('legacy behavior to preserve during structural refactors', () => {
    it('wraps right-arrow selection from the last column into the next row', () => {
      app.sudokuService.selectedCellIndex.set(8);

      app.moveSelection('ArrowRight');

      expect(app.sudokuService.selectedCellIndex()).toBe(9);
    });
  });
});

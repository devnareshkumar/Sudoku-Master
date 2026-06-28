import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { JSDOM } from 'jsdom';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      const dom = new JSDOM('<!doctype html><html><body></body></html>');
      vi.stubGlobal('window', dom.window as unknown as Window);
      vi.stubGlobal('document', dom.window.document as unknown as Document);
      vi.stubGlobal('navigator', dom.window.navigator as unknown as Navigator);
      vi.stubGlobal('HTMLElement', dom.window.HTMLElement as unknown as typeof HTMLElement);
      vi.stubGlobal('Element', dom.window.Element as unknown as typeof Element);
      vi.stubGlobal('Node', dom.window.Node as unknown as typeof Node);
      vi.stubGlobal(
        'getComputedStyle',
        dom.window.getComputedStyle.bind(dom.window) as typeof globalThis.getComputedStyle
      );
      vi.stubGlobal(
        'requestAnimationFrame',
        dom.window.requestAnimationFrame
          ? dom.window.requestAnimationFrame.bind(dom.window)
          : ((cb: FrameRequestCallback) => setTimeout(cb, 0)) as unknown as typeof globalThis.requestAnimationFrame
      );
    }

    try {
      TestBed.initTestEnvironment(
        BrowserTestingModule,
        platformBrowserTesting()
      );
    } catch (error: unknown) {
      if (!(error instanceof Error && /already been called/.test(error.message))) {
        throw error;
      }
    }
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsService]
    });

    service = TestBed.inject(AnalyticsService);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should only fire trackAppLaunch once', () => {
    service.trackAppLaunch();
    service.trackAppLaunch();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics]',
      expect.objectContaining({ name: 'app_launch' })
    );
  });

  it('should log event for trackEvent', () => {
    service.trackEvent('hint_used', { reason: 'test' });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics]',
      expect.objectContaining({
        name: 'hint_used',
        properties: { reason: 'test' },
        timestamp: expect.any(Number)
      })
    );
  });

  it('should log payload for trackPuzzleComplete', () => {
    service.trackPuzzleComplete('hard', 150, 3, 1);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics]',
      expect.objectContaining({
        name: 'puzzle_completed',
        properties: {
          difficulty: 'hard',
          timeSeconds: 150,
          mistakes: 3,
          hintsUsed: 1
        }
      })
    );
  });

  it('should compute duration in trackSessionEnd', () => {
    vi.restoreAllMocks();
    const nowValues = [1000, 5000, 5000];
    vi.spyOn(Date, 'now').mockImplementation(() => nowValues.shift() ?? 0);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [AnalyticsService]
    });

    const sessionService = TestBed.inject(AnalyticsService);
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    sessionService.trackSessionEnd();

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics]',
      expect.objectContaining({
        name: 'session_ended',
        properties: { durationSeconds: 4 }
      })
    );
  });

  it('should log puzzle start and ad display events', () => {
    service.trackPuzzleStart('expert');
    service.trackAdDisplay('hint_gate');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics]',
      expect.objectContaining({
        name: 'puzzle_started',
        properties: { difficulty: 'expert' }
      })
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Analytics]',
      expect.objectContaining({
        name: 'ad_shown',
        properties: { placement: 'hint_gate' }
      })
    );
  });
});

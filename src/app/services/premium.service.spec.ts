import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { JSDOM } from 'jsdom';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PremiumService } from './premium.service';
import { StorageService } from './storage.service';
import type { PremiumState } from '../models/user-state';

describe('PremiumService', () => {
  let service: PremiumService;
  let storageMock: { savePremiumState: ReturnType<typeof vi.fn>; loadPremiumState: ReturnType<typeof vi.fn> };

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
    storageMock = {
      savePremiumState: vi.fn(),
      loadPremiumState: vi.fn(() => ({
        isPremium: false,
        provider: 'local'
      } as PremiumState))
    };

    TestBed.configureTestingModule({
      providers: [
        PremiumService,
        { provide: StorageService, useValue: storageMock }
      ]
    });

    service = TestBed.inject(PremiumService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  it('should default premium state to false', () => {
    expect(service.isPremium()).toBe(false);
    expect(service.entitlements()).toEqual({
      adFree: false,
      unlimitedHints: false,
      premiumThemes: false,
      premiumThemeAccess: false
    });
  });

  it('should load premium state from StorageService', () => {
    expect(storageMock.loadPremiumState).toHaveBeenCalled();
    expect(service.isPremium()).toBe(false);
  });

  it('should enable premium and persist state', () => {
    service.enablePremium('local');

    expect(service.isPremium()).toBe(true);
    expect(service.entitlements()).toEqual({
      adFree: true,
      unlimitedHints: true,
      premiumThemes: true,
      premiumThemeAccess: true
    });
    expect(storageMock.savePremiumState).toHaveBeenCalledWith(
      expect.objectContaining({
        isPremium: true,
        provider: 'local'
      })
    );
  });

  it('should disable premium and persist state', () => {
    service.enablePremium('local');
    service.disablePremium();

    expect(service.isPremium()).toBe(false);
    expect(service.entitlements()).toEqual({
      adFree: false,
      unlimitedHints: false,
      premiumThemes: false,
      premiumThemeAccess: false
    });
    expect(storageMock.savePremiumState).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isPremium: false,
        provider: 'local'
      })
    );
  });

  it('should verify a server-backed subscription contract', () => {
    const result = service.verifySubscription('stripe', 'token-123');

    expect(result.verified).toBe(true);
    expect(result.provider).toBe('stripe');
    expect(service.isPremium()).toBe(true);
    expect(storageMock.savePremiumState).toHaveBeenCalled();
  });
});

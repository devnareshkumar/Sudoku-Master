import {TestBed} from '@angular/core/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {App} from './app';

describe('App characterization', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('starts and renders an 81-cell puzzle', () => {
    const fixture = TestBed.createComponent(App);

    fixture.detectChanges();

    expect(fixture.componentInstance.sudokuService.board()).toHaveLength(81);
    expect(fixture.nativeElement.querySelectorAll('.sudoku-cell')).toHaveLength(81);
  });

  it('handles number, erase and note-mode keyboard controls', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
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
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance.formatTime(125)).toBe('2:05');
  });

  describe('legacy behavior to preserve during structural refactors', () => {
    it('wraps right-arrow selection from the last column into the next row', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      app.sudokuService.selectedCellIndex.set(8);

      app.moveSelection('ArrowRight');

      expect(app.sudokuService.selectedCellIndex()).toBe(9);
    });
  });
});

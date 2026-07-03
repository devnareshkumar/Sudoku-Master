import '@angular/compiler';
import { describe, expect, it, vi } from 'vitest';
import { HintModalComponent } from './hint-modal.component';
import { NumberPadComponent } from './number-pad.component';
import { StatsPanelComponent } from './stats-panel.component';
import { SudokuBoardComponent } from './sudoku-board.component';
import { ToolbarComponent } from './toolbar.component';

describe('extracted presentational components', () => {
  it('formats stats time without service access', () => {
    const component = new StatsPanelComponent();

    expect(component.formatTime(125)).toBe('2:05');
  });

  it('emits toolbar user intents', () => {
    const component = new ToolbarComponent();
    const undo = vi.fn();
    const difficultyChange = vi.fn();

    component.undo.subscribe(undo);
    component.difficultyChange.subscribe(difficultyChange);
    component.undo.emit();
    component.difficultyChange.emit('hard');

    expect(undo).toHaveBeenCalledOnce();
    expect(difficultyChange).toHaveBeenCalledWith('hard');
  });

  it('emits number pad selection and reset intents', () => {
    const component = new NumberPadComponent();
    const numberSelect = vi.fn();
    const resetBoard = vi.fn();

    component.numberSelect.subscribe(numberSelect);
    component.resetBoard.subscribe(resetBoard);
    component.numberSelect.emit(7);
    component.resetBoard.emit();

    expect(numberSelect).toHaveBeenCalledWith(7);
    expect(resetBoard).toHaveBeenCalledOnce();
  });

  it('emits board selection and resume intents', () => {
    const component = new SudokuBoardComponent();
    const cellSelect = vi.fn();
    const resume = vi.fn();

    component.cellSelect.subscribe(cellSelect);
    component.resume.subscribe(resume);
    component.cellSelect.emit(40);
    component.resume.emit();

    expect(cellSelect).toHaveBeenCalledWith(40);
    expect(resume).toHaveBeenCalledOnce();
  });

  it('emits hint modal navigation and confirmation intents', () => {
    const component = new HintModalComponent();
    const nextStep = vi.fn();
    const prevStep = vi.fn();
    const confirm = vi.fn();

    component.nextStep.subscribe(nextStep);
    component.prevStep.subscribe(prevStep);
    component.confirm.subscribe(confirm);
    component.nextStep.emit();
    component.prevStep.emit();
    component.confirm.emit();

    expect(nextStep).toHaveBeenCalledOnce();
    expect(prevStep).toHaveBeenCalledOnce();
    expect(confirm).toHaveBeenCalledOnce();
  });
});

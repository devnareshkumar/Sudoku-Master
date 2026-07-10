import { describe, expect, it } from 'vitest';
import type { SudokuCell } from '../models/game-state';
import { getBoxIndices, getCandidateNumbers, getCellConflicts, getCellLocation, getRelatedIndices, isBoardSolved, isBoxComplete } from './sudoku-grid.utils';

describe('sudoku-grid utilities', () => {
  it('calculates row, column, box and related indices for a cell', () => {
    const location = getCellLocation(20);

    expect(location).toEqual({
      row: 2,
      col: 2,
      box: 0,
      boxRow: 0,
      boxCol: 0,
    });

    expect(getRelatedIndices(20)).toEqual(expect.arrayContaining([0, 2, 20, 18, 19, 21, 22, 24, 26, 29, 38]));
  });

  it('returns the indices for a given box', () => {
    expect(getBoxIndices(4)).toEqual([30, 31, 32, 39, 40, 41, 48, 49, 50]);
  });

  it('detects candidate numbers by scanning row, column and box conflicts', () => {
    const board: SudokuCell[] = Array.from({ length: 81 }, () => ({
      value: null,
      solution: 0,
      initial: false,
      notes: new Set<number>(),
      error: false,
    }));

    board[0].value = 1;
    board[1].value = 2;
    board[2].value = 3;
    board[3].value = 4;
    board[4].value = 5;
    board[5].value = 6;
    board[6].value = 7;
    board[7].value = 8;
    board[9].value = 9;
    board[18].value = 9;
    board[20].value = 9;

    expect(getCandidateNumbers(board, 8, 9)).toEqual([9]);
    expect(getCellConflicts(board, 8)).toEqual(expect.arrayContaining([
      expect.objectContaining({ num: 1, type: 'row' }),
      expect.objectContaining({ num: 7, type: 'box' }),
    ]));
  });

  it('checks box and board completion deterministically', () => {
    const board: SudokuCell[] = Array.from({ length: 81 }, (_, index) => ({
      value: null,
      solution: index % 9 === 0 ? 1 : index % 9,
      initial: false,
      notes: new Set<number>(),
      error: false,
    }));

    expect(isBoxComplete(board, 0)).toBe(false);

    const completedBox = Array.from({ length: 81 }, (_, index) => ({
      value: index === 0 || index === 1 || index === 2 || index === 9 || index === 10 || index === 11 || index === 18 || index === 19 || index === 20
        ? index % 9 === 0 ? 1 : index % 9
        : null,
      solution: index === 0 || index === 1 || index === 2 || index === 9 || index === 10 || index === 11 || index === 18 || index === 19 || index === 20
        ? index % 9 === 0 ? 1 : index % 9
        : 0,
      initial: false,
      notes: new Set<number>(),
      error: false,
    }));

    expect(isBoxComplete(completedBox as SudokuCell[], 0)).toBe(true);
    expect(isBoardSolved(completedBox as SudokuCell[])).toBe(false);
  });

  it('treats a fully solved board as solved and preserves related indices for a cell', () => {
    const solvedBoard: SudokuCell[] = Array.from({ length: 81 }, (_, index) => ({
      value: ((index % 9) + 1) % 9 || 9,
      solution: ((index % 9) + 1) % 9 || 9,
      initial: true,
      notes: new Set<number>(),
      error: false,
    }));

    expect(isBoardSolved(solvedBoard)).toBe(true);
    expect(getRelatedIndices(20)).toEqual(expect.arrayContaining([0, 2, 20, 18, 19, 21, 22, 24, 26, 29, 38]));
  });
});

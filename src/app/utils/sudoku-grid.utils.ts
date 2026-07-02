import type { SudokuCell } from '../models/game-state';

export interface CellLocation {
  row: number;
  col: number;
  box: number;
  boxRow: number;
  boxCol: number;
}

export function getCellLocation(index: number): CellLocation {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);

  return { row, col, box, boxRow, boxCol };
}

export function getRelatedIndices(index: number): number[] {
  const { row, col, boxRow, boxCol } = getCellLocation(index);
  const indices = new Set<number>();

  for (let i = 0; i < 9; i++) {
    indices.add(row * 9 + i);
    indices.add(i * 9 + col);
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      indices.add((boxRow + r) * 9 + (boxCol + c));
    }
  }

  return Array.from(indices);
}

export function getBoxIndices(boxIndex: number): number[] {
  const boxRow = Math.floor(boxIndex / 3) * 3;
  const boxCol = (boxIndex % 3) * 3;
  const indices: number[] = [];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      indices.push((boxRow + r) * 9 + (boxCol + c));
    }
  }

  return indices;
}

export interface CellConflict {
  num: number;
  type: 'row' | 'col' | 'box';
  index: number;
}

export function getCellConflicts(board: SudokuCell[], index: number): CellConflict[] {
  const { row, col, boxRow, boxCol } = getCellLocation(index);
  const conflicts: CellConflict[] = [];
  const solution = board[index].solution;

  for (let n = 1; n <= 9; n++) {
    if (n === solution) {
      continue;
    }

    for (let i = 0; i < 9; i++) {
      const rowIndex = row * 9 + i;
      if (board[rowIndex].value === n) {
        conflicts.push({ num: n, type: 'row', index: rowIndex });
        break;
      }
    }

    for (let i = 0; i < 9; i++) {
      const colIndex = i * 9 + col;
      if (board[colIndex].value === n) {
        const existing = conflicts.some((conflict) => conflict.num === n && conflict.type === 'col');
        if (!existing) {
          conflicts.push({ num: n, type: 'col', index: colIndex });
        }
        break;
      }
    }

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const boxIndex = (boxRow + r) * 9 + (boxCol + c);
        if (board[boxIndex].value === n) {
          const existing = conflicts.some((conflict) => conflict.num === n && conflict.type === 'box');
          if (!existing) {
            conflicts.push({ num: n, type: 'box', index: boxIndex });
          }
          break;
        }
      }
    }
  }

  return conflicts;
}

export function getCandidateNumbers(board: SudokuCell[], index: number, solution: number): number[] {
  const conflicts = getCellConflicts(board, index);
  const conflictValues = new Set(conflicts.map((conflict) => conflict.num));

  return Array.from({ length: 9 }, (_, value) => value + 1).filter((value) => !conflictValues.has(value) && (value === solution || board[index].value === null));
}

export function isBoxComplete(board: SudokuCell[], boxIndex: number): boolean {
  return getBoxIndices(boxIndex).every((index) => {
    const cell = board[index];
    return cell.value !== null && cell.value === cell.solution;
  });
}

export function isBoardSolved(board: SudokuCell[]): boolean {
  return board.every((cell) => cell.value === cell.solution);
}

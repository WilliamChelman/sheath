import { Injectable } from '@angular/core';
import {
  BoardCell,
  BoardData,
  CellPosition,
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT,
} from '../models/board.model';

@Injectable({ providedIn: 'root' })
export class BoardService {
  /**
   * Creates a new empty board with default configuration.
   */
  createEmptyBoard(cols = DEFAULT_BOARD_COLS, rows = DEFAULT_BOARD_ROWS): BoardData {
    return {
      cols,
      rows,
      cells: [],
      defaultColWidth: DEFAULT_COL_WIDTH,
      defaultRowHeight: DEFAULT_ROW_HEIGHT,
    };
  }

  /**
   * Generates a unique cell ID.
   */
  generateCellId(): string {
    return `cell-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Creates a new cell at the specified position.
   */
  createCell(row: number, col: number, content?: string, entityRef?: string): BoardCell {
    return {
      id: this.generateCellId(),
      row,
      col,
      rowSpan: 1,
      colSpan: 1,
      content,
      entityRef,
    };
  }

  /**
   * Gets the cell at a specific position, accounting for spans.
   */
  getCellAt(board: BoardData, row: number, col: number): BoardCell | undefined {
    return board.cells.find(
      (c) => row >= c.row && row < c.row + c.rowSpan && col >= c.col && col < c.col + c.colSpan
    );
  }

  /**
   * Checks if a cell span would overlap with existing cells.
   */
  wouldOverlap(board: BoardData, cell: BoardCell, newRowSpan: number, newColSpan: number): boolean {
    for (let r = cell.row; r < cell.row + newRowSpan; r++) {
      for (let c = cell.col; c < cell.col + newColSpan; c++) {
        // Skip the cell's own current positions
        if (r < cell.row + cell.rowSpan && c < cell.col + cell.colSpan) continue;

        // Check if any other cell occupies this position
        const occupying = board.cells.find(
          (other) =>
            other.id !== cell.id &&
            r >= other.row &&
            r < other.row + other.rowSpan &&
            c >= other.col &&
            c < other.col + other.colSpan
        );

        if (occupying) return true;
      }
    }
    return false;
  }

  /**
   * Validates that span doesn't exceed grid bounds.
   */
  isSpanValid(board: BoardData, cell: BoardCell, rowSpan: number, colSpan: number): boolean {
    return (
      cell.row + rowSpan <= board.rows &&
      cell.col + colSpan <= board.cols &&
      rowSpan >= 1 &&
      colSpan >= 1
    );
  }

  /**
   * Updates a cell's span if valid and no overlap.
   */
  updateCellSpan(
    board: BoardData,
    cellId: string,
    rowSpan: number,
    colSpan: number
  ): BoardData {
    const cell = board.cells.find((c) => c.id === cellId);
    if (!cell) return board;

    if (!this.isSpanValid(board, cell, rowSpan, colSpan)) return board;
    if (this.wouldOverlap(board, cell, rowSpan, colSpan)) return board;

    const cells = board.cells.map((c) =>
      c.id === cellId ? { ...c, rowSpan, colSpan } : c
    );
    return { ...board, cells };
  }

  /**
   * Adds a row to the board.
   */
  addRow(board: BoardData): BoardData {
    return { ...board, rows: board.rows + 1 };
  }

  /**
   * Adds a column to the board.
   */
  addColumn(board: BoardData): BoardData {
    return { ...board, cols: board.cols + 1 };
  }

  /**
   * Removes the last row, shrinking or removing cells that extend into it.
   */
  removeRow(board: BoardData): BoardData {
    if (board.rows <= 1) return board;

    const lastRow = board.rows - 1;
    const updatedCells = board.cells
      .map((c) => {
        if (c.row >= lastRow) {
          // Cell starts in the last row, remove it
          return null;
        }
        if (c.row + c.rowSpan > lastRow) {
          // Cell spans into the last row, shrink it
          return { ...c, rowSpan: lastRow - c.row };
        }
        return c;
      })
      .filter((c): c is BoardCell => c !== null && c.rowSpan > 0);

    return { ...board, rows: board.rows - 1, cells: updatedCells };
  }

  /**
   * Removes the last column, shrinking or removing cells that extend into it.
   */
  removeColumn(board: BoardData): BoardData {
    if (board.cols <= 1) return board;

    const lastCol = board.cols - 1;
    const updatedCells = board.cells
      .map((c) => {
        if (c.col >= lastCol) {
          // Cell starts in the last column, remove it
          return null;
        }
        if (c.col + c.colSpan > lastCol) {
          // Cell spans into the last column, shrink it
          return { ...c, colSpan: lastCol - c.col };
        }
        return c;
      })
      .filter((c): c is BoardCell => c !== null && c.colSpan > 0);

    return { ...board, cols: board.cols - 1, cells: updatedCells };
  }

  /**
   * Adds a cell to the board at the specified position.
   */
  addCell(board: BoardData, cell: BoardCell): BoardData {
    // Check if position is already occupied
    if (this.getCellAt(board, cell.row, cell.col)) {
      return board;
    }
    return { ...board, cells: [...board.cells, cell] };
  }

  /**
   * Removes a cell from the board.
   */
  removeCell(board: BoardData, cellId: string): BoardData {
    return { ...board, cells: board.cells.filter((c) => c.id !== cellId) };
  }

  /**
   * Updates a cell's content.
   */
  updateCell(board: BoardData, cellId: string, updates: Partial<BoardCell>): BoardData {
    const cells = board.cells.map((c) =>
      c.id === cellId ? { ...c, ...updates, id: c.id } : c
    );
    return { ...board, cells };
  }

  /**
   * Swaps positions of two cells.
   */
  swapCells(board: BoardData, cellA: BoardCell, cellB: BoardCell): BoardData {
    const cells = board.cells.map((c) => {
      if (c.id === cellA.id) {
        return { ...c, row: cellB.row, col: cellB.col };
      }
      if (c.id === cellB.id) {
        return { ...c, row: cellA.row, col: cellA.col };
      }
      return c;
    });
    return { ...board, cells };
  }

  /**
   * Moves a cell to a new position.
   */
  moveCell(board: BoardData, cell: BoardCell, newPosition: CellPosition): BoardData {
    // Check if new position is valid and not occupied
    if (
      newPosition.row < 0 ||
      newPosition.row >= board.rows ||
      newPosition.col < 0 ||
      newPosition.col >= board.cols
    ) {
      return board;
    }

    const occupying = this.getCellAt(board, newPosition.row, newPosition.col);
    if (occupying && occupying.id !== cell.id) {
      return board;
    }

    const cells = board.cells.map((c) =>
      c.id === cell.id ? { ...c, row: newPosition.row, col: newPosition.col } : c
    );
    return { ...board, cells };
  }

  /**
   * Parses BoardData from Entity content (JSON string).
   */
  parseFromEntity(content: string | undefined): BoardData {
    if (!content) return this.createEmptyBoard();

    try {
      return JSON.parse(content) as BoardData;
    } catch {
      return this.createEmptyBoard();
    }
  }

  /**
   * Serializes BoardData to JSON string for Entity content.
   */
  serializeToEntity(board: BoardData): string {
    return JSON.stringify(board);
  }

  /**
   * Gets all grid positions as an array.
   */
  getGridPositions(board: BoardData): CellPosition[] {
    const positions: CellPosition[] = [];
    for (let row = 0; row < board.rows; row++) {
      for (let col = 0; col < board.cols; col++) {
        positions.push({ row, col });
      }
    }
    return positions;
  }

  /**
   * Computes the CSS grid-template-columns value.
   */
  getGridTemplateCols(board: BoardData): string {
    return Array.from(
      { length: board.cols },
      (_, i) => board.colWidths?.[i] ?? board.defaultColWidth ?? DEFAULT_COL_WIDTH
    ).join(' ');
  }

  /**
   * Computes the CSS grid-template-rows value.
   */
  getGridTemplateRows(board: BoardData): string {
    return Array.from(
      { length: board.rows },
      (_, i) => board.rowHeights?.[i] ?? board.defaultRowHeight ?? DEFAULT_ROW_HEIGHT
    ).join(' ');
  }

  /**
   * Gets the CSS grid-column value for a cell.
   */
  getCellGridColumn(cell: BoardCell): string {
    return `${cell.col + 1} / span ${cell.colSpan}`;
  }

  /**
   * Gets the CSS grid-row value for a cell.
   */
  getCellGridRow(cell: BoardCell): string {
    return `${cell.row + 1} / span ${cell.rowSpan}`;
  }

  /**
   * Sorts cells by position (row first, then column).
   */
  sortCells(cells: BoardCell[]): BoardCell[] {
    return [...cells].sort((a, b) =>
      a.row === b.row ? a.col - b.col : a.row - b.row
    );
  }
}

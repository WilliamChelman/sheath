/**
 * Optional styling hints for a board cell.
 */
export interface BoardCellStyle {
  /** Background color class or hex */
  background?: string;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right';
  /** Vertical alignment */
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

/**
 * Represents a single cell in the board grid.
 * Cells can contain markdown content, entity references, or both.
 */
export interface BoardCell {
  /** Unique identifier for the cell */
  id: string;

  /** Grid position - row index (0-based) */
  row: number;

  /** Grid position - column index (0-based) */
  col: number;

  /** Number of rows this cell spans (default: 1) */
  rowSpan: number;

  /** Number of columns this cell spans (default: 1) */
  colSpan: number;

  /** Custom markdown/text content */
  content?: string;

  /** Entity ID reference */
  entityRef?: string;

  /** Optional styling hints */
  style?: BoardCellStyle;
}

/**
 * The main Board data structure.
 * Stored as the `content` field of an Entity with type 'sheath.core.board'.
 */
export interface BoardData {
  /** Number of columns in the grid */
  cols: number;

  /** Number of rows in the grid */
  rows: number;

  /** Default column width (CSS value, e.g., '1fr', '200px') */
  defaultColWidth?: string;

  /** Default row height (CSS value, e.g., 'auto', '100px') */
  defaultRowHeight?: string;

  /** Custom column widths by index */
  colWidths?: Record<number, string>;

  /** Custom row heights by index */
  rowHeights?: Record<number, string>;

  /** All cells in the board */
  cells: BoardCell[];
}

/** Utility type for cell position */
export interface CellPosition {
  row: number;
  col: number;
}

/** Default board configuration */
export const DEFAULT_BOARD_COLS = 3;
export const DEFAULT_BOARD_ROWS = 3;
export const DEFAULT_COL_WIDTH = '1fr';
export const DEFAULT_ROW_HEIGHT = 'auto';

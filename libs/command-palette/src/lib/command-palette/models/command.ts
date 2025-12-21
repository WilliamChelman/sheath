/**
 * Represents a single executable command in the command palette.
 */
export interface Command {
  /** Unique identifier for the command */
  id: string;
  /** Display name shown in the palette */
  label: string;
  /** Optional description shown below the label */
  description?: string;
  /** Optional icon name (phosphor icon) */
  icon?: string;
  /** Category for grouping commands */
  category?: string;
  /** Callback executed when the command is selected */
  callback: (event: MouseEvent | KeyboardEvent) => void;
}
